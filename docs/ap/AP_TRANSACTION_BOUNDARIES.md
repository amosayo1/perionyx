# AP Transaction Boundaries

> **Phase 21A.2** — Unit of Work Pattern  
> File: `src/server/procurement/application/unit-of-work.ts` (58 lines)

---

## Purpose

The Unit of Work pattern ensures that all database writes within a single command are atomic. Either all changes persist, or none do. Domain events are published only after successful commit.

---

## Implementation

### `executeUnitOfWork<T>()`

```typescript
export async function executeUnitOfWork<T>(
  operation: TransactionalOperation<T>,
): Promise<UnitOfWorkResult<T>> {
  const result = await prisma.$transaction(async (tx) => {
    return operation(tx as unknown as PrismaClient);
  });

  // Post-commit: publish domain events
  if (result.events.length > 0) {
    await apEventBus.publishAll(result.events);
  }

  return result;
}
```

### Types

```typescript
export interface UnitOfWorkResult<T> {
  data: T;
  events: DomainEvent[];
  auditEntries: AuditEntry[];
}

export type TransactionalOperation<T> = (
  tx: PrismaClient,
) => Promise<{ data: T; events: DomainEvent[]; auditEntries: AuditEntry[] }>;
```

### Helper

```typescript
export function unitOfWorkResult<T>(
  data: T,
  events: DomainEvent[] = [],
  auditEntries: AuditEntry[] = [],
): { data: T; events: DomainEvent[]; auditEntries: AuditEntry[] } {
  return { data, events, auditEntries };
}
```

---

## Execution Flow

```
API Route
  └─ executeUnitOfWork(async (tx) => {
       // 1. Load aggregate via tx (interactive transaction)
       const vendor = await repos.vendor.findById(id, companyId);

       // 2. Apply business rules
       vendor.status = "ACTIVE";

       // 3. Save via tx
       await repos.vendor.save(vendor);

       // 4. Collect domain events
       const events = [vendorEvents.approved(id, { ... })];

       // 5. Collect audit entries
       const audits = [audit("vendor.approved", id, ctx, { ... })];

       // 6. Return — committed atomically
       return unitOfWorkResult(vendor, events, audits);
     })
  └─ After commit: apEventBus.publishAll(result.events)
  └─ Return result to caller
```

---

## Atomicity Guarantees

| Scenario | Behavior |
|---|---|
| All writes succeed | Transaction commits; events published post-commit |
| Any write fails | Transaction rolls back; all writes discarded; events never published |
| Event handler throws | Event handler failure does **not** roll back the transaction (events published after commit) |
| DB connection drops | Prisma rolls back automatically; `executeUnitOfWork` propagates the error |

---

## What's Inside the Transaction

The transaction boundary wraps **all repository writes** for a single command:

- Aggregate state changes (e.g., `vendor.status = "ACTIVE"`)
- Child entity writes (e.g., `invoice.saveLineItems()`)
- Related aggregate updates (e.g., `invoice.balanceDue` updated during credit application)
- Audit record persistence (via `repos.audit.save()` or `repos.audit.saveBatch()`)

## What's Outside the Transaction

- **Domain event dispatch**: Published after commit via `apEventBus.publishAll()`
- **Notification delivery**: Async (email, Slack) triggered by event subscribers
- **External API calls**: Never inside the transaction (payment gateway, bank API)

---

## Event Publication Timing

Events are published **post-commit**, not inside the transaction. This ensures:

1. Subscribers never see events for rolled-back transactions
2. Subscribers can safely read the committed data
3. Event handler failures don't affect transaction atomicity

```
Transaction: BEGIN → writes → COMMIT
                                      ↓
                              publishAll(events)
                                      ↓
                              handlers execute
                              (notification, analytics, etc.)
```

---

## Audit Persistence

Audit entries are persisted **within** the transaction (not post-commit), ensuring:

- Audit trail is always consistent with the state change
- If the transaction rolls back, no orphaned audit records exist
- Audit and state change are atomically visible

---

## Usage Pattern in Application Services

Application services return `CommandResult<T>` which carries events and audit entries. The transaction wrapper collects these:

```typescript
// In a command handler (conceptual)
const result = await executeUnitOfWork(async (tx) => {
  const service = new VendorApplicationService(repos);
  const cmdResult = await service.createVendor(cmd, ctx);

  if (!cmdResult.success) {
    throw new Error(cmdResult.error!.message); // triggers rollback
  }

  // Persist audit within transaction
  for (const audit of cmdResult.auditEntries) {
    await repos.audit.save(audit);
  }

  return unitOfWorkResult(cmdResult.data!, cmdResult.events, cmdResult.auditEntries);
});
```

---

## Failure Modes

| Failure | Effect |
|---|---|
| Prisma unique constraint violation | Transaction rolls back; `CONFLICT` error returned |
| Optimistic locking conflict | Transaction rolls back; `VERSION_CONFLICT` error returned |
| Foreign key violation | Transaction rolls back; `VALIDATION_ERROR` returned |
| Network timeout | Transaction rolls back after Prisma timeout (default 5s) |
| Application error (thrown) | Transaction rolls back; error propagated to caller |

---

## Testing

For unit tests, the transaction boundary is replaced by direct repository calls:

```typescript
// In tests — no transaction needed
const repos = createInMemoryRepos();
const service = new VendorApplicationService(repos);
const result = await service.createVendor(cmd, ctx);
// Events and audits are in result.events and result.auditEntries
```
