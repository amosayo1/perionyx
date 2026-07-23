# Operations Runbook

**Phase:** 8E.5
**Last Updated:** July 8, 2026

---

## 1. Startup Process

### Application Startup Sequence

```
1. Environment variables loaded (src/server/env/validate.ts)
2. Prisma client initialized (global singleton)
3. Next.js server starts (next start)
4. Instrumentation hook fires (src/instrumentation.ts)
   a. PgBoss queue worker starts
   b. Job handlers registered (src/modules/queue/jobs/index.ts)
   c. Cron jobs scheduled (FX sync, webhook retry, daily briefings, alert engine, anomaly detection)
5. HTTP server listens on configured port (default: 3000)
6. Health check endpoint responds
```

### Startup Verification

| Check | Expected | Failure Action |
|---|---|---|
| Process starts without crash | Exit code 0 | Check logs for missing env vars or DB connection |
| Health endpoint responds | `200 OK` | Check DB connectivity, PgBoss schema |
| PgBoss worker starts | No assertion errors | Verify `perionyx_queue` schema exists |
| Cron jobs registered | Jobs visible in PgBoss | Check `instrumentation.ts` registration |

### Startup Time

| Component | Expected Time |
|---|---|
| App server | <5 seconds |
| PgBoss initialization | <2 seconds |
| First request | <500ms (cold start) |
| **Total** | **<8 seconds** |

---

## 2. Deployment Process

### Standard Deployment

```
1. Verify environment variables on target
2. Database migration: npx prisma migrate deploy
3. Prisma client: npx prisma generate
4. Build: pnpm build
5. Start: node .next/standalone/server.js
6. Verify health check
7. Run smoke tests
```

### Docker Deployment

```
1. docker build -t perionyx:{tag} .
2. docker push perionyx:{tag}
3. Update docker-compose or orchestrator with new tag
4. docker compose up -d
5. Verify health check
6. Run smoke tests
```

### Zero-Downtime Considerations

| Aspect | Current State | Recommendation |
|---|---|---|
| Rolling updates | Not configured | Configure in orchestrator (K8s / Nomad) |
| Migration without downtime | Forward-only migrations | Run migrations before app deploy |
| Connection draining | Not configured | Configure in load balancer |
| Warm standby | Not configured | Run 2+ instances behind load balancer |

---

## 3. Backup Strategy

### Database Backups

| Type | Frequency | Retention | Storage | Command |
|---|---|---|---|---|
| Full backup | Daily | 30 days | S3-compatible | `pg_dump -Fc -f perionyx_$(date +%Y%m%d).dump` |
| Weekly full | Weekly (Sunday) | 12 weeks | S3-compatible | Same as daily |
| Monthly archive | Monthly (1st) | 12 months | S3-compatible (cold) | Same as daily |
| WAL archiving | Continuous | 7 days | S3-compatible | `archive_mode = on`, `archive_command` |

### Backup Verification

| Check | Frequency | Method |
|---|---|---|
| Backup completeness | Daily | Check file size and exit code |
| Backup restorability | Weekly | Restore to staging environment |
| Backup encryption | Monthly | Verify AES-256-GCM encryption |
| WAL archive integrity | Daily | Check WAL archiving logs |

### Backup Scripts

```bash
# Full backup
pg_dump \
  --format=custom \
  --file=/backups/perionyx_$(date +%Y%m%d).dump \
  --dbname=$DATABASE_URL \
  --verbose \
  --no-owner

# Encrypt (if not encrypted at rest)
gpg --symmetric --cipher-algo AES256 \
  --output=/backups/perionyx_$(date +%Y%m%d).dump.gpg \
  /backups/perionyx_$(date +%Y%m%d).dump

# Upload to S3
aws s3 cp /backups/perionyx_$(date +%Y%m%d).dump.gpg \
  s3://perionyx-backups/database/
```

---

## 4. Recovery Procedures

### Database Restore

```
1. Identify the target backup (latest daily, or specific timestamp)
2. Stop application (if unsafe to run during restore)
3. Drop and recreate database: DROP DATABASE perionyx; CREATE DATABASE perionyx;
4. Restore: pg_restore --dbname=$DATABASE_URL --verbose perionyx_20260708.dump
5. Verify row counts match expectations
6. Restart application
7. Verify health check and data integrity
```

### Point-in-Time Recovery (PITR)

```
1. Locate the base backup and WAL archive
2. Configure recovery.conf:
   restore_command = 'aws s3 cp s3://perionyx-wal/%f %p'
   recovery_target_time = '2026-07-08 14:30:00 UTC'
3. Start PostgreSQL in recovery mode
4. Verify data at target time
5. Promote to primary if successful
```

### Estimated Recovery Times

| Scenario | RTO | RPO |
|---|---|---|
| Database corruption | 2 hours | 24 hours (daily backup) |
| Accidental data loss | 2 hours (PITR) | 5 minutes (WAL) |
| Full region outage | 4 hours (if cross-region backup) | 24 hours |
| Application crash | 5 minutes (restart) | 0 (stateless) |
| Deployment failure | 5 minutes (rollback) | 0 (previous version) |

---

## 5. Maintenance Procedures

### Routine Maintenance

| Task | Frequency | Impact | Procedure |
|---|---|---|---|
| Dependency updates | Monthly | Low | `pnpm up -L`, test, deploy |
| SSL certificate renewal | Every 90 days | None | Auto-renew via Let's Encrypt |
| Database vacuum/analyze | Weekly | Low | `VACUUM ANALYZE` during low traffic |
| Log rotation | Daily | None | Automated via log aggregator or logrotate |
| Backup verification | Weekly | None | Restore test to staging |
| Security audit | Quarterly | None | Dependency scan, config review |
| Load test | Quarterly | None | Benchmark against baseline |

### Database Maintenance

```sql
-- Weekly vacuum analyze
VACUUM ANALYZE;

-- Check for long-running queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active' AND now() - pg_stat_activity.query_start > interval '5 minutes';

-- Check connection pool usage
SELECT count(*) as active_connections FROM pg_stat_activity;
```

---

## 6. Monitoring Checks

### Health Check Endpoints

| Endpoint | Purpose | Expected Response |
|---|---|---|
| `GET /api/health` | Overall health (DB + PgBoss + Redis) | `200 { "status": "ok", "checks": {...} }` |
| `GET /api/health/ready` | Readiness probe (all deps healthy) | `200` |
| `GET /api/health/live` | Liveness probe (process alive) | `200` |

### Key Metrics to Monitor

| Metric | Alert Threshold | Action |
|---|---|---|
| Error rate (5xx) | >1% over 5 minutes | Investigate immediately |
| P99 API latency | >3s over 5 minutes | Investigate performance |
| Database connections | >80% pool utilization | Scale or investigate leaks |
| PgBoss queue depth | >1000 unprocessed jobs | Investigate worker health |
| Failed jobs (PgBoss) | >5 in 5 minutes | Investigate job handler errors |
| Disk usage | >85% | Clean up or scale storage |
| Memory usage | >90% | Scale or investigate leak |

### Operational Dashboards (Planned)

| Dashboard | Metrics | Tool |
|---|---|---|
| **Application Health** | Error rate, latency, request volume, active users | Grafana |
| **Database Performance** | Connection pool, query latency, cache hit ratio, disk IO | Grafana |
| **Queue Health** | Queue depth, processing rate, failure rate, job age | Grafana |
| **Business Metrics** | Transactions/day, approval throughput, reconciliation runs | Grafana |
| **Infrastructure** | CPU, memory, disk, network, uptime | Cloud provider |

---

## 7. Known Operational Procedures

### Restart Application

```bash
# Docker
docker compose restart

# Standalone
systemctl restart perionyx   # or
pm2 restart perionyx         # or
kill -HUP <pid>              # graceful restart
```

### Scale Horizontally

```bash
# Docker Compose
docker compose up -d --scale app=3

# Kubernetes
kubectl scale deployment perionyx --replicas=3
```

### View Logs

```bash
# Docker
docker compose logs -f app

# Standalone
journalctl -u perionyx -f   # or
tail -f /var/log/perionyx/*.log
```

---

## 8. Contact Information

| Role | Name | Contact |
|---|---|---|
| Engineering Lead | TBD | TBD |
| On-call Engineer | TBD | TBD |
| Database Admin | TBD | TBD |
| Security Lead | TBD | TBD |
| Product Director | TBD | TBD |

---

## References

- `docs/DEPLOYMENT.md` — Deployment guide
- `docs/launch/deployment-checklist.md` — Deployment checklist
- `docs/launch/rollback-strategy.md` — Rollback procedures
- `docs/launch/incident-response.md` — Incident response
- `docs/launch/production-readiness.md` — Production readiness
- `docs/launch/known-limitations.md` — Known limitations
- `docs/PRODUCTION_READINESS.md` — Production readiness sprint
