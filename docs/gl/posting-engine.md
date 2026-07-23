# Posting Engine

## Double-Entry Accounting

The GL posting engine enforces double-entry accounting principles:

1. Every journal entry has equal debits and credits
2. The accounting equation (Assets = Liabilities + Equity) is maintained
3. Natural balances are enforced per account category

## Posting Lifecycle

1. **Draft** — Journal is created, entries are added
2. **Approved** — Journal is reviewed and approved
3. **Posted** — Journal is posted to the ledger
4. **Reversed** — Journal is reversed (if needed)
5. **Error** — Posting validation failed

## Validation Rules

- Balanced validation (debits = credits)
- Account existence check
- Period status check (must be open)
- Duplicate detection
- Required field validation

## Posting Batches

Batches allow grouping multiple journal entries for atomic posting. Each batch has:
- Batch number (auto-generated)
- Entry count
- Total debits and credits
- Approval workflow
- Posting execution

## Reversing Journals

Reversing journals automatically reverse in the next period, useful for:
- Accruals
- Adjustments
- Error corrections
