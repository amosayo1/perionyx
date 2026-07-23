# Configuration

## Overview

The infrastructure configuration system provides typed, mergeable, environment-aware configuration for persistence, cache, locks, queues, and observability.

## Configuration Structure

```typescript
interface InfrastructureConfig {
  persistence: PersistenceConfig;   // provider, migrations, health
  cache: CacheConfig;               // TTL, size, provider, redis
  locks: LockConfig;                // TTL, retry, provider
  queues: QueueConfig;              // concurrency, retries, timeout
  observability: {                  // metrics, tracing, health
    metrics: { enabled: boolean };
    tracing: { enabled: boolean; maxTraces: number };
    health: { enabled: boolean; intervalMs: number };
  };
}
```

## Defaults

All components have sensible defaults for local development:
- Cache: in-memory, 60s TTL, 10k max entries
- Locks: in-memory, 30s TTL, 3 retries with exponential backoff
- Queues: in-memory, 5 workers, 3 retries, 2min timeout
- Observability: all enabled

## Environment Variables

| Variable | Effect |
|---|---|
| `CACHE_PROVIDER` | `memory` or `redis` |
| `REDIS_HOST` / `REDIS_PORT` / `REDIS_PASSWORD` | Redis connection |
| `LOCK_PROVIDER` | `memory` or `redis` |
| `PERSISTENCE_PROVIDER` | `memory`, `postgres`, `mysql`, or `sqlite` |

## Programmatic Usage

```typescript
// Initialize with defaults + env overrides
await initializeInfrastructure();

// Initialize with explicit config
await initializeInfrastructure({
  cache: { defaultTtlMs: 30000, maxSize: 5000 },
  locks: { defaultTtlMs: 15000 },
});

// Get current config
const config = getInfrastructureConfig();

// Update at runtime
updateInfrastructureConfig({
  cache: { defaultTtlMs: 120000 },
});

// Reset to defaults
resetInfrastructureConfig();
```
