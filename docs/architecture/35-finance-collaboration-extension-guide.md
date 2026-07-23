# Enterprise Finance Collaboration Platform — Extension Guide

## Overview

This guide explains how to extend the Finance Collaboration Platform with new case types, evidence types, timeline event types, memory types, decision types, assignment rules, workload calculations, analytics metrics, specialist integrations, and collaboration patterns.

## Prerequisites

- Access to the Perionyx codebase
- Understanding of the Collaboration Platform types (`src/modules/collaboration/types.ts`)
- Prisma schema with the 15 collaboration models (already in `prisma/schema.prisma`)
- `TenantContext` available for all operations
- RBAC permission `collaboration.admin` for configuration changes

---

## Adding New Case Types

### 1. Add to Type Union

In `src/modules/collaboration/types.ts`, add the new type to the `CaseType` union:

```typescript
export type CaseType =
  | "month_end_close"
  | "bank_reconciliation"
  | "liquidity_risk"
  | "journal_investigation"
  | "fraud_investigation"
  | "treasury_exception"
  | "audit_finding"
  | "compliance_issue"
  | "cash_forecast"
  | "policy_violation"
  | "general"
  | "intercompany_settlement";  // ← new type
```

### 2. Register Assignment Rules

In `src/modules/collaboration/assignment-engine.ts`, add default assignment rules for the new case type:

```typescript
const DEFAULT_ASSIGNMENT_RULES: Record<CaseType, AssignmentRule> = {
  // ... existing rules ...
  intercompany_settlement: {
    caseType: "intercompany_settlement",
    primaryRole: ["controller", "treasury_specialist"],
    secondaryRole: ["cfo_advisor"],
    escalationChain: ["cfo_advisor"],
    maxWorkloadPerSpecialist: 5,
    requiresApprovalAbove: "MEDIUM",
    slaHours: 48,
    businessHoursOnly: true,
  },
};
```

### 3. Define Default Task Templates

In `src/modules/collaboration/case-templates.ts`, add a default task chain for the new case type:

```typescript
const DEFAULT_TEMPLATES: Record<CaseType, CaseTemplateDefinition> = {
  // ... existing templates ...
  intercompany_settlement: {
    caseType: "intercompany_settlement",
    defaultTasks: [
      {
        title: "Collect intercompany balances",
        description: "Gather all intercompany receivable and payable balances from GL",
        requiredEvidence: ["financial_data"],
        estimatedHours: 2,
      },
      {
        title: "Identify netting opportunities",
        description: "Analyze bilateral positions for netting potential",
        dependsOnPrevious: true,
        requiredEvidence: ["analysis"],
        estimatedHours: 3,
      },
      {
        title: "Validate settlement amounts",
        description: "Cross-check settlement amounts against source records",
        dependsOnPrevious: true,
        requiredEvidence: ["system_record"],
        estimatedHours: 1,
      },
      {
        title: "Prepare settlement recommendation",
        description: "Draft recommendation with full evidence chain",
        dependsOnPrevious: true,
        requiredEvidence: ["analysis", "financial_data"],
        estimatedHours: 2,
      },
    ],
    requiredEvidenceTypes: ["financial_data", "system_record"],
    escalationSLAHours: 24,
  },
};
```

### 4. Add to Case State Configuration (Optional)

If the new case type needs custom state transitions beyond the default state machine, configure in `src/modules/collaboration/case-state-machine.ts`:

```typescript
const CUSTOM_TRANSITIONS: Partial<Record<CaseType, Partial<Record<CaseStatus, CaseStatus[]>>>> = {
  intercompany_settlement: {
    // Custom: allow direct skip to PENDING_REVIEW from IN_PROGRESS
    // for simple netting cases
    IN_PROGRESS: ["PENDING_REVIEW", "ON_HOLD", "ESCALATED"],
  },
};
```

### 5. Add to SLA Configuration

In `src/modules/collaboration/sla-manager.ts`, register SLA thresholds:

```typescript
const SLA_CONFIGURATIONS: Record<CaseType, SLAConfig> = {
  // ... existing configs ...
  intercompany_settlement: {
    warningThresholdPercent: 75,
    breachThresholdPercent: 100,
    escalationOnBreach: true,
    businessHoursOnly: true,
    holidays: [], // inherit company holidays
  },
};
```

### 6. Add to Collaboration Analytics

In `src/modules/collaboration/analytics.service.ts`, add metric tracking for the new case type:

```typescript
// The analytics service automatically tracks metrics for all case types
// in the CaseTimeline and CollaborationMetric models.
// No code changes needed unless you want custom metrics.

// For custom metrics, add to the metric computation:
if (caseType === "intercompany_settlement") {
  // Track netting ratio as custom metric
  await this.recordCustomMetric(companyId, "netting_ratio", netAmount / grossAmount, period);
}
```

---

## Adding New Evidence Types

### 1. Add to Type Union

In `src/modules/collaboration/types.ts`:

```typescript
export type EvidenceType =
  | "financial_data"
  | "document"
  | "analysis"
  | "policy_reference"
  | "system_record"
  | "external_data"
  | "audit_trail"
  | "conversation"
  | "ai_insight"
  | "visual_evidence"
  | "regulatory_filing";  // ← new type
```

### 2. Add Deduplication Strategy (Optional)

If the new evidence type needs custom deduplication beyond content hashing, extend `src/modules/collaboration/evidence-center.ts`:

```typescript
// Default: SHA-256 content hash handles deduplication for all types.
// For types that need semantic deduplication (e.g., regulatory filings
// from different sources covering the same regulation), add custom logic:

static async checkDuplicate(evidence: NewEvidence): Promise<EvidenceDuplicateResult> {
  // Default content hash check
  const hashMatch = await prisma.caseEvidence.findFirst({
    where: { companyId: evidence.companyId, contentHash: evidence.contentHash },
  });
  if (hashMatch) return { isDuplicate: true, existingEvidenceId: hashMatch.id };

  // Custom semantic check for regulatory filings
  if (evidence.type === "regulatory_filing") {
    const semanticMatch = await this.findSemanticDuplicate(evidence);
    if (semanticMatch) return { isDuplicate: true, existingEvidenceId: semanticMatch.id, similarity: semanticMatch.score };
  }

  return { isDuplicate: false };
}
```

### 3. Add Access Controls (Optional)

If the new evidence type has special access rules beyond the standard RBAC model, extend the evidence access layer:

```typescript
// In src/modules/collaboration/evidence-center.ts
static canAccess(evidence: Evidence, user: SpecialistContext): boolean {
  // Standard RBAC check first
  if (!this.standardAccessCheck(evidence, user)) return false;

  // Custom: regulatory filings may have restricted access
  if (evidence.type === "regulatory_filing" && user.role !== "compliance" && user.role !== "audit") {
    // Only compliance and audit specialists can view regulatory filings
    // unless they are assigned to the case
    return this.isAssignedToCase(evidence.caseId, user.id);
  }

  return true;
}
```

### 4. Add UI Badge

Update the evidence display component in `src/components/collaboration/` to handle the new type with an appropriate icon and color badge.

---

## Adding New Timeline Event Types

### 1. Add to Type Union

In `src/modules/collaboration/types.ts`:

```typescript
export type TimelineEventType =
  | "case_opened"
  | "case_assigned"
  | "case_reassigned"
  | "case_escalated"
  | "case_hold"
  | "case_resolved"
  | "case_closed"
  | "case_reopened"
  | "task_created"
  | "task_completed"
  | "evidence_attached"
  | "decision_recorded"
  | "comment_added"
  | "specialist_joined";  // ← new type
```

### 2. Add Event Handler

In `src/modules/collaboration/timeline.ts`, register the event handler:

```typescript
static async recordEvent(
  caseId: string,
  eventType: TimelineEventType,
  payload: TimelineEventPayload,
  recordedBy: string,
): Promise<void> {
  // Get next sequence number
  const lastEvent = await prisma.caseTimeline.findFirst({
    where: { caseId },
    orderBy: { eventOrder: "desc" },
  });

  await prisma.caseTimeline.create({
    data: {
      caseId,
      eventType,
      eventOrder: (lastEvent?.eventOrder ?? 0) + 1,
      payload: JSON.stringify(payload),
      recordedBy,
      companyId: payload.companyId,
      occurredAt: new Date(),
    },
  });

  // Type-specific side effects
  if (eventType === "specialist_joined") {
    await this.onSpecialistJoined(caseId, payload);
  }
}
```

### 3. Add Timeline Filter Support

In the timeline query API (`src/app/api/collaboration/cases/[id]/timeline/route.ts`), add the new event type to the filter enum:

```typescript
const timelineQuerySchema = z.object({
  eventType: z.enum([
    // ... existing types ...
    "specialist_joined",
  ]).optional(),
});
```

### 4. Add to UI Event Display

Update the timeline rendering component to display the new event type with appropriate formatting and icon.

---

## Adding New Memory Types

### 1. Add to Type Union

In `src/modules/collaboration/types.ts`:

```typescript
export type MemoryType =
  | "case_resolution"
  | "pattern"
  | "specialist_preference"
  | "organizational"
  | "risk_signal"
  | "resolution_template"
  | "regulatory_guidance";  // ← new type
```

### 2. Configure Decay Policy

In `src/modules/collaboration/enterprise-memory.ts`, set the decay halflife for the new type:

```typescript
const DECAY_CONFIG: Record<MemoryType, { halflifeDays: number; maxAge: number }> = {
  // ... existing configs ...
  regulatory_guidance: {
    halflifeDays: 180,  // Regulatory guidance stays relevant longer
    maxAge: 730,        // 2 years before archival
  },
};
```

### 3. Add Ingestion Logic (Optional)

If the new memory type should be automatically created from specific events, add an ingestion hook:

```typescript
// In src/modules/collaboration/enterprise-memory.ts
static async onCaseResolved(caseId: string, resolution: CaseResolution): Promise<void> {
  // Existing: create case_resolution memory

  // New: if resolution involved regulatory guidance, create regulatory_guidance memory
  if (resolution.evidenceTypes.includes("regulatory_filing")) {
    await this.storeMemory({
      companyId: resolution.companyId,
      memoryType: "regulatory_guidance",
      content: resolution.summary,
      keywords: resolution.tags,
      sourceCaseId: caseId,
      sourceSpecialistId: resolution.resolvedBy,
      relevanceScore: 0.8,
      metadata: {
        regulation: resolution.metadata.regulation,
        jurisdiction: resolution.metadata.jurisdiction,
      },
    });
  }
}
```

### 4. Add Retrieval Scoring (Optional)

If the new memory type needs custom relevance scoring, extend the retrieval algorithm:

```typescript
// In src/modules/collaboration/enterprise-memory.ts
static calculateRelevance(memory: EnterpriseMemory, context: CaseContext): number {
  const baseScore = this.baseRelevanceScore(memory);

  // Boost regulatory guidance memories when case involves compliance
  if (memory.memoryType === "regulatory_guidance" && context.caseType === "compliance_issue") {
    return Math.min(1.0, baseScore * 1.5);
  }

  return baseScore;
}
```

---

## Adding New Decision Types

### 1. Add to Type Union

In `src/modules/collaboration/types.ts`:

```typescript
export type DecisionType =
  | "resolution"
  | "policy_exception"
  | "financial_adjustment"
  | "escalation"
  | "resource_allocation";  // ← new type
```

### 2. Configure Approval Chain

In `src/modules/collaboration/decision-registry.ts`, define approval requirements:

```typescript
const DECISION_APPROVAL_CONFIG: Record<DecisionType, ApprovalConfig> = {
  // ... existing configs ...
  resource_allocation: {
    approvalLevels: [
      { riskLevel: "LOW", approvers: 1, requiredRoles: ["case_owner"] },
      { riskLevel: "MEDIUM", approvers: 1, requiredRoles: ["case_owner", "senior_specialist"] },
      { riskLevel: "HIGH", approvers: 2, requiredRoles: ["case_owner", "cfo_advisor"] },
      { riskLevel: "CRITICAL", approvers: 3, requiredRoles: ["case_owner", "cfo_advisor", "audit"] },
    ],
    autoApproveBelow: "LOW",
    requireEvidence: true,
    requireAlternatives: true,
  },
};
```

### 3. Add Decision Record Validation

In `src/lib/validations/collaboration.ts`, add Zod validation for the new decision type:

```typescript
export const resourceAllocationDecisionSchema = z.object({
  decisionType: z.literal("resource_allocation"),
  description: z.string().min(10).max(2000),
  alternatives: z.array(z.string()).min(1).max(5),
  evidenceIds: z.array(z.string().uuid()).min(1),
  resourceType: z.enum(["specialist_time", "budget", "system_access"]),
  amount: z.number().positive(),
  justification: z.string().min(20),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
});
```

### 4. Add Decision Outcome Tracking (Optional)

If the new decision type needs post-decision monitoring, add tracking logic:

```typescript
// In src/modules/collaboration/decision-registry.ts
static async trackOutcome(decisionId: string, outcome: DecisionOutcome): Promise<void> {
  // Existing: record outcome

  // New: for resource allocation decisions, track actual vs estimated usage
  if (decision.decisionType === "resource_allocation") {
    await this.scheduleFollowUpCheck(decisionId, 30); // 30-day follow-up
  }
}
```

---

## Customizing Assignment Rules

### Override Default Rules

Create a company-specific configuration in the database:

```typescript
await prisma.assignmentRule.upsert({
  where: {
    companyId_caseType: {
      companyId: ctx.companyId,
      caseType: "month_end_close",
    },
  },
  create: {
    companyId: ctx.companyId,
    caseType: "month_end_close",
    primaryRole: ["controller"],  // Company-specific: only controllers handle close
    secondaryRole: ["cfo_advisor"],
    escalationChain: ["cfo_advisor"],
    maxWorkloadPerSpecialist: 3,  // Company-specific: lower workload cap
    requiresApprovalAbove: "LOW", // Company-specific: all decisions need approval
    slaHours: 48,                 // Company-specific: tighter SLA
    businessHoursOnly: false,     // Company-specific: 24/7 during close
  },
  update: {
    // ... fields to update ...
  },
});
```

### Add Custom Assignment Logic

Extend the assignment engine with custom routing:

```typescript
// In src/modules/collaboration/assignment-engine.ts
static async findBestSpecialist(
  caseType: CaseType,
  companyId: string,
  context: AssignmentContext,
): Promise<SpecialistAssignment> {
  // Standard rule-based assignment
  const rule = await this.getAssignmentRule(companyId, caseType);
  const candidates = await this.findCandidates(rule, companyId);

  // Custom: prefer specialists who have handled this specific entity before
  if (context.entityId) {
    const experiencedCandidates = await this.findByExperience(candidates, context.entityId);
    if (experiencedCandidates.length > 0) {
      return this.selectByWorkload(experiencedCandidates);
    }
  }

  // Custom: during month-end (last 3 business days), prefer senior specialists
  if (caseType === "month_end_close" && this.isNearMonthEnd()) {
    const seniors = candidates.filter(c => c.seniority === "senior");
    if (seniors.length > 0) {
      return this.selectByWorkload(seniors);
    }
  }

  return this.selectByWorkload(candidates);
}
```

---

## Customizing Workload Calculation

### Override Workload Weights

Different case types may have different effort levels. Override the default weights:

```typescript
// In src/modules/collaboration/workload-manager.ts
const CASE_TYPE_WEIGHTS: Record<CaseType, number> = {
  month_end_close: 3.0,       // High effort
  bank_reconciliation: 1.5,   // Medium effort
  liquidity_risk: 2.5,        // High effort (time-sensitive)
  journal_investigation: 1.0, // Standard effort
  fraud_investigation: 3.5,   // Very high effort
  treasury_exception: 2.0,    // Medium-high effort
  audit_finding: 2.5,         // High effort
  compliance_issue: 2.0,      // Medium-high effort
  cash_forecast: 1.5,         // Medium effort
  policy_violation: 2.5,      // High effort
  general: 1.0,               // Standard effort
  intercompany_settlement: 2.0, // Medium-high effort
};
```

### Add Custom Capacity Factors

Account for specialist-specific capacity variations:

```typescript
// In src/modules/collaboration/workload-manager.ts
static async calculateCapacity(specialist: Specialist, period: DateRange): Promise<CapacityResult> {
  const baseCapacity = this.getBaseCapacity(specialist, period);

  // Custom: reduce capacity during close periods
  const closePeriod = await this.getActiveClosePeriod(specialist.companyId, period);
  if (closePeriod) {
    return { ...baseCapacity, availableHours: baseCapacity.availableHours * 0.7 };
  }

  // Custom: increase capacity for specialists with specific certifications
  if (specialist.certifications?.includes("advanced_reconciliation")) {
    return { ...baseCapacity, availableHours: baseCapacity.availableHours * 1.2 };
  }

  return baseCapacity;
}
```

---

## Customizing Analytics Metrics

### Add Custom Metrics

Extend the analytics service with domain-specific metrics:

```typescript
// In src/modules/collaboration/analytics.service.ts
static async computeCustomMetrics(companyId: string, period: DateRange): Promise<CustomMetrics> {
  const baseMetrics = await this.computeBaseMetrics(companyId, period);

  // Custom: netting ratio for intercompany settlements
  const intercompanyCases = await prisma.financeCase.findMany({
    where: {
      companyId,
      type: "intercompany_settlement",
      createdAt: { gte: period.start, lte: period.end },
    },
  });

  const nettingRatio = intercompanyCases.length > 0
    ? intercompanyCases.filter(c => c.metadata?.nettingApplied).length / intercompanyCases.length
    : 0;

  return {
    ...baseMetrics,
    custom: {
      intercompanyNettingRatio: nettingRatio,
      averageTimeToFirstResponse: await this.computeFirstResponseTime(companyId, period),
      evidenceReuseRate: await this.computeEvidenceReuseRate(companyId, period),
    },
  };
}
```

### Export Custom Metrics

Register custom metrics for external reporting:

```typescript
// In src/modules/collaboration/analytics.service.ts
static readonly CUSTOM_METRIC_DEFINITIONS: MetricDefinition[] = [
  {
    name: "intercompany_netting_ratio",
    description: "Percentage of intercompany cases where netting was applied",
    unit: "ratio",
    min: 0,
    max: 1,
    aggregationType: "average",
  },
  {
    name: "average_time_to_first_response",
    description: "Average time from case creation to first specialist action",
    unit: "hours",
    aggregationType: "average",
  },
];
```

---

## Integrating New Specialists

### 1. Define the Specialist Role

In `src/modules/collaboration/types.ts`:

```typescript
export type SpecialistRole =
  | "cfo_advisor"
  | "controller"
  | "treasury_specialist"
  | "reconciliation_specialist"
  | "fraud_specialist"
  | "compliance_specialist"
  | "fp_and_a_specialist"
  | "tax_specialist";  // ← new role
```

### 2. Register with the Collaboration Platform

In `src/modules/collaboration/specialist-registry.ts`:

```typescript
static SPECIALIST_REGISTRATIONS: Record<SpecialistRole, SpecialistRegistration> = {
  // ... existing registrations ...
  tax_specialist: {
    role: "tax_specialist",
    displayName: "Tax Specialist",
    capabilities: ["tax_analysis", "tax_compliance", "tax_planning"],
    caseTypes: ["compliance_issue", "policy_violation", "general"],
    evidenceTypes: ["financial_data", "document", "policy_reference", "regulatory_filing"],
    maxConcurrentCases: 8,
    defaultPriority: "MEDIUM",
    escalationTarget: "cfo_advisor",
    permissions: [
      "collaboration.view",
      "collaboration.cases.manage",
      "collaboration.decisions.propose",
    ],
  },
};
```

### 3. Add to Assignment Rules

Update the default assignment rules to include the new specialist in relevant case types:

```typescript
// In src/modules/collaboration/assignment-engine.ts
compliance_issue: {
  caseType: "compliance_issue",
  primaryRole: ["compliance_specialist", "tax_specialist"],  // ← added
  secondaryRole: ["controller", "audit"],
  // ... rest unchanged
},
```

### 4. Add Expertise Mapping

Map specialist capabilities to case requirements:

```typescript
// In src/modules/collaboration/expertise-mapper.ts
static EXPERTISE_MAP: Record<SpecialistRole, ExpertiseArea[]> = {
  // ... existing mappings ...
  tax_specialist: [
    { area: "tax_compliance", weight: 1.0 },
    { area: "tax_planning", weight: 0.8 },
    { area: "regulatory_analysis", weight: 0.6 },
    { area: "financial_analysis", weight: 0.4 },
  ],
};
```

### 5. Add Workload Integration

Ensure the new specialist's workload is tracked:

```typescript
// The workload manager automatically tracks all registered specialists.
// No code changes needed unless the specialist has custom capacity rules.

// For custom capacity (e.g., tax specialists have seasonal workload):
static async getSeasonalCapacityFactor(specialist: Specialist, period: DateRange): Promise<number> {
  if (specialist.role === "tax_specialist") {
    // Reduce capacity during tax season (Jan-Apr)
    const month = period.start.getMonth();
    if (month >= 0 && month <= 3) return 0.6;
    // Increase capacity during off-season
    return 1.3;
  }
  return 1.0;
}
```

---

## Adding New Collaboration Patterns

### Sequential Chain

Specialists work in a defined sequence. Each specialist's output becomes the next specialist's input.

```typescript
const SEQUENTIAL_CHAIN: CollaborationPattern = {
  name: "Sequential Review Chain",
  description: "Each specialist reviews in sequence, building on previous findings",
 适用场景: "Audit findings, compliance investigations",
  steps: [
    { role: "reconciliation_specialist", taskType: "data_collection" },
    { role: "controller", taskType: "analysis" },
    { role: "compliance_specialist", taskType: "policy_review" },
    { role: "cfo_advisor", taskType: "synthesis" },
  ],
  completionCondition: "all_steps_completed",
  escalationPath: "any_specialist_can_escalate",
};
```

### Parallel Review

Multiple specialists work simultaneously on independent aspects of the same case.

```typescript
const PARALLEL_REVIEW: CollaborationPattern = {
  name: "Parallel Expert Review",
  description: "Multiple specialists analyze independently, results merged at end",
  适用场景: "Complex investigations, month-end close",
  parallelGroups: [
    {
      name: "financial_analysis",
      specialists: ["controller", "treasury_specialist"],
      mergeStrategy: "combine_findings",
    },
    {
      name: "compliance_analysis",
      specialists: ["compliance_specialist", "audit"],
      mergeStrategy: "combine_findings",
    },
  ],
  mergeStep: {
    role: "cfo_advisor",
    taskType: "synthesis",
    inputFrom: "all_parallel_groups",
  },
  completionCondition: "all_groups_completed_and_merged",
};
```

### Consultation Pattern

A primary specialist consults other specialists for specific expertise without transferring ownership.

```typescript
const CONSULTATION_PATTERN: CollaborationPattern = {
  name: "Expert Consultation",
  description: "Primary specialist owns case, consults others for specific input",
  适用场景: "Specialist needs cross-domain input but retains ownership",
  primarySpecialist: "determined_by_assignment_engine",
  consultationTargets: {
    "tax_input": "tax_specialist",
    "treasury_input": "treasury_specialist",
    "compliance_input": "compliance_specialist",
  },
  consultationFlow: {
    requestType: "task_creation",
    taskTemplate: "provide_{domain}_input",
    completionCondition: "consultation_response_received",
    maxConsultationHours: 4,
  },
  ownership: "primary_retains_throughout",
};
```

### Investigation Board

Multiple specialists investigate in parallel with a central coordinator synthesizing findings.

```typescript
const INVESTIGATION_BOARD: CollaborationPattern = {
  name: "Investigation Board",
  description: "Central coordinator manages parallel specialist investigations",
  适用场景: "Fraud investigations, complex exceptions",
  coordinator: {
    role: "cfo_advisor",
    responsibilities: ["task_allocation", "evidence_synthesis", "decision_drafting"],
  },
  investigators: {
    roles: ["controller", "treasury_specialist", "compliance_specialist", "audit"],
    independenceLevel: "high",  // investigators work without seeing each other's findings
    blindPeriod: "until_synthesis",
  },
  synthesis: {
    trigger: "all_investigators_complete",
    coordinatorReviews: "all_findings",
    produces: "unified_recommendation",
    requiresApproval: true,
  },
};
```

### Registering a Custom Pattern

In `src/modules/collaboration/pattern-registry.ts`:

```typescript
static registerPattern(pattern: CollaborationPattern): void {
  // Validate pattern structure
  this.validatePattern(pattern);

  // Register
  this.patterns.set(pattern.name, pattern);

  // Associate with case types if specified
  if (pattern.applicableCaseTypes) {
    for (const caseType of pattern.applicableCaseTypes) {
      this.caseTypePatterns.set(caseType, pattern.name);
    }
  }
}
```

---

## Testing Approach

### Unit Tests

Test each component in isolation:

```typescript
// src/modules/collaboration/__tests__/assignment-engine.test.ts
describe("AssignmentEngine", () => {
  it("assigns primary specialist based on case type rules", async () => {
    const assignment = await assignmentEngine.findBestSpecialist(
      "month_end_close",
      testCompanyId,
      { entityId: "entity-1" },
    );
    expect(assignment.primaryRole).toBe("controller");
  });

  it("reassigns when primary specialist is at capacity", async () => {
    // Mock specialist at max capacity
    await mockWorkload("specialist-1", 10); // max is 8
    const assignment = await assignmentEngine.findBestSpecialist(
      "month_end_close",
      testCompanyId,
      {},
    );
    expect(assignment.primarySpecialistId).not.toBe("specialist-1");
  });
});
```

### Integration Tests

Test component interactions:

```typescript
// src/modules/collaboration/__tests__/case-lifecycle.test.ts
describe("Case Lifecycle", () => {
  it("completes full case lifecycle with evidence and decision", async () => {
    // Create case
    const case = await collaborationService.createCase({
      type: "bank_reconciliation",
      priority: "HIGH",
      context: { entityId: "entity-1" },
    });

    // Attach evidence
    await collaborationService.attachEvidence(case.id, {
      type: "financial_data",
      content: { balance: 100000 },
    });

    // Complete tasks
    await collaborationService.completeTask(case.id, "task-1", {
      result: "Discrepancy identified: $5,000 variance",
    });

    // Propose decision
    const decision = await collaborationService.proposeDecision(case.id, {
      type: "resolution",
      description: "Write off $5,000 variance as immaterial",
      evidenceIds: ["evidence-1"],
    });

    // Approve decision
    await collaborationService.approveDecision(case.id, decision.id, {
      approvedBy: "cfo-advisor-1",
      notes: "Approved - within materiality threshold",
    });

    // Verify case resolved
    const updatedCase = await collaborationService.getCase(case.id);
    expect(updatedCase.status).toBe("RESOLVED");
  });
});
```

### Evidence Deduplication Tests

```typescript
// src/modules/collaboration/__tests__/evidence-center.test.ts
describe("Evidence Deduplication", () => {
  it("detects exact duplicates by content hash", async () => {
    const evidence1 = await evidenceCenter.collect({
      type: "financial_data",
      content: { balance: 100000, currency: "USD" },
    });
    const evidence2 = await evidenceCenter.collect({
      type: "financial_data",
      content: { balance: 100000, currency: "USD" },  // identical
    });
    expect(evidence2.isDuplicate).toBe(true);
    expect(evidence2.existingEvidenceId).toBe(evidence1.id);
  });

  it("allows near-duplicates with different context", async () => {
    const evidence1 = await evidenceCenter.collect({
      type: "financial_data",
      content: { balance: 100000, currency: "USD", date: "2026-01-15" },
    });
    const evidence2 = await evidenceCenter.collect({
      type: "financial_data",
      content: { balance: 100000, currency: "USD", date: "2026-01-16" },  // different date
    });
    expect(evidence2.isDuplicate).toBe(false);  // different content hash
  });
});
```

### Enterprise Memory Tests

```typescript
// src/modules/collaboration/__tests__/enterprise-memory.test.ts
describe("Enterprise Memory", () => {
  it("surfaces relevant memories for new case", async () => {
    // Store a pattern memory
    await enterpriseMemory.store({
      type: "pattern",
      content: "Q4 always has FX reconciliation exceptions due to year-end revaluation",
      keywords: ["Q4", "FX", "reconciliation", "revaluation"],
      companyId: testCompanyId,
    });

    // Create a new FX reconciliation case
    const memories = await enterpriseMemory.retrieve({
      caseType: "bank_reconciliation",
      keywords: ["FX", "reconciliation"],
      companyId: testCompanyId,
      limit: 5,
    });

    expect(memories.length).toBeGreaterThan(0);
    expect(memories[0].content).toContain("FX reconciliation");
  });

  it("applies decay to old memories", async () => {
    // Store a memory and backdate it
    const memory = await enterpriseMemory.store({
      type: "case_resolution",
      content: "Resolved by adjusting journal entry",
      companyId: testCompanyId,
    });
    await prisma.enterpriseMemory.update({
      where: { id: memory.id },
      data: { lastAccessedAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000) }, // 200 days ago
    });

    const memories = await enterpriseMemory.retrieve({
      caseType: "journal_investigation",
      companyId: testCompanyId,
      limit: 10,
    });

    const storedMemory = memories.find(m => m.id === memory.id);
    expect(storedMemory.relevanceScore).toBeLessThan(0.5); // decayed
  });
});
```

### Performance Tests

```typescript
// src/modules/collaboration/__tests__/performance.test.ts
describe("Collaboration Platform Performance", () => {
  it("completes case creation under 100ms", async () => {
    const start = Date.now();
    await collaborationService.createCase({
      type: "general",
      priority: "LOW",
    });
    expect(Date.now() - start).toBeLessThan(100);
  });

  it("retrieves timeline under 50ms for 1000 events", async () => {
    const caseId = await createCaseWithManyEvents(1000);
    const start = Date.now();
    await collaborationService.getTimeline(caseId, { limit: 50 });
    expect(Date.now() - start).toBeLessThan(50);
  });

  it("computes workload for 100 specialists under 200ms", async () => {
    await createWorkloadData(100);
    const start = Date.now();
    await workloadManager.getWorkforceWorkload(testCompanyId);
    expect(Date.now() - start).toBeLessThan(200);
  });
});
```

---

*Document version: 1.0.0 — Phase 13.5 — Enterprise Finance Collaboration Platform Extension Guide*
