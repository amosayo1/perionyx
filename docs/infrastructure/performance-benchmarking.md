# Performance Benchmarking

## Overview

The persistence layer is designed for performance-critical financial operations. This document outlines expected performance characteristics, benchmarking methodology, and optimization guidelines.

## Performance Targets

| Operation | Target Latency (p99) | Target Throughput |
|---|---|---|
| Cache get (memory) | < 1ms | 100,000 ops/s |
| Cache set (memory) | < 1ms | 100,000 ops/s |
| Cache get (Redis) | < 5ms | 10,000 ops/s |
| Lock acquire (memory) | < 1ms | 50,000 ops/s |
| Queue enqueue | < 1ms | 50,000 ops/s |
| Repository findById | < 5ms | 10,000 ops/s |
| Repository findMany | < 10ms | 5,000 ops/s |
| Paginated query | < 20ms | 2,000 ops/s |

## Benchmarking Methodology

### Cache Benchmarks
```typescript
// Measure get/set throughput
const start = performance.now();
for (let i = 0; i < 100000; i++) {
  cacheManager.set(`key-${i}`, i);
}
const setDuration = performance.now() - start;
```

### Lock Benchmarks
```typescript
// Measure lock acquisition under contention
const lock = await lockManager.acquire("bench", { ttlMs: 10000 });
await lock.release();
```

### Queue Benchmarks
```typescript
// Measure enqueue/dequeue throughput
for (let i = 0; i < 10000; i++) {
  await queue.enqueue({ type: "bench", payload: i });
}
```

## Optimization Guidelines

1. **Use tag-based invalidation** over key-based — O(1) per tag vs O(n) per key
2. **Batch queue operations** with `enqueueBatch` — single array insert vs n inserts
3. **Set `autoRelease: true`** on locks to prevent orphaned locks
4. **Use `withLock` helper** to guarantee release on exception
5. **Configure `maxSize`** on cache to bound memory usage — default 10,000 entries
6. **Tune queue concurrency** per queue based on expected throughput — notifications need 20+ workers, metrics need 2
7. **Set appropriate TTLs** — aggressive for live data (5s), relaxed for reference data (300s)
8. **Enable compression** for large cached values (> 10KB)
