"""Settings for running the test suite against SQLite (no MySQL needed)."""

from .settings import *  # noqa: F401,F403

DATABASES = {"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": ":memory:"}}
SESSION_COOKIE_SECURE = False
