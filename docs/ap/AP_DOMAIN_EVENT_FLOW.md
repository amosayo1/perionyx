# AP Domain Event Flow

> **Phase 21A.2** — Event Infrastructure  
> 63 events across 7 categories  
> In-process, typed, synchronous dispatch with post-commit publication

---

## Event Bus

**File**: `src/server/procurement/domain/events/event-bus.ts` (73 lines)

The `APDomainEventBus` is a singleton, in-process event dispatcher. It uses a `Map<string, Set<EventHandler>>` for O(1) handler lookup.

### API

| Method | Description |
|---|---|
| `subscribe(eventType, handler)` | Register handler for a specific event type. Returns unsubscribe function. |
| `subscribeAll(handler)` | Register handler for all event types. Returns unsubscribe function. |
| `publish(event)` | Dispatch event to all registered handlers (async, sequential). |
| `publishAll(events)` | Dispatch array of events sequentially. |
| `getHistory(aggregateId?)` | Return event history (optionally filtered by aggregate). |
| `clear()` | Clear event history. |
| `dispose()` | Clear all handlers and history. |

### Wildcard Subscription

Handlers can subscribe to `"*"` to receive all events:

```typescript
apEventBus.subscribe("*", (event) => {
  console.log(`[${event.eventType}] ${event.aggregateType}:${event.aggregateId}`);
});
```

### History Tracking

Every published event is appended to an in-memory ring buffer (`history: DomainEvent[]`). This provides:

- Audit trail for debugging
- Event replay for testing
- Aggregate event timeline via `getHistory(aggregateId)`

---

## Event Constructors

**File**: `src/server/procurement/domain/events/event-types.ts` (207 lines)

All 63 events are constructed via typed factory functions grouped by aggregate:

### Vendor Events (8)

| Constructor | Event Type | Payload |
|---|---|---|
| `vendorEvents.created` | `vendor.created` | vendorCode, category |
| `vendorEvents.updated` | `vendor.updated` | changedFields[] |
| `vendorEvents.approved` | `vendor.approved` | riskLevel, riskScore |
| `vendorEvents.rejected` | `vendor.rejected` | reason |
| `vendorEvents.suspended` | `vendor.suspended` | reason |
| `vendorEvents.reactivated` | `vendor.reactivated` | — |
| `vendorEvents.deactivated` | `vendor.deactivated` | reason |
| `vendorEvents.bankUpdated` | `vendor.bank_updated` | previousBankLast4, newBankLast4 |

### Invoice Events (14)

| Constructor | Event Type | Payload |
|---|---|---|
| `invoiceEvents.captured` | `invoice.captured` | vendorId, amount, currency, source |
| `invoiceEvents.updated` | `invoice.updated` | changedFields[] |
| `invoiceEvents.voided` | `invoice.voided` | reason, previousState |
| `invoiceEvents.validated` | `invoice.validated` | — |
| `invoiceEvents.validationFailed` | `invoice.validation_failed` | errors[] |
| `invoiceEvents.matched` | `invoice.matched` | matchId, matchType, totalVariance |
| `invoiceEvents.matchException` | `invoice.match.exception` | matchId |
| `invoiceEvents.matchOverride` | `invoice.match.override` | matchId, reason |
| `invoiceEvents.blocked` | `invoice.blocked` | blockType, reason |
| `invoiceEvents.unblocked` | `invoice.unblocked` | previousState |
| `invoiceEvents.disputed` | `invoice.disputed` | disputeReason |
| `invoiceEvents.disputeResolved` | `invoice.dispute_resolved` | resolution |
| `invoiceEvents.paymentScheduled` | `invoice.payment.scheduled` | proposalId |

### Exception Events (5)

| Constructor | Event Type | Payload |
|---|---|---|
| `exceptionEvents.created` | `exception.created` | invoiceId, type, severity |
| `exceptionEvents.assigned` | `exception.assigned` | assignedTo |
| `exceptionEvents.resolved` | `exception.resolved` | resolution |
| `exceptionEvents.escalated` | `exception.escalated` | reason |
| `exceptionEvents.bulkResolved` | `exception.bulk_resolved` | count, exceptionIds[] |

### Approval Events (7)

| Constructor | Event Type | Payload |
|---|---|---|
| `approvalEvents.created` | `approval.created` | invoiceId, levels |
| `approvalEvents.levelDecided` | `approval.level.decided` | level, decision |
| `approvalEvents.chainApproved` | `approval.chain.approved` | invoiceId |
| `approvalEvents.chainRejected` | `approval.chain.rejected` | invoiceId |
| `approvalEvents.delegated` | `approval.delegated` | level, delegatedTo |
| `approvalEvents.escalated` | `approval.level.escalated` | level, reason |
| `approvalEvents.recalled` | `approval.recalled` | level, reason |

### Payment Events (9)

| Constructor | Event Type | Payload |
|---|---|---|
| `paymentEvents.proposalGenerated` | `proposal.generated` | invoiceCount, totalAmount |
| `paymentEvents.proposalReviewed` | `proposal.reviewed` | — |
| `paymentEvents.proposalApproved` | `proposal.approved` | totalAmount |
| `paymentEvents.proposalRejected` | `proposal.rejected` | reason |
| `paymentEvents.batchCreated` | `batch.created` | proposalId, paymentCount, totalAmount |
| `paymentEvents.submitted` | `payment.submitted` | vendorId, amount, method |
| `paymentEvents.confirmed` | `payment.confirmed` | bankReference, amount |
| `paymentEvents.reversed` | `payment.reversed` | reason, amount |
| `paymentEvents.cancelled` | `payment.cancelled` | reason |

### Reconciliation Events (4)

| Constructor | Event Type | Payload |
|---|---|---|
| `reconciliationEvents.imported` | `reconciliation.imported` | vendorId, period, lineCount |
| `reconciliationEvents.matched` | `reconciliation.matched` | matchedCount, discrepancyCount, variance |
| `reconciliationEvents.adjusted` | `reconciliation.adjusted` | adjustmentCount, totalAdjustment |
| `reconciliationEvents.completed` | `reconciliation.completed` | vendorId, period, finalVariance |

### Credit Events (4)

| Constructor | Event Type | Payload |
|---|---|---|
| `creditEvents.received` | `credit.received` | vendorId, creditAmount, creditNumber |
| `creditEvents.applied` | `credit.applied` | totalApplied, applicationCount |
| `creditEvents.partiallyApplied` | `credit.partially_applied` | totalApplied, remaining |
| `creditEvents.voided` | `credit.voided` | reason, reversedAmount |

---

## Event Structure

Every event follows the `DomainEvent` interface:

```typescript
interface DomainEvent {
  eventType: string;          // "vendor.created"
  companyId: string;          // tenant isolation
  aggregateType: string;      // "Vendor"
  aggregateId: string;        // UUID
  actorId: string;            // userId
  timestamp: Date;            // creation time
  payload: Record<string, unknown>;  // event-specific data
  correlationId: string;      // distributed tracing
}
```

### Naming Convention

Event types use `{aggregate}.{action}` format:

| Pattern | Example |
|---|---|
| `{entity}.created` | `vendor.created` |
| `{entity}.updated` | `invoice.updated` |
| `{entity}.{past_tense}` | `invoice.voided` |
| `{entity}.{noun}.{past_tense}` | `invoice.matched` |
| `{entity}.{noun}.{action}` | `invoice.match.exception` |

---

## Subscriber Pattern

### Subscribing

```typescript
import { apEventBus } from "../domain/events/event-bus";

// Subscribe to specific event type
const unsubscribe = apEventBus.subscribe("invoice.captured", async (event) => {
  await sendNotification(event.companyId, `New invoice captured: ${event.aggregateId}`);
});

// Later: unsubscribe
unsubscribe();
```

### Subscribing to All Events

```typescript
const unsubscribe = apEventBus.subscribeAll(async (event) => {
  await analyticsService.track(event.eventType, event.payload);
});
```

### Unsubscribe

Every `subscribe` and `subscribeAll` call returns an unsubscribe function. This prevents memory leaks in long-running processes and enables clean test teardown.

---

## Event Publication Timing

Events are published **after** the Prisma transaction commits:

```
executeUnitOfWork:
  1. BEGIN TRANSACTION
  2. Execute command handler (collect events in memory)
  3. COMMIT TRANSACTION
  4. apEventBus.publishAll(events)  ← post-commit
```

This ensures:
- Subscribers never see events for rolled-back transactions
- Subscribers can safely read committed data
- Event handler failures don't affect transaction atomicity

---

## Barrel Export

**File**: `src/server/procurement/domain/events/index.ts`

```typescript
export { apEventBus } from "./event-bus";
export { vendorEvents, invoiceEvents, exceptionEvents, approvalEvents,
         paymentEvents, reconciliationEvents, creditEvents } from "./event-types";
```

---

## Future Considerations

| Concern | Current State | Future State |
|---|---|---|
| Event persistence | In-memory only | Event store (Prisma table) |
| Event replay | Manual via `getHistory()` | Projection rebuild |
| Cross-process events | Not supported | Message queue (PgBoss) |
| Event versioning | Single version | Schema versioning per event type |
