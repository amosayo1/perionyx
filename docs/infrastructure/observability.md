# Observability

## Overview

The observability layer provides metrics, tracing, and health monitoring for the entire infrastructure. It is designed for production use with zero external dependencies (self-contained implementations).

## Metrics

The `MetricsRegistry` provides three metric types:

| Type | Interface | Use Case |
|---|---|---|
| `Counter` | `inc() / add(n) / get() / reset()` | Request counts, error counts |
| `Gauge` | `set(n) / inc() / dec() / get()` | Memory, queue depth, active connections |
| `Histogram` | `observe(n) / get() → snapshot` | Latency, duration, size distribution |

Histogram snapshots include `count`, `sum`, `min`, `max`, `avg`, `p50`, `p95`, `p99`.

### Standard Metric Names

| Metric | Type | Description |
|---|---|---|
| `cache.hit` | Counter | Cache hits |
| `cache.miss` | Counter | Cache misses |
| `cache.set` | Counter | Cache sets |
| `cache.eviction` | Counter | Cache evictions |
| `cache.latency` | Histogram | Cache operation latency |
| `trace.span.duration` | Histogram | Trace span durations |

## Tracing

The `Tracer` provides span-based distributed tracing:

```typescript
const tracer = createTracer();
const result = await tracer.trace("update-fx", async () => {
  // traced operation
  const span = tracer.startSpan("fetch-rates");
  // ... work ...
  tracer.endSpan(span);
});
```

Recent traces are kept in a ring buffer (configurable, default 1000).

## Health Monitoring

The `HealthRegistry` manages named health checks:

```typescript
registerHealthCheck("cache", async () => ({
  status: "healthy",
  component: "cache",
  latencyMs: 5,
  lastChecked: new Date(),
}));

const report = await getHealthReport();
// { status, checks[], healthy, degraded, unhealthy, total, timestamp }
```

### Standard Health Checks

| Check | Component | Degradation Criteria |
|---|---|---|
| `cache` | CacheManager | Redis unavailable (falls to memory) |
| `memory` | process.memoryUsage | Heap > 90% (degraded), > 95% (unhealthy) |
| `uptime` | Process | Always healthy |
| `queues` | QueueManager | > 100 dead-letter or > 1000 failures |
| `persistence` | PersistenceHealth | Provider reports degraded/unhealthy |

## Infrastructure Facade

`initializeInfrastructure()` wires all components together:
1. Loads configuration from environment
2. Creates default queues
3. Starts queue workers
4. Registers standard health checks

`shutdownInfrastructure()` drains queues and stops workers gracefully.
