# Event Architecture

**Document Type**: Cross-Cutting Architecture
**Mission**: Define the canonical event system for Perionyx — event taxonomy, structure, routing, storage, replay, versioning, delivery guarantees, and real-time propagation — ensuring business domains communicate through vendor-neutral, tenant-scoped, auditable events.
**Status**: Partially Built (workflow events, connector events, real-time bus, procurement 63 events)
**Constitutional Authority**: PLATFORM_CONSTITUTION.md — Law 14 ("Events Are Vendor-Neutral"), Law 11 ("Tenant Isolation Is Absolute"), Law 5 ("Every External Dependency Is Observable")

---

## Responsibilities

1. **Event Taxonomy** — Categorize events as domain, integration, or system events with consistent structure.
2. **Event Structure** — Standardized event envelope with id, type, timestamp, tenant, aggregate, payload, and metadata.
3. **Event Routing** — Route events to consumers by type, tenant, and subscription.
4. **Event Storage** — Persist events for replay, audit, and debugging.
5. **Event Replay** — Replay events from a point in time for recovery or debugging.
6. **Event Versioning** — Version event schemas for backward compatibility.
7. **Dead Letter Queue** — Capture and manage events that fail delivery after max retries.
8. **Event Schemas** — Typed event definitions with validation.
9. **Event Consumers** — Register and manage event subscribers.
10. **Event Producers** — Emit events from domain operations.
11. **Event Ordering** — Guarantee per-aggregate event ordering.
12. **Delivery Guarantees** — At-least-once delivery with idempotent consumers.
13. **Real-Time Events** — SSE-based real-time event delivery to connected clients.
14. **Webhook Normalization** — No vendor webhooks leave the Integration Platform directly.

---

## Event Taxonomy

### Event Categories

| Category | Description | Example | Storage |
|---|---|---|---|
| **Domain Event** | Business-significant state change | `invoice.created`, `payment.executed` | Event store |
| **Integration Event** | External system interaction | `plaid.transaction.synced`, `qbo.invoice.pushed` | Event store |
| **System Event** | Infrastructure occurrence | `deployment.completed`, `migration.finished` | Log only |
| **Notification Event** | User-facing notification | `notification.email.sent`, `notification.slack.delivered` | Notification store |
| **Audit Event** | Security/compliance record | `audit.login.success`, `audit.permission.denied` | Audit store |

### Event Namespace Convention

```
{domain}.{entity}.{action}
```

Examples:
- `invoice.created` / `invoice.approved` / `invoice.voided`
- `vendor.created` / `vendor.bank_updated` / `vendor.suspended`
- `payment.proposed` / `payment.executed` / `payment.confirmed`
- `workflow.step.completed` / `workflow.approval.requested`
- `connector.sync.started` / `connector.sync.completed`

---

## Event Structure

### Canonical DomainEvent

```typescript
interface DomainEvent {
  id: string;
  type: string;
  timestamp: Date;
  companyId: string;
  aggregateType: string;
  aggregateId: string;
  actorId: string;
  correlationId: string;
  causationId?: string;
  payload: Record<string, unknown>;
  metadata: {
    version: number;
    source: string;
    traceId?: string;
    idempotencyKey?: string;
  };
}
```

### Envelope Rules

1. `id` — CUID, unique, sort-ordered
2. `companyId` — Mandatory, enables tenant-scoped routing
3. `correlationId` — Mandatory, links related events across services
4. `aggregateId` — Mandatory, enables per-aggregate ordering
5. `metadata.version` — Schema version for forward compatibility
6. `metadata.idempotencyKey` — Optional, enables deduplication

### Event Construction (AP Domain)

```typescript
// Source: src/server/procurement/domain/events/event-types.ts
function makeEvent(
  eventType: string,
  aggregateType: string,
  aggregateId: string,
  companyId: string,
  actorId: string,
  correlationId: string,
  payload: Record<string, unknown>,
): DomainEvent {
  return {
    eventType, companyId, aggregateType, aggregateId,
    actorId, timestamp: new Date(), payload, correlationId,
  };
}
```

---

## Event Routing

### Routing Architecture

```
Producer
  -> EventBus
    -> Route by type (domain / integration / system)
      -> Route by tenant (companyId)
        -> Filter by subscription pattern
          -> Deliver to Consumer
            -> Acknowledge or Dead Letter
```

### Routing Rules

| Rule | Description |
|---|---|
| **Type routing** | Consumers subscribe by event type pattern |
| **Tenant scoping** | Events delivered only to tenant-scoped consumers |
| **Wildcard routing** | `invoice.*` matches all invoice events |
| **Priority routing** | High-priority events processed before low-priority |

### Active Event Buses

| Bus | Location | Purpose | Status |
|---|---|---|---|
| **AP Domain Bus** | `src/server/procurement/domain/events/event-bus.ts` | 63 AP domain events | Built |
| **Workflow Events** | `src/modules/workflow/events/` | Workflow lifecycle events | Built |
| **Connector Events** | `src/modules/connector-platform/event-hooks.ts` | Connector state changes | Built |
| **Real-Time Bus** | `src/server/realtime/event-bus.ts` | SSE/WebSocket delivery | Built |

**Note**: 6 legacy event buses were consolidated into 2 in Phase 18.1A. The AP Domain Bus and Real-Time Bus are the canonical implementations.

---

## Event Storage

### Event Store Schema

```typescript
interface EventRecord {
  id: string;
  type: string;
  timestamp: Date;
  companyId: string;
  aggregateType: string;
  aggregateId: string;
  actorId: string;
  correlationId: string;
  causationId?: string;
  payload: JsonValue;
  metadata: JsonValue;
  version: number;
  createdAt: Date;
}
```

### Storage Strategy

| Aspect | Strategy |
|---|---|
| Primary store | PostgreSQL via Prisma |
| Index | `(companyId, type, timestamp)` for tenant queries |
| Index | `(aggregateType, aggregateId, timestamp)` for replay |
| Retention | Per-tenant (default 7 years) |
| Partitioning | By `companyId` for query isolation |
| Archival | Cold storage after retention period |

---

## Event Replay

### Replay API

```typescript
interface EventReplayService {
  replayAggregate(aggregateType: string, aggregateId: string, from?: Date): Promise<DomainEvent[]>;
  replayTenant(companyId: string, from: Date, to?: Date): Promise<DomainEvent[]>;
  replayAll(from: Date, to?: Date): Promise<DomainEvent[]>;
}
```

### Replay Scenarios

| Scenario | Scope | Method |
|---|---|---|
| Debugging | Single aggregate | Replay from aggregateId + timestamp |
| Recovery | Single tenant | Replay from companyId + timestamp |
| Migration | All tenants | Replay from timestamp |
| Audit | Tenant + date range | Query event store |

---

## Event Versioning

### Schema Versioning Rules

| Change Type | Version Bump | Compatibility |
|---|---|---|
| Add optional payload field | Minor (1.1) | Backward compatible |
| Add required payload field | Major (2.0) | Breaking change |
| Rename field | Major (2.0) | Breaking change |
| Remove field | Major (2.0) | Breaking change |
| Change field type | Major (2.0) | Breaking change |

### Version Field

```typescript
metadata: {
  version: number;  // 1, 2, 3... monotonically increasing
}
```

Consumers must handle unknown fields gracefully. Producers must not remove fields without a major version bump.

---

## Dead Letter Queue

### Dead Letter Policy

| Aspect | Policy |
|---|---|
| Max retries | 6 (exponential backoff: immediate, 30s, 2min, 15min, 1hr, 4hr) |
| After max retries | Moved to dead letter queue |
| Dead letter retention | 30 days |
| Alert | On any event entering dead letter |
| Manual action | Developer inspects and retries or discards |

### Dead Letter Event

```typescript
interface DeadLetterEvent {
  originalEvent: DomainEvent;
  attempts: number;
  lastError: string;
  lastAttemptAt: Date;
  deadLetteredAt: Date;
  consumerId: string;
}
```

---

## Event Consumers

### Consumer Registration

```typescript
interface EventConsumer {
  id: string;
  eventPattern: string;       // "invoice.*" or "invoice.created"
  companyId?: string;         // Tenant scope (optional for system consumers)
  handler: (event: DomainEvent) => Promise<void>;
  maxConcurrency?: number;    // Default 1
  batchSize?: number;         // Default 1
}
```

### Consumer Patterns

| Pattern | Description | Example |
|---|---|---|
| **Single consumer** | One handler per event type | Audit logger |
| **Fan-out** | Multiple handlers per event type | Notify + Update dashboard |
| **Aggregator** | Collect events, process batch | Analytics aggregation |
| **Transformer** | Transform event into new event | Normalize vendor event |
| **Filter** | Process only matching events | Only high-value invoices |

---

## Exactly-Once Delivery

### Strategy: At-Least-Once + Idempotent Consumers

1. **Producer**: Includes `idempotencyKey` in event metadata
2. **Consumer**: Checks `idempotencyKey` before processing
3. **Deduplication**: Consumer stores processed keys (TTL: 24 hours)
4. **Result**: Effectively exactly-once for idempotent operations

### Idempotency Key Structure

```
{companyId}:{aggregateId}:{eventType}:{timestamp}
```

---

## Real-Time Events (SSE)

### Architecture

```
Domain Event -> Real-Time Bus -> SSE Manager -> Connected Clients
```

### SSE Implementation

| Component | Location | Purpose |
|---|---|---|
| `SSEManager` | `src/server/realtime/sse-manager.ts` | Manage SSE connections |
| `EventBus` | `src/server/realtime/event-bus.ts` | Route events to SSE |
| `types.ts` | `src/server/realtime/types.ts` | SSE type definitions |

### SSE Event Format

```
event: invoice.created
data: {"id":"evt_123","type":"invoice.created","companyId":"company_abc",...}

event: invoice.approved
data: {"id":"evt_456","type":"invoice.approved","companyId":"company_abc",...}
```

### Client Connection

```
GET /api/events/stream
  -> SSE connection established
  -> Client receives events scoped to companyId
  -> Connection closed on logout or timeout
```

---

## Webhook Normalization (Constitution Law 14)

### Rule

> No vendor webhook leaves the Integration Platform directly. Every external event is normalized into canonical Perionyx events before propagating.

### Flow

```
External Webhook (Plaid, QuickBooks, etc.)
  -> Integration Platform (src/server/integrations/)
    -> Validate signature
      -> Normalize to canonical event type
        -> Emit DomainEvent
          -> Business domains consume canonical events
```

### Normalization Examples

| External Event | Canonical Event |
|---|---|
| `plaid.TRANSACTIONS_ADDED` | `transaction.synced` |
| `qbo.INVOICE_CREATED` | `invoice.received` |
| `stripe.PAYMENT_SUCCEEDED` | `payment.confirmed` |
| `fedbank.STATEMENT_READY` | `statement.received` |

---

## Observability

### Metrics

| Metric | Type | Labels |
|---|---|---|
| `event_emitted_total` | Counter | type, source, company_id |
| `event_consumed_total` | Counter | type, consumer_id, status |
| `event_latency_ms` | Histogram | type |
| `event_dead_letter_total` | Counter | type, consumer_id |
| `event_replay_total` | Counter | scope |
| `event_ordering_violation_total` | Counter | aggregate_type |
| `event_deduplication_total` | Counter | type |
| `sse_connections_active` | Gauge | company_id |
| `sse_events_delivered_total` | Counter | type |
| `sse_delivery_latency_ms` | Histogram | type |

---

## Rate Limiting

| Operation | Limit | Window |
|---|---|---|
| Event emission | 10,000/sec | Global |
| Event consumption | 1,000/sec per consumer | Per consumer |
| SSE connections | 100 per tenant | Per tenant |
| Event replay | 10/hour per tenant | Per tenant |

---

## Retry Policy

| Operation | Max Retries | Backoff |
|---|---|---|
| Event delivery to consumer | 6 | Exponential: 0s, 30s, 2min, 15min, 1hr, 4hr |
| SSE reconnection | Infinite | Exponential: 1s, 2s, 4s, max 30s |
| Dead letter retry | Manual | Developer-triggered |

---

## Caching

| Data | TTL | Scope |
|---|---|---|
| Consumer subscriptions | Static (session) | Per consumer |
| Deduplication keys | 24 hours | Per idempotencyKey |
| SSE connection state | Session lifetime | Per connection |

---

## Versioning

| Aspect | Strategy |
|---|---|
| Event schemas | Semantic versioning (major.minor) |
| Event bus API | Backward compatible additions |
| SSE protocol | Stable; new event types additive |
| Webhook payloads | Versioned in `metadata.version` |

---

## Lifecycle

### Event Lifecycle

```
Produced -> Routed -> Delivered -> Consumed -> Acknowledged
                          |                       |
                          v                       v
                    Failed (retry)         Dead Letter (after max retries)
```

### Consumer Lifecycle

```
Registered -> Subscribing -> Active -> Paused -> Retired
```

---

## Extension Model

### Adding a New Event Type

1. **Define** event type string (e.g., `credit_note.created`)
2. **Add** typed constructor in domain event-types file
3. **Emit** event from domain service after state change
4. **Register** consumers that need to react
5. **Document** payload schema
6. **Add** to event catalog

### Adding a New Event Consumer

1. **Implement** handler function
2. **Register** with event pattern and tenant scope
3. **Test** with sample events
4. **Monitor** via consumer metrics

---

## Known Issues (Phase 18.0)

### Multiple Event Bus Implementations

The codebase historically had 6 independent event bus implementations with identical `Map<EventType, Set<Handler>>` architecture. Phase 18.1A consolidated to 2 active buses. The AP Domain Bus (`src/server/procurement/domain/events/event-bus.ts`) and Real-Time Bus (`src/server/realtime/event-bus.ts`) are the canonical implementations.

---

## Testing Strategy

| Test Type | Scope |
|---|---|
| Unit | Event construction, routing, versioning |
| Integration | End-to-end event flow (produce -> route -> consume) |
| Ordering | Per-aggregate ordering guarantee |
| Dead letter | Failed delivery -> retry -> dead letter |
| Deduplication | Idempotent consumer behavior |
| SSE | Connection, event delivery, reconnection |
| Replay | Aggregate and tenant replay accuracy |

---

## Failure Modes

| Failure | Impact | Mitigation |
|---|---|---|
| Consumer crash | Events unprocessed | Retry with exponential backoff |
| Event bus crash | Events lost | Persisted event store for replay |
| SSE disconnect | Client stale | Auto-reconnect with backoff |
| Ordering violation | Inconsistent state | Per-aggregate ordering guarantee |
| Duplicate delivery | Side effects | Idempotent consumer pattern |
| Dead letter accumulation | Storage growth | Alert + manual cleanup |

---

## Key Source Files

| File | Purpose |
|---|---|
| `src/server/procurement/domain/events/event-bus.ts` | AP domain event bus |
| `src/server/procurement/domain/events/event-types.ts` | 63 typed AP event constructors |
| `src/server/procurement/domain/events/index.ts` | Barrel export |
| `src/modules/workflow/events/` | Workflow lifecycle events |
| `src/modules/connector-platform/event-hooks.ts` | Connector state events |
| `src/server/realtime/event-bus.ts` | Real-time event bus for SSE |
| `src/server/realtime/sse-manager.ts` | SSE connection management |
| `src/server/realtime/types.ts` | Real-time type definitions |

---

*The Event Architecture is the nervous system of Perionyx. Every state change is an event. Every event is typed, tenant-scoped, ordered, and auditable.*
