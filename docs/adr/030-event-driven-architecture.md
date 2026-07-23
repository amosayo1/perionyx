# ADR-030: Event-Driven Architecture via Internal Event Bus

**Status**: Ratified
**Date**: July 2026
**Author**: Architecture Team

## Context

The platform has 56 business modules that need to react to state changes in other modules without creating tight coupling. For example:
- When a transaction is approved, the Ledger module needs to post it
- When a journal is posted, the Reporting module needs to update metrics
- When a risk alert is created, the Notifications module needs to send alerts
- When a sync completes, the Treasury module needs to refresh cash positions

Direct module-to-module calls create circular dependencies, make testing difficult, and prevent the system from reacting asynchronously to events.

## Problem

How do we enable decoupled communication between 56 modules without creating circular dependencies or requiring every module to know about every other module?

## Decision

Implement an **internal event bus** for asynchronous, decoupled communication between modules. PgBoss queues handle the durable delivery, while a typed event registry defines the contract.

### Event Bus Architecture

```
┌──────────┐     ┌──────────────┐     ┌──────────┐
│ Module A │────>│ Internal Bus │────>│ Module B │
│ (Emitter)│     │  (PgBoss)    │     │ (Handler)│
└──────────┘     └──────────────┘     └──────────┘
```

### Event Registry

All events are defined in a central registry with typed payloads:

```typescript
// Platform-wide event types
interface PlatformEvents {
  "transaction.created": { transactionId: string; companyId: string; amount: number; currency: string };
  "transaction.approved": { transactionId: string; approverId: string; companyId: string };
  "transaction.rejected": { transactionId: string; approverId: string; reason?: string; companyId: string };
  "journal.posted": { journalId: string; companyId: string; period: string };
  "reconciliation.completed": { reconciliationId: string; companyId: string; status: string };
  "risk.alert.created": { alertId: string; companyId: string; severity: string; type: string };
  "sync.completed": { connectorId: string; companyId: string; recordsProcessed: number };
  "approval.matched": { ruleId: string; transactionId: string; approverId: string; companyId: string };
  "workflow.completed": { workflowId: string; runId: string; companyId: string };
  "user.login": { userId: string; companyId: string; ip: string };
}
```

### Event Bus Interface

```typescript
interface IEventBus {
  emit<K extends keyof PlatformEvents>(event: K, payload: PlatformEvents[K]): Promise<void>;
  on<K extends keyof PlatformEvents>(event: K, handler: EventHandler<PlatformEvents[K]>): void;
  off<K extends keyof PlatformEvents>(event: K, handler: EventHandler<PlatformEvents[K]>): void;
}

type EventHandler<T> = (payload: T) => Promise<void>;
```

### Durable Delivery

Events are delivered through PgBoss queues:

```typescript
// Emit → PgBoss job
class PgBossEventBus implements IEventBus {
  async emit<K extends keyof PlatformEvents>(event: K, payload: PlatformEvents[K]): Promise<void> {
    await queueManager.enqueue("events", {
      type: "event",
      event,
      payload,
      correlationId: generateCorrelationId(),
      timestamp: new Date().toISOString(),
    });
  }
}
```

### Handler Registration

Modules register handlers at startup:

```typescript
// In LedgerModule initialization
eventBus.on("transaction.approved", async (payload) => {
  await ledgerService.postJournalForTransaction(payload.transactionId, payload.companyId);
});

// In NotificationsModule initialization
eventBus.on("risk.alert.created", async (payload) => {
  await notificationService.sendRiskAlert(payload.alertId, payload.companyId);
});
```

### Current Implementation

The current event bus is partially implemented. Direct module calls via service facades are still the primary communication pattern. The event bus is used for:

| Event | Emitter | Handler(s) | Status |
|-------|---------|------------|--------|
| `transaction.created` | Transaction module | WorkflowEngine, RiskEngine | Active |
| `sync.completed` | Integrations module | Treasury module | Active |
| `risk.alert.created` | RiskEngine | Notifications module | Active |
| `workflow.completed` | WorkflowEngine | Reporting module | Active |

Remaining events are planned for migration as the event bus matures.

## Alternatives Considered

1. **Direct method calls between all modules**: Rejected — creates circular dependencies; every module must know every other module's API
2. **Apache Kafka**: Rejected — operational overhead unsuitable for current deployment scale; PgBoss provides sufficient throughput with zero additional infrastructure
3. **Redis Pub/Sub**: Rejected — no guaranteed delivery; messages lost on subscriber disconnect
4. **Webhook-based inter-module communication**: Rejected — HTTP overhead for in-process communication; network latency on every event

## Consequences

- **Positive**: Decoupled modules can be developed, tested, and deployed independently
- **Positive**: PgBoss provides durable delivery — no event loss on handler failure
- **Positive**: Typed event registry provides compile-time safety for event payloads
- **Positive**: Events are automatically recorded in the audit trail (via correlation ID)
- **Negative**: Event-driven flow is harder to debug than synchronous call chains
- **Negative**: Eventual consistency means handlers see stale state if they read before the emitter's transaction commits
- **Negative**: Partial adoption creates a hybrid architecture — some flows use events, some use direct calls
- **Negative**: Event schema evolution requires coordination — adding a required field breaks existing handlers

## Future Considerations

- Full migration of all cross-module communication to events
- Event sourcing for critical financial workflows
- Event replay for recovery and debugging
- Dead-letter monitoring for failed event handlers
- Event schema registry with versioning and compatibility checks
