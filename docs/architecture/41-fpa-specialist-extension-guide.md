# Enterprise FP&A Specialist — Extension Guide

## Overview

This guide explains how to extend the FP&A Specialist with new budget types, forecast types, scenario types, business driver categories, variance analysis types, planning scoring dimensions, driver formulas, and external planning tool integrations.

## Prerequisites

- Access to the Perionyx codebase
- Understanding of the FP&A Specialist types (`src/modules/fpa-specialist/types.ts`)
- Prisma schema with the 17 FP&A models (in `prisma/schema.prisma`)
- `TenantContext` available for all operations
- RBAC permission `fpa.admin` for configuration changes

---

## Adding New Budget Types

### 1. Add to Type Union

In `src/modules/fpa-specialist/types.ts`, add the new type to the `BudgetType` union:

```typescript
export type BudgetType =
  | "operating"
  | "capital"
  | "project"
  | "department"
  | "zero_based"
  | "incremental"
  | "activity_based"
  | "consolidated";  // ← new type
```

### 2. Update the Prisma Schema

The `Budget.budgetType` field is a `String` — no schema migration needed. However, if you want database-level validation, add a comment documenting the new type:

```prisma
// In prisma/schema.prisma — Budget model
budgetType String @default("operating")
/// "operating" | "capital" | "project" | "department" | "zero_based" | "incremental" | "activity_based" | "consolidated"
```

### 3. Update Budget Creation

The `BudgetService.createBudget()` method stores `budgetType` directly — no changes needed. The new type will be persisted and retrieved automatically.

### 4. Update Budget Variance (Optional)

If the new budget type has special variance logic, extend `BudgetService.getBudgetVariance()`:

```typescript
static async getBudgetVariance(ctx: TenantContext, budgetId: string): Promise<BudgetVariance> {
  const budget = await prisma.budget.findFirst({ where: { id: budgetId, companyId: ctx.companyId } });
  const lines = await prisma.budgetLine.findMany({ where: { budgetId, companyId: ctx.companyId } });

  // Special handling for consolidated budgets — aggregate across sub-budgets
  if (budget?.budgetType === "consolidated") {
    // Add consolidation-specific variance logic here
  }

  // ... existing variance computation
}
```

### 5. Update Dashboard Filtering

The `FPASpecialistService.getDashboard()` counts budgets with `status: { in: ["active", "locked"] }`. No changes needed for new budget types — they appear in the count automatically.

### 6. Update Briefing Generation

The `getBriefing()` method references `dashboard.activeBudgets`. No changes needed — new budget types are included in the count.

---

## Adding New Forecast Types

### 1. Add to Type Union

In `src/modules/fpa-specialist/types.ts`, add to the `ForecastType` union:

```typescript
export type ForecastType =
  | "revenue"
  | "expense"
  | "cash_flow"
  | "balance_sheet"
  | "headcount"
  | "working_capital"
  | "capex";  // ← new type
```

### 2. Update Forecast Accuracy (Optional)

The `ForecastService.getForecastAccuracy()` method iterates over all `ForecastVersion` records for a forecast. If the new forecast type needs accuracy-specific logic:

```typescript
static async getForecastAccuracy(ctx: TenantContext, forecastId: string): Promise<ForecastAccuracy> {
  const forecast = await prisma.forecast.findFirst({ where: { id: forecastId, companyId: ctx.companyId } });
  const versions = await prisma.forecastVersion.findMany({
    where: { forecastId, forecast: { companyId: ctx.companyId } },
    orderBy: { createdAt: "asc" },
  });

  // Special accuracy thresholds for capex forecasts — wider tolerance
  const tolerance = forecast?.forecastType === "capex" ? 0.15 : 0.10;
  // ... existing accuracy computation with adjusted tolerance
}
```

### 3. Update Forecast Trends

The `ForecastService.getForecastTrend()` method groups by `forecastType` — no changes needed. The new type will appear in trend analysis automatically.

### 4. Update Dashboard

The `FPASpecialistService.getDashboard()` counts forecasts with `status: { in: ["active"] }`. No changes needed for new forecast types.

### 5. Update Briefing Highlights

The `getBriefing()` method lists forecasts by name and status. New forecast types appear automatically.

---

## Adding New Scenario Types

### 1. Add to Type Union

In `src/modules/fpa-specialist/types.ts`, add to the `ScenarioType` union:

```typescript
export type ScenarioType =
  | "base"
  | "optimistic"
  | "pessimistic"
  | "stress_test"
  | "what_if"
  | "monte_carlo"
  | "sensitivity"
  | "custom"
  | "regulatory";  // ← new type
```

### 2. Update Scenario Execution (Optional)

The `ScenarioModelingService.executeScenario()` method runs generically. If the new scenario type needs custom execution logic:

```typescript
static async executeScenario(ctx: TenantContext, scenarioId: string, input: ExecuteScenarioInput): Promise<ScenarioResult> {
  const scenario = await prisma.scenarioModel.findFirst({ where: { id: scenarioId, companyId: ctx.companyId } });
  if (!scenario) throw new Error("Scenario not found");

  // Custom execution for regulatory scenarios — apply regulatory impact factors
  if (scenario.scenarioType === "regulatory") {
    const regulatoryImpact = this.calculateRegulatoryImpact(scenario.assumptions);
    // ... produce results with regulatory-specific financial impacts
  }

  // ... existing generic execution
}
```

### 3. Update Scenario Comparison

The `ScenarioModelingService.compareScenarios()` method compares by `revenueImpact` and `riskScore`. No changes needed — new scenario types are compared automatically.

### 4. Update Impact Analysis

The `ScenarioModelingService.getScenarioImpact()` method aggregates results. No changes needed for new scenario types.

### 5. Update Dashboard

The `FPASpecialistService.getDashboard()` counts scenarios with `status: { not: "archived" }`. New types appear automatically.

---

## Adding New Business Driver Categories

### 1. Add to Type Union

In `src/modules/fpa-specialist/types.ts`, add to the `DriverCategory` union:

```typescript
export type DriverCategory =
  | "revenue"
  | "cost"
  | "volume"
  | "price"
  | "headcount"
  | "productivity"
  | "market"
  | "macroeconomic"
  | "operational"
  | "financial"
  | "esg";  // ← new category (Environmental, Social, Governance)
```

### 2. Update Driver Creation

The `DriverModelingService.createDriver()` method stores `driverCategory` directly — no changes needed.

### 3. Update Sensitivity Analysis

The `DriverModelingService.runSensitivityAnalysis()` method sweeps a driver across a range. If the new category needs custom elasticity:

```typescript
const CATEGORY_ELASTICITY: Record<string, number> = {
  revenue: 0.15,
  cost: 0.12,
  volume: 0.18,
  price: 0.25,
  headcount: 0.10,
  productivity: 0.14,
  market: 0.20,
  macroeconomic: 0.22,
  operational: 0.11,
  financial: 0.16,
  esg: 0.08,  // ← new elasticity
};

static async runSensitivityAnalysis(ctx: TenantContext, driverId: string, range: SensitivityAnalysisInput): Promise<SensitivityResult> {
  const driver = await prisma.businessDriver.findFirst({ where: { id: driverId, companyId: ctx.companyId } });
  if (!driver) throw new Error("Driver not found");

  const elasticity = CATEGORY_ELASTICITY[driver.driverCategory] ?? 0.15;

  // ... use elasticity in impact calculation
  const impact = (value - Number(driver.defaultValue)) * elasticity;
}
```

### 4. Update Driver Filtering

The `DriverModelingService.getDrivers()` method filters by `driverCategory` — no changes needed. The new category appears in filtering automatically.

---

## Adding New Variance Analysis Types

### 1. Add to Type Union

In `src/modules/fpa-specialist/types.ts`, add to the `VarianceAnalysisType` union:

```typescript
export type VarianceAnalysisType =
  | "budget_vs_actual"
  | "forecast_vs_actual"
  | "period_over_period"
  | "year_over_year"
  | "rolling_variance"
  | "bridge_analysis"
  | "product_mix";  // ← new type
```

### 2. Update Key Driver Decomposition

The `VarianceAnalysisService.getKeyDrivers()` method returns 4 fixed drivers. If the new analysis type needs different key drivers:

```typescript
static async getKeyDrivers(ctx: TenantContext, analysisId: string): Promise<VarianceKeyDriver[]> {
  const analysis = await prisma.varianceAnalysis.findFirst({ where: { id: analysisId, companyId: ctx.companyId } });
  if (!analysis) return [];

  // Custom key drivers for product mix analysis
  if (analysis.analysisType === "product_mix") {
    return [
      {
        name: "Product A Mix Shift",
        impact: analysis.overallVariance.mul(0.35),
        impactPercent: new Prisma.Decimal(35),
        direction: "favorable",
        explanation: "Higher-margin product A increased share",
      },
      {
        name: "Product B Volume Decline",
        impact: analysis.overallVariance.mul(-0.25),
        impactPercent: new Prisma.Decimal(25),
        direction: "unfavorable",
        explanation: "Lower-volume product B lost market share",
      },
      // ... additional product-mix-specific drivers
    ];
  }

  // ... existing default drivers
}
```

### 3. Update Variance Trends

The `VarianceAnalysisService.getVarianceTrends()` method groups by `analysisType` and period — no changes needed. New types appear in trends automatically.

### 4. Update Dashboard

The `FPASpecialistService.getDashboard()` retrieves top 5 analyses by creation date. New types appear automatically.

---

## Customizing Planning Scoring

### 1. Add a New Health Dimension

In `src/modules/fpa-specialist/planning.ts`, extend `getPlanningHealth()`:

```typescript
static async getPlanningHealth(ctx: TenantContext): Promise<PlanningHealth> {
  const [activePlans, lockedCycles, pendingApprovals, initiatives, driverCount] = await Promise.all([
    prisma.strategicPlan.count({ where: { companyId: ctx.companyId, status: { in: ["active", "completed"] } } }),
    prisma.planningCycle.count({ where: { companyId: ctx.companyId, status: "locked" } }),
    prisma.investmentProposal.count({ where: { companyId: ctx.companyId, status: "proposed" } }),
    prisma.strategicInitiative.findMany({ where: { companyId: ctx.companyId }, select: { status: true } }),
    prisma.businessDriver.count({ where: { companyId: ctx.companyId } }),
  ]);

  const onTrack = initiatives.filter((i) => i.status === "in_progress" || i.status === "completed").length;
  const atRisk = initiatives.filter((i) => i.status === "planning").length;

  const scoreComponents = [
    activePlans > 0 ? 0.25 : 0,        // adjusted from 0.3
    lockedCycles > 0 ? 0.15 : 0,        // adjusted from 0.2
    pendingApprovals === 0 ? 0.2 : 0.1,
    initiatives.length > 0 ? (onTrack / initiatives.length) * 0.25 : 0,  // adjusted from 0.3
    driverCount >= 10 ? 0.15 : 0.05,    // ← new dimension: driver maturity
  ];
  const overallScore = new Prisma.Decimal(scoreComponents.reduce((a, b) => a + b, 0)).toDecimalPlaces(2);

  return { overallScore, activePlans, lockedCycles, pendingApprovals, onTrackInitiatives: onTrack, atRiskInitiatives: atRisk, overdueActions: 0 };
}
```

### 2. Update Dashboard Score

In `fpa-specialist.ts`, adjust the `overallScore` calculation if the new dimension affects it:

```typescript
const overallScore = new Prisma.Decimal(
  (activePlans > 0 ? 0.12 : 0) +
  (activeBudgets > 0 ? 0.18 : 0) +
  (activeForecasts > 0 ? 0.12 : 0) +
  (openScenarios > 0 ? 0.08 : 0) +
  (totalDrivers > 0 ? 0.15 : 0) +      // increased weight
  (forecastAccuracy.toNumber() / 100) * 0.25 +
  (capitalUtilization.toNumber() / 100) * 0.10,  // ← new component
).toDecimalPlaces(2);
```

### 3. Add Scoring Weights Configuration (Optional)

For configurable scoring, add a weights object:

```typescript
const PLANNING_HEALTH_WEIGHTS = {
  activePlans: 0.25,
  lockedCycles: 0.15,
  approvalClearance: 0.20,
  initiativeProgress: 0.25,
  driverMaturity: 0.15,
};

function computeHealthScore(components: Record<string, number>, weights: typeof PLANNING_HEALTH_WEIGHTS): Prisma.Decimal {
  const score = Object.entries(weights).reduce((sum, [key, weight]) => {
    return sum + (components[key] ?? 0) * weight;
  }, 0);
  return new Prisma.Decimal(Math.min(1, Math.max(0, score))).toDecimalPlaces(2);
}
```

---

## Customizing Driver Formulas

### 1. Define Formula Registry

The `BusinessDriver` model stores a `formula` field (mapped from `description`). To add formula evaluation:

```typescript
type DriverFormula = (inputs: Record<string, number>) => number;

const FORMULA_REGISTRY: Record<string, DriverFormula> = {
  "revenue_per_customer": (inputs) => inputs.totalRevenue / Math.max(1, inputs.customerCount),
  "gross_margin": (inputs) => ((inputs.revenue - inputs.cogs) / inputs.revenue) * 100,
  "burn_rate": (inputs) => inputs.monthlyExpenses - inputs.monthlyRevenue,
  "ltv_cac_ratio": (inputs) => inputs.customerLifetimeValue / Math.max(1, inputs.customerAcquisitionCost),
};

function evaluateFormula(formulaName: string, inputs: Record<string, number>): number {
  const formula = FORMULA_REGISTRY[formulaName];
  if (!formula) throw new Error(`Unknown formula: ${formulaName}`);
  return formula(inputs);
}
```

### 2. Wire Into Driver Updates

When a driver's value changes, recompute dependent drivers:

```typescript
static async updateDriver(ctx: TenantContext, driverId: string, input: UpdateDriverInput): Promise<BusinessDriver> {
  const driver = await prisma.businessDriver.update({
    where: { id: driverId, companyId: ctx.companyId },
    data: {
      ...(input.currentValue !== undefined && { currentValue: new Prisma.Decimal(input.currentValue) }),
      // ...
    },
  });

  // Recompute dependent drivers if formula-based
  if (input.currentValue !== undefined && driver.formula) {
    await this.recomputeDependentDrivers(ctx, driverId);
  }

  return mapDriver(driver);
}
```

### 3. Add Formula Validation

```typescript
function validateFormulaInputs(formulaName: string, availableDrivers: string[]): boolean {
  const requiredInputs = REQUIRED_INPUTS[formulaName] ?? [];
  return requiredInputs.every(input => availableDrivers.includes(input));
}
```

---

## Integrating External Planning Tools

### 1. Define the Integration Interface

```typescript
interface ExternalPlanningToolAdapter {
  name: string;
  exportBudgets(budgets: Budget[]): Promise<ExportResult>;
  importForecasts(): Promise<ImportResult>;
  syncDrivers(drivers: BusinessDriver[]): Promise<SyncResult>;
  healthCheck(): Promise<boolean>;
}
```

### 2. Implement the Adapter

```typescript
class AdaptivePlanningAdapter implements ExternalPlanningToolAdapter {
  name = "Adaptive Insights";

  async exportBudgets(budgets: Budget[]): Promise<ExportResult> {
    const payload = budgets.map(b => ({
      id: b.id,
      name: b.name,
      type: mapBudgetTypeToAdaptive(b.budgetType),
      fiscalYear: b.fiscalYear,
      totalAmount: b.metadata?.totalAmount,
    }));

    const response = await fetch(this.apiUrl + "/budgets/import", {
      method: "POST",
      headers: { "Authorization": `Bearer ${this.apiKey}` },
      body: JSON.stringify(payload),
    });

    return { success: response.ok, exportedCount: budgets.length };
  }

  async importForecasts(): Promise<ImportResult> {
    const response = await fetch(this.apiUrl + "/forecasts", {
      headers: { "Authorization": `Bearer ${this.apiKey}` },
    });

    const data = await response.json();
    // Map and create forecasts...
    return { success: true, importedCount: data.length };
  }

  async syncDrivers(drivers: BusinessDriver[]): Promise<SyncResult> {
    const payload = drivers.map(d => ({
      name: d.name,
      category: d.category,
      value: d.currentValue,
    }));

    const response = await fetch(this.apiUrl + "/drivers/sync", {
      method: "POST",
      headers: { "Authorization": `Bearer ${this.apiKey}` },
      body: JSON.stringify(payload),
    });

    return { success: response.ok, syncedCount: drivers.length };
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(this.apiUrl + "/health");
      return response.ok;
    } catch {
      return false;
    }
  }
}
```

### 3. Register the Adapter

```typescript
const externalAdapters: Map<string, ExternalPlanningToolAdapter> = new Map();

export function registerExternalPlanningTool(adapter: ExternalPlanningToolAdapter) {
  externalAdapters.set(adapter.name, adapter);
}

export function getExternalPlanningTool(name: string): ExternalPlanningToolAdapter | undefined {
  return externalAdapters.get(name);
}
```

### 4. Add Sync API Endpoints

```typescript
// src/app/api/fpa/external-sync/route.ts
export async function POST(req: Request) {
  const session = await auth();
  const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

  const body = await parseJsonBody<{ toolName: string; direction: "export" | "import" | "sync" }>(req);

  const adapter = getExternalPlanningTool(body.toolName);
  if (!adapter) {
    return NextResponse.json({ error: `Unknown tool: ${body.toolName}` }, { status: 404 });
  }

  let result;
  switch (body.direction) {
    case "export":
      const budgets = await BudgetService.getBudgets(ctx);
      result = await adapter.exportBudgets(budgets.budgets);
      break;
    case "import":
      result = await adapter.importForecasts();
      break;
    case "sync":
      const drivers = await DriverModelingService.getDrivers(ctx);
      result = await adapter.syncDrivers(drivers.drivers);
      break;
  }

  return NextResponse.json(result);
}
```

### 5. Common External Tool Mappings

| Perionyx Type | Adaptive Insights | Anaplan | Vena | Pigment |
|---|---|---|---|---|
| `operating` | OpEx Budget | Operating Plan | Operating Budget | OpEx |
| `capital` | CapEx Budget | Capital Plan | Capital Budget | CapEx |
| `zero_based` | ZBB | Zero-Based | ZBB | ZBB |
| `revenue` | Revenue Forecast | Revenue Plan | Revenue FC | Revenue |
| `cash_flow` | Cash Forecast | Cash Plan | Cash FC | Cash |
| `base` | Base Case | Base Scenario | Base | Baseline |
| `stress_test` | Stress Test | Stress Scenario | Stress | Stress |
| `monte_carlo` | Simulation | Monte Carlo | Simulation | Monte Carlo |

---

## Testing Approach

### Unit Tests

Test each service method in isolation with mocked Prisma:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BudgetService } from "@/modules/fpa-specialist/budget";

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    budget: { findMany: vi.fn(), count: vi.fn(), create: vi.fn(), update: vi.fn(), findFirst: vi.fn() },
    budgetLine: { findMany: vi.fn(), count: vi.fn(), create: vi.fn(), update: vi.fn() },
    budgetVersion: { findMany: vi.fn(), create: vi.fn() },
  },
}));

describe("BudgetService", () => {
  const mockCtx = { companyId: "comp_1", userId: "user_1" };

  beforeEach(() => vi.clearAllMocks());

  it("should create a budget with correct type", async () => {
    const prisma = await import("@/server/db/prisma");
    vi.mocked(prisma.prisma.budget.create).mockResolvedValue({
      id: "b1",
      companyId: "comp_1",
      budgetType: "operating",
      budgetName: "FY2026 Operating",
      fiscalYear: 2026,
      totalAmount: 0,
      status: "draft",
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const budget = await BudgetService.createBudget(mockCtx, {
      budgetType: "operating",
      name: "FY2026 Operating",
      description: "Annual operating budget",
      fiscalYear: 2026,
    });

    expect(budget.budgetType).toBe("operating");
    expect(budget.name).toBe("FY2026 Operating");
  });

  it("should compute budget variance with materiality flagging", async () => {
    const prisma = await import("@/server/db/prisma");
    vi.mocked(prisma.prisma.budgetLine.findMany).mockResolvedValue([
      {
        id: "bl1",
        budgetId: "b1",
        lineNumber: 1,
        accountCode: "6000",
        accountName: "Salaries",
        category: "expense",
        department: "engineering",
        description: "Engineering salaries",
        budgetAmount: new Prisma.Decimal(100000),
        actualAmount: new Prisma.Decimal(115000),
        variance: new Prisma.Decimal(-15000),
        variancePercent: new Prisma.Decimal(-15),
        metadata: {},
      },
    ] as any);

    const result = await BudgetService.getBudgetVariance(mockCtx, "b1");

    expect(result.materialVariances).toHaveLength(1);
    expect(result.variancePercent.toNumber()).toBeLessThan(0);
  });

  it("should track budget versions with auto-increment", async () => {
    const prisma = await import("@/server/db/prisma");
    vi.mocked(prisma.prisma.budgetVersion.findMany).mockResolvedValue([
      { id: "bv1", version: "1", changeDescription: "Initial" } as any,
    ]);
    vi.mocked(prisma.prisma.budgetVersion.create).mockResolvedValue({
      id: "bv2",
      budgetId: "b1",
      version: "2",
      changeDescription: "Q2 Update",
      totalAmount: 0,
      createdAt: new Date(),
    } as any);

    const version = await BudgetService.createVersion(mockCtx, {
      budgetId: "b1",
      name: "Q2 Update",
    });

    expect(version.versionNumber).toBe(2);
  });
});
```

### Integration Tests

Test the API routes with mocked auth:

```typescript
import { describe, it, expect, vi } from "vitest";
import { GET, POST } from "@/app/api/fpa/budgets/route";

vi.mock("@/server/auth/auth", () => ({
  auth: () => Promise.resolve({ user: { id: "user_1", activeCompanyId: "comp_1", companyRole: "ADMIN" } }),
}));

describe("GET /api/fpa/budgets", () => {
  it("should return budget list", async () => {
    const req = new Request("http://localhost/api/fpa/budgets");
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("budgets");
  });
});

describe("POST /api/fpa/budgets", () => {
  it("should create a budget", async () => {
    const req = new Request("http://localhost/api/fpa/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        budgetType: "operating",
        name: "FY2026 Operating",
        description: "Annual operating budget",
        fiscalYear: 2026,
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);
  });
});
```

### End-to-End Tests

Test the full FP&A workflow:

```typescript
describe("FP&A Specialist E2E", () => {
  it("should complete plan → budget → forecast → scenario → recommendation lifecycle", async () => {
    const ctx = { companyId: "comp_1", userId: "user_1" };

    // 1. Create a strategic plan
    const plan = await PlanningService.createPlan(ctx, {
      planType: "annual",
      name: "FY2026 Strategic Plan",
      description: "Annual planning cycle",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-12-31"),
    });

    // 2. Create a budget under the plan
    const budget = await BudgetService.createBudget(ctx, {
      budgetType: "operating",
      name: "FY2026 Operating Budget",
      description: "Annual operating budget",
      fiscalYear: 2026,
    });

    // 3. Add budget lines
    const line = await BudgetService.createLine(ctx, {
      budgetId: budget.id,
      versionId: "v1",
      accountCode: "6000",
      accountName: "Salaries",
      department: "engineering",
      description: "Engineering team",
      budgetAmount: 500000,
    });

    // 4. Create a forecast
    const forecast = await ForecastService.createForecast(ctx, {
      forecastType: "revenue",
      name: "FY2026 Revenue Forecast",
      description: "Annual revenue projection",
      horizon: "annual",
    });

    // 5. Create a scenario
    const scenario = await ScenarioModelingService.createScenario(ctx, {
      scenarioType: "base",
      name: "Base Case FY2026",
      description: "Most likely outcome",
      assumptions: { revenueGrowth: 0.12, costInflation: 0.03 },
    });

    // 6. Execute the scenario
    const result = await ScenarioModelingService.executeScenario(ctx, scenario.id, {
      period: "2026-Q1",
    });

    // 7. Create a recommendation
    const rec = await ExecutiveSupportService.createRecommendation(ctx, {
      category: "cost_optimization",
      title: "Reduce cloud spend by 15%",
      description: "Right-size instances and reserved capacity",
      rationale: "Current spend is 20% above industry benchmark",
      riskLevel: "low",
      estimatedImpact: 75000,
      impactType: "annual_savings",
    });

    // 8. Verify the lifecycle
    expect(plan.id).toBeDefined();
    expect(budget.status).toBe("draft");
    expect(line.budgetAmount.toNumber()).toBe(500000);
    expect(result.confidence.toNumber()).toBeGreaterThan(0);
    expect(rec.status).toBe("proposed");
  });
});
```

### Test File Locations

```
src/modules/fpa-specialist/__tests__/
├── planning.test.ts
├── budget.test.ts
├── forecast.test.ts
├── scenario-modeling.test.ts
├── driver-modeling.test.ts
├── variance-analysis.test.ts
├── capital-allocation.test.ts
├── executive-support.test.ts
└── fpa-specialist.test.ts

src/app/api/fpa/__tests__/
├── dashboard.test.ts
├── plans.test.ts
├── budgets.test.ts
├── budgets-[id].test.ts
├── forecasts.test.ts
├── forecasts-[id].test.ts
├── scenarios.test.ts
├── scenarios-[id].test.ts
├── drivers.test.ts
├── variance.test.ts
├── capital.test.ts
├── capital-proposals.test.ts
├── recommendations.test.ts
├── briefings.test.ts
└── analytics.test.ts
```

### Running Tests

```bash
pnpm test src/modules/fpa-specialist/
pnpm test src/app/api/fpa/
pnpm typecheck
```

---

## Extension Checklist

Before shipping any extension, verify:

- [ ] Type union updated in `types.ts`
- [ ] Service method handles the new type (no switch/case that silently drops unknowns)
- [ ] Prisma schema updated if new fields are needed (with migration)
- [ ] API endpoint accepts and validates the new type via Zod schema
- [ ] Dashboard/aggregation methods group by the new type correctly
- [ ] Briefing generation includes the new type in relevant sections
- [ ] Unit tests added for the new type's happy path and edge cases
- [ ] Integration test covers the new type through the API
- [ ] Documentation updated (this file + `40-fpa-specialist.md`)
- [ ] `pnpm typecheck` passes
- [ ] `pnpm build` passes
- [ ] Security review passed (no new secrets, no tenant isolation bypass, no fabrication)
