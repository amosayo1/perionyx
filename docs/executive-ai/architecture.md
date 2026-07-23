# Executive AI Intelligence — Architecture

## Overview

Phase 9F delivers a comprehensive AI intelligence layer for enterprise executives. It provides AI-powered insights, anomaly detection, recommendations, forecasting, cross-domain reasoning, and natural-language intelligence across all enterprise domains.

## Architecture

```
src/server/executive-ai/
  types/index.ts                        — Type aliases & interfaces
  intelligence/intelligence-service.ts  — IntelligenceService (insights CRUD)
  recommendations/recommendations-service.ts — RecommendationService
  anomaly-detection/anomaly-service.ts  — AnomalyService
  forecast/forecast-service.ts          — ForecastService
  reasoning/reasoning-service.ts        — ReasoningService (NLQ + cross-domain)
  model-metrics/model-service.ts        — ModelMetricsService
  analytics/analytics-service.ts        — AnalyticsService (KPIs, alerts, summaries)
  services/executive-ai-service.ts      — ExecutiveAIService facade
  ai-seed.ts                            — Deterministic seed data
  index.ts                              — Barrel export
```

### Services

| Service | Storage | Key Methods |
|---|---|---|
| IntelligenceService | `Map<string, ExecutiveInsight>` | add, getAll, getByCategory, getBySeverity, getByStatus, search, count |
| RecommendationService | `Map<string, AIRecommendation>` | add, getAll, getByCategory, getByStatus, getPending, search, count |
| AnomalyService | `Map<string, AnomalyDetection>` | add, getAll, getBySeverity, getByCategory, getUnacknowledged, count |
| ForecastService | `Map<string, AIForecast>` | add, getAll, getByDomain, getByHorizon, getLatest, getTrend, count |
| ReasoningService | `Map<string, NaturalLanguageQuery>` + `Map<string, CrossDomainInsight>` | addQuery, getAllQueries, addCrossDomainInsight, getByDomain, count |
| ModelMetricsService | `Map<string, AIModelMetrics>` | add, getAll, getByType, getActive, updateAccuracy, count |
| AnalyticsService | `Map<string, AIKPI>` + `Map<string, AIAlert>` + `Map<string, ExecutiveSummary>` | addKPI, addAlert, generateSummary, computeHealthScore, count |

### Facade: ExecutiveAIService

Composes all 7 services and provides:
- `getAggregateMetrics()` → `AIAggregateMetrics`
- Singleton: `executiveAIService`

### UI Components

```
src/components/executive-ai/
  ai-types.ts                — UI type re-exports + AIOverviewMetrics
  ai-header.tsx              — Executive metrics header (8 MetricCards)
  ai-filters.tsx             — Category/severity/status filter bar
  intelligence-dashboard.tsx — Grouped insights with search/filter
  insight-card.tsx           — Expandable insight card
  recommendation-board.tsx   — Recommendations with filter/implement/dismiss
  anomaly-dashboard.tsx      — Anomalies with severity filter + chart
  anomaly-chart.tsx          — Inline SVG expected vs actual bars
  forecast-dashboard.tsx     — Forecast selector + chart
  forecast-chart.tsx         — Inline SVG line chart with confidence bands
  cross-domain-insights.tsx  — Cross-domain correlation cards
  model-health-dashboard.tsx — Model metrics with accuracy/latency
  health-score-chart.tsx     — SVG gauge ring
  executive-summary.tsx      — Generated summary display
  executive-insights.tsx     — Recommendations panel
  alerts-panel.tsx           — Severity-sorted alert list
```

### Pages

```
src/app/(shell)/executive-ai/
  page.tsx              — Root dashboard (summary + intelligence + anomalies)
  overview/page.tsx     — Full overview with health score + KPIs + models
  intelligence/page.tsx — All insights
  recommendations/page.tsx — All recommendations
  anomalies/page.tsx    — Anomaly detection center
  forecast/page.tsx     — All forecasts
  analytics/page.tsx    — Model metrics + KPIs + alerts
```

### Seed Data

`ai-seed.ts` populates:
- 10 insights across financial, operational, risk, compliance, treasury, revenue, anomaly
- 8 recommendations with varying impact/effort/ROI
- 5 anomalies (cash drop, revenue spike, expense rise, compliance breach, FX loss)
- 4 forecasts (cash, revenue, expense, risk)
- 3 cross-domain insights
- 3 model metrics entries
- 5 KPIs
- 5 alerts
