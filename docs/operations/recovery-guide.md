# Recovery Guide

## Disaster Scenarios

### Scenario 1: Application Crash

**Symptoms**: Health check fails, HTTP 503 errors

**Recovery**:
```bash
# Check pod status
kubectl get pods -n perionyx

# View pod logs
kubectl logs -l app=perionyx -n perionyx --tail=100

# Restart deployment if needed
kubectl rollout restart deployment/perionyx-app -n perionyx
```

### Scenario 2: Database Failure

**Symptoms**: Data access errors, connection refused

**Recovery**:
```bash
# Check database pod
kubectl get pods -n perionyx | grep db

# Restore from latest backup
kubectl exec -it perionyx-db-0 -n perionyx -- pg_restore -U postgres -d perionyx /backups/latest.dump

# Verify data integrity
kubectl exec -it perionyx-db-0 -n perionyx -- psql -U postgres -d perionyx -c "SELECT count(*) FROM users;"
```

### Scenario 3: Redis Failure

**Symptoms**: Cache errors, degraded performance

**Recovery**:
```bash
# Check Redis pod
kubectl get pods -n perionyx | grep redis

# Restore from AOF
kubectl exec -it perionyx-redis-0 -n perionyx -- redis-check-aof /data/appendonly.aof

# Application falls back to in-memory cache automatically
```

### Scenario 4: Full Region Outage

**Recovery**:
1. Activate disaster recovery plan
2. Route traffic to secondary region
3. Restore database from cross-region replica
4. Verify application health
5. Update DNS records

## Point-in-Time Recovery

```bash
# Recover database to specific time
pg_restore --time "2026-07-09 14:30:00 UTC" -U postgres -d perionyx /backups/archived.dump
```

## Recovery Validation

After any recovery operation:
```bash
# Run health check
curl https://app.perionyx.com/api/v1/enterprise/health

# Run smoke tests
pnpm test:smoke

# Verify data consistency
pnpm test:data-integrity
```
