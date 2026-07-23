# Enterprise Board Governance Specialist — Extension Guide

## Overview

This guide explains how to extend the Board Governance Specialist with new committee types, meeting types, resolution types, board pack sections, governance scoring dimensions, briefing sections, and custom integrations.

## Prerequisites

- Access to the Perionyx codebase
- Understanding of the Board Governance types (`src/modules/board-governance/types.ts`)
- Prisma schema with the 15 governance models (in `prisma/schema.prisma`)
- `TenantContext` available for all operations
- RBAC permission `governance.admin` for configuration changes

---

## Adding New Committee Types

### 1. Add to Type Union

In `src/modules/board-governance/types.ts`, add the new type to the `CommitteeType` union:

```typescript
export type CommitteeType =
  | "audit"
  | "risk"
  | "finance"
  | "strategy"
  | "compensation"
  | "nomination"
  | "governance"
  | "technology"
  | "esg"          // ← new type
  | "other";
```

### 2. Update Prisma Schema (Optional)

The `Committee.committeeType` field is a `String` — no schema migration needed. However, if you want to document the valid values:

```prisma
// In prisma/schema.prisma — Committee model
committeeType String @default("other")
/// "audit" | "risk" | "finance" | "strategy" | "compensation" | "nomination" | "governance" | "technology" | "esg" | "other"
```

### 3. Define Default Charter (Optional)

If the new committee type should have a standard charter template, add it to the committee creation flow:

```typescript
const DEFAULT_CHARTERS: Record<CommitteeType, Record<string, unknown>> = {
  audit: {
    purpose: "Oversee financial reporting and internal controls",
    responsibilities: ["Review financial statements", "Monitor internal controls", "Oversee external audit"],
    meetingFrequency: "quarterly",
  },
  esg: {
    purpose: "Oversee environmental, social, and governance strategy",
    responsibilities: ["Review ESG metrics", "Set sustainability targets", "Report to board on ESG performance"],
    meetingFrequency: "quarterly",
  },
  // ... other defaults
};

static async createCommittee(ctx: TenantContext, input: CreateCommitteeInput): Promise<Committee> {
  const charter = input.charter ?? DEFAULT_CHARTERS[input.committeeType] ?? {};
  // ... rest of creation logic
}
```

### 4. Update Governance Analytics

The `GovernanceAnalyticsService.getDashboard()` counts committees by type. No code change needed — the new type will appear in committee counts automatically. However, if you want committee-specific analytics:

```typescript
// In governance-analytics.ts — optional committee-specific metrics
static async getCommitteePerformance(ctx: TenantContext): Promise<Record<string, { meetingCount: number; resolutionCount: number; actionCount: number }>> {
  const committees = await prisma.committee.findMany({
    where: { companyId: ctx.companyId, status: "active" },
  });

  const performance: Record<string, unknown> = {};
  for (const committee of committees) {
    const [meetings, resolutions, actions] = await Promise.all([
      prisma.boardMeeting.count({ where: { committeeId: committee.id } }),
      prisma.boardResolution.count({ where: { meetingId: committee.id } }),
      prisma.boardAction.count({ where: { meetingId: committee.id } }),
    ]);
    performance[committee.committeeType] = { meetingCount: meetings, resolutionCount: resolutions, actionCount: actions };
  }

  return performance;
}
```

### 5. Update Briefing Generation

If the new committee type should have a dedicated section in executive briefings, add a highlight field to `BoardBriefing`:

```typescript
// In types.ts
export interface BoardBriefing {
  // ... existing fields ...
  esgHighlights: Record<string, unknown>;
}
```

---

## Adding New Meeting Types

### 1. Add to Type Union

In `src/modules/board-governance/types.ts`, add to the `MeetingType` union:

```typescript
export type MeetingType =
  | "regular"
  | "special"
  | "annual"
  | "emergency"
  | "committee"
  | "organizational";  // ← new type (e.g., for organizational meetings outside regular schedule)
```

### 2. Update Meeting Creation

The `MeetingManagementService.createMeeting()` method accepts any `MeetingType` — no changes needed. The `meetingType` is stored directly in `BoardMeeting.meetingType`.

### 3. Define Default Duration (Optional)

If the new meeting type has standard duration expectations:

```typescript
const DEFAULT_MEETING_DURATION: Record<MeetingType, number> = {
  regular: 120,
  special: 90,
  annual: 180,
  emergency: 60,
  committee: 90,
  organizational: 120,  // ← new default
};

static async createMeeting(ctx: TenantContext, input: CreateMeetingInput): Promise<BoardMeeting> {
  const duration = input.duration ?? DEFAULT_MEETING_DURATION[input.meetingType] ?? 120;
  // ... rest of creation logic
}
```

### 4. Define Quorum Rules (Optional)

If the new meeting type has specific quorum requirements:

```typescript
const QUORUM_RULES: Record<MeetingType, { requiredPercentage: number; allowProxy: boolean }> = {
  regular: { requiredPercentage: 50, allowProxy: false },
  annual: { requiredPercentage: 33, allowProxy: false },
  emergency: { requiredPercentage: 25, allowProxy: false },
  organizational: { requiredPercentage: 50, allowProxy: true },
};
```

### 5. Update Meeting Filtering

The `listMeetings()` method filters by `meetingType` — no changes needed. The new type will be included in query results automatically.

---

## Adding New Resolution Types

### 1. Add to Type Union

In `src/modules/board-governance/types.ts`, add to the `ResolutionType` union:

```typescript
export type ResolutionType =
  | "policy"
  | "financial"
  | "strategic"
  | "personnel"
  | "governance"
  | "compliance"
  | "operational";  // ← new type
```

### 2. Update Resolution Creation

The `ResolutionService.createResolution()` method accepts any `ResolutionType` — no changes needed. The `resolutionType` is stored directly in `BoardResolution.resolutionType`.

### 3. Define Default Vote Requirements (Optional)

If the new resolution type has standard vote thresholds:

```typescript
const DEFAULT_VOTE_REQUIREMENTS: Record<ResolutionType, number> = {
  policy: 6,
  financial: 5,
  strategic: 6,
  personnel: 5,
  governance: 6,
  compliance: 4,
  operational: 4,  // ← new default
};

static async createResolution(ctx: TenantContext, input: CreateResolutionInput): Promise<BoardResolution> {
  const requiredVotes = input.requiredVotes ?? DEFAULT_VOTE_REQUIREMENTS[input.resolutionType] ?? 5;
  // ... rest of creation logic
}
```

### 4. Define Effective Date Rules (Optional)

If the new resolution type has specific effective date requirements:

```typescript
const EFFECTIVE_DATE_RULES: Record<ResolutionType, { immediate: boolean; requiresApproval: boolean }> = {
  policy: { immediate: false, requiresApproval: true },
  financial: { immediate: true, requiresApproval: true },
  operational: { immediate: true, requiresApproval: false },
};
```

### 5. Update Analytics Grouping

The `GovernanceAnalyticsService.getDashboard()` groups resolutions by status — no changes needed for new types. The new type will appear in status-based counts automatically.

---

## Adding New Board Pack Sections

### 1. Define the Section Configuration

Create a section configuration that specifies the source, title, and data shape:

```typescript
// In a new file: src/modules/board-governance/board-pack-sections.ts

export interface BoardPackSectionConfig {
  sectionId: string;
  title: string;
  description: string;
  sourceSpecialist: string;
  dataShape: Record<string, unknown>;
}

export const BOARD_PACK_SECTIONS: BoardPackSectionConfig[] = [
  {
    sectionId: "executive_summary",
    title: "Executive Summary",
    description: "Compiled overview from all sections",
    sourceSpecialist: "board_governance",
    dataShape: {},
  },
  // ... existing 17 sections
  {
    sectionId: "cybersecurity_posture",
    title: "Cybersecurity Posture",
    description: "Security incidents, vulnerability status, penetration test results",
    sourceSpecialist: "operations",
    dataShape: {},
  },
];
```

### 2. Implement the Section Builder

```typescript
// In board-pack-service.ts

static async buildCybersecuritySection(
  ctx: TenantContext,
): Promise<{ sectionId: string; title: string; content: Record<string, unknown>; evidenceIds: string[]; lastUpdated: Date }> {
  // Query from the source specialist's data
  const securityEvents = await prisma.auditLog.findMany({
    where: {
      companyId: ctx.companyId,
      action: { in: ["security_incident", "vulnerability_detected", "penetration_test"] },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return {
    sectionId: "cybersecurity_posture",
    title: "Cybersecurity Posture",
    content: {
      recentIncidents: securityEvents.filter(e => e.action === "security_incident").length,
      vulnerabilitiesDetected: securityEvents.filter(e => e.action === "vulnerability_detected").length,
      lastPenetrationTest: securityEvents.find(e => e.action === "penetration_test")?.createdAt ?? null,
      events: securityEvents.slice(0, 10),
    },
    evidenceIds: securityEvents.map(e => e.id),
    lastUpdated: new Date(),
  };
}
```

### 3. Wire Into Board Pack Assembly

```typescript
// In board-pack-service.ts — createPack() method

static async assemblePackSections(
  ctx: TenantContext,
  meetingId: string,
): Promise<Record<string, unknown>[]> {
  const sections = await Promise.all([
    this.buildExecutiveSummarySection(ctx, meetingId),
    this.buildFinancialPositionSection(ctx),
    this.buildTreasuryOverviewSection(ctx),
    // ... existing sections
    this.buildCybersecuritySection(ctx),  // ← new section
  ]);

  return sections;
}
```

### 4. Update Pack Creation

In `createPack()`, automatically assemble sections when creating a pack:

```typescript
static async createPack(ctx: TenantContext, input: CreateBoardPackInput): Promise<GovernanceBoardPack> {
  const sections = input.sections?.length
    ? input.sections
    : await this.assemblePackSections(ctx, input.meetingId);

  // ... rest of creation logic with assembled sections
}
```

### 5. Register the Section

Add the section to the barrel export and any section registry:

```typescript
// In board-pack-sections.ts
export const SECTION_REGISTRY = new Map<string, BoardPackSectionConfig>(
  BOARD_PACK_SECTIONS.map(s => [s.sectionId, s])
);
```

---

## Customizing Governance Scoring

### 1. Add a New Score Dimension

In `src/modules/board-governance/governance-analytics.ts`, add a new computation method:

```typescript
private static async computePolicyAdherenceRate(ctx: TenantContext): Promise<Prisma.Decimal> {
  const policies = await prisma.boardResolution.findMany({
    where: { companyId: ctx.companyId, resolutionType: "policy", status: "approved" },
  });
  if (policies.length === 0) return new Prisma.Decimal(100);

  const withExpiry = policies.filter(p => p.expiryDate !== null);
  const notExpired = withExpiry.filter(p => new Date(p.expiryDate!) > new Date());
  const adherenceRate = new Prisma.Decimal(notExpired.length).div(withExpiry.length).mul(100);

  return adherenceRate;
}
```

### 2. Update Health Score Calculation

```typescript
// In governance-analytics.ts — getHealthScore()

static async getHealthScore(ctx: TenantContext): Promise<GovernanceHealthScore> {
  const [attendanceRate, resolutionPassRate, actionCompletionRate, policyAdherenceRate] = await Promise.all([
    this.computeAttendanceRate(ctx),
    this.computeResolutionPassRate(ctx),
    this.computeActionCompletionRate(ctx),
    this.computePolicyAdherenceRate(ctx),  // ← new dimension
  ]);

  const overall = attendanceRate
    .add(resolutionPassRate)
    .add(actionCompletionRate)
    .add(policyAdherenceRate)  // ← include in overall
    .div(4);  // ← update divisor

  return {
    overallScore: overall,
    meetingEffectiveness: attendanceRate,
    resolutionCompletionRate: resolutionPassRate,
    actionCompletionRate,
    attendanceRate,
    complianceScore: policyAdherenceRate,
    riskScore: new Prisma.Decimal(100).sub(overall).max(0),
  };
}
```

### 3. Update Dashboard

```typescript
// In governance-analytics.ts — getDashboard()

static async getDashboard(ctx: TenantContext, boardId?: string): Promise<GovernanceDashboardData> {
  const [counts, healthScore, complianceAlerts] = await Promise.all([
    this.getCounts(ctx, boardId),
    this.getHealthScore(ctx),
    this.getComplianceAlerts(ctx),
  ]);

  return {
    ...counts,
    governanceScore: healthScore.overallScore,
    meetingAttendanceRate: healthScore.attendanceRate,
    resolutionPassRate: healthScore.resolutionCompletionRate,
    avgDaysToCompleteActions: await this.computeAvgDaysToComplete(ctx),
    recentActions: [],
    upcomingMeetingsList: [],
    complianceAlerts,
  };
}
```

### 4. Persist Historical Scores (Optional)

If you want to track governance score trends over time:

```typescript
// Add to GovernanceMetric model in Prisma schema
model GovernanceMetric {
  // ... existing fields ...
  policyAdherenceRate  Decimal @db.Decimal(5, 4)
}
```

---

## Customizing Board Pack Assembly

### 1. Define Assembly Order

```typescript
// In board-pack-service.ts

const DEFAULT_ASSEMBLY_ORDER = [
  "executive_summary",
  "financial_position",
  "treasury_overview",
  "budget_variance",
  "forecast_update",
  "revenue_analysis",
  "cost_analysis",
  "compliance_status",
  "audit_findings",
  "control_effectiveness",
  "risk_assessment",
  "tax_position",
  "transfer_pricing",
  "regulatory_updates",
  "pending_resolutions",
  "action_item_status",
  "meeting_attendance",
  "strategic_initiatives",
];

const CUSTOM_ASSEMBLY_ORDER: Record<string, string[]> = {
  annual_general_meeting: [
    "executive_summary",
    "financial_position",
    "budget_variance",
    "forecast_update",
    "audit_findings",
    "compliance_status",
    "pending_resolutions",
    "strategic_initiatives",
  ],
  emergency_meeting: [
    "executive_summary",
    "risk_assessment",
    "pending_resolutions",
    "action_item_status",
  ],
};
```

### 2. Customize Section Content

If certain sections need different content for different meeting types:

```typescript
static async buildSectionContent(
  ctx: TenantContext,
  sectionId: string,
  meetingType: MeetingType,
): Promise<{ content: Record<string, unknown>; evidenceIds: string[] }> {
  switch (sectionId) {
    case "financial_position":
      if (meetingType === "annual_general_meeting") {
        // Include full-year audited statements
        return this.buildFullYearFinancialSection(ctx);
      }
      // Default: quarterly summary
      return this.buildQuarterlyFinancialSection(ctx);
    // ... other sections
  }
}
```

### 3. Add Conditional Sections

```typescript
static async getRelevantSections(
  ctx: TenantContext,
  meetingType: MeetingType,
  committeeType?: CommitteeType,
): Promise<string[]> {
  const sections = CUSTOM_ASSEMBLY_ORDER[meetingType] ?? DEFAULT_ASSEMBLY_ORDER;

  // Add committee-specific sections
  if (committeeType === "audit") {
    return [...sections, "audit_deep_dive", "control_effectiveness_detail"];
  }
  if (committeeType === "risk") {
    return [...sections, "risk_deep_dive", "incident_history"];
  }

  return sections;
}
```

---

## Adding New Briefing Sections

### 1. Add Highlight Field to BoardBriefing

In `src/modules/board-governance/types.ts`:

```typescript
export interface BoardBriefing {
  // ... existing fields ...
  cybersecurityHighlights: Record<string, unknown>;
  operationalHighlights: Record<string, unknown>;
}
```

### 2. Update Prisma Schema

```prisma
model BoardBriefing {
  // ... existing fields ...
  cybersecurityHighlights  Json @default("{}")
  operationalHighlights    Json @default("{}")
}
```

Run migration:
```bash
npx prisma migrate dev --name add_board_briefing_sections
```

### 3. Implement the Highlight Builder

```typescript
// In executive-briefing.ts

static async buildCybersecurityHighlights(ctx: TenantContext): Promise<Record<string, unknown>> {
  const securityEvents = await prisma.auditLog.findMany({
    where: {
      companyId: ctx.companyId,
      action: { in: ["security_incident", "vulnerability_detected"] },
      createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    },
  });

  return {
    incidentsLast30Days: securityEvents.filter(e => e.action === "security_incident").length,
    vulnerabilitiesDetected: securityEvents.filter(e => e.action === "vulnerability_detected").length,
    recentEvents: securityEvents.slice(0, 5),
  };
}
```

### 4. Wire Into Briefing Generation

```typescript
// In executive-briefing.ts — generateBriefing()

const [boards, meetings, resolutions, actions, overdueActions, cybersecurityHighlights] = await Promise.all([
  prisma.board.findMany({ where: { companyId: ctx.companyId, status: "active" } }),
  prisma.boardMeeting.findMany({ /* ... */ }),
  prisma.boardResolution.findMany({ /* ... */ }),
  prisma.boardAction.findMany({ /* ... */ }),
  prisma.boardAction.findMany({ /* ... */ }),
  this.buildCybersecurityHighlights(ctx),  // ← new query
]);

// Add to briefing data
cybersecurityHighlights: cybersecurityHighlights as Prisma.InputJsonValue,
```

### 5. Register the Section

If the briefing has a configurable section list:

```typescript
const BRIEFING_SECTIONS = [
  "summary",
  "meeting_highlights",
  "action_status",
  "risk_highlights",
  "financial_highlights",
  "audit_highlights",
  "compliance_highlights",
  "tax_highlights",
  "strategic_highlights",
  "cybersecurity_highlights",  // ← new
];
```

---

## Testing Approach

### Unit Tests

Test each service method in isolation with mocked Prisma:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BoardGovernanceService } from "@/modules/board-governance/board-governance";

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    board: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    boardMember: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
  },
}));

vi.mock("@/modules/audit", () => ({
  recordAudit: vi.fn(),
}));

describe("BoardGovernanceService", () => {
  const mockCtx = { companyId: "comp_1", userId: "user_1" };

  beforeEach(() => vi.clearAllMocks());

  it("should create a board with audit logging", async () => {
    const prisma = await import("@/server/db/prisma");
    vi.mocked(prisma.prisma.board.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.prisma.board.create).mockResolvedValue({
      id: "board_1",
      companyId: "comp_1",
      boardName: "Board of Directors",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const board = await BoardGovernanceService.createBoard(mockCtx, {
      boardName: "Board of Directors",
    });

    expect(board.id).toBe("board_1");
    expect(board.boardName).toBe("Board of Directors");
    expect(prisma.prisma.board.create).toHaveBeenCalled();
  });

  it("should prevent duplicate board names", async () => {
    const prisma = await import("@/server/db/prisma");
    vi.mocked(prisma.prisma.board.findFirst).mockResolvedValue({ id: "existing" } as any);

    await expect(
      BoardGovernanceService.createBoard(mockCtx, { boardName: "Existing Board" }),
    ).rejects.toThrow("already exists");
  });

  it("should soft-delete board (set dissolved status)", async () => {
    const prisma = await import("@/server/db/prisma");
    vi.mocked(prisma.prisma.board.findFirst).mockResolvedValue({ id: "board_1", status: "active" } as any);
    vi.mocked(prisma.prisma.board.update).mockResolvedValue({} as any);

    await BoardGovernanceService.deleteBoard(mockCtx, "board_1");

    expect(prisma.prisma.board.update).toHaveBeenCalledWith({
      where: { id: "board_1" },
      data: { status: "dissolved" },
    });
  });
});
```

### Resolution and Voting Tests

```typescript
describe("ResolutionService", () => {
  it("should tally votes and determine passage", async () => {
    const prisma = await import("@/server/db/prisma");
    vi.mocked(prisma.prisma.boardResolution.findFirst).mockResolvedValue({
      id: "res_1",
      companyId: "comp_1",
      requiredVotes: 3,
      status: "voting",
    } as any);
    vi.mocked(prisma.prisma.boardVote.groupBy).mockResolvedValue([
      { vote: "for", _count: { vote: 5 } },
      { vote: "against", _count: { vote: 2 } },
      { vote: "abstain", _count: { vote: 1 } },
    ] as any);
    vi.mocked(prisma.prisma.boardResolution.update).mockResolvedValue({} as any);

    const result = await ResolutionService.closeVoting(mockCtx, "res_1");

    expect(result.status).toBe("approved");
    expect(result.votesFor).toBe(5);
    expect(result.votesAgainst).toBe(2);
    expect(result.abstentions).toBe(1);
    expect(result.passed).toBe(true); // 5 > 3
  });

  it("should reject resolution when insufficient votes", async () => {
    const prisma = await import("@/server/db/prisma");
    vi.mocked(prisma.prisma.boardResolution.findFirst).mockResolvedValue({
      id: "res_2",
      requiredVotes: 5,
      status: "voting",
    } as any);
    vi.mocked(prisma.prisma.boardVote.groupBy).mockResolvedValue([
      { vote: "for", _count: { vote: 3 } },
      { vote: "against", _count: { vote: 4 } },
    ] as any);
    vi.mocked(prisma.prisma.boardResolution.update).mockResolvedValue({} as any);

    const result = await ResolutionService.closeVoting(mockCtx, "res_2");

    expect(result.status).toBe("rejected");
    expect(result.passed).toBe(false); // 3 < 5
  });
});
```

### Board Pack Assembly Tests

```typescript
describe("BoardPackService", () => {
  it("should assemble board pack with correct section count", async () => {
    const prisma = await import("@/server/db/prisma");
    vi.mocked(prisma.prisma.governanceBoardPack.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.prisma.governanceBoardPack.create).mockResolvedValue({
      id: "pack_1",
      sections: Array.from({ length: 18 }, (_, i) => ({ sectionId: `section_${i}` })),
    } as any);

    const pack = await BoardPackService.createPack(mockCtx, {
      meetingId: "meeting_1",
      packTitle: "Q4 Board Pack",
    });

    expect(pack.sections).toHaveLength(18);
  });

  it("should prevent duplicate pack per meeting", async () => {
    const prisma = await import("@/server/db/prisma");
    vi.mocked(prisma.prisma.governanceBoardPack.findFirst).mockResolvedValue({ id: "existing" } as any);

    await expect(
      BoardPackService.createPack(mockCtx, { meetingId: "meeting_1", packTitle: "Duplicate" }),
    ).rejects.toThrow("already exists");
  });
});
```

### Governance Analytics Tests

```typescript
describe("GovernanceAnalyticsService", () => {
  it("should compute governance health score as average of three dimensions", async () => {
    const prisma = await import("@/server/db/prisma");

    // Mock attendance rate: 80%
    vi.mocked(prisma.prisma.boardMeeting.findMany).mockResolvedValue([
      { quorumMet: true } as any,
      { quorumMet: true } as any,
      { quorumMet: true } as any,
      { quorumMet: true } as any,
      { quorumMet: false } as any,
    ]);

    // Mock resolution pass rate: 100%
    vi.mocked(prisma.prisma.boardResolution.findMany).mockResolvedValue([
      { passed: true } as any,
      { passed: true } as any,
    ]);

    // Mock action completion rate: 75%
    vi.mocked(prisma.prisma.boardAction.findMany).mockResolvedValue([
      { status: "completed" } as any,
      { status: "completed" } as any,
      { status: "completed" } as any,
      { status: "pending" } as any,
    ]);

    const score = await GovernanceAnalyticsService.getHealthScore(mockCtx);

    // overall = (80 + 100 + 75) / 3 = 85
    expect(score.overallScore.toNumber()).toBeCloseTo(85, 0);
  });
});
```

### Integration Tests

Test the API routes with mocked auth:

```typescript
import { describe, it, expect, vi } from "vitest";
import { GET, POST } from "@/app/api/board-governance/boards/route";

vi.mock("@/server/auth/auth", () => ({
  auth: () => Promise.resolve({
    user: { id: "user_1", activeCompanyId: "comp_1", companyRole: "ADMIN" },
  }),
}));

describe("GET /api/board-governance/boards", () => {
  it("should return paginated boards", async () => {
    const req = new Request("http://localhost/api/board-governance/boards");
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("boards");
    expect(data).toHaveProperty("total");
  });
});

describe("POST /api/board-governance/boards", () => {
  it("should create a board", async () => {
    const req = new Request("http://localhost/api/board-governance/boards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ boardName: "Board of Directors" }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);
  });
});
```

### Test File Locations

```
src/modules/board-governance/__tests__/
├── board-governance.test.ts
├── committee-service.test.ts
├── meeting-management.test.ts
├── resolution-service.test.ts
├── board-pack-service.test.ts
├── action-tracking.test.ts
├── executive-briefing.test.ts
└── governance-analytics.test.ts

src/app/api/board-governance/__tests__/
├── boards.test.ts
├── committees.test.ts
├── meetings.test.ts
├── resolutions.test.ts
├── actions.test.ts
├── board-packs.test.ts
├── briefings.test.ts
└── dashboard.test.ts
```

### Running Tests

```bash
pnpm test src/modules/board-governance/
pnpm test src/app/api/board-governance/
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
- [ ] Board pack section builder implemented (if new section)
- [ ] Briefing highlight builder implemented (if new briefing section)
- [ ] Unit tests added for the new type's happy path and edge cases
- [ ] Integration test covers the new type through the API
- [ ] Documentation updated (this file + `44-board-governance.md`)
- [ ] `pnpm typecheck` passes
- [ ] `pnpm build` passes
- [ ] Security review passed (no new secrets, no tenant isolation bypass, no data fabrication)
