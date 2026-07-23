# Revenue Planning

## Overview

Revenue planning manages driver-based revenue projections across 7 revenue drivers, supporting recurring and one-time revenue streams with volume, pricing, and growth rate modeling.

## Revenue Drivers

| Driver | Description |
|--------|-------------|
| pricing | Price-based revenue changes |
| volume | Volume-based revenue changes |
| customers | Customer count-based projections |
| market-expansion | New market revenue |
| recurring | Subscription/recurring revenue |
| one-time | Non-recurring revenue |
| pipeline | Sales pipeline-driven forecasts |

## Revenue Plan Structure

```typescript
interface RevenuePlan {
  id: string;
  name: string;
  companyId: string;
  fiscalYear: number;
  driver: RevenueDriver;
  items: RevenuePlanItem[];
  totalAmount: number;
  currency: string;
  status: "draft" | "active" | "locked" | "archived";
  createdAt: Date;
  updatedAt: Date;
}
```

Each revenue plan item includes:
- Period
- Value (revenue amount)
- Volume (quantity/units)
- Price (unit price)
- Growth rate (period-over-period)

## RevenuePlanningService Methods

| Method | Description |
|--------|-------------|
| `addPlan(plan)` | Add a new revenue plan |
| `getPlan(id)` | Get plan by ID |
| `getAllPlans()` | Get all revenue plans |
| `getByDriver(driver)` | Filter by revenue driver |
| `getByCompany(companyId)` | Filter by company |
| `getByYear(year)` | Filter by fiscal year |
| `addItem(item)` | Add item to existing plan |
| `getItems(planId)` | Get items for a plan |
| `count()` | Total plan count |

## Usage

```typescript
import { fpaService } from "@/server/fpa";

// Get all revenue plans
const plans = fpaService.revenue.getAllPlans();

// Get recurring revenue plans
const recurring = fpaService.revenue.getByDriver("recurring");

// Calculate total planned revenue
const totalRevenue = plans.reduce((s, p) => s + p.totalAmount, 0);
```
