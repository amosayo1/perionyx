# Enterprise FP&A — Architecture Overview

## Domain Scope

The FP&A module spans 17 planning and analysis domains, each implemented as a standalone service with typed interfaces, in-memory state, and zero external runtime dependencies:

| Domain | Service | Store |
|---|---|---|
| Budgeting | `BudgetService` | `budgetStore: Map<string, Budget>` |
| Forecasting | `ForecastService` | `forecastStore: Map<string, Forecast>` |
| Rolling Forecast | `RollingForecastService` | `rollingForecastStore: Map<string, RollingForecast>` |
| Scenario Planning | `ScenarioService` | `scenarioStore: Map<string, Scenario>` |
| Driver-Based Planning | `DriverService` | `driverStore: Map<string, DriverDefinition>` |
| Revenue Planning | `RevenueService` | `revenueStore: Map<string, RevenuePlan>` |
| Expense Planning | `ExpenseService` | `expenseStore: Map<string, ExpensePlan>` |
| Capital Planning | `CapitalService` | `capitalStore: Map<string, CapitalPlan>` |
| Workforce Planning | `WorkforceService` | `workforceStore: Map<string, WorkforcePlan>` |
| Cash Planning | `CashPlanningService` | `cashPlanningStore: Map<string, CashPlan>` |
| Variance Analysis | `VarianceService` | `varianceStore: Map<string, VarianceReport>` |
| What-If Analysis | `WhatIfService` | `whatIfStore: Map<string, WhatIfScenario>` |
| Strategic Planning | `StrategicService` | `strategicStore: Map<string, StrategicPlan>` |
| Allocation | `AllocationService` | `allocationStore: Map<string, AllocationRule>` |
| Cost Centers | `CostCenterService` | `costCenterStore: Map<string, CostCenter>` |
| Profit Centers | `ProfitCenterService` | `profitCenterStore: Map<string, ProfitCenter>` |
| KPI / Scorecard | `KpiService` | `kpiStore: Map<string, KpiDefinition>` |

## Facade Pattern

`FpaService` is the single public entry point, matching the pattern established by the consolidation and fixed-assets modules:

```
FpaService
├── BudgetService
├── ForecastService
├── RollingForecastService
├── ScenarioService
├── DriverService
├── RevenueService
├── ExpenseService
├── CapitalService
├── WorkforceService
├── CashPlanningService
├── VarianceService
├── WhatIfService
├── StrategicService
├── AllocationService
├── CostCenterService
├── ProfitCenterService
├── KpiService
├── AnalyticsEngine          (composed)
├── AlertEngine              (composed)
├── RecommendationEngine     (composed)
└── InsightEngine            (composed)
```

The facade delegates to individual services for CRUD, then orchestrates cross-domain operations through composed engines:
- **AnalyticsEngine** — aggregate metrics across budget/forecast/actuals
- **AlertEngine** — threshold-based monitoring for all plan types
- **RecommendationEngine** — optimization suggestions based on variance patterns
- **InsightEngine** — executive summary generation with narrative

## Service Hierarchy

Each domain service follows a uniform contract:

```
interface IDomainService<T> {
  create(data: CreateDTO): Result<T>
  getById(id: string): Result<T>
  list(filters?: FilterDTO): Result<T[]>
  update(id: string, data: UpdateDTO): Result<T>
  delete(id: string): Result<void>
}
```

Domain-specific methods are added per service interface. For example, `VarianceService` adds `compute(planId, actuals)` and `getRootCauses(varianceId)`.

## In-Memory Stores

All stores are typed `Map<string, T>` backed by deterministic seed data. Persistence is handled by the Phase 7E Prisma repository layer and is not duplicated in the FP&A module. The in-memory pattern enables:

- Zero-bootstrapping for development and demo
- Predictable test fixtures without database setup
- Clear separation between domain logic and persistence
- Easy migration path when Prisma adapters are implemented

## Cross-Domain Integration Points

| Integration | Consumer |
|---|---|
| Budget → Actuals | VarianceService, AnalyticsEngine |
| Forecast → Budget | VarianceService, WhatIfService |
| Drivers → Revenue/Expense | DriverService |
| Scenario → All Plans | ScenarioService |
| Allocation → Cost/Profit Centers | AllocationService |
| KPIs → All Domains | KpiService |
| Alerts → All Domains | AlertEngine |
| Recommendations → Variance | RecommendationEngine |

## UI Architecture

20 client components organized in `src/components/fpa/` map to the 17 domain services plus three composite views (dashboard, analytics dashboard, executive overview). All components consume typed props and use the shared enterprise component library for form, table, and chart primitives.

17 page routes under `src/app/(shell)/planning/*` provide full CRUD + analytics views for each domain, with a central planning dashboard at `/planning`.
