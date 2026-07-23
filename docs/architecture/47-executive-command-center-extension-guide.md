# Executive Command Center & Enterprise Pilot Readiness — Extension Guide

## Overview

This guide explains how to extend the Executive Command Center with new KPI sources, alert sources, briefing sections, health score dimensions, drill-down evidence types, demo industries, demo scenarios, and performance tuning.

## Prerequisites

- Access to the Perionyx codebase
- Understanding of the Executive Command Center types (`src/modules/executive-command-center/types.ts`)
- Understanding of the 10 specialist modules and their service interfaces
- `TenantContext` available for all operations
- RBAC permission `executive.config` for configuration changes

---

## Adding New KPI Sources

### 1. Identify the Specialist

Determine which specialist provides the new KPIs. Every KPI must originate from an existing specialist service — the Command Center never generates KPIs independently.

### 2. Add KPI Mapping in `kpi-aggregation.ts`

Add a mapping entry in the `KPI_SOURCE_MAP` constant:

```typescript
// In src/modules/executive-command-center/kpi-aggregation.ts

const KPI_SOURCE_MAP: Record<SpecialistId, KPIExtractor> = {
  treasury: {
    service: "TreasurySpecialistService",
    method: "getDashboard",
    kpis: [
      { name: "Cash Position", field: "cashPosition", unit: "currency", status: (v) => v < 10_000_000 ? "critical" : v < 25_000_000 ? "warning" : "healthy" },
      // ... existing KPIs
      { name: "New KPI Name", field: "newField", unit: "percentage", status: (v) => v > 90 ? "healthy" : "warning" },  // ← new KPI
    ],
  },
  // ... other specialists
};
```

### 3. Define Status Thresholds

Every KPI needs a status function that maps the raw value to a status:

```typescript
status: (value: number) => {
  if (value >= 90) return "healthy";
  if (value >= 70) return "warning";
  return "critical";
}
```

### 4. Add Trend Calculation (Optional)

If the specialist provides historical data, add a trend extractor:

```typescript
trend: {
  field: "newKpiTrend",
  direction: (current, previous) => current > previous ? "up" : current < previous ? "down" : "flat",
  value: (current, previous) => Math.abs((current - previous) / previous) * 100,
}
```

### 5. Register in KPI Category

Add the KPI to the appropriate category in the `KPI_CATEGORY_MAP`:

```typescript
const KPI_CATEGORY_MAP: Record<string, KPICategory> = {
  cashPosition: "cash",
  liquidityRatio: "liquidity",
  // ...
  newKpiName: "operational",  // ← new category assignment
};
```

### 6. Update API Response

No changes needed — the `getKPIs()` method automatically includes all registered KPIs.

### 7. Test

```typescript
// In tests/executive-command-center/kpi-aggregation.test.ts
it("should include new KPI from specialist", async () => {
  const kpis = await commandCenter.getKPIs(testCtx);
  const newKpi = kpis.find(k => k.name === "New KPI Name");
  expect(newKpi).toBeDefined();
  expect(newKpi.source).toBe("treasury");
  expect(newKpi.unit).toBe("percentage");
});
```

---

## Adding New Alert Sources

### 1. Add Alert Mapping in `alert-deduplication.ts`

```typescript
// In src/modules/executive-command-center/alert-deduplication.ts

const ALERT_SOURCE_MAP: Record<SpecialistId, AlertExtractor> = {
  treasury: {
    service: "TreasurySpecialistService",
    method: "getAlerts",
    mapper: (raw) => ({
      title: raw.message,
      description: raw.details,
      severity: mapSeverity(raw.level),
      category: "cash",
    }),
  },
  // ... add new specialist or extend existing
};
```

### 2. Add Deduplication Rule (Optional)

If the new source has domain-specific deduplication needs:

```typescript
const DEDUP_RULES: DedupRule[] = [
  // ... existing rules
  {
    name: "new-domain-dedup",
    match: (a, b) =>
      a.source === "new-specialist" &&
      b.source === "new-specialist" &&
      a.title === b.title &&
      Math.abs(a.createdAt.getTime() - b.createdAt.getTime()) < 3600_000,  // 1 hour
    keep: "most-recent",
  },
];
```

### 3. Update Severity Mapping

If the new source uses non-standard severity levels:

```typescript
function mapSeverity(raw: string): AggregatedAlert["severity"] {
  const MAP: Record<string, AggregatedAlert["severity"]> = {
    // ... existing mappings
    "critical-finding": "critical",
    "advisory": "low",
  };
  return MAP[raw] ?? "info";
}
```

### 4. Test

```typescript
it("should deduplicate alerts from new source", async () => {
  const alerts = await commandCenter.getAlerts(testCtx);
  const duplicates = alerts.filter(a => a.duplicateOf);
  expect(duplicates.length).toBe(0);  // all deduped
});
```

---

## Adding New Briefing Sections

### 1. Add Section Definition in `briefing-composition.ts`

```typescript
// In src/modules/executive-command-center/briefing-composition.ts

const BRIEFING_SECTIONS: BriefingSectionDef[] = [
  // ... existing 9 sections
  {
    id: "new-domain-section",
    title: "New Domain Highlights",
    source: "new-specialist",
    order: 10,  // after existing sections
    extract: async (ctx) => {
      const specialist = getSpecialistService("new-specialist");
      const dashboard = await specialist.getDashboard(ctx);
      return {
        highlights: dashboard.highlights.map(h => h.summary),
        kpis: dashboard.kpis.map(k => mapToUnifiedKPI(k, "new-specialist")),
        alerts: dashboard.alerts.map(a => mapToAggregatedAlert(a, "new-specialist")),
        drillDownUrl: `/specialists/new-specialist`,
      };
    },
  },
];
```

### 2. Update Executive Summary

The executive summary auto-selects the top 3 critical items. If the new section should have priority in summary generation:

```typescript
const SUMMARY_PRIORITY: SpecialistId[] = [
  "treasury", "compliance", "audit",
  "new-specialist",  // ← added to priority list
  "controller", "tax",
];
```

### 3. Test

```typescript
it("should include new section in briefing", async () => {
  const briefing = await commandCenter.getDailyBriefing(testCtx);
  const newSection = briefing.sections.find(s => s.id === "new-domain-section");
  expect(newSection).toBeDefined();
  expect(newSection.source).toBe("new-specialist");
});
```

---

## Adding New Health Score Dimensions

### 1. Add Domain to `health-score.ts`

```typescript
// In src/modules/executive-command-center/health-score.ts

const HEALTH_DOMAINS: HealthDomainDef[] = [
  // ... existing 8 domains
  {
    domain: "new-domain",
    source: "new-specialist",
    weight: 0.05,  // must sum to 1.0 with existing weights
    computeScore: async (ctx) => {
      const specialist = getSpecialistService("new-specialist");
      const metrics = await specialist.getHealthMetrics(ctx);
      return {
        score: metrics.healthScore,  // 0–100
        status: metrics.healthScore >= 80 ? "healthy"
          : metrics.healthScore >= 50 ? "warning"
          : "critical",
        drillDownUrl: "/specialists/new-specialist/health",
      };
    },
    thresholds: {
      healthy: 80,
      warning: 50,
    },
  },
];
```

### 2. Adjust Existing Weights

When adding a new domain, reduce existing weights proportionally to maintain a sum of 1.0:

```typescript
// Before: 8 domains summing to 1.0
// After: 9 domains summing to 1.0

const WEIGHT_ADJUSTMENTS: Record<string, number> = {
  treasury: 0.19,       // was 0.20
  reconciliation: 0.14, // was 0.15
  controller: 0.14,     // was 0.15
  audit: 0.11,          // was 0.12
  compliance: 0.11,     // was 0.12
  tax: 0.10,            // unchanged
  fpa: 0.10,            // unchanged
  governance: 0.06,     // unchanged
  "new-domain": 0.05,   // new
};
```

### 3. Update Status Thresholds

Define per-domain thresholds that reflect the domain's risk tolerance:

```typescript
thresholds: {
  healthy: 80,   // domain score ≥ 80 = healthy
  warning: 50,   // domain score 50–79 = warning
  // < 50 = critical (implicit)
}
```

### 4. Handle Degradation

When the new specialist is unavailable, the health score normalizes remaining weights:

```typescript
// Automatic — handled by computeOverallScore()
function computeOverallScore(domainScores: DomainScore[]): number {
  const available = domainScores.filter(d => d.status !== "unavailable");
  const totalWeight = available.reduce((sum, d) => sum + d.weight, 0);
  return available.reduce((sum, d) => sum + (d.score * d.weight / totalWeight), 0);
}
```

### 5. Test

```typescript
it("should include new domain in health score", async () => {
  const health = await commandCenter.getHealthScore(testCtx);
  expect(health.domains.length).toBe(9);
  expect(health.domains.find(d => d.domain === "new-domain")).toBeDefined();
  expect(health.overall).toBeGreaterThan(0);
  expect(health.overall).toBeLessThanOrEqual(100);
});

it("should normalize weights when domain unavailable", async () => {
  mockSpecialistFailure("new-specialist");
  const health = await commandCenter.getHealthScore(testCtx);
  const newDomain = health.domains.find(d => d.domain === "new-domain");
  expect(newDomain.status).toBe("unavailable");
  // Overall should still be valid (normalized)
  expect(health.overall).toBeGreaterThan(0);
});
```

---

## Adding New Drill-Down Evidence Types

### 1. Add Evidence Collector in `drill-down-engine.ts`

```typescript
// In src/modules/executive-command-center/drill-down-engine.ts

const EVIDENCE_COLLECTORS: EvidenceCollector[] = [
  // ... existing collectors
  {
    source: "new-specialist",
    collect: async (ctx, kpiId) => {
      const specialist = getSpecialistService("new-specialist");
      const detail = await specialist.getDetail(ctx, kpiId);
      return {
        evidence: detail.evidenceItems.map(e => ({
          id: e.id,
          type: e.type,
          source: "new-specialist",
          title: e.title,
          description: e.description,
          collectedAt: e.createdAt,
          url: e.link,
        })),
        auditTrail: detail.auditEntries.map(a => ({
          timestamp: a.timestamp,
          actor: a.actorName,
          action: a.action,
          details: a.details,
          source: "new-specialist",
        })),
      };
    },
  },
];
```

### 2. Add Cross-Domain Links

Define how the new specialist's evidence relates to other specialists:

```typescript
const CROSS_DOMAIN_LINKS: CrossDomainLinkDef[] = [
  // ... existing links
  {
    from: "new-specialist",
    to: "controller",
    relationship: "correlates",
    detect: (evidence) => evidence.type === "gl-impact",
  },
  {
    from: "new-specialist",
    to: "compliance",
    relationship: "causes",
    detect: (evidence) => evidence.type === "policy-violation",
  },
];
```

### 3. Test

```typescript
it("should collect evidence from new specialist in drill-down", async () => {
  const result = await commandCenter.drillDown(testCtx, "kpi-from-new-specialist");
  expect(result.evidence.length).toBeGreaterThan(0);
  expect(result.evidence[0].source).toBe("new-specialist");
  expect(result.auditTrail.length).toBeGreaterThan(0);
});
```

---

## Adding New Demo Industries

### 1. Add Industry Type to Union

```typescript
// In src/modules/executive-command-center/types.ts

export type IndustryType =
  | "manufacturing" | "financial-services" | "healthure"
  | "technology" | "retail" | "energy"
  | "construction" | "professional-services"
  | "logistics";  // ← new industry
```

### 2. Add Industry Template

```typescript
// In src/modules/executive-command-center/industry-templates.ts

const INDUSTRY_TEMPLATES: Record<IndustryType, IndustryTemplate> = {
  // ... existing templates
  logistics: {
    name: "Logistics & Transportation",
    revenueRange: { min: 20_000_000, max: 300_000_000 },
    employeeRange: { min: 200, max: 3_000 },
    chartOfAccounts: { /* GL structure for logistics */ },
    treasuryConfig: {
      currency: "USD",
      bankAccounts: 8,
      cashPooling: true,
      fxExposure: "moderate",
    },
    complianceConfig: {
      frameworks: ["DOT", "FMCSA", "OSHA", "C-TPAT"],
      regulatoryDensity: "moderate",
    },
    taxConfig: {
      jurisdictions: ["US-federal", "US-multi-state"],
      filingTypes: ["corporate-income", "fuel-tax", "IFTA"],
    },
    fpmaConfig: {
      drivers: ["ton-miles", "fuel-cost-per-gallon", "utilization-rate", "revenue-per-shipment"],
      seasonality: true,
    },
    reconciliationConfig: {
      matchRules: ["bank-fuel-cards", "carrier-invoices", "freight-bills"],
      exceptionTypes: ["fuel-surcharge-mismatch", "route-deviation", "weight-discrepancy"],
    },
    boardGovernanceConfig: {
      committees: ["audit", "safety", "finance"],
      meetingCadence: "quarterly",
    },
  },
};
```

### 3. Add Seed Data Generator

```typescript
const SEED_DATA_GENERATORS: Record<IndustryType, SeedDataGenerator> = {
  // ... existing generators
  logistics: async (ctx) => {
    // Generate realistic seed data for all 10 specialists
    await seedTreasury(ctx, { /* logistics-specific treasury data */ });
    await seedController(ctx, { /* logistics-specific GL data */ });
    // ... etc
  },
};
```

### 4. Test

```typescript
it("should launch pilot for logistics industry", async () => {
  const result = await commandCenter.getPilotStatus();
  const industries = result.availableIndustries;
  expect(industries).toContain("logistics");
});
```

---

## Adding New Demo Scenarios

### 1. Add Scenario Definition

```typescript
// In src/modules/executive-command-center/demo-scenarios.ts

const DEMO_SCENARIOS: DemoScenarioDef[] = [
  // ... existing 11 scenarios
  {
    id: "logistics-operations",
    name: "Logistics Operations Review",
    description: "Review fleet utilization, fuel costs, carrier performance, and route optimization",
    industry: "logistics",
    duration: "4 min",
    steps: [
      {
        title: "Open Fleet Utilization Dashboard",
        specialist: "treasury",
        narration: "Review current fleet utilization rate across all routes",
        expectedKPI: "Fleet Utilization Rate",
      },
      {
        title: "Analyze Fuel Cost Variance",
        specialist: "fpa",
        narration: "Fuel costs are 12% above budget — drill into the variance drivers",
        expectedKPI: "Fuel Cost Variance",
      },
      {
        title: "Review Carrier Performance",
        specialist: "controller",
        narration: "Carrier invoices show 3 disputed charges totaling $47K",
        expectedAlert: "Carrier Invoice Dispute",
      },
      {
        title: "Check Compliance Status",
        specialist: "compliance",
        narration: "DOT compliance score is 94% — 2 driver certifications expiring",
        expectedKPI: "DOT Compliance Score",
      },
      {
        title: "Cross-Domain: Route Optimization Impact",
        specialist: "collaboration",
        narration: "See how route optimization connects to fuel savings and compliance",
        expectedLink: "fuel-cost → route-optimization",
      },
    ],
    setup: async (ctx) => {
      await seedScenarioData(ctx, "logistics-operations");
    },
  },
];
```

### 2. Register in Scenario Index

```typescript
const SCENARIO_INDEX: Record<string, DemoScenarioDef> = {};
for (const scenario of DEMO_SCENARIOS) {
  SCENARIO_INDEX[scenario.id] = scenario;
}
```

### 3. Test

```typescript
it("should list new scenario", async () => {
  const scenarios = await commandCenter.getPilotStatus();
  const newScenario = scenarios.scenarios.find(s => s.id === "logistics-operations");
  expect(newScenario).toBeDefined();
  expect(newScenario.duration).toBe("4 min");
});

it("should execute new scenario steps", async () => {
  const result = await commandCenter.startDemoScenario(testCtx, "logistics-operations");
  expect(result.steps.length).toBe(5);
  expect(result.completedSteps).toBe(0);
});
```

---

## Customizing Health Score Weights

### Runtime Configuration

Health score weights can be updated at runtime via the `/api/executive/config/weights` endpoint:

```typescript
// PUT /api/executive/config/weights
{
  "treasury": 0.22,
  "controller": 0.14,
  "fpa": 0.10,
  "audit": 0.12,
  "compliance": 0.12,
  "tax": 0.10,
  "reconciliation": 0.13,
  "governance": 0.07
}
// Must sum to 1.0
```

### Validation

```typescript
function validateWeights(weights: Record<string, number>): ValidationResult {
  const sum = Object.values(weights).reduce((a, b) => a + b, 0);
  if (Math.abs(sum - 1.0) > 0.001) {
    return { valid: false, error: `Weights must sum to 1.0, got ${sum}` };
  }
  for (const [domain, weight] of Object.entries(weights)) {
    if (weight < 0 || weight > 0.5) {
      return { valid: false, error: `Weight for ${domain} must be between 0 and 0.5` };
    }
  }
  return { valid: true };
}
```

### Persistence

Weight configurations are stored in memory (not database). To persist across restarts, add to environment variables:

```bash
EXECUTIVE_HEALTH_WEIGHTS='{"treasury":0.22,"controller":0.14,"fpa":0.10,"audit":0.12,"compliance":0.12,"tax":0.10,"reconciliation":0.13,"governance":0.07}'
```

---

## Performance Tuning

### Cache TTL Configuration

Adjust cache TTLs based on data freshness requirements:

```typescript
// In src/modules/executive-command-center/config.ts

const CACHE_CONFIG = {
  kpis: {
    ttl: 30,        // seconds — balance freshness vs specialist load
    staleWhileRevalidate: true,
  },
  alerts: {
    ttl: 15,        // seconds — alerts need higher freshness
    staleWhileRevalidate: true,
  },
  healthScore: {
    ttl: 60,        // seconds — expensive to compute, changes slowly
    staleWhileRevalidate: true,
  },
  briefing: {
    ttl: 300,       // seconds — generated once per morning
    staleWhileRevalidate: false,
  },
  riskSummary: {
    ttl: 60,        // seconds
    staleWhileRevalidate: true,
  },
};
```

### Parallel Query Optimization

The dashboard uses `Promise.allSettled()` for all 10 specialist calls. To optimize:

```typescript
// Batch specialist calls if some are faster than others
const FAST_SPECIALISTS: SpecialistId[] = ["treasury", "controller", "audit"];
const SLOW_SPECIALISTS: SpecialistId[] = ["fpa", "compliance", "tax", "reconciliation"];

// Launch fast specialists first, then slow
const [fastResults, slowResults] = await Promise.all([
  Promise.allSettled(FAST_SPECIALISTS.map(s => callSpecialist(s, ctx))),
  Promise.allSettled(SLOW_SPECIALISTS.map(s => callSpecialist(s, ctx))),
]);
```

### Selective Specialist Loading

For endpoints that don't need all 10 specialists:

```typescript
// Dashboard needs all 10
const dashboardSpecialists: SpecialistId[] = ALL_SPECIALISTS;

// KPIs for treasury-focused view needs only 3
const treasuryKpiSpecialists: SpecialistId[] = ["treasury", "reconciliation", "controller"];

// Briefing can skip collaboration (least executive-relevant)
const briefingSpecialists: SpecialistId[] = ALL_SPECIALISTS.filter(s => s !== "collaboration");
```

### Response Compression

Enable gzip compression for large dashboard responses:

```typescript
// In API route
export const config = {
  api: {
    responseCompression: true,  // Next.js built-in
  },
};
```

### Monitoring Cache Performance

```typescript
// Track cache hit rates
const cacheMetrics = {
  hits: 0,
  misses: 0,
  get hitRate() { return this.hits / (this.hits + this.misses); },
};

// Log when cache misses exceed threshold
if (cacheMetrics.hitRate < 0.7) {
  console.warn(`Cache hit rate below threshold: ${cacheMetrics.hitRate}`);
}
```

---

## Testing Approach

### Unit Tests

Test each component in isolation:

```typescript
// kpi-aggregation.test.ts
describe("KPI Aggregation", () => {
  it("should collect KPIs from all specialists", async () => {});
  it("should handle specialist failure gracefully", async () => {});
  it("should map specialist KPIs to unified schema", async () => {});
  it("should sort KPIs by category and status", async () => {});
  it("should attach sparkline data when available", async () => {});
});

// alert-deduplication.test.ts
describe("Alert Deduplication", () => {
  it("should deduplicate same-title alerts from same source", async () => {});
  it("should keep related alerts from different sources", async () => {});
  it("should detect cascade alerts", async () => {});
  it("should sort by severity then time", async () => {});
});

// health-score.test.ts
describe("Health Score", () => {
  it("should compute weighted average from 8 domains", async () => {});
  it("should normalize weights when domain unavailable", async () => {});
  it("should flag confidence when domains missing", async () => {});
  it("should enforce weight sum = 1.0", async () => {});
});
```

### Integration Tests

Test cross-component interactions:

```typescript
// executive-command-center.integration.test.ts
describe("Executive Command Center Integration", () => {
  it("should compose full dashboard with all specialists", async () => {});
  it("should degrade gracefully when 2 specialists fail", async () => {});
  it("should drill down from KPI to cross-domain evidence", async () => {});
  it("should generate briefing from specialist outputs", async () => {});
  it("should aggregate risks across all domains", async () => {});
});
```

### Performance Tests

Validate load time targets:

```typescript
// executive-command-center.performance.test.ts
describe("Performance", () => {
  it("should load dashboard in < 2s", async () => {
    const start = performance.now();
    await commandCenter.getUnifiedDashboard(testCtx);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(2000);
  });

  it("should complete drill-down in < 1s", async () => {
    const start = performance.now();
    await commandCenter.drillDown(testCtx, "cash-position");
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(1000);
  });

  it("should handle 10 parallel specialist calls", async () => {
    const results = await Promise.allSettled(
      Array.from({ length: 10 }, (_, i) => callSpecialist(`specialist-${i}`, testCtx))
    );
    expect(results.every(r => r.status === "fulfilled" || r.status === "rejected")).toBe(true);
  });
});
```

### Pilot Tests

Validate demo environment:

```typescript
// enterprise-pilot.test.ts
describe("Enterprise Pilot", () => {
  it("should launch pilot for each industry", async () => {
    for (const industry of ALL_INDUSTRIES) {
      const pilot = await commandCenter.launchPilot(industry);
      expect(pilot.tenantId).toContain(industry);
    }
  });

  it("should isolate pilot from production data", async () => {
    const pilot = await commandCenter.launchPilot("manufacturing");
    const prodDashboard = await commandCenter.getUnifiedDashboard(productionCtx);
    const pilotDashboard = await commandCenter.getUnifiedDashboard({ companyId: pilot.tenantId });
    expect(prodDashboard).not.toEqual(pilotDashboard);
  });

  it("should execute all demo scenarios without error", async () => {
    for (const scenario of DEMO_SCENARIOS) {
      const result = await commandCenter.startDemoScenario(pilotCtx, scenario.id);
      expect(result.completedSteps).toBe(result.steps.length);
    }
  });
});
```

### Running Tests

```bash
# Unit tests only
pnpm test -- --grep "Executive Command Center"

# Integration tests
pnpm test -- --grep "Executive Command Center Integration"

# Performance tests
pnpm test -- --grep "Executive Command Center Performance"

# All executive command center tests
pnpm test -- --grep "executive-command-center"
```
