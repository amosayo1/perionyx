# Infrastructure Layer Documentation

## Overview

Phase 7E.3 provides production-grade infrastructure for the enterprise platform. It covers caching, distributed locks, queue persistence, observability, and health monitoring — all designed for financial data workloads.

## Documentation Map

| Document | Description |
|---|---|
| `cache-architecture.md` | Cache layer design, TTL tiers, key namespacing, Redis integration |
| `distributed-locks.md` | Distributed lock system, hierarchical locking, error handling |
| `queue-persistence.md` | Queue system, types, default queues, worker pattern, dead-letter |
| `observability.md` | Metrics, tracing, health monitoring, infrastructure facade |
| `configuration.md` | Configuration system, environment variables, programmatic API |
| `performance-benchmarking.md` | Performance targets, benchmarking methodology, optimization |
| `integration-guide.md` | Quick start, gradual adoption patterns, migration guide |

## File Map

```
src/server/
├── cache/
│   ├── cache-config.ts        — Tiered TTL configuration
│   ├── cache-keys.ts          — Namespaced key builder
│   ├── cache-utils.ts         — Serialization helpers
│   ├── cache-metrics.ts       — Hit/miss tracking
│   ├── cache-events.ts        — Typed event bus
│   ├── redis-provider.ts      — ioredis wrapper
│   ├── cache-manager.ts       — Facade with memory + Redis
│   ├── cache-health.ts        — Health report
│   └── index.ts               — Barrel export
├── locks/
│   ├── types.ts                — Lock interfaces
│   ├── lock-errors.ts          — Error types
│   ├── redis-lock.ts           — Redis + in-memory lock manager
│   ├── lock-manager.ts         — Facade with withLock helper
│   └── index.ts                — Barrel export
├── queues/
│   ├── types.ts                — Queue interfaces
│   ├── queue-errors.ts         — Error types
│   ├── memory-queue.ts         — In-memory queue implementation
│   ├── queue-manager.ts        — Manager with workers, polling
│   ├── default-queues.ts       — 8 default queue configs
│   └── index.ts                — Barrel export
├── observability/
│   ├── metrics.ts              — Counter, Gauge, Histogram
│   ├── tracing.ts              — Span-based tracing
│   ├── health.ts               — Health check registry
│   ├── health-checks.ts        — Standard health checks
│   └── index.ts                — Barrel export
├── persistence/
│   └── config.ts               — Infrastructure config
└── infrastructure.ts           — Top-level facade
```
