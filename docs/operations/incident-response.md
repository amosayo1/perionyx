# Incident Response Runbook

## Severity Levels

| Severity | Response Time | Examples |
|---|---|---|
| P0 (Critical) | 5 minutes | Database down, app crash loop, data loss |
| P1 (High) | 15 minutes | Queue backlog, high latency, degraded performance |
| P2 (Medium) | 1 hour | Cache unavailable, slow queries, high memory |
| P3 (Low) | 4 hours | Minor bugs, cosmetic issues, non-critical alerts |

## Incident Response Flow

```
1. DETECT
   - Alert fires (PagerDuty/Slack/Log)
   - Health check failure
   - User report

2. TRIAGE
   - Check /api/health/report for overall status
   - Check /api/health for basic checks
   - Review recent logs
   - Determine severity

3. RESPOND
   - Escalate if needed
   - Apply mitigation
   - Communicate status

4. RESOLVE
   - Verify fix
   - Update runbook
   - Schedule post-mortem
```

## Common Incidents

### Database Unreachable (P0)

**Symptoms**: Health check fails, all requests return errors

**Check**:
```bash
docker compose logs db | tail -50
docker compose exec db pg_isready -U perionyx
```

**Resolution**:
1. `docker compose restart db`
2. Check disk space: `docker compose exec db df -h`
3. Check connections: `docker compose exec db psql -U perionyx -c "SELECT count(*) FROM pg_stat_activity;"`
4. If restart fails, restore from backup: `pnpm perionyx restore <latest-backup-id>`

### High Memory Usage (P1)

**Symptoms**: Alert fires, slow responses

**Check**:
```
GET /api/health → check memory section
GET /api/v1/observability/queries/stats → check slow queries
```

**Resolution**:
1. Identify memory consumers: `docker stats`
2. Restart Node process if > 90% heap
3. Increase `--max-old-space-size` in Dockerfile
4. Add horizontal pod autoscaling

### Queue Backlog (P1)

**Symptoms**: Queue backlog alert fires

**Check**:
```
GET /api/v1/queue/stats
GET /api/health/report → check queues service
```

**Resolution**:
1. Scale worker concurrency: Increase `concurrency` in `default-queues.ts`
2. Restart queue workers: Restart container
3. Check dead-letter queue for poison messages
4. Retry dead-letter messages via `queue.retryDeadLetter()`

### Cache Unavailable (P2)

**Symptoms**: Cache alert fires, system falls back to memory provider

**Check**:
```bash
docker compose exec redis redis-cli ping
GET /api/health/report → check cache service
```

**Resolution**:
1. `docker compose restart redis`
2. Verify cache config: `CACHE_PROVIDER` env var
3. System continues in degraded mode (memory cache)
4. When Redis recovers, switch back automatically

## Communication

- **P0/P1**: Update system status, notify team via Slack #ops channel
- **P2/P3**: Log in incident tracker, resolve within SLA

## Post-Mortem

After every P0/P1 incident:

1. Create incident timeline
2. Identify root cause
3. Document mitigation steps
4. Add monitoring/alerting to prevent recurrence
5. Update runbooks with lessons learned
