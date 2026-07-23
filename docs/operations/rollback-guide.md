# Rollback Guide

## When to Rollback

- Error rate > 1% after deployment
- P95 latency increases > 50%
- Health check failures
- Customer-reported critical bugs
- Database migration issues

## Quick Rollback (Kubernetes)

```bash
# Rollback to previous revision
kubectl rollout undo deployment/perionyx-app -n perionyx

# Rollback to specific revision
kubectl rollout undo deployment/perionyx-app -n perionyx --to-revision=3

# Verify rollback status
kubectl rollout status deployment/perionyx-app -n perionyx
```

## Quick Rollback (Docker Compose)

```bash
# Stop current version
docker compose -f docker/production/docker-compose.yml down

# Start previous version
docker compose -f docker/production/docker-compose-prev.yml up -d
```

## Database Rollback

```bash
# List migration history
pnpm prisma migrate status

# Rollback last migration
pnpm prisma migrate resolve --rolled-back "migration_name"

# Restore from backup
psql -h $DB_HOST -U $DB_USER -d perionyx < backups/pre-deploy-dump.sql
```

## Verification After Rollback

```bash
# Check application health
curl https://app.perionyx.com/api/v1/enterprise/health

# Verify error rate
curl https://app.perionyx.com/api/metrics | grep app_requests_error

# Check pod status
kubectl get pods -n perionyx

# Notify team
# Post to #incidents Slack channel
```
