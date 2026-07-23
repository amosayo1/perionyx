---
id: executive-dashboard
title: Executive Dashboard
sidebar_label: Executive Dashboard
---

# Executive Dashboard

The Executive Dashboard provides a consolidated view of organizational financial health through 13 reusable analytics components.

## Analytics Components

The Reporting Platform includes components in `src/components/enterprise/analytics/`:

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
| `DrillDownPanel` | Hierarchical data exploration (click aggregate to see details) |
| `InsightPanel` | AI-generated insights and anomaly summaries |
| `ExecutiveSummary` | Combined dashboard with KPIs, trends, and alerts |
| `types/index` | Shared TypeScript types for all analytics components |

## AI Commentary

The Intelligence Platform generates natural-language commentary for dashboards:

- **Executive summary** — One-paragraph overview of financial performance
- **Variance explanation** — Context for significant budget variances
- **Trend identification** — Notable patterns in cash flow or financial ratios
- **Anomaly flagging** — Transactions or balances outside normal ranges

All AI commentary is clearly labeled as AI-generated. It augments but never replaces human analysis.

## Rendering Strategy

All charts render as custom inline SVG — no external chart library dependencies:

- **Zero bundle weight** — No additional JavaScript for charting
- **Financial precision** — Full control over visualization (negative values in parentheses, color-coded trends)
- **Accessibility** — WCAG 2.1 AA compliance (text alternatives, sufficient color contrast)
- **Design consistency** — Matches the enterprise design system (charcoal ~95%, gold accents ~1%)

## Performance

- **Metric-first rendering** — Metric values render first (synchronously from cache), charts render second
- **Cache tiering** — Critical metrics (5s TTL), standard reports (60s), historical data (600s)
- **Async data loading** — AI commentary and complex visualizations load asynchronously

## API Endpoints

Reporting endpoints live at `src/app/api/v1/reporting/` and follow standard patterns:

- Input validation via zod schemas
- Error handling via `handleRouteError()` / `zodErrorResponse()`
- Cache headers with stale-while-revalidate
- Tenant-scoped queries via `requireTenantContext()`
