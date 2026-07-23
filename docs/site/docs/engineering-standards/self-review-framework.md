---
id: self-review-framework
title: Self-Review Framework
sidebar_label: Self-Review
---

# Perionyx AI Self-Review Framework

**Version:** 1.0.0
**Status:** Ratified
**Scope:** All AI-assisted implementations on the Perionyx platform

> Before declaring any implementation complete, every AI assistant must perform this structured self-review. Each section contains objective pass/fail questions. A failing answer in any section blocks completion until the issue is resolved. This is not a suggestion — it is mandatory.

---

## How to Use This Framework

1. Before submitting any implementation, open this document.
2. Answer every question honestly based on the current state of the code.
3. For any **FAIL** answer, document the reason and either fix the issue or explain why the criterion does not apply to this specific change.
4. The implementation is complete only when all applicable criteria pass.
5. Append the completed self-review to the PR description or attach it as a comment.

---

## 1. Architecture

| # | Question | Pass/Fail | Evidence |
|---|----------|-----------|----------|
| 1.1 | Does the implementation follow the layered architecture (Presentation → API → Service → Data Access → PostgreSQL)? | ☐ | |
| 1.2 | Are all new service methods added to the correct module (no cross-module concerns)? | ☐ | |
| 1.3 | Is the `PostingEngine.postLedgerLines()` used for all wallet balance changes? | ☐ | |
| 1.4 | Are all external API calls routed through the Connector Platform (not direct)? | ☐ | |
| 1.5 | Are complex business processes using the Workflow Engine instead of procedural code? | ☐ | |
| 1.6 | Is the module-level `RowLockManager` a singleton (not instantiated per-request)? | ☐ | |
| 1.7 | Are there no circular dependencies introduced? | ☐ | |
| 1.8 | Does the implementation maintain backward compatibility with existing callers? | ☐ | |

---

## 2. Financial Integrity

| # | Question | Pass/Fail | Evidence |
|---|----------|-----------|----------|
| 2.1 | Does every financial write go through `FinancialTransactionManager.executeWrite()`? | ☐ | |
| 2.2 | Are all `LedgerEntry` records created within the same transaction as their corresponding balance updates? | ☐ | |
| 2.3 | Are debit/credit pairs balanced within the transaction (assertBalancedLedger called)? | ☐ | |
| 2.4 | Are wallet balance updates using `updateMany` with version check and `version: { increment: 1 }`? | ☐ | |
| 2.5 | Is `ConflictError` thrown when the version check returns zero affected rows? | ☐ | |
| 2.6 | Is non-negative balance enforced for `STANDARD` wallets? | ☐ | |
| 2.7 | Are ledger entries immutable (no UPDATE or DELETE on `LedgerEntry`)? | ☐ | |
| 2.8 | Does the implementation avoid raw SQL in financial service code? | ☐ | |
| 2.9 | Are cross-currency transfers grouped by currency with one `postLedgerLines` call per group? | ☐ | |

---

## 3. Transaction Safety

| # | Question | Pass/Fail | Evidence |
|---|----------|-----------|----------|
| 3.1 | Are all financial writes inside an explicit `Prisma.$transaction`? | ☐ | |
| 3.2 | Is `notificationService.broadcast()` and all I/O moved outside the transaction boundary? | ☐ | |
| 3.3 | Are FOR UPDATE row locks acquired before reading the data to be modified? | ☐ | |
| 3.4 | Are locks acquired in alphabetical order by `{table}:{id}`? | ☐ | |
| 3.5 | Is idempotency checked before executing any mutating financial operation? | ☐ | |
| 3.6 | Are typed errors used (`ConflictError`, `ValidationError`, `NotFoundError`, `ForbiddenError`) instead of generic `Error`? | ☐ | |
| 3.7 | Is the `RowLockManager` used instead of raw `SELECT ... FOR UPDATE` SQL? | ☐ | |
| 3.8 | Does the implementation avoid holding database connections during I/O operations? | ☐ | |

---

## 4. Concurrency

| # | Question | Pass/Fail | Evidence |
|---|----------|-----------|----------|
| 4.1 | Does the implementation have concurrency tests for all new financial write operations? | ☐ | |
| 4.2 | Do concurrency tests use `Promise.allSettled` (not `Promise.all`)? | ☐ | |
| 4.3 | Do concurrency tests use a real database with track-and-cleanup isolation? | ☐ | |
| 4.4 | Do concurrency tests verify no double-spend, no negative balances, and no lost updates? | ☐ | |
| 4.5 | Is the retry mechanism tested with actual deadlock or lock conflict scenarios? | ☐ | |
| 4.6 | Do tests verify that concurrent operations produce correct deterministic outcomes? | ☐ | |
| 4.7 | Are negative concurrency tests present (asserting proper failure under conflict)? | ☐ | |

---

## 5. Security

| # | Question | Pass/Fail | Evidence |
|---|----------|-----------|----------|
| 5.1 | Does every new API endpoint authenticate before performing work? | ☐ | |
| 5.2 | Is authorization (RBAC) verified at the resource level, not just the route level? | ☐ | |
| 5.3 | Are all user inputs validated against a schema before reaching business logic? | ☐ | |
| 5.4 | Are financial amounts validated (positive, finite, within acceptable range)? | ☐ | |
| 5.5 | Are there no secrets (API keys, tokens, credentials) in source code, logs, or error messages? | ☐ | |
| 5.6 | Is rate limiting configured for new endpoints? | ☐ | |
| 5.7 | Is CORS correctly configured (no wildcard for authenticated endpoints)? | ☐ | |
| 5.8 | Are response security headers present (`X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`)? | ☐ | |

---

## 6. Performance

| # | Question | Pass/Fail | Evidence |
|---|----------|-----------|----------|
| 6.1 | Are batch operations used instead of per-row queries for bulk operations? | ☐ | |
| 6.2 | Are new database queries supported by existing indexes? | ☐ | |
| 6.3 | Are there no N+1 query patterns introduced? | ☐ | |
| 6.4 | Are synchronous external API calls avoided in request paths (queues used instead)? | ☐ | |
| 6.5 | Is the implementation free of unnecessary round-trips to the database? | ☐ | |

---

## 7. Tenant Isolation

| # | Question | Pass/Fail | Evidence |
|---|----------|-----------|----------|
| 7.1 | Are all database queries scoped by `companyId`? | ☐ | |
| 7.2 | Is `companyId` derived from the authenticated session (not from user input)? | ☐ | |
| 7.3 | Does every new model with tenant-scoped data include a `companyId` field? | ☐ | |
| 7.4 | Are negative tests present (verifying cross-tenant access is rejected)? | ☐ | |
| 7.5 | Does the implementation avoid hardcoding tenant IDs or assuming a default tenant? | ☐ | |

---

## 8. Governance

| # | Question | Pass/Fail | Evidence |
|---|----------|-----------|----------|
| 8.1 | Does the implementation respect existing approval workflows for high-risk operations? | ☐ | |
| 8.2 | Are approval rules configurable (not hard-coded) when introducing new approval paths? | ☐ | |
| 8.3 | Are policy exceptions logged and auditable? | ☐ | |
| 8.4 | Does the implementation integrate with the Workflow Engine for multi-step processes? | ☐ | |
| 8.5 | Are governance framework versioning checks in place for configuration entities? | ☐ | |

---

## 9. Enterprise Intelligence

| # | Question | Pass/Fail | Evidence |
|---|----------|-----------|----------|
| 9.1 | Does the implementation read financial data through the service layer (not direct DB access for EI)? | ☐ | |
| 9.2 | Does the implementation respect tenant isolation and RLS? | ☐ | |
| 9.3 | Are AI-generated insights explainable and auditable? | ☐ | |
| 9.4 | Does the implementation avoid autonomous financial writes by AI components? | ☐ | |
| 9.5 | Are AI-recommended actions subject to approval workflows? | ☐ | |

---

## 10. Decision Intelligence

| # | Question | Pass/Fail | Evidence |
|---|----------|-----------|----------|
| 10.1 | Are financial action recommendations going through DecisionIntelligenceService? | ☐ | |
| 10.2 | Are recommendations logged in the audit trail? | ☐ | |
| 10.3 | Do recommended actions pass through approval workflow before execution? | ☐ | |
| 10.4 | Are confidence scores and supporting evidence included with recommendations? | ☐ | |

---

## 11. Operations

| # | Question | Pass/Fail | Evidence |
|---|----------|-----------|----------|
| 11.1 | Does the implementation have structured logging at appropriate levels (info/warn/error)? | ☐ | |
| 11.2 | Do logs include `companyId`, `transactionId`, `operation`, and `durationMs`? | ☐ | |
| 11.3 | Are transaction retries logged? | ☐ | |
| 11.4 | Are serialization failures and deadlocks logged? | ☐ | |
| 11.5 | Are no secrets or PII included in log output? | ☐ | |
| 11.6 | Does the implementation have a documented rollback plan? | ☐ | |
| 11.7 | Are feature flags used for significant new functionality? | ☐ | |

---

## 12. Metrics

| # | Question | Pass/Fail | Evidence |
|---|----------|-----------|----------|
| 12.1 | Are transaction success/failure count metrics implemented? | ☐ | |
| 12.2 | Are transaction latency metrics (P50, P95, P99) implemented? | ☐ | |
| 12.3 | Are lock acquisition success/failure metrics implemented? | ☐ | |
| 12.4 | Are retry count distribution metrics implemented? | ☐ | |
| 12.5 | Are business metrics (transfer volume, approval throughput) implemented for new features? | ☐ | |

---

## 13. Testing

| # | Question | Pass/Fail | Evidence |
|---|----------|-----------|----------|
| 13.1 | Do unit tests exist for all new service methods? | ☐ | |
| 13.2 | Do integration tests exist for all new API endpoints? | ☐ | |
| 13.3 | Do concurrency tests exist for all new financial write operations? | ☐ | |
| 13.4 | Do negative tests exist (unauthorized access, invalid input, missing resources)? | ☐ | |
| 13.5 | Do idempotency tests exist (same key, same result)? | ☐ | |
| 13.6 | Do tenant isolation tests exist (cross-tenant access is rejected)? | ☐ | |
| 13.7 | Do all tests pass? | ☐ | |
| 13.8 | Are there no flaky tests introduced? | ☐ | |

---

## 14. Documentation

| # | Question | Pass/Fail | Evidence |
|---|----------|-----------|----------|
| 14.1 | Is API documentation (OpenAPI) updated for new/changed endpoints? | ☐ | |
| 14.2 | Is enterprise documentation (`docs/enterprise/`) updated for new financial operations? | ☐ | |
| 14.3 | Is an ADR created for significant architectural decisions? | ☐ | |
| 14.4 | Is the on-call runbook updated for new operational concerns? | ☐ | |
| 14.5 | Are inline comments included that explain WHY (not WHAT)? | ☐ | |
| 14.6 | Is the README updated for new dependencies or setup changes? | ☐ | |

---

## 15. Build

| # | Question | Pass/Fail | Evidence |
|---|----------|-----------|----------|
| 15.1 | Does `pnpm build` complete with zero errors? | ☐ | |
| 15.2 | Does `pnpm build` produce zero warnings? | ☐ | |

---

## 16. TypeScript

| # | Question | Pass/Fail | Evidence |
|---|----------|-----------|----------|
| 16.1 | Does `pnpm typecheck` pass with zero errors? | ☐ | |
| 16.2 | Are there no `any` types introduced (unless explicitly justified)? | ☐ | |
| 16.3 | Are there no `@ts-ignore` or `@ts-expect-error` directives in new/modified code? | ☐ | |
| 16.4 | Are there no `as` casts in financial logic? | ☐ | |

---

## 17. Migration

| # | Question | Pass/Fail | Evidence |
|---|----------|-----------|----------|
| 17.1 | Is the migration forward-only (no destructive operations)? | ☐ | |
| 17.2 | Does `prisma migrate status` confirm the schema is up to date? | ☐ | |
| 17.3 | Is the migration backward-compatible with the previous application version? | ☐ | |
| 17.4 | Has the migration been tested against a copy of production data? | ☐ | |
| 17.5 | Does a rollback migration exist and has it been tested? | ☐ | |

---

## 18. API Compatibility

| # | Question | Pass/Fail | Evidence |
|---|----------|-----------|----------|
| 18.1 | Does the implementation avoid breaking changes to existing API contracts? | ☐ | |
| 18.2 | Are new parameters optional with backward-compatible defaults? | ☐ | |
| 18.3 | Are deprecated APIs clearly marked with a migration path? | ☐ | |
| 18.4 | Does the implementation support idempotency keys for mutating endpoints? | ☐ | |

---

## 19. UI Consistency

| # | Question | Pass/Fail | Evidence |
|---|----------|-----------|----------|
| 19.1 | Does the UI use existing components from `src/components/ui/`? | ☐ | |
| 19.2 | Are loading states shown during data fetches? | ☐ | |
| 19.3 | Are error states shown gracefully (no raw error messages to users)? | ☐ | |
| 19.4 | Are financial amounts formatted consistently (locale-aware currency formatting)? | ☐ | |
| 19.5 | Are confirmation dialogs present for destructive or financial actions? | ☐ | |
| 19.6 | Are optimistic updates avoided for financial data (always wait for server confirmation)? | ☐ | |
| 19.7 | Does the UI maintain the dark theme design system? | ☐ | |

---

## 20. Accessibility

| # | Question | Pass/Fail | Evidence |
|---|----------|-----------|----------|
| 20.1 | Are all interactive elements keyboard-navigable? | ☐ | |
| 20.2 | Is screen reader support verified for financial data displays? | ☐ | |
| 20.3 | Does color contrast meet WCAG AA standards? | ☐ | |
| 20.4 | Are error messages associated with their inputs via `aria-describedby`? | ☐ | |
| 20.5 | Do financial tables have proper `scope` attributes on header cells? | ☐ | |

---

## 21. Business Value

| # | Question | Pass/Fail | Evidence |
|---|----------|-----------|----------|
| 21.1 | Does the feature have a documented business case? | ☐ | |
| 21.2 | Does the feature protect capital, enable velocity, provide intelligence, or expand the platform? | ☐ | |
| 21.3 | Is the cost of failure assessed and acceptable? | ☐ | |
| 21.4 | Is the blast radius assessed and contained? | ☐ | |
| 21.5 | Does the feature produce observable metrics that verify correct operation in production? | ☐ | |
| 21.6 | Are rollback triggers defined (what conditions would trigger an immediate rollback)? | ☐ | |

---

## Results

| Section | Pass | Fail | N/A |
|---------|------|------|-----|
| 1. Architecture | ☐ | ☐ | ☐ |
| 2. Financial Integrity | ☐ | ☐ | ☐ |
| 3. Transaction Safety | ☐ | ☐ | ☐ |
| 4. Concurrency | ☐ | ☐ | ☐ |
| 5. Security | ☐ | ☐ | ☐ |
| 6. Performance | ☐ | ☐ | ☐ |
| 7. Tenant Isolation | ☐ | ☐ | ☐ |
| 8. Governance | ☐ | ☐ | ☐ |
| 9. Enterprise Intelligence | ☐ | ☐ | ☐ |
| 10. Decision Intelligence | ☐ | ☐ | ☐ |
| 11. Operations | ☐ | ☐ | ☐ |
| 12. Metrics | ☐ | ☐ | ☐ |
| 13. Testing | ☐ | ☐ | ☐ |
| 14. Documentation | ☐ | ☐ | ☐ |
| 15. Build | ☐ | ☐ | ☐ |
| 16. TypeScript | ☐ | ☐ | ☐ |
| 17. Migration | ☐ | ☐ | ☐ |
| 18. API Compatibility | ☐ | ☐ | ☐ |
| 19. UI Consistency | ☐ | ☐ | ☐ |
| 20. Accessibility | ☐ | ☐ | ☐ |
| 21. Business Value | ☐ | ☐ | ☐ |

**Result:** Implementation is complete only when all applicable sections are marked **Pass**.

**Blocking failures:** Any **Fail** in sections 2 (Financial Integrity), 3 (Transaction Safety), 4 (Concurrency), or 5 (Security) blocks completion until resolved.

---

## Certification

I have completed this self-review honestly and to the best of my knowledge. All failing items are documented with reasons, and all blocking failures are resolved or explicitly exempted.

| Field | Value |
|-------|-------|
| AI Assistant | |
| Date | |
| Implementation PR/Branch | |
| Exempted Criteria (with reasons) | |

---

*This framework is part of the Perionyx Engineering Governance Framework (`docs/architecture/`). It is mandatory for all AI-assisted implementations.*
