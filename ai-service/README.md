# AI Service (FastAPI + GraphQL)

A standalone Python service that owns the AI Q&A path and exposes a read-only GraphQL API.
It shares the Railway MySQL database with the Django backend.

```
React (Vercel) ──► Django /api/ask/ ──(X-Internal-Token)──► FastAPI /v1/ask
                                                              │  embed question (OpenAI)
                                                              │  cosine-similarity lookup in QuestionLog
                                                              └─ cache miss → LLM → log answer
Public clients ──► FastAPI /graphql  (courses, reviews, hot questions)
```

Django still handles sessions and auth, and forwards the user ID. If `AI_SERVICE_URL`
isn't set on the backend, or the service is unreachable, Django falls back to its in-process code.

## Endpoints
| Method | Path | Notes |
| --- | --- | --- |
| GET | `/health` | liveness |
| POST | `/v1/ask` | internal; needs `X-Internal-Token` header; body `{user_id, question}` |
| GET/POST | `/graphql` | GraphiQL in the browser; e.g. `{ courses(minRating: 4) { name ratingAvg reviews(limit: 3) { rating content } } }` |
| GET | `/docs` | OpenAPI (Swagger) docs |

## Environment
`OPENAI_API_KEY`, `LLM_MODEL` (default `gpt-4o`), `AI_SERVICE_TOKEN`, `DB_HOST`, `DB_PORT`, `DB_NAME`,
`DB_USER`, `DB_PASSWORD`, optional `SIMILARITY_THRESHOLD` (0.85) and `CORS_ORIGINS`.

## Run locally
```bash
cd ai-service
pip install -r requirements-dev.txt
pytest                       # OpenAI and MySQL are faked
uvicorn app.main:app --reload --port 8001
```
