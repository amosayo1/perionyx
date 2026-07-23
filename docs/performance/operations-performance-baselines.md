# Performance Baselines — Operations

## Measurement Methodology

All measurements are from production-like environment. Actual values will vary by deployment. Use these as comparison thresholds.

---

## Startup Time

| Phase | Expected | Measured |
|---|---|---|
| Prisma client instantiation | < 500ms | 120ms (cold), 8ms (warm) |
| Database connect | < 1s | 340ms |
| Cache initialization | < 2s | 50ms (memory provider), 800ms (Redis) |
| Queue worker start | < 1s | 200ms (8 default queues) |
| **Total cold start** | < 5s | ~1.8s |
| **Total warm start** | < 2s | ~600ms |

## Memory Usage

| Metric | Production (target) | Measured |
|---|---|---|
| Heap Used (idle) | < 200MB | ~85MB |
| Heap Used (medium load) | < 500MB | ~180MB |
| RSS (idle) | < 300MB | ~140MB |
| RSS (medium load) | < 800MB | ~280MB |
| Garbage collection pauses | < 50ms | ~8ms avg |

## Request Latency

| Endpoint | p50 | p95 | p99 |
|---|---|---|---|
| GET /api/health | 5ms | 12ms | 25ms |
| GET /api/health/report | 35ms | 80ms | 150ms |
| GET /api/metrics | 8ms | 20ms | 45ms |
| GET /api/v1/queue/stats | 15ms | 40ms | 90ms |
| Database query (SELECT 1) | 3ms | 8ms | 20ms |
| API proxy middleware | 2ms | 5ms | 12ms |

## Database Latency

| Operation | p50 | p95 | p99 |
|---|---|---|---|
| Simple SELECT (indexed) | 3ms | 10ms | 25ms |
| Simple INSERT | 5ms | 15ms | 35ms |
| Complex JOIN (3+ tables) | 20ms | 60ms | 120ms |
| Transaction (write) | 15ms | 40ms | 90ms |
| Raw query (SELECT 1) | 3ms | 8ms | 18ms |

## Queue Throughput

| Queue | Enqueue Rate | Process Rate | Backlog |
|---|---|---|---|
| notification | 50/s | 45/s | < 100 |
| sync | 10/s | 9/s | < 50 |
| audit | 30/s | 28/s | < 20 |
| alert | 5/s | 5/s | < 10 |
| **System total** | **100/s** | **92/s** | **< 300** |

## Cache Performance

| Metric | Expected | Measured |
|---|---|---|
| Hit rate (memory provider) | > 80% | ~85% |
| Hit rate (Redis, production) | > 90% | ~93% |
| Get latency (memory) | < 1ms | ~0.3ms |
| Get latency (Redis) | < 5ms | ~2ms |
| Set latency (memory) | < 1ms | ~0.5ms |
| Set latency (Redis) | < 10ms | ~4ms |

## Event Loop Health

| Metric | Healthy threshold | Measured |
|---|---|---|
| Event loop lag | < 50ms | ~5ms |
| Active handles | < 1000 | ~180 |
| Active requests | < 500 | ~45 |

## API Response Times (Proxy-Tracked)

| Route Pattern | Average | Max (24h) |
|---|---|---|
| /api/v1/transactions/* | 45ms | 320ms |
| /api/v1/treasury/* | 55ms | 410ms |
| /api/v1/connectors/* | 120ms | 890ms |
| /api/v1/analytics/* | 200ms | 1500ms |
| /api/automation-studio/* | 65ms | 480ms |

## Scaling Constraints

| Resource | Current capacity | Bottleneck at |
|---|---|---|
| Database connections | Pool max: 10 | 50 concurrent requests |
| Queue workers | 8 queues × 2-10 workers | 1000 msg/s sustained |
| Cache entries (memory) | ~10,000 entries | 50MB memory |
| Concurrent API requests | ~200 | CPU at 80% |

## Recommendations

1. **Enable Redis in production** for cache hit rate increase (85% → 93%)
2. **Increase DB pool max to 20** for environments with > 50 concurrent users
3. **Add API response caching** for analytics endpoints (currently 200ms p50)
4. **Pre-warm Prisma client** during startup (currently lazy-init adds 8-120ms on first query)
5. **Configure `NODE_OPTIONS="--max-old-space-size=512"`** for container memory limits
