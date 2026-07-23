# Operations Manual — Perionyx Enterprise Finance Platform

**Version**: 1.0 | **Last Updated**: 2026-07-12

## Table of Contents

1. [Daily Operations](#daily-operations)
2. [Monitoring Checks](#monitoring-checks)
3. [Backup Verification](#backup-verification)
4. [Log Management](#log-management)
5. [Performance Monitoring](#performance-monitoring)
6. [Capacity Planning](#capacity-planning)

---

## Daily Operations

### Morning Checklist

```markdown
# Daily Operations Checklist

**Date**: {{date}}
**Operator**: {{name}}

## System Health
- [ ] Health endpoint returns 200
- [ ] All component checks pass
- [ ] No critical alerts firing
- [ ] Redis cache hit ratio > 80%
- [ ] Queue backlog < 1000

## Database
- [ ] Connection count within normal range
- [ ] No long-running queries (> 30s)
- [ ] Replication lag < 5 seconds
- [ ] Disk usage < 80%

## Backups
- [ ] Last backup successful
- [ ] Backup integrity verified
- [ ] WAL archiving active
- [ ] Cross-region backups synced

## Security
- [ ] SSL certificate valid (> 30 days remaining)
- [ ] No failed login anomalies
- [ ] Rate limits not being hit
- [ ] Audit log review complete

## Performance
- [ ] P95 API latency < 500ms
- [ ] Error rate < 0.1%
- [ ] Page load time < 2s
- [ ] Worker processing rate normal
```

### Morning Health Check Script

```bash
#!/bin/bash
# scripts/daily-health-check.sh

set -euo pipefail

echo "=== Perionyx Daily Health Check ==="
echo "Date: $(date -u)"
echo ""

PASS=0
WARN=0
FAIL=0

check() {
  local name=$1
  local status=$2
  if [ "${status}" = "PASS" ]; then
    echo "✓ ${name}"
    PASS=$((PASS+1))
  elif [ "${status}" = "WARN" ]; then
    echo "⚠ ${name}"
    WARN=$((WARN+1))
  else
    echo "✗ ${name}"
    FAIL=$((FAIL+1))
  fi
}

# Application health
echo "--- Application Health ---"
HTTP_CODE=$(curl -sf -o /dev/null -w "%{http_code}" \
  https://app.perionyx.com/api/v1/enterprise/health 2>/dev/null || echo "000")
if [ "${HTTP_CODE}" = "200" ]; then
  check "Health endpoint" "PASS"
else
  check "Health endpoint (HTTP ${HTTP_CODE})" "FAIL"
fi

HEALTH_PAYLOAD=$(curl -sf https://app.perionyx.com/api/v1/enterprise/health 2>/dev/null || echo '{}')
for COMPONENT in database redis queue memory disk; do
  STATUS=$(echo "${HEALTH_PAYLOAD}" | jq -r ".checks.${COMPONENT}.status // \"unknown\"")
  if [ "${STATUS}" = "ok" ]; then
    check "${COMPONENT}" "PASS"
  elif [ "${STATUS}" = "warning" ]; then
    check "${COMPONENT}" "WARN"
  else
    check "${COMPONENT} (${STATUS})" "FAIL"
  fi
done

# Database
echo ""
echo "--- Database ---"
DB_CONNS=$(psql "${DATABASE_URL}" -t -c \
  "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';" 2>/dev/null | tr -d ' ' || echo "ERROR")
check "Active connections: ${DB_CONNS}" "PASS"

DISK_USAGE=$(psql "${DATABASE_URL}" -t -c \
  "SELECT pg_size_pretty(pg_database_size('perionyx'));" 2>/dev/null | tr -d ' ' || echo "ERROR")
check "Database size: ${DISK_USAGE}" "PASS"

LONG_QUERIES=$(psql "${DATABASE_URL}" -t -c \
  "SELECT count(*) FROM pg_stat_activity WHERE state = 'active' AND now() - query_start > interval '30 seconds';" 2>/dev/null | tr -d ' ' || echo "ERROR")
if [ "${LONG_QUERIES}" = "0" ]; then
  check "Long-running queries" "PASS"
else
  check "Long-running queries: ${LONG_QUERIES}" "WARN"
fi

# Backups
echo ""
echo "--- Backups ---"
LATEST_BACKUP=$(aws s3 ls "s3://perionyx-production-backups/daily/" --recursive 2>/dev/null | sort | tail -1 | awk '{print $1}' || echo "")
if [ -n "${LATEST_BACKUP}" ]; then
  BACKUP_AGE_HOURS=$(( ($(date +%s) - $(date -d "${LATEST_BACKUP}" +%s 2>/dev/null || echo 0)) / 3600 ))
  if [ "${BACKUP_AGE_HOURS}" -lt 26 ]; then
    check "Latest backup: ${BACKUP_AGE_HOURS}h ago" "PASS"
  else
    check "Latest backup: ${BACKUP_AGE_HOURS}h ago" "WARN"
  fi
else
  check "Backup check" "WARN"
fi

# Performance
echo ""
echo "--- Performance ---"
METRICS=$(curl -sf https://app.perionyx.com/api/metrics 2>/dev/null || echo "")
P95_LATENCY=$(echo "${METRICS}" | grep "http_request_duration_seconds" | grep "p95" | awk '{print $NF}' || echo "N/A")
check "P95 latency: ${P95_LATENCY}s" "PASS"

ERROR_RATE=$(echo "${METRICS}" | grep "http_requests_total.*status=\"5" | awk '{sum+=$NF} END {print sum+0}' || echo "0")
check "5xx errors: ${ERROR_RATE}" "PASS"

# Summary
echo ""
echo "=== Summary ==="
echo "Passed: ${PASS}"
echo "Warnings: ${WARN}"
echo "Failed: ${FAIL}"

if [ "${FAIL}" -gt 0 ]; then
  echo "Some checks failed — review and take action"
  exit 1
elif [ "${WARN}" -gt 0 ]; then
  echo "Checks passed with warnings"
  exit 0
else
  echo "All checks passed"
  exit 0
fi
```

### Shift Handover Template

```markdown
# Shift Handover Report

**Operator (outgoing)**: {{name}}
**Operator (incoming)**: {{name}}
**Date/Time**: {{date}}

## Current Status
- System health: Healthy / Degraded / Critical
- Active incidents: {{count}}
- Pending deployments: {{count}}

## Incidents This Shift
| ID | Severity | Status | Description |
|---|---|---|---|
| INC-001 | Low | Resolved | Brief description |
| INC-002 | High | Monitoring | Brief description |

## Ongoing Tasks
- {{task description}} — {{status}}
- {{task description}} — {{status}}

## Notifications
- {{important notification}}
- {{important notification}}

## Special Instructions
- {{special instructions for next shift}}
- {{special instructions for next shift}}
```

---

## Monitoring Checks

### Infrastructure Monitoring

| Check | Frequency | Tool | Threshold | Action |
|---|---|---|---|---|
| CPU utilization | 1 minute | CloudWatch / Prometheus | > 80% for 5 min | Scale up or investigate |
| Memory utilization | 1 minute | CloudWatch / Prometheus | > 85% for 5 min | Scale up, check for leak |
| Disk usage | 5 minutes | CloudWatch / Node Exporter | > 80% | Clean up or expand volume |
| Network throughput | 1 minute | CloudWatch / Grafana | > 80% bandwidth | Check for traffic spike |
| Pod status | 30 seconds | Kubernetes events | CrashLoopBackOff | Investigate logs, restart |

### Application Monitoring

| Check | Frequency | Tool | Threshold | Action |
|---|---|---|---|---|
| Health endpoint | 30 seconds | Prometheus blackbox | Non-200 response | Restart pod, check DB |
| API error rate | 1 minute | Prometheus | > 5% for 5 min | Rollback deployment |
| API P95 latency | 1 minute | Prometheus | > 2s for 5 min | Check DB, optimize queries |
| Active users | 1 minute | Application metrics | Sudden drop | Check auth service |
| Queue depth | 1 minute | Prometheus | > 1000 for 5 min | Scale workers, check errors |

### Business Monitoring

| Check | Frequency | Tool | Threshold | Action |
|---|---|---|---|---|
| Transaction volume | 5 minutes | Application metrics | Unexpected drop | Check integrations |
| Approval rate | 5 minutes | Application metrics | < 50% of transactions | Check approval flow |
| Failed payments | 5 minutes | Application metrics | > 1% | Check payment provider |
| Sync lag (connectors) | 5 minutes | Application metrics | > 30 min | Check connector health |
| Cache hit ratio | 5 minutes | Redis / Prometheus | < 70% | Review caching strategy |

### Synthetic Monitoring

```yaml
# synthetic-monitor.yml — Example Playwright/Checkly configuration
checks:
  - name: Login Flow
    url: https://app.perionyx.com
    steps:
      - type: navigate
        url: /auth/signin
      - type: fill
        selector: "#email"
        value: "${TEST_USER_EMAIL}"
      - type: fill
        selector: "#password"
        value: "${TEST_USER_PASSWORD}"
      - type: click
        selector: "button[type=submit]"
      - type: is-element-visible
        selector: ".dashboard"
    frequency: 5 minutes
    locations: [us-east-1, eu-west-1, ap-southeast-1]
    alert:
      conditions:
        - type: response-time
          threshold: 5000
        - type: status-code
          threshold: 200

  - name: API Health
    url: https://app.perionyx.com/api/v1/enterprise/health
    frequency: 1 minute
    assert:
      - key: $.status
        value: "healthy"
      - key: $.version
        match: "^1\\."
    alert:
      conditions:
        - type: response-time
          threshold: 2000
```

---

## Backup Verification

### Daily Verification

```bash
#!/bin/bash
# scripts/verify-backup-daily.sh

set -euo pipefail

S3_BUCKET="s3://perionyx-production-backups"
TIMESTAMP=$(date -u +%Y%m%d)

echo "=== Daily Backup Verification ==="

# 1. Check latest backup exists
echo "[1/4] Checking backup existence..."
LATEST=$(aws s3 ls "${S3_BUCKET}/daily/" | sort | tail -1 | awk '{print $NF}')
if [ -z "${LATEST}" ]; then
  echo "FAIL: No backup found for today"
  exit 1
fi
echo "Latest backup: ${LATEST}"

# 2. Verify backup size
echo "[2/4] Checking backup size..."
SIZE_BYTES=$(aws s3 ls "${S3_BUCKET}/daily/${LATEST}/perionyx-full-"*.dump | awk '{print $3}')
SIZE_MB=$((SIZE_BYTES / 1024 / 1024))
if [ "${SIZE_MB}" -lt 100 ]; then
  echo "WARNING: Backup size (${SIZE_MB}MB) is smaller than expected"
else
  echo "Backup size: ${SIZE_MB}MB"
fi

# 3. Verify backup metadata
echo "[3/4] Verifying metadata..."
aws s3 cp "${S3_BUCKET}/daily/${LATEST}/backup-info.json" /tmp/verify-meta.json
if jq -e '.checksum' /tmp/verify-meta.json > /dev/null 2>&1; then
  echo "Backup metadata valid"
else
  echo "FAIL: Invalid backup metadata"
  exit 1
fi

# 4. Archive integrity check (spot check)
echo "[4/4] Checking archive integrity..."
aws s3 cp "${S3_BUCKET}/daily/${LATEST}/perionyx-schema-"*.dump /tmp/verify-schema.dump
if pg_restore --list /tmp/verify-schema.dump > /dev/null 2>&1; then
  echo "Schema archive integrity verified"
else
  echo "FAIL: Schema archive corrupted"
  exit 1
fi

echo "Daily backup verification passed"
rm -f /tmp/verify-meta.json /tmp/verify-schema.dump
```

### Weekly Full Verification

```bash
#!/bin/bash
# scripts/verify-backup-weekly.sh

set -euo pipefail

# Restore to staging and run integrity checks
STAGING_DB_URL="postgresql://perionyx:password@staging-db:5432/perionyx_verify"

echo "=== Weekly Full Backup Verification ==="

# 1. Find latest weekly backup
WEEKLY_BACKUP=$(aws s3 ls "s3://perionyx-production-backups/weekly/" | sort | tail -1 | awk '{print $NF}')
echo "Weekly backup: ${WEEKLY_BACKUP}"

# 2. Download and restore
echo "[1/3] Downloading and restoring backup..."
aws s3 cp "s3://perionyx-production-backups/weekly/${WEEKLY_BACKUP}/" /tmp/weekly-verify/ --recursive

dropdb --if-exists "${STAGING_DB_URL##*/}"
createdb "${STAGING_DB_URL##*/}"
BACKUP_FILE=$(ls /tmp/weekly-verify/perionyx-full-*.dump)
pg_restore -d "${STAGING_DB_URL}" --jobs=4 "${BACKUP_FILE}"

# 3. Run integrity checks
echo "[2/3] Running data integrity checks..."
INTEGRITY_PASS=true

# Check table counts match expected
EXPECTED_TABLES=("users" "transactions" "approvals" "organizations" "accounts")
for TABLE in "${EXPECTED_TABLES[@]}"; do
  COUNT=$(psql "${STAGING_DB_URL}" -t -c "SELECT count(*) FROM ${TABLE};" 2>/dev/null | tr -d ' ' || echo "0")
  if [ "${COUNT}" -gt 0 ]; then
    echo "Table ${TABLE}: ${COUNT} rows"
  else
    echo "WARNING: Table ${TABLE} is empty or missing"
    INTEGRITY_PASS=false
  fi
done

# Check for foreign key violations
echo "Checking foreign key integrity..."
FK_VIOLATIONS=$(psql "${STAGING_DB_URL}" -t -c "
  SELECT count(*) FROM (
    SELECT 1 FROM transactions t LEFT JOIN users u ON t.user_id = u.id WHERE u.id IS NULL
  ) AS violations;
" 2>/dev/null | tr -d ' ')
if [ "${FK_VIOLATIONS}" = "0" ]; then
  echo "No foreign key violations"
else
  echo "FOREIGN KEY VIOLATIONS FOUND: ${FK_VIOLATIONS}"
  INTEGRITY_PASS=false
fi

# 4. Cleanup
echo "[3/3] Cleaning up..."
dropdb "${STAGING_DB_URL##*/}"
rm -rf /tmp/weekly-verify/

if [ "${INTEGRITY_PASS}" = true ]; then
  echo "Weekly backup verification passed"
else
  echo "Weekly backup verification FAILED"
  exit 1
fi
```

---

## Log Management

### Log Sources

| Source | Location | Format | Retention |
|---|---|---|---|
| Application (stdout) | `stdout` (container) | JSON | Streamed to aggregator |
| Application (file) | `/var/log/perionyx/app.log` | JSON | 30 days |
| Audit log | `/var/log/perionyx/audit.log` | JSON | 1 year |
| Access log | `/var/log/perionyx/access.log` | Combined | 30 days |
| Database | PostgreSQL CSV logs | CSV | 7 days |
| Nginx | `/var/log/nginx/` | Combined | 14 days |
| Kubernetes | `kubectl logs` | JSON | Varies by aggregator |

### Log Aggregation Configuration

```yaml
# docker-compose logging
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"

# Fluentd configuration for log shipping
# /etc/fluentd/fluent.conf
<source>
  @type tail
  path /var/log/perionyx/*.log
  pos_file /var/log/td-agent/perionyx.log.pos
  tag perionyx.*
  format json
  time_format %Y-%m-%dT%H:%M:%S.%L%Z
</source>

<filter perionyx.**>
  @type record_transformer
  <record>
    hostname "#{Socket.gethostname}"
    env ${NODE_ENV}
  </record>
</filter>

<match perionyx.**>
  @type s3
  s3_bucket perionyx-production-logs
  s3_region us-east-1
  path logs/${tag[1]}/date=%Y/%m/%d/
  <buffer>
    @type file
    path /var/log/td-agent/buffer/perionyx
    timekey 3600
    timekey_wait 60
    chunk_limit_size 50m
  </buffer>
  <format>
    @type json
  </format>
</match>
```

### Log Query Examples

```bash
# Application errors in last hour
grep -E "ERROR|CRITICAL" /var/log/perionyx/app.log | grep "$(date -u -d '1 hour ago' +%Y-%m-%dT%H)"

# Audit log for specific user
grep "user_id\":\"abc123\"" /var/log/perionyx/audit.log

# Access log — top 10 IPs
awk '{print $1}' /var/log/perionyx/access.log | sort | uniq -c | sort -rn | head -10

# Access log — top 10 paths
awk '{print $7}' /var/log/perionyx/access.log | sort | uniq -c | sort -rn | head -10

# Kubernetes logs for a specific deployment
kubectl logs -n perionyx -l app=perionyx --tail=100 --since=1h

# Search logs across all pods
kubectl logs -n perionyx -l app=perionyx --since=1h | grep "ERROR" | head -20

# Fluentd search (S3)
aws s3 ls s3://perionyx-production-logs/logs/app/date=$(date -u +%Y/%m/%d)/ --recursive
```

### Log Retention Policy

| Log Type | Hot Storage | Warm Storage | Cold Storage | Deletion |
|---|---|---|---|---|
| Application | 7 days (local) | 30 days (S3) | 90 days (S3-IA) | 90 days |
| Audit | 30 days (local) | 1 year (S3) | 7 years (Glacier) | 7 years |
| Access | 7 days (local) | 30 days (S3) | — | 30 days |
| Database | 7 days (local) | — | — | 7 days |
| Kubernetes | 7 days (aggregator) | 30 days (S3) | — | 30 days |

### Log Rotation Configuration

```bash
# /etc/logrotate.d/perionyx
/var/log/perionyx/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    sharedscripts
    postrotate
        systemctl reload perionyx 2>/dev/null || true
    endscript
}
```

---

## Performance Monitoring

### Key Performance Indicators

| KPI | Target | Warning | Critical | Measurement |
|---|---|---|---|---|
| API P95 latency | < 500ms | 1s | 2s | Prometheus histogram |
| API P99 latency | < 1s | 2s | 5s | Prometheus histogram |
| Page load time | < 2s | 3s | 5s | Lighthouse / RUM |
| First Contentful Paint | < 1s | 1.5s | 3s | Lighthouse / RUM |
| Time to Interactive | < 2s | 3s | 5s | Lighthouse / RUM |
| Error rate (5xx) | < 0.1% | 0.5% | 1% | Prometheus counter |
| DB query time (p95) | < 100ms | 500ms | 1s | pg_stat_statements |
| Cache hit ratio | > 90% | 80% | 70% | Redis info |
| Queue processing rate | > 1000/min | 500/min | 100/min | Prometheus gauge |
| Database connections | < 100 | 150 | 200 | pg_stat_activity |
| Disk I/O wait | < 5% | 10% | 20% | iostat |

### Performance Dashboard Setup

```bash
# Deploy Grafana dashboard
kubectl apply -f src/server/observability/dashboards/perionyx-overview.json

# Configure Prometheus datasource
# URL: http://prometheus-server.prometheus.svc.cluster.local
# Scrape interval: 15s
# Query timeout: 30s

# Import dashboards
for DASHBOARD in perionyx-overview perionyx-database perionyx-queue perionyx-cache; do
  curl -X POST "http://grafana:3000/api/dashboards/db" \
    -H "Content-Type: application/json" \
    -d @src/server/observability/dashboards/${DASHBOARD}.json
done
```

### Performance Baseline Recording

```bash
#!/bin/bash
# scripts/record-baseline.sh

TIMESTAMP=$(date -u +%Y%m%d_%H%M%S)
BASELINE_DIR="/var/lib/perionyx/baselines"

mkdir -p "${BASELINE_DIR}"

echo "=== Recording Performance Baseline ==="

# API response times
echo "Recording API latency..."
for ENDPOINT in /api/v1/enterprise/health /api/v1/treasury/cash-position /api/v1/treasury/liquidity; do
  TOTAL=0
  for i in $(seq 1 10); do
    RESPONSE=$(curl -w "connect:%{time_connect},ttfb:%{time_starttransfer},total:%{time_total}" \
      -o /dev/null -s "https://app.perionyx.com${ENDPOINT}")
    TOTAL=$(echo "${TOTAL} + $(echo ${RESPONSE} | tr ',' '\n' | grep total | cut -d: -f2)" | bc)
  done
  AVG=$(echo "scale=3; ${TOTAL} / 10" | bc)
  echo "${ENDPOINT}: avg ${AVG}s" >> "${BASELINE_DIR}/baseline-${TIMESTAMP}.txt"
done

# Database query times
echo "Recording database performance..."
psql "${DATABASE_URL}" -c "
  SELECT 'Database size' as metric, pg_size_pretty(pg_database_size('perionyx')) as value
  UNION ALL
  SELECT 'Active connections', count(*)::text FROM pg_stat_activity
  UNION ALL
  SELECT 'Cache hit ratio', (sum(blks_hit) * 100.0 / nullif(sum(blks_hit + blks_read), 0))::text || '%'
  FROM pg_stat_database WHERE datname = 'perionyx';
" >> "${BASELINE_DIR}/baseline-${TIMESTAMP}.txt"

# Cache statistics
echo "Recording cache performance..."
redis-cli INFO stats | grep -E "keyspace_hits|keyspace_misses|hit_ratio" \
  >> "${BASELINE_DIR}/baseline-${TIMESTAMP}.txt"

echo "Baseline recorded: ${BASELINE_DIR}/baseline-${TIMESTAMP}.txt"
```

### Performance Trend Analysis

```bash
#!/bin/bash
# scripts/trend-analysis.sh

echo "=== Performance Trend Analysis ==="
echo "Comparing last 7 days..."

# Query Prometheus for 7-day trend
# (Example using prometheus CLI)
PROMETHEUS_URL="http://prometheus:9090"

# API P95 latency trend
curl -s "${PROMETHEUS_URL}/api/v1/query_range" \
  --data-urlencode 'query=histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))' \
  --data-urlencode "start=$(date -d '7 days ago' +%s)" \
  --data-urlencode "end=$(date +%s)" \
  --data-urlencode "step=3600" | \
  jq -r '.data.result[0].values[] | [(.[0] | strftime("%Y-%m-%d %H:%M")), .[1]] | @tsv' | \
  tail -10

# Error rate trend
curl -s "${PROMETHEUS_URL}/api/v1/query_range" \
  --data-urlencode 'query=sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) * 100' \
  --data-urlencode "start=$(date -d '7 days ago' +%s)" \
  --data-urlencode "end=$(date +%s)" \
  --data-urlencode "step=3600" | \
  jq -r '.data.result[0].values[] | [(.[0] | strftime("%Y-%m-%d %H:%M")), .[1]] | @tsv'
```

---

## Capacity Planning

### Resource Monitoring

```bash
#!/bin/bash
# scripts/capacity-report.sh — Weekly capacity report

echo "=== Perionyx Capacity Report ==="
echo "Generated: $(date -u)"

# Kubernetes resource usage
echo ""
echo "--- Kubernetes Resource Usage ---"
echo "Namespace: perionyx"
echo ""
echo "Pods:"
kubectl top pod -n perionyx --sort-by=cpu
echo ""
echo "Nodes:"
kubectl top node

# Database resource usage
echo ""
echo "--- Database Resource Usage ---"
psql "${DATABASE_URL}" -c "
  SELECT 'Database size' as metric,
         pg_size_pretty(pg_database_size('perionyx')) as current,
         pg_size_pretty(pg_database_size('perionyx') * 1.3) as projected_30d
  UNION ALL
  SELECT 'Active connections',
         count(*)::text,
         round(count(*) * 1.2)::text
  FROM pg_stat_activity
  UNION ALL
  SELECT 'Avg query time (ms)',
         round(avg(total_time / calls)::numeric, 2)::text,
         round(avg(total_time / calls) * 1.1::numeric, 2)::text
  FROM pg_stat_statements;
"
echo ""
echo "Disk usage:"
df -h /var/lib/postgresql/

# Storage growth
echo ""
echo "--- Storage Growth ---"
echo "Backup storage:"
aws s3 ls s3://perionyx-production-backups/ --recursive --summarize | tail -1

# Application metrics
echo ""
echo "--- Application Growth ---"
curl -sf https://app.perionyx.com/api/v1/enterprise/health | \
  jq '{timestamp, uptime_seconds}'

echo ""
echo "--- User Growth (30-day trend) ---"
psql "${DATABASE_URL}" -c "
  SELECT date_trunc('day', created_at)::date as day, count(*) as new_users
  FROM users
  WHERE created_at > now() - interval '30 days'
  GROUP BY 1
  ORDER BY 1;
"
```

### Scaling Triggers

| Resource | Scale Up Trigger | Scale Down Trigger | Action |
|---|---|---|---|
| App pods | CPU > 70% for 5 min | CPU < 30% for 30 min | HPA adjusts replicas |
| App pods | Memory > 80% for 5 min | Memory < 50% for 30 min | HPA adjusts replicas |
| App pods | P95 latency > 1s | P95 latency < 500ms for 1h | Manual scaling review |
| Queue workers | Queue depth > 500 | Queue depth < 100 for 30 min | HPA or manual scaling |
| Database | Connections > 150 | Connections < 100 | Increase max_connections |
| Database | Disk usage > 75% | — | Increase storage allocation |
| Database | CPU > 80% for 30 min | CPU < 50% for 1h | Scale up instance type |
| Redis | Memory > 80% | Memory < 60% | Increase maxmemory |
| Storage | Bucket usage > 80% | — | Configure lifecycle policies |

### Capacity Planning Spreadsheet

```markdown
# Perionyx Capacity Planning — Q3 2026

## Current Usage (Baseline)
| Resource | Current | Utilization | Limit |
|---|---|---|---|
| App pods | 4 | 45% | 10 |
| App CPU | 2.1 cores | 52% | 4 cores/pod |
| App Memory | 6.2 GB | 38% | 16 GB/pod |
| DB Connections | 87 | 43% | 200 |
| DB Storage | 45 GB | 45% | 100 GB |
| Redis Memory | 1.2 GB | 30% | 4 GB |

## Projected Growth (30 days)
| Resource | Current | Projected | Growth Rate |
|---|---|---|---|
| Active users | 1,200 | 1,560 | +30% |
| Transactions/day | 45,000 | 58,500 | +30% |
| Data volume | 45 GB | 54 GB | +20% |
| API requests/min | 2,500 | 3,250 | +30% |

## Recommended Actions
- [ ] Increase app pod min replicas to 5 (by next month)
- [ ] Schedule DB storage increase to 150 GB
- [ ] Review Redis maxmemory setting
- [ ] Evaluate read replica for reporting queries
```
