# Enterprise Tax Specialist — Extension Guide

## Overview

This guide explains how to extend the Tax Specialist with new jurisdiction types, rate types, return types, temporary difference types, transfer pricing methods, provision calculation customizations, risk scoring customizations, and external tax engine integrations.

## Prerequisites

- Access to the Perionyx codebase
- Understanding of the Tax Specialist types (`src/modules/tax-specialist/types.ts`)
- Prisma schema with the 16 tax models (in `prisma/schema.prisma`)
- `TenantContext` available for all operations
- RBAC permission `tax.admin` for configuration changes

---

## Adding New Jurisdiction Types

### 1. Understand Jurisdiction Scope

Jurisdictions are stored as ISO 3166-1 alpha-2 country codes (e.g., `"US"`, `"DE"`, `"JP"`) in `TaxRate.jurisdictionCode` and across all tax domain models. No type union constrains jurisdictions — they are free-form strings with a comment convention in the schema.

### 2. Add Jurisdiction-Specific Rates

Create `TaxRate` records for the new jurisdiction with appropriate `rateType` values:

```typescript
await prisma.taxRate.create({
  data: {
    companyId: ctx.companyId,
    jurisdictionCode: "IN",  // India
    rateType: "statutory",
    rate: new Prisma.Decimal("0.2525"),  // 25.25% for new manufacturing companies
    effectiveFrom: new Date("2026-04-01"),
    source: "India Income Tax Act, Section 115BAB",
  },
});
```

### 3. Add Jurisdiction-Specific Filing Rules

Extend the tax calendar to include jurisdiction-specific filing deadlines:

```typescript
await prisma.taxCalendarEntry.create({
  data: {
    companyId: ctx.companyId,
    jurisdictionCode: "IN",
    returnType: "corporate_income_tax",
    filingType: "original",
    period: "2026-FY",
    dueDate: new Date("2026-11-30"),  // India FY end + 6 months
    status: "pending",
  },
});
```

### 4. Add Withholding Tax Treaty Rates (Optional)

For jurisdictions with treaty networks, add withholding tax rates to `TaxRate` with `rateType: "withholding"`:

```typescript
await prisma.taxRate.create({
  data: {
    companyId: ctx.companyId,
    jurisdictionCode: "US",
    rateType: "withholding",
    rate: new Prisma.Decimal("0.15"),  // 15% under US-India treaty
    effectiveFrom: new Date("2026-01-01"),
    source: "US-India Double Taxation Treaty, Article 10",
  },
});
```

### 5. Update Corporate Tax Computation

The `CorporateTaxService.computeLiability()` method iterates over jurisdictions — no code changes needed for new jurisdictions. The new jurisdiction's rates will be picked up automatically during computation.

### 6. Update Dashboard Filtering

The `TaxSpecialistService.getDashboard()` aggregates liability by `jurisdictionCode` — new jurisdictions appear automatically in the dashboard.

---

## Adding New Rate Types

### 1. Add to Type Union

In `src/modules/tax-specialist/types.ts`, add the new type to the `TaxRateType` union:

```typescript
export type TaxRateType =
  | "statutory"
  | "effective"
  | "deferred"
  | "withholding"
  | "minimum"
  | "surtax"
  | "marginal"
  | "environmental_levy";  // ← new type (e.g., carbon tax rate)
```

### 2. Update the Prisma Schema

The `TaxRate.rateType` field is a `String` — no schema migration needed. Add a comment documenting the new type:

```prisma
// In prisma/schema.prisma — TaxRate model
rateType String @default("statutory")
/// "statutory" | "effective" | "deferred" | "withholding" | "minimum" | "surtax" | "marginal" | "environmental_levy"
```

### 3. Update Rate Lookup Logic

If the new rate type needs special lookup behavior, extend `CorporateTaxService.getEffectiveRate()`:

```typescript
static async getEffectiveRate(ctx: TenantContext, jurisdictionCode: string, period: string): Promise<Prisma.Decimal> {
  const statutoryRate = await prisma.taxRate.findFirst({
    where: {
      companyId: ctx.companyId,
      jurisdictionCode,
      rateType: "statutory",
      effectiveFrom: { lte: periodStartDate },
    },
  });

  const environmentalLevy = await prisma.taxRate.findFirst({
    where: {
      companyId: ctx.companyId,
      jurisdictionCode,
      rateType: "environmental_levy",
      effectiveFrom: { lte: periodStartDate },
    },
  });

  const baseRate = statutoryRate?.rate ?? new Prisma.Decimal("0.25");
  const levy = environmentalLevy?.rate ?? new Prisma.Decimal("0");

  // Stack the environmental levy on top of statutory
  return baseRate.add(levy);
}
```

### 4. Update Rate Reconciliation

The `CorporateTaxService.getRateReconciliation()` method returns a line-item breakdown. Add the new rate type as a reconciliation item:

```typescript
static async getRateReconciliation(ctx: TenantContext, provisionId: string): Promise<RateReconciliationItem[]> {
  // ... existing items

  // Add environmental levy as a line item
  const environmentalLevy = await prisma.taxRate.findFirst({
    where: { companyId: ctx.companyId, rateType: "environmental_levy" },
  });

  if (environmentalLevy) {
    items.push({
      item: "Environmental Levy",
      rate: environmentalLevy.rate,
      amount: taxableIncome.mul(environmentalLevy.rate),
    });
  }

  return items;
}
```

### 5. Update Dashboard

The `TaxSpecialistService.getDashboard()` counts rates by `rateType` — new types appear automatically in rate summary.

---

## Adding New Return Types

### 1. Add to Type Union

In `src/modules/tax-specialist/types.ts`, add to the `ReturnType` union:

```typescript
export type ReturnType =
  | "corporate_income_tax"
  | "VAT_GST"
  | "withholding_tax"
  | "payroll_tax"
  | "transfer_pricing_report"
  | "information_return"
  | "environmental_tax_return";  // ← new type
```

### 2. Add to Filing Type Validation

The `TaxCalendarService.createEntry()` method validates that `returnType` is a known type. No schema changes needed — the `String` field accepts any value. However, update the Zod validation schema:

```typescript
// In src/lib/validations/tax-specialist.ts
export const createCalendarEntrySchema = z.object({
  returnType: z.enum([
    "corporate_income_tax",
    "VAT_GST",
    "withholding_tax",
    "payroll_tax",
    "transfer_pricing_report",
    "information_return",
    "environmental_tax_return",  // ← add
  ]),
  // ... other fields
});
```

### 3. Add Default Filing Deadline Rules (Optional)

If the new return type has statutory deadline rules, extend `TaxCalendarService.computeDeadline()`:

```typescript
static computeDeadline(returnType: string, jurisdictionCode: string, periodEndDate: Date): Date {
  const DEADLINE_RULES: Record<string, number> = {
    corporate_income_tax: 180,   // 6 months
    VAT_GST: 30,                // 1 month
    withholding_tax: 15,         // 15 days
    payroll_tax: 30,             // 1 month
    transfer_pricing_report: 365, // 12 months
    information_return: 90,       // 3 months
    environmental_tax_return: 60, // ← 2 months
  };

  const bufferDays = DEADLINE_RULES[returnType] ?? 30;
  return addDays(periodEndDate, bufferDays);
}
```

### 4. Update Dashboard Filing Status

The `TaxSpecialistService.getDashboard()` groups filings by `returnType` — new types appear automatically in filing status summary.

---

## Adding New Temporary Difference Types

### 1. Add to Type Union

In `src/modules/tax-specialist/types.ts`, add to the `TemporaryDifferenceType` union:

```typescript
export type TemporaryDifferenceType =
  | "depreciation_timing"
  | "bad_debt_reserve"
  | "accrued_liabilities"
  | "prepaid_expenses"
  | "unrealized_gains_losses"
  | "stock_compensation"
  | "nol_carryforward"
  | "foreign_tax_credit"
  | "intercompany_profit_elimination"
  | "lease_accounting"
  | "cryptocurrency_revaluation";  // ← new type
```

### 2. Update Provision Calculation

The `TaxProvisionService.computeDeferredTax()` iterates over temporary differences and applies enacted rates. Add the new type's typical treatment:

```typescript
static getDifferenceTreatment(diffType: TemporaryDifferenceType): { defaultDTA: boolean; defaultReversalYears: number } {
  const TREATMENTS: Record<string, { defaultDTA: boolean; defaultReversalYears: number }> = {
    depreciation_timing: { defaultDTA: false, defaultReversalYears: 5 },
    bad_debt_reserve: { defaultDTA: true, defaultReversalYears: 2 },
    accrued_liabilities: { defaultDTA: true, defaultReversalYears: 1 },
    prepaid_expenses: { defaultDTA: false, defaultReversalYears: 1 },
    unrealized_gains_losses: { defaultDTA: false, defaultReversalYears: 3 },
    stock_compensation: { defaultDTA: true, defaultReversalYears: 4 },
    nol_carryforward: { defaultDTA: true, defaultReversalYears: 20 },
    foreign_tax_credit: { defaultDTA: true, defaultReversalYears: 10 },
    intercompany_profit_elimination: { defaultDTA: false, defaultReversalYears: 3 },
    lease_accounting: { defaultDTA: true, defaultReversalYears: 8 },
    cryptocurrency_revaluation: { defaultDTA: false, defaultReversalYears: 1 },  // ← new
  };

  return TREATMENTS[diffType] ?? { defaultDTA: false, defaultReversalYears: 3 };
}
```

### 3. Update Valuation Allowance Assessment

The `TaxProvisionService.assessValuationAllowance()` evaluates each DTA for realizability. If the new type has special realizability criteria:

```typescript
static async assessValuationAllowance(ctx: TenantContext, provisionId: string): Promise<ValuationAllowanceResult> {
  const differences = await prisma.temporaryDifference.findMany({
    where: { companyId: ctx.companyId, provisionId, isDTA: true },
  });

  let totalAllowance = new Prisma.Decimal(0);

  for (const diff of differences) {
    // Special realizability test for cryptocurrency — high volatility = higher allowance
    if (diff.differenceType === "cryptocurrency_revaluation") {
      totalAllowance = totalAllowance.add(diff.amount.mul(0.50));  // 50% allowance
    } else if (diff.reversalDate < new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)) {
      // Reverses within 1 year — lower allowance
      totalAllowance = totalAllowance.add(diff.amount.mul(0.05));
    } else {
      totalAllowance = totalAllowance.add(diff.amount.mul(0.10));
    }
  }

  return { totalAllowance, assessmentDate: new Date() };
}
```

### 4. Update Provision Dashboard

The `TaxProvisionService.getProvisionSummary()` groups by `differenceType` — new types appear automatically in provision breakdown.

---

## Adding New Transfer Pricing Methods

### 1. Add to Type Union

In `src/modules/tax-specialist/types.ts`, add to the `ArmLengthMethod` union:

```typescript
export type ArmLengthMethod =
  | "comparable_uncontrolled_price"
  | "resale_price_method"
  | "cost_plus_method"
  | "transactional_net_margin_method"
  | "profit_split_method"
  | "comparable_profits_method"
  | "unspecified_method"
  | "global_formulary_method";  // ← new method (e.g., for commodity trading)
```

### 2. Update Method Application

The `TransferPricingService.applyMethod()` dispatches on method type. Add the new method's application logic:

```typescript
static async applyMethod(ctx: TenantContext, studyId: string, method: ArmLengthMethod): Promise<MethodResult> {
  const study = await prisma.transferPricingStudy.findFirst({
    where: { id: studyId, companyId: ctx.companyId },
  });
  if (!study) throw new Error("Study not found");

  switch (method) {
    // ... existing methods

    case "global_formulary_method": {
      const transactions = await prisma.intercompanyTransaction.findMany({
        where: { companyId: ctx.companyId, studyId },
      });

      // Allocate combined profit based on revenue contribution
      const totalRevenue = transactions.reduce((sum, t) => sum.add(t.amount), new Prisma.Decimal(0));
      const entityRevenue = study.entityRevenue ?? new Prisma.Decimal(0);
      const allocationPercentage = entityRevenue.div(totalRevenue.max(1));

      return {
        method,
        armLengthRange: [allocationPercentage.sub(0.05), allocationPercentage.add(0.05)],
        median: allocationPercentage,
        comparablesCount: 0,
        documentation: "Global formulary allocation based on revenue contribution",
      };
    }

    default:
      throw new Error(`Unknown method: ${method}`);
  }
}
```

### 3. Update Benchmarking

The `TransferPricingService.getBenchmarking()` method returns interquartile ranges. The new method may need different comparables criteria:

```typescript
static async getBenchmarking(ctx: TenantContext, studyId: string): Promise<BenchmarkingResult> {
  const study = await prisma.transferPricingStudy.findFirst({
    where: { id: studyId, companyId: ctx.companyId },
  });

  if (study?.armLengthMethod === "global_formulary_method") {
    // Formulary method doesn't use comparable analysis — return industry benchmarks
    return {
      method: "global_formulary_method",
      interquartileRange: [0.85, 1.15],  // ±15% allocation tolerance
      median: new Prisma.Decimal(1.0),
      comparablesCount: 0,
      note: "Formulary method uses allocation key, not comparables",
    };
  }

  // ... existing comparable-based benchmarking
}
```

---

## Customizing Tax Provision Calculations

### 1. Add Custom Permanent Differences

Extend the rate reconciliation with new permanent difference categories:

```typescript
static async getPermanentDifferences(ctx: TenantContext, provisionId: string): Promise<PermanentDifference[]> {
  const provision = await prisma.taxProvision.findFirst({
    where: { id: provisionId, companyId: ctx.companyId },
  });

  // Standard permanent differences
  const differences: PermanentDifference[] = [
    { item: "Non-deductible expenses", amount: provision?.nondeductibleExpenses ?? 0 },
    { item: "Tax-exempt income", amount: provision?.exemptIncome ?? 0 },
    { item: "Foreign tax differential", amount: provision?.foreignTaxDiff ?? 0 },
  ];

  // Custom: Environmental tax credit carryforward
  const envCreditCarryforward = await prisma.taxRate.findFirst({
    where: { companyId: ctx.companyId, jurisdictionCode: provision?.jurisdictionCode, rateType: "environmental_levy" },
  });

  if (envCreditCarryforward) {
    differences.push({
      item: "Environmental tax credit",
      amount: envCreditCarryforward.rate.mul(provision?.taxableIncome ?? 0).neg(),
    });
  }

  return differences;
}
```

### 2. Add Custom Valuation Allowance Triggers

Extend `assessValuationAllowance()` with entity-specific triggers:

```typescript
const CUSTOM_ALLOWANCE_TRIGGERS: Record<string, (diff: TemporaryDifference) => Prisma.Decimal> = {
  // Cryptocurrency holdings — 50% allowance for volatility
  cryptocurrency_revaluation: (diff) => diff.amount.mul(0.50),
  // NOL carryforward near expiry — 100% allowance
  nol_carryforward: (diff) => {
    const yearsToExpiry = (diff.reversalDate.getTime() - Date.now()) / (365 * 24 * 60 * 60 * 1000);
    return yearsToExpiry < 1 ? diff.amount : new Prisma.Decimal(0);
  },
  // Default: no special treatment
};
```

### 3. Add Multi-Jurisdiction Provision Consolidation

If the enterprise operates across multiple jurisdictions, extend the provision to consolidate:

```typescript
static async getConsolidatedProvision(ctx: TenantContext, fiscalYear: number): Promise<ConsolidatedProvision> {
  const provisions = await prisma.taxProvision.findMany({
    where: { companyId: ctx.companyId, fiscalYear, status: "final" },
  });

  const byJurisdiction = provisions.map((p) => ({
    jurisdictionCode: p.jurisdictionCode,
    currentTax: p.currentTax,
    deferredTax: p.deferredTax,
    totalTax: p.currentTax.add(p.deferredTax),
  }));

  return {
    totalCurrentTax: byJurisdiction.reduce((sum, j) => sum.add(j.currentTax), new Prisma.Decimal(0)),
    totalDeferredTax: byJurisdiction.reduce((sum, j) => sum.add(j.deferredTax), new Prisma.Decimal(0)),
    totalTax: byJurisdiction.reduce((sum, j) => sum.add(j.totalTax), new Prisma.Decimal(0)),
    byJurisdiction,
  };
}
```

---

## Customizing Risk Scoring

### 1. Add a New Risk Dimension

In `src/modules/tax-specialist/tax-risk.ts`, extend `computeRiskScore()`:

```typescript
static async computeRiskScore(ctx: TenantContext): Promise<TaxRiskScore> {
  const [filings, provisions, assessments, risks, transfers] = await Promise.all([
    prisma.taxCalendarEntry.findMany({ where: { companyId: ctx.companyId } }),
    prisma.taxProvision.findMany({ where: { companyId: ctx.companyId, fiscalYear: currentYear() } }),
    prisma.taxRiskAssessment.findMany({ where: { companyId: ctx.companyId } }),
    prisma.taxRiskItem.findMany({ where: { companyId: ctx.companyId, status: "open" } }),
    prisma.transferPricingStudy.findMany({ where: { companyId: ctx.companyId, fiscalYear: currentYear() } }),
  ]);

  const overdueFilings = filings.filter((f) => f.status === "overdue").length;
  const completenessScore = provisions.length > 0 ? 0 : 100;
  const openRisks = risks.filter((r) => r.riskLevel === "high" || r.riskLevel === "critical").length;
  const transferPricingCoverage = transfers.length > 0 ? 0 : 100;

  const riskDimensions = {
    compliance: Math.min(100, overdueFilings * 25),
    planning: Math.min(100, openRisks * 20),
    operational: completenessScore,
    regulatory: Math.min(100, transferPricingCoverage * 0.3),
  };

  const weights = { compliance: 0.30, planning: 0.25, operational: 0.25, regulatory: 0.20 };
  const overallScore = Object.entries(weights).reduce(
    (sum, [key, weight]) => sum + riskDimensions[key as keyof typeof riskDimensions] * weight,
    0,
  );

  return { overallScore: new Prisma.Decimal(overallScore).toDecimalPlaces(2), riskDimensions, weights };
}
```

### 2. Add Custom Risk Thresholds

Override the default thresholds for specific industries or jurisdictions:

```typescript
const CUSTOM_RISK_THRESHOLDS: Record<string, { low: number; medium: number; high: number }> = {
  // Financial services — lower thresholds due to regulatory scrutiny
  financial_services: { low: 15, medium: 35, high: 60 },
  // Manufacturing — standard thresholds
  manufacturing: { low: 25, medium: 50, high: 75 },
  // Technology — tighter thresholds for IP-intensive transfer pricing
  technology: { low: 20, medium: 40, high: 65 },
};

function classifyRisk(score: number, industry?: string): string {
  const thresholds = CUSTOM_RISK_THRESHOLDS[industry ?? "default"] ?? { low: 25, medium: 50, high: 75 };
  if (score < thresholds.low) return "low";
  if (score < thresholds.medium) return "medium";
  if (score < thresholds.high) return "high";
  return "critical";
}
```

### 3. Add Risk Mitigation Effectiveness Tracking

Extend `TaxRiskItem` mitigation with effectiveness measurement:

```typescript
static async trackMitigationEffectiveness(ctx: TenantContext, riskItemId: string): Promise<MitigationEffectiveness> {
  const item = await prisma.taxRiskItem.findFirst({
    where: { id: riskItemId, companyId: ctx.companyId },
  });
  if (!item) throw new Error("Risk item not found");

  // Compute before/after risk scores
  const initialRiskScore = item.initialRiskScore;
  const currentRiskScore = item.currentRiskScore;
  const effectiveness = initialRiskScore > 0
    ? ((initialRiskScore - currentRiskScore) / initialRiskScore) * 100
    : 0;

  return {
    riskItemId,
    initialRiskScore,
    currentRiskScore,
    effectiveness: new Prisma.Decimal(effectiveness).toDecimalPlaces(1),
    status: effectiveness > 50 ? "effective" : effectiveness > 0 ? "partial" : "ineffective",
  };
}
```

---

## Integrating External Tax Engines

### 1. Define the Integration Interface

Create an adapter interface for external tax engines (Vertex, Avalara, Thomson Reuters ONESOURCE, Sovos):

```typescript
// In src/modules/tax-specialist/types.ts
export interface ExternalTaxEngineAdapter {
  readonly name: string;
  readonly version: string;

  // Tax rate lookup
  getRates(jurisdictionCode: string, transactionType: string): Promise<ExternalRate[]>;

  // Transaction tax determination
  determineTax(input: TaxDeterminationInput): Promise<TaxDeterminationResult>;

  // Provision data sync
  getProvisionData(fiscalYear: number, jurisdictionCode: string): Promise<ExternalProvisionData>;

  // Health check
  healthCheck(): Promise<EngineHealth>;
}

export interface TaxDeterminationInput {
  transactionType: "goods" | "services" | "digital" | "import" | "export";
  originJurisdiction: string;
  destinationJurisdiction: string;
  amount: Prisma.Decimal;
  customerType: "business" | "consumer" | "government";
}

export interface TaxDeterminationResult {
  taxAmount: Prisma.Decimal;
  taxRate: Prisma.Decimal;
  taxType: string;
  jurisdictionCode: string;
  exemption?: string;
  source: string;  // "external_engine" | "internal"
}
```

### 2. Implement the Adapter

```typescript
// In src/modules/tax-specialist/engines/vertex-adapter.ts
import { ExternalTaxEngineAdapter, TaxDeterminationInput, TaxDeterminationResult } from "../types";

export class VertexAdapter implements ExternalTaxEngineAdapter {
  readonly name = "Vertex";
  readonly version = "12.x";

  private apiKey: string;
  private baseUrl: string;

  constructor(config: { apiKey: string; baseUrl: string }) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl;
  }

  async getRates(jurisdictionCode: string, transactionType: string): Promise<ExternalRate[]> {
    const response = await fetch(`${this.baseUrl}/rates`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ jurisdictionCode, transactionType }),
    });
    return response.json();
  }

  async determineTax(input: TaxDeterminationInput): Promise<TaxDeterminationResult> {
    const response = await fetch(`${this.baseUrl}/determine`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const result = await response.json();
    return { ...result, source: "external_engine" };
  }

  async getProvisionData(fiscalYear: number, jurisdictionCode: string): Promise<ExternalProvisionData> {
    const response = await fetch(`${this.baseUrl}/provision`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ fiscalYear, jurisdictionCode }),
    });
    return response.json();
  }

  async healthCheck(): Promise<EngineHealth> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return { status: "healthy", engine: this.name, version: this.version };
    } catch {
      return { status: "unhealthy", engine: this.name, version: this.version };
    }
  }
}
```

### 3. Register the Adapter

```typescript
// In src/modules/tax-specialist/engines/registry.ts
import { ExternalTaxEngineAdapter } from "../types";

const adapters = new Map<string, ExternalTaxEngineAdapter>();

export function registerTaxEngine(name: string, adapter: ExternalTaxEngineAdapter): void {
  adapters.set(name, adapter);
}

export function getTaxEngine(name: string): ExternalTaxEngineAdapter | undefined {
  return adapters.get(name);
}

export function getActiveEngines(): ExternalTaxEngineAdapter[] {
  return Array.from(adapters.values());
}
```

### 4. Wire Into Indirect Tax

```typescript
// In src/modules/tax-specialist/indirect-tax.ts
static async determineTax(ctx: TenantContext, input: TaxDeterminationInput): Promise<TaxDeterminationResult> {
  const engine = getTaxEngine("Vertex");

  if (engine) {
    const externalResult = await engine.determineTax(input);
    if (externalResult.taxAmount.gte(0)) {
      return externalResult;  // Use external engine result
    }
  }

  // Fallback to internal rate schedule lookup
  const rate = await prisma.indirectTaxRate.findFirst({
    where: {
      companyId: ctx.companyId,
      jurisdictionCode: input.destinationJurisdiction,
      transactionType: input.transactionType,
    },
  });

  return {
    taxAmount: input.amount.mul(rate?.rate ?? new Prisma.Decimal(0)),
    taxRate: rate?.rate ?? new Prisma.Decimal(0),
    taxType: "VAT",
    jurisdictionCode: input.destinationJurisdiction,
    source: "internal",
  };
}
```

---

## Testing Approach

### Unit Tests

Test each service method in isolation with mocked Prisma:

```typescript
// In src/modules/tax-specialist/__tests__/corporate-tax.test.ts
import { CorporateTaxService } from "../corporate-tax";

describe("CorporateTaxService", () => {
  const ctx = { companyId: "comp_1", userId: "user_1" };

  describe("computeLiability", () => {
    it("should compute tax liability from taxable income and statutory rate", async () => {
      const prisma = mockPrisma({
        taxRate: { findFirst: { rate: new Prisma.Decimal("0.25") } },
        corporateTax: { create: { id: "tax_1", liability: new Prisma.Decimal("250000") } },
      });

      const result = await CorporateTaxService.computeLiability(ctx, {
        jurisdictionCode: "US",
        taxableIncome: new Prisma.Decimal("1000000"),
        fiscalYear: 2026,
      });

      expect(result.liability.toNumber()).toBe(250000);
    });

    it("should apply withholding tax rate for cross-border payments", async () => {
      const prisma = mockPrisma({
        taxRate: { findFirst: { rate: new Prisma.Decimal("0.15") } },
      });

      const result = await CorporateTaxService.computeWithholding(ctx, {
        jurisdictionCode: "US",
        paymentType: "dividend",
        amount: new Prisma.Decimal("500000"),
      });

      expect(result.withholdingAmount.toNumber()).toBe(75000);
    });
  });

  describe("getEffectiveTaxRate", () => {
    it("should reconcile statutory rate to effective rate", async () => {
      const result = await CorporateTaxService.getEffectiveTaxRate(ctx, "US", "2026-Q4");

      expect(result.effectiveRate.toNumber()).toBeLessThan(result.statutoryRate.toNumber());
      expect(result.reconciliation).toHaveLength(6);
    });
  });
});
```

```typescript
// In src/modules/tax-specialist/__tests__/tax-provision.test.ts
describe("TaxProvisionService", () => {
  it("should compute deferred tax from temporary differences", async () => {
    const differences = [
      { type: "depreciation_timing", amount: 200000, isDTA: false, reversalYear: 2027 },
      { type: "accrued_liabilities", amount: 50000, isDTA: true, reversalYear: 2026 },
      { type: "nol_carryforward", amount: 300000, isDTA: true, reversalYear: 2035 },
    ];

    const result = await TaxProvisionService.computeDeferredTax(ctx, "prov_1");

    expect(result.totalDTL.toNumber()).toBeGreaterThan(0);
    expect(result.totalDTA.toNumber()).toBeGreaterThan(0);
    expect(result.netDeferredTax).toBeDefined();
  });

  it("should assess valuation allowance for unrealizable DTAs", async () => {
    const result = await TaxProvisionService.assessValuationAllowance(ctx, "prov_1");

    expect(result.totalAllowance).toBeDefined();
    expect(result.allowancePercentage.toNumber()).toBeGreaterThanOrEqual(0);
    expect(result.allowancePercentage.toNumber()).toBeLessThanOrEqual(100);
  });
});
```

```typescript
// In src/modules/tax-specialist/__tests__/transfer-pricing.test.ts
describe("TransferPricingService", () => {
  it("should apply CUP method with comparable analysis", async () => {
    const result = await TransferPricingService.applyMethod(ctx, "tp_1", "comparable_uncontrolled_price");

    expect(result.method).toBe("comparable_uncontrolled_price");
    expect(result.armLengthRange).toHaveLength(2);
    expect(result.median).toBeDefined();
  });

  it("should compute interquartile range from comparables", async () => {
    const result = await TransferPricingService.getBenchmarking(ctx, "tp_1");

    expect(result.interquartileRange[1].toNumber()).toBeGreaterThan(result.interquartileRange[0].toNumber());
    expect(result.median.toNumber()).toBeGreaterThan(0);
  });
});
```

### Integration Tests

Test through the API layer with full request/response cycle:

```typescript
// In src/app/api/tax/__tests__/dashboard.test.ts
import { GET } from "../dashboard/route";

describe("Tax Dashboard API", () => {
  it("should return aggregate dashboard with liability, provision, risk, and filings", async () => {
    const req = new Request("http://localhost/api/tax/dashboard");
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.liabilityByJurisdiction).toBeDefined();
    expect(data.provisionStatus).toBeDefined();
    expect(data.riskScore).toBeDefined();
    expect(data.filingStatus).toBeDefined();
  });
});
```

```typescript
// In src/app/api/tax/__tests__/provisions.test.ts
describe("Tax Provisions API", () => {
  it("should create a provision with temporary differences", async () => {
    const req = new Request("http://localhost/api/tax/provisions", {
      method: "POST",
      body: JSON.stringify({
        provisionType: "annual",
        fiscalYear: 2026,
        jurisdictionCode: "US",
        temporaryDifferences: [
          { differenceType: "depreciation_timing", amount: 200000, isDTA: false },
        ],
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);
  });
});
```

### End-to-End Tests

Test the full tax workflow:

```typescript
describe("Tax Specialist E2E", () => {
  it("should complete rate → provision → transfer pricing → calendar → risk lifecycle", async () => {
    const ctx = { companyId: "comp_1", userId: "user_1" };

    // 1. Create tax rates for a jurisdiction
    const rate = await CorporateTaxService.createRate(ctx, {
      jurisdictionCode: "US",
      rateType: "statutory",
      rate: 0.25,
      effectiveFrom: new Date("2026-01-01"),
    });

    // 2. Compute corporate tax liability
    const liability = await CorporateTaxService.computeLiability(ctx, {
      jurisdictionCode: "US",
      taxableIncome: 2000000,
      fiscalYear: 2026,
    });

    // 3. Create a tax provision with temporary differences
    const provision = await TaxProvisionService.createProvision(ctx, {
      provisionType: "annual",
      fiscalYear: 2026,
      jurisdictionCode: "US",
    });

    await TaxProvisionService.addTemporaryDifference(ctx, provision.id, {
      differenceType: "depreciation_timing",
      amount: 500000,
      isDTA: false,
      reversalDate: new Date("2028-12-31"),
    });

    // 4. Compute deferred tax
    const deferredTax = await TaxProvisionService.computeDeferredTax(ctx, provision.id);
    expect(deferredTax.totalDTL.toNumber()).toBeGreaterThan(0);

    // 5. Create a transfer pricing study
    const study = await TransferPricingService.createStudy(ctx, {
      studyType: "annual",
      jurisdictionPair: "US-DE",
      armLengthMethod: "transactional_net_margin_method",
    });

    // 6. Add intercompany transactions
    await TransferPricingService.addTransaction(ctx, study.id, {
      transactionType: "services",
      amount: 1000000,
      counterpartyJurisdiction: "DE",
    });

    // 7. Apply method and benchmark
    const methodResult = await TransferPricingService.applyMethod(ctx, study.id, "transactional_net_margin_method");
    expect(methodResult.armLengthRange).toHaveLength(2);

    // 8. Create calendar entry
    const calendarEntry = await TaxCalendarService.createEntry(ctx, {
      returnType: "corporate_income_tax",
      filingType: "original",
      period: "2026",
      dueDate: new Date("2027-06-30"),
    });

    // 9. Compute risk score
    const risk = await TaxRiskService.computeRiskScore(ctx);
    expect(risk.overallScore.toNumber()).toBeGreaterThanOrEqual(0);
    expect(risk.riskDimensions).toHaveProperty("compliance");

    // 10. Generate briefing
    const briefing = await ExecutiveReportingService.generateBriefing(ctx, { briefingType: "quarterly" });
    expect(briefing.sections).toHaveLength(4);

    // Verify lifecycle
    expect(rate.id).toBeDefined();
    expect(liability.liability.toNumber()).toBe(500000);
    expect(provision.status).toBe("draft");
    expect(study.status).toBe("draft");
    expect(calendarEntry.status).toBe("pending");
  });
});
```

### Test File Locations

```
src/modules/tax-specialist/__tests__/
├── corporate-tax.test.ts
├── indirect-tax.test.ts
├── tax-provision.test.ts
├── transfer-pricing.test.ts
├── tax-calendar.test.ts
├── tax-risk.test.ts
├── tax-planning.test.ts
├── executive-reporting.test.ts
└── tax-specialist.test.ts

src/app/api/tax/__tests__/
├── dashboard.test.ts
├── rates.test.ts
├── corporate.test.ts
├── corporate-[id].test.ts
├── indirect.test.ts
├── indirect-returns.test.ts
├── provisions.test.ts
├── provisions-[id].test.ts
├── transfer-pricing.test.ts
├── transfer-pricing-[id].test.ts
├── calendar.test.ts
├── risk.test.ts
├── planning.test.ts
├── briefings.test.ts
└── analytics.test.ts
```

### Running Tests

```bash
pnpm test src/modules/tax-specialist/
pnpm test src/app/api/tax/
pnpm typecheck
```

---

## Extension Checklist

Before shipping any extension, verify:

- [ ] Type union updated in `types.ts`
- [ ] Service method handles the new type (no switch/case that silently drops unknowns)
- [ ] Prisma schema updated if new fields are needed (with migration)
- [ ] Zod validation schema updated in `src/lib/validations/tax-specialist.ts`
- [ ] API endpoint accepts and validates the new type
- [ ] Dashboard/aggregation methods group by the new type correctly
- [ ] Briefing generation includes the new type in relevant sections
- [ ] Unit tests added for the new type's happy path and edge cases
- [ ] Integration test covers the new type through the API
- [ ] Documentation updated (this file + `42-tax-specialist.md`)
- [ ] `pnpm typecheck` passes
- [ ] `pnpm build` passes
- [ ] Security review passed (no new secrets, no tenant isolation bypass, no fabrication)
- [ ] No payment execution introduced (tax payments route through Treasury + Approval Engine)
- [ ] Audit trail captures all mutations to the new entity type
