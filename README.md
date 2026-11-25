# Amplitude Academy Onboarding

A private, grounded learning workspace for new employees. It seeds the supplied 97 unique Academy videos, ingests their public metadata/captions, creates cached Gemini learning artifacts, and provides retrieval-only chat endpoints.

## Run locally

1. Copy `.env.example` to `.env` and add the three API keys. `GEMINI_MODEL` defaults to `models/gemini-4-hydrogen`; it is checked against the Gemini Models endpoint before every model call.
2. `pnpm install && pnpm prisma generate && pnpm prisma db push`
3. `pnpm seed` creates 97 pending video rows.
4. `pnpm dev`, then open `http://localhost:3000`.

Use `POST /api/ingestion` with `{ "videoId": "lqjYCMnEduQ" }` to ingest one video. In production, run this in a background worker/queue and protect the endpoint with the Admin role. `force: true` re-indexes it. The UI is a responsive product shell for dashboard, library, chat, tasks, learning path and admin views.

## Architecture and safeguards

- Server-side Gemini calls only. External `google_search` and `url_context` are deliberately omitted and should only be added when an Admin enables them.
- `POST /api/chat` retrieves only `READY` training records; it says the subject is not covered if no source matches.
- Video artifacts are persisted in `Video.summary`; transcript chunks are persisted once in `Chunk`. Nothing is generated on page view.
- API routes include lightweight IP rate limits and error logging. Add durable Redis limiting, auth/SSO (NextAuth or provider), audit logs, queue workers and pgvector embeddings before a production deployment.
- Public captions are fetched through YouTube timed text. Restricted/private captions need authorized YouTube OAuth access.

## Tests & Docker

`pnpm test` runs parser/chunking tests. `docker compose up --build` starts the application. For production, replace SQLite with PostgreSQL + pgvector in `prisma/schema.prisma`, and replace JSON embeddings with a vector column/query.
