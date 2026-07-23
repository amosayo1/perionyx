# Cash Forecasting & Scenario Planning Architecture

## Overview

The Enterprise Cash Forecasting & Scenario Planning Center is the treasury intelligence platform for forecasting cash, modeling scenarios, simulating future liquidity, stress-testing the business, and preparing executive funding decisions. It consumes only Treasury Domain modules (Phase 9B.1) and remains fully provider-agnostic.

## System Context

```
Treasury Domain (Phase 9B.1)
  └── Cash Forecasting & Scenario Planning (Phase 9B.6)
        ├── Forecast Engine (500 records, 36 monthly + 52 weekly periods)
        ├── Scenario Models (200 scenarios, 13 types)
        ├── Stress Testing (120 tests, 10 stress types)
        ├── Rolling Forecast (13/26/52-week views)
        ├── Variance Analysis (260 records)
        ├── Liquidity Projections (100 projections)
        ├── Funding Forecasts (140 events)
        ├── Sensitivity Analysis (12 variables)
        ├── Assumptions Management (80 assumptions)
        └── Analytics & Executive Intelligence
```

## Component Hierarchy

```
GlobalCashForecastDashboard
├── ExecutiveCashForecastHeader (12 metrics)
├── TreasuryCashForecastFilters (15 dimensions)
├── CashForecastOverview (12 KPI cards)
├── CashForecastTable (500 records, 17 columns)
├── ScenarioPlanningCenter (200 scenarios)
├── StressTestingDashboard (120 tests)
├── RollingForecastCenter (13/26/52-week)
├── ForecastVarianceCenter (260 records)
├── LiquidityProjectionCenter (100 projections)
├── FutureFundingCenter (140 funding events)
├── ForecastAssumptionsPanel (80 assumptions)
├── ForecastSensitivityAnalysis (12 variables)
├── 12 Chart Components
├── ForecastRecommendationsPanel (50 recommendations)
├── ForecastAlertsPanel (60 alerts)
└── ExecutiveCashForecastInsights (20 insights)
```

## Data Model

- **Forecasts**: 500 records across 36 monthly periods (2023-2026) and 52 weekly periods for 12 entities
- **Scenarios**: 200 scenarios across 13 types with probability, impact, and liquidity outcomes
- **Stress Tests**: 120 tests across 10 stress types with severity, survival months, and recovery time
- **Variance**: 260 variance records comparing forecast vs actual across categories
- **Liquidity**: 100 liquidity projections with buffer, ratio, and coverage day calculations
- **Funding**: 140 funding events tracking required vs available funding with gap analysis

## Key Design Decisions

- **Provider-agnostic**: No AI models, no external forecasting services, no ERP connections
- **Mock intelligence**: All recommendations and insights use mock data, AI-ready architecture
- **Executive focus**: Every component answers CFO questions about cash position and risk
- **Perionyx design**: Dark-only, ~95% charcoal, ~4% white, ~1% gold (#c9a84c)
