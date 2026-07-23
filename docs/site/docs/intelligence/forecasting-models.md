---
id: forecasting-models
title: Forecasting Models
sidebar_label: Forecasting
---

# Forecasting Models

## Overview

The Trend Engine (`trend.engine.ts`) computes historical data points from stored `FinancialScore` records, determines trend direction using linear regression, and generates 3-period forecasts using ordinary least squares.

## Supported Periods

The Trend Engine supports the following periods:
- `daily`
- `weekly`
- `monthly`
- `quarterly`
- `yearly`

## Methodology

1. **Historical data retrieval** — Pulls `FinancialScore` records per score type from the database
2. **Trend direction** — Determined using linear regression on historical data points
3. **Forecast generation** — 3-period forecast using ordinary least squares (OLS)

## Role in the Intelligence Platform

The Trend Engine is orchestrated by `IntelligencePlatformService.runFullAssessment(ctx)`, which runs all six engines in parallel, stores FinancialScore records, then calls the Trend Engine:

```mermaid
sequenceDiagram
    participant Service as IntelligencePlatformService
    participant E1 as FinancialIntegrityEngine
    participant E2 as CloseReadinessEngine
    participant E3 as TreasuryIntelligenceEngine
    participant E4 as WorkingCapitalEngine
    participant E5 as OperationalIntelligenceEngine
    participant E6 as ComplianceIntelligenceEngine
    participant KPI as KPIFramework
    participant Rec as RecommendationEngine
    participant Trend as TrendEngine
    participant Notif as IntelligenceNotificationService

    Service->>E1: calculate(ctx)
    Service->>E2: calculate(ctx)
    Service->>E3: calculate(ctx)
    Service->>E4: calculate(ctx)
    Service->>E5: calculate(ctx)
    Service->>E6: calculate(ctx)
    
    Note over E1,E6: Parallel Promise.all
    
    E1-->>Service: EngineResult
    E2-->>Service: EngineResult
    E3-->>Service: EngineResult
    E4-->>Service: EngineResult
    E5-->>Service: EngineResult
    E6-->>Service: EngineResult
    
    Service->>Service: Store FinancialScore records in DB
    Service->>KPI: computeAndStore(ctx)
    KPI-->>Service: KPIValueData[]
    Service->>Rec: generate(ctx)
    Rec-->>Service: IntelligenceRecommendationData[]
    Service->>Trend: compute(ctx, "monthly")
    Trend-->>Service: IntelligenceTrendData[]
    Service->>Notif: evaluateAndNotify(ctx)
    Notif-->>Service: alerts
    Service-->>Client: { scores, kpis, recommendations, trends, alerts }
```

## Data Model

All intelligence data is stored in Prisma models scoped to `companyId`:
- `FinancialScore` — score snapshots per type
- `KPIValue` — time-series KPI records
- `IntelligenceRecommendation` — actionable recommendations
- `IntelligenceTrend` — computed trend data with forecasts
- `InsightEvent` — events (score changes, threshold breaches)
- `HealthAlert` — unresolved alerts
- `ExecutiveScorecard` — generated scorecard snapshots
- `ExplainSource` — provenance links
