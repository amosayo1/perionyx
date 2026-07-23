# ADR-028: Financial Intelligence Platform

**Status**: Ratified
**Date**: July 2026
**Author**: Architecture Team

## Context

Enterprise financial platforms generate vast amounts of transactional, treasury, and risk data. Users need automated intelligence to detect anomalies, forecast cash positions, identify trends, assess compliance, generate recommendations, and explain financial context. All intelligence must be deterministic, auditable, and grounded in platform data — no black-box ML that cannot be explained to an auditor.

## Decision

Build a **financial intelligence platform** with 6 deterministic scoring engines, a KPI framework, and a scorecard service — all computing from Prisma database queries, not AI models.

### Engine Architecture

All six engines follow the same contract:

```typescript
interface IIntelligenceEngine {
  name: string;
  compute(context: EngineContext): Promise<EngineResult>;
  
  // EngineResult includes:
  // - scores: Record<string, number>
  // - evidence: Evidence[] (data sources used)
  // - confidence: "high" | "medium" | "low"
  // - metadata: Record<string, unknown>
}

// All engines use deterministic Prisma queries
class AnomalyDetectionEngine implements IIntelligenceEngine {
  async compute(context: EngineContext): Promise<EngineResult> {
    const transactions = await prisma.transaction.findMany({
      where: { companyId: context.companyId, createdAt: { gte: context.timeRange } },
    });
    // Compute anomaly scores using statistical thresholds
    return { scores, evidence, confidence: "high", metadata };
  }
}
```

### The 6 Engines

| Engine | File | Input | Output | Deterministic Method |
|--------|------|-------|--------|---------------------|
| **Anomaly Detection** | `anomaly-detection.engine.ts` | Transaction patterns, thresholds | Anomaly score per transaction | Statistical deviation from historical mean + configurable thresholds |
| **Cash Forecasting** | `cash-forecasting.engine.ts` | Historical cash flows, seasonality | Forecast projections (7/30/90 day) | Moving average + seasonal adjustment from ledger data |
| **Recommendation** | `recommendation.engine.ts` | All platform metrics, rules | Action recommendations | Rule-based evaluation against configured thresholds |
| **Trend Analysis** | `trend.engine.ts` | Historical metric snapshots | Trend direction + magnitude | Linear regression over time-series metric data |
| **Compliance Checks** | `compliance.engine.ts` | Policy rules, transaction data | Compliance pass/fail per rule | Rule engine evaluation against policy definitions |
| **NLP Commentary** | `explain-engine.ts` | Structured data, templates | Natural language explanations | Template-based generation with data interpolation |

### KPI Framework

The `kpi-framework.ts` module aggregates engine scores into business metrics:

```typescript
interface KPI {
  id: string;
  name: string;          // e.g., "Cash Position Coverage"
  value: number;
  unit: string;          // e.g., "days", "USD", "percentage"
  trend: "up" | "down" | "stable";
  threshold: { warning: number; critical: number };
  engine: string;        // Source engine
  lastUpdated: Date;
}
```

### Scorecard Service

The `scorecard.service.ts` combines KPIs into composite scores:

```typescript
interface Scorecard {
  overall: number;              // 0-100 composite score
  domains: {                    // Per-domain scores
    liquidity: number;
    risk: number;
    efficiency: number;
    compliance: number;
  };
  recommendations: Recommendation[];
  lastUpdated: Date;
}
```

### Recommendation Engine

```typescript
interface Recommendation {
  id: string;
  type: "warning" | "critical" | "info";
  title: string;
  description: string;
  evidence: Evidence[];
  confidence: "high" | "medium" | "low";
  action?: { label: string; href: string };
}
```

### Explain Engine

The `explain-engine.ts` generates human-readable explanations from structured data:

```
"Current cash position is $2.5M, up 12% from last month. 
This is above the $2.0M target threshold. 
Key driver: Accounts receivable collections increased 18% in the period."
```

## Alternatives Considered

1. **ML-first intelligence (neural networks)**: Rejected — cannot guarantee deterministic, auditable results; black-box models are unacceptable for financial audit
2. **Third-party intelligence platform**: Rejected — cannot meet data isolation and audit requirements; external data exposure risk
3. **Rules-only engine**: Rejected — insufficient for anomaly detection and trend analysis which require statistical methods
4. **LLM-generated intelligence**: Rejected — hallucinations unacceptable for financial scoring (see ADR-029 and ADR-010)

## Consequences

- **Positive**: All intelligence is deterministic and auditable — every score has a traceable computation path
- **Positive**: No dependency on external AI APIs for core financial intelligence
- **Positive**: Engine results are testable with deterministic inputs and expected outputs
- **Positive**: KPI framework provides consistent metrics across domains
- **Positive**: Evidence chain enables "drill to source" for every recommendation
- **Negative**: Statistical methods have limits — extreme edge cases may produce false positives/negatives
- **Negative**: No ML adaptation — patterns must be manually configured
- **Negative**: Template-based NLP commentary can feel mechanical

## Future Considerations

- ML-based anomaly detection as an optional enhancement (with clear labeling)
- Cash flow prediction using ML models (as AI commentary, not system of record)
- Automated threshold adjustment based on historical patterns
- Natural language query interface for intelligence results
