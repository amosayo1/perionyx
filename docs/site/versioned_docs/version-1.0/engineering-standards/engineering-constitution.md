---
id: engineering-constitution
title: Engineering Constitution
sidebar_label: Constitution
---

# Perionyx Engineering Constitution

**Version:** 1.0.0
**Status:** Ratified
**Scope:** All engineering work on the Perionyx platform

---

## Preamble

Perionyx is an Enterprise Financial Operating System. Every line of code, every schema migration, every API endpoint, and every AI capability either protects or risks capital. This constitution establishes the immutable engineering principles that govern all development. No feature, refactor, or dependency is complete until it satisfies every applicable principle herein.

---

## 1. Mission

Perionyx exists to provide a unified, secure, and intelligent operating system for enterprise financial operations. Our mission is to:

- **Protect capital** through mathematically verifiable financial integrity.
- **Enable velocity** through safe concurrency and principled abstraction.
- **Provide intelligence** through governance-aware AI that augments human decision-making.
- **Remain open** through a connector platform that integrates with any financial ecosystem.

Every engineering decision must advance at least one of these mission pillars.

---

## 2. Engineering Philosophy

### 2.1 Correctness Over Performance

Financial software that is fast but wrong is worthless. Performance optimizations must never compromise correctness. When correctness and performance conflict, correctness wins. Profile first, optimize second.

### 2.2 Immutable by Default

Financial records must never be mutated. Ledger entries are append-only. Audit logs are append-only. Transaction histories are append-only. Immutability is the foundation of auditability.

### 2.3 Fail Closed

When the system cannot determine the correct outcome, it must fail closed — never proceed with an operation whose safety cannot be verified. A transaction that fails to post is recoverable. A transaction that posts incorrectly may not be.

### 2.4 Explicit Over Implicit

Transaction boundaries, lock acquisition, isolation levels, and retry policies must be explicit in the code. No hidden transactions, no implicit locking, no magic retry. Every financial operation must be auditable from the source code alone.

### 2.5 Defense in Depth

No single mechanism guarantees financial integrity. Every balance write must be protected by at least two independent mechanisms: pessimistic row locking AND optimistic version checking. No single point of failure in the integrity chain.

---

## 3. Enterprise Software Principles

### 3.1 Tenant Isolation

Every query, every write, every cache lookup must be scoped by `companyId`. No tenant may ever access another tenant's data. Row-Level Security (RLS) in PostgreSQL is the database-level defense; `companyId` scoping in application code is the application-level defense. Both must exist.

### 3.2 Idempotency

All mutating operations must be idempotent. The `IdempotencyRecord` table tracks every financial operation by `idempotencyKey`. Replaying an idempotent request must produce the same result as the original. This is non-negotiable for any payment, transfer, or balance-changing operation.

### 3.3 Auditability

Every financial action must produce an audit record. The `AuditLog` table is the system of record for who did what, when, and with what metadata. Audit records must include: actor identity (userId or system), action type, resource type, resource ID, and sufficient metadata to reconstruct the operation.

### 3.4 Observability

Every transaction, lock acquisition, retry, and failure must be observable through structured logging and metrics. The platform must support debugging production issues without requiring code changes.

---

## 4. Financial Integrity Principles

### 4.1 Double-Entry Accounting

Every financial movement must be recorded as balanced debit/credit pairs in the `LedgerEntry` table. A transaction with unbalanced postings must be rejected before any write occurs. The balance constraint is verified at the application layer inside the transaction, not deferred.

### 4.2 Immutable Ledger

`LedgerEntry` records must never be updated or deleted. Corrections must be made through reversal transactions that create new offsetting entries. The `@@unique([transactionId, sequence])` constraint prevents duplicate entries.

### 4.3 Version-Protected Balances

Every wallet balance update must use `updateMany` with a version condition and atomic version increment:

```typescript
const updated = await tx.wallet.updateMany({
  where: { id: walletId, version: wallet.version },
  data: { balance: nextBalance, version: { increment: 1 } },
});
```

If `updated.count === 0`, the operation must abort with a `ConflictError`. No balance update may bypass this pattern.

### 4.4 Non-Negative Enforcement

`STANDARD` kind wallets must never have negative balances. This is enforced at write time inside the transaction, after reading the current balance under a FOR UPDATE lock.

### 4.5 Hybrid Locking

Financial writes must employ both pessimistic and optimistic locking:

- **Pessimistic**: `RowLockManager.lockInTx()` with FOR UPDATE prevents concurrent writers from interleaving.
- **Optimistic**: Version check on `updateMany` catches edge cases where a lock was bypassed.

Neither alone is sufficient. Both are required.

---

## 5. Multi-Tenant Principles

### 5.1 Data Isolation

All tenant data must be isolated by `companyId`. Cross-tenant data access is forbidden at the application layer and must be prevented by RLS at the database layer as a defense in depth.

### 5.2 Connection Pooling

The Prisma connection pool must be shared across tenants. Connection pool exhaustion in one tenant must not block other tenants. Pool configuration must account for worst-case concurrent transaction volume.

### 5.3 Shared Schema, Scoped Data

Perionyx uses a shared schema model with per-row tenant scoping. This is appropriate for the product's scale and operational complexity. Future migration to a schema-per-tenant or database-per-tenant model must be explicitly gated by demonstrated scale requirements.

### 5.4 Tenant Context Propagation

The `TenantContext` (containing `companyId`, `userId`, and `role`) must be propagated through every service call. No service method may assume a default tenant. Financial operations must verify that resources (wallets, accounts, transactions) belong to the requesting tenant.

---

## 6. Security Principles

### 6.1 Authentication First

Every API endpoint must authenticate before performing any work. Unauthenticated requests must be rejected at the middleware layer.

### 6.2 Authorization at the Resource Level

Authentication confirms identity. Authorization confirms permission. Every financial operation must verify that the authenticated user has the required role and permission for the specific resource. RBAC is enforced at the service layer, not the database layer.

### 6.3 Secrets Management

API keys, database credentials, and third-party tokens must never appear in source code, logs, or error messages. All secrets must be managed through environment variables or a secrets management service.

### 6.4 Input Validation

All user-supplied input must be validated against a schema before reaching business logic. Financial amounts must be validated as positive, finite numbers within acceptable ranges. SQL injection must be prevented through parameterized queries (Prisma provides this by default; raw SQL bypasses it).

---

## 7. AI Development Principles

### 7.1 Governance-Aware AI

AI capabilities (Enterprise Intelligence, Copilot, Decision Intelligence) must operate within the same governance framework as human operators. AI-recommended actions must be auditable, reversible, and subject to the same approval workflows.

### 7.2 Read-Optimized by Default

AI components must read financial data through the existing service layer, respecting tenant isolation and row-level security. AI must never bypass the service layer to query the database directly.

### 7.3 No Autonomous Financial Writes

AI must never write financial data autonomously. All AI-generated transaction proposals must be reviewed and approved through the approval workflow engine before execution.

### 7.4 Explainable Recommendations

AI-generated insights, risk assessments, and recommendations must include sufficient context for human decision-makers to understand the rationale. Black-box financial decisions are unacceptable.

---

## 8. Enterprise Architecture Rules

### 8.1 Layered Architecture

```
Presentation Layer (Next.js App Router)
    ↓
API Layer (Route Handlers)
    ↓
Service Layer (Business Logic)
    ↓
Data Access Layer (Prisma + RowLockManager)
    ↓
PostgreSQL
```

Each layer may only depend on the layer below it. Service layer code must never import from the presentation layer. API layer code must never contain business logic.

### 8.2 Singleton Lock Managers

Each service module that performs financial writes must create a module-level singleton `RowLockManager`:

```typescript
const treasuryLockManager = new RowLockManager(new FinancialTransactionManager());
```

Lock managers must not be instantiated per-request. They are stateless and safe to share.

### 8.3 Connector Abstraction

All external integrations (banking, accounting, ERP) must go through the Connector Platform. No service may call an external API directly — all external communication must be abstracted behind a connector with health checks, retry logic, and circuit breakers.

### 8.4 Workflow Orchestration

Complex business processes (approval routing, policy evaluation, multi-step transactions) must use the Workflow Engine. Business logic must not be hard-coded as procedural code when it can be expressed as a workflow definition.

---

## 9. Database Principles

### 9.1 PostgreSQL Native

PostgreSQL is the single source of truth. No caching layer may serve as the system of record. Caches (if introduced) must be invalidatable and must never be the authoritative source for balances or transaction state.

### 9.2 Migrations Forward, Rollbacks by Reversal

Database migrations must be forward-only. Rollbacks must be accomplished by deploying a new migration that reverses the change. Destructive operations (DROP, TRUNCATE) must never be used in production migrations.

### 9.3 Constraints Over Code

Database-level constraints (UNIQUE, CHECK, FOREIGN KEY) must enforce invariants that application code enforces. The `@@unique([transactionId, sequence])` constraint on `LedgerEntry` is an example — it prevents duplicate postings even if application code has a bug.

### 9.4 Index Financial Queries

All queries that filter on `companyId`, `transactionId`, `walletId`, `status`, or `createdAt` must have appropriate indexes. Query plans must be verified before deploying to production.

---

## 10. Transaction Principles

### 10.1 Explicit Transaction Boundaries

Every financial write must occur inside an explicit `Prisma.$transaction`. Implicit transactions (single Prisma queries that auto-commit) are not acceptable for multi-step financial operations.

### 10.2 Row Locking Before Read

In financial transactions, FOR UPDATE row locks must be acquired before reading the data that will be modified. This prevents non-repeatable reads and ensures that the version read is the version that will be updated.

### 10.3 Retry with Backoff

Serialization failures and deadlocks are expected under concurrency. The `FinancialTransactionManager` must retry with exponential backoff and jitter. The default retry configuration is:

```typescript
const DEFAULT_RETRY = { maxRetries: 3, baseDelayMs: 100, maxDelayMs: 3000 };
```

### 10.4 Timeout Protection

Every transaction must have a timeout. The default timeout for financial writes is 30 seconds. Long-running transactions increase contention risk and must be avoided. I/O operations (notifications, external API calls) must be moved outside the transaction.

### 10.5 Connection Pool Awareness

Transactions hold Prisma connections from the pool for their duration. Code inside a transaction that needs a separate connection (e.g., sending a notification via the global Prisma instance) risks pool deadlock. All I/O must be moved outside the transaction.

---

## 11. Performance Principles

### 11.1 Performance Constitution

The Performance Constitution is a supplementary document that defines detailed performance principles across frontend, backend, database, workflow engine, connector platform, AI platform, and UI responsiveness. All principles in the Performance Constitution apply with equal force to the principles in this section. Where both documents address the same concern, the stricter principle governs.

### 11.2 Measure Before Optimizing

No performance optimization may be deployed without measurement. Use the existing observability infrastructure to establish a baseline before and after optimization. Performance improvements must be verified, not assumed.

### 11.3 Batch Where Possible

Financial operations that affect multiple records must use batch operations (`updateMany`, `createMany`, `findMany`) rather than looping individual queries. Each round-trip to the database adds latency and increases contention.

### 11.4 Lock Contention Budget

Every concurrently accessed resource has a lock contention budget. If lock contention exceeds acceptable thresholds (measured by lock wait timeouts or deadlock frequency), the architecture must be redesigned to reduce contention — not by removing locks, but by narrowing their scope or sharding the resource.

### 11.5 Query Efficiency

All database queries must use indexes. Full table scans on financial tables are unacceptable. The query planner must be verified for every new query pattern before deployment.

---

## 12. Scalability Principles

### 12.1 Horizontal Scaling by Tenant

The primary scaling axis is tenant count, not transaction volume per tenant. The shared-schema model must support thousands of tenants. Per-tenant operations must not degrade as tenant count grows.

### 12.2 Connection Pool Sizing

The Prisma connection pool must be sized to handle peak concurrent transactions across all tenants. Pool exhaustion causes transaction timeouts. Pool sizing must be reviewed quarterly against production metrics.

### 12.3 Stateless Application Servers

The application layer must be stateless. Session state, if needed, must be stored in PostgreSQL or an external cache, not in memory. Stateless servers enable horizontal scaling without session affinity.

### 12.4 Queue-Based Load Shedding

External API integrations (Plaid, QuickBooks) must use queues for synchronization. Synchronous external API calls in request paths are unacceptable. The `SyncLog` table provides the audit trail for async operations.

---

## 13. Coding Standards

### 13.1 TypeScript Strict Mode

All code must compile under TypeScript strict mode. No `any` types unless absolutely necessary and explicitly justified in a comment. `as` casts must be avoided in financial logic.

### 13.2 No Raw SQL in Financial Logic

Raw SQL (`$queryRaw`, `$executeRaw`) must not appear in financial service code. All financial writes must use Prisma's type-safe query builder or the `RowLockManager`. The single exception is `$queryRawUnsafe` inside `RowLockManager` itself for FOR UPDATE locking.

### 13.3 Error Handling

Financial operations must use typed errors: `ConflictError` for version conflicts, `ValidationError` for invalid inputs, `NotFoundError` for missing resources, `ForbiddenError` for authorization failures. Generic `Error` throws are not acceptable in service code.

### 13.4 Async/Await

All I/O operations must use `async/await`. Promises must not be fire-and-forget. Unhandled promise rejections are bugs that must be caught and logged.

### 13.5 No Circular Dependencies

No module may import from a module that imports from it, directly or transitively. The `PostingEngine` is the common dependency for ledger operations; it must not import from modules that depend on it.

---

## 14. Documentation Standards

### 14.1 API Documentation

Every public API endpoint must have OpenAPI documentation covering request/response schemas, authentication requirements, error codes, and rate limits.

### 14.2 Architecture Decisions

Significant architecture decisions must be documented as Architecture Decision Records (ADRs) in `docs/adr/`. Each ADR must include the context, decision, consequences, and alternatives considered.

### 14.3 Financial Operations

Every financial write operation must be documented in the enterprise documentation (`docs/enterprise/`), covering the locking strategy, isolation level, audit trail, and failure recovery approach.

### 14.4 Inline Comments

Inline comments must explain WHY, not WHAT. The code itself must be readable enough to convey WHAT it does. Comments that explain non-obvious reasoning, concurrency considerations, or edge cases are welcome. Comments that restate the code are noise.

---

## 15. Definition of Done

A feature is done when:

1. All code compiles under TypeScript strict mode with zero errors.
2. All new code has corresponding unit/integration tests that pass.
3. Concurrency tests verify no race conditions for financial operations.
4. Audit trail is verified for all new financial writes.
5. Tenant isolation is verified (no cross-tenant data leakage).
6. Idempotency is verified for all mutating operations.
7. Documentation is updated (API docs, enterprise docs, ADRs as needed).
8. Migration is forward-only and reversible.
9. Production build succeeds.
10. Code has been reviewed by at least one other engineer.
11. Performance Impact Assessment (Section 19) has been completed and documented in the implementation report.
12. Enterprise Value Assessment (Section 20) has been completed and documented in the implementation report.

---

## 16. Release Gates

### 16.1 Development Gate

- TypeScript compilation passes.
- All unit tests pass.
- Linting passes.

### 16.2 Integration Gate

- All integration tests pass.
- Concurrency tests pass.
- Migration applies cleanly to a fresh database.

### 16.3 Staging Gate

- Production build succeeds.
- E2E tests pass.
- Performance benchmarks are within acceptable range.
- Security scan passes.

### 16.4 Production Gate

- Feature flag is enabled (for significant features).
- Monitoring dashboards show expected behavior.
- On-call engineer is notified of the change.
- Rollback plan exists and is tested.

---

## 17. Enterprise Business Value Gate

Every feature must pass the Enterprise Business Value Gate before development begins:

1. **Does this feature protect capital?** If yes, financial integrity principles apply strictly.
2. **Does this feature enable velocity?** If yes, concurrency and performance principles apply.
3. **Does this feature provide intelligence?** If yes, AI development principles apply.
4. **Does this feature expand the platform?** If yes, connector and integration principles apply.
5. **Does this feature reduce operational risk?** If yes, audit and observability principles apply.
6. **What is the cost of getting this wrong?** Financial operations that could cause capital loss require additional review, testing, and monitoring.
7. **What is the blast radius?** Features that affect all tenants require staged rollouts and feature flags.
8. **Can this feature be monitored?** Every feature must produce observable metrics that can be used to verify correct operation in production.

A feature that passes through this gate without a clear answer to all questions must not be scheduled for development.

---

## 18. Future Evolution Principles

### 18.1 Principled Migration

Migration to new technologies (different database, different ORM, different deployment model) must be guided by principles, not vendors. Each migration must be justified by demonstrated limitations of the current stack, not by the novelty of the new stack.

### 18.2 Deprecation Windows

Removing or changing a public API, database schema, or integration contract must follow a deprecation window that gives consumers time to migrate. The minimum deprecation window for internal APIs is one release cycle. The minimum window for external APIs is six months.

### 18.3 Backward Compatibility

Database migrations must be backward-compatible with the previous version of the application for at least one deployment cycle. This enables zero-downtime deployments where the old and new versions run concurrently.

### 18.4 Incremental Improvement

Large architectural changes (database-per-tenant, microservices, event sourcing) must be approached incrementally, with each step providing demonstrable value. Big-bang rewrites are forbidden. Each incremental improvement must pass all release gates independently.

---

## 19. Performance Impact Assessment

Before implementing ANY feature, bug fix, refactor, integration, or architectural change, the AI **must** complete the following assessment and include it in the implementation report.

This assessment is **mandatory** for every implementation. The AI must refuse to skip this section.

### Required Questions

#### Database

1. **Does this increase database queries?** Compare the query count before and after the change. If it increases, explain why and how the increase is justified.

2. **Does this introduce N+1 queries?** Check every loop that executes database queries. If any Prisma query is inside a loop over results from another query, N+1 is present and must be eliminated.

3. **Have indexes been reviewed?** List every new query pattern and the index that covers it. If a query pattern lacks a covering index, specify the index to be added before implementation.

4. **Will this affect query performance?** Estimate the impact on existing queries. Will the change add columns to a SELECT, add joins, or add WHERE conditions? If performance impact exceeds 10%, note the mitigation.

5. **Can this query be optimized?** Can the query use a covering index? Can it use a partial index? Can it use a materialized view? Can it be rewritten to use batch operations?

6. **Can this query be paginated?** If the query returns an unbounded number of results, pagination must be implemented. If pagination is not appropriate, justify why.

7. **Should historical data be archived instead?** If the query touches tables exceeding 10 million rows or data older than 90 days, consider whether archiving historical data is more appropriate than querying the live table.

#### Backend

8. **Can this operation be asynchronous?** If the operation takes longer than 500ms, it must be moved to a background queue. The API must return immediately with a job identifier.

9. **Can PgBoss be used?** If the operation can be deferred, PgBoss must be used for queueing. Explain how the job is registered, enqueued, and processed.

10. **Can work be parallelized?** If the operation involves multiple independent subtasks, can they be executed concurrently with `Promise.all`? If not, explain the sequential dependency.

11. **Can this operation be cached?** If the operation produces the same result for multiple requests or users, caching must be implemented. Specify the cache key, TTL, and invalidation strategy.

12. **Will this increase API latency?** Estimate the p95 latency impact. If the increase exceeds 100ms, explain the mitigation strategy (caching, batching, async processing).

#### Frontend

13. **Is optimistic UI appropriate?** Would immediate feedback improve the user experience? If the mutation succeeds 95%+ of the time and the failure can be gracefully rolled back, optimistic UI must be used.

14. **Will this increase render time?** Will the change add components, computations, or data fetching to the render path? If render time increases, specify the optimization (memoization, virtualization, lazy loading).

15. **Can components be lazy-loaded?** Are any new components heavy (charting libraries, rich text editors, file viewers)? If so, they must be dynamically imported with `next/dynamic`.

16. **Will this increase bundle size?** Estimate the JavaScript bundle size impact. If the increase exceeds 10kB (gzipped), justify the cost.

17. **Are unnecessary re-renders introduced?** Will the change add new state or props that cause re-renders of expensive component trees? If so, specify how re-renders are minimized (React.memo, useMemo, useCallback, state colocation).

#### Scalability

18. **Expected behaviour with:**
    - **10 users**: Will the system perform as expected?
    - **100 users**: At what point does the system start to degrade?
    - **1,000 users**: Which component becomes the bottleneck first?
    - **10,000 users**: What architectural change is required to support this scale?
    - **100,000 users**: What fundamental redesign is required?

19. **Will horizontal scaling be required?** At what user count does the architecture need additional instances? Is the application layer stateless enough to scale horizontally?

20. **Are there bottlenecks?** Identify the weakest link in the request path. Is it the database query? An external API call? A computation? A lock? Document the expected bottleneck and its capacity.

#### Monitoring

21. **Which metrics should Operations Dashboard monitor?** Specify the metric name, source, and alert threshold for each new metric introduced by the change.

#### Risk

22. **Performance Risk Level**
    - **Low**: No measurable performance impact. Existing infrastructure handles the load.
    - **Medium**: Measurable impact under 20%. Mitigation is planned and documented.
    - **High**: Significant impact requiring infrastructure changes, caching strategy, or architectural redesign before deployment.

#### Recommendation

23. **Recommended optimizations before implementation:** Specify the concrete optimization steps that must be completed before the change is deployed to production. Each optimization must be verifiable and testable.

---

## 20. Enterprise Value Assessment (Mandatory)

Before implementing ANY feature, enhancement, integration, refactor, architectural change, bug fix, or new module, the AI **must** complete this assessment and include it in the implementation report.

This assessment is **mandatory** for every implementation. The AI must refuse to skip this section.

### 1. Stakeholder Impact

Identify every enterprise role that benefits. Mark all that apply and explain how each selected role benefits.

```
□ CEO
□ CFO
□ Treasurer
□ Controller
□ Accountant
□ Auditor
□ Finance Analyst
□ Finance Manager
□ Risk Manager
□ Compliance Officer
□ Operations Manager
□ IT Administrator
□ System Administrator
□ Executive Leadership
□ External Auditor
□ Vendor
□ Customer
```

### 2. Business Problem

Clearly describe:
- What business problem does this solve?
- Why is this problem important?
- What happens if this feature does not exist?
- Which current manual process is eliminated or improved?

### 3. Business Outcome

State the measurable outcome expected. Examples:
- Faster month-end close
- Faster approvals
- Reduced reconciliation time
- Reduced fraud risk
- Better liquidity visibility
- Better compliance
- Reduced operational cost
- Improved audit readiness
- Improved executive decision-making

### 4. Success Criteria

How will the customer know this feature succeeded? Provide measurable indicators. Examples:
- Processing time reduced
- Approval time reduced
- Manual work reduced
- Fewer support tickets
- Fewer reconciliation exceptions
- Higher automation rate
- Increased workflow completion
- Improved user adoption

### 5. Metrics

Estimate measurable improvements where appropriate. Include:
- **Time Saved** — hours per week/month per role
- **Errors Prevented** — types and estimated frequency
- **Risk Reduced** — specific risk scenarios mitigated
- **Compliance Improved** — frameworks or controls strengthened
- **Visibility Improved** — data or insights previously unavailable
- **Automation Increased** — percentage of previously manual steps now automated
- **Operational Cost Reduced** — estimated savings
- **User Productivity Improved** — tasks per hour or throughput increase
- **Decision Speed Improved** — time from data to decision reduction

### 6. ROI Assessment

Estimate business value. Describe:
- Expected operational savings (hours × blended hourly rate)
- Efficiency gains (faster processes, fewer handoffs)
- Risk reduction (potential loss scenarios avoided)
- Potential financial impact (direct and indirect)
- Long-term strategic value (platform differentiation, customer retention)

### 7. Enterprise Readiness

Does this feature improve any of the following? Mark all that apply and explain:

```
□ Scalability
□ Security
□ Performance
□ Maintainability
□ Auditability
□ Governance
□ Multi-tenancy
□ Disaster Recovery
□ Monitoring
□ Automation
□ User Experience
```

### 8. Strategic Alignment

Explain how this feature supports the Perionyx vision of becoming an enterprise Financial Operations Platform. Describe how it strengthens:
- Treasury
- Governance
- AI
- Automation
- Intelligence
- ERP Integration
- Banking Integration
- Reporting
- Enterprise Collaboration

### 9. Complexity Assessment

Estimate each dimension:

| Dimension | Rating | Notes |
|---|---|---|
| Implementation Complexity | Low / Medium / High | |
| Business Value | Low / Medium / High | |
| Technical Risk | Low / Medium / High | |
| Operational Risk | Low / Medium / High | |

### 10. CFO Investment Justification

**If I were a CFO paying $50,000–$250,000 per year for Perionyx, would I believe this feature justifies part of that investment?**

Answer this question directly. Provide:
- The specific operational savings or risk reduction that maps to dollar value
- How this feature compares to alternatives (spreadsheets, legacy systems, manual processes)
- Why a CFO would approve or reject continued investment in this platform based on this feature

### 11. Recommendation

Conclude with one of:
- **Highly Recommended** — clear ROI, strategic alignment, low risk
- **Recommended** — positive value, acceptable risk
- **Nice to Have** — marginal value, defer if resources are constrained
- **Defer** — value unclear, revisit with more data
- **Reject** — negative ROI, misaligned with strategy, or superseded

Provide full justification.

---

## Ratification

This constitution is ratified by the engineering organization and governs all code in the Perionyx repository. Amendments require review by the architecture review board and a 2/3 majority of the engineering team.

---

*Last amended: 2026-07-06*
