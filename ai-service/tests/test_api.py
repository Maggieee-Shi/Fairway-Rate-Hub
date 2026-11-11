"""Unit tests: OpenAI and MySQL are faked, so these run with no network or DB."""

import json
import os
from contextlib import contextmanager

os.environ["AI_SERVICE_TOKEN"] = "test-token"

from fastapi.testclient import TestClient  # noqa: E402

from app import main  # noqa: E402
from app.semantic_cache import cosine_similarity, find_best_match  # noqa: E402

client = TestClient(main.app)
AUTH = {"X-Internal-Token": "test-token"}


class FakeCursor:
    def __init__(self, store):
        self.store = store
        self._result = []

    def execute(self, sql, params=None):
        self.store["sql"].append((sql, params))
        if sql.strip().startswith("SELECT id, question_embedding"):
            self._result = self.store["log"]
        elif "FROM GolfCourse" in sql:
            self._result = self.store["courses"]
        else:
            self._result = []

    def fetchall(self):
        return self._result

    def fetchone(self):
        return self._result[0] if self._result else None


def install_fakes(monkeypatch, log_rows=(), courses=(), answer="Try Pebble Beach."):
    store = {"sql": [], "log": list(log_rows), "courses": list(courses), "llm_calls": 0}

    @contextmanager
    def fake_cursor():
        yield FakeCursor(store)

    def fake_answer(q):
        store["llm_calls"] += 1
        return answer

    monkeypatch.setattr(main.db, "get_cursor", fake_cursor)
    monkeypatch.setattr(main.llm, "embed", lambda q: [1.0, 0.0])
    monkeypatch.setattr(main.llm, "answer_golf_question", fake_answer)
    return store


def test_cosine_similarity():
    assert cosine_similarity([1, 0], [1, 0]) == 1.0
    assert cosine_similarity([1, 0], [0, 1]) == 0.0
    assert cosine_similarity([0, 0], [1, 1]) == 0.0


def test_find_best_match_skips_rejections_and_respects_threshold():
    rows = [
        (1, json.dumps([1.0, 0.0]), "Please ask a golf related question."),
        (2, json.dumps([0.9, 0.1]), "good answer"),
        (3, json.dumps([0.0, 1.0]), "unrelated"),
    ]
    hit = find_best_match([1.0, 0.0], rows, 0.85)
    assert hit and hit.log_id == 2
    assert find_best_match([1.0, 0.0], rows[2:], 0.85) is None


def test_health():
    assert client.get("/health").json() == {"status": "ok"}


def test_ask_requires_internal_token(monkeypatch):
    install_fakes(monkeypatch)
    r = client.post("/v1/ask", json={"user_id": 1, "question": "best course?"})
    assert r.status_code == 401


def test_ask_validates_input(monkeypatch):
    install_fakes(monkeypatch)
    r = client.post("/v1/ask", json={"user_id": 0, "question": ""}, headers=AUTH)
    assert r.status_code == 422


def test_ask_cache_hit_skips_llm(monkeypatch):
    store = install_fakes(monkeypatch, log_rows=[(7, json.dumps([1.0, 0.0]), "cached answer")])
    r = client.post("/v1/ask", json={"user_id": 1, "question": "best course?"}, headers=AUTH)
    body = r.json()
    assert r.status_code == 200
    assert body["cached"] is True and body["answer"] == "cached answer"
    assert store["llm_calls"] == 0


def test_ask_cache_miss_calls_llm_and_logs(monkeypatch):
    store = install_fakes(monkeypatch)
    r = client.post("/v1/ask", json={"user_id": 1, "question": "best course?"}, headers=AUTH)
    assert r.json()["cached"] is False
    assert store["llm_calls"] == 1
    assert any(sql.startswith("INSERT INTO QuestionLog") for sql, _ in store["sql"])


def test_ask_does_not_cache_rejection(monkeypatch):
    store = install_fakes(monkeypatch, answer="Please ask a golf related question.")
    client.post("/v1/ask", json={"user_id": 1, "question": "stock tips?"}, headers=AUTH)
    assert not any(sql.startswith("INSERT") for sql, _ in store["sql"])


def test_graphql_courses(monkeypatch):
    install_fakes(monkeypatch, courses=[(1, "Lincoln Park", "SF", 4.5, "Firm", 3)])
    r = client.post("/graphql", json={"query": "{ courses { id name ratingAvg reviewCount } }"})
    assert r.status_code == 200
    assert r.json()["data"]["courses"] == [
        {"id": 1, "name": "Lincoln Park", "ratingAvg": 4.5, "reviewCount": 3}
    ]
