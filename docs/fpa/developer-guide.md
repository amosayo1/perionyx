# FP&A Module — Developer Guide

## Module Structure

```
src/server/fpa/
├── fpa.service.ts                 # FpaService facade
├── fpa.types.ts                   # All domain types, enums, interfaces
├── budget.service.ts              # BudgetService
├── forecast.service.ts            # ForecastService
├── rolling-forecast.service.ts    # RollingForecastService
├── scenario.service.ts            # ScenarioService
├── driver.service.ts              # DriverService
├── revenue.service.ts             # RevenueService
├── expense.service.ts             # ExpenseService
├── capital.service.ts             # CapitalService
├── workforce.service.ts           # WorkforceService
├── cash-planning.service.ts       # CashPlanningService
├── variance.service.ts            # VarianceService
├── what-if.service.ts             # WhatIfService
├── strategic.service.ts           # StrategicService
├── allocation.service.ts          # AllocationService
├── cost-center.service.ts         # CostCenterService
├── profit-center.service.ts       # ProfitCenterService
├── kpi.service.ts                 # KpiService
├── analytics.engine.ts            # AnalyticsEngine
├── alert.engine.ts                # AlertEngine
├── recommendation.engine.ts       # RecommendationEngine
├── insight.engine.ts              # InsightEngine
├── seed/
│   ├── budgets.ts                 # Budget seed data
│   ├── forecasts.ts               # Forecast seed data
│   ├── scenarios.ts               # Scenario seed data
│   ├── drivers.ts                 # Driver seed data
│   ├── plans.ts                   # Revenue/expense/capital/workforce/cash seeds
│   ├── cost-profit-centers.ts     # Cost and profit center seeds
│   └── kpis.ts                    # KPI seed data
└── index.ts                       # Barrel exports

src/components/fpa/
├── planning-dashboard.tsx          # Cross-domain dashboard
├── budget-overview.tsx             # Budget list + status
├── budget-form.tsx                 # Budget create/edit form
├── forecast-overview.tsx           # Forecast list
├── forecast-form.tsx               # Forecast create/edit form
├── rolling-forecast-view.tsx       # Rolling forecast display
├── scenario-list.tsx               # Scenario list
├── scenario-form.tsx               # Scenario create/edit
├── scenario-comparison.tsx         # Side-by-side scenario view
├── what-if-editor.tsx              # What-if variable editor
├── driver-workspace.tsx            # Driver definition + projection
├── plan-overview.tsx               # Generic plan list (revenue/expense/etc.)
├── plan-form.tsx                   # Generic plan form
├── variance-report.tsx             # Variance report viewer
├── allocation-workspace.tsx        # Allocation rule editor
├── cost-center-manager.tsx         # Cost center hierarchy
├── profit-center-manager.tsx       # Profit center hierarchy
├── kpi-scorecard.tsx               # KPI dashboard
├── analytics-dashboard.tsx         # Aggregated metrics
├── executive-summary.tsx           # Executive insights view

src/app/(shell)/planning/
├── page.tsx                        # Dashboard
├── budget/
│   ├── page.tsx                    # Budget list
│   └── [id]/
│       └── page.tsx                # Budget detail/edit
├── forecast/
│   ├── page.tsx
│   └── [id]/
│       └── page.tsx
├── scenarios/
│   ├── page.tsx
│   └── [id]/
│       └── page.tsx
├── drivers/page.tsx
├── revenue/page.tsx
├── expense/page.tsx
├── capital/page.tsx
├── workforce/page.tsx
├── cash/page.tsx
├── variance/page.tsx
├── allocation/page.tsx
├── cost-centers/page.tsx
├── profit-centers/page.tsx
├── kpis/page.tsx
├── analytics/page.tsx
└── executive/page.tsx
```

## Getting Started

### Importing the Facade

```typescript
import { fpaService } from '@/server/fpa'

// Get executive summary
const summary = fpaService.getExecutiveSummary('fy2026')

// Get all KPIs across all domains
const allKpis = fpaService.getAllKPIs()

// Get aggregate metrics for dashboard
const metrics = fpaService.getAggregateMetrics()
```

### Working with a Domain Service

```typescript
import { budgetService } from '@/server/fpa/budget.service'

// List all budgets
const budgets = budgetService.list({ fiscalYear: 2026 })

// Create a new budget
const result = budgetService.create({
  fiscalYear: 2026,
  name: 'FY 2026 Operating Budget',
  type: 'BottomUp',
  currency: 'USD',
  lineItems: [...]
})

// Submit for approval
budgetService.submit(result.value.id)
```

### Creating a Forecast

```typescript
const forecast = forecastService.create({
  name: 'Q2 2026 Forecast',
  fiscalYear: 2026,
  period: 4,
  periodType: 'Monthly',
  baselineBudgetId: budgetId
})
```

## Extending the Module

### Adding a New Domain

1. Define types in `fpa.types.ts`
2. Create `{domain}.service.ts` implementing the domain interface
3. Add in-memory store (`Map<string, DomainType>`)
4. Wire into `FpaService` facade
5. Create UI component in `src/components/fpa/`
6. Add page route under `src/app/(shell)/planning/{domain}/`
7. Add seed data in `src/server/fpa/seed/`

### Engine Dependencies

| Engine | Requires |
|---|---|
| AnalyticsEngine | BudgetService, ForecastService, VarianceService, KpiService |
| AlertEngine | All domain services, threshold configuration |
| RecommendationEngine | VarianceService, DriverService |
| InsightEngine | AnalyticsEngine, AlertEngine, RecommendationEngine |

## Testing

```bash
pnpm test -- --coverage fpa     # Run FP&A tests with coverage
```

All services are pure TypeScript with no external dependencies, enabling fast unit tests with no database setup. Use the seed data factories for deterministic test fixtures.
