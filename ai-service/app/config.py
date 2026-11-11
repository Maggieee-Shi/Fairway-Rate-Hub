"""Runtime configuration, read from environment variables."""

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")


@dataclass(frozen=True)
class Settings:
    openai_api_key: str = os.environ.get("OPENAI_API_KEY", "")
    llm_model: str = os.environ.get("LLM_MODEL", "gpt-4o")
    embedding_model: str = os.environ.get("EMBEDDING_MODEL", "text-embedding-3-small")
    similarity_threshold: float = float(os.environ.get("SIMILARITY_THRESHOLD", "0.85"))

    # Shared secret the Django backend sends in X-Internal-Token.
    internal_token: str = os.environ.get("AI_SERVICE_TOKEN", "")

    db_name: str = os.environ.get("DB_NAME", "FairwayRateHub")
    db_user: str = os.environ.get("DB_USER", "root")
    db_password: str = os.environ.get("DB_PASSWORD", "")
    db_host: str = os.environ.get("DB_HOST", "127.0.0.1")
    db_port: int = int(os.environ.get("DB_PORT", "3306"))

    cors_origins: tuple = tuple(
        o.strip()
        for o in os.environ.get(
            "CORS_ORIGINS",
            "http://localhost:3000,https://fairway-rate-hub.vercel.app",
        ).split(",")
        if o.strip()
    )


settings = Settings()
