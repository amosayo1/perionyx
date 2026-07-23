# Intercompany Accounting

## Overview

The Intercompany Accounting module manages transactions between legal entities within the same corporate group. It handles due to/due from tracking, intercompany journals, settlement tracking, and elimination entries for consolidation.

## Intercompany Transaction Types

| Type | Description |
|------|-------------|
| Due To | Liability from one entity to another |
| Due From | Asset/receivable from one entity to another |
| Settlement | Payment that settles an intercompany balance |
| Elimination | Entry that eliminates intercompany balances during consolidation |

## Intercompany Lifecycle

```
Draft → Approved → Posted → Settled
```

| Status | Description |
|--------|-------------|
| Draft | Initial entry, not yet active |
| Approved | Reviewed and approved |
| Posted | Recorded in both entities' ledgers |
| Settled | Cash settlement completed |

## Intercompany Matching

Intercompany transactions must match between entities:
- Amount must be equal on both sides
- Currency and exchange rate alignment
- Same period recognition
- Matching description and reference

## Settlement Tracking

Settlements track:
- Original intercompany journal
- Settlement date and amount
- Settlement method (cash, netting, offset)
- Settlement approval user

## IntercompanyService

| Method | Description |
|--------|-------------|
| `addJournal()` | Create intercompany journal |
| `getJournal()` | Get by ID |
| `getAllJournals()` | List all |
| `getByFromCompany()` | Filter by source entity |
| `getByToCompany()` | Filter by target entity |
| `getByStatus()` | Filter by status |
| `getUnsettled()` | Get all unsettled journals |
