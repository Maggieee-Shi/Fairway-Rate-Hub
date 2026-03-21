"""
Management command: refresh the top-10 hot questions cache.

On first run (or when QuestionLog has fewer than 10 answers) it seeds
10 default Bay Area golf questions by calling GPT-4o, stores them in
QuestionLog, then populates CachedQuestion with the top 10 by ask_count.

Usage:
    python3 manage.py refresh_hot_cache

Scheduled automatically every 7 days via sqlapp/apps.py (APScheduler).
"""
import json

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import connection


DEFAULT_QUESTIONS = [
    "What are the best public golf courses in the Bay Area?",
    "Which Bay Area golf course has the best ocean views?",
    "What are beginner-friendly golf courses near San Francisco?",
    "How are the course conditions at TPC Harding Park?",
    "What is the difficulty of Half Moon Bay Ocean Course?",
    "Which Bay Area courses offer the best value for money?",
    "What is the best time of year to play golf in the Bay Area?",
    "Compare Cinnabar Hills Golf Club and Crystal Springs Golf Course.",
    "What Bay Area courses are best for low handicap golfers?",
    "What are typical green fees at Bay Area public golf courses?",
]


def _call_gpt4(messages):
    from openai import OpenAI
    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    resp = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        max_tokens=800,
    )
    return resp.choices[0].message.content


def _get_embedding(text):
    from openai import OpenAI
    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    resp = client.embeddings.create(model="text-embedding-3-small", input=text)
    return resp.data[0].embedding


GOLF_SYSTEM_PROMPT = (
    "You are Fairway Rate Hub's expert assistant for Bay Area golf courses. "
    "You have real-time knowledge of course conditions, ratings, tee availability, and local golf insights. "
    "Answer any question that has any connection to golf — courses, driving ranges, practice facilities, "
    "lessons, instructors, equipment, rules, etiquette, tips, handicaps, conditions, ratings, tee times, "
    "memberships, tournaments, or anything else a golfer might ask. "
    "Only reject questions completely unrelated to golf (e.g. cooking, stocks, coding). When in doubt, answer. "
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


class Command(BaseCommand):
    help = "Refresh CachedQuestion with top-10 most-asked questions; seeds defaults when QuestionLog is sparse."

    def handle(self, *args, **options):
        self._seed_defaults_if_needed()
        self._rebuild_cache()

    # ------------------------------------------------------------------

    def _seed_defaults_if_needed(self):
        """Ask GPT for each default question that isn't already in QuestionLog."""
        with connection.cursor() as cur:
            cur.execute("SELECT question_text FROM QuestionLog WHERE answer IS NOT NULL")
            existing_texts = {r[0].lower() for r in cur.fetchall()}

        to_seed = [q for q in DEFAULT_QUESTIONS if q.lower() not in existing_texts]

        if not to_seed:
            self.stdout.write("QuestionLog already has all default questions — skipping seed.")
            return

        self.stdout.write(f"Seeding {len(to_seed)} default question(s) via GPT-4o…")
        seeded = 0

        for question in to_seed:
            try:
                answer = _call_gpt4([
                    {"role": "system", "content": GOLF_SYSTEM_PROMPT},
                    {"role": "user", "content": question},
                ])
                embedding = _get_embedding(question)
                with connection.cursor() as cur:
                    cur.execute(
                        """
                        INSERT INTO QuestionLog
                            (user_id, question_text, question_embedding, answer, ask_count)
                        VALUES (NULL, %s, %s, %s, 1)
                        """,
                        [question, json.dumps(embedding), answer],
                    )
                seeded += 1
                self.stdout.write(f"  ✓ {question[:60]}")
            except Exception as exc:
                self.stdout.write(self.style.WARNING(f"  ✗ GPT error for '{question[:50]}': {exc}"))

        self.stdout.write(self.style.SUCCESS(f"Seeded {seeded} default question(s)."))

    def _rebuild_cache(self):
        """Populate CachedQuestion from top-10 QuestionLog entries by ask_count."""
        with connection.cursor() as cur:
            cur.execute(
                """
                SELECT question_text, answer, ask_count
                FROM QuestionLog
                WHERE answer IS NOT NULL
                ORDER BY ask_count DESC
                LIMIT 10
                """
            )
            rows = cur.fetchall()

            if not rows:
                self.stdout.write(self.style.WARNING("QuestionLog still empty — cache not updated."))
                return

            cur.execute("DELETE FROM CachedQuestion")

            for rank, (question_text, answer, ask_count) in enumerate(rows, 1):
                cur.execute(
                    """
                    INSERT INTO CachedQuestion
                        (question_text, answer, ask_count, rank_position, cached_at)
                    VALUES (%s, %s, %s, %s, NOW())
                    """,
                    [question_text, answer, ask_count, rank],
                )

        self.stdout.write(
            self.style.SUCCESS(f"Hot cache rebuilt: {len(rows)} question(s) at rank 1–{len(rows)}.")
        )
