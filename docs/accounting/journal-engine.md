# Journal Engine

## Overview

The Journal Engine manages the complete journal entry lifecycle from creation through posting. It supports standard, recurring, adjusting, reversing, closing, and intercompany journal types with full audit trail and balanced validation.

## Journal Lifecycle

```
Draft → Approved → Posted → Reversed
                  → Voided
```

| Status | Description |
|--------|-------------|
| Draft | Initial state, editable, not yet submitted |
| Approved | Reviewed and approved, ready for posting |
| Posted | Committed to the general ledger |
| Reversed | Offset by a reversing entry, audit trail preserved |
| Voided | Cancelled with complete audit trail and reason |

## Journal Types

| Type | Description |
|------|-------------|
| Standard | Regular journal entry |
| Recurring | Creates entries on a schedule (daily/weekly/monthly/quarterly/annual) |
| Adjusting | Period-end adjustments (accruals, deferrals) |
| Reversing | Auto-reverses in the next period |
| Closing | Period/year-end closing entries |
| Opening | Opening balance setup |
| Intercompany | Transactions between legal entities |
| Allocations | Cost/revenue allocation distributions |
| Consolidation | Consolidation adjustment entries |
| Template | Reusable journal templates |

## Journal Structure

Each journal entry contains:

- **Header**: Journal number, type, status, description, period, currency
- **Lines**: Multiple line items with account, debit/credit, dimensions
- **Validation**: Must be balanced (total debits == total credits)

## Balanced Validation

All journals enforce:
1. At least one line item
2. Total debits == total credits (within 0.001 tolerance)
3. All line accounts exist and are active
4. Period is open for posting

## Recurring Journals

Recurring journals are defined with:
- Template entry structure
- Frequency (daily/weekly/monthly/quarterly/annual/custom)
- Next run date and optional end date
- Maximum occurrence count
- Active/paused status

The `getDueRecurring()` method returns all recurring journals whose `nextRunDate` is due for generation.

## JournalService

| Method | Description |
|--------|-------------|
| `addJournal()` | Create a journal entry |
| `getJournal()` | Get journal by ID |
| `getAllJournals()` | List all journals |
| `getJournalsByStatus()` | Filter by status |
| `getJournalsByType()` | Filter by type |
| `getJournalsByPeriod()` | Filter by period |
| `getJournalsByCompany()` | Filter by company |
| `getDraftJournals()` | Get all draft journals |
| `getUnpostedJournals()` | Get draft + approved journals |
| `generateJournalNumber()` | Generate unique journal number |
| `addRecurring()` | Create recurring journal |
| `getDueRecurring()` | Get due recurring journals |
