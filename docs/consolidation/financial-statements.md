# Financial Statements

## Statement Types
| Type | Description | Key Totals |
|---|---|---|
| balanceSheet | Consolidated balance sheet | Total Assets, Liabilities, Equity |
| incomeStatement | Consolidated income statement | Revenue, Expenses, Net Income |
| cashFlow | Consolidated cash flow statement | Operating, Investing, Financing |
| equityChanges | Statement of changes in equity | Total Equity |
| trialBalance | Consolidated trial balance | Debits = Credits |

## Statement Generation

### Balance Sheet
Generated via `generateBalanceSheet(runId, periodId, currency, entries)`:
- Sections: assets, liabilities, equity
- Validates: `Assets = Liabilities + Equity`
- `isBalanced` flag set based on tolerance (< 0.01)

### Income Statement
Generated via `generateIncomeStatement(runId, periodId, currency, entries)`:
- Sections: revenue, expenses
- Calculates: `Net Income = Total Revenue - Total Expenses`

### Cash Flow Statement
Generated via `generateCashFlow(runId, periodId, currency, entries)`:
- Sections: operating, investing, financing
- Calculates: `Net Cash Change = Operating + Investing + Financing`

### Statement of Changes in Equity
Generated via `generateEquityChanges(runId, periodId, currency, entries)`:
- Tracks all equity movements in the period
- Section: equity

### Trial Balance
Generated via `generateTrialBalance(runId, periodId, currency, entries)`:
- Validates: Total Debits = Total Credits
- `isBalanced` flag set based on tolerance (< 0.01)

## Consolidation Adjustments
| Adjustment Type | Description |
|---|---|
| fairValue | Fair value adjustments to assets/liabilities |
| goodwill | Goodwill recognition and impairment |
| purchasePriceAllocation | PPA adjustments |
| restructuring | Restructuring provisions |
| reorganization | Entity reorganization impacts |
| accountingPolicy | Accounting policy alignment adjustments |
| errorCorrection | Prior period error corrections |
| other | Other consolidation adjustments |

Adjustments follow a lifecycle: `draft → review → approved → posted → rejected`

## Balance Check
The `checkBalance(id)` method validates:
```
Assets = Liabilities + Equity
```
Tolerance: < 0.01 difference. Returns `isBalanced` boolean on the statement set.

## Multi-Period Comparison
Each `FinancialStatementEntry` supports:
- `amount` — Current period amount
- `comparisonAmount` — Prior period amount
- `variance` — Absolute variance
- `variancePercent` — Percentage variance
