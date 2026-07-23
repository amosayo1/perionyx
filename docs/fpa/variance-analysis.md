# Variance Analysis Framework

## Overview

The variance analysis engine compares actual financial results against budget, forecast, prior period, and scenario baselines. It computes variances at every level of the account hierarchy, identifies root causes, and surfaces actionable insights through the alert and recommendation engines.

## Variance Types

```
VarianceReport
├── id: string (ULID)
├── name: string
├── type: VarianceType
│     BudgetActual | ForecastActual | PeriodOverPeriod | ScenarioDelta
├── period: DateRange
├── baseline: VarianceBaseline       # BudgetId | ForecastId | PriorPeriod
├── actuals: VarianceActual[]
├── lineItems: VarianceLineItem[]
├── summary: VarianceSummary
├── rootCauses: RootCause[]
├── status: Computed | Reviewed | Archived
├── computedAt: Date
└── computedBy: string

VarianceLineItem
├── accountCode: string
├── accountName: string
├── baselineAmount: number
├── actualAmount: number
├── varianceAmount: number
├── variancePercent: number
├── varianceDirection: Favorable | Unfavorable
├── isSignificant: boolean          # Exceeds materiality threshold
├── isRootCause: boolean
├── drivers: DriverContribution[]   # Driver decomposition
└── notes: string
```

### Budget vs Actual

Standard comparison against the approved budget baseline. Variances are computed monthly, with YTD and full-year projections.

### Forecast vs Actual

Compares the most recent forecast against actuals. Tracks forecast accuracy (MAPE) and bias by account and department.

### Period Over Period

Year-over-year and quarter-over-quarter comparisons for trend analysis. Automatically adjusts for calendar differences and period counts.

### Scenario Delta

Compares any scenario result against its source plan baseline. Used to evaluate the financial impact of strategic alternatives.

## Variance Thresholds

Materiality thresholds are configurable per account group:

| Category | Threshold | Action |
|---|---|---|
| Revenue | ±5% or $50K | Alert triggered for > 5% |
| COGS | ±3% or $25K | Alert triggered for > 3% |
| OpEx | ±10% or $10K | Alert triggered for > 10% |
| CapEx | ±5% or $100K | Alert triggered for > 5% |
| Headcount | ±2% or $20K | Alert triggered for > 2% |

## Root Cause Analysis

The engine performs automated root cause identification using:

1. **Driver Decomposition** — Break variance into volume vs. price vs. mix components
2. **Multi-Level Drill-Down** — Total → Department → Account → Line Item
3. **Correlation Scoring** — Identify causal links between driver changes and variance
4. **Historical Pattern Matching** — Compare against prior variance patterns for similar accounts

### Root Cause Output

```
RootCause
├── id: string
├── varianceReportId: string
├── accountCode: string
├── driverId: string
├── contributionPercent: number
├── description: string             # Narrative explanation
├── confidence: number              # 0–1
└── recommendedAction: string
```

## Waterfall Visualization

Variance results are rendered as waterfall charts showing the progression from baseline to actual across key drivers. The chart decomposition follows:

```
Baseline Amount
  ± Volume Variance
  ± Price Variance
  ± Mix Variance
  ± Efficiency Variance
  ± One-Time Items
= Actual Amount
```

## Seed Data

Variance reports are seeded for:
- Q1 2026 Budget vs Actual — 15 significant variances identified
- Q1 2026 Forecast vs Actual — MAPE tracking with 3 root causes
- Q1 2026 vs Q1 2025 Period-over-Period — Seasonal trend analysis
- High Growth scenario vs Baseline — Scenario impact assessment
