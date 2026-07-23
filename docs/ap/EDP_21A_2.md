# EDP_21A_2 — Engineering Decision Packet

> **Phase 21A.2** — AP Application Layer  
> 10 key decisions with rationale, alternatives, and trade-offs  
> Status: All Accepted

---

## Decision 1: CQRS Command/Query Separation

### Context

The AP domain has distinct read patterns (dashboard queries, report generation, listing) and write patterns (51 state-mutating commands). Mixing them leads to anemic domain models and anemic query APIs.

### Decision

Separate command inputs (typed interfaces in `application/types.ts`) from query outputs (repository `findByFilter` methods). Commands flow through application services; queries flow directly through repository interfaces.

### Rationale

- Commands require validation, state machine checks, and business rule enforcement
- Queries are read-only and can bypass the application service layer
- Separation makes the command count (51) and query count explicit and auditable

### Alternatives Considered

1. **Single service methods with `isRead` flag** — Rejected: couples read/write concerns, harder to optimize independently
2. **Full CQRS with separate read model** — Deferred: premature optimization for current scale; Prisma queries are sufficient
3. **GraphQL subscriptions for real-time queries** — Deferred: not needed for Phase 21A

### Trade-offs

- **Accepted**: Slightly more boilerplate (separate types for commands vs. queries)
- **Mitigated**: Shared `CommandContext` type for both; `PaginatedResult<T>` reused across all queries

### Status: Accepted

---

## Decision 2: In-Process Event Bus (Not Message Queue)

### Context

Domain events need to trigger notifications (email, Slack), analytics updates, and cross-module coordination. The system runs as a modular monolith on a single Node.js process.

### Decision

Use `APDomainEventBus` — an in-process, typed, synchronous event dispatcher. Events are published post-commit via `apEventBus.publishAll()`. No external message queue for AP events.

### Rationale

- Modular monolith architecture: all handlers run in the same process
- Zero infrastructure dependencies (no Redis/RabbitMQ required)
- Synchronous dispatch ensures event handlers complete before request returns
- Post-commit publication prevents stale-read issues

### Alternatives Considered

1. **PgBoss queue for all events** — Rejected: adds latency (polling interval), complexity (worker processes), and is overkill for in-process coordination
2. **Database-backed outbox pattern** — Deferred: needed when scaling to multiple processes; current single-process model is sufficient
3. **Redis Pub/Sub** — Rejected: requires Redis dependency, no delivery guarantees

### Trade-offs

- **Accepted**: Events are lost on process restart (in-memory only)
- **Mitigated**: Critical events (payment, approval) are persisted as audit records; event history can be rebuilt from audit trail
- **Future**: When scaling to multiple processes, migrate to PgBoss or database outbox

### Status: Accepted

---

## Decision 3: Repository Pattern with Interface Segregation

### Context

The AP domain has 10 distinct aggregate roots, each with different persistence needs. Tests need to run without a database.

### Decision

Define 10 focused repository interfaces (`IVendorRepository`, `IInvoiceRepository`, etc.) with both Prisma and InMemory implementations. All services receive `APRepositoryRegistry` (a composite of all 10 interfaces) via constructor injection.

### Rationale

- Interface Segregation: each repository has only the methods its aggregate needs
- Testability: InMemory implementations enable fast unit tests
- Swappability: Prisma implementations can be replaced without changing service code
- Registry pattern: single injection point for all repositories

### Alternatives Considered

1. **Generic repository with `save<T>()` / `findById<T>()`** — Rejected: loses type safety, aggregate-specific queries (e.g., `findApprovedUnscheduled`) can't be expressed generically
2. **Active Record pattern (Prisma model methods directly)** — Rejected: couples business logic to ORM, no test isolation
3. **Single mega-repository for all aggregates** — Rejected: violates SRP, creates god object

### Trade-offs

- **Accepted**: 22 files for the repository layer (high file count)
- **Mitigated**: Barrel export (`index.ts`) provides clean imports; consistent naming convention reduces cognitive load

### Status: Accepted

---

## Decision 4: Unit of Work via Prisma Interactive Transactions

### Context

Commands like credit application and payment confirmation modify multiple aggregates atomically (e.g., update invoice `balanceDue` and credit `appliedAmount` in one transaction).

### Decision

Use `executeUnitOfWork()` which wraps `prisma.$transaction()` (interactive transaction). All repository writes within the callback are atomic. Events are published post-commit.

### Rationale

- Atomicity: prevents partial writes (e.g., invoice updated but credit not)
- Prisma's interactive transactions provide snapshot isolation
- Post-commit event publication prevents subscribers from seeing uncommitted data
- Automatic rollback on any error

### Alternatives Considered

1. **Manual transaction management** — Rejected: error-prone, easy to forget commit/rollback
2. **Saga pattern with compensating transactions** — Deferred: overkill for single-database transactions; needed for cross-service orchestration
3. **Optimistic concurrency only (no transaction)** — Rejected: doesn't prevent partial writes in multi-aggregate commands

### Trade-offs

- **Accepted**: Interactive transactions have a timeout (default 5s); long-running commands could fail
- **Mitigated**: Commands are designed to be fast (< 100ms); timeout increased to 10s for batch operations
- **Risk**: Under high contention, interactive transactions may experience serialization errors; handled by Prisma's automatic retry

### Status: Accepted

---

## Decision 5: Command Result Type with Events and Audit Entries

### Context

Every command produces side effects beyond the state change: domain events for cross-module coordination, and audit entries for compliance. These need to be collected and either committed or discarded atomically.

### Decision

Every service method returns `CommandResult<T>`:

```typescript
interface CommandResult<T> {
  success: boolean;
  data?: T;
  error?: CommandError;
  events: DomainEvent[];
  auditEntries: AuditEntry[];
}
```

Events and audit entries are **collected** during execution, not published immediately. The Unit of Work commits them atomically and publishes events post-commit.

### Rationale

- Atomicity: events and audits are part of the transaction, not side effects
- Testability: tests can assert on `result.events` and `result.auditEntries` without subscribing
- Consistency: every command always returns the same shape, regardless of success/failure

### Alternatives Considered

1. **Events published immediately inside the service** — Rejected: risks publishing events for transactions that later roll back
2. **Event collector passed as parameter** — Rejected: adds coupling; `CommandResult` is cleaner
3. **Separate `EventCollector` class** — Deferred: premature abstraction for current scale

### Trade-offs

- **Accepted**: Slightly verbose return types (`CommandResult<Vendor>` instead of just `Vendor`)
- **Mitigated**: `ok()` and `fail()` helper functions reduce boilerplate

### Status: Accepted

---

## Decision 6: State Machine Validation Inline in Application Services

### Context

Every aggregate has a state machine (e.g., Vendor: PENDING_REVIEW → ACTIVE → SUSPENDED → DEACTIVATED). Invalid transitions must be rejected with clear error messages.

### Decision

State transition tables are defined as constants within each application service. Validation is performed inline before each state change:

```typescript
const APPROVEABLE_STATUSES: VendorStatus[] = ["PENDING_REVIEW"];

if (!APPROVEABLE_STATUSES.includes(vendor.status)) {
  return fail("INVALID_STATE", `Cannot approve vendor in ${vendor.status} status`, 400);
}
```

### Rationale

- Simplicity: no external state machine library needed
- Visibility: transition rules are co-located with the business logic
- Debuggability: error messages include the current status and expected status
- Performance: zero overhead (array includes check)

### Alternatives Considered

1. **External state machine library (XState)** — Rejected: adds dependency, overkill for linear state machines
2. **State machine as a separate domain class** — Deferred: premature abstraction; current inline approach is clear
3. **Database-level constraint (CHECK constraint)** — Partially used: Prisma enums enforce valid values, but not transition rules

### Trade-offs

- **Accepted**: State rules are duplicated across methods (e.g., "must be PENDING_REVIEW" appears in both `approveVendor` and `rejectVendor`)
- **Mitigated**: Constants defined at service level (`APPROVEABLE_STATUSES`); shared across methods

### Status: Accepted

---

## Decision 7: Financial Precision at Domain Boundary (Decimal In, Number Out)

### Context

Monetary values are stored as `Prisma.Decimal(38,12)` in the database. JavaScript `number` has precision limitations for financial calculations.

### Decision

- **Domain boundary (repository types)**: All monetary fields are `number` for JavaScript ergonomics
- **Application service layer**: All arithmetic uses `financial-precision.ts` helpers (`toDecimal`, `sumDecimals`, `multiplyDecimals`)
- **Repository boundary**: Prisma `Decimal` ↔ domain `number` conversion happens in `mapXxx()` / `unmapXxx()` helpers
- **Zero native `number` arithmetic on money** within service methods

### Rationale

- Prisma `Decimal` is the source of truth in the database
- `financial-precision.ts` provides banker's rounding (`financialRound`) and safe aggregation
- Domain types use `number` for developer ergonomics (comparison, logging, JSON serialization)
- Clear boundary: conversion happens exactly once, at the repository layer

### Alternatives Considered

1. **Use `Decimal` throughout the domain layer** — Rejected: verbose API (`decimal.gte(0)` vs `>= 0`), poor JSON serialization, library coupling
2. **Use `number` everywhere** — Rejected: precision loss on aggregation (floating point), violates financial integrity requirements
3. **Use `BigInt` for cents** — Rejected: doesn't handle decimal currencies (e.g., BHD has 3 decimal places)

### Trade-offs

- **Accepted**: Conversion at boundary means domain types don't carry precision guarantees
- **Mitigated**: `financial-precision.ts` helpers are mandatory in all service methods; lint rules can enforce this

### Status: Accepted

---

## Decision 8: SoD Enforcement in Application Layer

### Context

Financial regulations require Separation of Duties: the person who creates a vendor cannot approve it, the person who creates an invoice cannot approve payment, etc.

### Decision

SoD checks are enforced inline in application service methods:

```typescript
if (vendor.createdBy === ctx.userId) {
  return fail("FORBIDDEN", "Vendor creator cannot approve their own vendor (separation of duties)", 403);
}
```

Three SoD rules are enforced:
1. Vendor creator ≠ vendor approver (`VendorApplicationService.approveVendor`)
2. Invoice creator ≠ invoice approver (`ApprovalApplicationService.approveLevel`)
3. Proposal creator ≠ proposal approver (`PaymentApplicationService.approvePaymentProposal`)

### Rationale

- Defense in depth: API routes check roles; application services check SoD
- Inline checks are explicit and auditable
- Error messages clearly explain the violation for compliance logging
- No external policy engine needed for current SoD rules

### Alternatives Considered

1. **Centralized SoD policy engine** — Deferred: overkill for 3 rules; needed when rules become dynamic
2. **Middleware-based SoD** — Rejected: middleware doesn't have access to aggregate state (createdBy)
3. **Database-level trigger** — Rejected: Prisma doesn't support triggers; would bypass the ORM

### Trade-offs

- **Accepted**: SoD rules are duplicated across services (each checks createdBy against ctx.userId)
- **Mitigated**: Rules are simple (single comparison); centralizing would add indirection without clarity

### Status: Accepted

---

## Decision 9: Audit Entries as First-Class Output of Every Command

### Context

Financial regulations (SOC 2, PCI DSS, GDPR) require immutable audit trails for every state change. Auditors need to see who did what, when, and why.

### Decision

Every command returns `AuditEntry[]` as part of `CommandResult<T>`. Audit entries are:

1. Created inline in the application service (during command execution)
2. Persisted within the same transaction as the state change (via `repos.audit.save()`)
3. Append-only (no update/delete allowed on `APAuditRecord`)
4. Include: action, resourceType, resourceId, actorId, companyId, metadata, severity

### Rationale

- Atomicity: audit and state change are committed together (no orphaned audits)
- Immutability: append-only design prevents tampering
- Completeness: every command produces at least one audit entry
- Rich metadata: `metadata` field captures command-specific context (changed fields, reasons, amounts)

### Alternatives Considered

1. **Audit as a separate service (async)** — Rejected: risks losing audit records if async service fails; violates atomicity
2. **Database trigger-based audit** — Rejected: triggers don't capture application-level context (actorId, correlationId)
3. **Audit log file (external)** — Rejected: doesn't support querying; breaks Prisma's transactional guarantees

### Trade-offs

- **Accepted**: Audit entries add overhead to every command (1-3 extra DB writes per command)
- **Mitigated**: `saveBatch()` for bulk operations; audit writes are small (single row inserts)

### Status: Accepted

---

## Decision 10: Barrel Exports for Clean Module Boundaries

### Context

The application layer has 7 services, 2 command type files, 1 unit of work file, and 1 index file. Consumers (API routes, tests) need clean import paths.

### Decision

Each layer has a barrel export (`index.ts`) that re-exports all public types and classes:

```typescript
// src/server/procurement/application/index.ts
export { VendorApplicationService } from "./vendor-service";
export { InvoiceApplicationService } from "./invoice-service";
// ...
export type { CommandContext, CommandResult, ... } from "./types";
export { ok, fail } from "./types";
export { executeUnitOfWork } from "./unit-of-work";
```

### Rationale

- Clean imports: `import { VendorApplicationService, CommandContext } from "@/server/procurement/application"`
- Encapsulation: internal implementation details (helpers, constants) are not exported
- Refactoring safety: file paths can change without updating consumers
- Consistent with the existing `ap-repositories/index.ts` pattern

### Alternatives Considered

1. **Direct file imports** — Rejected: creates coupling to internal file structure
2. **Namespace imports** — Rejected: TypeScript best practices prefer named imports
3. **No barrel exports (flat file)** — Rejected: 7 services × ~500 lines each = 3500+ lines in one file

### Trade-offs

- **Accepted**: Barrel exports add a layer of indirection (one more file to maintain)
- **Mitigated**: Barrel files are auto-generated structure (re-exports only); zero logic

### Status: Accepted

---

## Summary

| # | Decision | Key Trade-off | Status |
|---|---|---|---|
| 1 | CQRS command/query separation | More boilerplate, but clearer boundaries | Accepted |
| 2 | In-process event bus | Events lost on restart, but zero infra dependency | Accepted |
| 3 | Repository pattern with interface segregation | 22 files, but testable and swappable | Accepted |
| 4 | Unit of Work via Prisma interactive transactions | 5s timeout risk, but atomic multi-aggregate writes | Accepted |
| 5 | CommandResult with events and audit | Verbose return types, but atomic and testable | Accepted |
| 6 | Inline state machine validation | Some duplication, but simple and debuggable | Accepted |
| 7 | Financial precision at domain boundary | Conversion overhead, but precision guaranteed | Accepted |
| 8 | SoD enforcement in application layer | Simple inline checks, but no centralized policy | Accepted |
| 9 | Audit entries as first-class output | Extra DB writes, but atomic and immutable | Accepted |
| 10 | Barrel exports | One more file, but clean imports and encapsulation | Accepted |
