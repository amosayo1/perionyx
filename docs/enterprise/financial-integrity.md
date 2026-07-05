# Financial Integrity

## Guarantees

### 1. Balance Consistency

Every wallet balance update uses **optimistic version locking**:

```typescript
const updated = await tx.wallet.updateMany({
  where: { id: walletId, version: wallet.version },
  data: { balance: nextBalance, version: { increment: 1 } },
});
if (updated.count === 0) {
  throw new ConflictError("Wallet version conflict");
}
```

- If two transactions read the same version and both try to update, only one succeeds.
- The loser retries or throws a `ConflictError`.
- The `version` column is incremented on every write, creating a linear history.

### 2. Ledger Immutability

The `LedgerEntry` table is **append-only**:

- Records are created once and never updated or deleted.
- `@@unique([transactionId, sequence])` prevents duplicate entries.
- Ledger entries form an unalterable audit trail.

### 3. Double-Entry Balancing

Every posted batch must satisfy `debits === credits`. Enforced at multiple layers:

```
PostingEngine.validateBatch()       → before any write (pre-tx)
assertBalancedLedger()              → inside transaction before posting
LedgerEntry @@unique constraint     → prevents duplicate posting
verifyTransactionBalance()          → post-hoc drift detection
```

### 4. Non-Negative Balances

`STANDARD` kind wallets enforce non-negative balances at write time:

```typescript
if (wallet.kind === "STANDARD" && nextBalance.lessThan(0)) {
  throw new Error("Insufficient balance for this operation.");
}
```

## Row-Level Protection Summary

```mermaid
graph LR
    subgraph Pessimistic
        W1[Wallet] --> RLM[RowLockManager<br/>FOR UPDATE]
        TA[TreasuryAccount] --> RLM
    end
    subgraph Optimistic
        W1 --> VC[Version Check<br/>updateMany(version)]
        CC[ConnectorConfig] --> VC
        AR[ApprovalRule] --> VC
        P[Policy] --> VC
    end
    subgraph Immutable
        LE[LedgerEntry] --> UC[@@unique constraint<br/>append-only]
    end
```

| Entity | Protection | Version Field | Lock Mechanism |
|--------|-----------|---------------|----------------|
| `Wallet` | Pessimistic + Optimistic | `version` | `RowLockManager.lockInTx` + `updateMany(version)` |
| `TreasuryAccount` | Pessimistic | N/A | `RowLockManager.withLocks` (FOR UPDATE WAIT) |
| `LedgerEntry` | Append-only (unique constraint) | N/A | N/A (immutable) |
| `Transaction` | Status state machine | N/A | N/A |
| `ConnectorConfig` | Optimistic | `version` | `config-lock.ts` |
| `ApprovalRule` | Optimistic | `version` | `config-lock.ts` |
| `PolicyException` | Optimistic | `version` | `config-lock.ts` |
| `Policy` | Optimistic | `version` | `config-lock.ts` |
| `AccountControl` | Optimistic | `version` | `config-lock.ts` |
| `GovernanceFramework` | Optimistic | `version` | `config-lock.ts` |

## Audit Trail

### Financial Actions with Audit Logs

| Action | Module | File:Line |
|--------|--------|-----------|
| `TREASURY_DEPOSIT` | TreasuryService | `treasury.service.ts:196` |
| `INTERNAL_TRANSFER_COMPLETED` | TreasuryService | `treasury.service.ts:264` |
| `TRANSACTION_APPROVAL_COMPLETED` | ApprovalWorkflow | `approval-workflow.ts:569` |
| `TRANSACTION_REJECTED` | ApprovalWorkflow | `approval-workflow.ts:385` |
| `TRANSACTION_ESCALATED` | ApprovalWorkflow | `approval-workflow.ts:439` |
| `TRANSACTION_STATE_TRANSITION` | TransactionStateMachine | `transaction-state-machine.ts:195` |
| `LEDGER_DRIFT_DETECTED` | LedgerService | `ledger.service.ts:86` |
| `TREASURY_ACCOUNT_CREATED` | TreasuryService | `treasury.service.ts:139` |
| `WALLET_CREDIT` | TransactionsService | `transactions.service.ts:720` |
| `WALLET_DEBIT` | TransactionsService | `transactions.service.ts` |
| `TRANSACTION_WALLET_TRANSFER` | TransactionsService | `transactions.service.ts` |

### Audit Gap Analysis

| Gap | Status | Rationale |
|-----|--------|-----------|
| Plaid external balance writes | ✅ Addressed | Connector sync triggers transaction sync which creates ledger entries with audit |
| Plaid external transaction upserts | ✅ Addressed | Via transaction sync path |
| QuickBooks accounting syncs | ⚠️ External data | External accounting data — not ledger transactions; stored in accounting tables |
| Posting Engine individual postings | ✅ Covered | Audit at transaction level via state machine |
| Reversal Engine | ✅ Covered | Reversal is a new transaction with full lifecycle |
| Tick Service auto-reject | ✅ Covered | Audit via state machine transition |
| Reconciliation Engine settlement | ✅ Covered | Audit via transaction state update |

## Balance Reconciliation

The `LedgerService` provides drift detection:

```
computeWalletBalance(walletId, companyId)
  → Sum of all CREDIT minus DEBIT ledger entries

verifyTransactionBalance(transactionId)
  → Checks total debits == total credits for a transaction
```

If drift is detected, `LEDGER_DRIFT_DETECTED` is recorded.

## Developer Guidance

1. **Append-only**: Never update or delete `LedgerEntry` records — create reversal transactions instead.
2. **Version is sacred**: Never bypass the version check in balance updates — it is the last line of defense against race conditions.
3. **Audit everything**: Every financial mutation must have a corresponding `recordAudit()` call. If you add a new financial write, add an audit action first.
4. **Test drift detection**: After any batch of operations, verify that `computeWalletBalance()` matches the expected balance.
5. **Config entities**: Always use `config-lock.ts` for optimistic updates; never write `updateMany` without a version condition on config tables.
