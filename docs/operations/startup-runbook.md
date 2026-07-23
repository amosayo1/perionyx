# Startup Runbook

## Startup Sequence

The Perionyx application follows a strict startup sequence:

1. **Configuration Loading** — Environment variables loaded and validated
2. **Database Connection** — Prisma client connects, `SELECT 1` health check
3. **Cache Initialization** — Memory provider default; Redis on `CACHE_PROVIDER=redis`
4. **Queue Initialization** — 8 default queues created, workers start polling
5. **Health Checks** — All checks registered and executed
6. **Ready** — Application accepts requests

## Startup Commands

```bash
# Production (Docker)
docker compose up -d app

# Production (Kubernetes)
kubectl rollout restart deployment/perionyx

# Development
pnpm dev

# Staging
pnpm build && pnpm start
```

## Startup Validation

```
GET /api/health              → 200 { status: "healthy" }
GET /api/health/readiness    → 200 { ready: true }
GET /api/health/report       → JSON with all services healthy
```

## Startup Failure Scenarios

| Symptom | Cause | Resolution |
|---|---|---|
| `DATABASE_URL must be set` | Missing env var | Check `.env` / Kubernetes secret |
| `ENCRYPTION_KEY must be exactly 64 hex` | Missing/invalid key | `pnpm perionyx generate-key` |
| DB connection refused | Database not running | `docker compose up -d db` |
| Redis connection failed | Redis not running | Falls back to memory provider (degraded) |
| `Auth secret not set` | Missing JWT secret | Verify `AUTH_SECRET` env var |

## Dependency Verification

```bash
# Database
docker compose exec db pg_isready -U perionyx

# Redis (if configured)
docker compose exec redis redis-cli ping

# Application health
curl -s http://localhost:3000/api/health | jq .
```
