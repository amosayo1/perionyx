# Rollback Guide — Perionyx Enterprise Finance Platform

**Version**: 1.0 | **Last Updated**: 2026-07-12

## Table of Contents

1. [When to Rollback](#when-to-rollback)
2. [Full Rollback Steps](#full-rollback-steps)
3. [Partial Rollback Options](#partial-rollback-options)
4. [Database Rollback](#database-rollback)
5. [Configuration Rollback](#configuration-rollback)
6. [Verification After Rollback](#verification-after-rollback)

---

## When to Rollback

### Automatic Rollback Triggers

The CI/CD pipeline automatically initiates rollback when:

| Condition | Threshold | Evaluation Window | Severity |
|---|---|---|---|
| Error rate exceeds threshold | > 5% HTTP 5xx | 5 minutes | Critical |
| P95 API latency increases | > 50% from baseline | 5 minutes | Critical |
| Health check failures | 3 consecutive failures | Immediate | Critical |
| Queue backlog exceeds limit | > 10,000 unprocessed jobs | 5 minutes | High |
| Memory leak detected | > 90% container memory | 10 minutes | High |
| Database connection errors | > 10% failure rate | 5 minutes | Critical |

### Manual Rollback Criteria

Operators should initiate rollback when:

- Critical bug blocks core financial workflows (create transaction, approval, reconciliation)
- Data integrity issue detected (incorrect balances, duplicate records)
- Security vulnerability discovered in deployed version
- Compliance requirement violated (audit trail missing, incorrect reporting)
- Performance degradation impacts user experience significantly (page load > 5s)
- Third-party integration failure (bank feed, ERP sync) that blocks operations
- Customer-reported issue confirmed as regression from previous version

### When NOT to Rollback

- Minor cosmetic issues or text errors
- Non-blocking performance degradation (< 20% latency increase)
- Feature not working as expected but previous version also had the issue
- Database migration partially applied (downtime may be worse than fixing forward)

### Decision Matrix

```
                    ┌─────────────────────────────────────┐
                    │       Can Fix Forward Quickly?      │
                    │          Yes          No             │
┌───────────────────┼─────────────────────────────────────┤
│  Business Impact  │                                    │
│  Critical         │  Fix forward       │  Rollback     │
│  High             │  Fix forward       │  Rollback     │
│  Medium           │  Fix forward       │  Consider     │
│  Low              │  Defer             │  Defer        │
└───────────────────┴─────────────────────────────────────┘
```

---

## Full Rollback Steps

### Automated Rollback (Kubernetes)

```bash
# Quick rollback to previous revision
kubectl rollout undo deployment/perionyx-app -n perionyx

# Rollback to specific revision
kubectl rollout undo deployment/perionyx-app \
  -n perionyx \
  --to-revision=3

# Monitor rollback status
kubectl rollout status deployment/perionyx-app \
  -n perionyx \
  --timeout=5m
```

### Full Rollback Script

```bash
#!/bin/bash
# rollback-full.sh — Complete rollback to specified version

set -euo pipefail

NAMESPACE="perionyx"
DEPLOYMENT="perionyx-app"
TARGET_VERSION=${1:-previous}
TIMESTAMP=$(date -u +%Y%m%d_%H%M%S)

echo "=== Perionyx Full Rollback ==="
echo "Target: ${TARGET_VERSION}"
echo "Timestamp: ${TIMESTAMP}"
echo ""

# Phase 1: Pre-rollback snapshot
echo "[Phase 1/6] Creating pre-rollback snapshot..."
kubectl get deployment/${DEPLOYMENT} -n ${NAMESPACE} \
  -o yaml > /tmp/rollback-snapshot-${TIMESTAMP}.yaml

# Phase 2: Scale down new version
echo "[Phase 2/6] Scaling down new version..."
kubectl scale deployment/${DEPLOYMENT} \
  -n ${NAMESPACE} \
  --replicas=0 || true

# Phase 3: Rollback code
echo "[Phase 3/6] Rolling back application code..."
if [ "${TARGET_VERSION}" = "previous" ]; then
  kubectl rollout undo deployment/${DEPLOYMENT} -n ${NAMESPACE}
else
  kubectl rollout undo deployment/${DEPLOYMENT} \
    -n ${NAMESPACE} \
    --to-revision=${TARGET_VERSION}
fi

# Phase 4: Wait for rollback
echo "[Phase 4/6] Waiting for rollback to complete..."
kubectl rollout status deployment/${DEPLOYMENT} \
  -n ${NAMESPACE} \
  --timeout=5m

# Phase 5: Database rollback (if needed)
echo "[Phase 5/6] Checking if database rollback is required..."
CURRENT_MIGRATION=$(kubectl exec deployment/${DEPLOYMENT} \
  -n ${NAMESPACE} -- npx prisma migrate status 2>/dev/null | \
  grep "Current migration" | awk '{print $NF}') || true

if [ -n "${CURRENT_MIGRATION}" ]; then
  echo "Current migration: ${CURRENT_MIGRATION}"
  echo "Database rollback required — see database rollback section"
fi

# Phase 6: Verification
echo "[Phase 6/6] Running rollback verification..."
sleep 10

for i in $(seq 1 12); do
  STATUS=$(curl -sf -o /dev/null -w "%{http_code}" \
    https://app.perionyx.com/api/v1/enterprise/health 2>/dev/null) || continue
  if [ "${STATUS}" = "200" ]; then
    echo "Rollback verified — application healthy"
    break
  fi
  if [ "${i}" = "12" ]; then
    echo "WARNING: Rollback completed but health check pending"
  fi
  sleep 5
done

echo ""
echo "=== Rollback Complete ==="
echo "Target version restored: ${TARGET_VERSION}"
echo "Post-rollback verification required"
```

### Full Rollback (Docker Compose)

```bash
#!/bin/bash
# rollback-docker.sh

PREV_VERSION=$1  # e.g., v1.0.0

# 1. Stop current containers
docker compose down

# 2. Pull previous version
docker pull ghcr.io/organization/perionyx:${PREV_VERSION}

# 3. Update .env with previous version
sed -i "s/VERSION=.*/VERSION=${PREV_VERSION}/" .env.production

# 4. Start previous version
docker compose up -d

# 5. Verify health
docker compose logs --tail=20 app
curl -s http://localhost:3000/api/v1/enterprise/health
```

### Full Rollback (Manual/Systemd)

```bash
#!/bin/bash
# rollback-manual.sh

TARGET_VERSION=$1
DEPLOY_DIR="/opt/perionyx"
BACKUP_DIR="/opt/perionyx/backups"

# 1. Stop service
systemctl stop perionyx

# 2. Backup current (failed) version
mv ${DEPLOY_DIR}/current ${DEPLOY_DIR}/failed-$(date +%Y%m%d_%H%M%S)

# 3. Restore previous version
cp -a ${DEPLOY_DIR}/releases/${TARGET_VERSION} ${DEPLOY_DIR}/current

# 4. Restore previous .env
cp ${DEPLOY_DIR}/env/${TARGET_VERSION}.env ${DEPLOY_DIR}/current/.env.local

# 5. Install deps and build (if needed)
cd ${DEPLOY_DIR}/current
pnpm install --frozen-lockfile
pnpm build

# 6. Start service
systemctl start perionyx

# 7. Verify
sleep 10
systemctl status perionyx
curl -s http://localhost:3000/api/v1/enterprise/health
```

---

## Partial Rollback Options

### Code Rollback Only (Keep Database)

Use when the database migration is backward-compatible and you only need to revert application code:

```bash
# Revert only the application image
kubectl set image deployment/perionyx-app \
  app=ghcr.io/organization/perionyx:v1.0.0 \
  -n perionyx

# No database rollback needed
echo "Code-only rollback — database unchanged"
```

### Feature Flag Toggle

Instead of rolling back, use feature flags to disable the problematic feature:

```bash
# Disable a feature via ConfigMap
kubectl patch configmap perionyx-config -n perionyx \
  --type merge \
  -p '{"data":{"FEATURE_NEW_APPROVAL_FLOW":"false"}}'

# Restart pods to pick up config change
kubectl rollout restart deployment/perionyx-app -n perionyx
```

### Configuration Rollback Only

```bash
# Restore previous ConfigMap
kubectl apply -f k8s/configmaps/app-config.prev.yaml

# Restore previous Secrets
kubectl apply -f k8s/secrets/app-secrets.prev.yaml

# Restart pods
kubectl rollout restart deployment/perionyx-app -n perionyx
```

### Traffic Rerouting (Blue-Green)

```bash
# Switch traffic back to blue deployment
kubectl patch service/perionyx-app -n perionyx \
  --type merge \
  -p '{"spec":{"selector":{"version":"blue"}}}'
```

---

## Database Rollback

### Prisma Migration Rollback

```bash
# Step 1: Check current migration status
pnpm prisma migrate status

# Output example:
# ┌─────────────────────────────────┬────────────────────────┐
# │ Migration                       │ Status                 │
# ├─────────────────────────────────┼────────────────────────┤
# │ 20260712000001_initial          │ ✅ Applied             │
# │ 20260712000002_add_features     │ ✅ Applied             │
# │ 20260712000003_new_workflow     │ ✅ Applied (current)   │
# └─────────────────────────────────┴────────────────────────┘

# Step 2: Mark the last migration as rolled back
pnpm prisma migrate resolve \
  --rolled-back "20260712000003_new_workflow"

# Step 3: Verify migration status
pnpm prisma migrate status
# Expected: 20260712000003_new_workflow shows "✗ Rolled Back"
```

### SQL Rollback Script

If the migration cannot be resolved via Prisma, use a manual SQL rollback:

```sql
-- Rollback migration: 20260712000003_new_workflow

-- Drop new tables
DROP TABLE IF EXISTS new_workflow_steps;
DROP TABLE IF EXISTS new_workflows;

-- Drop new columns
ALTER TABLE transactions DROP COLUMN IF EXISTS workflow_id;
ALTER TABLE approvals DROP COLUMN IF EXISTS auto_approve;

-- Drop new indexes
DROP INDEX IF EXISTS idx_transactions_workflow;
DROP INDEX IF EXISTS idx_approvals_auto;

-- Recreate old indexes (if dropped)
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
```

```bash
# Apply SQL rollback
psql -h ${DB_HOST} -U ${DB_USER} -d perionyx \
  -f scripts/rollbacks/20260712000003_rollback.sql
```

### Full Database Restore

When migration rollback is not sufficient, restore from backup:

```bash
# Step 1: Identify the backup to restore
BACKUP_FILE=$(ls -t /backups/pre-upgrade/*/perionyx-full-*.dump | head -1)
echo "Restoring from: ${BACKUP_FILE}"

# Step 2: Terminate all connections
psql -h ${DB_HOST} -U ${DB_USER} -d perionyx -c "
  SELECT pg_terminate_backend(pid)
  FROM pg_stat_activity
  WHERE datname = 'perionyx' AND pid <> pg_backend_pid();
"

# Step 3: Drop and recreate database
dropdb -h ${DB_HOST} -U ${DB_USER} perionyx
createdb -h ${DB_HOST} -U ${DB_USER} perionyx

# Step 4: Restore from backup
pg_restore -h ${DB_HOST} -U ${DB_USER} \
  -d perionyx \
  --jobs=4 \
  --verbose \
  ${BACKUP_FILE}

# Step 5: Re-apply any migrations that should remain
pnpm prisma migrate deploy

# Step 6: Verify
pnpm prisma migrate status
```

### Database Rollback Decision Tree

```
Is database migration backward-compatible?
├── Yes → Code rollback only, no DB changes
└── No → Is the migration purely additive (new tables/columns)?
    ├── Yes → Code rollback only, leave DB schema as-is
    └── No → Does data need to be restored?
        ├── Yes → Full database restore from backup
        └── No → Selective SQL rollback + Prisma resolve
```

---

## Configuration Rollback

### Environment Configuration

```bash
# Restore previous .env.local
cp .env.local.backup-20260715 .env.local

# Restore previous ConfigMap (Kubernetes)
kubectl apply -f k8s/configmaps/app-config.prev.yaml

# Restore previous Secrets
kubectl apply -f k8s/secrets/app-secrets.prev.yaml

# Verify config
kubectl get configmap perionyx-config -n perionyx -o yaml
```

### Infrastructure Configuration

```bash
# Terraform state rollback
terraform state push terraform.tfstate.backup

# Pulumi rollback
pulumi stack select production
pulumi up --target <previous-stack-version>

# Ansible rollback
ansible-playbook -i inventory/production.ini rollback.yml \
  -e "rollback_version=v1.0.0"
```

### Kubernetes Manifest Rollback

```bash
# List rollout history
kubectl rollout history deployment/perionyx-app -n perionyx

# Rollback to specific revision
kubectl rollout undo deployment/perionyx-app \
  -n perionyx \
  --to-revision=2

# Verify
kubectl rollout status deployment/perionyx-app -n perionyx
```

---

## Verification After Rollback

### Health Verification

```bash
# 1. Health check endpoint
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" \
  https://app.perionyx.com/api/v1/enterprise/health)

if [ "${HEALTH}" = "200" ]; then
  echo "✓ Health check passed"
else
  echo "✗ Health check failed: HTTP ${HEALTH}"
fi

# 2. Version check
VERSION=$(curl -s https://app.perionyx.com/api/v1/enterprise/health | \
  jq -r '.version')
echo "Current version: ${VERSION}"

# 3. Component statuses
curl -s https://app.perionyx.com/api/v1/enterprise/health | \
  jq '.checks | to_entries[] | select(.value.status != "ok") | "\(.key): \(.value.status)"'
```

### Data Integrity Verification

```bash
# 1. Key business metrics
echo "
  SELECT 'Active users' as metric, count(*) FROM users WHERE active = true
  UNION ALL
  SELECT 'Pending approvals', count(*) FROM approvals WHERE status = 'pending'
  UNION ALL
  SELECT 'Total balance (USD)', sum(balance) FROM accounts WHERE currency = 'USD';
" | psql -h ${DB_HOST} -U ${DB_USER} -d perionyx

# 2. Compare against pre-deployment baseline
# (Run the same queries from the pre-deployment snapshot)

# 3. Check for data anomalies
echo "
  SELECT 'Negative balances' as issue, count(*) FROM accounts WHERE balance < 0
  UNION ALL
  SELECT 'Stale transactions', count(*) FROM transactions
    WHERE status = 'pending' AND created_at < now() - interval '7 days';
" | psql -h ${DB_HOST} -U ${DB_USER} -d perionyx
```

### Integration Verification

```bash
# 1. Test authentication
TOKEN=$(curl -s -X POST https://app.perionyx.com/api/auth/signin \
  -d "email=admin@perionyx.com&password=test" | jq -r '.token')

if [ -n "${TOKEN}" ] && [ "${TOKEN}" != "null" ]; then
  echo "✓ Authentication working"
else
  echo "✗ Authentication failed"
fi

# 2. Test API with token
STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer ${TOKEN}" \
  https://app.perionyx.com/api/v1/treasury/cash-position)
echo "API: HTTP ${STATUS}"

# 3. Test queue worker
QUEUE_JOBS=$(curl -s https://app.perionyx.com/api/metrics | \
  grep queue_active_workers | awk '{print $NF}')
echo "Active queue workers: ${QUEUE_JOBS}"
```

### Monitoring Verification

```bash
# 1. Check alert manager status
ALERTS=$(curl -s https://alertmanager.perionyx.com/api/v2/alerts | \
  jq '[.[] | select(.status.state=="firing")] | length')
echo "Firing alerts: ${ALERTS}"

# 2. Check key metrics endpoints
curl -s https://app.perionyx.com/api/metrics | grep -E \
  "http_requests_total|http_request_duration_seconds"

# 3. Verify log streams
tail -100 /var/log/perionyx/app.log | grep -E "ERROR|CRITICAL"

# 4. Check database connections
echo "SELECT count(*) FROM pg_stat_activity WHERE datname = 'perionyx';" | \
  psql -h ${DB_HOST} -U ${DB_USER} -d perionyx
```

### Verification Sign-Off Checklist

```markdown
# Post-Rollback Verification Sign-Off

**Date**: {{date}}
**Rolled back to version**: {{version}}
**Rollback reason**: {{reason}}

| Check | Status | Notes |
|---|---|---|
| Health endpoint returns 200 | ☐ | |
| All component checks pass | ☐ | |
| Authentication works | ☐ | |
| Core workflows functional | ☐ | |
| Queue workers processing | ☐ | |
| Error rate below threshold | ☐ | |
| Latency within baseline | ☐ | |
| Database integrity verified | ☐ | |
| No critical alerts firing | ☐ | |
| Stakeholders notified | ☐ | |

**Signed off by**: __________________
**Date/Time**: __________________
```
