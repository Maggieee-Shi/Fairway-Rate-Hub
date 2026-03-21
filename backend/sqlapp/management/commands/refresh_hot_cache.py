"""
Daily management command to refresh the top-10 hot questions cache.

Usage:
    python manage.py refresh_hot_cache

Schedule with cron (runs at 3am daily):
    0 3 * * * cd /path/to/backend && python manage.py refresh_hot_cache
"""
from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = "Refresh the CachedQuestion table with the top 10 most-asked questions."

    def handle(self, *args, **options):
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
                self.stdout.write(self.style.WARNING("No questions in QuestionLog yet — cache not updated."))
                return

            cur.execute("DELETE FROM CachedQuestion")

            for rank, (question_text, answer, ask_count) in enumerate(rows, 1):
                cur.execute(
                    """
                    INSERT INTO CachedQuestion (question_text, answer, ask_count, rank_position, cached_at)
                    VALUES (%s, %s, %s, %s, NOW())
                    """,
                    [question_text, answer, ask_count, rank],
                )

        self.stdout.write(
            self.style.SUCCESS(f"Hot cache refreshed: {len(rows)} question(s) cached.")
        )
