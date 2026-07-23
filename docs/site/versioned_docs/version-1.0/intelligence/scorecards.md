---
id: scorecards
title: Scorecards
sidebar_label: Scorecards
---

# Scorecards

## Overview

`scorecard.service.ts` generates role-specific scorecard snapshots for the following roles: `ceo`, `cfo`, `controller`, `treasurer`, `finance-manager`, `board`, `auditor`.

Each scorecard includes:
- All six domain scores
- Role-filtered KPIs
- Role-filtered recommendations
- Generated summary text

## Role in the Intelligence Platform

The Scorecard Service is orchestrated by `IntelligencePlatformService.runFullAssessment(ctx)`, which runs all six engines in parallel, stores FinancialScore records, then generates scorecards:

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

## Six Engines

| Engine | File | Key Metrics |
|---|---|---|
| Financial Integrity | `engines/financial-integrity.engine.ts` | GL balances, journals, reconciliations, duplicate refs, approvals, sync health |
| Close Readiness | `engines/close-readiness.engine.ts` | Closing checklists, unreconciled items, journal entry backlogs, period end status |
| Treasury Intelligence | `engines/treasury-intelligence.engine.ts` | Cash position, liquidity ratios, FX exposure, counterparty risk, working capital |
| Working Capital | `engines/working-capital.engine.ts` | AR/AP aging, days payable/receivable, cash conversion cycle |
| Operational Intelligence | `engines/operational-intelligence.engine.ts` | Connector health, sync latency, queue depth, error rates |
| Compliance Intelligence | `engines/compliance-intelligence.engine.ts` | Policy violations, audit log gaps, framework compliance |

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
