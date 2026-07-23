# Executive Guide — FP&A Module for CFOs & Controllers

## Overview

The Enterprise FP&A module provides the Office of the CFO with a unified platform for planning, analysis, and decision support. Designed for clarity, confidence, and speed, it replaces spreadsheet-dependent workflows with structured, auditable, driver-based planning.

## Key Capabilities

### Planning Suite
- **Budgeting** — Top-down, bottom-up, and hybrid approaches with full lifecycle management
- **Forecasting** — Single-period and rolling forecasts (13-week cash, 24-month strategic)
- **Scenario Planning** — What-if modeling with multi-variable sensitivity analysis
- **Driver-Based Planning** — Dynamic plans that update when operational drivers change

### Domain Plans
- **Revenue Planning** — Volume/price/mix decomposition with pipeline and retention modeling
- **Expense Planning** — Fixed/variable classification with headcount and vendor cost drivers
- **Capital Planning** — Capex justification, ROI tracking, depreciation schedules
- **Workforce Planning** — FTE modeling, compensation planning, hiring ramp scenarios
- **Cash Planning** — DSO/DPO driver modeling, liquidity forecasting, covenant tracking

### Analysis & Intelligence
- **Variance Analysis** — Budget vs actual, forecast vs actual, period-over-period, scenario delta
- **KPI Scorecards** — Financial, operational, and strategic KPIs with threshold monitoring
- **Alerts** — Real-time notification when variance, driver, or KPI thresholds are breached
- **Recommendations** — AI-assisted optimization suggestions based on variance patterns
- **Executive Insights** — Narrative summary with key drivers, risks, and opportunities

## CFO Workflow

### Monthly Close + Forecast Cycle

```
Day 1-3:  Actuals loaded, variance reports computed
Day 3-4:  Root cause analysis, department reviews
Day 4-5:  Forecast update with actuals + driver adjustments
Day 5-6:  Scenario review (what-if for significant variances)
Day 6-7:  Executive summary generated, board pack prepared
```

### Strategic Planning Cycle

```
Q1:  Strategic plan update, 3-year outlook
Q2:  Mid-year forecast revision, scenario stress testing
Q3:  Budget kickoff, target setting, driver validation
Q4:  Budget submission, approval, board review
```

## Controller Controls

- **Approval Chains** — Multi-level budget approval with escalation
- **Lock Periods** — Prevent unauthorized changes after close
- **Audit Trail** — Every driver override, scenario edit, and forecast adjustment is logged
- **Version History** — Full version tree for budgets, forecasts, and plans
- **Covenant Monitoring** — Track debt covenants alongside cash planning

## Trust & Transparency

- **Data Freshness** — Each report is timestamped with the last actuals cutoff
- **Driver Transparency** — Every line item shows its driver dependencies
- **Variance Explanations** — Root causes are attributed, not just flagged
- **Confidence Metrics** — Forecasts and scenarios display confidence scores

## Getting Started

Access the FP&A module at `/planning` in the application. Key entry points:

| Page | Path | Purpose |
|---|---|---|
| Planning Dashboard | `/planning` | Cross-domain KPIs, alerts, quick actions |
| Budget | `/planning/budget` | Budget creation, approval, revision |
| Forecast | `/planning/forecast` | Single-period and rolling forecasts |
| Scenarios | `/planning/scenarios` | What-if and scenario modeling |
| Variance | `/planning/variance` | Variance reports and root cause analysis |
| Exec Summary | `/planning/executive` | CFO dashboard with insights |
