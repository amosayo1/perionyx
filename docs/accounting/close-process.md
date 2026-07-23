# Close Process

## Overview

The Close Process module provides a structured, auditable workflow for period-end financial close. It supports monthly, quarterly, annual, and year-end closes with configurable step sequences, validation checkpoints, and status tracking.

## Close Types

| Type | Scope |
|------|-------|
| Monthly | Single period close |
| Quarterly | Three-period close with consolidation |
| Annual | Full fiscal year close |
| Year-End | Fiscal year-end close with opening balance setup |

## Close Workflow

```
1. Validation
   - Verify all journals posted
   - Check all reconciliations completed
   - Validate trial balance balances

2. Reconciliations
   - Bank accounts reconciled
   - Intercompany accounts reconciled
   - Suspense accounts cleared

3. Accruals
   - Revenue accruals
   - Expense accruals
   - Payroll accruals

4. Adjustments
   - Depreciation entries
   - Amortization entries
   - Revaluation adjustments

5. Reversals
   - Auto-reversing entries for next period
   - Temporary adjustment reversals

6. Closing Entries
   - Close revenue accounts to Income Summary
   - Close expense accounts to Income Summary
   - Close Income Summary to Retained Earnings
   - Close Dividends to Retained Earnings

7. Reports
   - Generate Trial Balance
   - Generate Income Statement
   - Generate Balance Sheet
   - Generate Cash Flow Statement
```

## CloseStep

Each step in the close process is tracked with:
- Name and type
- Status (pending, in-progress, completed, failed, skipped)
- Start and completion timestamps
- Completed-by user
- Result summary or error details

## Audit Trail

Every close action is recorded:
- Who started the close
- Who completed each step
- What adjustments were made
- When each step was executed
- Any errors or exceptions encountered
