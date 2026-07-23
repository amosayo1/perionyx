---
id: financial-statements
title: Financial Statements
sidebar_label: Financial Statements
---

# Financial Statements

The Reporting Platform generates financial statements through a structured pipeline that transforms raw ledger and treasury data into standardized financial reports.

## Report Engine Pipeline

Financial reports are produced through a four-stage pipeline:

1. **Data retrieval** — Queries ledger balances, treasury positions, and time-series data
2. **Computation** — Applies report-specific calculations (variance, ratios, consolidations)
3. **Formatting** — Structures data for the target output format
4. **Presentation** — Renders via analytics components or exports

## Supported Financial Statements

| Statement | Source Data | Frequency |
|---|---|---|
| Profit & Loss | Ledger (revenue/expense accounts) | Monthly, quarterly |
| Balance Sheet | Ledger (asset/liability/equity accounts) | Monthly, quarterly |
| Cash Flow Statement | Ledger + Treasury cash movements | Monthly, weekly |
| Variance Report | Budget vs actual comparison | Monthly |
| Cash Flow Timeline | Treasury cash positions + forecasts | Real-time |
| Board Pack | Combination of above + AI commentary | Quarterly |

## Saved Views

Users can create and customize report views:

- **Column selection** — Choose which data columns to display and their order
- **Filter criteria** — Date range, entity, account group filters
- **Sort configuration** — Multi-column priority sort
- **Density preference** — Comfortable, compact, or ultra-compact layouts
- **Relative date presets** — Today, This Week, This Month, Last 30 Days, Last Quarter, This Year

Saved views are persisted per-user and per-company, applied across report generation sessions.

## Scheduling

Reports can be scheduled for automatic generation and distribution:

- **Configuration** — Via Automation Scheduler (`automation-scheduler.ts`)
- **Delivery channels** — Email, Slack, or in-app notification
- **Frequency options** — Daily, weekly, monthly, quarterly, or custom cron expressions
- **Format selection** — PDF (planned), CSV, or Excel XML

## Exports

The export module (`src/components/enterprise/table/export-utils.ts`) supports:

| Format | Implementation | Use Case |
|---|---|---|
| CSV | UTF-8 BOM for Excel compatibility | Data analysis, import into spreadsheets |
| XML Excel | XML Spreadsheet 2003 format (zero dependencies) | Professional financial reporting |

Exports respect current column visibility, filters, and sort configuration.

## Performance

- **Metric-first rendering** — Metric values render first (synchronously from cache), charts render second (async)
- **Cache tiering** — Critical metrics (5s TTL), standard reports (60s), historical data (600s)
- **Indexed queries** — Report generation uses indexed columns and pagination
- **Async AI commentary** — AI-generated insights are fetched asynchronously and rendered when available

## Interaction with Other Domains

| Domain | Interaction |
|---|---|
| Ledger | Primary data source for all financial statements |
| Treasury | Cash positions, liquidity, and forecasts feed cash flow reports |
| Intelligence Platform | AI commentary augments financial analysis |
| Workflow Engine | Approval and workflow data for operational reports |
