"""Thin MySQL access layer (same Railway MySQL database the Django backend uses)."""

from contextlib import contextmanager

import pymysql

from .config import settings


def _connect():
    return pymysql.connect(
        host=settings.db_host,
        port=settings.db_port,
        user=settings.db_user,
        password=settings.db_password,
        database=settings.db_name,
        autocommit=True,
        charset="utf8mb4",
        connect_timeout=5,
    )


@contextmanager
def get_cursor():
    conn = _connect()
    try:
        with conn.cursor() as cur:
            yield cur
    finally:
        conn.close()
