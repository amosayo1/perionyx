# Posting Engine

## Overview

The Posting Engine handles journal posting to the general ledger. It supports automatic, manual, batch, and scheduled posting modes with comprehensive validation, duplicate detection, and error handling.

## Posting Modes

| Mode | Description |
|------|-------------|
| Automatic | System posts immediately on journal approval |
| Manual | User-initiated posting of individual journals |
| Batch | Group posting of multiple journals |
| Scheduled | Time-based posting (cron or scheduled trigger) |

## Posting Lifecycle

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

## Posting Validation

Each journal is validated before posting:

1. **NO_LINES** — Journal must have at least one line
2. **UNBALANCED** — Debits must equal credits within 0.001 tolerance
3. **ALREADY_POSTED** — Prevent duplicate posting
4. **ACCOUNT_EXISTS** — All line accounts must exist
5. **PERIOD_OPEN** — Target period must be open for posting

## Duplicate Detection

The engine maintains a `postedJournalIds` set to prevent journals from being posted more than once. This is checked during validation.

## Batch Posting

Batches allow grouping multiple journals for coordinated posting:

- Total journals count
- Success/failure tracking per journal
- Error collection with codes and messages
- Audit trail for batch operations

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
