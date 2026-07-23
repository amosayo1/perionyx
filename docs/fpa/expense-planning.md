# Expense Planning

## Overview

Expense planning manages category-based expense projections across 9 expense categories, supporting headcount-based cost modeling and department-level tracking.

## Expense Categories

| Category | Description |
|----------|-------------|
| payroll | Employee salaries and wages |
| marketing | Marketing and advertising expenses |
| sales | Sales team and commission expenses |
| it | Technology and infrastructure expenses |
| facilities | Office and facility expenses |
| professional-services | Consulting and legal fees |
| travel | Travel and entertainment expenses |
| procurement | Materials and supplies |
| treasury-costs | Banking and treasury operation costs |

## Expense Plan Structure

```typescript
interface ExpensePlan {
  id: string;
  name: string;
  companyId: string;
  fiscalYear: number;
  category: ExpenseCategory;
  items: ExpensePlanItem[];
  totalAmount: number;
  currency: string;
  status: "draft" | "active" | "locked" | "archived";
  createdAt: Date;
  updatedAt: Date;
}
```

## ExpensePlanningService Methods

| Method | Description |
|--------|-------------|
| `addPlan(plan)` | Add a new expense plan |
| `getPlan(id)` | Get plan by ID |
| `getAllPlans()` | Get all expense plans |
| `getByCategory(category)` | Filter by expense category |
| `getByCompany(companyId)` | Filter by company |
| `getByYear(year)` | Filter by fiscal year |
| `addItem(item)` | Add item to existing plan |
| `getItems(planId)` | Get items for a plan |
| `count()` | Total plan count |

## Usage

```typescript
import { fpaService } from "@/server/fpa";

// Get all expense plans
const expensePlans = fpaService.expense.getAllPlans();

// Get payroll plans
const payroll = fpaService.expense.getByCategory("payroll");

// Calculate total planned expense
const totalExpense = expensePlans.reduce((s, p) => s + p.totalAmount, 0);
```
