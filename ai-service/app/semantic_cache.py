"""Embedding-based semantic cache over the QuestionLog table."""

import json
import math
from dataclasses import dataclass
from typing import Iterable, Optional, Sequence

REJECTION_PREFIX = "Please ask a golf related question"


def cosine_similarity(v1: Sequence[float], v2: Sequence[float]) -> float:
    dot = sum(a * b for a, b in zip(v1, v2))
    mag1 = math.sqrt(sum(a * a for a in v1))
    mag2 = math.sqrt(sum(b * b for b in v2))
    if mag1 == 0 or mag2 == 0:
        return 0.0
    return dot / (mag1 * mag2)


@dataclass
class CacheHit:
    log_id: int
    answer: str
    similarity: float


def find_best_match(
    query_vec: Sequence[float],
    rows: Iterable[tuple],
    threshold: float,
) -> Optional[CacheHit]:
    """rows: (id, embedding_json_or_list, answer). Returns the best hit at/above threshold."""
    best: Optional[CacheHit] = None
    for log_id, embedding, answer in rows:
        if not embedding or not answer or answer.startswith(REJECTION_PREFIX):
            continue
        try:
            vec = json.loads(embedding) if isinstance(embedding, (str, bytes)) else embedding
        except (ValueError, TypeError):
            continue
        sim = cosine_similarity(query_vec, vec)
        if best is None or sim > best.similarity:
            best = CacheHit(log_id=log_id, answer=answer, similarity=sim)
    if best and best.similarity >= threshold:
        return best
    return None


def is_rejection(answer: str) -> bool:
    return answer.strip().startswith(REJECTION_PREFIX)
