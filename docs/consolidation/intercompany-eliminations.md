# Intercompany Eliminations

## Transaction Types
| Type | Description |
|---|---|
| sales | Intercompany revenue and cost of goods sold |
| purchases | Intercompany procurement |
| loans | Intercompany lending and borrowing |
| interest | Interest on intercompany loans |
| dividends | Intercompany dividend payments |
| receivables | Intercompany trade receivables |
| payables | Intercompany trade payables |
| inventoryProfit | Unrealized profit in intercompany inventory |
| fixedAssetProfit | Unrealized profit in intercompany asset transfers |

## Matching Process
Intercompany records flow through a three-stage matching process:

```
identified → matched → eliminated
```

### Stage 1: Identified
Records are created when intercompany transactions are recorded by each entity. Each record captures:
- `fromEntityId` / `toEntityId` — Counterparty entities
- `fromAmount` / `toAmount` — Amounts recorded by each side
- `difference` — Variance between the two sides
- `currency` — Transaction currency

### Stage 2: Matched
Records are paired when both sides are identified and amounts correspond. The `matchRecords(id1, id2, amount, userId)` method:
1. Updates both records to `matched` status
2. Sets `matchedWithId` on each record
3. Records the elimination amount

### Stage 3: Eliminated
Matched records are eliminated via `eliminate(id, amount, journalId, userId)`:
- Status set to `eliminated`
- `eliminationJournalId` references the GL journal
- `eliminationDate` and `approvedById` recorded

## Unmatched Tracking
Unmatched records are tracked with:
- `getUnmatched()` — All unmatched records
- `getTotalUnmatched()` — Count of unmatched records
- `getTotalUnmatchedAmount()` — Sum of absolute differences
- Alerts generated for unmatched records with significant differences

## Automatic Elimination Journal Generation
When an intercompany record is eliminated:
1. Status changes to `eliminated`
2. `eliminationJournalId` references the GL journal
3. `eliminationAmount` records the eliminated value
4. `eliminationDate` captures when elimination occurred
