# AI Engineering Playbook

**Version:** 1.0.0
**Status:** Ratified
**Scope:** All AI-assisted engineering on the Perionyx platform

> This playbook governs how AI coding assistants implement features. Every AI-generated change — whether suggested in a PR, written interactively, or proposed via Copilot — must comply with all mandatory rules herein. These rules are not guidelines. They are binding implementation constraints.

---

## 1. Constitution

The AI Engineering Playbook derives its authority from the Perionyx Engineering Constitution (`docs/architecture/perionyx-engineering-constitution.md`). Where this playbook is silent, the Constitution applies. Where this playbook conflicts with the Constitution, the Constitution prevails.

The Enterprise Readiness Checklist (`docs/architecture/enterprise-readiness-checklist.md`) is the quality gate. Every AI-generated implementation must satisfy every applicable checklist item before it can be considered complete.

---

## 2. Mandatory Implementation Rules

### 2.1 Service Layer Invariance

**Rule:** Always reuse existing services. Never duplicate business logic.

**Why:** Financial integrity depends on a single, verified code path for every operation. Duplicate logic introduces divergence risk — the duplicate path may fail to acquire locks, skip audit logging, or bypass idempotency checks.

**Implementation:**
- Before implementing a new capability, search the codebase for existing services that already provide the required functionality (TransactionsService, TreasuryService, PostingEngine, ApprovalWorkflow, BankReconciliationService, PolicyEngineService, AccountingService, PlaidService, ConnectorService).
- If a service method exists that satisfies 80% of the requirement, extend it rather than creating a new method.
- If a new method is needed on an existing service, add it to that service — do not create a new service.
- If a new service is needed, it must be justified in an ADR and approved through architecture review.

### 2.2 PostingEngine Monopoly

**Rule:** All wallet posting must go through `PostingEngine.postLedgerLines()`. This is the single source of truth for wallet debit/credit operations.

**Why:** Distributed posting logic across multiple services previously caused duplicate transaction code, inconsistent locking, and missing version checks. `postLedgerLines()` centralizes lock acquisition, balance verification, version checking, and ledger entry creation.

**Implementation:**
- TransactionsService.persistLedger() delegates to postingEngine.postLedgerLines().
- ApprovalWorkflow.completeTransaction() delegates to postingEngine.postLedgerLines().
- TreasuryService.transfer() and deposit() delegate to postingEngine.postLedgerLines().
- No new code path may write to Wallet.balance or LedgerEntry directly. All writes must flow through postLedgerLines().

### 2.3 Lock Manager Discipline

**Rule:** Every financial write must use RowLockManager. No exceptions.

**Why:** RowLockManager provides lock ordering (alphabetical by resource ID), timeout protection, deadlock detection, and `lockInTx()` for embedding locks inside existing transactions.

**Implementation:**
- Each service module that performs financial writes must have a module-level singleton: `const serviceLockManager = new RowLockManager(new FinancialTransactionManager())`.
- All row locks must be acquired via `lockInTx()` or `withLocks()`, never via raw SQL.
- Locks must be acquired before reading the data to be modified.
- `notificationService.broadcast()` and all I/O must be moved outside the lock callback.

### 2.4 FinancialTransactionManager Invariance

**Rule:** All retry-wrapped transactions must use FinancialTransactionManager.

**Why:** FinancialTransactionManager provides exponential backoff with jitter, serialization failure (P2034) and deadlock (40P01) retry, and transaction timeout. Raw Prisma `$transaction` must not be used for financial writes.

**Implementation:**
```typescript
// Correct
await financialTransactionManager.executeWrite(async (tx) => {
  const lockManager = new RowLockManager(financialTransactionManager);
  await lockManager.lockInTx(tx, [
    { table: 'Wallet', id: walletA.id },
    { table: 'Wallet', id: walletB.id },
  ]);
  // ... financial write logic
});

// Wrong
await prisma.$transaction(async (tx) => {
  // No retry, no timeout, no lock manager integration
});
```

### 2.5 Audit Trail Mandate

**Rule:** Every financial action must produce an AuditLog record. No exceptions.

**Why:** The audit trail is the system of record for regulatory compliance, dispute resolution, and operational debugging. An un-audited operation is an operation that cannot be verified.

**Implementation:**
- After any financial write succeeds, create an AuditLog entry with: actor identity (userId or "system"), action type (TRANSFER, DEPOSIT, APPROVAL, etc.), resource type, resource ID, and sufficient metadata to reconstruct the operation.
- Failed operations must also be audited with the error reason.

### 2.6 Version Check Integrity

**Rule:** All balance updates must use `updateMany` with a version condition and `version: { increment: 1 }`.

**Why:** Row locks prevent concurrent writes from interleaving, but they do not protect against stale-read-then-write within the same transaction. The version check is the second layer of defense.

**Implementation:**
```typescript
const { count } = await tx.wallet.updateMany({
  where: { id: walletId, version: wallet.version },
  data: { balance: newBalance, version: { increment: 1 } },
});
if (count === 0) throw new ConflictError('wallet version mismatch');
```

### 2.7 Tenant Scoping

**Rule:** Never bypass tenant isolation. Every query must scope by `companyId`.

**Why:** A single cross-tenant data leak in financial data is a catastrophic failure. Tenant isolation is enforced at both the application layer (companyId scoping) and the database layer (RLS).

**Implementation:**
- Every `findFirst`, `findMany`, `update`, `updateMany`, `delete`, `deleteMany` on a tenant-scoped model must include `companyId` in the `where` clause.
- Every `create` must set `companyId` from the TenantContext.
- Raw SQL queries must include a `companyId` filter.
- Never accept `companyId` from user input — always derive it from the authenticated session.

### 2.8 Idempotency Compliance

**Rule:** All mutating financial operations must be idempotent via `IdempotencyRecord`.

**Why:** Network retries, client retries, and AI retries can cause duplicate operations. Idempotency guarantees that the second execution of the same request produces the same result as the first.

**Implementation:**
- Before executing any financial write, check `IdempotencyRecord` for the provided `idempotencyKey`.
- If a record exists and the operation completed, return the previous response.
- If a record exists and the operation is in progress, return a 409 Conflict.
- If no record exists, create one, execute the operation, and update the record with the result — all within the same transaction.

### 2.9 Extension Over Replacement

**Rule:** Prefer extension over replacement. Enhance existing functionality rather than replacing it.

**Why:** Replacement introduces risk of regression in every downstream caller. Extension preserves backward compatibility while adding capability.

**Implementation:**
- Adding a new parameter with a default value (backward-compatible) is preferred over creating a new method signature.
- Adding a new optional field to a model is preferred over creating a new related model.
- Adding a new step to an existing workflow is preferred over creating a new workflow.

### 2.10 Composition Over Inheritance

**Rule:** Use composition, not inheritance, for service reuse.

**Why:** Inheritance creates tight coupling and makes it difficult to reason about code paths. Composition via constructor injection makes dependencies explicit and testable.

**Implementation:**
```typescript
// Correct
class TreasuryService {
  constructor(
    private postingEngine: PostingEngine,
    private notificationService: NotificationService,
    private auditService: AuditService,
  ) {}
}

// Wrong
class TreasuryService extends PostingEngine {
  // inheritance from a service
}
```

### 2.11 Enterprise Module Boundaries

**Rule:** Follow enterprise module boundaries. Each module owns its domain and must not reach into another module's database tables directly.

**Why:** Module boundaries enforce encapsulation and prevent spaghetti dependencies. The ledger module owns LedgerEntry, the treasury module owns TreasuryAccount, the transactions module owns Transaction.

**Implementation:**
- The module map is:
  - `ledger/` — LedgerEntry, Wallet, PostingEngine
  - `treasury/` — TreasuryAccount, TreasuryService, PlaidService
  - `transactions/` — Transaction, TransactionsService
  - `approval/` — ApprovalRule, ApprovalWorkflow, Approval
  - `accounting/` — AccountingInvoice, AccountingService
  - `reconciliation/` — BankReconciliationService
  - `policy/` — Policy, PolicyEngineService
  - `governance/` — GovernanceFramework
  - `connector/` — ConnectorConfig, ConnectorService
  - `audit/` — AuditService
- A treasury module implementation may import `PostingEngine` from the ledger module (it is a shared service). It must not directly query `LedgerEntry` — that is the ledger module's domain.
- If a module needs data owned by another module, it must go through that module's service layer.

### 2.12 Observability Integration

**Rule:** All new financial operations must integrate with the Operations metrics infrastructure.

**Why:** Unobservable operations cannot be debugged in production. Every transaction, lock acquisition, retry, and failure must be measurable.

**Implementation:**
- Structured logging at appropriate levels:
  - `info` — transaction started, transaction completed, lock acquired
  - `warn` — retry attempt, lock contention detected
  - `error` — transaction failed after all retries, deadlock not recoverable
- All logs must include: `companyId`, `transactionId` (if applicable), `operation` name, and `durationMs`.
- Retry count and success/failure metrics must be exposed.

### 2.13 Enterprise Intelligence Integration

**Rule:** Integrate Enterprise Intelligence when the feature involves data analysis, anomaly detection, or financial insight generation.

**Why:** Enterprise Intelligence is the platform's capability for governance-aware AI. Every new data analysis feature should leverage it rather than creating separate analysis logic.

**Implementation:**
- New dashboards, reports, or insight generators should use `EnterpriseIntelligenceService` for data access.
- AI-generated insights must include confidence scores and supporting evidence.
- All EI-generated outputs must be auditable.

### 2.14 Decision Intelligence Integration

**Rule:** Integrate Decision Intelligence when the feature involves recommending financial actions.

**Why:** Decision Intelligence provides risk assessment, recommendation scoring, and governance-aware action proposals. Bypassing it for recommendation features fragments the decision framework.

**Implementation:**
- Financial action recommendations (transfers, approvals, policy changes) must go through DecisionIntelligenceService.
- Decision Intelligence recommendations must be logged in the audit trail.
- All recommended actions must pass through the approval workflow before execution.

### 2.15 Copilot Integration

**Rule:** Integrate Copilot when the feature provides conversational or natural language access to financial data.

**Why:** Copilot is the platform's natural language interface. Every new conversational capability should extend Copilot rather than creating a standalone chatbot.

**Implementation:**
- New conversational capabilities must be added as Copilot tools, not as separate endpoints.
- Copilot tools must respect the same RBAC, tenant isolation, and audit requirements as the UI.
- Copilot tools must read through the service layer.

### 2.16 Backward Compatibility

**Rule:** Maintain backward compatibility. API changes, database migrations, and service method signature changes must not break existing callers.

**Why:** Perionyx is a platform with internal and potentially external consumers. Breaking changes erode trust and create migration burden.

**Implementation:**
- New parameters must have defaults that preserve existing behavior.
- Database columns must be nullable or have defaults when added.
- Deprecated methods must be marked with `@deprecated` JSDoc and retained for at least one minor version.
- Migration must be backward-compatible with the current application version for zero-downtime deploys.

### 2.17 Zero TypeScript Errors

**Rule:** All code must compile with zero TypeScript errors under strict mode.

**Why:** TypeScript strict mode catches entire classes of bugs at compile time: null references, incorrect types, and missing cases in discriminated unions. Financial code must not have these bugs.

**Implementation:**
- Run `pnpm typecheck` before every commit.
- No `any` types unless absolutely necessary and justified.
- No `as` casts in financial logic.
- No `@ts-ignore` or `@ts-expect-error` in committed code.
- All `null` and `undefined` must be handled explicitly.

### 2.18 Production Build

**Rule:** Every implementation must produce a passing production build.

**Why:** A compile-time error in the production build is a deployment blocker. Discovering it at deployment time, rather than development time, wastes the entire deployment cycle.

**Implementation:**
- Run `pnpm build` before marking any implementation as complete.
- The build must produce no errors and no warnings.

### 2.19 Documentation

**Rule:** Every implementation must include or update documentation.

**Why:** Undocumented features are undiscoverable, unmaintainable, and unverifiable. Documentation is the interface between the implementation and every future engineer.

**Implementation:**
- API documentation (OpenAPI) must be updated for new or changed endpoints.
- Enterprise documentation in `docs/enterprise/` must be updated for new financial operations, including locking strategy, audit trail, and failure recovery.
- ADRs must be created for significant architectural decisions.
- Inline comments must explain WHY, not WHAT.

---

## 3. Forbidden Practices

The following practices are strictly forbidden. AI-generated code that contains any of these will be rejected without review.

### 3.1 Direct Database Writes in Financial Logic

**Forbidden:** Writing to `Wallet.balance` or `LedgerEntry` directly in service code without going through `PostingEngine.postLedgerLines()`.

**Why:** Duplicate posting code is the most common source of financial integrity bugs. Every bypass of `postLedgerLines()` introduces risk of missing locks, version checks, or audit logging.

### 3.2 Raw SQL in Financial Services

**Forbidden:** Using `$queryRaw` or `$executeRaw` in financial service code.

**Why:** Raw SQL bypasses Prisma's type safety, making the code vulnerable to type errors in production. The sole exception is raw SQL inside `RowLockManager` internals for FOR UPDATE locking.

### 3.3 Implicit Transactions

**Forbidden:** Relying on Prisma's auto-commit for multi-step financial operations.

**Why:** Auto-commit means each Prisma query runs in its own transaction. If the operation involves multiple queries (read balance, check version, update balance, insert ledger entry), each query is a separate transaction — making the overall operation non-atomic.

### 3.4 Lock Bypass

**Forbidden:** Reading or writing a financial resource without acquiring the appropriate row lock.

**Why:** Lock-free reads followed by writes produce lost updates, non-repeatable reads, and phantom reads. Every financial write path must acquire FOR UPDATE locks before reading.

### 3.5 I/O Inside Locks

**Forbidden:** Calling `notificationService.broadcast()`, external APIs, or any I/O inside a `RowLockManager.withLocks()` callback.

**Why:** I/O inside locks holds the database connection and the row lock for the duration of the I/O operation, increasing contention risk and potentially causing connection pool deadlock.

### 3.6 Version Bypass

**Forbidden:** Updating wallet balances without a version check.

**Why:** The version check is the second layer of defense against race conditions. Bypassing it eliminates the optimistic locking safety net.

### 3.7 Audit Bypass

**Forbidden:** Performing a financial operation without creating an AuditLog record.

**Why:** An un-audited financial operation is equivalent to an operation that never happened. It cannot be verified, traced, or audited.

### 3.8 Tenant Isolation Bypass

**Forbidden:** Querying or writing data across tenants. Omitting `companyId` from a tenant-scoped query.

**Why:** Cross-tenant data access in a financial platform is a catastrophic security failure. There is no acceptable justification.

### 3.9 Fire-and-Forget Promises

**Forbidden:** Using `void` operator or `.catch(() => {})` to silently ignore promise rejections.

**Why:** Unhandled promise rejections in financial operations can lead to partial writes, inconsistent state, and silent data loss. Every promise must be awaited or explicitly handled.

### 3.10 Circular Dependencies

**Forbidden:** Importing module A from module B when B is imported by A (directly or transitively).

**Why:** Circular dependencies make testing impossible, create initialization order bugs, and make it impossible to reason about the dependency graph.

### 3.11 Mutation of Ledger Entries

**Forbidden:** Updating or deleting `LedgerEntry` records. Corrections must use reversal transactions.

**Why:** The ledger is immutable by design. Mutation destroys the audit trail and makes financial history untrustworthy.

### 3.12 Implicit Currency Assumptions

**Forbidden:** Assuming all wallets in a transaction share the same currency without explicit verification.

**Why:** Cross-currency transfers require currency conversion and separate posting per currency group. Assuming a single currency leads to incorrect balance calculations.

---

## 4. Definition of Complete Implementation

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
| 17 | No forbidden practices are present (see Section 3) | Code review |
| 18 | Enterprise Readiness Checklist score ≥ 90% with zero critical failures | Checklist audit |

> **A PR that does not satisfy every applicable criterion above must not be merged.** Partial compliance is non-compliance.

---

## 5. Implementation Workflow

When implementing a feature via AI assistance, follow this sequence:

1. **Explore** — Search existing code for relevant services, models, and patterns. Understand the module boundaries, existing lock strategies, and audit patterns.
2. **Plan** — Map the implementation against the Mandatory Implementation Rules. Identify which rules apply and how they will be satisfied.
3. **Implement** — Write code that satisfies every applicable rule. Reference existing implementations as templates.
4. **Verify** — Run `pnpm typecheck`, `pnpm build`, `pnpm vitest run`. Fix any failures.
5. **Audit** — Verify audit trail, tenant isolation, idempotency, and lock strategy through code review and test assertions.
6. **Document** — Update API docs, enterprise docs, and ADRs as needed.
7. **Gate** — Score against the Enterprise Readiness Checklist. Ensure ≥ 90% with zero critical failures in Financial Integrity, Concurrency, Transaction Safety, or Security.
8. **Submit** — Produce the PR with the completed checklist.

---

## 6. Enforcement

This playbook is enforced through:

- **Code Review**: Every PR must be reviewed with this playbook as the standard. The reviewer must verify compliance with every applicable rule.
- **Automated Checks**: CI must run `pnpm typecheck`, `pnpm build`, and `pnpm vitest run`.
- **Architecture Review Board**: Significant deviations from this playbook require approval from the architecture review board.
- **Checklist Gate**: The Enterprise Readiness Checklist must accompany every significant feature PR.

Violations of forbidden practices (Section 3) require immediate PR rejection and a team review of the AI implementation process.

---

*This playbook is part of the Perionyx Engineering Constitution framework and is maintained in `docs/architecture/`. Amendments require review by the architecture review board.*
