# Enterprise Row Locking Infrastructure

## Phase S1.2A — Row Lock Manager

**Date:** 2026-07-05
**Scope:** Reusable infrastructure only; no business services modified.

---

## 1. Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Business Services                      │
│  (treasury, wallets, ledger, plaid, reconciliation...)   │
└──────────────────────┬──────────────────────────────────┘
                       │ uses
┌──────────────────────▼──────────────────────────────────┐
│                 RowLockManager                           │
│  - withLocks()    - tryLock()    - isLocked()           │
│  - auto lock ordering    - deadlock retry               │
│  - lock mode selection   - NOWAIT / SKIP LOCKED         │
└──────────────────────┬──────────────────────────────────┘
                       │ delegates to
┌──────────────────────▼──────────────────────────────────┐
│           FinancialTransactionManager                    │
│  - executeRead()  - executeWrite()  - lockRows()        │
│  - withOptimisticLock()                                  │
└──────────────────────┬──────────────────────────────────┘
                       │ executes on
┌──────────────────────▼──────────────────────────────────┐
│              PrismaClient / PostgreSQL                    │
│  - $transaction with isolation levels                    │
│  - $queryRawUnsafe for FOR UPDATE                        │
└─────────────────────────────────────────────────────────┘
```

Two classes with distinct responsibilities:

| Class | Responsibility |
|-------|---------------|
| `FinancialTransactionManager` | Transaction lifecycle, isolation levels, retry logic, optimistic locking |
| `RowLockManager` | Row-level lock acquisition, lock ordering, deadlock handling, lock modes |

---

## 2. RowLockManager API

### 2.1 `withLocks<T>(targets, fn, options?)`

Acquires locks within a transaction, executes work, commits.

```typescript
const lockManager = new RowLockManager();

const result = await lockManager.withLocks(
  [
    { entity: "Wallet", id: "wallet-1", mode: "FOR_UPDATE" },
    { entity: "Wallet", id: "wallet-2", mode: "FOR_UPDATE" },
  ],
  async (tx) => {
    // All locks held — safe to read + write
    const w1 = await tx.wallet.findUnique({ where: { id: "wallet-1" } });
    const w2 = await tx.wallet.findUnique({ where: { id: "wallet-2" } });
    await tx.wallet.update({ where: { id: "wallet-1" }, data: { balance: ... } });
    return { w1, w2 };
  },
);
```

### 2.2 `tryLock(target, tx) -> Promise<boolean>`

Non-blocking lock attempt. Returns `false` immediately if row is already locked (uses `NOWAIT`).

```typescript
const acquired = await lockManager.tryLock(
  { entity: "TreasuryAccount", id: "acct-1" },
  tx,
);
if (!acquired) {
  // handle contention
}
```

### 2.3 `isLocked(entity, id, tx) -> Promise<boolean>`

Checks if a row is currently locked by another transaction.

---

## 3. Lock Modes

| Mode | PostgreSQL | Semantics | Use Case |
|------|-----------|-----------|----------|
| `FOR_UPDATE` | `FOR UPDATE` | Exclusive write lock — blocks all concurrent locks | Balance updates, status transitions |
| `FOR_NO_KEY_UPDATE` | `FOR NO KEY UPDATE` | Weaker exclusive — allows concurrent `FOR KEY SHARE` | Updates to non-key columns |
| `FOR_SHARE` | `FOR SHARE` | Shared read lock — blocks exclusive locks but allows other shared locks | Reading balance for decision without allowing concurrent writes |
| `FOR_KEY_SHARE` | `FOR KEY SHARE` | Weakest shared — blocks only `FOR UPDATE` | Reading foreign key references |

Default mode is `FOR_UPDATE`.

---

## 4. Lock Behavior

| Behavior | PostgreSQL | Semantics |
|----------|-----------|-----------|
| `WAIT` (default) | `FOR UPDATE` (no suffix) | Wait indefinitely until lock is acquired |
| `NOWAIT` | `FOR UPDATE NOWAIT` | Error immediately if lock cannot be acquired |
| `SKIP_LOCKED` | `FOR UPDATE SKIP LOCKED` | Skip rows that are already locked (use carefully — may miss rows) |

---

## 5. Deadlock Prevention

### 5.1 Automatic Lock Ordering

`RowLockManager.withLocks()` automatically sorts targets by `(entity table name, id)` before acquiring locks. This provides a **global lock order** that prevents cycle-based deadlocks.

Example — unordered input:
```
{ Wallet, "B" }, { TreasuryAccount, "A" }, { Wallet, "A" }
```

After ordering:
```
{ TreasuryAccount, "A" }, { Wallet, "A" }, { Wallet, "B" }
```

Set `options.enforceOrdering = false` to skip ordering (only if you handle ordering yourself).

### 5.2 Duplicate Detection

`validateLockTargets()` rejects duplicate `(entity, id)` pairs before any SQL is executed. This prevents self-deadlock (locking the same row twice in one transaction).

### 5.3 Deadlock Detection

The `isDeadlockError()` utility checks for:
- PostgreSQL error code `40P01` (deadlock detected)
- Prisma error code `P2034` (transaction failed)
- Error message patterns: "deadlock detected", "deadlock found"

### 5.4 Retry with Backoff

On deadlock or serialization failure, `withLocks()` retries with exponential backoff:

| Attempt | Base Delay | With Jitter (0.75–1.25×) |
|---------|-----------|--------------------------|
| 0       | 100ms      | 75–125ms                 |
| 1       | 200ms      | 150–250ms                |
| 2       | 400ms      | 300–500ms                |

Max 3 retries, capped at 3s. Configure via `options.retry`.

---

## 6. Utility Functions

### `buildLockSql(table, id, mode?, behavior?)`

Generates the raw SQL for a row lock:

```typescript
buildLockSql("Wallet", "w-1", "FOR_UPDATE", "NOWAIT")
// → { sql: 'SELECT 1 FROM "Wallet" WHERE "id" = $1 FOR UPDATE NOWAIT', params: ["w-1"] }
```

### `orderLockTargets(targets)`

Sorts `LockTarget[]` by (table, id) — safe for deterministic lock ordering.

### `validateLockTargets(targets)`

Throws on unknown entity types or duplicate targets.

### `isDeadlockError(error)`, `isSerializationError(error)`, `isLockTimeoutError(error)`

Error classification predicates.

### `computeBackoff(attempt, config)`

Returns delay in ms with jitter.

---

## 7. File Layout

```
src/lib/financial-transaction/
├── constants.ts                    # ENTITY_TABLE_MAP, SQL fragments, default retry config
├── types.ts                        # All shared types
├── financial-transaction-manager.ts # Transaction lifecycle + basic locking
├── lock-utils.ts                   # Pure utility functions (no side effects)
├── row-lock-manager.ts             # RowLockManager class
└── index.ts                        # Barrel re-exports
```

### Dependency Graph

```
index.ts
  ├── constants.ts        (no deps)
  ├── types.ts            (no deps)
  ├── lock-utils.ts       (depends on: constants, types)
  ├── financial-transaction-manager.ts  (depends on: constants, types, prisma)
  └── row-lock-manager.ts (depends on: constants, types, lock-utils, financial-transaction-manager, prisma)
```

---

## 8. Usage Patterns

### Pattern 1: Multi-Wallet Transfer

```typescript
const lockManager = new RowLockManager();

await lockManager.withLocks(
  [
    { entity: "Wallet", id: sourceWalletId, mode: "FOR_UPDATE" },
    { entity: "Wallet", id: destWalletId, mode: "FOR_UPDATE" },
  ],
  async (tx) => {
    const source = await tx.wallet.findUniqueOrThrow({ where: { id: sourceWalletId } });
    const dest = await tx.wallet.findUniqueOrThrow({ where: { id: destWalletId } });
    // ... validate, update balances, create ledger entries
  },
);
```

### Pattern 2: Treasury Account Balance Sync with Plaid

```typescript
await lockManager.withLocks(
  [{ entity: "TreasuryAccount", id: accountId }],
  async (tx) => {
    const account = await tx.treasuryAccount.findUniqueOrThrow({ ... });
    // ... apply balance update from Plaid
  },
  {
    behavior: "NOWAIT",  // fail fast if another sync is in progress
    retry: { maxRetries: 1, baseDelayMs: 100, maxDelayMs: 500 },
  },
);
```

### Pattern 3: Non-blocking Check

```typescript
const tm = new FinancialTransactionManager();
await tm.executeRead(OperationCategory.BusinessRead, async (tx) => {
  const locked = await lockManager.isLocked("TreasuryAccount", "acct-1", tx);
  if (locked) {
    // warn user: account is currently being modified
  }
});
```

---

## 9. Compliance

- **Zero existing services modified** — all new code in `src/lib/financial-transaction/`
- **No duplicated transaction code** — `RowLockManager` uses `FinancialTransactionManager`'s patterns (or delegates to it in future)
- **Provider-agnostic** — lock SQL is isolated in `buildLockSql()`; swapping to a different DB requires only changing that function
- **Zero TypeScript errors** — `pnpm typecheck` passes cleanly
