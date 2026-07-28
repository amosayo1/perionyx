# AP Reference Implementation Review

**Phase**: 23.1 — Constitutional Validation
**Date**: 2026-07-24
**Subject**: Accounts Payable domain as constitutional reference implementation

---

## Executive Summary

The AP domain is the most complete domain implementation in Perionyx: 8 application services, 51 commands, 67 API endpoints, 10 Prisma repositories, 63 domain events, 30+ Zod schemas. It scores **7.4/10** across 10 constitutional dimensions.

**Verdict: CONDITIONAL** — Architecture is sound but 5 conditions must be met before CERTIFIED.

---

## Dimension Scores

### 1. Domain Isolation — 7/10

**Evidence**:
- Zero cross-domain imports in application layer
- All services import only from `../ap-repositories/`, `../domain/events/`, `./types`, `@/lib/financial-precision`, `@/lib/errors/app-error`
- DI via `APRepositoryRegistry` constructor in all 7 services
- No formal `APContract` interface — boundary is implicit through repository types

**Deduction**: Domain boundary clean by convention, not enforced by type.

### 2. Financial Precision — 7/10

**Evidence**:
- Command types use `Decimal`: `types.ts:88,130-131,144-145,179,227,275-289,301,315,319`
- All 5 arithmetic services import `@/lib/financial-precision`
- Tax calculation uses `ROUND_HALF_EVEN` (banker's rounding): `invoice-service.ts:146`
- `duplicate-detection.service.ts:37` uses `Math.abs(a - b)` on monetary amounts — native arithmetic

**Deduction**: One instance of native number arithmetic on money.

### 3. Tenant Isolation — 9/10

**Evidence**:
- 67/67 route files use `apAuth()` → `requireTenantContext()`
- 67/67 route files call `apRequirePermission()`
- All 10 Prisma repositories filter by `companyId` (219 total occurrences)

**Deduction**: Near-perfect. Minor: `duplicate-detection.service.ts` queries Prisma directly rather than through repository abstraction.

### 4. Event Architecture — 7/10

**Evidence**:
- 63 typed events across 7 categories — all vendor-neutral
- `DomainEvent` type with eventType, companyId, aggregateType/Id, actorId, correlationId, timestamp, payload
- `APDomainEventBus` singleton with subscribe, publish, history, wildcard handlers

**Deduction**: In-memory only — no persistent event store, no schema versioning, no distributed delivery.

### 5. Idempotency — 8/10

**Evidence**:
- Full implementation: 24h TTL, tenant-scoped keys, 10K max entries, 5min cleanup
- 45/67 mutation routes use idempotency
- 22 routes without are GETs, PATCHes, DELETEs (correct)

**Deduction**: In-memory store — lost on restart, not shared across instances.

### 6. Error Handling — 8/10

**Evidence**:
- `APErrorBody` contract: code, message, category, correlationId, recoverability, userMessage, details
- 11 error categories
- `sanitizeMessage()` strips prisma/database/sql/stack patterns
- All routes use `apErrorResponse()`, `apValidationError()`, etc.

**Deduction**: No `Retry-After` header on rate-limited responses.

### 7. Audit Trail — 5/10

**Evidence**:
- `ProcurementAPAuditRecord` Prisma model — append-only, full metadata, 6 indexes
- Every command handler creates `AuditEntry` objects returned in `CommandResult.auditEntries`

**Critical Gap**: No code persists `AuditEntry` records to `ProcurementAPAuditRecord`. Audit entries are collected in memory and returned in the result, but no middleware or UnitOfWork writes them to Prisma. Schema is correct; persistence pipeline is not wired.

### 8. API Standards — 8/10

**Evidence**:
- 30+ Zod schemas with cross-field validation
- Consistent `{ data: ... }` response envelope
- `applyCommonHeaders()` adds correlation ID + cache headers
- Read endpoints use tiered TTLs

**Deduction**: No `meta` field in all paginated responses. No HATEOAS links.

### 9. Code Quality — 7/10

**Evidence**:
- Zero `any` usage across all 7 application services (7,000+ lines)
- Consistent `Command → validate → load → business rules → save → events → audit → return` pattern
- Consistent DI pattern across all services

**Deduction**: 16 `as any` in Prisma repository adapters (for `orderBy` dynamic keys). 1 `as any` in exceptions route.

### 10. Coverage — 8/10

**Evidence**:
- 8 application services (7 + DuplicateDetection)
- 51 commands + 3 scan methods
- 67 API endpoints
- 10 repository interfaces + 10 Prisma implementations
- 63 domain events
- 30+ Zod schemas
- 139 automated tests (52 API + 87 workflow)

**Verified features**: Vendor lifecycle, invoice management, three-way matching, multi-level approval with SoD, payment proposal→review→approve→batch→execute→confirm→reverse, reconciliation, credit notes, duplicate detection, exception management, dashboard, aging, analytics.

---

## Overall Score

| Dimension | Score |
|---|---|
| Domain Isolation | 7 |
| Financial Precision | 7 |
| Tenant Isolation | 9 |
| Event Architecture | 7 |
| Idempotency | 8 |
| Error Handling | 8 |
| Audit Trail | 5 |
| API Standards | 8 |
| Code Quality | 7 |
| Coverage | 8 |
| **Average** | **7.4** |

### Verdict: **CONDITIONAL**

---

## Conditions for CERTIFIED

| # | Condition | Effort | Impact |
|---|---|---|---|
| 1 | **Wire audit persistence** — Write `AuditEntry[]` to `ProcurementAPAuditRecord` via UnitOfWork | 1 week | Audit trail functional; compliance-critical |
| 2 | **Eliminate `as any` in repositories** — 16 instances across 9 files for Prisma `orderBy` dynamic keys | 2 days | Type safety complete |
| 3 | **Persist idempotency store** — Migrate from in-memory `Map` to Redis via `CacheManager` | 2 days | Production-safe for multi-instance |
| 4 | **Fix duplicate-detection arithmetic** — Replace `Math.abs(a - b)` with `financialRound()` | 1 hour | Law 6 compliance |
| 5 | **Add event schema versioning** — Add `schemaVersion: number` to `DomainEvent` | 1 day | Forward-compatible event consumers |

---

## Top 5 Gaps

| # | Gap | Impact |
|---|---|---|
| 1 | **No `APContract` interface** | Domain boundary implicit; other domains cannot safely depend on AP |
| 2 | **No persistent event store** | Events lost on restart; no event replay capability |
| 3 | **No multi-currency FX handling** | `exchangeRate` fields exist but no service computes or fetches real rates |
| 4 | **No retry-after headers** | Error contract has `RATE_LIMITED` category but no response header |
| 5 | **DuplicateDetection bypasses repository** | `duplicate-detection.service.ts:18` imports `prisma` directly |

---

*Validated: 2026-07-24 | Phase 23.1 | AP Reference Implementation Review*
