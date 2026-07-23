# EDP 21A.4 — AP Workflow Execution & Integration

**Phase**: 21A.4 — Workflow Execution & Integration
**Date**: 2026-07-22
**Status**: Complete
**Tests**: 139/139 passing (87 workflow + 52 API)

## Decision

Validate that every AP business process executes end-to-end with correct state transitions, event emission, audit trail creation, SoD enforcement, and financial precision — using integration tests against real (in-memory) service implementations.

## Context

Phases 21A.0–21A.3 built the domain architecture, Prisma models, application services (51 commands across 7 services), and REST API layer (65 endpoints). Phase 21A.4 validates correctness through 87 integration tests covering all 16 workflows plus 4 cross-cutting categories.

## Decisions Made

### D1: Integration Tests Over Unit Tests
**Rationale**: Tests exercise real service-to-service interactions (e.g., invoice → match → approve → pay) rather than mocking boundaries. This catches interaction bugs that unit tests miss (e.g., stale repository references, missing event propagation).

**Alternative considered**: Unit tests with mocked repos — rejected because it wouldn't have caught the cascade bug (D7) or the stale reference pattern.

### D2: In-Memory Repository Backing
**Rationale**: Services use `InMemoryAPRepositoryRegistry` for testing. This validates all business logic while keeping tests fast (~70ms for 87 tests) and avoiding database dependencies.

**Trade-off**: Doesn't test Prisma query correctness — covered by Phase 21A.3 API tests against Prisma.

### D3: Decimal Precision Assertions
**Rationale**: All monetary assertions verify `Number.isFinite()` and exact Decimal values. No tolerance for floating-point drift.

### D4: SoD Tested at Application Layer
**Rationale**: Separation of duties (creator cannot approve own entities) is validated at the service level, not just the API layer. This ensures SoD is enforced regardless of the entry point (API, agent, cron job).

### D5: Audit Trail as First-Class Concern
**Rationale**: Every test verifies that commands produce `auditEntries` with correct `action`, `resourceType`, `resourceId`, `actorId`, and `companyId`. Audit is not an afterthought.

### D6: Event Emission Tested Alongside State Changes
**Rationale**: Domain events are tested in the same assertions as state transitions, ensuring no event is dropped silently.

### D7: Approval Cascade Fix
**Problem**: `approveLevel` in `approval-service.ts` had `allApproved = allRecords.every(r => r.status === "APPROVED" || r.status === "SKIPPED")`. This treated SKIPPED records as approved, causing a 2-level chain to immediately approve the invoice after level 1, never cascading to level 2.

**Fix**: Changed to `allApproved = allRecords.every(r => r.status === "APPROVED")`. Now SKIPPED records are not treated as approved, allowing the cascade logic to activate the next level.

**Impact**: Multi-level approval chains now work correctly. Level 1 approval → level 2 transitions SKIPPED → PENDING → requires separate approval.

### D8: Credit Void Status Expansion
**Problem**: `voidCreditNote` only allowed ISSUED or PARTIALLY_APPLIED status. After applying a credit fully (FULLY_APPLIED), it couldn't be voided.

**Fix**: Added FULLY_APPLIED to `VOIDABLE_STATUSES`. The method already handles reversing applied amounts (restoring invoice balanceDue, resetting creditApplied to 0), so voiding a fully-applied credit is a legitimate business operation.

## Code Changes

| File | Change | Lines |
|---|---|---|
| `src/server/procurement/application/approval-service.ts` | Fixed `approveLevel` cascade: removed SKIPPED from `allApproved` check | ~377 |
| `src/server/procurement/application/credit-service.ts` | Added `FULLY_APPLIED` to `VOIDABLE_STATUSES` in `voidCreditNote` | ~287 |
| `test/procurement/ap-workflow-execution.test.ts` | 87 integration tests for 16 workflows + 4 cross-cutting categories | 2017 lines |

## Test Results

```
✓ test/procurement/ap-workflow-execution.test.ts  (87 tests)  66ms
✓ test/procurement/ap-api.test.ts                (52 tests) 638ms
  Tests  139 passed (139)
```

TypeScript: zero errors (`tsc --noEmit` clean).

## Known Limitations

| Limitation | Impact | Planned Fix |
|---|---|---|
| In-memory stores | Data loss on restart | Phase 21B — Prisma persistence |
| GL posting is flag-only | No actual journal entries | Phase 21C — GL integration |
| No distributed locking | Single-process concurrency only | Phase 7E.3 wiring |
| No actual bank integration | Mock payment confirmations | Phase 21D — bank connectors |
| No multi-currency variance testing | Single currency (USD) tests | Phase 21C |

## Risk Assessment

**Low risk** — All changes are:
1. Test code (new file, no impact on production)
2. One line changed in `approval-service.ts` (cascade fix — well-contained)
3. One constant expanded in `credit-service.ts` (VOIDABLE_STATUSES — backward compatible)

No breaking changes to existing services, APIs, or UI components.
