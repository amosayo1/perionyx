---
id: reporting-platform
title: Reporting Platform
sidebar_label: Reporting Platform
description: Financial statements, variance reports, cash flow visualization, board packs, saved views, scheduling, AI commentary, and analytics components.
---

# Reporting Platform

## Overview

The Reporting Platform generates financial statements, variance reports, cash flow visualizations, and board packs. It is powered by ledger data from the Financial Engine, treasury data, and AI commentary from the Intelligence Platform.

**Location:** `src/app/api/v1/reporting/` (API endpoints), `src/components/enterprise/analytics/` (13 React components)

## Report Engine

The report engine produces financial reports through a pipeline:

1. **Data retrieval** — Queries ledger balances, treasury positions, and time-series data
2. **Computation** — Applies report-specific calculations (variance, ratios, consolidations)
3. **Formatting** — Structures data for the target output format
4. **Presentation** — Renders via analytics components or exports

### Supported Reports

| Report | Source Data | Frequency |
|---|---|---|
| Profit & Loss | Ledger (revenue/expense accounts) | Monthly, quarterly |
| Balance Sheet | Ledger (asset/liability/equity accounts) | Monthly, quarterly |
| Cash Flow Statement | Ledger + Treasury cash movements | Monthly, weekly |
| Variance Report | Budget vs actual comparison | Monthly |
| Cash Flow Timeline | Treasury cash positions + forecasts | Real-time |
| Board Pack | Combination of above + AI commentary | Quarterly |

## Saved Views

Users can create and save customized report views:

- Column selection and ordering
- Filter criteria (date range, entity, account group)
- Sort configuration (multi-column priority sort)
- Density preference (comfortable, compact, ultra-compact)
- Relative date presets (Today, This Week, This Month, Last 30 Days, Last Quarter, This Year)

Saved views are persisted per-user and per-company, applied across report generation sessions.

## Scheduling

Reports can be scheduled for automatic generation and distribution:

- Schedule configuration via Automation Scheduler (`automation-scheduler.ts`)
- Delivery via Notifications platform (Email, Slack, in-app)
- Frequency: daily, weekly, monthly, quarterly, or custom cron expressions
- Format selection: PDF (planned), CSV, Excel XML

## AI Commentary

The Intelligence Platform generates natural-language commentary for reports:

- **Executive summary** — One-paragraph overview of financial performance
- **Variance explanation** — Context for significant budget variances
- **Trend identification** — Notable patterns in cash flow or financial ratios
- **Anomaly flagging** — Transactions or balances outside normal ranges

All AI commentary is clearly labeled as AI-generated. It augments but never replaces human analysis.

## Exports

The export module (`src/components/enterprise/table/export-utils.ts`) supports:

| Format | Implementation | Use Case |
|---|---|---|
| CSV | UTF-8 BOM for Excel compatibility | Data analysis, import into spreadsheets |
| XML Excel | XML Spreadsheet 2003 format (zero dependencies) | Professional financial reporting |

Exports respect current column visibility, filters, and sort configuration.

## Analytics Components

The Reporting Platform includes 13 reusable analytics components in `src/components/enterprise/analytics/`:

| Component | Purpose |
|---|---|
| `ExecutiveKpiCard` | Metric display with trend arrow, sparkline, and color-coded status |
| `ChartCard` | Wrapper for chart content with entrance animation (350ms fade-in-up) |
| `ChartToolbar` | Time range selector and chart controls |
| `ChartLegend` | Interactive chart legend |
| `VarianceCard` | Budget vs actual variance with percentage and direction indicator |
| `CashFlowTimeline` | Time-series cash flow with forecast boundary visualization |
| `ForecastChart` | Projection display with confidence intervals |
| `ApprovalAnalytics` | Approval metrics (volume, cycle time, approval rate by role) |
| `WorkflowAnalytics` | Workflow performance (step durations, bottlenecks, failure rates) |
| `DrillDownPanel` | Hierarchical data exploration (click aggregate → see details) |
| `InsightPanel` | AI-generated insights and anomaly summaries |
| `ExecutiveSummary` | Combined dashboard with KPIs, trends, and alerts |
| `types/index` | Shared TypeScript types for all analytics components |

## Rendering Strategy

All charts render as custom inline SVG — no external chart library dependencies. This ensures:

- Zero additional bundle weight
- Full control over financial data visualization (negative values in parentheses, color-coded trends)
- WCAG 2.1 AA compliance (text alternatives, sufficient color contrast)
- Consistent styling with the enterprise design system (charcoal ~95%, gold accents ~1%)

## Performance

- Metric values render first (synchronously from cache), charts render second (async)
- Cache tiering: critical metrics (5s TTL), standard reports (60s), historical data (600s)
- Report generation queries use indexed columns and pagination
- AI commentary is fetched asynchronously and rendered when available

## API Endpoints

Reporting endpoints live at `src/app/api/v1/reporting/` and follow the same patterns as all other API routes:

- Input validation via zod schemas
- Error handling via `handleRouteError()` / `zodErrorResponse()`
- Cache headers with stale-while-revalidate
- Tenant-scoped queries via `requireTenantContext()`
