# Driver-Based Planning Methodology

## Overview

Driver-based planning links operational and financial drivers to plan line items, enabling dynamic projections that automatically update when driver assumptions change. This is the core methodology powering revenue, expense, capital, workforce, and cash planning.

## Driver Framework

### Data Model

```
DriverDefinition
├── id: string (ULID)
├── name: string                    # e.g. "Headcount", "Revenue per Rep"
├── type: DriverType
│     Operational | Financial | Macroeconomic | Statistical
├── category: DriverCategory
│     Volume | Price | Efficiency | Headcount | Rate | Growth
├── unit: string                    # e.g. "FTE", "USD", "%", "Units"
├── source: Manual | System | Derived
├── value: number
├── projectionMethod: Linear | Compound | Seasonal | Custom
├── historicalData: number[]        # 24-month lookback
├── projections: DriverProjection[]
├── confidence: number              # 0–1
├── linkedAccounts: string[]        # GL accounts impacted
├── owner: string
├── status: Active | Archived
├── createdBy: string
├── createdAt: Date
└── updatedAt: Date

DriverProjection
├── period: Date
├── value: number
├── isOverride: boolean
├── overrideReason?: string
└── confidence: number
```

### Driver Categories

| Category | Examples | Used By |
|---|---|---|
| Volume | Units sold, transactions, customers | Revenue Planning |
| Price | ASP, rate per hour, subscription fee | Revenue Planning |
| Headcount | FTE, contractor count, attrition % | Workforce Planning |
| Efficiency | Rev/FTE, units/hour, utilization % | Expense Planning |
| Rate | Interest rate, FX rate, tax rate | Cash Planning |
| Growth | YoY growth %, market expansion | Strategic Planning |

## Driver Propagation

When a driver value changes, all linked plans recalculate automatically:

```
DriverValueChange
  → RevenueService.onDriverChange(driverId)
    → Recalculate revenue line items with new driver
  → ExpenseService.onDriverChange(driverId)
    → Recalculate variable expense line items
  → WorkforceService.onDriverChange(driverId)
    → Recalculate headcount cost projections
  → AnalyticsEngine.recomputeMetrics(affectedPlans)
```

### Projection Methods

| Method | Formula | When to Use |
|---|---|---|
| Linear | `y = mx + b` | Stable, predictable drivers |
| Compound | `y = y₀(1+r)ⁿ` | Growth-based drivers |
| Seasonal | `y = trend × seasonalityIndex` | Cyclical revenue/expense |
| Custom | User-defined formula | Complex or business-specific |

## Driver Hierarchies

Drivers can be organized hierarchically:

```
Gross Revenue Driver
├── Volume Driver
│   ├── New Customers (Operational)
│   ├── Retention Rate (Operational)
│   └── Avg Transactions/Customer (Statistical)
└── Price Driver
    ├── Base ASP (Financial)
    ├── Discount Rate (Financial)
    └── Product Mix Index (Derived)
```

Parent driver values can be rollups or aggregations of child drivers. Overrides at the parent level cascade down proportionally to children.

## Seed Data

20 driver definitions are seeded across all categories:
- **Volume**: Monthly units sold, active subscriptions, transactions per account
- **Headcount**: Total FTE, contractor ratio, voluntary turnover rate
- **Price**: Average selling price, subscription ARPU, consulting day rate
- **Efficiency**: Revenue per FTE, gross margin target, utilization rate
- **Growth**: YoY revenue growth, market expansion factor
- **Rate**: Average interest rate, blended tax rate, EUR/USD forecast
- **Macro**: CPI index, industry growth rate, unemployment rate
