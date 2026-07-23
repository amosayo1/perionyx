# Enterprise Controller Specialist — Extension Guide

## Overview

This guide explains how to extend the Controller Specialist with new statement types, journal risk types, accounting exception types, close task categories, health scoring dimensions, recommendation generators, and data source integrations.

## Adding New Statement Types

### 1. Add to Type Union

In `src/modules/controller-specialist/types.ts`, add the new type to the `StatementType` union:

```typescript
export type StatementType =
  | "balance_sheet"
  | "income_statement"
  // ... existing types
  | "new_statement_type";
```

### 2. Add to API Validation

In `src/app/api/controller/statements/[type]/route.ts`, add to `VALID_STATEMENT_TYPES`:

```typescript
const VALID_STATEMENT_TYPES: StatementType[] = [
  // ... existing types
  "new_statement_type",
];
```

### 3. Add to Dashboard Evaluations

In `src/modules/controller-specialist/controller-specialist.ts`, update `getStatementReadinessDashboard()` to include the new type in the `statementTypes` array:

```typescript
const statementTypes: StatementType[] = [
  // ... existing types
  "new_statement_type",
];
```

Also update `getCloseCommandCenter()` if the new statement type should appear in the command center readiness evaluation.

### 4. Add Readiness Logic (Optional)

If the new statement type has unique readiness factors, extend `StatementReadinessService.evaluateReadiness()` to query additional data sources. The existing 4-factor weighted score handles most cases:

- `reconciledAccounts` (weight: 0.35)
- `unapprovedJournals` (weight: 0.25)
- `missingAdjustments` (weight: 0.20)
- `outstandingReconciliations` (weight: 0.20)

### 5. Add UI Component

Create a readiness indicator component in `src/components/controller-specialist/` for the new statement type.

## Adding New Journal Risk Types

### 1. Add to Type Union

In `src/modules/controller-specialist/types.ts`, add the new risk type:

```typescript
export type JournalRiskType =
  | "unusual_amount"
  | "duplicate"
  // ... existing types
  | "new_risk_type";
```

### 2. Implement Detection Logic

In `src/modules/controller-specialist/journal-review.ts`, add detection within `assessJournalRisk()`:

```typescript
static async assessJournalRisk(ctx: TenantContext, reviewId: string) {
  // ... existing detection

  // New risk type detection
  if (/* condition */) {
    flags.push({
      riskType: "new_risk_type",
      severity: "MEDIUM", // or appropriate default
      confidence: new Prisma.Decimal(0.7),
      description: `Description of what triggered this risk`,
    });
  }
```

### 3. Add to Flag API

In `src/app/api/controller/journals/[id]/flag/route.ts`, the `riskType` field in the request body already accepts any string from the type union via the `JournalRiskType` type. No API changes needed unless you want to validate the new type explicitly.

### 4. Update Risk Summary (Optional)

If the new risk type should influence the average risk level calculation, no changes are needed — the existing `RISK_SCORE` mapping already handles all severity levels generically.

## Adding New Accounting Exception Types

### 1. Add to Type Union

In `src/modules/controller-specialist/types.ts`, add the new exception type:

```typescript
export type AccountingExceptionType =
  | "journal_anomaly"
  | "duplicate_posting"
  // ... existing types
  | "new_exception_type";
```

### 2. Add Detection (Optional)

If the exception should be auto-detected during health evaluation, extend `AccountingHealthService.captureSnapshot()` or add a new evaluation method:

```typescript
static async evaluateNewExceptionType(ctx: TenantContext) {
  const count = await prisma.accountingException.count({
    where: {
      companyId: ctx.companyId,
      exceptionType: "new_exception_type",
      status: { notIn: ["RESOLVED", "DISMISSED"] },
    },
  });

  return { count };
}
```

### 3. Include in Snapshot

If the exception count should influence the health snapshot, add the count to `captureSnapshot()` and to the `AccountingHealthSnapshot` model fields if needed.

### 4. Add to Exception Stats

Update `ControllerSpecialistService.getExceptionStats()` if the new type should appear in the by-type breakdown — no changes needed if using the existing generic loop, which already handles any exception type dynamically.

## Adding New Close Task Categories

### 1. Add to Type Union

In `src/modules/controller-specialist/types.ts`:

```typescript
export type CloseTaskCategory =
  | "journal"
  | "reconciliation"
  | "approval"
  | "review"
  | "reporting"
  | "closing"
  | "document"
  | "new_category";
```

### 2. Task Behavior

New categories are automatically handled by the existing close management infrastructure:

- Progress calculation counts all categories equally
- Entity and department completion breakdowns work for any category
- Task filtering by `companyId+category` index is already supported

### 3. Add Category-Specific Logic (Optional)

If the new category requires special handling during close (e.g., automatic blocking of dependent tasks, specialized assignment rules), add logic to `CloseManagementService.updateCloseTask()`.

## Customizing Health Scoring

The health score is a weighted composite of 4 dimensions:

```
healthScore = (ledgerConsistency × 0.30)
            + (journalQuality × 0.25)
            + (policyCompliance × 0.25)
            + (postingCompleteness × 0.20)
```

### Adding a New Dimension

#### 1. Add Evaluation Method

In `src/modules/controller-specialist/accounting-health.ts`:

```typescript
static async evaluateNewDimension(ctx: TenantContext) {
  // Query relevant data
  const score = new Prisma.Decimal(/* calculated score */);
  return { score, details: { /* supporting metrics */ } };
}
```

#### 2. Include in Snapshot Calculation

Update `captureSnapshot()` to include the new dimension:

```typescript
static async captureSnapshot(ctx: TenantContext, period: string) {
  const newDimension = await this.evaluateNewDimension(ctx);
  const newWeight = 0.10; // adjust existing weights to sum to 1.0

  const healthScore = integrity.ledgerConsistency
    .mul(0.25) // reduced from 0.30
    .add(journalQuality.qualityScore.mul(0.22))
    .add(policyCompliance.complianceScore.mul(0.22))
    .add(integrity.postingCompleteness.mul(0.18))
    .add(newDimension.score.mul(newWeight))
    .toDecimalPlaces(4);
```

#### 3. Add to Snapshot Model

If the new dimension's score should be persisted, add a field to the `AccountingHealthSnapshot` Prisma model and create a migration.

#### 4. Add to Health Dashboard

Update `ControllerSpecialistService.getAccountingHealthDashboard()` to include the new dimension's data in the response.

### Adjusting Weights

To change the weight distribution without adding new dimensions, modify the multiplication factors in `captureSnapshot()`. Weights must sum to 1.0.

## Customizing Recommendation Generation

### Adding a New Category

#### 1. Add to Type Union

In `src/modules/controller-specialist/types.ts`:

```typescript
export type RecommendationCategory =
  | "close"
  | "journal"
  // ... existing
  | "new_category";
```

#### 2. Implement Generator

Create a method that evaluates conditions and produces recommendations:

```typescript
static async generateNewCategoryRecommendations(
  ctx: TenantContext,
): Promise<RecommendationInput[]> {
  const recs: RecommendationInput[] = [];

  // Evaluate conditions
  if (/* condition */) {
    recs.push({
      category: "new_category",
      title: "Clear, actionable title",
      description: "What should be done",
      businessReason: "Why this matters",
      confidence: new Prisma.Decimal(0.85),
      riskLevel: "MEDIUM",
      evidence: ["Reference to specific records"],
      affectedModules: ["module-name"],
      requiredApprovals: [],
    });
  }

  return recs;
}
```

#### 3. Add Priority Scoring

The existing `calculatePriority()` method in `RecommendationsService` handles any risk level and confidence generically. No changes needed.

### Customizing Priority Formula

To change the priority calculation, modify `RecommendationsService.calculatePriority()`:

```typescript
private static calculatePriority(
  riskLevel: RiskLevel,
  confidence: Prisma.Decimal,
): number {
  // Current: riskScore × 25 × (0.5 + confidence × 0.5)
  // Customize as needed
}
```

## Adding New Data Source Integrations

### 1. Define Data Access Pattern

The Controller Specialist reads from existing deterministic services. To add a new data source:

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

If the new data source should be accessible via a new dashboard or endpoint, add a method to `ControllerSpecialistService`:

```typescript
static async getNewDashboard(ctx: TenantContext) {
  const data = await ThisService.getNewSourceData(ctx);
  return { data };
}
```

### 4. Add API Route

Create a new route in `src/app/api/controller/`:

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

    const data = await ControllerSpecialistService.getNewDashboard(ctx);
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
import { CloseManagementService } from "@/modules/controller-specialist/close-management";

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    closePeriod: {
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
    },
  },
}));

describe("CloseManagementService", () => {
  it("returns empty periods for tenant", async () => {
    const ctx = { companyId: "test-company" };
    const result = await CloseManagementService.getClosePeriods(ctx);
    expect(result.periods).toEqual([]);
    expect(result.total).toBe(0);
  });
});
```

### Integration Tests

Test the full evaluation pipeline:

```typescript
describe("StatementReadiness evaluation", () => {
  it("returns READY when all conditions met", async () => {
    // Seed: all journals approved, all reconciliations complete, no adjustments pending
    // Call: StatementReadinessService.evaluateReadiness(ctx, "2026-07", "balance_sheet")
    // Assert: status === "READY", readinessScore >= 0.95
  });

  it("returns NOT_READY when blocking issues exist", async () => {
    // Seed: unapproved journals, outstanding reconciliations
    // Assert: status === "NOT_READY", blockingIssues.length > 0
  });
});
```

### Health Score Tests

```typescript
describe("AccountingHealthService", () => {
  it("calculates composite score correctly", async () => {
    // Seed: known journal quality, integrity, compliance values
    // Call: captureSnapshot()
    // Assert: healthScore = ledgerConsistency×0.30 + quality×0.25 + compliance×0.25 + posting×0.20
  });

  it("detects duplicate postings", async () => {
    // Seed: accounting exceptions with exceptionType "duplicate_posting"
    // Call: getAccountingExceptions()
    // Assert: duplicates appear in results
  });
});
```

### API Route Tests

```typescript
describe("POST /api/controller/briefings", () => {
  it("generates daily briefing with 8 sections", async () => {
    // Mock auth session
    // Seed: close periods, journals, health snapshots
    // Call: POST with empty body (default to today)
    // Assert: response has sections array with 8 items
  });
});
```

### Risk Assessment Tests

```typescript
describe("JournalReviewService.assessJournalRisk", () => {
  it("detects large journal amounts", async () => {
    // Seed: journal with amount > 100000
    // Call: assessJournalRisk()
    // Assert: flags contain "large" risk type
  });

  it("detects duplicate journals", async () => {
    // Seed: two journals with same amount, account, and date
    // Call: assessJournalRisk()
    // Assert: flags contain "duplicate" risk type
  });

  it("does not flag same risk twice", async () => {
    // Seed: journal already has "large" risk assessment
    // Call: assessJournalRisk()
    // Assert: no new "large" flag created
  });
});
```

### Run Tests

```bash
pnpm test          # Full test suite
pnpm typecheck     # TypeScript strict mode — must pass
pnpm build         # Production build — must pass
```
