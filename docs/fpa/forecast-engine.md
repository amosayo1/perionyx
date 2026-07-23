# Forecast Engine

## Overview

The forecast engine supports two forecasting modes: **single-period forecast** (static monthly/quarterly) and **rolling forecast** (13-week and 24-month windows). Both modes leverage actuals-to-date, budget baselines, and driver projections to generate forward-looking estimates.

## Single-Period Forecast

A static forecast covers a defined fiscal period and is updated periodically (monthly/quarterly).

```
Forecast
├── id: string (ULID)
├── name: string
├── fiscalYear: number
├── period: number                  # Month or quarter number
├── periodType: Monthly | Quarterly
├── baselineBudgetId: string        # Source budget reference
├── baselineBudgetVersion: number
├── status: Draft | Final | Superseded
├── lineItems: ForecastLineItem[]
├── assumptions: ForecastAssumption[]
├── confidence: number              # 0–1 confidence score
├── createdBy: string
├── createdAt: Date
└── updatedAt: Date

ForecastLineItem
├── accountCode: string
├── budgetAmount: number
├── actualToDate: number
├── forecastAmount: number
├── varianceAmount: number          # forecast - budget
├── variancePercent: number
├── driverAdjustments: DriverAdjustment[]
└── notes: string
```

### Computation Flow

1. Load budget baseline for the given fiscal year/period
2. Pull actuals-to-date from the ledger for matched accounts
3. Apply driver-based adjustments from `DriverService`
4. Calculate variance between budget and projected forecast
5. Return line items with individual and aggregate rollups

## Rolling Forecast

The rolling forecast maintains a continuous planning horizon, advancing one period forward each month (13-week) or each month-end (24-month).

```
RollingForecast
├── id: string (ULID)
├── type: Weekly13 | Monthly24
├── windowStart: Date
├── windowEnd: Date
├── periods: RollingForecastPeriod[]
├── methodology: Automated | Manual | Hybrid
├── status: Active | Archived
├── confidence: number
├── lastRefreshed: Date
└── metadata: Record<string, unknown>

RollingForecastPeriod
├── periodIndex: number             # 1–13 or 1–24
├── periodStart: Date
├── periodEnd: Date
├── lineItems: ForecastLineItem[]
├── isActual: boolean              # True once period closes
└── totalAmount: number
```

### Rolling Window Mechanics

- **13-Week**: Cash-oriented, refreshed weekly. Each week, period 1 closes as actual, a new period 13 is appended.
- **24-Month**: Strategic, refreshed monthly. Each month, the earliest period closes to actual, a new month 24 is added.
- **Hybrid Methodology**: Automated driver-based projections for outer periods; manual adjustments allowed for near-term periods.

### Refresh Strategy

| Horizon | Refresh Cadence | Actuals Cutoff | Driver Update |
|---|---|---|---|
| 13-Week | Weekly (Mon) | Previous Fri COB | Cash drivers re-run |
| 24-Month | Monthly (Day 3) | Month-end close | All drivers re-run |

## Forecast Accuracy Tracking

Each forecast version stores:
- **Confidence score** (0–1) based on historical accuracy of underlying drivers
- **MAPE** (Mean Absolute Percentage Error) computed against prior forecasts
- **Bias** (over/under forecasting tendency per account)

## Seed Data

Three forecast versions are seeded:
1. **Baseline forecast** (Q1 2026, Draft) — initial projection from budget
2. **Updated forecast** (Q1 2026, Final) — with two months of actuals incorporated
3. **Rolling 13-week** (Active) — current rolling window with 3 actual weeks / 10 forecast weeks
4. **Rolling 24-month** (Active) — current rolling window with 2 actual months / 22 forecast months
