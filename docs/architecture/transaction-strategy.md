# Enterprise Transaction Strategy

**Version:** 1.0.0
**Status:** Ratified
**Scope:** All transactional financial operations on the Perionyx platform

> This document defines the transaction strategy for the Perionyx Enterprise Financial Operating System. Every financial write, every ledger entry, every balance update, and every concurrent operation must conform to the guarantees and patterns described herein.

---

## 1. ACID Principles

Perionyx relies on PostgreSQL for ACID guarantees. Every financial operation is designed to preserve these properties under concurrent access, hardware failure, and partial failure.

### 1.1 Atomicity

A financial operation must succeed completely or fail completely. Partial writes — where a debit succeeds but the corresponding credit fails — are unacceptable.

**How Perionyx achieves atomicity:**

- All multi-step financial operations are wrapped in `Prisma.$transaction`. If any step fails, all prior steps are rolled back.
- The `FinancialTransactionManager.executeWrite()` method is the single entry point for all atomic financial writes. It opens a Prisma transaction, executes the callback, and commits or rolls back as one unit.
- Idempotency records are created and updated within the same transaction as the financial operation. If the operation fails, the idempotency record is rolled back, allowing a clean retry.

```
┌──────────────────────────────────────────────┐
│           $transaction boundary               │
│                                                │
│  ├─ lock wallets (FOR UPDATE)                 │
│  ├─ read current balances + versions          │
│  ├─ validate sufficient funds                 │
│  ├─ create LedgerEntry records                │
│  ├─ updateMany Wallet (version check)         │
│  ├─ update Transaction status                 │
│  ├─ upsert IdempotencyRecord                  │
│  └─ commit (all or nothing)                  │
└──────────────────────────────────────────────┘
```

### 1.2 Consistency

Every transaction must leave the database in a valid state. For Perionyx, consistency means:

- All `LedgerEntry` records within a transaction form balanced debit/credit pairs (sum of debits = sum of credits, by currency).
- All `Wallet.balance` values reflect the net effect of all committed ledger entries.
- All `Transaction` status transitions follow the defined state machine.
- All audit records are created for every financial action.

Consistency is enforced at the application layer inside the transaction, not deferred to a background process. The `postLedgerLines()` method calls `assertBalancedLedger()` before any write occurs.

### 1.3 Isolation

Concurrent transactions must not interfere with each other. Perionyx uses a tiered isolation strategy:

| Operation Category | PostgreSQL Isolation | Mechanism |
|-------------------|---------------------|-----------|
| Read Only | READ COMMITTED | Default level, no modifications |
| Business Read | REPEATABLE READ | Consistent snapshot for decision logic |
| Financial Write | REPEATABLE READ | Row locks (FOR UPDATE) prevent write skew |
| Balance Transfer | REPEATABLE READ + row locks | Lock ordering + version check |
| Admin Config | READ COMMITTED | Low contention, low risk |

See Section 3 for the complete isolation level matrix.

### 1.4 Durability

Once a transaction commits, its effects must survive permanently. PostgreSQL's Write-Ahead Log (WAL) provides durability at the database level. Perionyx adds:

- **Immutable ledger**: `LedgerEntry` records are never updated or deleted. Once committed, they are permanent.
- **Audit log**: Every financial action produces an `AuditLog` record that is never mutated.
- **Idempotency records**: Allow safe retry of any operation whose commit confirmation was lost (e.g., network failure after commit but before response).

---

## 2. PostgreSQL Transaction Strategy

### 2.1 Transaction Model

Perionyx uses Prisma's `$transaction` API, which maps to PostgreSQL's `BEGIN` / `COMMIT` / `ROLLBACK`. All financial writes use the interactive transaction API:

```typescript
await prisma.$transaction(async (tx) => {
  // All operations use `tx` (Prisma TransactionClient), never the global `prisma`
  // This ensures all queries run within the same database session and transaction
});
```

### 2.2 Connection Pool Management

Each transaction holds a connection from the Prisma connection pool for its duration. This has critical implications:

- **Short-lived transactions**: Financial transactions must complete quickly. Long-running transactions exhaust the connection pool and block other operations.
- **I/O outside transactions**: `notificationService.broadcast()` and external API calls must never appear inside a transaction. They hold the connection idly while waiting for I/O.
- **Pool sizing**: The connection pool must be sized to handle peak concurrent financial transactions. Default sizing starts at `pool: { min: 2, max: 10 }` per replica and must be tuned against production metrics.

### 2.3 Transaction Options

```typescript
interface TransactionOptions {
  isolationLevel?: IsolationLevel;  // Default: RepeatableRead for writes
  maxWait?: number;                  // Time to wait for a pool connection (default: 2000ms)
  timeout?: number;                  // Max transaction lifetime (default: 15000ms)
  retry?: RetryConfig;               // { maxRetries: 3, baseDelayMs: 100, maxDelayMs: 3000 }
}
```

### 2.4 Raw SQL

Raw SQL is prohibited in financial service code. The sole exception is `$queryRawUnsafe` inside `RowLockManager` internals for issuing `SELECT ... FOR UPDATE` — which Prisma's type-safe API does not expose natively.

---

## 3. Isolation Level Matrix

### 3.1 PostgreSQL Isolation Levels

| Level | Dirty Read | Non-Repeatable Read | Phantom Read | Write Skew | Serialization Anomaly |
|-------|-----------|---------------------|-------------|------------|----------------------|
| READ UNCOMMITTED | Possible | Possible | Possible | Possible | Possible |
| READ COMMITTED | Protected | Possible | Possible | Possible | Possible |
| REPEATABLE READ | Protected | Protected | Protected* | **Possible** | Possible |
| SERIALIZABLE | Protected | Protected | Protected | Protected | Protected |

\* PostgreSQL's REPEATABLE READ prevents phantom reads for most cases due to its MVCC implementation.

### 3.2 Perionyx Isolation Assignments

```
┌─────────────────────┬────────────────────┬──────────────────────────┐
│ Category            │ Isolation Level    │ Protection Strategy      │
├─────────────────────┼────────────────────┼──────────────────────────┤
│ Read Only           │ READ COMMITTED     │ No protection needed —   │
│ (list accounts,     │                    │ no writes occur          │
│  transaction history)│                    │                          │
├─────────────────────┼────────────────────�──────────────────────────┤
│ Business Read       │ REPEATABLE READ    │ Consistent snapshot for  │
│ (read balance before│                    │ multi-statement business │
│  authorizing)       │                    │ decisions                │
├─────────────────────┼────────────────────�──────────────────────────┤
│ Financial Write     │ REPEATABLE READ    │ Row locks (FOR UPDATE)   │
│ (single wallet      │                    │ prevent concurrent       │
│  debit/credit)      │                    │ modification             │
├─────────────────────┼────────────────────�──────────────────────────┤
│ Balance Transfer    │ REPEATABLE READ    │ Row locks + version      │
│ (multi-wallet,      │                    │ check + atomic           │
│  double-entry)      │                    │ updateMany               │
├─────────────────────┼────────────────────�──────────────────────────┤
│ Admin Config        │ READ COMMITTED     │ Unique constraints +     │
│ (policies, rules,   │                    │ app-level validation     │
│  connectors)        │                    │                          │
└─────────────────────┴────────────────────┴──────────────────────────┘
```

### 3.3 Why Not SERIALIZABLE

PostgreSQL's SERIALIZABLE isolation (Serializable Snapshot Isolation) prevents all anomalies including write skew. However, it has significant costs:

- **Higher abort rate**: SSI aborts any transaction whose serialization order cannot be guaranteed. Under contention, abort rates can reach 10–30%.
- **Retry complexity**: Every SERIALIZABLE transaction must implement retry logic, including re-reading all data.
- **Connection pool pressure**: Retries consume additional connection pool slots, increasing contention.

Perionyx's strategy is to use REPEATABLE READ combined with explicit row locks and optimistic version checks. This provides serializable-equivalent guarantees for the specific patterns we use (known resources locked in a fixed order) without the abort overhead of SSI.

**Exception**: Operations that cannot enumerate all resources in advance (e.g., aggregate queries over many wallets) may require SERIALIZABLE. These cases are reviewed individually.

---

## 4. FinancialTransactionManager Responsibilities

The `FinancialTransactionManager` (defined in `src/lib/financial-transaction/`) is the foundation layer for all transactional financial operations.

### 4.1 Core API

```typescript
class FinancialTransactionManager {
  executeWrite<T>(
    fn: (tx: TransactionClient) => Promise<T>,
    options?: TransactionOptions,
  ): Promise<T>;

  executeRead<T>(
    fn: (tx: TransactionClient) => Promise<T>,
    options?: Pick<TransactionOptions, 'isolationLevel'>,
  ): Promise<T>;
}
```

### 4.2 Responsibilities

| Responsibility | Implementation |
|---------------|----------------|
| **Transaction lifecycle** | Opens, commits, and rolls back Prisma `$transaction` |
| **Isolation enforcement** | Sets `isolationLevel` on every transaction |
| **Retry on serialization failure** | Catches `P2034` (Prisma serialization error) and retries |
| **Retry on deadlock** | Catches `40P01` (PostgreSQL deadlock detected) and retries |
| **Exponential backoff** | `baseDelayMs: 100`, multiplier: 2×, jitter: ±25% |
| **Timeout enforcement** | Sets `timeout` on transaction options, aborts if exceeded |
| **Connection pool back-pressure** | Configures `maxWait` to fail fast when pool is exhausted |

### 4.3 Retry Configuration

```typescript
const DEFAULT_RETRY: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 100,
  maxDelayMs: 3000,
};
```

| Retry | Delay (base 100ms, jitter ±25%) |
|-------|--------------------------------|
| 1 | 75–125ms |
| 2 | 150–250ms |
| 3 | 300–500ms |
| 4+ | Clamped to maxDelayMs (3000ms) |

### 4.4 Non-Responsibilities

The `FinancialTransactionManager` does not:

- Acquire row locks (delegated to `RowLockManager`)
- Perform optimistic version checks (done in service code via `updateMany`)
- Create audit records (responsibility of the calling service)
- Handle idempotency (checked before calling `executeWrite`)

---

## 5. Row Locking Strategy

### 5.1 Purpose

Row locks prevent concurrent transactions from reading or modifying the same rows simultaneously. In Perionyx, they serve three purposes:

1. **Prevent write skew**: Two transactions reading the same wallet balance before either writes would both see the old balance. FOR UPDATE ensures the second transaction waits until the first commits.
2. **Prevent non-repeatable reads**: Re-reading a locked row within the same transaction always returns the same data.
3. **Provide ordered access**: Lock ordering (alphabetical by resource ID) prevents deadlocks.

### 5.2 RowLockManager API

```typescript
class RowLockManager {
  constructor(private ftm: FinancialTransactionManager);

  // Opens its own transaction, acquires locks, calls fn, commits
  withLocks<T>(
    locks: LockTarget[],
    fn: (tx: TransactionClient) => Promise<T>,
  ): Promise<T>;

  // Acquires locks inside an existing transaction (no commit)
  lockInTx(
    tx: TransactionClient,
    locks: LockTarget[],
  ): Promise<void>;

  // Non-blocking check (NOWAIT) — throws if lock not immediately available
  tryLock(
    tx: TransactionClient,
    locks: LockTarget[],
  ): Promise<boolean>;
}
```

### 5.3 Lock Target Specification

```typescript
interface LockTarget {
  table: EntityTable;        // 'Wallet' | 'TreasuryAccount' | 'Transaction'
  id: string;                // UUID of the row to lock
  mode?: 'FOR UPDATE'        // Default: FOR UPDATE
       | 'FOR NO KEY UPDATE'
       | 'FOR SHARE'
       | 'FOR KEY SHARE';
}
```

### 5.4 Lock Ordering

Locks must be acquired in alphabetical order by `{table}:{id}` to prevent deadlocks:

```
Internal Transfer between Wallet A and Wallet B:
  1. Lock "Wallet:A" (sorted: "Wallet:A" < "Wallet:B")
  2. Lock "Wallet:B"

The reverse order would be a deadlock risk if concurrent transfers
in opposite directions are attempted.
```

The `RowLockManager` sorts locks automatically before acquisition. No service code needs to specify ordering.

### 5.5 FOR UPDATE Semantics

```sql
SELECT "id", "balance", "version" FROM "Wallet" WHERE "id" = $1 FOR UPDATE;
```

- Acquires an exclusive row-level lock.
- Other transactions attempting `FOR UPDATE`, `FOR NO KEY UPDATE`, `FOR SHARE`, or `FOR KEY SHARE` on the same row will wait.
- Lock is released at transaction COMMIT or ROLLBACK.
- `SELECT` without `FOR UPDATE` reads the committed snapshot (ignores locks).

### 5.6 NOWAIT and SKIP LOCKED

- **`tryLock()`** uses `FOR UPDATE NOWAIT` — fails immediately if the row is locked, rather than waiting. Used for optimistic scenarios where waiting is unacceptable.
- **`SKIP LOCKED`** is available for batch processing where skipping currently-locked rows is acceptable (e.g., reconciliation batch jobs).

### 5.7 Where Locks Are Required

| Resource | Operation | Lock Mode |
|----------|-----------|-----------|
| Wallet | Any balance debit/credit | FOR UPDATE |
| TreasuryAccount | Deposit, transfer, sync balance | FOR UPDATE |
| Transaction | Status transition (PENDING → COMPLETED) | FOR UPDATE |
| ReconciliationMatch | Approve/reject match | FOR UPDATE |

---

## 6. Optimistic Locking Strategy

### 6.1 Purpose

Row locks prevent concurrent writes from interleaving, but they do not protect against a stale read within the same transaction:

```
T1: FOR UPDATE Wallet A → reads balance = 100, version = 5
T2: (waits for T1's lock)
T1: update Wallet A set balance = 120, version = 6 where id = A and version = 5
T1: commit
T2: FOR UPDATE Wallet A → reads balance = 120, version = 6
T2: update Wallet A set balance = 80, version = 7 where id = A and version = 6
T2: commit
```

In this case, row locks are sufficient. But what if T2 reads the wallet before T1 commits (in a different transaction, without FOR UPDATE)? Then T2 has a stale version. The optimistic version check catches this.

**Row locks prevent concurrent access. Version checks prevent stale write.**

### 6.2 Version Check Pattern

```typescript
const { count } = await tx.wallet.updateMany({
  where: {
    id: walletId,
    version: expectedVersion,  // Version we read earlier
  },
  data: {
    balance: newBalance,
    version: { increment: 1 }, // Atomic increment
  },
});

if (count === 0) {
  throw new ConflictError(
    `Wallet ${walletId}: version mismatch. Expected ${expectedVersion}`
  );
}
```

### 6.3 Models with Version Fields

| Model | Version Field | Why |
|-------|--------------|-----|
| Wallet | `version: Int @default(1)` | Balance updates — highest contention point |
| TreasuryAccount | `version: Int @default(1)` | Balance syncs from Plaid + manual deposits |
| Transaction | `version: Int @default(1)` | Status transitions (double-completion protection) |
| LedgerEntry | Not needed | Immutable — never updated after creation |
| ConnectorConfig | `version: Int @default(1)` | Configuration updates by concurrent admins |
| ApprovalRule | `version: Int @default(1)` | Concurrent policy updates |
| PolicyException | `version: Int @default(1)` | Concurrent exception handling |
| Policy | `version: Int @default(1)` | Concurrent policy modifications |
| AccountControl | `version: Int @default(1)` | Control modifications |
| GovernanceFramework | `version: Int @default(1)` | Framework amendments |

### 6.4 Version Field Properties

- `@default(1)` — starts at 1 (not 0) to avoid confusion with unset values.
- Incremented atomically via `version: { increment: 1 }` — never manually set.
- Checked in the `WHERE` clause of `updateMany` — if the version has changed since the read, zero rows are updated and a `ConflictError` is thrown.
- When a `ConflictError` is thrown, the caller must re-read the current state and retry the operation.

```
┌──────────────────────────────────────────────┐
│  Read Wallet (balance=100, version=5)         │
│                                               │
│  UPDATE Wallet                                │
│  SET balance=80, version=version+1            │
│  WHERE id='A' AND version=5                   │
│                                               │
│  ┌─ count === 1: Success, committed           │
│  └─ count === 0: ConflictError → retry       │
└──────────────────────────────────────────────┘
```

---

## 7. Deadlock Handling

### 7.1 Deadlock Detection

PostgreSQL automatically detects deadlocks. When two transactions hold locks that the other needs, PostgreSQL chooses one as the victim and aborts it with error code `40P01`:

```
ERROR:  deadlock detected
DETAIL:  Process 123 waits for ShareLock on transaction 456; blocked by process 789.
HINT:  See server log for query details.
```

### 7.2 Deadlock Prevention

Perionyx prevents deadlocks through:

1. **Lock ordering**: All locks are acquired in alphabetical order by `{table}:{id}`. This guarantees a global lock order and eliminates circular wait conditions.
2. **Consistent lock acquisition order across all services**: Every financial operation that locks wallets does so through `RowLockManager.lockInTx()`, which enforces the ordering. No service code acquires locks directly.

### 7.3 Deadlock Recovery

Despite prevention, deadlocks can still occur (e.g., due to lock promotion from FOR KEY SHARE to FOR UPDATE, or due to PostgreSQL internal locks). Recovery strategy:

1. **Detect**: `FinancialTransactionManager.executeWrite()` catches `40P01`.
2. **Retry**: The transaction retries with exponential backoff (see Section 8).
3. **Log**: The deadlock is logged with transaction metadata for operational visibility.
4. **Alert**: If retries are exhausted, an alert is fired for operational review.

```
┌──────────────────────────────────────────────────────────┐
│ Deadlock detected (40P01)                                 │
│                                                          │
│  ├─ Is this a retryable deadlock?                        │
│  │   └─ Yes → Retry (exponential backoff)                │
│  │                                                       │
│  └─ Repeated deadlocks on the same resources?            │
│      └─ Yes → Review lock ordering and contention        │
│                                                          │
│ After maxRetries exhausted:                              │
│  └─ Log error, return failure to caller                  │
│     Caller may retry at a higher level (idempotency)     │
└──────────────────────────────────────────────────────────┘
```

### 7.4 Deadlock vs. Serialization Failure

| Error | Code | Cause | Perionyx Action |
|-------|------|-------|-----------------|
| Deadlock detected | `40P01` | Circular lock dependency | Retry with backoff |
| Serialization failure | `P2034` | SSI conflict or constraint violation | Retry with backoff |
| Lock timeout | `55P03` | `NOWAIT` or `lock_timeout` | Report immediately (not retryable) |

---

## 8. Retry Strategy

### 8.1 When Retries Occur

| Condition | Error | Retryable? |
|-----------|-------|------------|
| Deadlock | `40P01` | Yes |
| Serialization failure | `P2034` | Yes |
| Version conflict | `ConflictError` | Yes (re-read and retry) |
| Connection pool timeout | `maxWait` exceeded | No (report immediately) |
| Transaction timeout | `timeout` exceeded | No (report immediately) |
| Validation error | `ValidationError` | No (re-submit with corrected input) |
| Authorization failure | `ForbiddenError` | No (re-submit with valid credentials) |

### 8.2 Retry Algorithm

```typescript
async function executeWithRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = { maxRetries: 3, baseDelayMs: 100, maxDelayMs: 3000 },
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isRetryable(error)) throw error;
      if (attempt === config.maxRetries) break;
      await delay(calculateBackoff(attempt, config));
    }
  }

  throw lastError;
}
```

### 8.3 Backoff Calculation

```typescript
function calculateBackoff(attempt: number, config: RetryConfig): number {
  const exponential = config.baseDelayMs * Math.pow(2, attempt);
  const clamped = Math.min(exponential, config.maxDelayMs);
  const jitter = clamped * (0.75 + Math.random() * 0.5); // ±25%
  return Math.floor(jitter);
}
```

### 8.4 Retry and Idempotency

Retries at the transaction level (inside `FinancialTransactionManager`) are different from retries at the API level (idempotency keys):

- **Transaction-level retry**: The entire transaction aborted and is retried from scratch. The idempotency record may or may not have been created. Safe to retry because the transaction rolled back completely.
- **API-level retry**: The client retries the same request with the same `idempotencyKey`. The system returns the previous response without re-executing the operation.

Both mechanisms work together. Transaction-level retries handle transient database conflicts. API-level retries handle network failures and timeouts.

---

## 9. Financial Write Lifecycle

The financial write lifecycle describes the stages a single financial operation passes through, from input validation to audit.

```
┌──────────────────────────────────────────────────────────────────┐
│                      FINANCIAL WRITE LIFECYCLE                    │
│                                                                   │
│  INPUT → VALIDATE → AUTHORIZE → EXECUTE → AUDIT → RESPOND        │
│                                          │                       │
│                                    ┌─────┴──────┐                │
│                                    │  $transaction               │
│                                    │  ├─ lock rows               │
│                                    │  ├─ verify balances         │
│                                    │  ├─ check versions          │
│                                    │  ├─ create ledger entries    │
│                                    │  ├─ update wallets          │
│                                    │  └─ commit                  │
│                                    └────────────┘                │
└──────────────────────────────────────────────────────────────────┘
```

### Stage 1: Input Validation

- Validate input schema (amount is positive, finite, within range)
- Validate wallet/account existence and tenant ownership
- Validate currency compatibility (for cross-currency, verify conversion rate exists)
- Check idempotency key (return previous response if already processed)

### Stage 2: Authorization

- Check approval policies (does this operation require approval?)
- Route to approval workflow if needed (status → PENDING_APPROVAL)
- Verify actor permissions against resource (RBAC check)

### Stage 3: Execution

The execution stage is a single atomic transaction:

```
BEGIN;

  -- 3a. Acquire row locks (FOR UPDATE) in alphabetical order
  SELECT * FROM "Wallet" WHERE id = $1 FOR UPDATE;
  SELECT * FROM "Wallet" WHERE id = $2 FOR UPDATE;

  -- 3b. Read current state under lock
  Read Wallet A: balance = 100, version = 5
  Read Wallet B: balance = 200, version = 3

  -- 3c. Verify sufficient funds (Wallet A: 100 >= 50 ✓)
  -- 3d. Calculate new balances (A: 50, B: 250)

  -- 3e. Create immutable ledger entries
  INSERT INTO "LedgerEntry" (id, transactionId, walletId, amount, ...) VALUES (...);
  INSERT INTO "LedgerEntry" (id, transactionId, walletId, amount, ...) VALUES (...);

  -- 3f. Update wallet balances with version check
  UPDATE "Wallet" SET balance = 50, version = version + 1 WHERE id = $1 AND version = 5;
  -- affected: 1 (success)
  UPDATE "Wallet" SET balance = 250, version = version + 1 WHERE id = $2 AND version = 3;
  -- affected: 1 (success)

  -- 3g. Update transaction status
  UPDATE "Transaction" SET status = 'COMPLETED', version = version + 1 WHERE id = $3;

  -- 3h. Record idempotency
  UPSERT INTO "IdempotencyRecord" (...) VALUES (...);

COMMIT;
```

### Stage 4: Audit

After the transaction commits (outside the transaction boundary):

```
recordAudit({
  companyId,
  userId,
  action: 'TRANSFER',
  resourceType: 'Transaction',
  resourceId: transactionId,
  metadata: { sourceWalletId, destWalletId, amount, currency },
});
```

### Stage 5: Response

Return the completed operation to the caller. If any stage before execution failed, return the appropriate error. If execution failed after exhausting retries, return a 500 error — the idempotency key ensures the client can retry safely.

---

## 10. Transaction Lifecycle

The transaction lifecycle describes the state machine that every `Transaction` record follows.

```
┌──────────────────────────────────────────────────────────────────┐
│                      TRANSACTION LIFECYCLE                        │
│                                                                   │
│  ┌─────────┐     ┌──────────────────┐     ┌───────────┐          │
│  │ PENDING │────→│ PENDING_APPROVAL │────→│ PROCESSING│          │
│  └─────────┘     └──────────────────┘     └───────────┘          │
│       │                                      │     │             │
│       │                                      │     │             │
│       └──────────────────────┬───────────────┘     │             │
│                              │                     │             │
│                              ▼                     ▼             │
│                         ┌──────────┐         ┌───────────┐       │
│                         │ COMPLETED│         │  FAILED   │       │
│                         └──────────┘         └───────────┘       │
│                                                                   │
│  Valid transitions:                                               │
│  ├─ PENDING → PROCESSING         (direct, no approval needed)    │
│  ├─ PENDING → PENDING_APPROVAL   (approval required)             │
│  ├─ PENDING_APPROVAL → PROCESSING(approval granted)              │
│  ├─ PENDING_APPROVAL → FAILED    (approval rejected)             │
│  ├─ PROCESSING → COMPLETED       (postLedgerLines succeeded)     │
│  └─ PROCESSING → FAILED          (postLedgerLines failed)        │
└──────────────────────────────────────────────────────────────────┘
```

### State Transition Requirements

| Transition | Guard | Effect |
|------------|-------|--------|
| PENDING → PROCESSING | No approval policy match | Acquires FOR UPDATE lock on Transaction row |
| PENDING → PENDING_APPROVAL | Approval policy match | Routes to workflow engine |
| PENDING_APPROVAL → PROCESSING | All required approvals granted | Validates approval signatures |
| PENDING_APPROVAL → FAILED | Approval rejected or expired | Records rejection reason |
| PROCESSING → COMPLETED | postLedgerLines succeeds | Commits ledger entries, updates wallet balances |
| PROCESSING → FAILED | postLedgerLines throws | Transaction rolled back, no side effects |

### Double-Completion Prevention

The `PROCESSING → COMPLETED` transition is protected by both:
1. **Row lock**: `FOR UPDATE` on the Transaction row at the start of the processing phase.
2. **Version check**: `updateMany(where: { id, version })` ensures the status transition is atomic.

If two concurrent processes attempt to complete the same transaction, only one succeeds — the other's `updateMany` returns `count === 0`.

---

## 11. Ledger Guarantees

### 11.1 Immutability

`LedgerEntry` records are immutable. Once created:

- They must never be updated (no `UPDATE` on `LedgerEntry`).
- They must never be deleted (no `DELETE` on `LedgerEntry`).
- Corrections are made through reversal entries, not by modifying existing entries.

Enforced by:
- Application convention: no service code contains `update()` or `delete()` on `LedgerEntry`.
- Database constraints: the schema could enforce this via triggers in a future hardening pass.

### 11.2 Balance Integrity

Wallet balances are always consistent with the ledger. For every wallet:

```
wallet.balance = sum(LedgerEntry.amount WHERE walletId = wallet.id)
```

This invariant is maintained because:
1. All balance changes are performed by `postLedgerLines()`, which creates ledger entries and updates wallet balances in the same transaction.
2. The `updateMany` version check prevents lost updates.
3. The immutable ledger provides an auditable source of truth; if a wallet balance is ever suspect, it can be reconstructed from the ledger.

### 11.3 Double-Entry Invariant

Within every transaction's ledger entries:

```
sum(debit amounts) = sum(credit amounts)   (grouped by currency)
```

This is verified by `assertBalancedLedger()` before any write occurs. If the entries are unbalanced, the transaction aborts with a `ValidationError`.

### 11.4 Duplicate Protection

The `@@unique([transactionId, sequence])` constraint on `LedgerEntry` prevents duplicate entries:

```prisma
@@unique([transactionId, sequence])
```

If a bug or retry causes the same transaction to post duplicate entries, the database constraint rejects the duplicate.

---

## 12. Audit Guarantees

### 12.1 Audit Record Completeness

Every financial action produces exactly one `AuditLog` record containing:

| Field | Content | Example |
|-------|---------|---------|
| `companyId` | Tenant scope | `"cmp_01H..."` |
| `userId` | Actor (or `"system"`) | `"usr_01H..."` |
| `action` | Operation type | `"TRANSFER"`, `"DEPOSIT"` |
| `resourceType` | Affected entity type | `"Transaction"`, `"Wallet"` |
| `resourceId` | Affected entity ID | `"txn_01H..."` |
| `metadata` | JSON payload for reconstruction | `{ amount: 5000, from: "wallet_A", to: "wallet_B" }` |
| `createdAt` | Timestamp with timezone | `2026-07-05T12:00:00Z` |

### 12.2 Audit Sequence

```
┌──────────────────────────────────────────────────────────────┐
│                     AUDIT SEQUENCE                            │
│                                                               │
│  Operation completes (transaction committed)                   │
│       │                                                       │
│       ▼                                                       │
│  Create AuditLog record                                       │
│       │                                                       │
│       ├─ On success: AuditLog written, response returned      │
│       └─ On failure: Error logged, no AuditLog (rolled back)  │
│                                                               │
│  Audit log is IMMUTABLE:                                      │
│  ├─ No UPDATE                                                 │
│  ├─ No DELETE                                                 │
│  └─ Append only                                               │
└──────────────────────────────────────────────────────────────┘
```

### 12.3 Failed Operations

Failed operations are recorded differently depending on the failure point:

| Failure Point | Audit Record? | Notes |
|---------------|---------------|-------|
| Validation error (input rejected) | No | No operation started |
| Authorization failure | No | No operation started |
| Transaction rollback (version conflict) | No | Transaction rolled back completely |
| Transaction rollback (deadlock victim) | No | Transaction rolled back completely |
| Operation committed, audit failed | Yes | Operation succeeded but audit failure is logged as error |

For the last case, a background process scans for committed operations without audit records and creates them retroactively.

### 12.4 Audit Retention

Audit logs are retained indefinitely. No data retention policy deletes financial audit records. If data retention is required for regulatory compliance (GDPR right to erasure), the approach is anonymization, not deletion — the audit trail must remain intact for financial integrity.

---

## 13. Transaction Guarantees Summary

```
┌────────────────────────────┬────────────────────────────────────────┐
│ Guarantee                   │ How It Is Enforced                     │
├────────────────────────────┼────────────────────────────────────────┤
│ Atomicity                   │ Prisma $transaction (all or nothing)    │
│ Consistency                 │ assertBalancedLedger() before writes    │
│ Isolation (read)            │ REPEATABLE READ for business reads     │
│ Isolation (write)           │ FOR UPDATE row locks + version checks  │
│ Durability                  │ PostgreSQL WAL + immutable ledger      │
│ No double-spend             │ FOR UPDATE lock on source wallet        │
│ No negative balances        │ Enforced in postLedgerLines() logic    │
│ No lost updates             │ updateMany version check               │
│ No deadlocks                │ Lock ordering (alphabetical)           │
│ Deadlock recovery           │ 40P01 retry with exponential backoff   │
│ Serialization failure recovery │ P2034 retry with exponential backoff │
│ Idempotency                 │ IdempotencyRecord table                │
│ Ledger immutability         │ No UPDATE/DELETE on LedgerEntry        │
│ Duplicate entry prevention  │ @@unique([transactionId, sequence])    │
│ Audit completeness          │ AuditLog for every financial action   │
│ Tenant isolation            │ companyId scoping + RLS               │
└────────────────────────────┴────────────────────────────────────────┘
```

---

## References

- **Constitution**: `docs/architecture/perionyx-engineering-constitution.md`
- **Readiness Checklist**: `docs/architecture/enterprise-readiness-checklist.md`
- **AI Engineering Playbook**: `docs/architecture/ai-engineering-playbook.md`
- **Concurrency Model**: `docs/enterprise/concurrency-model.md`
- **Row Locking**: `docs/enterprise/row-locking.md`
- **Optimistic Locking**: `docs/enterprise/optimistic-locking.md`
- **Financial Integrity**: `docs/enterprise/financial-integrity.md`

---

*This document is part of the Perionyx Engineering Constitution framework. Amendments require review by the architecture review board.*
