# FP&A Analytics

## Overview

The FP&A Analytics module provides trend analysis, budget utilization tracking, forecast accuracy measurement, and alert/recommendation generation for financial planning performance monitoring.

## Trend Analysis

Trends track metric changes over 12-month periods:

```typescript
interface PlanningTrend {
  metric: string;
  period: string;
  value: number;
  previousValue: number;
  change: number;
  changePercent: number;
  direction: "up" | "down" | "stable";
}
```

Tracked metrics include:
- revenue, expense, ebitda, net-income
- cash-flow, working-capital
- gross-margin, operating-margin
- headcount, budget-utilization

## Budget Utilization

Budget utilization measures actual spend against budget:

```
Budget Utilization = (Total Actuals / Total Budget) × 100
```

- **<70%** — Under-budget (potential underspend)
- **70-100%** — On track
- **>100%** — Over budget (requires attention)

## Forecast Accuracy

Forecast accuracy measures the closeness of forecasts to actuals:

```
Forecast Accuracy = 100 - |(Actuals - Forecast) / Forecast| × 100
```

- **≥80%** — Good accuracy
- **60-80%** — Acceptable
- **<60%** — Needs improvement

## Alerts

Alerts provide actionable notifications across 3 severity levels:

| Severity | Description |
|----------|-------------|
| critical | Immediate attention required |
| warning | Monitor and prepare action |
| info | Informational update |

Alert types: variance, budget, forecast, scenario, revenue, expense, workforce, capital

## Recommendations

Recommendations provide AI-ready actionable suggestions:

| Field | Description |
|-------|-------------|
| type | Domain: budget, forecast, scenario, revenue, expense, workforce, capital, risk |
| title | Action-oriented title |
| description | Context and rationale |
| impact | Expected benefit |
| confidence | Confidence score (0-100) |
| implemented | Tracking flag |

## FPAAnalyticsService Methods

| Method | Description |
|--------|-------------|
| `addTrend(trend)` | Add a planning trend |
| `getTrends(metric)` | Get trends by metric name |
| `getAllTrends()` | Get all trends |
| `addRecommendation(rec)` | Add a recommendation |
| `getRecommendation(id)` | Get recommendation by ID |
| `getAllRecommendations()` | Get all recommendations |
| `getRecommendationsByType(type)` | Filter by type |
| `addAlert(alert)` | Add an alert |
| `getAlert(id)` | Get alert by ID |
| `getAllAlerts()` | Get all alerts |
| `getBySeverity(severity)` | Filter by severity |
| `getActiveAlerts()` | Get undismissed alerts |
| `addExecutiveSummary(summary)` | Store executive summary |
| `getExecutiveSummary(period)` | Get summary by period |
| `addRevision(revision)` | Add forecast revision |
| `getRevisions(forecastId)` | Get revisions for forecast |

## Usage

```typescript
import { fpaService } from "@/server/fpa";

// Get trends for a specific metric
const revenueTrends = fpaService.analytics.getTrends("revenue");

// Get active alerts
const activeAlerts = fpaService.analytics.getActiveAlerts();

// Get critical alerts
const criticalAlerts = fpaService.analytics.getBySeverity("critical");

// Get pending recommendations
const pending = fpaService.analytics
  .getAllRecommendations()
  .filter((r) => !r.implemented);
```
