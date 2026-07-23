# Profit Centers

## Overview

Profit centers track revenue, cost, and margin at the business unit, product line, and regional level, enabling granular profitability analysis and performance reporting.

## Profit Center Structure

```typescript
interface ProfitCenter {
  id: string;
  code: string;
  name: string;
  description: string;
  companyId: string;
  businessUnit?: string;
  region?: string;
  product?: string;
  revenue: number;
  cost: number;
  margin: number;
  marginPercent: number;
  budgetRevenue: number;
  budgetCost: number;
  status: "active" | "inactive" | "frozen";
  createdAt: Date;
  updatedAt: Date;
}
```

## Dimensions

| Dimension | Description |
|-----------|-------------|
| businessUnit | Organizational business unit |
| region | Geographic region |
| product | Product or service line |

## Key Metrics

| Metric | Formula |
|--------|---------|
| Revenue | Total revenue generated |
| Cost | Total cost incurred |
| Margin | Revenue - Cost |
| Margin % | (Margin / Revenue) × 100 |

## ProfitCenterService Methods

| Method | Description |
|--------|-------------|
| `addProfitCenter(pc)` | Add a new profit center |
| `getProfitCenter(id)` | Get profit center by ID |
| `getAllProfitCenters()` | Get all profit centers |
| `getByCompany(companyId)` | Filter by company |
| `getByBusinessUnit(businessUnit)` | Filter by business unit |
| `getByRegion(region)` | Filter by region |
| `count()` | Total profit center count |

## Usage

```typescript
import { fpaService } from "@/server/fpa";

// Get all profit centers
const profitCenters = fpaService.profitCenters.getAllProfitCenters();

// Calculate aggregate metrics
const totalRevenue = profitCenters.reduce((s, pc) => s + pc.revenue, 0);
const totalCost = profitCenters.reduce((s, pc) => s + pc.cost, 0);
const totalMargin = profitCenters.reduce((s, pc) => s + pc.margin, 0);
const avgMarginPct = profitCenters.reduce((s, pc) => s + pc.marginPercent, 0) / profitCenters.length;

// Get profitable vs unprofitable
const profitable = profitCenters.filter((pc) => pc.margin > 0);
const unprofitable = profitCenters.filter((pc) => pc.margin <= 0);
```
