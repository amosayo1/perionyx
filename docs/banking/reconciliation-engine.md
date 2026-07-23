# Reconciliation Engine

## Overview

The Reconciliation Engine ensures data integrity by comparing synchronized transactions against provider data. It detects discrepancies, balance mismatches, and provider inconsistencies, providing a comprehensive view of data health.

## Reconciliation Types

```
┌─────────────────────────────────────────────────────────────────┐
│                     Reconciliation Engine                       │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Missing    │  │  Duplicate   │  │      Modified        │  │
│  │ Transactions │  │ Transactions │  │    Transactions      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Deleted    │  │   Balance    │  │    Provider          │  │
│  │ Transactions │  │   Mismatch   │  │   Inconsistencies    │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Detection Methods

### Missing Transactions
Transactions present in provider data but absent from local storage.

**Algorithm:**
1. Build a Set of provider transaction external IDs
2. Build a Set of local transaction external IDs
3. Set difference (provider - local) = missing transactions
4. Report all unmatched IDs with provider metadata

### Duplicate Transactions
Transactions with the same external ID appearing multiple times in local storage.

**Algorithm:**
1. Group local transactions by external ID
2. Groups with count > 1 = duplicates
3. Report all duplicate IDs with local metadata

### Modified Transactions
Transactions with the same external ID but different field values.

**Algorithm:**
1. Map local transactions by external ID
2. Map provider transactions by external ID
3. Compare each field:
   - amount, currency, description
   - transactionType, direction, status
   - transactionDate, postDate
4. If any field differs → modified transaction
5. Report field-level diffs: expected vs actual

**Checked Fields:**
```
amount
currency
description
transactionType
direction
status
transactionDate
postDate
```

### Deleted Transactions
Transactions present in local storage but absent from provider data (after account closure or data purging).

**Algorithm:**
1. Build a Set of local transaction external IDs
2. Build a Set of provider transaction external IDs
3. Set difference (local - provider) = deleted
4. Report all deleted IDs

### Balance Mismatch
Difference between provider-reported balance and locally computed balance.

**Algorithm:**
1. Get provider balance for the account
2. Compute local balance: sum of all posted transactions
   - INFLOW transactions: add amount
   - OUTFLOW transactions: subtract amount
3. Calculate delta = |providerBalance - localBalance|
4. If delta > tolerance (default 1% of provider balance):
   → Balance mismatch reported

```
tolerance = |providerBalance| × (tolerancePercent / 100)
balanceMatch = delta <= tolerance
```

### Provider Inconsistencies
Any irregularity detected during reconciliation:
- Balance mismatches (as detailed above)
- Missing provider transaction metadata
- Data format inconsistencies
- Unexpected transaction types or statuses

## Reconciliation Outcome

```typescript
interface ReconciliationOutcome {
  reconciliationId: string;           // Unique reconciliation ID
  connectionId: string;              // Bank connection
  accountId: string;                 // Bank account
  providerExpectedBalance: number;   // Balance from provider
  computedBalance: number;           // Balance from local data
  balanceMatches: boolean;           // Balance check result
  balanceDelta: number;              // Absolute difference
  missingTransactions: string[];     // External IDs of missing txns
  duplicateTransactions: string[];   // External IDs of duplicate txns
  modifiedTransactions: Diff[];      // Field-level modifications
  deletedTransactions: string[];     // External IDs of deleted txns
  providerInconsistencies: string[]; // Text descriptions
  totalChecked: number;              // Total transactions checked
  issuesFound: number;               // Total issues detected
  completedAt: string;               // ISO timestamp
}
```

## Batch Reconciliation

For enterprise-scale reconciliation, the engine supports batch processing:

```
For each account in batch:
  1. Get provider transactions (from cache or recent sync)
  2. Get local transactions (from local storage)
  3. Get provider balance
  4. Run full reconciliation
  5. Collect outcome
  6. Aggregate total issues

Returns: { results: ReconciliationOutcome[], totalIssues: number }
```

## Outcome Management

### Storage
All reconciliation outcomes are stored in-memory with the key:
```
recon-{connectionId}-{accountId}-{timestamp}
```

### Querying
- **By ID**: `getOutcome(reconciliationId)` → single outcome
- **By Account**: `getOutcomesByAccount(connectionId, accountId)` → all outcomes
- **Latest**: `getLatestOutcome(connectionId, accountId)` → most recent

### Retention
- Outcomes remain in memory for the session lifetime
- Can be cleared per connection with `clearOutcomes()`
- Future: persist to database with configurable retention

## Configuration

| Option | Default | Description |
|---|---|---|
| enableBalanceVerification | true | Check provider vs computed balance |
| enableTransactionMatching | true | Detect missing transactions |
| enableDuplicateDetection | true | Detect duplicate transactions |
| enableModificationDetection | true | Detect modified transactions |
| enableDeletionDetection | true | Detect deleted transactions |
| balanceTolerancePercent | 1 | Balance mismatch tolerance |

## Integration with Sync Engine

```
Sync Execution
    │
    ├── Incremental/Historical Sync
    │
    ├── Reconciliation Phase
    │     │
    │     ├── For each account:
    │     │     ├── Get provider transactions (from sync)
    │     │     ├── Get local transactions (from storage)
    │     │     ├── Get provider balance
    │     │     └── Run reconciliation
    │     │
    │     └── Collect all outcomes
    │
    ├── Update Sync State
    │     ├── COMPLETED (no issues)
    │     └── PARTIAL_SUCCESS (issues found)
    │
    └── Record Reconciliation Metrics
```

## Edge Cases

### Empty Account
- Provider returns no transactions
- Local has no transactions
- Balance check: should match (both 0 or provider balance)
- No missing/duplicate/modified/deleted issues

### New Account (First Sync)
- Local has no transactions
- Provider has all transactions
- All provider transactions reported as "missing"
- Expected behavior: bypass reconciliation on first sync

### Provider Balance = 0
- Tolerance calculation: 0 × 1% = 0
- Any computed balance ≠ 0 → mismatch
- Edge case: both 0 → match

### Very Large Datasets
- Reconciliation time grows with transaction count
- Batch reconciliation with pagination recommended
- Future: streaming reconciliation
