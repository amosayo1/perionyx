# Upgrade Guide — Perionyx Enterprise Finance Platform

**Version**: 1.0 | **Last Updated**: 2026-07-12

## Table of Contents

1. [Version Detection](#version-detection)
2. [Pre-Upgrade Checks](#pre-upgrade-checks)
3. [Migration Planning](#migration-planning)
4. [Backup Before Upgrade](#backup-before-upgrade)
5. [Upgrade Execution](#upgrade-execution)
6. [Post-Upgrade Verification](#post-upgrade-verification)
7. [Rollback Procedures](#rollback-procedures)

---

## Version Detection

### Current Version

```bash
# Check installed version
node -e "console.log(require('./src/version').platformVersion)"

# Check via API
curl -s https://app.perionyx.com/api/v1/enterprise/health | jq .version

# Check via package.json
node -e "console.log(require('./package.json').version)"
```

### Available Versions

```bash
# Check container registry tags
docker pull ghcr.io/organization/perionyx:list-tags 2>/dev/null

# GitHub releases
gh release list --repo organization/perionyx

# Update channel check
pnpm run check:update
```

### Version Comparison

```bash
# Compare installed vs available versions
pnpm run version:compare v1.0.0 v1.1.0

# Check changelog
pnpm run changelog --from v1.0.0 --to v1.1.0
```

### Semver Policy

| Segment | Change | Migration Required |
|---|---|---|
| Major (1.x → 2.x) | Breaking API changes, schema changes | Yes — full migration |
| Minor (1.0 → 1.1) | New features, backward-compatible | Yes — additive migration |
| Patch (1.0.0 → 1.0.1) | Bug fixes, no API changes | No — restart only |

### Version File Reference

```typescript
// src/version.ts
{
  platformVersion: "1.0.0",
  releaseName: "Platform Core",
  releaseDate: "2026-07-12",
  buildNumber: "20260712.1",
  architectureVersion: "1"
}
```

---

## Pre-Upgrade Checks

### Automated Pre-Flight Check

```bash
# Run comprehensive pre-flight checks
pnpm run pre-upgrade:check
```

### Checklist

| # | Check | Automated | Command |
|---|---|---|---|
| 1 | Current version recorded | Yes | `pnpm run version:current` |
| 2 | Target version compatible | Yes | `pnpm run version:compatible --target v1.1.0` |
| 3 | Database migration status | Yes | `pnpm prisma migrate status` |
| 4 | Database size check | Yes | `pnpm run db:size` |
| 5 | Disk space available | Yes | `df -h /var/lib/postgresql` |
| 6 | Backup exists and verified | Yes | `pnpm run backup:verify` |
| 7 | Staging environment available | Manual | Verify staging works |
| 8 | Release notes reviewed | Manual | `pnpm run changelog --to v1.1.0` |
| 9 | Rollback plan documented | Manual | See [Rollback Guide](./rollback-guide.md) |
| 10 | Maintenance window confirmed | Manual | Confirm with stakeholders |
| 11 | Team notified | Manual | Post to #deployments channel |
| 12 | Third-party dependency compatibility | Yes | `pnpm run dep:check` |

### Database Migration Compatibility

```bash
# Check if migration is backward-compatible
pnpm prisma migrate status

# Verify migration can be applied without downtime
pnpm run migrate:check --target-version v1.1.0

# Check for breaking changes
pnpm run migrate:diff v1.0.0 v1.1.0
```

### Dependency Compatibility

```bash
# Check npm dependency changes
pnpm run dep:diff --from v1.0.0 --to v1.1.0

# Verify all dependencies resolve
pnpm install --frozen-lockfile --dry-run
```

### Staging Validation

Before upgrading production:

```bash
# 1. Deploy to staging
kubectl apply -f k8s/deployments/app.yaml -n perionyx-staging

# 2. Run migration
pnpm prisma migrate deploy

# 3. Run smoke tests
pnpm run test:smoke

# 4. Run integration tests
pnpm run test:integration

# 5. Perform manual validation
# - Verify all pages load
# - Test authentication
# - Create and approve a transaction
# - Generate a report
# - Verify queue workers process jobs

# 6. Check for error rate increase
# Compare with production baseline
```

---

## Migration Planning

### Migration Types

| Type | Downtime | Complexity | Example |
|---|---|---|---|
| Additive (new tables/columns) | Zero | Low | Add new feature table |
| Non-nullable column add | Requires default | Low | Add required field with default |
| Column rename | Requires migration | Medium | Rename field with backward compat |
| Data transformation | Requires migration | High | Restructure data format |
| Schema refactoring | Requires migration | Very High | Split/merge tables |
| Index creation | Zero (CONCURRENTLY) | Low | Add performance index |

### Downtime Estimation

| Migration Size | Estimated Downtime | Example |
|---|---|---|
| Small (< 10 tables) | 1-5 minutes | Feature addition |
| Medium (10-50 tables) | 5-15 minutes | Minor version upgrade |
| Large (50+ tables) | 15-60 minutes | Major version upgrade |
| Data migration | 30+ minutes | Backfill large tables |

### Staged Migration Approach

For large migrations, use a staged approach:

```
Phase 1: Schema changes (zero-downtime additive)
Phase 2: Backfill new columns (background job)
Phase 3: Deploy new application version
Phase 4: Cleanup old columns (maintenance window)
```

### Migration Plan Document

Create a migration plan for each upgrade:

```markdown
# Migration Plan: v1.0.0 → v1.1.0

## Summary
- Version: 1.1.0
- Type: Minor
- Estimated downtime: 5 minutes
- Date: 2026-07-15 02:00 UTC

## Changes
1. New table: `audit_trail` (additive, zero downtime)
2. New column: `transactions.description` (nullable, zero downtime)
3. Index: `CONCURRENTLY idx_transactions_date` (zero downtime)

## Steps
1. Run migration SQL (Phase 1)
2. Deploy new code
3. Verify

## Rollback
- Database: `prisma migrate resolve --rolled-back <migration>`
- Code: `kubectl rollout undo`
```

---

## Backup Before Upgrade

### Database Backup

```bash
#!/bin/bash
# pre-upgrade-backup.sh

TIMESTAMP=$(date -u +%Y%m%d_%H%M%S)
VERSION=$(node -e "console.log(require('./src/version').platformVersion)")
TARGET_VERSION=$1
BACKUP_DIR="/backups/pre-upgrade/${TIMESTAMP}"

mkdir -p ${BACKUP_DIR}

echo "=== Pre-Upgrade Backup ==="
echo "Current version: ${VERSION}"
echo "Target version: ${TARGET_VERSION}"
echo "Backup directory: ${BACKUP_DIR}"

# 1. Full database dump
echo "[1/5] Creating full database dump..."
pg_dump -Fc \
  -h ${DB_HOST} \
  -U ${DB_USER} \
  -d perionyx \
  -f ${BACKUP_DIR}/perionyx-full-${TIMESTAMP}.dump

# 2. Schema-only dump (for comparison)
echo "[2/5] Creating schema dump..."
pg_dump -Fc \
  -h ${DB_HOST} \
  -U ${DB_USER} \
  -d perionyx \
  --schema-only \
  -f ${BACKUP_DIR}/perionyx-schema-${TIMESTAMP}.dump

# 3. Configuration backup
echo "[3/5] Backing up configuration..."
tar czf ${BACKUP_DIR}/config-${TIMESTAMP}.tar.gz \
  .env.local \
  .env.production \
  k8s/configmaps/ \
  k8s/secrets/ \
  2>/dev/null || true

# 4. Version metadata
echo "[4/5] Saving version metadata..."
node -e "
  const v = require('./src/version');
  process.stdout.write(JSON.stringify(v, null, 2));
" > ${BACKUP_DIR}/version-${VERSION}.json

# 5. Upload to remote storage
echo "[5/5] Uploading backups to remote storage..."
aws s3 cp ${BACKUP_DIR}/ s3://perionyx-backups/pre-upgrade/${VERSION}--${TARGET_VERSION}/ \
  --recursive

echo "Backup completed: ${BACKUP_DIR}"
```

### Backup Verification

```bash
# Verify backup integrity
pg_restore --list ${BACKUP_DIR}/perionyx-full-${TIMESTAMP}.dump | head -20

# Verify backup size
ls -lh ${BACKUP_DIR}/

# Test restore (to staging)
pg_restore -h staging-db -U perionyx \
  -d perionyx_staging \
  ${BACKUP_DIR}/perionyx-full-${TIMESTAMP}.dump

# Compare row counts
echo "SELECT count(*) FROM users;" | psql -h staging-db -d perionyx_staging
echo "SELECT count(*) FROM users;" | psql -h prod-db -d perionyx
```

---

## Upgrade Execution

### Upgrade Steps

```bash
#!/bin/bash
# upgrade.sh — Automated upgrade execution

set -euo pipefail

CURRENT_VERSION=$(node -e "console.log(require('./src/version').platformVersion)")
TARGET_VERSION=$1

if [ -z "${TARGET_VERSION}" ]; then
  echo "Usage: $0 <target-version>"
  exit 1
fi

echo "=== Perionyx Upgrade: ${CURRENT_VERSION} → ${TARGET_VERSION} ==="
echo "Started: $(date -u)"

# Phase 1: Pre-flight
echo "[Phase 1/6] Pre-flight checks..."
pnpm run pre-upgrade:check || exit 1
pnpm prisma migrate status || exit 1

# Phase 2: Backup
echo "[Phase 2/6] Creating backup..."
bash scripts/pre-upgrade-backup.sh ${TARGET_VERSION}

# Phase 3: Maintenance window (if needed)
if [ "$(pnpm run migrate:downtime-required --silent)" = "true" ]; then
  echo "[Phase 3/6] Entering maintenance mode..."
  kubectl patch ingress/perionyx-ingress -n perionyx \
    --type merge \
    -p '{"spec":{"rules":[{"host":"app.perionyx.com","http":{"paths":[{"backend":{"service":{"name":"perionyx-maintenance","port":{"number":80}}},"path":"/","pathType":"Prefix"}]}}]}}'
  
  # Drain active connections
  kubectl delete pod -n perionyx -l app=perionyx
  
  # Wait for pods to terminate
  sleep 15
fi

# Phase 4: Code deployment
echo "[Phase 4/6] Deploying ${TARGET_VERSION}..."
git fetch origin tag v${TARGET_VERSION}
git checkout v${TARGET_VERSION}
pnpm install --frozen-lockfile

# Phase 5: Database migration
echo "[Phase 5/6] Running database migrations..."
pnpm prisma generate
pnpm prisma migrate deploy

# Run data migrations (if any)
if [ -f "scripts/migrations/v${TARGET_VERSION}.sql" ]; then
  echo "Running data migration scripts..."
  psql -h ${DB_HOST} -U ${DB_USER} -d perionyx \
    -f scripts/migrations/v${TARGET_VERSION}.sql
fi

# Phase 5b: Build
echo "[Phase 5b/6] Building application..."
pnpm build

# Phase 6: Start and verify
echo "[Phase 6/6] Starting application..."
pnpm start &

# Wait for startup
sleep 10

# Verify health
for i in $(seq 1 12); do
  STATUS=$(curl -sf -o /dev/null -w "%{http_code}" \
    http://localhost:3000/api/v1/enterprise/health) || true
  if [ "${STATUS}" = "200" ]; then
    echo "Application started successfully"
    break
  fi
  if [ "${i}" = "12" ]; then
    echo "ERROR: Application failed to start"
    exit 1
  fi
  sleep 5
done

# Remove maintenance page (if enabled)
if kubectl get ingress/perionyx-ingress -n perionyx -o yaml | grep -q maintenance; then
  kubectl rollout restart deployment/perionyx-app -n perionyx
  sleep 10
  kubectl rollout status deployment/perionyx-app -n perionyx
fi

echo "=== Upgrade Complete: ${CURRENT_VERSION} → ${TARGET_VERSION} ==="
echo "Completed: $(date -u)"
```

### Manual Upgrade (No Automation)

```bash
# 1. Pull the new version
git fetch origin
git checkout tags/v1.1.0

# 2. Install dependencies
pnpm install --frozen-lockfile

# 3. Generate Prisma client
pnpm prisma generate

# 4. Apply database migrations
pnpm prisma migrate deploy

# 5. Build application
pnpm build

# 6. Restart application
pm2 restart perionyx  # if using PM2
# OR
systemctl restart perionyx  # if using systemd
# OR
kubectl rollout restart deployment/perionyx-app -n perionyx
```

### Kubernetes Upgrade

```bash
# 1. Update image tag in deployment
kubectl set image deployment/perionyx-app \
  app=ghcr.io/organization/perionyx:v1.1.0 \
  -n perionyx --record

# 2. Monitor rollout
kubectl rollout status deployment/perionyx-app -n perionyx --timeout=10m

# 3. Verify new pods are healthy
kubectl get pods -n perionyx -l app=perionyx
kubectl logs -n perionyx -l app=perionyx --tail=20
```

---

## Post-Upgrade Verification

### Health Check

```bash
# Verify version
curl -s https://app.perionyx.com/api/v1/enterprise/health | jq .
# Expected: version matches target version

# Verify all components
curl -s https://app.perionyx.com/api/v1/enterprise/health | jq .checks
# Expected: all checks show "ok"
```

### Smoke Tests

```bash
# Run automated smoke tests
pnpm run test:smoke

# Specific post-upgrade smoke tests
pnpm run test:post-upgrade

# Verify critical paths
# 1. Login
curl -s -X POST https://app.perionyx.com/api/auth/signin \
  -d "email=admin@perionyx.com&password=test" \
  -w "%{http_code}"

# 2. Dashboard loads
curl -s https://app.perionyx.com/ | grep -c "Perionyx"

# 3. API endpoints respond
curl -s https://app.perionyx.com/api/v1/treasury/cash-position | jq .status
```

### Data Integrity Checks

```bash
# Verify row counts match pre-upgrade baseline
echo "
  SELECT 'users' as tbl, count(*) FROM users
  UNION ALL
  SELECT 'transactions', count(*) FROM transactions
  UNION ALL
  SELECT 'organizations', count(*) FROM organizations;
" | psql -h ${DB_HOST} -U ${DB_USER} -d perionyx

# Check for orphaned records
echo "
  SELECT 'orphan_transactions' as check_name, count(*)
  FROM transactions t
  LEFT JOIN users u ON t.user_id = u.id
  WHERE u.id IS NULL;
" | psql -h ${DB_HOST} -U ${DB_USER} -d perionyx
```

### Performance Baseline

```bash
# Record post-upgrade performance baseline
pnpm run perf:baseline --output /tmp/perf-v1.1.0.json

# Compare with pre-upgrade baseline
pnpm run perf:compare \
  --baseline /tmp/perf-v1.0.0.json \
  --current /tmp/perf-v1.1.0.json
```

### Monitoring Check

```bash
# Check monitoring dashboards
# - Error rate: should be < 0.1%
# - P95 latency: should be < 500ms
# - No 5xx errors in last 15 minutes

# Verify alerts are not firing
curl -s https://alertmanager.perionyx.com/api/v2/alerts | jq '. | length'
# Expected: 0 (no firing alerts)

# Check queue health
curl -s https://app.perionyx.com/api/metrics | grep queue_jobs_waiting
# Expected: 0 or low number
```

### Stakeholder Sign-Off

```markdown
# Post-Upgrade Verification Report

**Upgrade**: v1.0.0 → v1.1.0
**Date**: 2026-07-15
**Operator**: DevOps Team

## Status: ✅ PASS

| Check | Result |
|---|---|
| Version correct | ✅ v1.1.0 |
| Health check | ✅ healthy |
| Smoke tests | ✅ 42/42 passed |
| Data integrity | ✅ no anomalies |
| Performance baseline | ✅ within threshold |
| Error rate | ✅ 0.02% (< 0.1%) |
| Alerts firing | ✅ 0 |
| Queue depth | ✅ 0 waiting |

## Sign-off
- [ ] DevOps Lead
- [ ] QA Lead
- [ ] Product Owner
```

---

## Rollback Procedures

### Quick Rollback

```bash
# Kubernetes
kubectl rollout undo deployment/perionyx-app -n perionyx

# Docker Compose
docker compose down
docker compose -f docker-compose.prev.yml up -d

# Manual (systemd)
systemctl stop perionyx
git checkout v1.0.0
pnpm install --frozen-lockfile
pnpm build
systemctl start perionyx
```

### Database Rollback

```bash
# 1. Identify the migration to roll back
pnpm prisma migrate status

# 2. Mark migration as rolled back (without reverting SQL)
pnpm prisma migrate resolve --rolled-back "migration_name"

# 3. Restore full database backup
pg_restore -h ${DB_HOST} -U ${DB_USER} \
  -d perionyx \
  --clean \
  --if-exists \
  /backups/pre-upgrade/perionyx-full-20260715_020000.dump

# 4. Verify rollback
pnpm prisma migrate status
# Expected: all migrations up to v1.0.0 applied
```

### Full Rollback Steps

See the [Rollback Guide](./rollback-guide.md) for detailed procedures.
