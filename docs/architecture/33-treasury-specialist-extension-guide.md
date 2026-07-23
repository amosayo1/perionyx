# Enterprise Treasury Specialist — Extension Guide

## Overview

This guide explains how to extend the Treasury Specialist with new cash classification types, liquidity forecast horizons, FX instruments, bank relationship types, debt instrument types, investment types, risk types, recommendation categories, health scoring dimensions, treasury intelligence generation, and data source integrations.

## Adding New Cash Classification Types

### 1. Add to Type Union

In `src/modules/treasury-specialist/types.ts`, add the new type to the `CashClassification` union:

```typescript
export type CashClassification =
  | "operating"
  | "restricted"
  | "in_transit"
  | "sweep"
  | "reserve"
  | "new_classification";
```

### 2. Add to Query Filters

In `src/app/api/treasury/cash/route.ts`, the `classification` query parameter is cast to `CashClassification`. The new type is automatically supported since it's part of the union.

### 3. Add to Cash Position Aggregation (Optional)

If the new classification requires special aggregation logic in `CashPositionService.getGlobalCashPosition()`, add a filter branch:

```typescript
// In src/modules/treasury-specialist/cash-position.ts
static async getGlobalCashPosition(ctx: TenantContext) {
  // Existing queries...

  // If new classification needs distinct handling:
  const newClassificationCash = cashPositions
    .filter(p => p.classification === "new_classification")
    .reduce((sum, p) => sum.add(p.totalBalance), new Prisma.Decimal(0));
```

### 4. Add UI Badge

Update the cash position display component in `src/components/treasury-specialist/` to handle the new classification with an appropriate color badge.

## Adding New Liquidity Forecast Horizons

### 1. Add to Type Union

In `src/modules/treasury-specialist/types.ts`:

```typescript
export type LiquidityHorizon =
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "annual"
  | "new_horizon";
```

### 2. Add to Forecast API

In `src/app/api/treasury/forecasts/route.ts`, the `horizon` query parameter is cast to `LiquidityHorizon`. The new horizon is automatically supported.

### 3. Add Scenario Multipliers (Optional)

If the new horizon needs different scenario multipliers than the defaults (+15% / -15%), update `LiquidityService.createForecast()`:

```typescript
const forecastLiquidity =
  scenario === "best"
    ? avgClosingBalance.mul(1.15)  // Adjust for new horizon if needed
    : scenario === "worst"
      ? avgClosingBalance.mul(0.85)
      : avgClosingBalance;
```

### 4. Add to Dashboard Filter

In `src/app/api/treasury/dashboard/route.ts` and the liquidity center facade method, add the new horizon to any default filter options if it should appear in standard views.

## Adding New FX Instruments

### 1. Add to Type Union

In `src/modules/treasury-specialist/types.ts`:

```typescript
export type HedgeInstrument =
  | "forward"
  | "option"
  | "swap"
  | "cross_currency_swap"
  | "natural"
  | "new_instrument";
```

### 2. Add to FX Recommendation Logic (Optional)

If the new instrument should influence FX recommendation generation, extend `FXExposureService.getFXRecommendations()`:

```typescript
// Recommendations are read from FXRecommendation model
// Add instrument-specific filtering or ranking logic if needed
static async getFXRecommendations(ctx: TenantContext, limit = 20) {
  // Existing logic reads from prisma.fXRecommendation
  // Add instrument-specific logic as needed
}
```

### 3. Add to Hedging Opportunity Display

In `FXExposureService.getHedgingOpportunities()`, the new instrument is automatically included since it queries by `hedgeStatus` rather than instrument type. If the new instrument needs special display treatment, update the UI component.

## Adding New Bank Relationship Types

### 1. Add to Type Union

In `src/modules/treasury-specialist/types.ts`:

```typescript
export type BankRelationshipType =
  | "primary"
  | "secondary"
  | "cash_management"
  | "payroll"
  | "trade_finance"
  | "new_type";
```

### 2. Add to API Filters

In `src/app/api/treasury/banking/route.ts`, the `relationshipType` query parameter is cast to `BankRelationshipType`. The new type is automatically supported.

### 3. Add to Health Scoring (Optional)

If the new relationship type has unique health evaluation criteria, extend `TreasurySpecialistService.getBankOperations()`:

```typescript
static async getBankOperations(ctx: TenantContext) {
  const relationships = await prisma.bankRelationship.findMany({
    where: { companyId: ctx.companyId },
    // ... existing logic
  });

  // Add type-specific health evaluation if needed
  // The existing averageHealthScore calculation handles any type generically
}
```

### 4. Add Relationship Category Badge

Update the bank operations UI component to display the new relationship type with an appropriate category badge.

## Adding New Debt Instrument Types

### 1. Add to Type Union

In `src/modules/treasury-specialist/types.ts`:

```typescript
export type DebtInstrumentType =
  | "term_loan"
  | "revolver"
  | "credit_facility"
  | "bond"
  | "commercial_paper"
  | "supplier_credit"
  | "new_instrument_type";
```

### 2. Add to Debt API Filters

In `src/app/api/treasury/debt/route.ts`, the `instrumentType` query parameter is cast to `DebtInstrumentType`. The new type is automatically supported.

### 3. Add Refinancing Logic (Optional)

If the new instrument type has unique refinancing characteristics, update `DebtService.getRefinancingOpportunities()`:

```typescript
static async getRefinancingOpportunities(ctx: TenantContext) {
  // Existing logic identifies above-average rate instruments maturing within 6 months
  // Add instrument-specific refinancing rules if the new type has unique characteristics
}
```

### 4. Add Covenant Types (Optional)

If the new debt instrument type requires new covenant categories, add to the `DebtCovenant` model's status evaluation in `DebtService.getDebtCovenants()`.

## Adding New Investment Types

### 1. Add to Type Union

In `src/modules/treasury-specialist/types.ts`:

```typescript
export type InvestmentType =
  | "treasury_bill"
  | "certificate_of_deposit"
  | "commercial_paper"
  | "money_market"
  | "bond"
  | "repo"
  | "new_investment_type";
```

### 2. Add to Liquidity Classification Mapping (Optional)

If the new investment type has a default liquidity classification, update `InvestmentService.getPortfolioSummary()`:

```typescript
static async getPortfolioSummary(ctx: TenantContext) {
  // Existing logic groups by instrumentType and liquidityClassification
  // Add default classification mapping for new type if needed
}
```

### 3. Add to Investment Recommendations

In `InvestmentService.getInvestmentRecommendations()`, the new type is automatically included since recommendations are tied to `InvestmentHolding` records. Add type-specific recommendation logic if the new instrument has unique rebalancing rules.

### 4. Add to Portfolio Allocation Display

The `InvestmentService.getPortfolioAllocation()` method already handles any instrument type generically. Add a UI badge or color for the new type in the investment portfolio component.

## Adding New Risk Types

### 1. Add to Type Union

In `src/modules/treasury-specialist/types.ts`:

```typescript
export type TreasuryRiskType =
  | "liquidity"
  | "fx"
  | "counterparty"
  | "interest_rate"
  | "settlement"
  | "operational"
  | "concentration"
  | "new_risk_type";
```

### 2. Add Detection Logic

If the new risk type should be auto-detected, create a detection method or extend `TreasuryRiskService.getTreasuryRisks()`:

```typescript
// In a new detection service or within treasury-risk.ts
static async detectNewRiskType(ctx: TenantContext): Promise<TreasuryRiskInput[]> {
  const risks: TreasuryRiskInput[] = [];

  // Evaluate conditions for new risk type
  if (/* condition */) {
    risks.push({
      riskType: "new_risk_type",
      riskLevel: "medium",
      riskScore: new Prisma.Decimal(0.6),
      description: "Description of detected risk",
      // ... other fields
    });
  }

  return risks;
}
```

### 3. Add to Risk Heatmap

The `TreasuryRiskService.getRiskHeatmap()` method already handles any risk type dynamically. The new type will automatically appear in the heatmap matrix.

### 4. Add to Risk Score Calculation

The `TreasuryRiskService.getRiskScore()` method weights by risk level, not risk type. The new type is automatically included in the weighted average if it has `open` or `mitigating` status.

### 5. Add Mitigation Actions

If the new risk type requires specific mitigation action templates, add them to the risk record creation logic:

```typescript
mitigationActions: [
  { action: "Specific action for new risk type", priority: "high", owner: "Treasury Manager" },
  // ... additional actions
]
```

## Adding New Recommendation Categories

### 1. Add to Type Union

In `src/modules/treasury-specialist/types.ts`:

```typescript
export type RecommendationCategory =
  | "cash"
  | "liquidity"
  | "fx"
  | "debt"
  | "investment"
  | "risk"
  | "policy"
  | "operations"
  | "new_category";
```

### 2. Implement Category Logic

Create a method that evaluates conditions and produces recommendations:

```typescript
static async generateNewCategoryRecommendations(
  ctx: TenantContext,
): Promise<CreateRecommendationInput[]> {
  const recs: CreateRecommendationInput[] = [];

  // Evaluate conditions
  if (/* condition */) {
    recs.push({
      category: "new_category",
      title: "Clear, actionable title",
      description: "What should be done",
      businessReason: "Why this matters",
      confidence: new Prisma.Decimal(0.85),
      riskLevel: "medium",
      supportingEvidence: ["Reference to specific records"],
      affectedModules: ["module-name"],
      requiredApprovals: [],
    });
  }

  return recs;
}
```

### 3. Add to Briefing Generation

In `TreasurySpecialistService.getBriefing()`, add highlights and action items for the new category:

```typescript
// New category highlights
if (/* condition for new category */) {
  highlights.push(`[NEW_CATEGORY] Description of the insight`);
  actionItems.push("Actionable next step for the new category");
}
```

### 4. Add UI Badge

Update the recommendation display component to handle the new category with an appropriate color/icon badge.

### 5. Priority Scoring

The existing `priority` field on `TreasuryRecommendation` handles any category generically. The `low | medium | high | urgent` priority levels apply across all categories.

## Customizing Health Scoring

The treasury health score is a composite of multiple domain-specific health scores. Each domain has its own formula:

| Domain | Health Score Source |
|--------|-------------------|
| Cash | `CashPositionService.computeCashHealthScore()` — available ratio minus restriction/transit penalties |
| Liquidity | `LiquidityService.getLiquidityScore()` — 4-signal composite (working capital, runway, burn ratio, forecast) |
| FX | `FXExposureService.computeFXRiskScore()` — unhedged ratio + net position concentration |
| Debt | `DebtService.getDebtHealthScore()` — average instrument health minus covenant penalties |
| Investment | Average health score across `InvestmentHolding.healthScore` |
| Risk | `TreasuryRiskService.getRiskScore()` — weighted average across active risks |

### Adding a New Health Dimension

#### 1. Add Evaluation Method

Create a new service or extend an existing one:

```typescript
static async evaluateNewHealthDimension(ctx: TenantContext) {
  // Query relevant data
  const score = new Prisma.Decimal(/* calculated score */);
  return { score, details: { /* supporting metrics */ } };
}
```

#### 2. Include in Composite Score

Update `TreasuryHealthSnapshot` creation logic to include the new dimension. The composite score is calculated in `TreasurySpecialistService.getDashboard()`:

```typescript
static async getDashboard(ctx: TenantContext) {
  // ... existing queries
  const newDimension = await NewService.evaluateNewHealthDimension(ctx);

  // Adjust weights to sum to 1.0
  const healthScore = existingScore.mul(0.8).add(newDimension.score.mul(0.2));
```

#### 3. Add to Snapshot Model

If the new dimension's score should be persisted, add a field to the `TreasuryHealthSnapshot` Prisma model and create a migration:

```prisma
model TreasuryHealthSnapshot {
  // ... existing fields
  newDimensionScore Decimal? @db.Decimal(10, 4)
}
```

#### 4. Add to Dashboard

Update `TreasurySpecialistService.getDashboard()` to include the new dimension's data in the response.

### Adjusting Domain Weights

To change the influence of a specific domain on the overall health score, modify the multiplication factors in the composite score calculation. Weights must sum to 1.0.

## Customizing Treasury Intelligence Generation

### Customizing Briefing Content

The briefing generation in `TreasurySpecialistService.getBriefing()` produces highlights and action items from 5 data sources. To add a new source:

#### 1. Add Data Query

```typescript
const newData = await NewService.getNewData(ctx);
```

#### 2. Add Highlight Logic

```typescript
if (/* condition from new data */) {
  highlights.push(`[NEW_SOURCE] Description of insight`);
  actionItems.push("Recommended action based on new data");
}
```

#### 3. Add to Briefing Model

Update the `TreasuryBriefing` create call to include new data in the briefing record:

```typescript
const briefing = await prisma.treasuryBriefing.create({
  data: {
    // ... existing fields
    newSourceSummary: newData as unknown as Prisma.InputJsonValue,
  },
});
```

### Customizing Alert Generation

Alerts are stored in `TreasurySpecialistAlert`. To add a new alert source:

1. Create alert records with appropriate `alertType`, `severity`, and `status`
2. The `getActiveAlerts()` helper automatically includes them in dashboard and briefing aggregation
3. Add UI display logic for the new `alertType` value

### Customizing Analytics

Analytics data in `TreasurySpecialistService.getAnalytics()` aggregates across domains. To add a new analytics dimension:

1. Add the data query to `getAnalytics()`
2. Include the new data in the response object
3. Update the analytics UI component to display the new dimension

## Adding New Data Source Integrations

### 1. Define Data Access Pattern

The Treasury Specialist reads from existing deterministic services and Prisma models. To add a new data source:

```typescript
// In the service that needs the data
import { prisma } from "@/server/db/prisma";

static async getNewSourceData(ctx: TenantContext) {
  return prisma.newModel.findMany({
    where: { companyId: ctx.companyId },
  });
}
```

### 2. Wire into Evaluation Pipeline

Connect the new data source to an existing evaluation method or create a new one:

```typescript
static async evaluateWithNewSource(ctx: TenantContext) {
  const newData = await this.getNewSourceData(ctx);
  // Use data in scoring, detection, or recommendation logic
}
```

### 3. Add to Facade

If the new data source should be accessible via a new dashboard section, add a method to `TreasurySpecialistService`:

```typescript
static async getNewSection(ctx: TenantContext) {
  const data = await NewService.getNewSourceData(ctx);
  return { data };
}
```

### 4. Add API Route

Create a new route in `src/app/api/treasury/`:

```typescript
import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(
      session?.user?.id,
      session?.user?.activeCompanyId,
      session?.user?.companyRole,
    );

    const data = await TreasurySpecialistService.getNewSection(ctx);
    return NextResponse.json(data, { headers: cacheHeaders(30) });
  } catch (err) {
    return handleRouteError(err, req);
  }
}
```

### 5. Add Prisma Index (If Querying New Model)

If the new integration requires querying a model not yet indexed for this use case, add the appropriate composite index in `prisma/schema.prisma`:

```prisma
model NewModel {
  // ... fields
  @@index([companyId, relevantField])
  @@map("new_models")
}
```

## Testing Approach

### Unit Tests

Each service class is a static method collection testable with mocked Prisma:

```typescript
import { describe, it, expect, vi } from "vitest";
import { CashPositionService } from "@/modules/treasury-specialist/cash-position";

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    treasuryCashPosition: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    treasuryRestrictedCash: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    treasuryCashMovement: {
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));

describe("CashPositionService", () => {
  it("returns zero cash position for empty tenant", async () => {
    const ctx = { companyId: "test-company" };
    const result = await CashPositionService.getGlobalCashPosition(ctx);
    expect(result.totalGlobalCash.toString()).toBe("0");
    expect(result.availableCash.toString()).toBe("0");
    expect(result.concentrationScore.toString()).toBe("0");
  });
});
```

### Integration Tests

Test the full evaluation pipeline:

```typescript
describe("LiquidityService forecast creation", () => {
  it("creates forecast with expected scenario", async () => {
    // Seed: TreasuryCashForecast records, liquidity positions
    // Call: LiquidityService.createForecast(ctx, "daily", "expected")
    // Assert: forecast created, scenario is "expected", confidence > 0
  });

  it("creates best-case forecast with 15% uplift", async () => {
    // Seed: TreasuryCashForecast with known closing balance
    // Call: LiquidityService.createForecast(ctx, "daily", "best")
    // Assert: forecastLiquidity = avgClosingBalance × 1.15
  });
});
```

### Health Score Tests

```typescript
describe("DebtService.getDebtHealthScore", () => {
  it("calculates score from instrument health minus covenant penalties", async () => {
    // Seed: debt instruments with healthScore 0.8, 2 covenant breaches, 1 warning
    // Expected: 0.8 - (2 × 0.15) - (1 × 0.05) = 0.45
    // Call: DebtService.getDebtHealthScore(ctx)
    // Assert: score equals 0.45
  });

  it("clamps score to [0, 1]", async () => {
    // Seed: instruments with low health + many covenant breaches
    // Assert: score >= 0
  });

  it("returns 0 for tenant with no debt", async () => {
    // Seed: empty
    // Call: getDebtHealthScore()
    // Assert: score === 0
  });
});
```

### FX Risk Score Tests

```typescript
describe("FXExposureService FX risk score", () => {
  it("calculates risk from unhedged and net position ratios", async () => {
    // Seed: exposures with 60% unhedged, 20% net position
    // Expected: (0.6 × 0.6) + (0.2 × 0.4) = 0.44
    // Call: getFXExposure(ctx)
    // Assert: riskScore equals 0.44
  });

  it("returns 0 for zero exposure", async () => {
    // Seed: no FX exposures
    // Assert: riskScore === 0
  });
});
```

### Risk Score Tests

```typescript
describe("TreasuryRiskService.getRiskScore", () => {
  it("weights risks by severity level", async () => {
    // Seed: 1 CRITICAL (score 0.9), 1 LOW (score 0.3)
    // Expected: (0.9×4 + 0.3×1) / (4+1) = 0.78
    // Call: getRiskScore(ctx)
    // Assert: weighted average is correct
  });

  it("only includes open and mitigating risks", async () => {
    // Seed: 1 open risk, 1 closed risk
    // Assert: score only reflects open risk
  });
});
```

### API Route Tests

```typescript
describe("GET /api/treasury/dashboard", () => {
  it("returns full dashboard with all domains", async () => {
    // Mock auth session
    // Seed: cash positions, liquidity, FX, debt, investments, risks, alerts
    // Call: GET /api/treasury/dashboard
    // Assert: response has cashPosition, liquidity, fxExposure, debtOverview, investmentOverview, risks, alerts
  });
});

describe("POST /api/treasury/briefings", () => {
  it("generates daily briefing with highlights", async () => {
    // Seed: cash positions, liquidity, FX, risks, alerts
    // Call: POST with { briefingType: "daily" }
    // Assert: response has briefingType "daily", highlights array, actionItems array
  });
});
```

### Cash Concentration Tests

```typescript
describe("CashPositionService concentration", () => {
  it("returns HHI of 1.0 for single-region cash", async () => {
    // Seed: all cash in north_america
    // Call: getCashConcentration(ctx)
    // Assert: concentrationScore === 1.0
  });

  it("returns lower HHI for diversified cash", async () => {
    // Seed: equal cash across 3 regions
    // Expected HHI: 3 × (1/3)² = 0.3333
    // Call: getCashConcentration(ctx)
    // Assert: concentrationScore ≈ 0.3333
  });
});
```

### Run Tests

```bash
pnpm test          # Full test suite
pnpm typecheck     # TypeScript strict mode — must pass
pnpm build         # Production build — must pass
```
