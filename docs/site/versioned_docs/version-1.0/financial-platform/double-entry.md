---
id: double-entry
title: Double Entry Accounting
sidebar_label: Double Entry
description: Perionyx double-entry accounting system — immutable ledger entries, balance integrity guarantees, posting engine, and the foundation for all financial recording.
---

# Double Entry Accounting

## Overview

Perionyx implements full double-entry accounting through the `LedgerEntry` model. Every financial transaction creates at least two entries (debit and credit) that must balance to zero. The ledger is append-only — entries are never mutated after posting.

## Core Principle

Every financial transaction creates at least two entries (debit and credit) that must balance to zero:

```
Sum(debits) - Sum(credits) = 0  (within currency precision tolerance)
```

This invariant is enforced at validation time, at posting time, and during reconciliation. If the invariant is violated at any point, the entire batch fails and the system reverts to the previous consistent state.

## Posting Engine (`posting-engine.ts`)

The posting engine commits validated and approved journals to the ledger. It:

- Creates `LedgerEntry` records for each debit and credit line
- Updates account balances atomically within a database transaction
- Records a unique transaction ID for audit trail integrity
- Fails the entire batch if any individual entry fails (all-or-nothing)

### Posting Modes

| Mode | Description |
|------|-------------|
| Automatic | System posts immediately on journal approval |
| Manual | User-initiated posting of individual journals |
| Batch | Group posting of multiple journals |
| Scheduled | Time-based posting (cron or scheduled trigger) |

### Posting Lifecycle

```
Pending → Validated → Posting → Posted
                                → Failed → (correct and retry)
         → Reversed
```

| Status | Description |
|--------|-------------|
| Pending | Batch created, awaiting processing |
| Validated | All journals pass validation |
| Posting | Actively posting to ledger |
| Posted | Successfully committed |
| Failed | Validation or processing errors |
| Reversed | Batch reversed |

### Posting Validation

Each journal is validated before posting:

1. **NO_LINES** — Journal must have at least one line
2. **UNBALANCED** — Debits must equal credits within 0.001 tolerance
3. **ALREADY_POSTED** — Prevent duplicate posting
4. **ACCOUNT_EXISTS** — All line accounts must exist
5. **PERIOD_OPEN** — Target period must be open for posting

### Duplicate Detection

The engine maintains a `postedJournalIds` set to prevent journals from being posted more than once. This is checked during validation.

### Batch Posting

Batches allow grouping multiple journals for coordinated posting:

- Total journals count
- Success/failure tracking per journal
- Error collection with codes and messages
- Audit trail for batch operations

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

## PostingService

| Method | Description |
|--------|-------------|
| `addBatch()` | Create a posting batch |
| `getBatch()` | Get batch by ID |
| `getAllBatches()` | List all batches |
| `getBatchesByStatus()` | Filter batches by status |
| `getPendingBatches()` | Get pending batches |
| `isJournalPosted()` | Check if journal is posted |
| `markPosted()` | Mark journal as posted |
| `validateJournal()` | Validate a single journal |
| `createBatch()` | Create a new batch with metadata |
