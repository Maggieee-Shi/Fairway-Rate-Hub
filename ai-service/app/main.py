"""
Fairway Rate Hub AI service (FastAPI).

- POST /v1/ask   internal endpoint called by the Django backend; runs the
                 embedding-based semantic cache and falls back to the LLM.
- /graphql       public, read-only GraphQL API for courses, reviews, hot questions.
- GET /health    liveness check.
"""

import hmac
import json
import logging
import time

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from strawberry.fastapi import GraphQLRouter

from . import db, llm
from .config import settings
from .graphql_schema import schema
from .semantic_cache import find_best_match, is_rejection

log = logging.getLogger("ai-service")
logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Fairway Rate Hub AI Service", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.cors_origins),
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)
app.include_router(GraphQLRouter(schema), prefix="/graphql")


class AskRequest(BaseModel):
    user_id: int = Field(..., ge=1)
    question: str = Field(..., min_length=1, max_length=2000)


class AskResponse(BaseModel):
    answer: str
    cached: bool
    similarity: float | None = None
    latency_ms: int


def require_internal_token(x_internal_token: str = Header(default="")) -> None:
    if not settings.internal_token or not hmac.compare_digest(
        x_internal_token, settings.internal_token
    ):
        raise HTTPException(status_code=401, detail="invalid internal token")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/v1/ask", response_model=AskResponse, dependencies=[Depends(require_internal_token)])
def ask(req: AskRequest) -> AskResponse:
    start = time.perf_counter()
    question = req.question.strip()
    if not question:
        raise HTTPException(status_code=422, detail="question is required")

    try:
        vec = llm.embed(question)
    except Exception as e:  # upstream failure
        log.exception("embedding failed")
        raise HTTPException(status_code=502, detail=f"Embedding service error: {e}")

    with db.get_cursor() as cur:
        cur.execute(
            "SELECT id, question_embedding, answer FROM QuestionLog "
            "WHERE answer IS NOT NULL AND answer NOT LIKE 'Please ask a golf related question%'"
        )
        hit = find_best_match(vec, cur.fetchall(), settings.similarity_threshold)

    if hit:
        with db.get_cursor() as cur:
            cur.execute("UPDATE QuestionLog SET ask_count = ask_count + 1 WHERE id = %s", [hit.log_id])
            cur.execute(
                "INSERT INTO QuestionLog (user_id, question_text, question_embedding, answer, ask_count) "
                "VALUES (%s, %s, %s, %s, 1)",
                [req.user_id, question, json.dumps(vec), hit.answer],
            )
        return AskResponse(
            answer=hit.answer,
            cached=True,
            similarity=round(hit.similarity, 4),
            latency_ms=int((time.perf_counter() - start) * 1000),
        )

    try:
        answer = llm.answer_golf_question(question)
    except Exception as e:
        log.exception("LLM call failed")
        raise HTTPException(status_code=502, detail=f"AI service error: {e}")

    # Never cache rejections; they would poison later similarity matches.
    if not is_rejection(answer):
        with db.get_cursor() as cur:
            cur.execute(
                "INSERT INTO QuestionLog (user_id, question_text, question_embedding, answer, ask_count) "
                "VALUES (%s, %s, %s, %s, 1)",
                [req.user_id, question, json.dumps(vec), answer],
            )

    return AskResponse(
        answer=answer,
        cached=False,
        latency_ms=int((time.perf_counter() - start) * 1000),
    )
