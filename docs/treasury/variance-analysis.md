# Variance Analysis

## Overview

The Variance Analysis Center compares forecasted vs actual cash flows across all categories, entities, and periods, identifying where forecasts diverge from reality and why.

## Variance Structure

Each variance record captures:
- **Period**: The time period being compared
- **Entity**: Legal entity
- **Category**: Operating, investing, financing, FX, or tax
- **Forecasted**: Expected value
- **Actual**: Realized value
- **Variance**: Actual minus forecasted
- **Variance %**: Variance as percentage of forecast
- **Reason**: Explanation of the variance
- **Owner**: Person responsible for explanation
- **Status**: Open, investigating, explained, resolved

## Variance Categories

| Category | Typical Variance Sources |
|---|---|
| Operating | Revenue timing, expense fluctuations |
| Investing | CapEx delays, asset sales |
| Financing | Debt draws, repayments, dividends |
| FX | Exchange rate movements |
| Tax | Payment timing, assessment changes |

## Variance Statuses

| Status | Meaning | Action Required |
|---|---|---|
| Open | Variance detected, no investigation | Assign owner |
| Investigating | Root cause analysis in progress | Complete analysis |
| Explained | Root cause identified | Document and close |
| Resolved | Variance understood and addressed | None |

## Variance Waterfall

The VarianceWaterfallChart visualizes cash flow movements from opening to closing balance, showing the contribution of each category. Green bars represent positive movements (inflows), red bars represent negative movements (outflows).

## Variance Thresholds

| Variance % | Classification | Escalation |
|---|---|---|
| <5% | Normal | None |
| 5-10% | Notable | Review with forecaster |
| >10% | Significant | Review with Treasury team |
| >20% | Material | Review with CFO |
