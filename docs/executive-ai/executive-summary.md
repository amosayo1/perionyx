# Executive Summary

## Overview

The `AnalyticsService.generateSummary()` method produces a natural-language executive summary by aggregating data from all 6 domain services. The summary includes:

- Total active insights
- Critical anomaly count
- Pending recommendation count
- Active forecast count
- Cross-domain correlation count
- Overall health score & status

## Health Score Algorithm

```
healthScore = 70
  - criticalAnomalies * 15
  - unacknowledgedAnomalies * 5
  - pendingRecommendations * 3
  - dismissedInsights * 2
  + activeModels * 5
  + avgModelAccuracy * 0.2
  (clamped to 0-100)
```

### Health Thresholds

| Score | Status | Meaning |
|---|---|---|
| 75-100 | Good | Normal operations |
| 50-74 | Warning | Some metrics need attention |
| 0-49 | Critical | Immediate action required |

## Summary Generation

The summary is generated on-demand via `analyticsService.generateSummary(...)` and cached as an `ExecutiveSummary` record. It includes:

- Top 5 key insights
- Top 5 pending recommendations
- Top 5 critical/high anomalies
- Top 5 forecasts
- Aggregate health score
- Generated natural-language summary text

## UI Display

The `ExecutiveSummaryComponent` displays:
- Period and generation timestamp
- Health score gauge ring
- Summary text
- 5-card grid (insights, recommendations, anomalies, forecasts, health)
