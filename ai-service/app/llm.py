"""OpenAI client wrappers for embeddings and chat completions."""

from functools import lru_cache
from typing import List

from openai import OpenAI

from .config import settings

GOLF_SYSTEM_PROMPT = (
    "You are Fairway Rate Hub's expert assistant for Bay Area golf courses. "
    "You have real-time knowledge of course conditions, ratings, tee availability, and local golf insights. "
    "IMPORTANT: Answer any question that has any connection to golf — including "
    "courses, driving ranges, practice facilities, lessons, instructors, equipment, "
    "rules, etiquette, tips, handicaps, conditions, ratings, tee times, memberships, "
    "tournaments, or anything else a golfer might ask. "
    "Only reject questions that are completely unrelated to golf with no possible golf context "
    "(e.g. cooking recipes, stock prices, coding help). "
    "When in doubt, answer as if it relates to golf. "
    "If you must reject, respond exactly with: "
    "'Please ask a golf related question.' and nothing else.\n\n"
    "FORMATTING RULES — you MUST follow these exactly when recommending courses:\n"
    "1. Each course gets its own block separated by a line containing only: ---\n"
    "2. Each block must follow this exact structure with real newlines:\n"
    "**Course Name**\n"
    "One sentence description.\n"
    "• Characteristic 1\n"
    "• Characteristic 2\n"
    "• Characteristic 3\n"
    "---\n"
    "3. Never put bullets on the same line. Each bullet must be on its own line starting with •.\n"
    "4. Do not include any URLs or map links.\n"
)


@lru_cache(maxsize=1)
def _client() -> OpenAI:
    return OpenAI(api_key=settings.openai_api_key)


def embed(text: str) -> List[float]:
    resp = _client().embeddings.create(model=settings.embedding_model, input=text)
    return resp.data[0].embedding


def answer_golf_question(question: str) -> str:
    resp = _client().chat.completions.create(
        model=settings.llm_model,
        messages=[
            {"role": "system", "content": GOLF_SYSTEM_PROMPT},
            {"role": "user", "content": question},
        ],
        max_tokens=800,
    )
    return resp.choices[0].message.content
