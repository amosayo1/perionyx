# Database Security Audit

**Audit Date:** 2026-07-20
**Scope:** Schema design, query patterns, data types, index coverage, migration safety, financial integrity
**Total Findings:** 23 (1 Critical, 10 High, 8 Medium, 4 Low)

## Executive Summary

A critical SQL injection vector exists in the migration runner via `$queryRawUnsafe`. Three financial fields use `Float` instead of `Decimal`, causing precision loss on approval thresholds and GL allocations. Missing indexes on financial tables and N+1 query patterns in analytics create performance and correctness risks. The transaction state machine lacks version-based concurrency control.

## Findings

| Severity | ID | Title | File | Exploitability |
|----------|-----|-------|------|----------------|
| CRITICAL | DB-001 | SQL injection via $queryRawUnsafe | `migration-runner.ts:279-282` | Unsanitized input passed to raw SQL |
| HIGH | DB-002 | Financial Float in approval threshold | `approval-matrix-evaluator.ts` | Rounding errors in approval decisions |
| HIGH | DB-003 | Financial Float in morning briefing | `morning-briefing.service.ts` | Inaccurate financial summaries |
| HIGH | DB-004 | Financial Float in GL allocation | GL allocation service | Imprecise general ledger entries |
| HIGH | DB-005 | Cascade delete risk on financial tables | Schema | Accidental deletion propagates through financial records |
| HIGH | DB-006 | Missing indexes on financial tables | Schema | Full table scans on financial queries |
| HIGH | DB-007 | N+1 query patterns in analytics | Analytics service | 5 locations query financial data without joins |
| HIGH | DB-008 | No unique constraint on idempotency key | Treasury schema | Duplicate financial transactions possible |
| HIGH | DB-009 | Missing foreign key on treasury tables | Schema | Orphaned records in financial tables |
| HIGH | DB-010 | No check constraint on financial amounts | Schema | Negative or zero financial values not prevented |
| HIGH | DB-011 | Missing index on tenant + timestamp | Analytics tables | Slow tenant-scoped time-range queries |
| MEDIUM | DB-012 | Float used for treasury utilization | Treasury schema | Precision loss on utilization calculations |
| MEDIUM | DB-013 | Float used for interest rates | Treasury schema | Rounding errors on accumulated interest |
| MEDIUM | DB-014 | Transaction state machine race condition | Transaction service | Concurrent updates produce inconsistent state |
| MEDIUM | DB-015 | No version column on financial entities | Schema | Lost updates on concurrent financial mutations |
| MEDIUM | DB-016 | Migration version drift detection missing | Migration runner | Out-of-order migrations produce inconsistent state |
| MEDIUM | DB-017 | No audit triggers on financial tables | Schema | No automatic change tracking on financial rows |
| MEDIUM | DB-018 | Large unbatched migration operations | Migration files | Lock contention on production tables during migration |
| MEDIUM | DB-019 | No index on job status + tenant columns | Queue schema | Slow queue status queries |
| LOW | DB-020 | Reconciliation engine Float math | Reconciliation | Rounding errors in reconciliation |
| LOW | DB-021 | Sandbox reset deletes ledger entries | Sandbox | Destructive operation on financial history |
| LOW | DB-022 | No comment/metadata on migration files | Migrations | Unclear migration purpose or rollback path |
| LOW | DB-023 | Prisma schema uses @ignore on some fields | Schema | Hidden fields not tracked in migrations |

## Key Remediation Actions

1. **DB-001**: Replace `$queryRawUnsafe` with parameterized `$queryRaw` or Prisma client methods in `migration-runner.ts:279-282`; validate all migration inputs
2. **DB-002/003/004**: Migrate all `Float` financial columns to `Decimal(18,4)` or `Decimal(20,8)` via Prisma migration; update mapping in domain types
3. **DB-005**: Add `ON DELETE RESTRICT` to foreign keys on financial tables to prevent accidental cascade deletion
4. **DB-006**: Add composite indexes on `(companyId, createdAt)`, `(walletId, type)`, and `(transactionId, status)` for financial tables
5. **DB-014**: Implement optimistic concurrency control with `version` column on transaction and wallet entities; reject stale updates
