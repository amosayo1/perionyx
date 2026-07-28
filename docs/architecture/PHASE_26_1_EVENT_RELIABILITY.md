# Phase 26.1 — Event Reliability Report

**Date**: 2026-07-27

## Event Bus Architecture

### AP Domain Event Bus (`procurement/domain/events/event-bus.ts`)
- **Purpose**: In-process typed events within a unit of work transaction
- **Pattern**: Modular monolith — typed function calls, no message queue
- **Persistence**: None needed — events are transactional, not durable
- **Changes**: Added error isolation, Pino logging, bounded history, metrics

### Realtime Event Bus (`realtime/event-bus.ts`)
- **Purpose**: Cross-instance real-time notifications
- **Pattern**: In-memory fan-out + Redis Pub/Sub bridge
- **Persistence**: Redis Pub/Sub (best-effort, not durable)
- **Status**: Production-ready with graceful Redis degradation

### PgBoss Queue (`modules/queue/queue.service.ts`)
- **Purpose**: Durable background job processing
- **Pattern**: DB-backed queue with workers
- **Persistence**: Postgres via PgBoss
- **Status**: Production-ready for async workloads

## Changes

1. **Error isolation**: Each handler wrapped in try/catch — failure logged, doesn't propagate
2. **Bounded history**: Max 1K events with automatic eviction of oldest
3. **Metrics**: `getMetrics()` returns published count, error count, history size, handler count
4. **Structured logging**: All events logged with module context via Pino
