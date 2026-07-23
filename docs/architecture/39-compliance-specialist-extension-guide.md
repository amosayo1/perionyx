# Enterprise Compliance Specialist — Extension Guide

## Overview

This guide explains how to extend the Compliance Specialist with new regulatory frameworks, policy categories, violation types, obligation types, filing types, compliance scoring strategies, regulatory intelligence sources, and external tool integrations.

## Prerequisites

- Access to the Perionyx codebase
- Understanding of the Compliance Specialist types (`src/modules/compliance-specialist/types.ts`)
- Prisma schema with the 15 compliance models (in `prisma/schema.prisma`)
- `TenantContext` available for all operations
- RBAC permission `compliance.manage` for configuration changes

---

## Adding New Regulatory Frameworks

### 1. Add to Type Union

In `src/modules/compliance-specialist/types.ts`, add the new framework to the `FrameworkType` union:

```typescript
export type FrameworkType =
  | "sox"
  | "gaap"
  | "ifrs"
  | "basel_iii"
  | "mifid_ii"
  | "gdpr"
  | "ccpa"
  | "aml_kyc"
  | "pci_dss"
  | "iso_27001"
  | "soc_2"
  | "coso"
  | "nist"
  | "hipaa"
  | "fedramp"
  | "dORA"
  | "custom"
  | "cps_234";  // ← new framework (e.g., APRA CPS 234)
```

### 2. Update Zod Validation Schema

In `src/lib/validations/compliance-specialist.ts`, add the new value to the `frameworkType` enum:

```typescript
const frameworkType = z.enum([
  "sox", "gaap", "ifrs", "basel_iii", "mifid_ii", "gdpr", "ccpa",
  "aml_kyc", "pci_dss", "iso_27001", "soc_2", "coso", "nist",
  "hipaa", "fedramp", "dORA", "custom",
  "cps_234",  // ← new
]);
```

### 3. Update Prisma Schema Comment

The `ComplianceFramework.frameworkType` field is a `String` — no migration needed. Update the comment to document the new type:

```prisma
// In prisma/schema.prisma — ComplianceFramework model
frameworkType String /// ifrs | gaap | sox | ... | cps_234 | custom
```

### 4. Register Default Requirements (Optional)

Consider adding a helper that seeds default requirements for the new framework:

```typescript
// In src/modules/compliance-specialist/framework-management.ts
static async seedDefaultRequirements(
  ctx: TenantContext,
  frameworkId: string,
  frameworkType: FrameworkType,
) {
  const defaults = getDefaultRequirementsForFramework(frameworkType);
  for (const req of defaults) {
    await FrameworkManagementService.createRequirement(ctx, {
      frameworkId,
      requirementType: req.type,
      title: req.title,
      description: req.description,
    });
  }
}
```

### 5. Update Navigation Config (Optional)

If the new framework warrants a dedicated navigation entry, add it to `src/components/navigation/nav-config.ts` under the compliance section.

---

## Adding New Policy Categories

### 1. Add to Type Union

In `src/modules/compliance-specialist/types.ts`, add to the `PolicyCategory` union:

```typescript
export type PolicyCategory =
  | "information_security"
  | "data_privacy"
  | "anti_fraud"
  | "aml"
  | "kyc"
  | "conflict_of_interest"
  | "whistleblower"
  | "code_of_conduct"
  | "vendor_management"
  | "business_continuity"
  | "incident_response"
  | "access_control"
  | "change_management"
  | "retention"
  | "ethics"
  | "operational_risk"
  | "environmental_social";  // ← new category (e.g., ESG)
```

### 2. Update Zod Validation Schema

In `src/lib/validations/compliance-specialist.ts`, add to the `policyCategory` enum:

```typescript
const policyCategory = z.enum([
  "information_security", "data_privacy", "anti_fraud", "aml", "kyc",
  "conflict_of_interest", "whistleblower", "code_of_conduct",
  "vendor_management", "business_continuity", "incident_response",
  "access_control", "change_management", "retention", "ethics", "operational_risk",
  "environmental_social",  // ← new
]);
```

### 3. Verify Grouping Works

The `getPolicyCenter()` method groups violations by `policyId` using `prisma.complianceViolation.groupBy()` — no code change needed. The new category will appear in policy listings and filtering automatically.

### 4. Define Default Policies (Optional)

Consider adding default policy templates for the new category:

```typescript
static getDefaultPolicies(category: PolicyCategory): CreatePolicyInput[] {
  const templates: Record<string, CreatePolicyInput[]> = {
    environmental_social: [
      {
        category: "environmental_social",
        title: "ESG Reporting Policy",
        description: "Standards for environmental, social, and governance disclosure",
      },
    ],
  };
  return templates[category] ?? [];
}
```

---

## Adding New Violation Types

### 1. Add to Type Union

In `src/modules/compliance-specialist/types.ts`, add to the `ViolationType` union:

```typescript
export type ViolationType =
  | "regulatory_breach"
  | "policy_violation"
  | "control_failure"
  | "reporting_failure"
  | "disclosure_failure"
  | "data_breach"
  | "unauthorized_access"
  | "conflict_of_interest"
  | "aml_suspicious_activity"
  | "fiduciary_breach"
  | "sanctions_violation";  // ← new type
```

### 2. Update Zod Validation Schema

In `src/lib/validations/compliance-specialist.ts`, add to the `violationType` enum:

```typescript
const violationType = z.enum([
  "regulatory_breach", "policy_violation", "control_failure", "reporting_failure",
  "disclosure_failure", "data_breach", "unauthorized_access", "conflict_of_interest",
  "aml_suspicious_activity", "fiduciary_breach",
  "sanctions_violation",  // ← new
]);
```

### 3. Update Violation Summary Grouping

The `getViolationCenter()` method groups violations by `severity` and `status` using `prisma.complianceViolation.groupBy()` — no code change needed for grouping.

### 4. Define Default Severity Mapping

Consider adding a default severity mapping for the new violation type in the `createViolation()` flow:

```typescript
// In src/modules/compliance-specialist/policy-engine.ts
private static getDefaultSeverity(violationType: ViolationType): ViolationSeverity {
  const severityMap: Record<ViolationType, ViolationSeverity> = {
    regulatory_breach: "high",
    policy_violation: "medium",
    control_failure: "high",
    reporting_failure: "medium",
    disclosure_failure: "high",
    data_breach: "critical",
    unauthorized_access: "critical",
    conflict_of_interest: "medium",
    aml_suspicious_activity: "critical",
    fiduciary_breach: "critical",
    sanctions_violation: "critical",  // ← new
  };
  return severityMap[violationType] ?? "medium";
}
```

---

## Adding New Obligation Types

### 1. Add to Type Union

In `src/modules/compliance-specialist/types.ts`, add to the `ObligationType` union:

```typescript
export type ObligationType =
  | "regulatory"
  | "contractual"
  | "internal_policy"
  | "industry_standard"
  | "legal"
  | "tax"
  | "disclosure"
  | "reporting"
  | "esg_reporting";  // ← new type
```

### 2. Update Zod Validation Schema

In `src/lib/validations/compliance-specialist.ts`, add to the `obligationType` enum:

```typescript
const obligationType = z.enum([
  "regulatory", "contractual", "internal_policy", "industry_standard",
  "legal", "tax", "disclosure", "reporting",
  "esg_reporting",  // ← new
]);
```

### 3. Verify Grouping Works

The `getObligationCenter()` method uses `prisma.complianceObligation.groupBy({ by: ["status"] })` — the new obligation type will appear in listings and filtering automatically without code changes.

---

## Adding New Filing Types

### 1. Add to Type Union

In `src/modules/compliance-specialist/types.ts`, add to the `FilingType` union:

```typescript
export type FilingType =
  | "regulatory_return"
  | "tax_filing"
  | "statutory_return"
  | "disclosure"
  | "notification"
  | "annual_report"
  | "quarterly_report"
  | "sar"
  | "ctr"
  | "suspicious_activity_report"
  | "breach_notification"
  | "board_report"
  | "esg_disclosure";  // ← new type
```

### 2. Update Zod Validation Schema

In `src/lib/validations/compliance-specialist.ts`, add to the `filingType` enum:

```typescript
const filingType = z.enum([
  "regulatory_return", "tax_filing", "statutory_return", "disclosure",
  "notification", "annual_report", "quarterly_report", "sar", "ctr",
  "suspicious_activity_report", "breach_notification", "board_report",
  "esg_disclosure",  // ← new
]);
```

### 3. Verify Filing Lifecycle Works

The `FilingManagementService` methods (`getFilings`, `createFiling`, `updateFilingStatus`, `getLateFilings`, `getUpcomingFilings`) operate on generic `filingType` strings — the new type will work automatically. The `getFilingCenter()` method groups by `status`, not by `filingType`.

---

## Customizing Compliance Scoring

The compliance score is computed in `ComplianceMonitoringService.getComplianceScore()` and `createHealthSnapshot()`. To customize the scoring algorithm:

### 1. Modify the Score Formula

In `src/modules/compliance-specialist/compliance-monitoring.ts`, update `getComplianceScore()`:

```typescript
static async getComplianceScore(ctx: TenantContext) {
  const latestSnapshot = await prisma.complianceHealthSnapshot.findFirst({
    where: { companyId: ctx.companyId },
    orderBy: { snapshotDate: "desc" },
  });

  if (latestSnapshot) {
    return { score: latestSnapshot.overallScore, date: latestSnapshot.snapshotDate };
  }

  // Custom scoring formula
  const [violationCount, criticalCount, policyCount, activePolicies, overdueObligations] =
    await Promise.all([
      prisma.complianceViolation.count({
        where: { companyId: ctx.companyId, status: { notIn: ["remediated", "accepted", "waived"] } },
      }),
      prisma.complianceViolation.count({
        where: { companyId: ctx.companyId, severity: "critical", status: { notIn: ["remediated", "accepted", "waived"] } },
      }),
      prisma.compliancePolicy.count({ where: { companyId: ctx.companyId } }),
      prisma.compliancePolicy.count({
        where: { companyId: ctx.companyId, status: { in: ["active", "approved"] } },
      }),
      prisma.complianceObligation.count({
        where: { companyId: ctx.companyId, status: "overdue" },
      }),
    ]);

  const policyRate = policyCount > 0 ? activePolicies / policyCount : 1;
  const violationPenalty = Math.min(violationCount * 0.05, 0.5);
  const criticalPenalty = criticalCount * 0.1;  // ← extra penalty for critical violations
  const obligationPenalty = Math.min(overdueObligations * 0.02, 0.3);  // ← new factor

  const score = Math.max(0, Math.min(1, policyRate - violationPenalty - criticalPenalty - obligationPenalty));

  return {
    score: new Prisma.Decimal(score).toDecimalPlaces(4),
    date: new Date(),
  };
}
```

### 2. Customize Health Snapshot Scoring

In `createHealthSnapshot()`, update the `overallScore` computation to use custom domain weights:

```typescript
// Weighted average instead of simple average
const weights: Record<string, number> = {
  policy: 0.3,
  violations: 0.3,
  obligations: 0.2,
  filings: 0.2,
};

const weightedScore =
  (policyAdherenceScore.toNumber() * weights.policy) +
  ((1 - Math.min(openViolations * 0.05, 1)) * weights.violations) +
  ((1 - Math.min(overdueObligations * 0.1, 1)) * weights.obligations) +
  ((1 - Math.min(upcomingDeadlines * 0.02, 1)) * weights.filings);

const overallScore = new Prisma.Decimal(weightedScore).toDecimalPlaces(4);
```

### 3. Add Custom Scoring Dimensions

Add new fields to `ComplianceHealthSnapshot` in the Prisma schema to track additional scoring dimensions:

```prisma
model ComplianceHealthSnapshot {
  // ... existing fields ...
  dataProtectionScore  Decimal? @db.Decimal(5, 4)
  cybersecurityScore   Decimal? @db.Decimal(5, 4)
  operationalScore     Decimal? @db.Decimal(5, 4)
}
```

---

## Customizing Regulatory Intelligence Sources

The `RegulatoryIntelligenceService` currently accepts manually created updates. To add automated intelligence sources:

### 1. Create an Intelligence Adapter Interface

```typescript
// In src/modules/compliance-specialist/regulatory-intelligence.ts
export interface RegulatoryIntelligenceSource {
  name: string;
  jurisdiction: string;
  fetchUpdates(): Promise<CreateRegulatoryUpdateInput[]>;
}

export class RegulatoryIntelligenceService {
  private static sources: RegulatoryIntelligenceSource[] = [];

  static registerSource(source: RegulatoryIntelligenceSource) {
    this.sources.push(source);
  }

  static async syncAllSources(ctx: TenantContext) {
    for (const source of this.sources) {
      const updates = await source.fetchUpdates();
      for (const update of updates) {
        // Check for duplicates before creating
        const existing = await prisma.regulatoryUpdate.findFirst({
          where: {
            companyId: ctx.companyId,
            updateTitle: update.title,
            jurisdiction: update.jurisdiction,
          },
        });

        if (!existing) {
          await RegulatoryIntelligenceService.createUpdate(ctx, update);
        }
      }
    }
  }
}
```

### 2. Implement a Source Adapter

```typescript
export class FCARegulatorySource implements RegulatoryIntelligenceSource {
  name = "FCA Regulatory Updates";
  jurisdiction = "UK";

  async fetchUpdates(): Promise<CreateRegulatoryUpdateInput[]> {
    // Fetch from FCA API or RSS feed
    const response = await fetch("https://api.fca.org.uk/regulations");
    const data = await response.json();

    return data.updates.map((u: any) => ({
      updateType: "amendment" as const,
      title: u.title,
      summary: u.summary,
      jurisdiction: "UK",
      sourceUrl: u.url,
      impactLevel: u.priority === "high" ? "high" : "medium",
    }));
  }
}

// Register the source
RegulatoryIntelligenceService.registerSource(new FCARegulatorySource());
```

### 3. Add a Scheduled Sync

Register a queue job to periodically sync intelligence sources:

```typescript
// In your initialization code
scheduleCron("regulatory-intelligence-sync", "0 2 * * *", async () => {
  const companies = await prisma.company.findMany({ where: { status: "active" } });
  for (const company of companies) {
    const ctx = createTenantContext(company.id, "system");
    await RegulatoryIntelligenceService.syncAllSources(ctx);
  }
});
```

---

## Integrating External Compliance Tools

### 1. Define the Integration Interface

```typescript
export interface ComplianceToolIntegration {
  name: string;
  type: "grc" | "eregulatory" | "aml" | "kyc" | "data_protection";

  // Import from external tool
  importFrameworks(ctx: TenantContext): Promise<CreateFrameworkInput[]>;
  importPolicies(ctx: TenantContext): Promise<CreatePolicyInput[]>;
  importViolations(ctx: TenantContext): Promise<CreateViolationInput[]>;

  // Export to external tool
  exportFrameworks(ctx: TenantContext, frameworkIds: string[]): Promise<void>;
  exportViolations(ctx: TenantContext, violationIds: string[]): Promise<void>;
}
```

### 2. Implement the Integration

```typescript
export class OneTrustIntegration implements ComplianceToolIntegration {
  name = "OneTrust";
  type = "data_protection";

  async importFrameworks(ctx: TenantContext): Promise<CreateFrameworkInput[]> {
    const onetrust = new OneTrustClient({ apiKey: process.env.ONETRUST_API_KEY });
    const assessments = await onetrust.getAssessments();

    return assessments.map((a) => ({
      frameworkType: "custom" as const,
      name: a.name,
      description: a.description,
      jurisdiction: a.region,
      effectiveDate: new Date(a.effectiveDate),
    }));
  }

  async exportFrameworks(ctx: TenantContext, frameworkIds: string[]): Promise<void> {
    // Export to OneTrust
  }

  // ... other methods
}
```

### 3. Register the Integration

```typescript
const integrations: ComplianceToolIntegration[] = [
  new OneTrustIntegration(),
  new ServiceNowGRCIntegration(),
];

// Use in import flow
for (const integration of integrations) {
  const frameworks = await integration.importFrameworks(ctx);
  for (const fw of frameworks) {
    await FrameworkManagementService.createFramework(ctx, fw);
  }
}
```

---

## Testing Approach

### Unit Tests

Test each service method in isolation with mocked Prisma:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { FrameworkManagementService } from "./framework-management";
import { prisma } from "@/server/db/prisma";

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    complianceFramework: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe("FrameworkManagementService", () => {
  const mockCtx = { companyId: "test-company", userId: "test-user" };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a framework with auto-generated code", async () => {
    (prisma.complianceFramework.count as any).mockResolvedValue(2);
    (prisma.complianceFramework.create as any).mockResolvedValue({
      id: "fw-1",
      frameworkCode: "FW-0003",
      frameworkType: "sox",
      frameworkName: "SOX Compliance",
    });

    const result = await FrameworkManagementService.createFramework(mockCtx, {
      frameworkType: "sox",
      name: "SOX Compliance",
      description: "Sarbanes-Oxley compliance framework",
    });

    expect(result.frameworkCode).toBe("FW-0003");
    expect(prisma.complianceFramework.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        companyId: "test-company",
        frameworkType: "sox",
        frameworkName: "SOX Compliance",
      }),
    });
  });

  it("should filter frameworks by type", async () => {
    (prisma.complianceFramework.findMany as any).mockResolvedValue([]);
    (prisma.complianceFramework.count as any).mockResolvedValue(0);

    await FrameworkManagementService.getFrameworks(mockCtx, {
      frameworkType: "ifrs",
    });

    expect(prisma.complianceFramework.findMany).toHaveBeenCalledWith({
      where: expect.objectContaining({ frameworkType: "ifrs" }),
      orderBy: { createdAt: "desc" },
      take: 50,
      skip: 0,
    });
  });
});
```

### Integration Tests

Test the full request lifecycle with a test database:

```typescript
describe("Compliance API Integration", () => {
  it("should create framework and retrieve via API", async () => {
    const res = await request(app)
      .post("/api/compliance/frameworks")
      .send({
        frameworkType: "gdpr",
        name: "GDPR Framework",
        description: "EU General Data Protection Regulation",
      });

    expect(res.status).toBe(201);
    expect(res.body.frameworkType).toBe("gdpr");

    const list = await request(app).get("/api/compliance/frameworks");
    expect(list.body.frameworks).toHaveLength(1);
  });
});
```

### Dashboard Integration Tests

Test the dashboard aggregation:

```typescript
describe("ComplianceSpecialistService.getDashboard", () => {
  it("should return empty dashboard for new company", async () => {
    const ctx = { companyId: "new-company", userId: "user-1" };
    const dashboard = await ComplianceSpecialistService.getDashboard(ctx);

    expect(dashboard.overallScore).toEqual(new Prisma.Decimal(1));
    expect(dashboard.activeFrameworks).toBe(0);
    expect(dashboard.openViolations).toBe(0);
    expect(dashboard.overdueObligations).toBe(0);
  });
});
```

### Compliance Score Tests

Verify scoring behavior:

```typescript
describe("ComplianceMonitoringService.getComplianceScore", () => {
  it("should return 1.0 when no violations and all policies active", async () => {
    // Mock: 0 violations, 5 policies, 5 active
    const result = await ComplianceMonitoringService.getComplianceScore(mockCtx);
    expect(result.score.toNumber()).toBe(1);
  });

  it("should penalize for violations", async () => {
    // Mock: 10 violations, 5 policies, 5 active
    const result = await ComplianceMonitoringService.getComplianceScore(mockCtx);
    // violationPenalty = min(10 * 0.05, 0.5) = 0.5
    // score = max(0, min(1, 1 - 0.5)) = 0.5
    expect(result.score.toNumber()).toBe(0.5);
  });
});
```

### Run Tests

```bash
pnpm test -- --filter compliance-specialist
pnpm typecheck
pnpm build
```

---

## Checklist for New Extensions

- [ ] Add type to appropriate union in `types.ts`
- [ ] Add value to Zod schema in `validations/compliance-specialist.ts`
- [ ] Update Prisma schema comment if applicable
- [ ] Verify `groupBy()` queries work with new type (they should, since they group by status/severity)
- [ ] Add default severity mapping if it's a violation type
- [ ] Add default requirements if it's a framework type
- [ ] Add unit tests for new methods
- [ ] Update API documentation if adding new endpoints
- [ ] Run `pnpm typecheck` and `pnpm build`
- [ ] Run `pnpm test`
