# Disaster Recovery Guide — Perionyx Enterprise Finance Platform

**Version**: 1.0 | **Last Updated**: 2026-07-12

## Table of Contents

1. [Backup Strategy](#backup-strategy)
2. [Recovery Procedures](#recovery-procedures)
3. [Data Restoration](#data-restoration)
4. [System Reconstruction](#system-reconstruction)
5. [DR Testing](#dr-testing)
6. [Recovery Time Objectives](#recovery-time-objectives)

---

## Backup Strategy

### Backup Architecture

```
┌─────────────────────────┐     ┌─────────────────────────┐
│   PostgreSQL            │     │   Application Config    │
│   - Daily full dumps    │     │   - .env files          │
│   - WAL archiving       │     │   - K8s manifests       │
│   - Point-in-time       │     │   - Terraform state     │
└───────────┬─────────────┘     └───────────┬─────────────┘
            │                               │
            ▼                               ▼
┌─────────────────────────────────────────────────────────┐
│                   Object Storage (S3)                    │
│   perionyx-{env}-backups/                                │
│   ├── daily/       (30 day retention)                    │
│   ├── weekly/      (12 week retention)                   │
│   ├── monthly/     (12 month retention)                  │
│   ├── pre-upgrade/ (until next upgrade)                  │
│   └── wal/         (24 hour retention)                   │
└─────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────┐
│   Cross-Region Replica  │
│   (secondary region)    │
└─────────────────────────┘
```

### Backup Types

| Type | Content | Frequency | Retention | Storage Class | RPO |
|---|---|---|---|---|---|
| Full DB dump | Entire PostgreSQL database | Daily | 30 days | S3 Standard | 24 hours |
| Weekly DB dump | Full database | Weekly (Sunday) | 12 weeks | S3 Standard-IA | — |
| Monthly archive | Full database | 1st of month | 12 months | S3 Glacier | — |
| WAL archive | Write-ahead logs | Continuous | 24 hours | S3 Standard | 5 minutes |
| Pre-upgrade | Database + config | Before each deploy | Next upgrade | S3 Standard | — |
| Config dump | Env vars, manifests, IaC | On change | Indefinite | S3 Standard | — |
| Volume backup | pgdata, redis data | Daily | 7 days | S3 Standard | 24 hours |

### Database Backup Script

```bash
#!/bin/bash
# scripts/backup.sh — Database backup automation

set -euo pipefail

BACKUP_TYPE=${1:-daily}   # daily, weekly, monthly, pre-upgrade
TIMESTAMP=$(date -u +%Y%m%d_%H%M%S)
BACKUP_DIR="/tmp/perionyx-backup-${TIMESTAMP}"
S3_BUCKET="s3://perionyx-production-backups"
S3_PATH="${BACKUP_TYPE}/${TIMESTAMP}"

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-perionyx}"
DB_USER="${DB_USER:-perionyx}"

mkdir -p "${BACKUP_DIR}"

echo "=== Perionyx Database Backup ==="
echo "Type: ${BACKUP_TYPE}"
echo "Database: ${DB_NAME}@${DB_HOST}:${DB_PORT}"

# Full database dump (custom format, compressed)
echo "[1/4] Creating full database dump..."
pg_dump -Fc -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" \
  --verbose --file="${BACKUP_DIR}/perionyx-full-${TIMESTAMP}.dump" 2>&1 | tail -5

# Schema-only dump
echo "[2/4] Creating schema dump..."
pg_dump -Fc -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" \
  --schema-only --file="${BACKUP_DIR}/perionyx-schema-${TIMESTAMP}.dump"

# Backup metadata
echo "[3/4] Creating backup metadata..."
cat > "${BACKUP_DIR}/backup-info.json" << EOF
{
  "timestamp": "${TIMESTAMP}",
  "type": "${BACKUP_TYPE}",
  "database": "${DB_NAME}",
  "host": "${DB_HOST}",
  "version": "$(node -e "console.log('1.0.0')" 2>/dev/null || echo 'unknown')",
  "checksum": "$(sha256sum "${BACKUP_DIR}/perionyx-full-${TIMESTAMP}.dump" | cut -d' ' -f1)"
}
EOF

# Upload to S3
echo "[4/4] Uploading to S3..."
aws s3 cp "${BACKUP_DIR}/" "${S3_BUCKET}/${S3_PATH}/" --recursive

# Cleanup
rm -rf "${BACKUP_DIR}"
echo "Backup completed: ${S3_BUCKET}/${S3_PATH}/"
```

### Backup Automation (Cron)

```bash
# /etc/cron.d/perionyx-backup

# Daily backup at 2:00 AM
0 2 * * * root /opt/perionyx/scripts/backup.sh daily

# Weekly full backup at 3:00 AM Sunday
0 3 * * 0 root /opt/perionyx/scripts/backup.sh weekly

# Monthly archive at 4:00 AM on 1st
0 4 1 * * root /opt/perionyx/scripts/backup.sh monthly

# Backup verification at 5:00 AM daily
0 5 * * * root /opt/perionyx/scripts/verify-backup.sh
```

### Backup Verification Script

```bash
#!/bin/bash
# scripts/verify-backup.sh

set -euo pipefail

S3_BUCKET="s3://perionyx-production-backups"

echo "=== Backup Verification ==="
echo "Started: $(date -u)"

# List latest backup
LATEST=$(aws s3 ls "${S3_BUCKET}/daily/" | sort | tail -1 | awk '{print $NF}')
LATEST_PATH="s3://perionyx-production-backups/daily/${LATEST}"
echo "Latest backup: ${LATEST_PATH}"

# Download and verify checksum
aws s3 cp "${LATEST_PATH}/backup-info.json" /tmp/verify-info.json
CHECKSUM=$(cat /tmp/verify-info.json | jq -r '.checksum')

aws s3 cp "${LATEST_PATH}/" /tmp/verify-backup/ --recursive --quiet
VERIFIED=$(sha256sum /tmp/verify-backup/perionyx-full-*.dump | cut -d' ' -f1)

if [ "${CHECKSUM}" = "${VERIFIED}" ]; then
  echo "✓ Checksum verification passed"
else
  echo "✗ Checksum mismatch: expected ${CHECKSUM}, actual ${VERIFIED}"
  exit 1
fi

# Verify archive integrity
pg_restore --list /tmp/verify-backup/perionyx-full-*.dump > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✓ Archive integrity verified"
else
  echo "✗ Archive integrity check failed"
  exit 1
fi

rm -rf /tmp/verify-info.json /tmp/verify-backup/
echo "Backup verification completed successfully"
```

### WAL Archiving Configuration

```conf
# postgresql.conf — WAL archiving settings
wal_level = replica
wal_log_hints = on
archive_mode = on
archive_command = 'aws s3 cp %p s3://perionyx-production-backups/wal/%f'
archive_timeout = 60
max_wal_senders = 10
wal_keep_size = 1024   # MB
```

---

## Recovery Procedures

### Recovery Levels

| Level | Description | RTO | Trigger |
|---|---|---|---|
| L1 — Quick Fix | Restart service, clear cache | < 5 min | Application crash, memory leak |
| L2 — Pod Recovery | Replace failed pods | < 15 min | Pod crash, node failure |
| L3 — Data Recovery | Restore from backup | < 1 hour | Data corruption, bad migration |
| L4 — Region Recovery | Failover to secondary region | < 4 hours | Regional outage |
| L5 — Full DR | Complete system rebuild | < 24 hours | Catastrophic failure |

### Incident Response Workflow

```
1. DETECT
   - Alert fires or user reports issue
   - Operator acknowledges within 5 minutes

2. ASSESS
   - Determine severity (Critical/High/Medium/Low)
   - Identify affected components
   - Decide recovery level (L1-L5)

3. COMMUNICATE
   - Post incident to #incidents Slack channel
   - Update status page
   - Notify stakeholders based on severity

4. RECOVER
   - Execute recovery procedure
   - Monitor progress
   - Verify recovery

5. RESOLVE
   - Confirm all systems operational
   - Post-incident review scheduled
   - Document root cause and prevention
```

### L1 — Quick Fix Procedures

```bash
# Restart application
kubectl rollout restart deployment/perionyx-app -n perionyx

# Clear Redis cache
redis-cli -h redis-host FLUSHALL

# Restart queue workers
kubectl rollout restart deployment/perionyx-worker -n perionyx

# Reload configuration
kubectl rollout restart deployment/perionyx-app -n perionyx --grace-period=30
```

### L2 — Pod Recovery

```bash
# Check pod status
kubectl get pods -n perionyx

# Describe failing pod
kubectl describe pod perionyx-app-xxxxx -n perionyx

# Delete and let ReplicaSet recreate
kubectl delete pod perionyx-app-xxxxx -n perionyx

# Check deployment events
kubectl get events -n perionyx --sort-by='.lastTimestamp'

# Force re-deploy
kubectl rollout restart deployment/perionyx-app -n perionyx
kubectl rollout status deployment/perionyx-app -n perionyx --timeout=10m
```

### L3 — Data Recovery

```bash
#!/bin/bash
# scripts/recover-data.sh

set -euo pipefail

BACKUP_PATH=$1
TARGET_HOST="${TARGET_HOST:-localhost}"
TARGET_DB="${TARGET_DB:-perionyx}"

if [ -z "${BACKUP_PATH}" ]; then
  echo "Usage: $0 <s3-backup-path>"
  echo "Example: $0 s3://perionyx-production-backups/daily/20260712_020000"
  exit 1
fi

echo "=== Data Recovery ==="
echo "Backup source: ${BACKUP_PATH}"

# Download backup
echo "[1/4] Downloading backup..."
aws s3 cp "${BACKUP_PATH}/" /tmp/recovery/ --recursive

BACKUP_FILE=$(ls /tmp/recovery/perionyx-full-*.dump)
echo "Backup file: ${BACKUP_FILE}"

# Terminate connections
echo "[2/4] Terminating active connections..."
psql -h "${TARGET_HOST}" -U perionyx -d postgres -c "
  SELECT pg_terminate_backend(pid)
  FROM pg_stat_activity
  WHERE datname = '${TARGET_DB}' AND pid <> pg_backend_pid();
"

# Drop and recreate
echo "[3/4] Dropping and recreating database..."
dropdb -h "${TARGET_HOST}" -U perionyx --if-exists "${TARGET_DB}"
createdb -h "${TARGET_HOST}" -U perionyx "${TARGET_DB}"

# Restore
echo "[4/4] Restoring from backup..."
pg_restore -h "${TARGET_HOST}" -U perionyx -d "${TARGET_DB}" \
  --jobs=4 --verbose "${BACKUP_FILE}" 2>&1 | tail -10

# Verify
echo "Verifying restore..."
psql -h "${TARGET_HOST}" -U perionyx -d "${TARGET_DB}" -c "
  SELECT 'users' as tbl, count(*) FROM users
  UNION ALL
  SELECT 'transactions', count(*) FROM transactions;
"

echo "Data recovery completed"
rm -rf /tmp/recovery/
```

### L4 — Region Failover

```yaml
# k8s/region-failover.yaml
# Apply to secondary region during failover

apiVersion: v1
kind: ConfigMap
metadata:
  name: perionyx-config
  namespace: perionyx
data:
  NODE_ENV: "production"
  DATABASE_URL: "postgresql://perionyx@replica-db.${SECONDARY_REGION}.rds.amazonaws.com:5432/perionyx"
  REDIS_URL: "redis://replica-redis.${SECONDARY_REGION}:6379"
  NEXTAUTH_URL: "https://app-failover.perionyx.com"
```

```bash
# Failover steps
# 1. Promote RDS read replica to primary
aws rds promote-read-replica --db-instance-identifier perionyx-secondary

# 2. Update DNS to point to secondary region
aws route53 change-resource-record-sets --hosted-zone-id ZONEID \
  --change-batch '{
    "Changes": [{
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "app.perionyx.com",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "SECONDARY_LB_ZONE",
          "DNSName": "secondary-lb.elb.amazonaws.com",
          "EvaluateTargetHealth": true
        }
      }
    }]
  }'

# 3. Deploy application to secondary region
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/deployments/app.yaml
kubectl apply -f k8s/services/app.yaml
kubectl apply -f k8s/hpa/app-hpa.yaml

# 4. Verify failover
curl -s https://app.perionyx.com/api/v1/enterprise/health | jq .
```

### L5 — Full DR (Complete System Rebuild)

```bash
#!/bin/bash
# scripts/full-dr.sh — Complete disaster recovery

set -euo pipefail

DR_REGION="${1:-us-west-2}"
BACKUP_BUCKET="s3://perionyx-backups-dr"
TIMESTAMP=$(date -u +%Y%m%d_%H%M%S)

echo "=== Full Disaster Recovery ==="
echo "Target region: ${DR_REGION}"
echo "Timestamp: ${TIMESTAMP}"

# Step 1: Provision infrastructure
echo "[1/6] Provisioning infrastructure..."
cd infrastructure/terraform
terraform workspace select production-dr
terraform apply -var="region=${DR_REGION}" -auto-approve

# Step 2: Restore database
echo "[2/6] Restoring database..."
LATEST_BACKUP=$(aws s3 ls "${BACKUP_BUCKET}/daily/" | sort | tail -1 | awk '{print $NF}')
aws s3 cp "${BACKUP_BUCKET}/daily/${LATEST_BACKUP}/" /tmp/dr-restore/ --recursive
BACKUP_FILE=$(ls /tmp/dr-restore/perionyx-full-*.dump)

RDS_ENDPOINT=$(terraform output -raw rds_endpoint)
pg_restore -h "${RDS_ENDPOINT}" -U perionyx -d perionyx --jobs=4 "${BACKUP_FILE}"

# Step 3: Deploy Kubernetes resources
echo "[3/6] Deploying Kubernetes resources..."
aws eks update-kubeconfig --region "${DR_REGION}" --name perionyx-dr
kubectl apply -f ../../../k8s/namespace.yaml
kubectl apply -f ../../../k8s/configmaps/
kubectl apply -f ../../../k8s/secrets/
kubectl apply -f ../../../k8s/deployments/
kubectl apply -f ../../../k8s/services/
kubectl apply -f ../../../k8s/hpa/

# Step 4: Wait for deployment
echo "[4/6] Waiting for deployment to stabilize..."
kubectl rollout status deployment/perionyx-app -n perionyx --timeout=10m

# Step 5: Configure ingress
echo "[5/6] Configuring ingress..."
kubectl apply -f ../../../k8s/ingress/
kubectl get ingress -n perionyx

# Step 6: Verify
echo "[6/6] Running verification..."
for i in $(seq 1 20); do
  LB_HOST=$(kubectl get ingress/perionyx-ingress -n perionyx -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://${LB_HOST}/api/v1/enterprise/health" 2>/dev/null || echo "000")
  if [ "${HTTP_CODE}" = "200" ]; then
    echo "DR verification passed"
    break
  fi
  if [ "${i}" = "20" ]; then
    echo "DR verification failed"
    exit 1
  fi
  sleep 30
done

echo "=== Full DR completed successfully ==="
rm -rf /tmp/dr-restore/
```

---

## Data Restoration

### Point-in-Time Recovery (PITR)

```bash
#!/bin/bash
# scripts/pitr.sh — Point-in-time recovery

set -euo pipefail

TARGET_TIME="${1}"  # Format: "2026-07-12 14:30:00 UTC"
DB_HOST="${DB_HOST:-localhost}"
DB_NAME="${DB_NAME:-perionyx}"
RESTORE_DIR="/tmp/pitr-restore"

echo "=== Point-in-Time Recovery ==="
echo "Target time: ${TARGET_TIME}"

# Create a new DB instance for PITR
echo "[1/3] Creating new database instance for PITR..."
createdb -h "${DB_HOST}" -U perionyx "${DB_NAME}_pitr"

# Restore to point in time
echo "[2/3] Restoring to target time..."
pg_restore -h "${DB_HOST}" -U perionyx \
  -d "${DB_NAME}_pitr" \
  --jobs=4 \
  "${BACKUP_FILE}"

# Apply WAL to reach target time
echo "[3/3] Applying WAL to ${TARGET_TIME}..."
# WAL replay is handled by PostgreSQL recovery.conf
psql -h "${DB_HOST}" -U perionyx -d "${DB_NAME}_pitr" -c "
  SELECT pg_wal_replay_resume();
"

echo "PITR recovery to ${TARGET_TIME} completed"
echo "Recovered database: ${DB_NAME}_pitr"
```

### Selective Table Restoration

```bash
#!/bin/bash
# scripts/restore-table.sh — Restore specific tables

set -euo pipefail

TABLE_NAME=$1
BACKUP_FILE=$2
TARGET_HOST="${TARGET_HOST:-localhost}"
TARGET_DB="${TARGET_DB:-perionyx}"

if [ -z "${TABLE_NAME}" ] || [ -z "${BACKUP_FILE}" ]; then
  echo "Usage: $0 <table_name> <backup_file>"
  exit 1
fi

echo "=== Selective Table Restoration ==="
echo "Table: ${TABLE_NAME}"
echo "Backup: ${BACKUP_FILE}"

# Extract table from backup
pg_restore --list "${BACKUP_FILE}" | grep -i "${TABLE_NAME}"

# Restore only the specified table
pg_restore -h "${TARGET_HOST}" -U perionyx \
  -d "${TARGET_DB}" \
  --table="${TABLE_NAME}" \
  --data-only \
  --verbose \
  "${BACKUP_FILE}"

echo "Table ${TABLE_NAME} restored successfully"
```

---

## System Reconstruction

### Automated Reconstruction

```bash
#!/bin/bash
# scripts/reconstruct.sh — Full system reconstruction

set -euo pipefail

ENVIRONMENT="${1:-production}"
VERSION="${2:-latest}"

echo "=== Perionyx System Reconstruction ==="
echo "Environment: ${ENVIRONMENT}"
echo "Version: ${VERSION}"

# Phase 1: Infrastructure provisioning
echo "[Phase 1/5] Provisioning infrastructure..."
cd infrastructure/terraform
terraform init
terraform workspace select "${ENVIRONMENT}"
terraform apply -auto-approve

# Phase 2: Database setup
echo "[Phase 2/5] Setting up database..."
RDS_ENDPOINT=$(terraform output -raw rds_endpoint)

# Restore from latest backup
LATEST_BACKUP=$(aws s3 ls "s3://perionyx-backups-${ENVIRONMENT}/daily/" | sort | tail -1 | awk '{print $NF}')
aws s3 cp "s3://perionyx-backups-${ENVIRONMENT}/daily/${LATEST_BACKUP}/" /tmp/reconstruct/ --recursive
BACKUP_FILE=$(ls /tmp/reconstruct/perionyx-full-*.dump)
pg_restore -h "${RDS_ENDPOINT}" -U perionyx -d perionyx --jobs=4 "${BACKUP_FILE}"

# Phase 3: Kubernetes deployment
echo "[Phase 3/5] Deploying to Kubernetes..."
aws eks update-kubeconfig --region us-east-1 --name "perionyx-${ENVIRONMENT}"
kubectl apply -f ../../../k8s/namespace.yaml
kubectl apply -f ../../../k8s/configmaps/app-config.yaml
kubectl apply -f ../../../k8s/secrets/app-secrets.yaml
kubectl apply -f ../../../k8s/deployments/
kubectl apply -f ../../../k8s/services/
kubectl apply -f ../../../k8s/hpa/

# Phase 4: Service mesh & networking
echo "[Phase 4/5] Configuring networking..."
kubectl apply -f ../../../k8s/network-policies/
kubectl apply -f ../../../k8s/ingress/
kubectl apply -f ../../../k8s/pdb/

# Phase 5: Verification
echo "[Phase 5/5] Running verification..."
kubectl rollout status deployment/perionyx-app -n perionyx --timeout=10m
kubectl get pods -n perionyx

sleep 30
curl -s "https://app.${ENVIRONMENT}.perionyx.com/api/v1/enterprise/health" | jq .

echo "=== Reconstruction complete ==="
rm -rf /tmp/reconstruct/
```

### Reconstruction Documentation Template

```markdown
# System Reconstruction Report

**Date**: {{date}}
**Trigger**: {{reason}}
**Operator**: {{name}}

## Phases Completed
- [ ] Infrastructure provisioning
- [ ] Database restoration
- [ ] Kubernetes deployment
- [ ] Service mesh & networking
- [ ] Verification

## Timeline
| Phase | Start | End | Duration |
|-------|-------|-----|----------|
| 1     |       |     |          |
| 2     |       |     |          |
| 3     |       |     |          |
| 4     |       |     |          |
| 5     |       |     |          |

## Data Integrity Check
- Row counts match baseline: Yes/No
- No orphaned records: Yes/No
- All indexes present: Yes/No

## Sign-off
- [ ] Operators
- [ ] Engineering Lead
- [ ] Security Team
- [ ] Stakeholders notified
```

---

## DR Testing

### Test Schedule

| Test Type | Frequency | Scope | Participants |
|---|---|---|---|
| Tabletop exercise | Quarterly | Review procedures, no actual failover | DevOps, Engineering, Product |
| Component recovery | Monthly | Restore single component from backup | DevOps |
| Database restore | Monthly | Full database restore to staging | DevOps, DBA |
| Region failover | Bi-annual | Full failover to secondary region | DevOps, Engineering |
| Full DR drill | Annually | Complete system rebuild from scratch | All teams |

### Tabletop Exercise Template

```markdown
# Disaster Recovery Tabletop Exercise

**Date**: {{date}}
**Scenario**: {{scenario}}
**Participants**: {{names}}

## Scenario
{{description_of_disaster_event}}

## Exercise Flow
1. Scenario presented to operators
2. Operators describe response actions
3. Team evaluates completeness of response
4. Gaps identified and documented
5. Action items created

## Evaluation Criteria
| Criterion | Met | Notes |
|---|---|---|
| Incident detected within 5 min | Yes/No | |
| Severity correctly assessed | Yes/No | |
| Correct recovery level selected | Yes/No | |
| Stakeholders notified | Yes/No | |
| Recovery procedure followed correctly | Yes/No | |
| Recovery verified | Yes/No | |
| Post-incident review scheduled | Yes/No | |

## Action Items
| # | Item | Owner | Due Date |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
```

### Database Restore Test

```bash
#!/bin/bash
# test/scripts/dr-db-restore-test.sh

set -euo pipefail

echo "=== DR Database Restore Test ==="
echo "Started: $(date -u)"

# 1. Create test data marker
TIMESTAMP=$(date -u +%Y%m%d_%H%M%S)
psql -h staging-db -U perionyx -d perionyx_staging -c "
  INSERT INTO dr_test_log (timestamp, test_name) VALUES
  ('${TIMESTAMP}', 'db_restore_test_${TIMESTAMP}');
"

# 2. Take backup of staging DB
echo "[1/4] Taking staging backup..."
pg_dump -Fc -h staging-db -U perionyx -d perionyx_staging \
  -f /tmp/dr-test-backup-${TIMESTAMP}.dump

# 3. Restore to test database
echo "[2/4] Restoring to test database..."
dropdb -h staging-db -U perionyx --if-exists perionyx_dr_test
createdb -h staging-db -U perionyx perionyx_dr_test
pg_restore -h staging-db -U perionyx -d perionyx_dr_test \
  --jobs=4 /tmp/dr-test-backup-${TIMESTAMP}.dump

# 4. Verify restored data
echo "[3/4] Verifying restored data..."
RECORDS=$(psql -h staging-db -U perionyx -d perionyx_dr_test -t \
  -c "SELECT count(*) FROM dr_test_log WHERE test_name = 'db_restore_test_${TIMESTAMP}';" | tr -d ' ')

if [ "${RECORDS}" = "1" ]; then
  echo "✓ Test record found in restored database"
else
  echo "✗ Test record not found"
  exit 1
fi

# 5. Cleanup
echo "[4/4] Cleaning up..."
psql -h staging-db -U perionyx -d perionyx_staging \
  -c "DELETE FROM dr_test_log WHERE test_name = 'db_restore_test_${TIMESTAMP}';"
dropdb -h staging-db -U perionyx perionyx_dr_test
rm -f /tmp/dr-test-backup-${TIMESTAMP}.dump

echo "DR database restore test passed"
```

---

## Recovery Time Objectives

### Service Level Objectives

| Component | RTO | RPO | Priority |
|---|---|---|---|
| PostgreSQL (primary) | 1 hour | 5 minutes | Critical |
| Application (API + SSR) | 15 minutes | N/A | Critical |
| Queue worker | 15 minutes | N/A | High |
| Redis cache | 30 minutes | 24 hours | Medium |
| Object storage | 4 hours | 24 hours | Medium |
| Full system | 24 hours | 1 hour | Critical |

### RTO Achievement Strategy

| Component | Strategy | Expected RTO |
|---|---|---|
| Database primary | Multi-AZ RDS failover | < 60 seconds automatic |
| Database data loss | Restore from WAL archive (PITR) | < 1 hour |
| Application pods | Kubernetes auto-healing | < 5 minutes |
| Full region | Secondary region deployment | < 4 hours |
| Full rebuild | Infrastructure as Code | < 24 hours |

### RPO Achievement Strategy

| Component | Strategy | Expected RPO |
|---|---|---|
| Database | WAL archiving + daily dumps | 5 minutes |
| File storage | Cross-region replication | 15 minutes |
| Configuration | Git version control | Near-zero |
| Cache | Periodic snapshots | 24 hours |

### Monitoring DR Readiness

```bash
#!/bin/bash
# scripts/check-dr-readiness.sh

echo "=== DR Readiness Check ==="
PASS=0
FAIL=0

# Backup freshness
echo "Checking backup freshness..."
LATEST_BACKUP=$(aws s3 ls "s3://perionyx-production-backups/daily/" --recursive | sort | tail -1 | awk '{print $1}')
BACKUP_AGE=$(( ($(date +%s) - $(date -d "${LATEST_BACKUP}" +%s)) / 3600 ))
if [ "${BACKUP_AGE}" -lt 30 ]; then
  echo "✓ Latest backup: ${BACKUP_AGE} hours ago (threshold: 30h)"
  PASS=$((PASS+1))
else
  echo "✗ Latest backup: ${BACKUP_AGE} hours ago (exceeds 30h threshold)"
  FAIL=$((FAIL+1))
fi

# WAL archiving
echo "Checking WAL archiving..."
WAL_COUNT=$(aws s3 ls "s3://perionyx-production-backups/wal/" --recursive | wc -l)
if [ "${WAL_COUNT}" -gt 0 ]; then
  echo "✓ WAL archives present: ${WAL_COUNT} files"
  PASS=$((PASS+1))
else
  echo "✗ No WAL archives found"
  FAIL=$((FAIL+1))
fi

# Secondary region infrastructure
echo "Checking secondary region..."
SECONDARY_STATE=$(aws cloudformation describe-stacks \
  --region us-west-2 \
  --stack-name perionyx-dr \
  --query 'Stacks[0].StackStatus' \
  --output text 2>/dev/null || echo "NOT_FOUND")
if [ "${SECONDARY_STATE}" = "CREATE_COMPLETE" ] || [ "${SECONDARY_STATE}" = "UPDATE_COMPLETE" ]; then
  echo "✓ Secondary region infrastructure ready"
  PASS=$((PASS+1))
else
  echo "✗ Secondary region infrastructure not ready"
  FAIL=$((FAIL+1))
fi

echo ""
echo "=== Results: ${PASS} passed, ${FAIL} failed ==="

if [ "${FAIL}" -gt 0 ]; then
  echo "DR readiness issues found — review and remediate"
  exit 1
fi
```

### RTO/RPO Dashboard Metrics

```
# Prometheus metrics for DR readiness
perionyx_dr_backup_freshness_hours{type="daily"} 12
perionyx_dr_backup_freshness_hours{type="weekly"} 72
perionyx_dr_backup_freshness_hours{type="monthly"} 360
perionyx_dr_wal_archive_lag_seconds 15
perionyx_dr_secondary_region_ready 1
perionyx_dr_last_test_timestamp{type="tabletop"} "2026-06-15"
perionyx_dr_last_test_timestamp{type="restore"} "2026-06-01"
perionyx_dr_last_test_timestamp{type="failover"} "2025-12-01"
```

### DR Plan Maintenance

- DR documentation reviewed and updated quarterly
- Contact list verified monthly (on-call rotations, vendor contacts)
- Backup retention compliance audited monthly
- DR test results reviewed in post-mortem
- RTO/RPO targets reviewed annually with stakeholders
- Infrastructure-as-code changes always include DR impact assessment
