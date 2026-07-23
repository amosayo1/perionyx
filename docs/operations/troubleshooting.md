# Troubleshooting Guide

## Application Won't Start

### Check Environment

```bash
# Verify all required env vars are set
node -e "
  const required = ['DATABASE_URL', 'AUTH_SECRET', 'ENCRYPTION_KEY', 'NEXTAUTH_SECRET', 'NEXT_PUBLIC_APP_URL'];
  for (const key of required) {
    if (!process.env[key]) console.error('MISSING:', key);
    else console.log('OK:', key);
  }
"
```

### Check Database

```bash
# Test database connection
docker compose exec db psql -U perionyx -c "SELECT 1"

# Check if Prisma migrations applied
docker compose exec app npx prisma migrate status
```

### Check Ports

```bash
# Application port
lsof -i :3000

# Database port
lsof -i :5432

# Redis port (if configured)
lsof -i :6379
```

## Slow Responses

### Check Database Queries

```
GET /api/v1/observability/queries/stats
→ Check averageMs, slowCount, slowPct
```

### Check Long-Running Queries

```sql
SELECT pid, now() - pg_stat_activity.query_start AS duration,
       query, state
FROM pg_stat_activity
WHERE state = 'active'
  AND query NOT LIKE '%pg_stat_activity%'
ORDER BY duration DESC
LIMIT 10;
```

### Check Memory

```
GET /api/health → meta.memory
```

### Check Event Loop

```bash
# In Node process
node -e "
  let last = process.hrtime.bigint();
  setInterval(() => {
    const now = process.hrtime.bigint();
    const lag = Number(now - last) / 1e6;
    console.log('Event loop lag:', lag.toFixed(2), 'ms');
    last = now;
  }, 100);
"
```

## Queue Issues

### Check Queue Status

```
GET /api/v1/queue/stats
```

### Check Dead Letter Queue

```bash
# In-memory queue
# Check MemoryQueue.deadLetter length via getMetrics()
```

### Retry Failed Messages

```bash
# Automatically handled by worker
# Messages retry with exponential backoff: 2s, 4s, 8s, 16s, 32s
# After max retries → dead letter queue
```

## Cache Issues

### Check Cache Provider

```
GET /api/health/report → cache section
```

### Clear Cache

```bash
# Via API
# CacheManager.clear() available in code
```

### Verify Redis

```bash
docker compose exec redis redis-cli MONITOR
# Watch for command failures
```

## Health Check Failures

### Database Health Fails

```bash
docker compose logs db | tail -20
docker compose exec db pg_isready
```

### Cache Health Fails

```bash
# If using Redis:
docker compose exec redis redis-cli ping
# Should return PONG
```

### Queue Health Fails

```bash
# Check if PgBoss schema exists:
docker compose exec db psql -U perionyx -c "SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = 'perionyx_queue');"
```

## Debug Mode

```bash
# Enable debug logging
NODE_ENV=development pnpm dev

# Or set log level
LOGGER_LEVEL=debug pnpm start
```

## Common Errors

| Error | Cause | Solution |
|---|---|---|
| `Can't reach database server` | DB not running | `docker compose up -d db` |
| `ECONNREFUSED` | Service not listening | Check service health |
| `ENOENT` | File not found | Check path permissions |
| `ETIMEDOUT` | Connection timeout | Check network/firewall |
| `Out of memory` | Node heap exhausted | Increase `--max-old-space-size` |
| `QUEUE_FULL` | Queue at capacity | Scale workers or consumers |
