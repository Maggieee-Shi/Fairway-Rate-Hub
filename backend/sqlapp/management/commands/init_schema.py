"""
Creates the app tables and seed data from sql/dbDDL.sql and sql/dbDML.sql
if they don't exist yet. Safe to run on every deploy.
"""
import re
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import connection

SQL_DIR = Path(settings.BASE_DIR) / "sql"


def _statements(path):
    text = path.read_text()
    # The scripts target a schema named FairwayRateHub; use whatever DB we're connected to instead.
    text = re.sub(r"^\s*(CREATE SCHEMA|USE)\b.*?;\s*$", "", text, flags=re.I | re.M)
    text = "\n".join(l for l in text.splitlines() if not l.strip().startswith("--"))
    return [s.strip() for s in re.split(r";\s*$", text, flags=re.M) if s.strip()]


class Command(BaseCommand):
    help = "Create tables and seed data if the database is empty"

    def handle(self, *args, **options):
        if "GolfCourse" in connection.introspection.table_names():
            self.stdout.write("Schema already exists, skipping.")
            return
        with connection.cursor() as cursor:
            for name in ("dbDDL.sql", "dbDML.sql"):
                for stmt in _statements(SQL_DIR / name):
                    cursor.execute(stmt)
        self.stdout.write(self.style.SUCCESS("Schema and seed data created."))
