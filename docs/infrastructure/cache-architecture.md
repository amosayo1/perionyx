# Cache Architecture

## Overview

The cache layer provides a unified interface for in-memory and Redis-backed caching. It uses a facade (`CacheManager`) over an in-memory fallback (`LRUMap`) and an optional Redis provider. All operations are synchronous (in-memory) when Redis is unavailable, ensuring zero downtime.

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  CacheManager                    │
│  get(key, ttl?) → value                         │
│  set(key, value, ttl?) → void                   │
│  del(key) → void                                │
│  invalidate(tag) → void                         │
│  flush() → void                                 │
│  health() → HealthReport                        │
├─────────────────────────────────────────────────┤
│  ┌────────────────┐    ┌────────────────────┐   │
│  │  MemoryCache    │    │  RedisCache        │   │
│  │  (LRUMap)       │    │  (ioredis wrapper) │   │
│  │  O(1) get/set   │    │  SCAN invalidation │   │
│  │  maxSize limit  │    │  pipeline mset     │   │
│  └────────────────┘    └────────────────────┘   │
└─────────────────────────────────────────────────┘
```

## Components

| Component | File | Role |
|---|---|---|
| `CacheManager` | `cache-manager.ts` | Facade — get/set/del/invalidate/flush |
| `MemoryCache` | `cache-manager.ts` | LRU Map with TTL expiration, tag index, max size |
| `RedisProvider` | `redis-provider.ts` | ioredis wrapper with graceful degradation |
| `CacheConfig` | `cache-config.ts` | Tiered TTL config, provider settings |
| `CacheKeys` | `cache-keys.ts` | Namespaced key builder for entity/query/aggregation |
| `CacheUtils` | `cache-utils.ts` | Serialization, expiration helpers |
| `CacheMetrics` | `cache-metrics.ts` | Hit/miss/set/eviction tracking |
| `CacheEvents` | `cache-events.ts` | Typed event bus for cache operations |
| `CacheHealth` | `cache-health.ts` | Health report generator |

## TTL Tiers

| Tier | TTL | Use Cases |
|---|---|---|
| `critical` | 5s | Cash position, liquidity, balance |
| `high` | 15s | FX rates, metrics, active workflows |
| `standard` | 60s | Entity data, user info, permissions |
| `low` | 300s | Config, static reference data |
| `stale` | 600s | Historical analytics, aggregations |
| `bulk` | 30s | Batch operations, multi-entity reads |

## Key Namespacing

Keys follow the pattern `{prefix}:{entity}:{id}[:field]`:
- `cache:treasury:cp-123` — cash position
- `cache:treasury:fx-rate:USD-EUR` — FX rate
- `cache:query:monthly-summary:q-456` — query result

Bulk invalidation supports tag-based deletion (e.g., invalidate all keys tagged `treasury`).

## Graceful Degradation

1. On Redis connection failure, all operations fall through to in-memory cache
2. Redis provider uses lazy connect — connection is established on first operation
3. SCAN-based pattern invalidation works in Redis cluster mode
4. Pipeline mset uses bulk set with single round trip

## Metrics

All operations record:
- Hit/miss counts and ratios
- Set count and eviction count
- Invalidation count and error count
- Average latency per operation
- Memory usage (in-memory) and Redis client health
