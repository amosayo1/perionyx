# Enterprise FP&A Module

## Overview

The Enterprise Financial Planning & Analysis (FP&A) module provides a comprehensive planning, budgeting, forecasting, and analytical platform integrated with Perionyx Platform Core v1.0. It supports full budget lifecycle management, multi-scenario forecasting, rolling forecasts, variance analysis, scenario planning, revenue/expense/workforce/capital planning, cost center and profit center hierarchies, executive scorecards, and financial analytics.

Zero external APIs. Zero planning SDKs. Zero ERP SDKs. Provider-agnostic. AI-ready.

## Architecture

```
src/server/fpa/
  types/index.ts                         — All FPA domain types (427 lines, 30+ interfaces)
  index.ts                               — Barrel exports
  fpa-seed.ts                            — Deterministic seed data (50k+ records)
  services/
    fpa-service.ts                       — Facade composing all 16 domain services
  domain/
    budgets/budgets-service.ts           — Budget lifecycle CRUD
    forecast/forecast-service.ts         — Forecast management
    rolling-forecast/rolling-forecast-service.ts — Rolling forecast windows
    variance/variance-service.ts         — Variance tracking and analysis
    scenario/scenario-service.ts         — Scenario modeling
    revenue/revenue-service.ts           — Revenue driver planning
    expense/expense-service.ts           — Expense category planning
    workforce/workforce-service.ts       — Headcount and compensation planning
    capital/capital-service.ts           — CAPEX and asset planning
    cost-centers/cost-centers-service.ts — Cost center hierarchy
    profit-centers/profit-centers-service.ts — Profit center tracking
    allocation/allocation-service.ts     — Cost allocation rules
    kpis/kpis-service.ts                 — Scorecard and KPI management
    analytics/analytics-service.ts       — Trends, alerts, recommendations
    executive/executive-service.ts       — Executive summaries, computations
    planning/planning-service.ts         — Planning records
```

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture](./architecture.md) | Module architecture and design decisions |
| [Budget Engine](./budget-engine.md) | Budget types, lifecycle, versioning |
| [Forecast Engine](./forecast-engine.md) | Forecast types, scenarios, methodologies |
| [Rolling Forecast](./rolling-forecast.md) | Rolling windows, frequency, confidence |
| [Variance Analysis](./variance-analysis.md) | Variance types, direction, root cause |
| [Scenario Planning](./scenario-planning.md) | What-if analysis and scenario modeling |
| [Revenue Planning](./revenue-planning.md) | Revenue drivers, pricing, pipeline |
| [Expense Planning](./expense-planning.md) | Expense categories and planning |
| [Workforce Planning](./workforce-planning.md) | Headcount, hiring, compensation |
| [Capital Planning](./capital-planning.md) | CAPEX, depreciation, projects |
| [Cost Centers](./cost-centers.md) | Department hierarchies, allocations |
| [Profit Centers](./profit-centers.md) | Business units, margin analysis |
| [Executive Scorecards](./executive-scorecards.md) | KPI framework, scoring methodology |
| [Analytics](./analytics.md) | Trends, utilization, accuracy |
| [KPIs](./kpis.md) | Complete KPI list with formulas |
| [AI Roadmap](./ai-roadmap.md) | AI/ML integration candidates |
| [Developer Guide](./developer-guide.md) | How to extend the module |

## Domain Services

| Service | Records | Description |
|---------|---------|-------------|
| BudgetsService | ~1,000+ | Budget lifecycle, versioning, status management |
| ForecastService | ~2,000+ | Multi-scenario, multi-method forecasts |
| RollingForecastService | ~75 | Rolling windows (3-24 month) |
| ScenarioService | ~500+ | What-if scenarios with parameterized impacts |
| VarianceService | ~15,000+ | Budget vs actual, forecast vs actual |
| RevenuePlanningService | ~450+ | Driver-based revenue plans |
| ExpensePlanningService | ~900+ | Category-based expense plans |
| WorkforceService | ~450+ | Headcount and compensation plans |
| CapitalPlanningService | ~225+ | CAPEX and depreciation plans |
| CostCenterService | ~5,000+ | Hierarchical cost centers (up to 4 levels) |
| ProfitCenterService | ~200+ | Business unit profitability |
| FPAAllocationService | ~60 | Cost allocation rules |
| FPAScorecardService | ~1,500+ | KPIs and scorecards |
| FPAAnalyticsService | ~2,000+ | Trends, alerts, recommendations |
| ExecutiveService | Computations | Executive summaries, KPI calculations |
| PlanningService | ~2,000+ | Planning records at entity/region/BU/dept levels |

## Mock Data

| Entity | Count |
|--------|-------|
| Companies | 25 |
| Budgets | 1,000+ |
| Forecasts | 2,000+ |
| Rolling Forecasts | 75 |
| Variance Records | 15,000+ |
| Scenarios | 500+ |
| Revenue Plans | 450+ |
| Expense Plans | 900+ |
| Workforce Plans | 450+ |
| Capital Plans | 225+ |
| Cost Centers | 5,000+ |
| Profit Centers | 200+ |
| Allocation Rules | 60 |
| KPIs | 15,000+ |
| Scorecards | 900+ |
| Alerts | 2,000+ |
| Recommendations | 1,500+ |
| Trends | 120+ |
| Forecast Revisions | 2,000+ |

## Pages

| Route | Section | Components |
|-------|---------|------------|
| `/planning` | FP&A Center | FPAOverview, PlanningAlertsPanel, PlanningRecommendationsPanel |
| `/planning/overview` | Overview | ExecutivePlanningHeader, FPAOverview, PlanningAlertsPanel |
| `/planning/budgets` | Budgets | FPAKPICard, BudgetGrid |
| `/planning/forecasts` | Forecasts | FPAKPICard, ForecastGrid |
| `/planning/rolling-forecast` | Rolling Forecast | FPAKPICard, RollingForecastTimeline |
| `/planning/variance` | Variance | FPAKPICard, VarianceDashboard, VarianceHeatMap |
| `/planning/scenario-planning` | Scenarios | FPAKPICard, ScenarioSimulator |
| `/planning/revenue` | Revenue | FPAKPICard, RevenuePlanningBoard, RevenueTrendChart |
| `/planning/expense` | Expense | FPAKPICard, ExpensePlanningBoard, ExpenseTrendChart |
| `/planning/workforce` | Workforce | FPAKPICard, WorkforcePlanner |
| `/planning/capital` | Capital | FPAKPICard, CapitalPlanningBoard |
| `/planning/cost-centers` | Cost Centers | FPAKPICard, CostCenterHierarchy |
| `/planning/profit-centers` | Profit Centers | FPAKPICard, ProfitCenterDashboard |
| `/planning/scorecards` | Scorecards | FPAKPICard, ExecutiveScorecards |
| `/planning/analytics` | Analytics | FPAKPICard, BudgetUtilizationChart, ForecastAccuracyChart, PlanningTrendChart |
| `/planning/executive` | Executive View | ExecutivePlanningHeader, ExecutivePlanningInsights, PlanningRecommendationsPanel |

## KPI Categories

| Category | Example KPIs |
|----------|-------------|
| Revenue | Revenue Growth Rate, Net Revenue, Recurring Revenue %, Revenue per Customer |
| Profitability | Gross Margin, Operating Margin, EBITDA Margin, Net Profit Margin, ROE |
| Liquidity | Current Ratio, Quick Ratio, Working Capital |
| Efficiency | DSO, DPO, Asset Turnover, Inventory Turnover |
| Growth | Revenue Growth YoY, Customer Growth Rate, Market Share |
| Budget | Budget Variance %, Budget Utilization |
| Forecast | Forecast Accuracy, Forecast Bias |

## AI Readiness

Every model includes metadata fields for:
- Budget Recommendations — AI-suggested budget allocations
- Forecast Generation — ML-based revenue and expense projections
- Variance Explanation — Automated root cause analysis
- Revenue Prediction — Pipeline-based revenue forecasting
- Expense Optimization — Cost reduction opportunity identification
- Headcount Optimization — Staffing level recommendations
- Scenario Generation — Automated what-if scenario creation
- Executive Narrative — Natural language planning summaries
- Budget Risk Detection — Early warning for budget overruns
- Cash Forecast Optimization — AI-enhanced cash flow predictions

## Integration Points

| Module | Integration |
|--------|-------------|
| Accounting | Chart of accounts, actuals, financial statements |
| Treasury | Cash position, liquidity, funding forecasts |
| Banking | Transaction data for forecast validation |
| Investments | Investment returns and P&L forecasting |
| Risk | Risk-adjusted planning, stress scenarios |
| CRM | Customer data for revenue forecasting |
| Platform Core | Navigation, infrastructure, auth |
