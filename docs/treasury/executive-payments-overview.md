# Executive Payments Overview

## Purpose

The executive payments overview provides CFOs, Treasurers, and Controllers with immediate visibility into enterprise payment operations health, risk exposure, and cash movement status. It answers these critical questions:

1. **What is our payment volume today?** — Count and value of outgoing payments and incoming collections
2. **Are payments flowing smoothly?** — Failed payments, approval bottlenecks, settlement delays
3. **What is our cash movement?** — Net cash flow, pending amounts, cash position impact
4. **What needs attention?** — Critical alerts, high-risk payments, policy violations
5. **How are we performing?** — Processing times, settlement times, rail efficiency

## Key Insights

The `ExecutivePaymentInsights` component surfaces 8 key observations:

| Insight | What It Tells |
|---|---|
| Largest Outgoing Payment | Biggest single cash outflow event today |
| Largest Collection | Biggest single cash inflow event today |
| Most Active Entity | Entity with highest payment processing volume |
| Highest Settlement Delay | Region/rail with worst settlement performance |
| Most Expensive Rail | Payment rail with highest average cost |
| Highest Processing Volume | Payment rail with highest total value |
| Largest Cash Outflow | Payment category with highest total outflow |
| Largest Cash Inflow | Collection category with highest total inflow |

## Risk Dashboard

The `PaymentRiskPanel` provides a consolidated view of payment risks across 8 categories. Each risk shows:
- Current exposure value
- Count of affected items
- Entity responsible
- Severity (healthy/watch/critical)

## AI Recommendations

25 AI-generated recommendations (using mock intelligence) suggest actions across 8 categories:
- **Timing**: When to execute payments
- **Collections**: How to accelerate inflows
- **Rail Optimization**: Lower-cost/faster payment rails
- **Consolidation**: Batch payments to reduce volume
- **Risk**: Mitigate payment risk exposure
- **Liquidity**: Optimize cash position
- **Duplicate**: Prevent duplicate payments
- **FX**: Optimize currency conversion timing

## Executive Actions

From the header, treasury teams can:
- **New Payment**: Initiate a new payment (opens form)
- **Refresh**: Refresh data (currently mock refresh)
- **Export**: Export current view to CSV/PDF
- **Print**: Print-friendly view of current tab

## Accessibility

- All KPI values announced via `aria-label`
- Risk severities indicated by both color and text
- Trend arrows have text equivalents
- Tab panel relationships via `aria-controls`
- Screen reader friendly table markup
