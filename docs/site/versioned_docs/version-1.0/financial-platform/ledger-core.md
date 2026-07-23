---
id: ledger-core
title: Ledger Core
sidebar_label: Ledger Core
description: The central repository of all financial transactions — double-entry accounting, account balances, trial balance generation, and the foundation for financial statements.
---

# Ledger Core

## Overview

The General Ledger (GL) is the central repository of all financial transactions. It maintains account balances across accounting periods, supports trial balance generation, and provides the foundation for financial statements. Perionyx implements full double-entry accounting through the `LedgerEntry` model — every financial transaction creates at least two entries (debit and credit) that must balance to zero. The ledger is append-only: entries are never mutated after posting.

## Double-Entry Accounting

Every financial transaction creates at least two entries (debit and credit) that must balance to zero. The ledger is append-only — entries are never mutated after posting.

```
Sum(debits) - Sum(credits) = 0  (within currency precision tolerance)
```

This invariant is enforced at validation time, at posting time, and during reconciliation. If the invariant is violated at any point, the entire batch fails and the system reverts to the previous consistent state.

## Account Balances

Each account has a balance record per period with:

| Field | Description |
|-------|-------------|
| `beginningDebit` | Opening debit balance |
| `beginningCredit` | Opening credit balance |
| `periodDebit` | Total debits for the period |
| `periodCredit` | Total credits for the period |
| `endingDebit` | Closing debit balance |
| `endingCredit` | Closing credit balance |
| `netChange` | Period change (debits - credits) |
| `endingBalance` | Net ending balance |

### Balance Calculation

```
endingBalance = (beginningDebit - beginningCredit) + (periodDebit - periodCredit)
```

For asset accounts (normal debit): positive = healthy.
For liability/equity/revenue accounts (normal credit): negative = healthy.

## Trial Balance

The trial balance is generated from period-level account balances and includes:

- Account code, name, type
- Beginning balance
- Period debits and credits
- Ending balance

Total debits should equal total credits for a balanced ledger.

## Ledger Module Files

| File | Purpose |
|---|---|
| `posting-engine.ts` | Commits validated journals to ledger, updates balances |
| `transaction-validator.ts` | Validates journal integrity before processing |
| `transaction-state-machine.ts` | Enforces valid state transitions |
| `approval-workflow.ts` | Routes journals through approval chains |
| `reconciliation-engine.ts` | Matches ledger entries to external statements |
| `reversal-engine.ts` | Creates offsetting entries for reversals |
| `idempotency.service.ts` | Prevents duplicate external transaction processing |
| (3 additional internal files) | Type definitions, utilities, barrel exports |

## Ledger Guarantees

### Immutability

`LedgerEntry` records are immutable. Once created:

- They must never be updated (no `UPDATE` on `LedgerEntry`).
- They must never be deleted (no `DELETE` on `LedgerEntry`).
- Corrections are made through reversal entries, not by modifying existing entries.

Enforced by:
- Application convention: no service code contains `update()` or `delete()` on `LedgerEntry`.
- Database constraints: the schema could enforce this via triggers in a future hardening pass.

### Balance Integrity

Wallet balances are always consistent with the ledger. For every wallet:

```
wallet.balance = sum(LedgerEntry.amount WHERE walletId = wallet.id)
```

This invariant is maintained because:
1. All balance changes are performed by `postLedgerLines()`, which creates ledger entries and updates wallet balances in the same transaction.
2. The `updateMany` version check prevents lost updates.
3. The immutable ledger provides an auditable source of truth; if a wallet balance is ever suspect, it can be reconstructed from the ledger.

### Double-Entry Invariant

Within every transaction's ledger entries:

```
sum(debit amounts) = sum(credit amounts)   (grouped by currency)
```

This is verified by `assertBalancedLedger()` before any write occurs. If the entries are unbalanced, the transaction aborts with a `ValidationError`.

### Duplicate Protection

The `@@unique([transactionId, sequence])` constraint on `LedgerEntry` prevents duplicate entries:

```prisma
@@unique([transactionId, sequence])
```

If a bug or retry causes the same transaction to post duplicate entries, the database constraint rejects the duplicate.

## Account Activity

The GL tracks activity by period, enabling drill-down from summary to transaction-level detail. Each balance record includes `lastActivity` timestamp for activity tracking.

## LedgerService

| Method | Description |
|--------|-------------|
| `addBalance()` | Record account balance |
| `getBalance()` | Get balance by ID |
| `getAllBalances()` | List all balances |
| `getBalancesByPeriod()` | Filter by period |
| `getBalancesByAccount()` | Filter by account |
| `getBalancesByCompany()` | Filter by company |
| `getBalanceForAccountPeriod()` | Get specific account-period balance |
| `generateTrialBalance()` | Generate trial balance for a period |
