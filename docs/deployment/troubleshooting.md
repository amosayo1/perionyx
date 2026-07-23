# Troubleshooting Guide — Perionyx Enterprise Finance Platform

**Version**: 1.0 | **Last Updated**: 2026-07-12

## Table of Contents

1. [Installation Issues](#installation-issues)
2. [Migration Failures](#migration-failures)
3. [Connection Issues](#connection-issues)
4. [Performance Problems](#performance-problems)
5. [Common Error Messages](#common-error-messages)
6. [Support Procedures](#support-procedures)

---

## Installation Issues

### Issue: Prerequisites Check Fails

**Symptom**: `pnpm run validate` exits with code 1

**Common Causes**:
- Node.js version mismatch (need 20.x or 22.x)
- pnpm version mismatch (need 9.x)
- PostgreSQL not running or wrong version
- Redis not running or wrong version

**Resolution**:

```bash
# Check Node.js version
node --version
nvm install 22
nvm use 22

# Check pnpm version
pnpm --version
corepack enable
corepack prepare pnpm@latest --activate

# Check PostgreSQL
psql --version
pg_isready
sudo systemctl status postgresql

# Check Redis
redis-server --version
redis-cli ping
sudo systemctl status redis
```

### Issue: Dependency Installation Fails

**Symptom**: `pnpm install` errors with network or permissions

**Common Causes**:
- Network connectivity issue or proxy blocking
- npm registry unavailable
- Insufficient permissions on node_modules
- Lockfile mismatch

**Resolution**:

```bash
# Clear pnpm store cache
pnpm store prune

# Retry with verbose logging
pnpm install --frozen-lockfile --verbose 2>&1 | tail -50

# If lockfile is corrupted, regenerate
rm pnpm-lock.yaml
pnpm install

# Check network connectivity
curl -I https://registry.npmjs.org

# Configure proxy (if behind corporate proxy)
pnpm config set proxy http://proxy:8080
pnpm config set https-proxy http://proxy:8080
```

### Issue: Build Fails

**Symptom**: `pnpm build` exits with TypeScript errors or build failure

**Common Causes**:
- TypeScript compilation errors
- Missing environment variables
- Prisma client not generated
- Outdated dependencies

**Resolution**:

```bash
# Check TypeScript errors
pnpm typecheck

# Check for missing env vars
node -e "require('./src/server/env/validate').validateEnv()"

# Regenerate Prisma client
pnpm prisma generate
pnpm prisma validate

# Clear Next.js cache
rm -rf .next
pnpm build

# Check for common build issues
pnpm run diagnose:build
```

### Issue: Application Fails to Start

**Symptom**: `pnpm start` or `pnpm dev` exits immediately or hangs

**Common Causes**:
- Port 3000 already in use
- Database not reachable
- Environment variables missing
- Prisma migrations not applied

**Resolution**:

```bash
# Check if port is in use
lsof -i :3000
kill -9 $(lsof -ti :3000) 2>/dev/null

# Verify database connectivity
psql "${DATABASE_URL}" -c "SELECT 1"

# Check database migrations are applied
npx prisma migrate status

# Start with verbose logging
LOG_LEVEL=debug pnpm start 2>&1 | head -50

# Check startup logs
pnpm start &
sleep 5
curl -s http://localhost:3000/api/v1/enterprise/health
```

---

## Migration Failures

### Issue: Prisma Migration Fails

**Symptom**: `pnpm prisma migrate deploy` throws error

**Common Causes**:
- Migration already applied but marked as pending
- Migration conflicts with existing schema
- Insufficient database permissions
- Database connection timeout

**Resolution**:

```bash
# Check migration status
npx prisma migrate status

# Resolve migration conflicts
npx prisma migrate resolve --applied "migration_name"
npx prisma migrate resolve --rolled-back "migration_name"

# Apply migrations one by one
npx prisma migrate deploy 2>&1

# If migration fails on a specific step:
# 1. Check the error message for the failing SQL
# 2. Manually apply or fix the SQL
# 3. Mark the migration as applied
npx prisma migrate resolve --applied "failed_migration_name"
```

### Issue: Data Migration Failure

**Symptom**: Script migration fails mid-way, leaving inconsistent data

**Common Causes**:
- Timeout on large tables
- Constraint violation during data transformation
- Insufficient disk space for temp tables
- Concurrent access causing deadlocks

**Resolution**:

```bash
# Check for partial migration state
echo "
  SELECT table_name, pg_size_pretty(pg_total_relation_size(quote_ident(table_name)))
  FROM information_schema.tables
  WHERE table_schema = 'public';
" | psql "${DATABASE_URL}"

# Check for orphaned temporary tables
echo "
  SELECT tablename FROM pg_tables
  WHERE tablename LIKE '%_migrate_temp%' OR tablename LIKE '%_backup_%';
" | psql "${DATABASE_URL}"

# Roll back the migration steps that were applied
bash scripts/rollbacks/v1.1.0_rollback.sh

# Increase statement timeout for large migrations
psql "${DATABASE_URL}" -c "SET statement_timeout = '600000';"

# Apply migration with increased timeout
PGOPTIONS='-c statement_timeout=600000' npx prisma migrate deploy
```

### Issue: Migration Takes Too Long

**Symptom**: Migration runs for hours, blocking deployments

**Common Causes**:
- Large table without proper indexes
- No CONCURRENTLY option on index creation
- Insufficient database resources
- Lock contention from active queries

**Resolution**:

```bash
# Check active queries
psql "${DATABASE_URL}" -c "
  SELECT pid, now() - pg_stat_activity.query_start AS duration, query
  FROM pg_stat_activity
  WHERE state = 'active' AND query NOT LIKE '%pg_stat_activity%'
  ORDER BY duration DESC;
"

# Check for locks
psql "${DATABASE_URL}" -c "
  SELECT relation::regclass, mode, granted
  FROM pg_locks
  WHERE NOT granted;
"

# Kill blocking queries (careful!)
psql "${DATABASE_URL}" -c "SELECT pg_terminate_backend(<blocking_pid>);"

# For index creation, use CONCURRENTLY
CREATE INDEX CONCURRENTLY idx_name ON table_name(column_name);

# Consider running migration during maintenance window
# with increased resources (temporarily scale up DB instance)
```

---

## Connection Issues

### Issue: Database Connection Refused

**Symptom**: Application logs show `ECONNREFUSED` or `connect ETIMEDOUT`

**Common Causes**:
- Database server not running
- Firewall blocking port 5432
- Connection string incorrect
- Database reached max connections
- SSL/TLS mismatch

**Resolution**:

```bash
# Test TCP connectivity
nc -zv ${DB_HOST} ${DB_PORT:-5432}
telnet ${DB_HOST} ${DB_PORT:-5432}

# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check firewall rules
sudo iptables -L -n | grep 5432
# OR for cloud: check security group / firewall rules

# Verify connection string
psql "${DATABASE_URL}" -c "SELECT 1"

# Check connection count
psql -h ${DB_HOST} -U ${DB_USER} -d postgres -c "
  SELECT count(*) FROM pg_stat_activity;
  SELECT max_connections FROM pg_settings WHERE name = 'max_connections';
"

# Increase max_connections if needed
echo "max_connections = 500" >> /etc/postgresql/16/main/postgresql.conf
sudo systemctl restart postgresql
```

### Issue: Redis Connection Fails

**Symptom**: Cache operations fail, application falls back to in-memory

**Common Causes**:
- Redis server not running
- Redis authentication required but not configured
- Network connectivity issue
- Redis cluster mode misconfiguration
- Out of memory (maxmemory reached)

**Resolution**:

```bash
# Test connectivity
redis-cli -h ${REDIS_HOST} -p ${REDIS_PORT} ping

# If authentication is required
redis-cli -h ${REDIS_HOST} -p ${REDIS_PORT} -a "${REDIS_PASSWORD}" ping

# Check Redis status
redis-cli INFO server | grep uptime
redis-cli INFO memory | grep -E "used_memory_human|maxmemory_human"

# Check for evictions
redis-cli INFO stats | grep evicted_keys

# Clear memory if needed
redis-cli MEMORY PURGE

# Check cluster status (if using cluster mode)
redis-cli --cluster check ${REDIS_HOST}:${REDIS_PORT}
```

### Issue: WebSocket Connection Fails

**Symptom**: Real-time updates not working, WebSocket shows `ERR_CONNECTION_REFUSED`

**Common Causes**:
- Load balancer not configured for WebSocket
- Proxy timeout too short
- TLS configuration incomplete
- Browser blocking WebSocket

**Resolution**:

```bash
# Verify WebSocket endpoint
curl -i -N -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  -H "Host: app.perionyx.com" \
  -H "Origin: https://app.perionyx.com" \
  https://app.perionyx.com/api/ws 2>&1 | head -20

# Check nginx WebSocket configuration
# proxy_set_header Upgrade $http_upgrade;
# proxy_set_header Connection "upgrade";

# Verify load balancer supports WebSocket
# AWS ALB: enable stickiness or use WebSocket-friendly target group
# nginx: ensure proxy read timeout is sufficient
```

### Issue: SMTP Connection Fails

**Symptom**: Emails not sending, authentication errors

**Common Causes**:
- SMTP credentials incorrect
- SMTP server not allowing relaying
- Port blocked by firewall
- TLS/STARTTLS mismatch

**Resolution**:

```bash
# Test SMTP connectivity
openssl s_client -connect ${SMTP_HOST}:${SMTP_PORT} -starttls smtp

# Send test email
node -e "
  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    host: '${SMTP_HOST}',
    port: ${SMTP_PORT},
    auth: { user: '${SMTP_USER}', pass: '${SMTP_PASS}' }
  });
  transporter.verify().then(console.log).catch(console.error);
"
```

---

## Performance Problems

### Issue: Slow Page Load Times

**Symptom**: Pages take > 3 seconds to load

**Common Causes**:
- Large bundle size
- Slow database queries
- Missing cache headers
- Insufficient CDN configuration
- Too many client components

**Resolution**:

```bash
# Check bundle size
ANALYZE=true pnpm build
ls -lh .next/static/chunks/

# Check slow database queries
psql "${DATABASE_URL}" -c "
  SELECT query, calls, total_time / calls AS avg_time
  FROM pg_stat_statements
  ORDER BY avg_time DESC
  LIMIT 10;
"

# Verify cache hit ratio
redis-cli INFO stats | grep -E "keyspace_hits|keyspace_misses"

# Check CDN cache hit ratio
curl -I https://app.perionyx.com/_next/static/chunks/pages/ | grep -i "x-cache"

# Run performance audit
pnpm run perf:audit
```

### Issue: High Memory Usage

**Symptom**: Container/pod memory usage > 85%, OOM kills

**Common Causes**:
- Memory leak in application code
- Connection pool too large
- Redis using too much memory
- No memory limits configured
- Large dataset loaded into memory

**Resolution**:

```bash
# Check container memory usage
kubectl top pod -n perionyx
docker stats --no-stream

# Check Node.js heap
node -e "
  const v8 = require('v8');
  const heap = v8.getHeapStatistics();
  console.log('Heap limit:', (heap.heap_size_limit / 1024 / 1024).toFixed(0), 'MB');
  console.log('Used heap:', (heap.used_heap_size / 1024 / 1024).toFixed(0), 'MB');
  console.log('Heap fragmentation:', ((heap.does_zap_garbage) ? 'Unknown' : (heap.malloced_memory / heap.used_heap_size * 100).toFixed(0)) + '%');
"

# Check for memory leaks (heap snapshot)
node --heapsnapshot-signal SIGUSR2 app.js
# Analyze the snapshot with Chrome DevTools

# Set memory limits
# Node.js: --max-old-space-size=4096
# Docker: --memory=4g
# K8s: resources.limits.memory: "4Gi"

# Increase memory limits temporarily if needed
```

### Issue: High CPU Usage

**Symptom**: CPU consistently > 80%, application becomes unresponsive

**Common Causes**:
- Inefficient query loops
- CPU-heavy operations (encryption, parsing)
- Too many concurrent requests
- Garbage collection thrashing
- Infinite loop in application code

**Resolution**:

```bash
# Identify CPU-heavy processes
top -o CPU
ps aux --sort=-%cpu | head -10

# Profile Node.js CPU usage
node --prof app.js
# Analyze: node --prof-process isolate-*.log > profile.txt

# Check for event loop lag
node -e "
  const start = Date.now();
  setInterval(() => {
    const lag = Date.now() - start - 1000;
    if (lag > 50) console.log('Event loop lag:', lag, 'ms');
  }, 1000);
"

# Check for GC pressure
node --trace-gc app.js 2>&1 | grep "GC\|pause"

# Add CPU limits
# Kubernetes: resources.limits.cpu: "2"
# Docker: --cpus=2
```

### Issue: Slow Database Queries

**Symptom**: API endpoints taking > 1 second, DB CPU high

**Common Causes**:
- Missing indexes on queried columns
- N+1 query pattern in application code
- Full table scans on large tables
- Insufficient work_mem for sorting
- Lock contention

**Resolution**:

```bash
# Identify slow queries
psql "${DATABASE_URL}" -c "
  SELECT query, calls, total_time / calls AS avg_time,
         rows, shared_blks_hit, shared_blks_read
  FROM pg_stat_statements
  WHERE total_time / calls > 1000
  ORDER BY avg_time DESC
  LIMIT 10;
"

# Check for missing indexes
psql "${DATABASE_URL}" -c "
  SELECT schemaname, tablename, seq_scan, seq_tup_read,
         idx_scan, idx_tup_fetch
  FROM pg_stat_user_tables
  WHERE seq_scan > idx_scan * 10
  ORDER BY seq_scan DESC;
"

# Recommended fixes:
# 1. Add missing indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_date
  ON transactions(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_user_status
  ON transactions(user_id, status);

# 2. Fix N+1 queries in application code
# Use Prisma include or join instead of separate queries

# 3. Increase work_mem for sorting operations
echo "work_mem = '128MB'" >> /etc/postgresql/16/main/postgresql.conf

# 4. ANALYZE to update statistics
psql "${DATABASE_URL}" -c "ANALYZE;"
```

### Issue: Queue Worker Backlog

**Symptom**: Jobs waiting > 1000, processing time increasing

**Common Causes**:
- Not enough worker replicas
- Worker processing too slow (e.g., API calls to external services)
- Job handler error causing constant retries
- Burst of incoming jobs
- Database bottleneck for job updates

**Resolution**:

```bash
# Check queue status
curl -s https://app.perionyx.com/api/metrics | grep -E "queue_jobs_waiting|queue_active_workers"

# List pending jobs
psql "${DATABASE_URL}" -c "
  SELECT queue, count(*) as pending
  FROM pgboss.job
  WHERE state = 'created'
  GROUP BY queue
  ORDER BY pending DESC;
"

# Check for failing jobs
psql "${DATABASE_URL}" -c "
  SELECT queue, count(*) as failed
  FROM pgboss.job
  WHERE state = 'failed' AND last_error IS NOT NULL
  GROUP BY queue;
"

# View recent errors
psql "${DATABASE_URL}" -c "
  SELECT queue, last_error, attempted_at
  FROM pgboss.job
  WHERE state = 'failed'
  ORDER BY attempted_at DESC
  LIMIT 10;
"

# Scale workers
kubectl scale deployment/perionyx-worker -n perionyx --replicas=5

# Archive old jobs to improve queue performance
psql "${DATABASE_URL}" -c "
  SELECT pgboss.archive(interval '7 days');
"
```

---

## Common Error Messages

### Application Errors

| Error Message | Cause | Resolution |
|---|---|---|
| `ENV_VALIDATION_FAILED: Missing required env var` | .env.local missing variables | Check `.env.example`, add missing vars |
| `DATABASE_URL is required` | No database connection string | Set `DATABASE_URL` in environment |
| `PrismaClientInitializationError` | Prisma client not generated | Run `npx prisma generate` |
| `Migration not applied` | Database schema out of date | Run `npx prisma migrate deploy` |
| `ECONNREFUSED :5432` | PostgreSQL not reachable | Check DB host/port, firewall, credentials |
| `TokenExpiredError: JWT expired` | Authentication token expired | User needs to re-login |
| `ERR_QUEUE_WORKER_FAILED` | PgBoss worker stopped | Check logs, restart pod |
| `ERR_RATE_LIMIT_EXCEEDED` | API rate limit hit | Wait and retry, or increase rate limit |
| `ERR_ENCRYPTION_KEY_ROTATION` | Encryption key mismatch | Restore previous key, re-run rotation |
| `ERR_TENANT_CONTEXT_MISSING` | Tenant isolation violation | Check authentication, tenant header |

### Database Errors

| Error Message | Cause | Resolution |
|---|---|---|
| `FATAL: too many connections` | Connection pool exhausted | Increase `max_connections`, close idle connections |
| `deadlock detected` | Concurrent transactions deadlocked | Retry, implement retry logic in app |
| `ERROR: duplicate key value violates unique constraint` | Duplicate record | Check for race conditions, use upsert |
| `ERROR: relation does not exist` | Table missing or wrong schema | Check `search_path`, run migrations |
| `ERROR: canceling statement due to user request` | Statement timeout | Increase `statement_timeout`, optimize query |
| `ERROR: out of shared memory` | Too many connections/sessions | Increase `shared_buffers`, `max_connections` |
| `ERROR: could not serialize access due to concurrent update` | Serialization failure | Retry transaction, use `SELECT FOR UPDATE` |
| `ERROR: current transaction is aborted` | Previous statement in transaction failed | Rollback and retry transaction |

### Redis Errors

| Error Message | Cause | Resolution |
|---|---|---|
| `NOAUTH Authentication required` | Password not provided | Add `REDIS_PASSWORD` to config |
| `READONLY You can't write against a read-only replica` | Writing to replica | Direct writes to master node |
| `OOM command not allowed when used memory > 'maxmemory'` | Redis out of memory | Increase `maxmemory`, enable eviction |
| `CLUSTERDOWN The cluster is down` | Redis cluster unavailable | Check cluster nodes, restart failed nodes |
| `BUSYKEY Target key name already exists` | Key conflict | Use different key names or delete existing |

### Build Errors

| Error Message | Cause | Resolution |
|---|---|---|
| `Module not found: Can't resolve` | Missing import | Install missing package: `pnpm add <package>` |
| `Type 'X' is not assignable to type 'Y'` | TypeScript type error | Fix type mismatch, check generics |
| `Unexpected token 'export'` | ESM/CJS mismatch | Check `type: "module"` in package.json |
| `Failed to load next.config.ts` | Config syntax error | Check `next.config.ts` for valid syntax |
| `Error: Cannot find module 'prisma'` | Prisma not installed | `pnpm add -D prisma` |

---

## Support Procedures

### Diagnostic Data Collection

```bash
# Collect system diagnostic information
pnpm run diagnose:system

# Collect application diagnostic information
pnpm run diagnose:app

# Generate a support bundle
pnpm run support:bundle

# Output: /tmp/perionyx-support-bundle-{timestamp}.tar.gz
```

### Support Bundle Contents

```
support-bundle/
├── system-info.txt           # OS, kernel, CPU, memory, disk
├── env-vars.txt              # Environment variables (redacted)
├── app-logs/                 # Last 1000 lines of app logs
│   ├── app.log
│   ├── audit.log
│   └── error.log
├── prisma-info.txt           # Prisma migration status
├── docker-info.txt           # Docker/container status
├── k8s-info.txt              # Kubernetes pod/deployment status
├── network-info.txt          # Network connectivity tests
├── performance-info.txt      # Current performance metrics
├── database-info.txt         # DB size, connections, slow queries
└── config-files/             # Sanitized configuration files
    └── .env.local (redacted)
```

### Creating a Support Ticket

```markdown
# Support Ticket Template

## Environment Information
- **Version**: {{version}}
- **Deployment Type**: Kubernetes / Docker / Bare Metal
- **Environment**: Production / Staging / Development
- **Database**: PostgreSQL 16 / Managed RDS / Other
- **Redis**: Single / Cluster / Not Used

## Issue Description
{{detailed description of the issue}}

## Steps to Reproduce
1. {{step 1}}
2. {{step 2}}
3. {{step 3}}

## Expected Behavior
{{what should happen}}

## Actual Behavior
{{what actually happens}}

## Error Messages
```
{{paste error messages here}}
```

## Diagnostic Information
- Support bundle attached: {{bundle filename}}
- Recent changes made: {{list recent changes}}
- Impact: {{number of users affected}}

## Logs (Relevant Snippets)
```
{{paste 10-20 lines of relevant logs}}
```

## Attachments
- [ ] Support bundle (.tar.gz)
- [ ] Screenshots (if UI issue)
- [ ] HAR file (if network issue)
- [ ] Database query output (if DB issue)
```

### Escalation Path

```
Level 1: DevOps / System Administrator (15-minute response)
  - Common fixes, restart services, check configs
  - Response target: 15 minutes

Level 2: Platform Engineering (1-hour response)
  - Code-level issues, performance debugging
  - Response target: 1 hour

Level 3: Core Development Team (4-hour response)
  - Architecture issues, database corruption, security
  - Response target: 4 hours

Level 4: Vendor / Third-party (varies)
  - Infrastructure provider issues
  - Response target: As per SLA
```

### Status Page Communication

```markdown
# Incident Communication Template

## Status: INVESTIGATING / IDENTIFIED / MONITORING / RESOLVED

**Time**: {{timestamp}}
**Incident ID**: INC-{{number}}

## Summary
{{brief description of the issue}}

## Affected Components
- [ ] Application
- [ ] Database
- [ ] Queue Worker
- [ ] API Endpoints
- [ ] Email Notifications
- [ ] File Uploads

## Impact
{{description of user impact}}

## Current Actions
- {{action being taken}}
- {{action being taken}}

## Next Update
{{expected time of next update}}
```

### Post-Incident Review Template

```markdown
# Post-Incident Review

**Incident ID**: INC-{{number}}
**Date**: {{date}}
**Duration**: {{duration}}
**Severity**: {{severity}}

## What Happened
{{detailed timeline of events}}

## Root Cause
{{direct cause of the incident}}

## Detection
{{how was the incident detected}}

## Response
{{triage and resolution steps}}

## What Went Well
- {{item}}
- {{item}}

## What Could Be Improved
- {{item}}
- {{item}}

## Action Items
| # | Action | Owner | Due Date |
|---|---|---|---|
| 1 | | | |
| 2 | | | |

## Metrics
- Time to detection: {{minutes}}
- Time to response: {{minutes}}
- Time to resolution: {{minutes}}
- User impact: {{users affected}}
- Data loss: {{yes/no/amount}}

## Sign-off
- [ ] Engineering Lead
- [ ] DevOps Lead
- [ ] Product Owner
```
