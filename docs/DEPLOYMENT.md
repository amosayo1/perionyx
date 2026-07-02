# Deployment Guide

## Prerequisites

- Node.js 20+
- PostgreSQL 16
- Redis 7 (optional, for multi-instance rate limiting)

## Environment Variables

Required variables are validated at startup in `src/server/env/validate.ts`:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `AUTH_SECRET` | Yes | NextAuth secret (`openssl rand -base64 32`) |
| `ENCRYPTION_KEY` | Yes | Encryption key (`openssl rand -hex 32`) |

See `.env.example` for all optional variables (Sentry, Plaid, QuickBooks, SMTP, Slack, license keys).

## Database

1. Apply Prisma migrations to the target database:

```bash
npx prisma migrate deploy
```

2. Generate the Prisma client:

```bash
npx prisma generate
```

## PgBoss Queue Schema

The `perionyx_queue` schema is created automatically when the queue worker starts (see `src/instrumentation.ts`). No manual setup is required.

## Build & Start

The Next.js `next.config.ts` uses `output: "standalone"` for a self-contained production build.

```bash
# Build
next build

# Start
next start
```

The standalone build outputs to `.next/standalone/` with all required dependencies copied.

## Worker

The queue worker (PgBoss) starts automatically during app initialization via Next.js `instrumentation.ts`. It registers all job handlers from `src/modules/queue/jobs/` and schedules cron jobs (FX sync, webhook retry, daily briefings, alert engine, anomaly detection). No separate worker process is required.

## Docker

A `docker-compose.yml` is provided for containerized deployment:

```bash
docker compose up -d
```

The app container runs `npx prisma migrate deploy && npx prisma generate && node server.js` on startup.
