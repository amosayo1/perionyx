# Shutdown Runbook

## Shutdown Sequence

The application follows this shutdown order:

1. **Signal received** — SIGTERM or SIGINT
2. **Request draining** — New requests rejected; in-flight requests complete within timeout
3. **Queue workers stop** — Current jobs complete; no new jobs picked up
4. **Database disconnect** — Prisma client disconnects gracefully
5. **Cache disconnect** — Redis (if configured) connection closed
6. **Exit** — `process.exit(0)`

## Shutdown Commands

```bash
# Docker Compose
docker compose down --timeout 60

# Kubernetes
kubectl delete pod <pod-name> --grace-period=60

# Direct (development)
Ctrl+C  # SIGINT
kill <pid>  # SIGTERM
```

## Shutdown Timeouts

| Phase | Timeout | Behavior |
|---|---|---|
| Request draining | 30s | Remaining requests aborted |
| Queue worker drain | 15s | Remaining jobs requeued on restart |
| Database disconnect | 10s | Connection forced closed |
| Cache disconnect | 5s | Connection dropped |
| **Total** | **60s** | Force exit after timeout |

## Graceful vs Forceful Shutdown

| Method | Type | Behavior |
|---|---|---|
| SIGTERM (docker stop) | Graceful | Full drain sequence |
| SIGINT (Ctrl+C) | Graceful | Full drain sequence |
| SIGKILL (docker kill -9) | Forceful | Immediate termination |
| OOM killer | Forceful | Immediate termination |

## Impact of Forceful Shutdown

- In-flight queue jobs may fail and retry (max retries: 3-5)
- In-flight database transactions may rollback
- Cache entries in memory provider lost (persist to Redis if configured)
- Audit events not lost (Prisma persists on write)

## Verification

```bash
# Check no orphaned connections
docker compose exec db psql -U perionyx -c "SELECT count(*) FROM pg_stat_activity WHERE application_name = 'Prisma Client';"

# Verify clean restart
docker compose logs app | tail -20
```
