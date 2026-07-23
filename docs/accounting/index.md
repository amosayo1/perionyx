# Enterprise Accounting & General Ledger Module

## Overview

The Enterprise Accounting module provides a Fortune 500-grade multi-company, multi-currency accounting platform integrated with Perionyx Platform Core v1.0. It supports full general ledger capabilities, chart of accounts, journal engine, posting engine, financial statements, reconciliation, allocations, intercompany accounting, and consolidation.

Zero external APIs. Zero accounting SDKs. Zero ERP SDKs. Provider-agnostic. AI-ready.

## Architecture

```
src/server/accounting/
  types/index.ts                    — All accounting domain types (521 lines)
  index.ts                          — Barrel exports
  accounting-seed.ts                — Deterministic seed data
  services/
    accounting-service.ts           — Facade composing all 13 sub-services
  domain/
    chart-of-accounts-service.ts    — Account tree, search, CRUD
    journal-service.ts              — Journal entries, recurring journals
    posting-service.ts              — Posting batches, validation
    ledger-service.ts               — Account balances, trial balance
    periods-service.ts              — Fiscal years, periods, close processes
    reconciliation-service.ts       — Bank/ledger/account reconciliation
    allocations-service.ts          — Allocation rules and runs
    intercompany-service.ts         — Due to/due from, settlements
    consolidation-service.ts        — Multi-entity consolidation
    statements-service.ts           — Financial statement generation
    budgets-service.ts              — Budget management
    audit-service.ts                — Audit trail and event tracking
    analytics-service.ts            — KPIs, forecasts, computations
  repositories/                     — Repository interfaces (Prisma-ready)
```

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture](./architecture.md) | Module architecture and design decisions |
| [Chart of Accounts](./chart-of-accounts.md) | Account types, hierarchy, and management |
| [General Ledger](./general-ledger.md) | Account balances, trial balance |
| [Journal Engine](./journal-engine.md) | Journal lifecycle, types, recurring |
| [Posting Engine](./posting-engine.md) | Posting modes, validation, batches |
| [Accounting Periods](./accounting-periods.md) | Fiscal years, periods, close process |
| [Close Process](./close-process.md) | Period-end close workflow |
| [Reconciliation](./reconciliation.md) | Bank/ledger/account reconciliation |
| [Allocations](./allocations.md) | Cost/revenue allocation rules |
| [Intercompany](./intercompany.md) | Due to/due from, settlement tracking |
| [Consolidation](./consolidation.md) | Multi-entity consolidation |
| [Financial Statements](./financial-statements.md) | Trial balance, BS, IS, cash flow |
| [KPIs](./kpis.md) | Financial performance metrics |
| [Executive Dashboard](./executive-dashboard.md) | Executive view and insights |
| [AI Opportunities](./ai-opportunities.md) | AI/ML integration candidates |
| [Developer Guide](./developer-guide.md) | How to extend the module |

## Core Modules

| Module | Description |
|--------|-------------|
| Chart of Accounts | Hierarchical account tree with 10 types, control accounts, custom accounts |
| General Ledger | Account balances, period activity, trial balance generation |
| Journal Entries | Multi-line entries with balanced validation, 10 journal types |
| Posting Engine | Automatic/manual/batch posting, validation, duplicate detection |
| Accounting Periods | Fiscal years, monthly periods, soft/hard close, locking |
| Reconciliation | Bank, ledger, account, and suspense reconciliation with exception tracking |
| Allocations | Percentage, headcount, revenue-based cost allocation rules |
| Intercompany | Due to/due from tracking, intercompany journals, settlement |
| Consolidation | Multi-company, multi-entity, multi-currency consolidation |
| Financial Statements | Trial balance, income statement, balance sheet, cash flow |
| Budgets | Operating, capital, revenue, expense budgets with variance analysis |
| Audit | Complete audit trail with field-level change tracking |

## Chart of Accounts

| Type | Class | Normal Balance |
|------|-------|----------------|
| Asset | Current, Non-current, Contra | Debit |
| Liability | Current, Non-current, Contra | Credit |
| Equity | Equity, Contra-equity | Credit |
| Revenue | Revenue, Contra-revenue | Credit |
| Cost of Sales | Expense | Debit |
| Operating Expense | Expense | Debit |
| Other Income | Revenue | Credit |
| Other Expense | Expense | Debit |
| Tax | Expense | Debit |
| Memo | Memo | Debit/Credit |
| Custom | Custom | Debit/Credit |

## Journal Engine

| Status | Description |
|--------|-------------|
| Draft | Initial entry, editable |
| Approved | Ready for posting |
| Posted | Committed to ledger |
| Reversed | Offset by reversing entry |
| Voided | Cancelled with audit trail |

## Financial KPIs

| KPI | Formula |
|-----|---------|
| Net Income | Revenue - Total Expenses |
| Gross Margin | (Revenue - COGS) / Revenue × 100 |
| Operating Margin | (Revenue - Operating Expenses) / Revenue × 100 |
| EBITDA | Net Income + Interest + Taxes + Depreciation + Amortization |
| Working Capital | Current Assets - Current Liabilities |
| Current Ratio | Current Assets / Current Liabilities |
| Quick Ratio | (Current Assets - Inventory) / Current Liabilities |
| Debt Ratio | Total Liabilities / Total Assets |
| Return on Assets | Net Income / Total Assets |
| Return on Equity | Net Income / Shareholder's Equity |

## Mock Data

| Entity | Count |
|--------|-------|
| GL Accounts | 2,000 |
| Fiscal Years | 3 (2024-2026) |
| Accounting Periods | 36 |
| Journal Entries | 5,000 |
| Posting Batches | 50 |
| Account Balances | 16,000+ |
| Reconciliations | 250 |
| Allocation Rules | 120 |
| Allocation Runs | 60 |
| Intercompany Journals | 80 |
| Consolidations | 50 |
| Budgets | 30 |
| Audit Events | 100 |
| KPIs | 12 |
| Forecasts | 18 |

## Pages

| Route | Section | Components |
|-------|---------|------------|
| `/accounting` | Accounting Center | AccountingOverview, JournalEntryTable |
| `/accounting/overview` | Dashboard overview | AccountingAlerts, AccountingOverview, AccountingKPICard |
| `/accounting/general-ledger` | GL balances | AccountingFilters, GeneralLedgerGrid |
| `/accounting/chart-of-accounts` | Account tree | AccountingKPICard, ChartOfAccountsTree |
| `/accounting/journals` | Journal entry list | JournalEntryTable |
| `/accounting/posting` | Posting queue | AccountingKPICard, PostingQueue |
| `/accounting/periods` | Period management | AccountingKPICard, PeriodManagement |
| `/accounting/reconciliation` | Reconciliation | AccountingKPICard, BankReconciliationPanel |
| `/accounting/allocations` | Allocation rules | AccountingKPICard, AllocationManager |
| `/accounting/intercompany` | IC journals | AccountingKPICard, IntercompanyDashboard |
| `/accounting/consolidation` | Consolidation | AccountingKPICard, ConsolidationCenter |
| `/accounting/financial-statements` | Statement viewer | TrialBalanceTable, IncomeStatementView, BalanceSheetView, CashFlowStatementView |
| `/accounting/analytics` | KPIs and forecast | AccountingAnalytics |
| `/accounting/executive` | Executive view | ExecutiveAccountingHeader, AccountingOverview, ExecutiveInsights |

## UI Components

| Component | Description |
|-----------|-------------|
| AccountingOverview | KPI metrics grid |
| AccountingKPICard | Single metric display card |
| AccountingFilters | Multi-select filter bar |
| AccountingAlerts | Severity-based alert list |
| AccountingAnalytics | KPI grid + forecast panel |
| ExecutiveAccountingHeader | Executive summary metrics |
| ExecutiveInsights | AI-powered narrative insights |
| ChartOfAccountsTree | Hierarchical account tree browser |
| GeneralLedgerGrid | Account balance table |
| JournalEntryTable | Journal entry list with status badges |
| PostingQueue | Posting batch status list |
| PeriodManagement | Period status table with close tracking |
| BankReconciliationPanel | Reconciliation detail view |
| AllocationManager | Rules and runs management |
| IntercompanyDashboard | IC journal status list |
| ConsolidationCenter | Consolidation status view |
| TrialBalanceTable | Trial balance row display |
| IncomeStatementView | Formatted P&L view |
| BalanceSheetView | Side-by-side BS view |
| CashFlowStatementView | Section-based cash flow view |
| FinancialStatementViewer | Generic statement table |

## AI Readiness

Every model includes metadata fields for:
- Journal Suggestions — AI-predicted account codes and descriptions
- Auto Classification — Automated transaction categorization
- Posting Validation — Anomaly detection before posting
- Variance Detection — Automated budget vs actual analysis
- Close Recommendations — Optimized close workflow sequencing
- Financial Narrative Generation — Natural language statement summaries
- Forecast Assistance — ML-based revenue and expense forecasting
- Executive Insights — Automated financial commentary

## Integration Points

| Module | Integration |
|--------|-------------|
| Banking (9A) | Bank reconciliation, transaction import |
| Treasury (9B) | Cash position, liquidity, funding |
| Investments (9C) | Investment accounting, P&L recognition |
| Risk (9D) | Risk-adjusted financial reporting |
| CRM | Customer/vendor account mapping |
| Platform Core | Navigation, infrastructure, auth |
