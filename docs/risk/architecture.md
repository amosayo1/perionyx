# Risk Management Module Architecture

## Overview

The Enterprise Risk Management module (Phase 9D) provides a comprehensive risk management framework covering the full risk lifecycle: identification, assessment, response, monitoring, reporting, and governance.

## Architecture

The module follows the same pattern as the Tax (Phase 8C) and GL (Phase 7C) modules:

```
src/server/risk/
  types/index.ts                          — All type definitions
  domain/
    risk-register/risk-register-service.ts       — Risk register CRUD + queries
    risk-assessment/risk-assessment-service.ts   — Assessment scoring + queries
    risk-response/risk-response-service.ts        — Response strategy management
    risk-controls/risk-controls-service.ts        — Control inventory + effectiveness
    risk-incidents/risk-incidents-service.ts      — Incident/event tracking
    risk-indicators/risk-indicators-service.ts    — KRI management + thresholds
    risk-reporting/risk-reporting-service.ts      — Report generation
    risk-scenarios/risk-scenarios-service.ts      — Scenario analysis
    risk-heatmap/risk-heatmap-service.ts          — Heatmap generation
    risk-analytics/analytics-service.ts           — KPIs, alerts, recommendations
  services/risk-service.ts                — Facade composing all domain services
  index.ts                                — Barrel exports
  risk-seed.ts                            — Deterministic seed data
```

## Domain Services (10)

Each domain service is in-memory (`Map<string, T>`) following the `TaxRulesService` pattern:

| Service | Entity | Key Methods |
|---|---|---|
| RiskRegisterService | RiskRegister | CRUD, getByCategory, getByLevel, getByStatus, getByOwner, search, getOpenRisks, getCriticalRisks |
| RiskAssessmentService | RiskAssessment | CRUD, getByRegister, getLatestAssessment, computeInherentScore, computeResidualScore, getByDateRange |
| RiskResponseService | RiskResponse | CRUD, getByRegister, getByStrategy, getOverdue |
| RiskControlService | RiskControl | CRUD, getByRegister, getByEffectiveness, getIneffective, getByType |
| RiskIncidentService | RiskEvent | CRUD, getByRegister, getByStatus, getOpen |
| RiskIndicatorService | RiskIndicator | CRUD, getByCategory, getByStatus, getBreaches, getWarnings |
| RiskReportService | RiskReport | CRUD, getByPeriod, getByType |
| RiskScenarioService | RiskScenario | CRUD, getByCategory |
| RiskHeatmapService | RiskHeatmap | CRUD, generateHeatmap, buildHeatmap |
| RiskAnalyticsService | RiskKPIItem, RiskAlert, RiskRecommendation | KPI management, alert lifecycle, recommendation tracking |

## Facade

`RiskService` composes all 10 domain services plus provides `getAggregateMetrics()` returning `RiskAggregateMetrics`:

```typescript
const metrics = riskService.getAggregateMetrics();
// { totalRisks, openRisks, criticalRisks, highRisks, totalControls, ... }
```

## Seed Data

`seedRiskData(riskService)` generates deterministic data:
- 20 risk register entries across all 12 categories
- 20 assessments (1 per register)
- 20 response strategies
- 25 controls
- 10 incidents
- 15 KRIs
- 5 reports
- 5 scenarios
- 1 heatmap
- 5 KPI items
- 5 alerts
- 5 recommendations

## UI Components (15)

Located at `src/components/risk-v2/`:
- RiskHeader — Executive metric cards
- RiskFilters — Category/level/status search
- RiskDashboard — Overview with summary panels
- RiskRegisterTable — Sortable data table
- RiskAssessmentCard — Score breakdown cards
- RiskResponsePanel — Strategy list with status
- RiskControlsDashboard — Type/effectiveness distribution
- IncidentBoard — Event timeline
- KRIDashboard — Threshold bars
- KPIChart — Performance indicators
- HeatmapChart — Likelihood/impact matrix
- ScenarioDashboard — Scenario cards
- ExecutiveInsights — Recommendation list
- AlertsPanel — Severity-sorted alerts
