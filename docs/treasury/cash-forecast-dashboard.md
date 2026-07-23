# Cash Forecast Dashboard

## Overview

The Cash Forecast Dashboard provides unified visibility into the enterprise cash forecasting function. It answers: What is our projected cash position? What scenarios could impact us? How accurate are our forecasts?

## Tabs

| Tab | Purpose | Component |
|---|---|---|
| Overview | 12 KPI summary + 3 chart pairs | `CashForecastOverview` + charts |
| Forecasts | Full forecast records table | `CashForecastTable` |
| Scenarios | Scenario planning center | `ScenarioPlanningCenter` |
| Stress Testing | Stress test results | `StressTestingDashboard` |
| Rolling Forecast | 13/26/52-week views | `RollingForecastCenter` |
| Variance | Forecast vs actual analysis | `ForecastVarianceCenter` |
| Liquidity | Liquidity projections | `LiquidityProjectionCenter` |
| Funding | Funding forecast | `FutureFundingCenter` |
| Assumptions | Assumptions management | `ForecastAssumptionsPanel` |
| Sensitivity | Sensitivity analysis | `ForecastSensitivityAnalysis` |
| Recommendations | AI recommendations | `ForecastRecommendationsPanel` |
| Alerts | Forecast alerts | `ForecastAlertsPanel` |
| Executive | Executive insights + charts | `ExecutiveCashForecastInsights` |

## Executive Header KPIs

| Metric | Description |
|---|---|
| Forecast Horizon | Current forecast coverage (e.g., 36 months) |
| Forecast Confidence | Overall confidence level (0-100%) |
| Cash Runway | Days of cash remaining |
| Projected Ending Cash | Forecasted period-end balance |
| Funding Requirement | Total funding needed |
| Expected Liquidity | Projected available liquidity |
| Scenario Count | Active scenarios |
| Stress Tests | Stress test results |
| Forecast Accuracy | Last period accuracy % |
| Cash Burn | Monthly cash consumption |
| Largest Risk | Biggest identified risk |
| Largest Opportunity | Biggest potential upside |

## Filters

15 dimensions: Entity, Region, Currency, Forecast Horizon, Scenario, Business Unit, Forecast Type, Confidence, Risk Level, Liquidity Tier, Cash Category, Department, Date Range, Status, Owner.
