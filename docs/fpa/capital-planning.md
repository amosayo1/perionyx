# Capital Planning

## Overview

Capital planning manages capital expenditure (CAPEX) projections across 6 capital categories, supporting asset purchases, depreciation scheduling, and project-based capital planning.

## Capital Categories

| Category | Description |
|----------|-------------|
| asset-purchases | Tangible asset acquisitions |
| depreciation | Asset depreciation tracking |
| projects | Capital project expenditures |
| construction | Construction and build-out costs |
| infrastructure | Infrastructure investments |
| technology | Technology and software capital |

## Capital Plan Structure

```typescript
interface CapitalPlan {
  id: string;
  name: string;
  companyId: string;
  fiscalYear: number;
  category: CapitalCategory;
  items: CapitalPlanItem[];
  totalAmount: number;
  currency: string;
  status: "draft" | "active" | "locked" | "archived";
  createdAt: Date;
  updatedAt: Date;
}
```

Each capital plan item includes:
- Asset name
- Amount (purchase/construction cost)
- Depreciation amount (annual depreciation)
- Useful life (years)
- Department ID

## CapitalPlanningService Methods

| Method | Description |
|--------|-------------|
| `addPlan(plan)` | Add a new capital plan |
| `getPlan(id)` | Get plan by ID |
| `getAllPlans()` | Get all capital plans |
| `getByCategory(category)` | Filter by capital category |
| `getByCompany(companyId)` | Filter by company |
| `getByYear(year)` | Filter by fiscal year |
| `addItem(item)` | Add item to existing plan |
| `getItems(planId)` | Get items for a plan |
| `count()` | Total plan count |

## Usage

```typescript
import { fpaService } from "@/server/fpa";

// Get all capital plans
const plans = fpaService.capital.getAllPlans();

// Get technology capital plans
const techPlans = fpaService.capital.getByCategory("technology");

// Calculate total CAPEX
const totalCapex = plans.reduce((s, p) => s + p.totalAmount, 0);

// Calculate total depreciation
const totalDepreciation = plans
  .flatMap((p) => p.items)
  .reduce((s, i) => s + (i.depreciationAmount ?? 0), 0);
```
