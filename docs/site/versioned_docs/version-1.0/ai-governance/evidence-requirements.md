---
id: evidence-requirements
title: Evidence Requirements
sidebar_label: Evidence Requirements
---

# Evidence Requirements

## Definition of Complete Implementation

An AI-assisted implementation is complete only when ALL of the following are true:

| # | Criterion | Verification |
|---|-----------|-------------|
| 1 | Code compiles with zero TypeScript errors under strict mode | `pnpm typecheck` |
| 2 | Production build succeeds with zero errors and zero warnings | `pnpm build` |
| 3 | All existing tests pass | `pnpm vitest run` |
| 4 | All new/modified code has corresponding tests | Coverage report |
| 5 | Concurrency tests exist and pass for all new financial write operations | `pnpm vitest run test/concurrency.test.ts` |
| 6 | Audit trail is verified for all new financial operations | Code review + test assertions |
| 7 | Tenant isolation is verified (negative tests for cross-tenant access) | Test assertions |
| 8 | Idempotency is verified for all mutating operations | Test assertions |
| 9 | All I/O is moved outside transaction/lock boundaries | Code review |
| 10 | Version check is present on all wallet balance updates | Code review |
| 11 | RowLockManager is used for all financial writes | Code review |
| 12 | PostingEngine.postLedgerLines() is used for all wallet posting | Code review |
| 13 | API documentation is updated for new/changed endpoints | OpenAPI spec check |
| 14 | Enterprise documentation is updated for new financial operations | `docs/enterprise/` check |
| 15 | ADR exists for significant architectural decisions | `docs/adr/` check |
| 16 | Migration is forward-only, tested, and backward-compatible | `prisma migrate status` |
| 17 | No forbidden practices are present | Code review |
| 18 | Enterprise Readiness Checklist score ≥ 90% with zero critical failures | Checklist audit |

> **A PR that does not satisfy every applicable criterion above must not be merged.** Partial compliance is non-compliance.

## Forbidden Practices

The following practices are strictly forbidden. AI-generated code that contains any of these will be rejected without review.

### Direct Database Writes in Financial Logic

**Forbidden:** Writing to `Wallet.balance` or `LedgerEntry` directly in service code without going through `PostingEngine.postLedgerLines()`.

**Why:** Duplicate posting code is the most common source of financial integrity bugs. Every bypass of `postLedgerLines()` introduces risk of missing locks, version checks, or audit logging.

### Raw SQL in Financial Services

**Forbidden:** Using `$queryRaw` or `$executeRaw` in financial service code.

**Why:** Raw SQL bypasses Prisma's type safety, making the code vulnerable to type errors in production. The sole exception is raw SQL inside `RowLockManager` internals for FOR UPDATE locking.

### Implicit Transactions

**Forbidden:** Relying on Prisma's auto-commit for multi-step financial operations.

**Why:** Auto-commit means each Prisma query runs in its own transaction. If the operation involves multiple queries (read balance, check version, update balance, insert ledger entry), each query is a separate transaction — making the overall operation non-atomic.

### Lock Bypass

**Forbidden:** Reading or writing a financial resource without acquiring the appropriate row lock.

**Why:** Lock-free reads followed by writes produce lost updates, non-repeatable reads, and phantom reads. Every financial write path must acquire FOR UPDATE locks before reading.

### I/O Inside Locks

**Forbidden:** Calling `notificationService.broadcast()`, external APIs, or any I/O inside a `RowLockManager.withLocks()` callback.

**Why:** I/O inside locks holds the database connection and the row lock for the duration of the I/O operation, increasing contention risk and potentially causing connection pool deadlock.

### Version Bypass

**Forbidden:** Updating wallet balances without a version check.

**Why:** The version check is the second layer of defense against race conditions. Bypassing it eliminates the optimistic locking safety net.

### Audit Bypass

**Forbidden:** Performing a financial operation without creating an AuditLog record.

**Why:** An un-audited financial operation is equivalent to an operation that never happened. It cannot be verified, traced, or audited.

### Tenant Isolation Bypass

**Forbidden:** Querying or writing data across tenants. Omitting `companyId` from a tenant-scoped query.

**Why:** Cross-tenant data access in a financial platform is a catastrophic security failure. There is no acceptable justification.

### Fire-and-Forget Promises

**Forbidden:** Using `void` operator or `.catch(() => {})` to silently ignore promise rejections.

**Why:** Unhandled promise rejections in financial operations can lead to partial writes, inconsistent state, and silent data loss. Every promise must be awaited or explicitly handled.

### Circular Dependencies

**Forbidden:** Importing module A from module B when B is imported by A (directly or transitively).

**Why:** Circular dependencies make testing impossible, create initialization order bugs, and make it impossible to reason about the dependency graph.

### Mutation of Ledger Entries

**Forbidden:** Updating or deleting `LedgerEntry` records. Corrections must use reversal transactions.

**Why:** The ledger is immutable by design. Mutation destroys the audit trail and makes financial history untrustworthy.

### Implicit Currency Assumptions

**Forbidden:** Assuming all wallets in a transaction share the same currency without explicit verification.

**Why:** Cross-currency transfers require currency conversion and separate posting per currency group. Assuming a single currency leads to incorrect balance calculations.

---

*This document is part of the Perionyx AI Engineering Playbook (`docs/architecture/`).*
