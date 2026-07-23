# Workforce Planning

## Overview

Workforce planning manages headcount and compensation projections across 5 workforce categories, supporting department-level staffing, hiring, and total compensation modeling.

## Workforce Categories

| Category | Description |
|----------|-------------|
| headcount | Staffing level planning |
| hiring | New hire planning |
| salary | Base salary planning |
| bonus | Bonus and incentive planning |
| benefits | Benefits and perks planning |

## Workforce Plan Structure

```typescript
interface WorkforcePlan {
  id: string;
  name: string;
  companyId: string;
  fiscalYear: number;
  category: WorkforceCategory;
  items: WorkforcePlanItem[];
  totalAmount: number;
  currency: string;
  status: "draft" | "active" | "locked" | "archived";
  createdAt: Date;
  updatedAt: Date;
}
```

Each workforce plan item includes:
- Headcount (number of employees)
- Salary amount (total base compensation)
- Bonus amount (total variable compensation)
- Benefits amount (total benefits cost)
- Total compensation (sum of all components)
- Hiring count (planned new hires)
- Department ID

## WorkforceService Methods

| Method | Description |
|--------|-------------|
| `addPlan(plan)` | Add a new workforce plan |
| `getPlan(id)` | Get plan by ID |
| `getAllPlans()` | Get all workforce plans |
| `getByCategory(category)` | Filter by workforce category |
| `getByCompany(companyId)` | Filter by company |
| `getByYear(year)` | Filter by fiscal year |
| `addItem(item)` | Add item to existing plan |
| `getItems(planId)` | Get items for a plan |
| `count()` | Total plan count |

## Usage

```typescript
import { fpaService } from "@/server/fpa";

// Get all workforce plans
const plans = fpaService.workforce.getAllPlans();

// Calculate total headcount
const totalHeadcount = plans
  .flatMap((p) => p.items)
  .reduce((s, i) => s + i.headcount, 0);

// Calculate total compensation
const totalComp = plans
  .flatMap((p) => p.items)
  .reduce((s, i) => s + i.totalCompensation, 0);
```
