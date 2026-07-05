# Enterprise Transaction Integrity & Concurrency Strategy

## Phase S1 — Architectural Hardening

**Date:** 2026-07-05
**Scope:** Read-only analysis; no existing services modified.

---

## 1. Core Transaction Principles

1. **Financial writes are atomic** — every balance-changing operation must succeed or fail as a unit.
2. **Isolation levels are chosen per category** — one level does not fit all.
3. **Row locking is explicit, not implicit** — `SELECT FOR UPDATE` must be named where needed.
4. **Optimistic locking guards concurrent balance updates** — version fields on high-contention entities.
5. **Serialization failures are expected** — retry logic is mandatory for SERIALIZABLE transactions.

---

## 2. Operation Categories

| Category | Definition | Examples |
|----------|-----------|----------|
| **Read Only** | Pure queries with no side effects. No consistency requirements beyond "eventually correct." | Listing accounts, fetching transaction history, dashboard queries |
| **Business Read** | Reads that inform a downstream decision. Need a consistent snapshot. | Reading wallet balance before authorizing a transfer, checking policy limits, reading approval rules |
| **Financial Write** | Creates/updates/deletes a record with monetary value (balance, amount, value) or transitions a financial entity's status. | Balance transfers, wallet credit/debit, Plaid sync, status transitions (PENDING→COMPLETED) |
| **Administrative Configuration** | Creates/updates/deletes metadata or configuration that governs financial operations but has no direct monetary value. | Creating treasury accounts, setting exchange rates, configuring policies, managing connectors |

---

## 3. Affected Service Inventory

### 3.1 Treasury (`src/modules/treasury/`)

| File | Operation | Category | Models | Current Isolation |
|------|-----------|----------|--------|-------------------|
| `treasury.service.ts:124` | `createAccount` | Admin Config | TreasuryAccount | None |
| `treasury.service.ts:157` | `addControl` | Admin Config | AccountControl | None |
| `treasury.service.ts:183` | `deposit` | **Financial Write** | TreasuryAccount (balance) | None |
| `treasury.service.ts:215` | `transfer` | **Financial Write** | InternalTransfer + TreasuryAccount (x2 balances) | `$transaction` (no isolation) |
| `external-banking.service.ts:387` | `linkExternalAccount` | Admin Config | ExternalAccount (treasuryAccountId) | None |

### 3.2 Wallets (`src/modules/wallets/`)

| File | Operation | Category | Models | Current Isolation |
|------|-----------|----------|--------|-------------------|
| `wallets.service.ts:17` | `createWallet` | Admin Config | Wallet | `$transaction` (no isolation) |
| `api/v1/wallets/[walletId]/route.ts:40` | PATCH wallet | Admin Config | Wallet | None (direct prisma) |
| `api/v1/wallets/[walletId]/route.ts:56` | DELETE wallet | Admin Config | Wallet | None (direct prisma) |

### 3.3 Ledger (`src/modules/ledger/`)

| File | Operation | Category | Models | Current Isolation |
|------|-----------|----------|--------|-------------------|
| `ledger.service.ts:141` | `recordTransfer` (create) | Financial Write | Transaction | None |
| `ledger.service.ts:166` | `recordTransfer` (complete) | Financial Write | Transaction (status) | None |
| `ledger.service.ts:181` | `recordCredit` (create) | Financial Write | Transaction | None |
| `ledger.service.ts:264` | `recordDebit` (create) | Financial Write | Transaction | None |
| `posting-engine.ts:77` | `postBatch` | **Financial Write** | LedgerEntry + Wallet (balance+version) | `$transaction` (no isolation) |
| `approval-workflow.ts:211` | `createApprovals` | Financial Write | TransactionApproval + Transaction | None |
| `approval-workflow.ts:292` | `approveTransaction` | Financial Write | TransactionApproval | None |
| `approval-workflow.ts:491` | `completeTransaction` | **Financial Write** | LedgerEntry + Wallet + Transaction | `$transaction` (no isolation) |
| `reversal-engine.ts:121` | `reverseTransaction` | **Financial Write** | Transaction + LedgerEntry + Wallet | Partial `$transaction` |
| `reconciliation-engine.ts:15` | `reconcileSettlements` | Financial Write | SettlementRecord | None |
| `idempotency.service.ts:126` | `recordSuccess` | Admin Config | IdempotencyRecord | None |

### 3.4 Transactions (`src/modules/transactions/`)

| File | Operation | Category | Models | Current Isolation |
|------|-----------|----------|--------|-------------------|
| `transactions.service.ts:538` | `creditWallet` | **Financial Write** | Transaction + Wallet + LedgerEntry | `$transaction` SERIALIZABLE |
| `transactions.service.ts:768` | `transferBetweenWallets` | **Financial Write** | Transaction + Wallet (x2) + LedgerEntry | `$transaction` SERIALIZABLE |

### 3.5 Reconciliation (`src/modules/reconciliation/`)

| File | Operation | Category | Models | Current Isolation |
|------|-----------|----------|--------|-------------------|
| `reconciliation.service.ts:43` | `initiateRun` | Financial Write | ReconciliationRun + Exception + Report | None |
| `reconciliation.service.ts:236` | `resolveException` | Financial Write | ReconciliationException | None |
| `bank-reconciliation.service.ts:191` | `suggestAllMatches` | Financial Write | ReconciliationMatch | None |
| `bank-reconciliation.service.ts:308` | `approveMatch` | **Financial Write** | ReconciliationMatch + ExternalTransaction | `$transaction` (no isolation) |
| `bank-reconciliation.service.ts:387` | `createManualMatch` | **Financial Write** | ReconciliationMatch + ExternalTransaction | `$transaction` (no isolation) |
| `bank-reconciliation.service.ts:438` | `createMatchRule` | Admin Config | AutoMatchRule | None |

### 3.6 Plaid Integrations (`src/modules/integrations/plaid/`)

| File | Operation | Category | Models | Current Isolation |
|------|-----------|----------|--------|-------------------|
| `plaid.service.ts:78` | `exchangePublicToken` | **Financial Write** | TreasuryAccount | None |
| `plaid.service.ts:163` | `syncTransactions` | **Financial Write** | TreasuryAccount (balance+lastSyncedAt) | None |
| `plaid.service.ts:230` | `syncBalance` | **Financial Write** | TreasuryAccount (balance) | None |
| `plaid.service.ts:308` | `connectNewAccount` | **Financial Write** | TreasuryAccount (create+plaid fields) | None |
| `plaid.service.ts:411` | `unlinkAccount` | Admin Config | TreasuryAccount (clear plaid fields) | None |

### 3.7 Connector Platform (`src/modules/connector-platform/`)

| File | Operation | Category | Models | Current Isolation |
|------|-----------|----------|--------|-------------------|
| `plaid-banking.service.ts:19` | `createExternalAccount` | Financial Write | ExternalAccount | None |
| `plaid-banking.service.ts:56` | `createExternalBalance` | Financial Write | ExternalBalance | None |
| `plaid-banking.service.ts:71` | `upsertExternalTransaction` | Financial Write | ExternalTransaction | None |
| `quickbooks-accounting.service.ts:61` | `createOrUpdateConnection` | Admin Config | AccountingConnection | None |
| `quickbooks-accounting.service.ts:118` | `syncChartOfAccounts` | Financial Write | ChartOfAccount | `$transaction` (no isolation) |
| `quickbooks-accounting.service.ts:175` | `syncVendors` | Financial Write | AccountingVendor | None |
| `quickbooks-accounting.service.ts:226` | `syncCustomers` | Financial Write | AccountingCustomer | None |
| `quickbooks-accounting.service.ts:277` | `syncInvoices` | Financial Write | AccountingInvoice | None |
| `config.ts:25` | `createConnectorConfig` | Admin Config | ConnectorConfig | None |
| `orchestrator/orchestrator.ts:114` | `executeSync` | Admin Config | ConnectorConfig (lastSyncAt) | None |

### 3.8 Currency (`src/modules/currency/`)

| File | Operation | Category | Models | Current Isolation |
|------|-----------|----------|--------|-------------------|
| `currency.service.ts:108` | `setRate` | Admin Config | ExchangeRate | None |

### 3.9 Policies (`src/modules/policies/`)

| File | Operation | Category | Models | Current Isolation |
|------|-----------|----------|--------|-------------------|
| `policies.service.ts:75` | `createPolicy` | Admin Config | Policy + PolicyRule | None |
| `policies.service.ts:112` | `updatePolicy` | Admin Config | Policy | None |
| `policies.service.ts:161` | `testPolicy` | Admin Config | PolicyTestResult | None |

### 3.10 Risk (`src/modules/risk/`)

| File | Operation | Category | Models | Current Isolation |
|------|-----------|----------|--------|-------------------|
| `risk.service.ts:41` | `createAlert` | Admin Config | RiskAlert | None |
| `risk.service.ts:216` | `autoGenerateAlerts` | Admin Config | RiskAlert | None |

### 3.11 API Routes Bypassing Service Layer

| File | Operation | Category | Models | Current Isolation |
|------|-----------|----------|--------|-------------------|
| `api/v1/treasury/accounts/[accountId]/route.ts:43` | PATCH account | Admin Config | TreasuryAccount | None (direct prisma) |
| `api/v1/treasury/accounts/[accountId]/route.ts:65` | DELETE account | Admin Config | TreasuryAccount | None (direct prisma) |
| `api/v1/admin/connectors/route.ts:32` | POST connector | Admin Config | ConnectorConfig | None (direct prisma) |

---

## 4. PostgreSQL Isolation Level Strategy

### 4.1 Recommended Levels

| Category | Isolation Level | Rationale |
|----------|----------------|-----------|
| **Read Only** | `READ COMMITTED` | Default PostgreSQL level. No phantom-read risk because no writes occur. |
| **Business Read** | `REPEATABLE READ` | Prevents non-repeatable reads during multi-statement business logic (e.g., read balance, check policy, then proceed). Ensures a consistent snapshot across the read set. |
| **Financial Write** | `REPEATABLE READ` (general) / `SERIALIZABLE` (balance transfers) | `REPEATABLE READ` prevents concurrent balance corruption from phantom ledger entries. `SERIALIZABLE` is required when two balances must change atomically (double-entry safety) because `REPEATABLE READ` does not prevent write skew (e.g., two concurrent transfers reading the same source balance, both decrementing it). |
| **Admin Configuration** | `READ COMMITTED` | No monetary value is at stake. Configuration conflicts are caught by unique constraints or application-level validation. |

### 4.2 Why SERIALIZABLE for Balance Transfers

PostgreSQL's `SERIALIZABLE` uses Serializable Snapshot Isolation (SSI). Under SSI, concurrent transactions that would produce a non-serializable outcome are aborted. This is the **only** built-in PostgreSQL isolation level that prevents write-skew anomalies.

**Example write-skew prevented by SERIALIZABLE:**
```
T1: read Wallet A balance = 100
T2: read Wallet A balance = 100
T1: decrement Wallet A by 50 → balance = 50 (COMMIT)
T2: decrement Wallet A by 70 → balance = 30 (COMMIT)
```
Without SERIALIZABLE, both succeed despite insufficient starting balance (100 - 50 - 70 = -20). SERIALIZABLE detects this conflict and aborts T2.

### 4.3 Retry Strategy

SERIALIZABLE transactions can abort on any read-write conflict. All SERIALIZABLE write operations must implement retry with exponential backoff:

```
maxRetries = 3
baseDelay = 50ms
backoff multiplier = 2×
```

---

## 5. Row Locking Requirements (`SELECT FOR UPDATE`)

Row locks prevent concurrent access to specific records within a transaction, complementing the isolation level.

### 5.1 Where Row Locking Is Required

| Entity | Operation | Why |
|--------|-----------|-----|
| **Wallet.balance** | Any debit or credit to a wallet | Prevent two concurrent operations from reading the same version/balance before writing. Lock the `Wallet` row before reading its balance. |
| **TreasuryAccount.balance** | `deposit`, `transfer`, `syncBalance` | Prevent concurrent deposit/sync from double-counting. Lock the `TreasuryAccount` row before reading its balance. |
| **Transaction.status** | Status transitions (PENDING→COMPLETED, etc.) | Prevent double-completion. Lock the `Transaction` row before checking current status. |
| **ReconciliationRun** | `initiateRun`, `approveMatch` | Prevent duplicate reconciliation runs or concurrent match approval on the same run. |
| **WorkflowInstance** | `resumeInstance`, `respondToApproval` | Prevent concurrent state transitions. Lock the instance row before status check. |

### 5.2 Lock Strategy

```sql
-- Lock a wallet row for balance update
SELECT "balance", "version" FROM "Wallet" WHERE "id" = $1 FOR UPDATE;

-- Lock a treasury account for balance update
SELECT "balance" FROM "TreasuryAccount" WHERE "id" = $1 FOR UPDATE;

-- Lock a transaction for status transition
SELECT "status" FROM "Transaction" WHERE "id" = $1 FOR UPDATE;
```

Locks are acquired via Prisma's `$queryRaw` or through the `FinancialTransactionManager` abstraction. Row locks are **always released at transaction commit/rollback** — never held across transactions.

---

## 6. Optimistic Locking Requirements

### 6.1 Where Optimistic Locking Is Required

| Entity | Field | Already Exists? | Why |
|--------|-------|-----------------|-----|
| **Wallet** | `version` (Int, @default(0)) | **Yes** | All wallet balance writes must check `version` has not changed since read. Currently implemented in `posting-engine.ts:92` and `transactions.service.ts:244`. |
| **TreasuryAccount** | No version field | **No** | Balance updates via Plaid sync, deposit, and transfer should use optimistic locking to prevent lost updates from concurrent operations. |
| **Transaction** | No version field | **No** | Status transitions should verify no concurrent state change occurred. While row locking is preferred for status transitions, a version field provides defense-in-depth. |
| **AccountingInvoice** | No version field | **No** | Concurrent invoice updates from QBO sync and manual changes could conflict. |
| **ReconciliationMatch** | No version field | **No** | Concurrent match approval and rejection should be guarded. |

### 6.2 How Optimistic Locking Works

```
1. READ entity + current version
2. User/process performs work
3. WRITE: UPDATE ... SET balance = $1, version = version + 1 WHERE id = $2 AND version = $3
4. If affected rows === 0 → conflict detected → retry from step 1
```

---

## 7. Missing Transaction Coverage (Gaps)

| Gap | Risk | Priority |
|-----|------|----------|
| **Plaid `syncBalance` updates `TreasuryAccount.balance` via direct `update`** with no transaction, no lock, no version check | Lost update — concurrent sync and deposit could silently overwrite | **High** |
| **Plaid `syncTransactions` updates `TreasuryAccount.balance`** with no transaction wrapper | Same lost-update risk | **High** |
| **Reversal engine uses partial transaction coverage** — creates reversal Transaction outside a `$transaction`, then posts LedgerEntry/Wallet changes inside one | Reversal Transaction created even if ledger posting fails → orphaned reversal record | **High** |
| **`TreasuryService.deposit` updates balance with no transaction or lock** | Two concurrent deposits could lose one update | **High** |
| **API routes that write directly via `prisma.updateMany`/`deleteMany`** bypass all transaction guarantees | Inconsistent state if a downstream process expects the previous value | **Medium** |
| **Accounting syncs (QBO) write individual records without wrapping in a single transaction per sync run** | Partial sync if one upsert fails; no rollback | **Medium** |
| **Reconciliation `initiateRun` creates Run, Exceptions, and Report in separate unprotected writes** | Inconsistent state: Run could be COMPLETED while Report creation fails | **Medium** |
| **No retry logic exists outside `transactions.service.ts`** | Any SERIALIZABLE abort causes a 500 error, not a retry | **Low** (until SERIALIZABLE is adopted) |

---

## 8. Implementation Roadmap

### Phase S1a — Abstraction Layer (current)
- Create `FinancialTransactionManager` interface and base implementation
- No modifications to existing services

### Phase S1b — Critical Path Rollout
- Wrap Plaid balance sync, treasury deposit, and transfer in `financialWrite`
- Add row locking to wallet balance updates and treasury balance updates
- Add optimistic locking to `TreasuryAccount` balance writes

### Phase S1c — Full Coverage
- Wrap all Financial Write operations
- Add retry logic to all SERIALIZABLE transactions
- Replace direct-prisma API routes with service calls
- Add version fields to high-contention entities

---

## 9. Appendix: Model Classification

### Financial Models (monetary value)

| Model | Balance/Amount Fields | Contention Risk | Current Protection |
|-------|---------------------|-----------------|-------------------|
| `Wallet` | `balance` | High (version field exists) | Optimistic lock via version |
| `TreasuryAccount` | `balance` | High | None |
| `Transaction` | `primaryAmount` | Medium (status transitions) | SERIALIZABLE in transactions.service |
| `LedgerEntry` | `amount` | Low (immutable after create) | None needed |
| `ExternalTransaction` | `amount` | Low (imported data) | None needed |
| `ExternalBalance` | `current, available, limit` | Low (snapshot) | None needed |
| `ExchangeRate` | `rate` | Low | None needed |
| `ChartOfAccount` | `balance` | Low | None |
| `AccountingInvoice` | `totalAmount, balance` | Low | None |

### Configuration Models (no direct monetary value)

`AccountControl`, `InternalTransfer`, `ReconciliationRun`, `ReconciliationException`, `ReconciliationReport`, `ReconciliationMatch`, `AutoMatchRule`, `AccountingConnection`, `AccountingVendor`, `AccountingCustomer`, `SyncLog`, `ConnectorConfig`, `ConnectorRun`, `Policy`, `ApprovalRule`, `TransactionApproval`, `RiskAlert`, `WorkflowDefinition`, `WorkflowInstance`, `WorkflowStepInstance`, `SettlementRecord`
