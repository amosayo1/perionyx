# Cost Centers

## Overview

Cost centers provide hierarchical department-level cost tracking with up to 4 levels of depth, supporting budget ownership, expense allocation, and departmental performance monitoring.

## Hierarchy Levels

| Level | Description | Example |
|-------|-------------|---------|
| 0 | Corporate root | Company Corporate |
| 1 | Department | Engineering, Sales, Marketing |
| 2 | Sub-unit | Engineering teams, Sales regions |
| 3 | Team | Individual teams |
| 4 | Squad | Smallest cost tracking unit |

## Cost Center Structure

```typescript
interface CostCenter {
  id: string;
  code: string;
  name: string;
  description: string;
  companyId: string;
  parentId?: string;
  level: number;
  path: string;
  managerId?: string;
  department: string;
  budgetAmount: number;
  actualAmount: number;
  status: "active" | "inactive" | "frozen";
  createdAt: Date;
  updatedAt: Date;
}
```

## Status

| Status | Description |
|--------|-------------|
| active | Currently operational |
| inactive | Discontinued or merged |
| frozen | Budget locked, no new allocations |

## Cost Center Path

The `path` field provides materialized path for efficient tree traversal:
- Root: `cc_root_co_id`
- Level 1: `root_id.l1_id`
- Level 2: `root_id.l1_id.l2_id`
- Level 3: `root_id.l1_id.l2_id.l3_id`
- Level 4: `root_id.l1_id.l2_id.l3_id.l4_id`

## CostCenterService Methods

| Method | Description |
|--------|-------------|
| `addCostCenter(cc)` | Add a new cost center |
| `getCostCenter(id)` | Get cost center by ID |
| `getAllCostCenters()` | Get all cost centers |
| `getByCompany(companyId)` | Filter by company |
| `getByDepartment(department)` | Filter by department name |
| `getByStatus(status)` | Filter by status |
| `getChildren(parentId)` | Get direct children |
| `getTree()` | Get root-level cost centers |
| `search(query)` | Search by name, code, description |
| `count()` | Total cost center count |

## Usage

```typescript
import { fpaService } from "@/server/fpa";

// Get all cost centers
const costCenters = fpaService.costCenters.getAllCostCenters();

// Get root level
const roots = fpaService.costCenters.getTree();

// Get children of a cost center
const children = fpaService.costCenters.getChildren("cc_root_co_id");

// Search cost centers
const results = fpaService.costCenters.search("Engineering");
```
