# Accounting Periods

## Overview

The Accounting Periods module manages fiscal years, accounting periods, and the period close process. It supports flexible fiscal calendars, soft/hard close workflows, and period locking for audit integrity.

## Fiscal Calendar

### Fiscal Year
- Custom start/end dates (not required to align with calendar year)
- Multi-company fiscal calendars
- Status tracking (open/closed)

### Accounting Periods
- Monthly (default), Quarterly, Semi-annual, Annual
- Hierarchical: fiscal year → periods
- Adjusting periods for year-end adjustments
- Sequence numbering for ordering

## Period Statuses

| Status | Description |
|--------|-------------|
| Open | Available for journal entry and posting |
| Soft Close | Period is closing — limited activity allowed, accruals processed |
| Hard Close | Period is finalized — no activity allowed |
| Locked | Period is permanently locked — read-only |

## Close Process

The close process consists of multiple steps executed in sequence:

### Close Steps

| Step Type | Description |
|-----------|-------------|
| Validation | Verify all journals posted, reconciliations complete |
| Reconciliation | Ensure all accounts are reconciled |
| Accrual | Process period-end accruals |
| Adjustment | Post adjusting journal entries |
| Reversal | Process reversing entries for next period |
| Closing | Execute closing entries (revenue/expense to retained earnings) |
| Report | Generate and review financial statements |

### Soft Close vs Hard Close

**Soft Close**: Intermediate checkpoint — allows reversal and re-opening for adjustments. Used for monthly closes before final quarterly/annual close.

**Hard Close**: Final close — period is locked and cannot be re-opened without administrative override. Used for quarterly and annual closes.

## Close Process Status

- In Progress — Close process is active
- Completed — All steps finished successfully
- Failed — One or more steps encountered errors
- Reversed — Close has been undone (soft close only)

## PeriodsService

| Method | Description |
|--------|-------------|
| `addPeriod()` | Create an accounting period |
| `getPeriod()` | Get period by ID |
| `getAllPeriods()` | List all periods |
| `getPeriodsByStatus()` | Filter by status |
| `getOpenPeriods()` | Get all open periods |
| `addFiscalYear()` | Create a fiscal year |
| `getFiscalYear()` | Get fiscal year by ID |
| `getAllFiscalYears()` | List all fiscal years |
| `addCloseProcess()` | Record a close process |
| `getCloseProcess()` | Get close process by ID |
| `getAllCloseProcesses()` | List all close processes |
| `getCloseProcessesByPeriod()` | Filter by period |
