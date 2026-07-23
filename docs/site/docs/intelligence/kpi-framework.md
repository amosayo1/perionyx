---
id: kpi-framework
title: KPI Framework
sidebar_label: KPI Framework
---

# KPI Framework

## Overview

`kpi-framework.ts` computes 50+ KPIs across five categories after running all six intelligence engines. Each KPI has:

- Key (e.g., `cashBalance`, `currentRatio`)
- Label, unit, category
- Current/previous/target values
- Threshold-based status: `on_track`, `at_risk`, `critical`, `neutral`
- Trend direction: `up`, `down`, `flat`, `volatile`

## Role in the Intelligence Platform

The KPI Framework is orchestrated by `IntelligencePlatformService.runFullAssessment(ctx)`, which runs all six engines in parallel, stores FinancialScore records, then calls the KPI Framework to compute and store KPIs:

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

KPI data is stored in Prisma models scoped to `companyId`:
- `FinancialScore` — score snapshots per type
- `KPIValue` — time-series KPI records
- `IntelligenceRecommendation` — actionable recommendations
- `IntelligenceTrend` — computed trend data with forecasts
- `InsightEvent` — events (score changes, threshold breaches)
- `HealthAlert` — unresolved alerts
- `ExecutiveScorecard` — generated scorecard snapshots
- `ExplainSource` — provenance links
