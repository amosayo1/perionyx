# Executive Scorecards

## Overview

Executive scorecards provide KPI-based performance measurement across 7 categories with scoring methodology and status tracking.

## Scorecard Types

| Type | Scope |
|------|-------|
| corporate | Company-wide performance |
| regional | Regional performance |
| entity | Legal entity performance |
| department | Department performance |
| business-unit | Business unit performance |

## KPI Framework

The scorecard system tracks 23 KPIs across 7 categories:

| Category | KPIs |
|----------|------|
| Revenue | Revenue Growth Rate, Net Revenue, Recurring Revenue %, Revenue per Customer |
| Profitability | Gross Margin, Operating Margin, EBITDA Margin, Net Profit Margin, ROE |
| Liquidity | Current Ratio, Quick Ratio, Working Capital |
| Efficiency | DSO, DPO, Asset Turnover, Inventory Turnover |
| Growth | Revenue Growth YoY, Customer Growth Rate, Market Share |
| Budget | Budget Variance %, Budget Utilization |
| Forecast | Forecast Accuracy, Forecast Bias |

## Scoring Methodology

Each KPI is scored based on performance against target:

| Status | Score | Condition |
|--------|-------|-----------|
| good | 100 points | Value >= 90% of target |
| warning | 50 points | Value >= 70% of target |
| critical | 0 points | Value < 70% of target |

Total score = sum of all KPI scores
Maximum score = number of KPIs × 100
Overall percentage = (total / maximum) × 100

## Scorecard Status

| Status | Description |
|--------|-------------|
| draft | In-progress, not yet finalized |
| published | Finalized and distributed |
| archived | Superseded by newer scorecard |

## FPAScorecardService Methods

| Method | Description |
|--------|-------------|
| `addScorecard(scorecard)` | Add a new scorecard |
| `getScorecard(id)` | Get scorecard by ID |
| `getAllScorecards()` | Get all scorecards |
| `getByType(type)` | Filter by scorecard type |
| `getByCompany(companyId)` | Filter by company |
| `getByPeriod(period)` | Filter by period |
| `addKPI(kpi)` | Add a new KPI |
| `getKPI(id)` | Get KPI by ID |
| `getAllKPIs()` | Get all KPIs |
| `count()` | Total scorecard + KPI count |

## Usage

```typescript
import { fpaService } from "@/server/fpa";

// Get all scorecards
const scorecards = fpaService.scorecards.getAllScorecards();

// Get published scorecards
const published = scorecards.filter((s) => s.status === "published");

// Get all KPIs
const allKpis = fpaService.scorecards.getAllKPIs();

// Calculate average score
const avgScore = scorecards.reduce((s, sc) => s + sc.percentage, 0) / scorecards.length;
```
