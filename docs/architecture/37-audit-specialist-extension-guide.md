# Enterprise Audit Specialist — Extension Guide

## Overview

This guide explains how to extend the Audit Specialist with new control categories, finding types, evidence types, test methods, remediation types, continuous audit rules, readiness scoring, risk assessment dimensions, and external tool integrations.

## Prerequisites

- Access to the Perionyx codebase
- Understanding of the Audit Specialist types (`src/modules/audit-specialist/types.ts`)
- Prisma schema with the 15 audit models (in `prisma/schema.prisma`)
- `TenantContext` available for all operations
- RBAC permission `audit.admin` for configuration changes

---

## Adding New Control Categories

### 1. Add to Type Union

In `src/modules/audit-specialist/types.ts`, add the new category to the `ControlCategory` union:

```typescript
export type ControlCategory =
  | "authorization"
  | "segregation_of_duties"
  | "reconciliation"
  | "review"
  | "physical"
  | "it_general"
  | "it_application"
  | "disclosure"
  | "reporting"
  | "compliance"
  | "data_integrity";  // ← new category
```

### 2. Update the Prisma Schema

The `AuditControl.category` field is a `String` — no schema migration needed. However, if you want database-level validation, add an enum constraint:

```prisma
// In prisma/schema.prisma — AuditControl model
category String @default("approval")
// Consider adding a comment documenting the new category:
/// "approval" | "posting" | ... | "data_integrity"
```

### 3. Register Default Controls

In `src/modules/audit-specialist/control-monitoring.ts`, consider adding a helper that seeds default controls for the new category:

```typescript
static async seedDefaultControls(ctx: TenantContext, category: ControlCategory) {
  const defaults = getDefaultControlsForCategory(category);
  for (const ctrl of defaults) {
    await this.createControl(ctx, {
      controlName: ctrl.name,
      controlDescription: ctrl.description,
      controlType: ctrl.type,
      controlCategory: category,
      frequency: ctrl.frequency,
      owner: ctrl.owner,
    });
  }
}
```

### 4. Update Failure Heatmap

The `getControlFailureHeatmap()` method automatically groups failures by `control.category` — no changes needed as long as the new category is used in `AuditControl.category` values.

---

## Adding New Finding Types

### 1. Add to Type Union

In `src/modules/audit-specialist/types.ts`, add to the `FindingType` union:

```typescript
export type FindingType =
  | "control_deficiency"
  | "significant_deficiency"
  | "material_weakness"
  | "observation"
  | "best_practice"
  | "exception"
  | "data_quality_issue";  // ← new type
```

### 2. Update Finding Summary Grouping

The `FindingsService.getFindingSummary()` method groups findings by `findingType` using an in-memory `Record<string, number>` — no code change needed. The new type will appear in the `byType` map automatically.

### 3. Define Default Severity Mapping

Consider adding a default severity mapping for the new finding type in the findings creation flow:

```typescript
const DEFAULT_SEVERITY_BY_TYPE: Record<FindingType, FindingSeverity> = {
  control_deficiency: "medium",
  significant_deficiency: "high",
  material_weakness: "critical",
  observation: "low",
  best_practice: "informational",
  exception: "medium",
  data_quality_issue: "medium",  // ← new mapping
};
```

### 4. Update Repeat Finding Detection

The `getRepeatFindings()` method groups by normalized title — no changes needed. The new finding type will be detected automatically if multiple findings share the same title.

---

## Adding New Evidence Types

### 1. Add to Type Union

In `src/modules/audit-specialist/types.ts`, add to the `EvidenceType` union:

```typescript
export type EvidenceType =
  | "document"
  | "screenshot"
  | "email"
  | "report"
  | "spreadsheet"
  | "system_output"
  | "policy"
  | "procedure"
  | "log"
  | "confirmation"
  | "api_response";  // ← new type
```

### 2. Update Evidence Collection

The `EvidenceManagementService.addFindingEvidence()` method accepts any `EvidenceType` — no changes needed. The `evidenceType` is stored directly in `FindingEvidence.evidenceType`.

### 3. Define Verification Rules (Optional)

If the new evidence type requires specific verification logic, extend the evidence verification flow:

```typescript
const VERIFICATION_RULES: Record<EvidenceType, VerificationRule> = {
  document: { requiredFields: ["title", "description"], autoVerify: false },
  screenshot: { requiredFields: ["title", "documentUrl"], autoVerify: false },
  api_response: { requiredFields: ["title", "source"], autoVerify: true },
  // ...
};
```

### 4. Update Evidence Package Assembly

The `assemblePackage()` method checks `evidenceCount > 0` — no changes needed for new evidence types. Evidence items of any type are included in packages via the `evidenceItems` JSON array.

---

## Adding New Test Methods

### 1. Add to Type Union

In `src/modules/audit-specialist/types.ts`, add to the `TestMethod` union:

```typescript
export type TestMethod =
  | "sampling"
  | "full_population"
  | "automated"
  | "hybrid"
  | "manual"
  | "data_analytics";  // ← new method
```

### 2. Update Test Creation

The `ControlMonitoringService.createTest()` method accepts any `TestMethod` — no changes needed. The `testMethod` is stored directly in `ControlTest.testMethod`.

### 3. Define Method-Specific Logic (Optional)

If the new method requires specific sample size calculation or result interpretation, add a method handler:

```typescript
const TEST_METHOD_CONFIG: Record<TestMethod, { defaultSampleSize: number | null; requiresManualReview: boolean }> = {
  sampling: { defaultSampleSize: 25, requiresManualReview: false },
  full_population: { defaultSampleSize: null, requiresManualReview: false },
  automated: { defaultSampleSize: null, requiresManualReview: false },
  hybrid: { defaultSampleSize: 25, requiresManualReview: true },
  manual: { defaultSampleSize: null, requiresManualReview: true },
  data_analytics: { defaultSampleSize: null, requiresManualReview: false },
};
```

---

## Adding New Remediation Types

### 1. Add to Type Union

In `src/modules/audit-specialist/types.ts`, add to the `RemediationType` union:

```typescript
export type RemediationType =
  | "immediate"
  | "short_term"
  | "long_term"
  | "strategic"
  | "workaround"
  | "process_redesign";  // ← new type
```

### 2. Update Remediation Plan Creation

The `RemediationService.createPlan()` method accepts any `RemediationType` — no changes needed. The `remediationType` is stored directly in `RemediationPlan.remediationType`.

### 3. Define Default Target Dates (Optional)

If the new type has standard SLA expectations, add a default target date calculator:

```typescript
const REMEDIATION_SLA_DAYS: Record<RemediationType, number> = {
  immediate: 1,
  short_term: 30,
  long_term: 90,
  strategic: 180,
  workaround: 14,
  process_redesign: 120,  // ← new SLA
};

function getDefaultTargetDate(type: RemediationType): Date {
  const days = REMEDIATION_SLA_DAYS[type] ?? 30;
  const target = new Date();
  target.setDate(target.getDate() + days);
  return target;
}
```

### 4. Update Velocity Calculation

The `RemediationService.getRemediationVelocity()` method groups by `status` — no changes needed for new `RemediationType` values. Velocity is computed from status transitions, not type.

---

## Customizing Continuous Audit Rules

The Continuous Audit Engine (`continuous-audit.ts`) runs 5 scans. To add a new scan type:

### 1. Define the Record Type

In `src/modules/audit-specialist/types.ts`, add a new interface:

```typescript
export interface DuplicatePaymentRecord {
  transactionId: string;
  referenceNumber: string;
  amount: Prisma.Decimal;
  originalTransactionId: string;
  similarityScore: Prisma.Decimal;
  detectedAt: Date;
}
```

### 2. Add to ContinuousAuditResult

```typescript
export interface ContinuousAuditResult {
  runDate: Date;
  controlFailures: ControlFailureRecord[];
  missingApprovals: MissingApprovalRecord[];
  lateReconciliations: LateReconciliationRecord[];
  highRiskEvents: HighRiskEventRecord[];
  unusualBehavior: UnusualBehaviorRecord[];
  duplicatePayments: DuplicatePaymentRecord[];  // ← new scan
  overallScore: Prisma.Decimal;
}
```

### 3. Implement the Scanner

In `src/modules/audit-specialist/continuous-audit.ts`:

```typescript
static async getDuplicatePayments(
  ctx: TenantContext,
): Promise<DuplicatePaymentRecord[]> {
  const recentTransactions = await prisma.transaction.findMany({
    where: {
      companyId: ctx.companyId,
      createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    },
    orderBy: { primaryAmount: "desc" },
    take: 200,
  });

  // Group by amount + type to detect potential duplicates
  const bySignature: Record<string, typeof recentTransactions> = {};
  for (const t of recentTransactions) {
    const sig = `${t.type}-${t.primaryAmount.toString()}`;
    if (!bySignature[sig]) bySignature[sig] = [];
    bySignature[sig].push(t);
  }

  return Object.values(bySignature)
    .filter(group => group.length > 1)
    .flat()
    .map(t => ({
      transactionId: t.id,
      referenceNumber: t.reference ?? "",
      amount: t.primaryAmount,
      originalTransactionId: t.id,
      similarityScore: new Prisma.Decimal(1),
      detectedAt: new Date(),
    }));
}
```

### 4. Wire Into the Scan

In `runContinuousAudit()`:

```typescript
const [controlFailures, missingApprovals, lateReconciliations,
  highRiskEvents, unusualBehavior, duplicatePayments] = await Promise.all([
  this.getControlFailures(ctx),
  this.getMissingApprovals(ctx),
  this.getLateReconciliations(ctx),
  this.getHighRiskEvents(ctx),
  this.getUnusualBehavior(ctx),
  this.getDuplicatePayments(ctx),  // ← new scan
]);
```

### 5. Update Score Calculation

```typescript
const issueCount = controlFailures.length + missingApprovals.length
  + lateReconciliations.length + highRiskEvents.length
  + unusualBehavior.length + duplicatePayments.length;  // ← include new scan
```

---

## Customizing Readiness Scoring

### 1. Add a New Domain

In the Prisma schema, add a new score field to `AuditReadinessSnapshot`:

```prisma
model AuditReadinessSnapshot {
  // ... existing fields ...
  dataGovernanceScore   Decimal @db.Decimal(5, 4)  // ← new domain
}
```

Run migration:
```bash
npx prisma migrate dev --name add_data_governance_readiness
```

### 2. Update Snapshot Creation

In `src/modules/audit-specialist/audit-readiness.ts`, update `createSnapshot()`:

```typescript
return prisma.auditReadinessSnapshot.create({
  data: {
    // ... existing fields ...
    dataGovernanceScore: new Prisma.Decimal(domainScores["data_governance"] ?? 0),
  },
});
```

### 3. Update Summary

In `getReadinessSummary()`, add the new domain to the scores map:

```typescript
const domainScores: Record<string, Prisma.Decimal> = {
  // ... existing domains ...
  data_governance: latestSnapshot.dataGovernanceScore,
};
```

### 4. Add Gap Detection

In `identifyGaps()`, add a new gap check:

```typescript
const dataGovernanceIssues = await prisma.dataQualityIssue.count({
  where: { companyId: ctx.companyId, severity: { in: ["high", "critical"] } },
});

if (dataGovernanceIssues > 5) {
  gaps.push({
    domain: "Data Governance",
    description: `${dataGovernanceIssues} high/critical data quality issues detected.`,
    severity: "high",
    recommendation: "Remediate data quality issues before the audit.",
  });
}
```

### 5. Update Overall Score Calculation

The overall readiness score is stored directly as `overallScore` in the snapshot. When creating snapshots, compute it from all domain scores:

```typescript
const allScores = [financialStatementsScore, documentsScore, evidenceCompletenessScore,
  policyComplianceScore, workflowCompletionScore, dataGovernanceScore];
const overallScore = allScores.reduce((sum, s) => sum.add(s), new Prisma.Decimal(0))
  .div(allScores.length).toDecimalPlaces(4);
```

---

## Customizing Risk Assessment

### 1. Add a New Risk Type

In `src/modules/audit-specialist/types.ts`:

```typescript
export type RiskAssessmentType =
  | "enterprise"
  | "financial"
  | "operational"
  | "compliance"
  | "it"
  | "fraud"
  | "strategic"
  | "vendor"
  | "cybersecurity";  // ← new type
```

### 2. Add Risk Factor Sources

The `AuditRiskService.createAssessment()` method accepts arbitrary `riskFactors` — no changes needed. New risk types can use any combination of factors.

### 3. Customize High-Risk Area Scoring

The `getHighRiskAreas()` method computes scores from finding counts and control gaps. To add new risk signals:

```typescript
// In getHighRiskAreas(), after the existing scoring:
const cyberRiskEvents = await prisma.auditLog.count({
  where: {
    companyId: ctx.companyId,
    action: { in: ["unauthorized_access", "data_breach", "privilege_escalation"] },
  },
});

// Add cyber risk to area scores
for (const area of Object.values(areaMap)) {
  if (area.area === "it_general" || area.area === "it_application") {
    area.score = area.score.add(new Prisma.Decimal(cyberRiskEvents * 3));
  }
}
```

### 4. Customize Risk Trend Detection

The `getAuditRiskSummary()` method compares the two most recent trend data points. To add more sophisticated trend analysis:

```typescript
// In getAuditRiskSummary(), after trend detection:
if (trends.length >= 7) {
  const recentAvg = trends.slice(-7).reduce((s, t) => s.add(t.riskScore), new Prisma.Decimal(0)).div(7);
  const priorAvg = trends.slice(-14, -7).reduce((s, t) => s.add(t.riskScore), new Prisma.Decimal(0)).div(7);
  // Use 7-day moving averages for more stable trend detection
}
```

---

## Integrating with External Audit Tools

### 1. Define the Integration Interface

```typescript
interface ExternalAuditToolAdapter {
  name: string;
  exportFindings(findings: AuditFinding[]): Promise<ExportResult>;
  importControls(controls: AuditControl[]): Promise<ImportResult>;
  syncRemediationStatus(plans: RemediationPlan[]): Promise<SyncResult>;
  healthCheck(): Promise<boolean>;
}
```

### 2. Implement the Adapter

```typescript
class SAPGRCAdapter implements ExternalAuditToolAdapter {
  name = "SAP GRC";

  async exportFindings(findings: AuditFinding[]): Promise<ExportResult> {
    const payload = findings.map(f => ({
      id: f.findingNumber,
      title: f.title,
      severity: mapSeverityToSAP(f.severity),
      status: mapStatusToSAP(f.status),
      controlId: f.controlId,
    }));

    const response = await fetch(this.apiUrl + "/findings/import", {
      method: "POST",
      headers: { "Authorization": `Bearer ${this.apiKey}` },
      body: JSON.stringify(payload),
    });

    return { success: response.ok, exportedCount: findings.length };
  }

  async importControls(controls: AuditControl[]): Promise<ImportResult> {
    // Pull controls from external system
    const response = await fetch(this.apiUrl + "/controls", {
      headers: { "Authorization": `Bearer ${this.apiKey}` },
    });

    const data = await response.json();
    // Map and create controls...
    return { success: true, importedCount: data.length };
  }

  async syncRemediationStatus(plans: RemediationPlan[]): Promise<SyncResult> {
    // Push remediation status updates
    return { success: true, syncedCount: plans.length };
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
const externalAdapters: Map<string, ExternalAuditToolAdapter> = new Map();

export function registerExternalAuditTool(adapter: ExternalAuditToolAdapter) {
  externalAdapters.set(adapter.name, adapter);
}

export function getExternalAuditTool(name: string): ExternalAuditToolAdapter | undefined {
  return externalAdapters.get(name);
}
```

### 4. Add Sync API Endpoints

```typescript
// src/app/api/audit/external-sync/route.ts
export async function POST(req: Request) {
  const session = await auth();
  const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

  const body = await parseJsonBody<{ toolName: string; direction: "export" | "import" | "sync" }>(req);

  const adapter = getExternalAuditTool(body.toolName);
  if (!adapter) {
    return NextResponse.json({ error: `Unknown tool: ${body.toolName}` }, { status: 404 });
  }

  let result;
  switch (body.direction) {
    case "export":
      const findings = await FindingsService.getFindings(ctx);
      result = await adapter.exportFindings(findings.findings);
      break;
    case "import":
      const controls = await ControlMonitoringService.getControls(ctx);
      result = await adapter.importControls(controls.controls);
      break;
    case "sync":
      const plans = await RemediationService.getRemediationPlans(ctx);
      result = await adapter.syncRemediationStatus(plans.plans);
      break;
  }

  return NextResponse.json(result);
}
```

### 5. Common External Tool Mappings

| Perionyx Type | SAP GRC | Archer | MetricStream |
|---|---|---|---|
| `control_deficiency` | Finding (Deficiency) | Issue | Observation |
| `material_weakness` | Finding (Material) | Critical Issue | Critical Finding |
| `critical` | Severity 1 | Critical | Critical |
| `high` | Severity 2 | High | High |
| `active` | Control Active | Effective | Implemented |
| `completed` | Remediation Done | Closed | Resolved |

---

## Testing Approach

### Unit Tests

Test each service method in isolation with mocked Prisma:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ContinuousAuditService } from "@/modules/audit-specialist/continuous-audit";

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    controlTest: { findMany: vi.fn() },
    transactionApproval: { findMany: vi.fn() },
    reconciliationCase: { findMany: vi.fn() },
    transaction: { findMany: vi.fn() },
    auditLog: { findMany: vi.fn() },
  },
}));

describe("ContinuousAuditService", () => {
  const mockCtx = { companyId: "comp_1", userId: "user_1" };

  beforeEach(() => vi.clearAllMocks());

  it("should detect control failures", async () => {
    const prisma = await import("@/server/db/prisma");
    vi.mocked(prisma.prisma.controlTest.findMany).mockResolvedValue([
      { id: "ct1", controlId: "ctrl1", result: "ineffective", createdAt: new Date(), control: { controlName: "Approval Control" } },
    ] as any);

    const failures = await ContinuousAuditService.getControlFailures(mockCtx);
    expect(failures).toHaveLength(1);
    expect(failures[0].controlName).toBe("Approval Control");
    expect(failures[0].failureCount).toBe(1);
  });

  it("should compute overall score with penalty per issue", async () => {
    const result = await ContinuousAuditService.runContinuousAudit(mockCtx);
    // score = 1 - (issueCount × 0.02), clamped to ≥ 0
    expect(result.overallScore.toNumber()).toBeGreaterThanOrEqual(0);
    expect(result.overallScore.toNumber()).toBeLessThanOrEqual(1);
  });
});
```

### Integration Tests

Test the API routes with mocked auth:

```typescript
import { describe, it, expect, vi } from "vitest";
import { GET } from "@/app/api/audit/dashboard/route";

vi.mock("@/server/auth/auth", () => ({
  auth: () => Promise.resolve({ user: { id: "user_1", activeCompanyId: "comp_1", companyRole: "ADMIN" } }),
}));

describe("GET /api/audit/dashboard", () => {
  it("should return dashboard data", async () => {
    const req = new Request("http://localhost/api/audit/dashboard");
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("plans");
  });
});
```

### End-to-End Tests

Test the full audit workflow:

```typescript
describe("Audit Specialist E2E", () => {
  it("should complete control → test → finding → remediation lifecycle", async () => {
    // 1. Create a control
    const control = await ControlMonitoringService.createControl(ctx, {
      controlName: "Payment Authorization",
      controlDescription: "All payments > $10K require manager approval",
      controlType: "preventive",
      controlCategory: "authorization",
      frequency: "daily",
    });

    // 2. Create and execute a test
    const test = await ControlMonitoringService.createTest(ctx, {
      controlId: control.id,
      testType: "operating_effectiveness",
      testMethod: "sampling",
      description: "Test payment authorization for Q1",
      sampleSize: 25,
    });

    // 3. Create a finding linked to the control
    const finding = await FindingsService.createFinding(ctx, {
      findingType: "control_deficiency",
      severity: "high",
      title: "Payment authorization bypass detected",
      description: "3 of 25 sampled payments exceeded threshold without approval",
      controlId: control.id,
    });

    // 4. Add evidence to the finding
    const evidence = await EvidenceManagementService.addFindingEvidence(ctx, finding.id, {
      evidenceType: "report",
      title: "Q1 Payment Authorization Test Results",
      description: "25 sampled transactions, 3 exceptions noted",
    });

    // 5. Create a remediation plan
    const plan = await RemediationService.createPlan(ctx, {
      findingId: finding.id,
      title: "Strengthen payment authorization controls",
      description: "Implement automated threshold check",
      remediationType: "short_term",
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    // 6. Verify the lifecycle
    expect(control.id).toBeDefined();
    expect(finding.status).toBe("open");
    expect(evidence.immutable).toBe(true);
    expect(plan.status).toBe("proposed");
  });
});
```

### Test File Locations

```
src/modules/audit-specialist/__tests__/
├── continuous-audit.test.ts
├── control-monitoring.test.ts
├── findings.test.ts
├── evidence-management.test.ts
├── remediation.test.ts
├── audit-readiness.test.ts
├── audit-risk.test.ts
├── audit-planning.test.ts
└── audit-specialist.test.ts

src/app/api/audit/__tests__/
├── dashboard.test.ts
├── controls.test.ts
├── findings.test.ts
├── evidence-packages.test.ts
├── remediation.test.ts
├── readiness.test.ts
├── risk-assessments.test.ts
├── plans.test.ts
├── engagements.test.ts
├── calendar.test.ts
├── reports.test.ts
├── continuous-audit.test.ts
├── analytics.test.ts
└── controls-heatmap.test.ts
```

### Running Tests

```bash
pnpm test src/modules/audit-specialist/
pnpm test src/app/api/audit/
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
- [ ] Unit tests added for the new type's happy path and edge cases
- [ ] Integration test covers the new type through the API
- [ ] Documentation updated (this file + `36-audit-specialist.md`)
- [ ] `pnpm typecheck` passes
- [ ] `pnpm build` passes
- [ ] Security review passed (no new secrets, no tenant isolation bypass, no evidence fabrication)
