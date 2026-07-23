# Scenario Planning & What-If Analysis

## Overview

The scenario planning module enables finance teams to model alternative futures by creating variant copies of plans with adjustable parameters. What-if analysis extends this with ad-hoc, real-time sensitivity testing on individual assumptions.

## Scenario Planning

### Data Model

```
Scenario
├── id: string (ULID)
├── name: string                    # e.g. "High Growth", "Recession"
├── description: string
├── type: ScenarioType
│     Baseline | Optimistic | Pessimistic | Custom
├── sourcePlanId: string            # Budget, forecast, or plan reference
├── sourcePlanType: Budget | Forecast | CapitalPlan | RevenuePlan
├── adjustments: ScenarioAdjustment[]
├── impactSummary: ImpactSummary
├── status: Draft | Computed | Approved | Archived
├── version: number
├── createdBy: string
├── createdAt: Date
└── updatedAt: Date

ScenarioAdjustment
├── accountCode: string
├── adjustmentType: PercentChange | AbsoluteChange | DriverOverride
├── value: number
├── period: number                  # Month or quarter
├── notes: string
└── isActive: boolean
```

### Scenario Types

| Type | Description | Typical Use |
|---|---|---|
| Baseline | Clone of current plan with no changes | Reference case |
| Optimistic | Revenue upside + cost discipline | Growth strategy evaluation |
| Pessimistic | Revenue decline + cost pressure | Stress testing, contingency |
| Custom | User-defined parameter set | Mergers, expansion, regulatory |

### Execution

1. User selects a source plan (budget, forecast, revenue plan, etc.)
2. Scenario is initialized as a deep clone of the source plan data
3. User applies adjustments — percentage changes, absolute overrides, or driver substitutions
4. `scenarioService.compute(id)` re-evaluates all line items with adjustments applied
5. Impact summary is generated: delta vs baseline by account, department, and total

### Comparison View

The UI renders a side-by-side comparison:
- **Baseline** column (source plan values)
- **Scenario** column (adjusted values)
- **Delta** column (absolute and percent change)
- **Visual sparklines** for period-over-period impact

## What-If Analysis

### Data Model

```
WhatIfScenario
├── id: string (ULID)
├── name: string
├── variables: WhatIfVariable[]
├── results: WhatIfResult[]
├── createdBy: string
├── createdAt: Date
└── expiresAt: Date                  # TTL for temporary scenarios

WhatIfVariable
├── targetField: string             # e.g. "revenue.growthRate"
├── baseValue: number
├── minValue: number
├── maxValue: number
├── stepSize: number
└── unit: Percent | Currency | Units

WhatIfResult
├── variable: string
├── value: number
├── impactAmount: number
├── impactPercent: number
└── affectedAccounts: string[]
```

### Sensitivity Analysis

The what-if engine performs multi-variable sensitivity sweeps:

- **Single variable**: Vary one parameter across its range (min → max at step intervals)
- **Multi-variable**: Matrix of 2-3 variables, showing combined impact surface
- **Goal seek**: Determine required input value to achieve a target output

### Seed Data

- **High Growth scenario** — Revenue +15%, expense +5%, capital deferral
- **Recession scenario** — Revenue -20%, cost reduction program, hiring freeze
- **Expansion scenario** — New market entry with upfront investment + phased revenue
- **What-if**: Price elasticity model (+/-5% pricing, +/-10% volume impact)
- **What-if**: Exchange rate sensitivity (EUR/USD ±10% on revenue/expense)
