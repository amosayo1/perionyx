import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { recordAudit } from "@/modules/audit";
import { NotFoundError, ConflictError } from "@/lib/errors/app-error";
import type {
  BriefingPeriod,
  ScenarioType,
  InsightType,
  InsightSeverity,
  PriorityUrgency,
  DecisionType,
  BoardPackStatus,
  RecommendationCategory,
  ExecutiveBriefing,
  ExecutiveRecommendation,
  ScenarioAnalysis,
  ScenarioExecution,
  ExecutiveConversation,
  ExecutiveMessage,
  ExecutiveInsight,
  ExecutivePriority,
  ExecutiveDecision,
  ExecutiveWorkspacePreference,
  ExecutiveBoardPack,
  GenerateBriefingInput,
  RunScenarioInput,
  CreatePriorityInput,
  CreateDecisionInput,
  CreateRecommendationInput,
  UpdateWorkspacePreferencesInput,
  BriefingQuery,
  RecommendationQuery,
  ScenarioQuery,
  InsightQuery,
  PriorityQuery,
  DecisionQuery,
  PaginatedResult,
  CFODashboardData,
} from "./types";

function mapBriefing(row: Record<string, unknown>): ExecutiveBriefing {
  return {
    id: row.id as string,
    companyId: row.companyId as string,
    briefingDate: (row.briefingDate as Date).toISOString(),
    period: row.period as ExecutiveBriefing["period"],
    status: row.status as ExecutiveBriefing["status"],
    cashPosition: (row.cashPosition as Record<string, unknown>) ?? {},
    liquidity: (row.liquidity as Record<string, unknown>) ?? {},
    workingCapital: (row.workingCapital as Record<string, unknown>) ?? {},
    revenueTrends: (row.revenueTrends as Record<string, unknown>) ?? {},
    expenseTrends: (row.expenseTrends as Record<string, unknown>) ?? {},
    treasuryHealth: (row.treasuryHealth as Record<string, unknown>) ?? {},
    financialIntegrity: (row.financialIntegrity as Record<string, unknown>) ?? {},
    closeReadiness: (row.closeReadiness as Record<string, unknown>) ?? {},
    complianceHealth: (row.complianceHealth as Record<string, unknown>) ?? {},
    operationalRisks: (row.operationalRisks as unknown[]) ?? [],
    significantAnomalies: (row.significantAnomalies as unknown[]) ?? [],
    criticalAlerts: (row.criticalAlerts as unknown[]) ?? [],
    openApprovals: (row.openApprovals as unknown[]) ?? [],
    recommendedActions: (row.recommendedActions as unknown[]) ?? [],
    executiveSummary: row.executiveSummary as string,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    createdAt: (row.createdAt as Date).toISOString(),
    updatedAt: (row.updatedAt as Date).toISOString(),
  };
}

function mapRecommendation(row: Record<string, unknown>): ExecutiveRecommendation {
  return {
    id: row.id as string,
    companyId: row.companyId as string,
    briefingId: (row.briefingId as string | null) ?? null,
    category: row.category as RecommendationCategory,
    title: row.title as string,
    executiveSummary: row.executiveSummary as string,
    businessReason: row.businessReason as string,
    financialImpact: (row.financialImpact as Record<string, unknown>) ?? {},
    confidence: Number(row.confidence),
    riskLevel: row.riskLevel as PriorityUrgency,
    priority: row.priority as number,
    status: row.status as ExecutiveRecommendation["status"],
    requiredApprovals: (row.requiredApprovals as string[]) ?? [],
    suggestedNextSteps: (row.suggestedNextSteps as unknown[]) ?? [],
    evidenceIds: (row.evidenceIds as string[]) ?? [],
    agentDecisionId: (row.agentDecisionId as string | null) ?? null,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    createdAt: (row.createdAt as Date).toISOString(),
    updatedAt: (row.updatedAt as Date).toISOString(),
  };
}

function mapScenario(row: Record<string, unknown>): ScenarioAnalysis {
  return {
    id: row.id as string,
    companyId: row.companyId as string,
    name: row.name as string,
    description: row.description as string,
    scenarioType: row.scenarioType as ScenarioType,
    status: row.status as ScenarioAnalysis["status"],
    parameters: (row.parameters as Record<string, unknown>) ?? {},
    assumptions: (row.assumptions as unknown[]) ?? [],
    results: (row.results as Record<string, unknown>) ?? {},
    riskAssessment: (row.riskAssessment as Record<string, unknown>) ?? {},
    recommendations: (row.recommendations as unknown[]) ?? [],
    sensitivityAnalysis: (row.sensitivityAnalysis as Record<string, unknown>) ?? {},
    runAt: (row.runAt as Date | null)?.toISOString() ?? null,
    completedAt: (row.completedAt as Date | null)?.toISOString() ?? null,
    duration: (row.duration as number | null) ?? null,
    createdAt: (row.createdAt as Date).toISOString(),
    updatedAt: (row.updatedAt as Date).toISOString(),
  };
}

function mapScenarioExecution(row: Record<string, unknown>): ScenarioExecution {
  return {
    id: row.id as string,
    companyId: row.companyId as string,
    scenarioId: row.scenarioId as string,
    status: row.status as string,
    input: (row.input as Record<string, unknown>) ?? {},
    output: (row.output as Record<string, unknown>) ?? {},
    error: (row.error as Record<string, unknown> | null) ?? null,
    startedAt: (row.startedAt as Date).toISOString(),
    completedAt: (row.completedAt as Date | null)?.toISOString() ?? null,
    duration: (row.duration as number | null) ?? null,
    createdAt: (row.createdAt as Date).toISOString(),
  };
}

function mapConversation(row: Record<string, unknown>): ExecutiveConversation {
  return {
    id: row.id as string,
    companyId: row.companyId as string,
    userId: row.userId as string,
    title: row.title as string,
    status: row.status as string,
    context: (row.context as Record<string, unknown>) ?? {},
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    createdAt: (row.createdAt as Date).toISOString(),
    updatedAt: (row.updatedAt as Date).toISOString(),
  };
}

function mapMessage(row: Record<string, unknown>): ExecutiveMessage {
  return {
    id: row.id as string,
    companyId: row.companyId as string,
    conversationId: row.conversationId as string,
    role: row.role as ExecutiveMessage["role"],
    content: row.content as string,
    contentType: row.contentType as ExecutiveMessage["contentType"],
    references: (row.references as unknown[]) ?? [],
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    createdAt: (row.createdAt as Date).toISOString(),
  };
}

function mapInsight(row: Record<string, unknown>): ExecutiveInsight {
  return {
    id: row.id as string,
    companyId: row.companyId as string,
    insightType: row.insightType as InsightType,
    category: row.category as ExecutiveInsight["category"],
    title: row.title as string,
    description: row.description as string,
    severity: row.severity as InsightSeverity,
    data: (row.data as Record<string, unknown>) ?? {},
    sourceType: row.sourceType as ExecutiveInsight["sourceType"],
    sourceId: (row.sourceId as string | null) ?? null,
    acknowledged: row.acknowledged as boolean,
    acknowledgedAt: (row.acknowledgedAt as Date | null)?.toISOString() ?? null,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    createdAt: (row.createdAt as Date).toISOString(),
  };
}

function mapPriority(row: Record<string, unknown>): ExecutivePriority {
  return {
    id: row.id as string,
    companyId: row.companyId as string,
    title: row.title as string,
    description: row.description as string,
    priorityType: row.priorityType as string,
    urgency: row.urgency as PriorityUrgency,
    status: row.status as ExecutivePriority["status"],
    dueDate: (row.dueDate as Date | null)?.toISOString() ?? null,
    referenceType: (row.referenceType as string | null) ?? null,
    referenceId: (row.referenceId as string | null) ?? null,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    createdAt: (row.createdAt as Date).toISOString(),
    updatedAt: (row.updatedAt as Date).toISOString(),
  };
}

function mapDecision(row: Record<string, unknown>): ExecutiveDecision {
  return {
    id: row.id as string,
    companyId: row.companyId as string,
    title: row.title as string,
    description: row.description as string,
    decisionType: row.decisionType as DecisionType,
    status: row.status as ExecutiveDecision["status"],
    recommendation: row.recommendation as string,
    reasoning: row.reasoning as string,
    evidence: (row.evidence as unknown[]) ?? [],
    alternatives: (row.alternatives as unknown[]) ?? [],
    financialImpact: (row.financialImpact as Record<string, unknown>) ?? {},
    riskLevel: row.riskLevel as PriorityUrgency,
    approvedBy: (row.approvedBy as string | null) ?? null,
    approvedAt: (row.approvedAt as Date | null)?.toISOString() ?? null,
    executedAt: (row.executedAt as Date | null)?.toISOString() ?? null,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    createdAt: (row.createdAt as Date).toISOString(),
    updatedAt: (row.updatedAt as Date).toISOString(),
  };
}

function mapWorkspacePreference(row: Record<string, unknown>): ExecutiveWorkspacePreference {
  return {
    id: row.id as string,
    companyId: row.companyId as string,
    userId: row.userId as string,
    layout: (row.layout as Record<string, unknown>) ?? {},
    pinnedWidgets: (row.pinnedWidgets as string[]) ?? [],
    hiddenWidgets: (row.hiddenWidgets as string[]) ?? [],
    briefingTime: (row.briefingTime as string | null) ?? null,
    notificationPrefs: (row.notificationPrefs as Record<string, unknown>) ?? {},
    theme: row.theme as string,
    config: (row.config as Record<string, unknown>) ?? {},
    createdAt: (row.createdAt as Date).toISOString(),
    updatedAt: (row.updatedAt as Date).toISOString(),
  };
}

function mapBoardPack(row: Record<string, unknown>): ExecutiveBoardPack {
  return {
    id: row.id as string,
    companyId: row.companyId as string,
    title: row.title as string,
    period: row.period as string,
    year: row.year as number,
    status: row.status as BoardPackStatus,
    sections: (row.sections as unknown[]) ?? [],
    highlights: (row.highlights as Record<string, unknown>) ?? {},
    commentary: (row.commentary as Record<string, unknown>) ?? {},
    risks: (row.risks as unknown[]) ?? [],
    opportunities: (row.opportunities as unknown[]) ?? [],
    capitalAllocation: (row.capitalAllocation as Record<string, unknown>) ?? {},
    cashStrategy: (row.cashStrategy as Record<string, unknown>) ?? {},
    distributedAt: (row.distributedAt as Date | null)?.toISOString() ?? null,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    createdAt: (row.createdAt as Date).toISOString(),
    updatedAt: (row.updatedAt as Date).toISOString(),
  };
}

function paginate<T>(
  items: T[],
  page: number,
  limit: number,
  total: number,
): PaginatedResult<T> {
  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export class CFOAdvisorService {
  static async generateMorningBriefing(
    ctx: TenantContext,
    input?: GenerateBriefingInput,
  ): Promise<ExecutiveBriefing> {
    const period: BriefingPeriod = input?.period ?? "daily";
    const briefingDate = input?.briefingDate
      ? new Date(input.briefingDate)
      : new Date();

    const existing = await prisma.executiveBriefing.findUnique({
      where: {
        companyId_briefingDate_period: {
          companyId: ctx.companyId,
          briefingDate,
          period,
        },
      },
    });

    if (existing && existing.status === "GENERATED") {
      return mapBriefing(existing);
    }

    const [cashPositions, revenueData, governance, openApprovals, anomalies] =
      await Promise.all([
        this._fetchCashPositions(ctx),
        this._fetchRevenueTrend(ctx),
        this._fetchComplianceHealth(ctx),
        this._fetchOpenApprovals(ctx),
        this._fetchAnomalies(ctx),
      ]);

    const summaryParts: string[] = [];

    if ((cashPositions.totalCash as number) > 0) {
      summaryParts.push(
        `Total cash position: $${(cashPositions.totalCash as number).toLocaleString()}`,
      );
    }

    const lowCashAccounts = cashPositions.lowCashAccounts as string[];
    if (lowCashAccounts?.length > 0) {
      summaryParts.push(
        `${lowCashAccounts.length} account(s) below threshold`,
      );
    }

    const healthScore = (governance as Record<string, unknown>)?.healthScore as number | undefined;
    if (healthScore !== undefined && healthScore < 70) {
      summaryParts.push(`Governance health score critically low: ${healthScore}/100`);
    }

    const approvalCount = (openApprovals as Record<string, unknown>)?.total as number | undefined;
    if (approvalCount !== undefined && approvalCount > 0) {
      summaryParts.push(`${approvalCount} approval(s) pending your review`);
    }

    if ((anomalies as unknown[])?.length > 0) {
      summaryParts.push(`${(anomalies as unknown[]).length} anomaly/anomalies detected today`);
    }

    const recommendedActions: unknown[] = [];
    if (lowCashAccounts?.length > 0) {
      recommendedActions.push({ action: "Fund low-cash accounts from surplus pools", priority: "HIGH" });
    }
    if (healthScore !== undefined && healthScore < 70) {
      recommendedActions.push({ action: "Address governance compliance gaps immediately", priority: "CRITICAL" });
    }
    if ((anomalies as unknown[])?.length > 0) {
      recommendedActions.push({ action: "Review flagged anomalies for potential issues", priority: "MEDIUM" });
    }

    const briefingRecord = await prisma.executiveBriefing.upsert({
      where: {
        companyId_briefingDate_period: {
          companyId: ctx.companyId,
          briefingDate,
          period,
        },
      },
      create: {
        companyId: ctx.companyId,
        briefingDate,
        period,
        status: "GENERATED",
        cashPosition: cashPositions as Prisma.InputJsonValue,
        liquidity: (cashPositions.liquidity ?? {}) as Prisma.InputJsonValue,
        revenueTrends: revenueData as Prisma.InputJsonValue,
        expenseTrends: (revenueData.expenses ?? {}) as Prisma.InputJsonValue,
        complianceHealth: governance as Prisma.InputJsonValue,
        openApprovals: (openApprovals.items ?? []) as Prisma.InputJsonValue,
        significantAnomalies: anomalies as unknown as Prisma.InputJsonValue,
        recommendedActions: recommendedActions as Prisma.InputJsonValue,
        executiveSummary: summaryParts.join(". "),
      },
      update: {
        status: "GENERATED",
        cashPosition: cashPositions as Prisma.InputJsonValue,
        liquidity: (cashPositions.liquidity ?? {}) as Prisma.InputJsonValue,
        revenueTrends: revenueData as Prisma.InputJsonValue,
        expenseTrends: (revenueData.expenses ?? {}) as Prisma.InputJsonValue,
        complianceHealth: governance as Prisma.InputJsonValue,
        openApprovals: (openApprovals.items ?? []) as Prisma.InputJsonValue,
        significantAnomalies: anomalies as unknown as Prisma.InputJsonValue,
        recommendedActions: recommendedActions as Prisma.InputJsonValue,
        executiveSummary: summaryParts.join(". "),
        updatedAt: new Date(),
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "cfo_advisor.briefing.generated",
      resourceType: "ExecutiveBriefing",
      resourceId: briefingRecord.id,
      metadata: { period, summaryLength: summaryParts.length } as Prisma.InputJsonValue,
    });

    return mapBriefing(briefingRecord);
  }

  static async getLatestBriefing(
    ctx: TenantContext,
    period?: BriefingPeriod,
  ): Promise<ExecutiveBriefing | null> {
    const row = await prisma.executiveBriefing.findFirst({
      where: {
        companyId: ctx.companyId,
        ...(period ? { period } : {}),
      },
      orderBy: { briefingDate: "desc" },
    });
    return row ? mapBriefing(row) : null;
  }

  static async getBriefings(
    ctx: TenantContext,
    query: BriefingQuery,
  ): Promise<PaginatedResult<ExecutiveBriefing>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.ExecutiveBriefingWhereInput = {
      companyId: ctx.companyId,
      ...(query.period ? { period: query.period } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.startDate || query.endDate
        ? {
            briefingDate: {
              ...(query.startDate ? { gte: new Date(query.startDate) } : {}),
              ...(query.endDate ? { lte: new Date(query.endDate) } : {}),
            },
          }
        : {}),
    };

    const [rows, total] = await Promise.all([
      prisma.executiveBriefing.findMany({
        where,
        orderBy: { briefingDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.executiveBriefing.count({ where }),
    ]);

    return paginate(rows.map(mapBriefing), page, limit, total);
  }

  static async getRecommendations(
    ctx: TenantContext,
    query: RecommendationQuery,
  ): Promise<PaginatedResult<ExecutiveRecommendation>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.ExecutiveRecommendationWhereInput = {
      companyId: ctx.companyId,
      ...(query.category ? { category: query.category } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.riskLevel ? { riskLevel: query.riskLevel } : {}),
    };

    const [rows, total] = await Promise.all([
      prisma.executiveRecommendation.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.executiveRecommendation.count({ where }),
    ]);

    return paginate(rows.map(mapRecommendation), page, limit, total);
  }

  static async createRecommendation(
    ctx: TenantContext,
    input: CreateRecommendationInput,
  ): Promise<ExecutiveRecommendation> {
    const row = await prisma.executiveRecommendation.create({
      data: {
        companyId: ctx.companyId,
        briefingId: input.briefingId ?? null,
        category: input.category,
        title: input.title,
        executiveSummary: input.executiveSummary ?? "",
        businessReason: input.businessReason ?? "",
        financialImpact: (input.financialImpact ?? {}) as Prisma.InputJsonValue,
        confidence: input.confidence ?? 0.5,
        riskLevel: input.riskLevel ?? "MEDIUM",
        priority: input.priority ?? 50,
        status: "PENDING",
        requiredApprovals: (input.requiredApprovals ?? []) as string[],
        suggestedNextSteps: (input.suggestedNextSteps ?? []) as unknown as Prisma.InputJsonValue,
        evidenceIds: (input.evidenceIds ?? []) as string[],
        agentDecisionId: input.agentDecisionId ?? null,
        metadata: {} as Prisma.InputJsonValue,
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "cfo_advisor.recommendation.created",
      resourceType: "ExecutiveRecommendation",
      resourceId: row.id,
      metadata: { category: input.category } as Prisma.InputJsonValue,
    });

    return mapRecommendation(row);
  }

  static async acknowledgeRecommendation(
    ctx: TenantContext,
    id: string,
  ): Promise<ExecutiveRecommendation> {
    const row = await this._getRecommendation(ctx, id);
    if (row.status !== "PENDING") {
      throw new ConflictError(`Recommendation is already ${row.status.toLowerCase()}`);
    }

    const updated = await prisma.executiveRecommendation.update({
      where: { id },
      data: { status: "ACKNOWLEDGED", updatedAt: new Date() },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "cfo_advisor.recommendation.acknowledged",
      resourceType: "ExecutiveRecommendation",
      resourceId: id,
    });

    return mapRecommendation(updated);
  }

  static async acceptRecommendation(
    ctx: TenantContext,
    id: string,
  ): Promise<ExecutiveRecommendation> {
    const row = await this._getRecommendation(ctx, id);
    if (!["PENDING", "ACKNOWLEDGED"].includes(row.status)) {
      throw new ConflictError(`Cannot accept recommendation in ${row.status.toLowerCase()} status`);
    }

    const updated = await prisma.executiveRecommendation.update({
      where: { id },
      data: { status: "ACCEPTED", updatedAt: new Date() },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "cfo_advisor.recommendation.accepted",
      resourceType: "ExecutiveRecommendation",
      resourceId: id,
    });

    return mapRecommendation(updated);
  }

  static async rejectRecommendation(
    ctx: TenantContext,
    id: string,
  ): Promise<ExecutiveRecommendation> {
    const row = await this._getRecommendation(ctx, id);
    if (!["PENDING", "ACKNOWLEDGED"].includes(row.status)) {
      throw new ConflictError(`Cannot reject recommendation in ${row.status.toLowerCase()} status`);
    }

    const updated = await prisma.executiveRecommendation.update({
      where: { id },
      data: { status: "REJECTED", updatedAt: new Date() },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "cfo_advisor.recommendation.rejected",
      resourceType: "ExecutiveRecommendation",
      resourceId: id,
    });

    return mapRecommendation(updated);
  }

  static async runScenario(
    ctx: TenantContext,
    input: RunScenarioInput,
  ): Promise<ScenarioAnalysis> {
    const scenario = await prisma.scenarioAnalysis.create({
      data: {
        companyId: ctx.companyId,
        name: input.name,
        description: input.description ?? "",
        scenarioType: input.scenarioType,
        status: "RUNNING",
        parameters: (input.parameters ?? {}) as Prisma.InputJsonValue,
        assumptions: (input.assumptions ?? []) as Prisma.InputJsonValue,
      },
    });

    const execution = await prisma.scenarioExecution.create({
      data: {
        companyId: ctx.companyId,
        scenarioId: scenario.id,
        status: "RUNNING",
        input: (input.parameters ?? {}) as Prisma.InputJsonValue,
        output: {} as Prisma.InputJsonValue,
      },
    });

    const startTime = Date.now();
    try {
      const results = this._computeScenarioResults(
        input.scenarioType,
        input.parameters ?? {},
      );

      await prisma.scenarioExecution.update({
        where: { id: execution.id },
        data: {
          status: "COMPLETED",
          output: results.output as Prisma.InputJsonValue,
          completedAt: new Date(),
          duration: Date.now() - startTime,
        },
      });

      const updatedScenario = await prisma.scenarioAnalysis.update({
        where: { id: scenario.id },
        data: {
          status: "COMPLETED",
          results: results.output as Prisma.InputJsonValue,
          riskAssessment: { risks: results.risks } as Prisma.InputJsonValue,
          recommendations: results.recommendations as Prisma.InputJsonValue,
          runAt: new Date(),
          completedAt: new Date(),
          duration: Date.now() - startTime,
        },
      });

      await recordAudit(prisma, {
        companyId: ctx.companyId,
        actorUserId: ctx.userId,
        action: "cfo_advisor.scenario.executed",
        resourceType: "ScenarioAnalysis",
        resourceId: scenario.id,
        metadata: {
          scenarioType: input.scenarioType,
          duration: Date.now() - startTime,
        } as Prisma.InputJsonValue,
      });

      return mapScenario(updatedScenario);
    } catch (err) {
      await prisma.scenarioExecution.update({
        where: { id: execution.id },
        data: {
          status: "FAILED",
          error: { message: String(err) } as Prisma.InputJsonValue,
          completedAt: new Date(),
          duration: Date.now() - startTime,
        },
      });

      await prisma.scenarioAnalysis.update({
        where: { id: scenario.id },
        data: {
          status: "FAILED",
        },
      });

      throw err;
    }
  }

  static async getScenarios(
    ctx: TenantContext,
    query?: ScenarioQuery,
  ): Promise<PaginatedResult<ScenarioAnalysis>> {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 20;
    const where: Prisma.ScenarioAnalysisWhereInput = {
      companyId: ctx.companyId,
      ...(query?.scenarioType ? { scenarioType: query.scenarioType } : {}),
      ...(query?.status ? { status: query.status } : {}),
    };

    const [rows, total] = await Promise.all([
      prisma.scenarioAnalysis.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.scenarioAnalysis.count({ where }),
    ]);

    return paginate(rows.map(mapScenario), page, limit, total);
  }

  static async getScenario(
    ctx: TenantContext,
    id: string,
  ): Promise<ScenarioAnalysis> {
    const row = await prisma.scenarioAnalysis.findFirst({
      where: { id, companyId: ctx.companyId },
    });
    if (!row) throw new NotFoundError("Scenario analysis");
    return mapScenario(row);
  }

  static async getConversations(
    ctx: TenantContext,
    userId: string,
  ): Promise<ExecutiveConversation[]> {
    const rows = await prisma.executiveConversation.findMany({
      where: { companyId: ctx.companyId, userId },
      orderBy: { updatedAt: "desc" },
    });
    return rows.map(mapConversation);
  }

  static async createConversation(
    ctx: TenantContext,
    userId: string,
    title: string,
  ): Promise<ExecutiveConversation> {
    const row = await prisma.executiveConversation.create({
      data: {
        companyId: ctx.companyId,
        userId,
        title: title || "New Conversation",
        context: {} as Prisma.InputJsonValue,
        metadata: {} as Prisma.InputJsonValue,
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "cfo_advisor.conversation.created",
      resourceType: "ExecutiveConversation",
      resourceId: row.id,
    });

    return mapConversation(row);
  }

  static async sendMessage(
    ctx: TenantContext,
    conversationId: string,
    content: string,
    contentType?: string,
    references?: unknown[],
  ): Promise<ExecutiveMessage[]> {
    const conversation = await prisma.executiveConversation.findFirst({
      where: { id: conversationId, companyId: ctx.companyId },
    });
    if (!conversation) throw new NotFoundError("Conversation");

    const userMessage = await prisma.executiveMessage.create({
      data: {
        companyId: ctx.companyId,
        conversationId,
        role: "user",
        content,
        contentType: contentType ?? "text",
        references: (references ?? []) as Prisma.InputJsonValue,
        metadata: {} as Prisma.InputJsonValue,
      },
    });

    const advisorResponse = await this._generateAdvisorResponse(
      ctx,
      conversationId,
      content,
    );

    const advisorMessage = await prisma.executiveMessage.create({
      data: {
        companyId: ctx.companyId,
        conversationId,
        role: "advisor",
        content: advisorResponse,
        contentType: "text",
        references: [] as Prisma.InputJsonValue,
        metadata: {} as Prisma.InputJsonValue,
      },
    });

    await prisma.executiveConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return [mapMessage(userMessage), mapMessage(advisorMessage)];
  }

  static async getConversationMessages(
    ctx: TenantContext,
    conversationId: string,
  ): Promise<ExecutiveMessage[]> {
    const conversation = await prisma.executiveConversation.findFirst({
      where: { id: conversationId, companyId: ctx.companyId },
    });
    if (!conversation) throw new NotFoundError("Conversation");

    const rows = await prisma.executiveMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });
    return rows.map(mapMessage);
  }

  static async getInsights(
    ctx: TenantContext,
    query?: InsightQuery,
  ): Promise<PaginatedResult<ExecutiveInsight>> {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 20;
    const where: Prisma.ExecutiveInsightWhereInput = {
      companyId: ctx.companyId,
      ...(query?.insightType ? { insightType: query.insightType } : {}),
      ...(query?.category ? { category: query.category } : {}),
      ...(query?.severity ? { severity: query.severity } : {}),
      ...(query?.acknowledged !== undefined ? { acknowledged: query.acknowledged } : {}),
    };

    const [rows, total] = await Promise.all([
      prisma.executiveInsight.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.executiveInsight.count({ where }),
    ]);

    return paginate(rows.map(mapInsight), page, limit, total);
  }

  static async acknowledgeInsight(
    ctx: TenantContext,
    id: string,
  ): Promise<ExecutiveInsight> {
    const row = await prisma.executiveInsight.findFirst({
      where: { id, companyId: ctx.companyId },
    });
    if (!row) throw new NotFoundError("Executive insight");

    if (row.acknowledged) {
      throw new ConflictError("Insight already acknowledged");
    }

    const updated = await prisma.executiveInsight.update({
      where: { id },
      data: {
        acknowledged: true,
        acknowledgedAt: new Date(),
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "cfo_advisor.insight.acknowledged",
      resourceType: "ExecutiveInsight",
      resourceId: id,
    });

    return mapInsight(updated);
  }

  static async getPriorities(
    ctx: TenantContext,
    query?: PriorityQuery,
  ): Promise<PaginatedResult<ExecutivePriority>> {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 20;
    const where: Prisma.ExecutivePriorityWhereInput = {
      companyId: ctx.companyId,
      ...(query?.urgency ? { urgency: query.urgency } : {}),
      ...(query?.status ? { status: query.status } : {}),
      ...(query?.priorityType ? { priorityType: query.priorityType } : {}),
    };

    const [rows, total] = await Promise.all([
      prisma.executivePriority.findMany({
        where,
        orderBy: [{ urgency: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.executivePriority.count({ where }),
    ]);

    return paginate(rows.map(mapPriority), page, limit, total);
  }

  static async createPriority(
    ctx: TenantContext,
    input: CreatePriorityInput,
  ): Promise<ExecutivePriority> {
    const row = await prisma.executivePriority.create({
      data: {
        companyId: ctx.companyId,
        title: input.title,
        description: input.description ?? "",
        priorityType: input.priorityType,
        urgency: input.urgency ?? "MEDIUM",
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        referenceType: input.referenceType,
        referenceId: input.referenceId,
        metadata: {} as Prisma.InputJsonValue,
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "cfo_advisor.priority.created",
      resourceType: "ExecutivePriority",
      resourceId: row.id,
    });

    return mapPriority(row);
  }

  static async completePriority(
    ctx: TenantContext,
    id: string,
  ): Promise<ExecutivePriority> {
    const row = await prisma.executivePriority.findFirst({
      where: { id, companyId: ctx.companyId },
    });
    if (!row) throw new NotFoundError("Executive priority");

    if (row.status === "COMPLETED") {
      throw new ConflictError("Priority already completed");
    }

    const updated = await prisma.executivePriority.update({
      where: { id },
      data: {
        status: "COMPLETED",
        updatedAt: new Date(),
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "cfo_advisor.priority.completed",
      resourceType: "ExecutivePriority",
      resourceId: id,
    });

    return mapPriority(updated);
  }

  static async getDecisions(
    ctx: TenantContext,
    query?: DecisionQuery,
  ): Promise<PaginatedResult<ExecutiveDecision>> {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 20;
    const where: Prisma.ExecutiveDecisionWhereInput = {
      companyId: ctx.companyId,
      ...(query?.decisionType ? { decisionType: query.decisionType } : {}),
      ...(query?.status ? { status: query.status } : {}),
      ...(query?.riskLevel ? { riskLevel: query.riskLevel } : {}),
    };

    const [rows, total] = await Promise.all([
      prisma.executiveDecision.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.executiveDecision.count({ where }),
    ]);

    return paginate(rows.map(mapDecision), page, limit, total);
  }

  static async createDecision(
    ctx: TenantContext,
    input: CreateDecisionInput,
  ): Promise<ExecutiveDecision> {
    const row = await prisma.executiveDecision.create({
      data: {
        companyId: ctx.companyId,
        title: input.title,
        description: input.description ?? "",
        decisionType: input.decisionType,
        recommendation: input.recommendation ?? "",
        reasoning: input.reasoning ?? "",
        riskLevel: input.riskLevel ?? "LOW",
        evidence: (input.evidence ?? []) as Prisma.InputJsonValue,
        alternatives: (input.alternatives ?? []) as Prisma.InputJsonValue,
        financialImpact: (input.financialImpact ?? {}) as Prisma.InputJsonValue,
        metadata: {} as Prisma.InputJsonValue,
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "cfo_advisor.decision.created",
      resourceType: "ExecutiveDecision",
      resourceId: row.id,
      metadata: { decisionType: input.decisionType } as Prisma.InputJsonValue,
    });

    return mapDecision(row);
  }

  static async approveDecision(
    ctx: TenantContext,
    id: string,
    userId: string,
  ): Promise<ExecutiveDecision> {
    const row = await prisma.executiveDecision.findFirst({
      where: { id, companyId: ctx.companyId },
    });
    if (!row) throw new NotFoundError("Executive decision");
    if (row.status !== "PENDING") {
      throw new ConflictError(`Decision is already ${row.status.toLowerCase()}`);
    }

    const updated = await prisma.executiveDecision.update({
      where: { id },
      data: {
        status: "APPROVED",
        approvedBy: userId,
        approvedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "cfo_advisor.decision.approved",
      resourceType: "ExecutiveDecision",
      resourceId: id,
    });

    return mapDecision(updated);
  }

  static async getCFOBoardPack(
    ctx: TenantContext,
    period: string,
    year: number,
  ): Promise<ExecutiveBoardPack | null> {
    const row = await prisma.executiveBoardPack.findUnique({
      where: {
        companyId_period_year: {
          companyId: ctx.companyId,
          period,
          year,
        },
      },
    });
    return row ? mapBoardPack(row) : null;
  }

  static async generateBoardPack(
    ctx: TenantContext,
    period: string,
    year: number,
  ): Promise<ExecutiveBoardPack> {
    const existing = await prisma.executiveBoardPack.findUnique({
      where: {
        companyId_period_year: {
          companyId: ctx.companyId,
          period,
          year,
        },
      },
    });

    if (existing && existing.status === "READY") {
      return mapBoardPack(existing);
    }

    const [briefings, recommendations, priorities, decisions, insights] =
      await Promise.all([
        prisma.executiveBriefing.findMany({
          where: { companyId: ctx.companyId, period },
          orderBy: { briefingDate: "desc" },
          take: 30,
        }),
        prisma.executiveRecommendation.findMany({
          where: { companyId: ctx.companyId },
          orderBy: { createdAt: "desc" },
          take: 50,
        }),
        prisma.executivePriority.findMany({
          where: { companyId: ctx.companyId, status: { not: "COMPLETED" } },
          orderBy: [{ urgency: "desc" }, { createdAt: "desc" }],
        }),
        prisma.executiveDecision.findMany({
          where: { companyId: ctx.companyId },
          orderBy: { createdAt: "desc" },
          take: 30,
        }),
        prisma.executiveInsight.findMany({
          where: { companyId: ctx.companyId, acknowledged: false },
          orderBy: { createdAt: "desc" },
          take: 30,
        }),
      ]);

    const sections = {
      briefings: briefings.length,
      recommendations: recommendations.length,
      openPriorities: priorities.length,
      decisions: decisions.length,
      unacknowledgedInsights: insights.length,
    };

    const highlightSummaries: Record<string, unknown> = {};
    for (const b of briefings.slice(0, 5)) {
      highlightSummaries[b.period] = b.executiveSummary || "";
    }

    const riskSummaries = decisions
      .filter((d) => d.riskLevel === "HIGH" || d.riskLevel === "CRITICAL")
      .map((d) => d.title);

    const opportunitySummaries = insights
      .filter((i) => i.insightType === "opportunity")
      .map((i) => i.title);

    const boardPackData = existing
      ? await prisma.executiveBoardPack.update({
          where: { id: existing.id },
          data: {
            status: "READY",
            sections: sections as unknown as Prisma.InputJsonValue,
            highlights: highlightSummaries as Prisma.InputJsonValue,
            risks: riskSummaries as unknown as Prisma.InputJsonValue,
            opportunities: opportunitySummaries as unknown as Prisma.InputJsonValue,
          },
        })
      : await prisma.executiveBoardPack.create({
          data: {
            companyId: ctx.companyId,
            title: `${period} ${year} Board Pack`,
            period,
            year,
            status: "READY",
            sections: sections as unknown as Prisma.InputJsonValue,
            highlights: highlightSummaries as Prisma.InputJsonValue,
            risks: riskSummaries as unknown as Prisma.InputJsonValue,
            opportunities: opportunitySummaries as unknown as Prisma.InputJsonValue,
          },
        });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "cfo_advisor.board_pack.generated",
      resourceType: "ExecutiveBoardPack",
      resourceId: boardPackData.id,
      metadata: { period, year } as Prisma.InputJsonValue,
    });

    return mapBoardPack(boardPackData);
  }

  static async getWorkspacePreferences(
    ctx: TenantContext,
    userId: string,
  ): Promise<ExecutiveWorkspacePreference | null> {
    const row = await prisma.executiveWorkspacePreference.findFirst({
      where: { companyId: ctx.companyId, userId },
    });
    return row ? mapWorkspacePreference(row) : null;
  }

  static async updateWorkspacePreferences(
    ctx: TenantContext,
    userId: string,
    prefs: UpdateWorkspacePreferencesInput,
  ): Promise<ExecutiveWorkspacePreference> {
    const existing = await prisma.executiveWorkspacePreference.findFirst({
      where: { companyId: ctx.companyId, userId },
    });

    if (existing) {
      const updated = await prisma.executiveWorkspacePreference.update({
        where: { id: existing.id },
        data: {
          ...(prefs.layout !== undefined
            ? { layout: prefs.layout as Prisma.InputJsonValue }
            : {}),
          ...(prefs.pinnedWidgets !== undefined
            ? { pinnedWidgets: prefs.pinnedWidgets }
            : {}),
          ...(prefs.hiddenWidgets !== undefined
            ? { hiddenWidgets: prefs.hiddenWidgets }
            : {}),
          ...(prefs.briefingTime !== undefined
            ? { briefingTime: prefs.briefingTime }
            : {}),
          ...(prefs.notificationPrefs !== undefined
            ? { notificationPrefs: prefs.notificationPrefs as Prisma.InputJsonValue }
            : {}),
          ...(prefs.theme !== undefined ? { theme: prefs.theme } : {}),
          ...(prefs.config !== undefined
            ? { config: prefs.config as Prisma.InputJsonValue }
            : {}),
          updatedAt: new Date(),
        },
      });
      return mapWorkspacePreference(updated);
    }

    const created = await prisma.executiveWorkspacePreference.create({
      data: {
        companyId: ctx.companyId,
        userId,
        layout: (prefs.layout ?? {}) as Prisma.InputJsonValue,
        pinnedWidgets: prefs.pinnedWidgets ?? [],
        hiddenWidgets: prefs.hiddenWidgets ?? [],
        briefingTime: prefs.briefingTime ?? null,
        notificationPrefs: (prefs.notificationPrefs ?? {}) as Prisma.InputJsonValue,
        theme: prefs.theme ?? "dark",
        config: (prefs.config ?? {}) as Prisma.InputJsonValue,
      },
    });

    return mapWorkspacePreference(created);
  }

  static async getDashboardData(
    ctx: TenantContext,
  ): Promise<CFODashboardData> {
    const [briefing, priorities, recommendations, insights, decisions, scenarios, conversationCount] =
      await Promise.all([
        prisma.executiveBriefing.findFirst({
          where: { companyId: ctx.companyId },
          orderBy: { briefingDate: "desc" },
        }),
        prisma.executivePriority.findMany({
          where: { companyId: ctx.companyId, status: { not: "COMPLETED" } },
          orderBy: [{ urgency: "desc" }, { createdAt: "desc" }],
          take: 10,
        }),
        prisma.executiveRecommendation.findMany({
          where: { companyId: ctx.companyId, status: "PENDING" },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
        prisma.executiveInsight.findMany({
          where: { companyId: ctx.companyId, acknowledged: false },
          orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
          take: 10,
        }),
        prisma.executiveDecision.findMany({
          where: { companyId: ctx.companyId, status: "PENDING" },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
        prisma.scenarioAnalysis.findMany({
          where: { companyId: ctx.companyId },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
        prisma.executiveConversation.count({
          where: { companyId: ctx.companyId, status: "ACTIVE" },
        }),
      ]);

    return {
      briefing: briefing ? mapBriefing(briefing) : null,
      priorities: priorities.map(mapPriority),
      recommendations: recommendations.map(mapRecommendation),
      insights: insights.map(mapInsight),
      decisions: decisions.map(mapDecision),
      scenarios: scenarios.map(mapScenario),
      conversationCount,
    };
  }

  private static async _getRecommendation(
    ctx: TenantContext,
    id: string,
  ) {
    const row = await prisma.executiveRecommendation.findFirst({
      where: { id, companyId: ctx.companyId },
    });
    if (!row) throw new NotFoundError("Executive recommendation");
    return row;
  }

  private static async _fetchCashPositions(
    ctx: TenantContext,
  ): Promise<Record<string, unknown>> {
    try {
      const positions = await prisma.treasuryCashPosition.findMany({
        where: { companyId: ctx.companyId },
        orderBy: { recordedAt: "desc" },
        take: 50,
      });

      const totalCash = positions.reduce(
        (sum, p) => sum + Number(p.totalBalance),
        0,
      );
      const accounts = positions.map((p) => ({
        accountId: p.bankAccountId,
        balance: Number(p.totalBalance),
        currency: p.currency,
        institution: p.institutionName,
      }));

      const lowThreshold = 10_000;
      const lowCashAccounts = accounts
        .filter((a) => a.balance < lowThreshold)
        .map((a) => a.accountId);

      const liquidity = {
        totalCash,
        accountCount: accounts.length,
        lowCashCount: lowCashAccounts.length,
        currencies: [...new Set(accounts.map((a) => a.currency))],
      };

      return { totalCash, accounts: accounts.slice(0, 10), lowCashAccounts, liquidity };
    } catch {
      return { totalCash: 0, accounts: [], lowCashAccounts: [], liquidity: {} };
    }
  }

  private static async _fetchRevenueTrend(
    ctx: TenantContext,
  ): Promise<Record<string, unknown>> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000);
      const entries = await prisma.ledgerEntry.findMany({
        where: {
          companyId: ctx.companyId,
          createdAt: { gte: thirtyDaysAgo },
        },
        orderBy: { createdAt: "desc" },
        take: 200,
      });

      let totalAmount = 0;
      for (const e of entries) {
        totalAmount += Number(e.amount);
      }

      return {
        totalAmount,
        entryCount: entries.length,
        period: "last_30_days",
      };
    } catch {
      return { totalAmount: 0, entryCount: 0, period: "last_30_days" };
    }
  }

  private static async _fetchComplianceHealth(
    ctx: TenantContext,
  ): Promise<Record<string, unknown>> {
    try {
      const [violations, activePolicies, frameworks] = await Promise.all([
        prisma.policyViolation.findMany({
          where: { companyId: ctx.companyId },
          select: { severity: true, status: true },
        }),
        prisma.policy.count({
          where: { companyId: ctx.companyId, enabled: true },
        }),
        prisma.governanceFramework.count({
          where: { companyId: ctx.companyId, status: "ACTIVE" },
        }),
      ]);

      const openViolations = violations.filter((v) => v.status === "OPEN").length;
      const criticalViolations = violations.filter(
        (v) => v.severity === "CRITICAL",
      ).length;

      const healthScore = Math.max(
        0,
        100 - openViolations * 10 - criticalViolations * 25,
      );

      return {
        healthScore,
        totalViolations: violations.length,
        openViolations,
        criticalViolations,
        activePolicies,
        activeFrameworks: frameworks,
      };
    } catch {
      return {
        healthScore: 0,
        totalViolations: 0,
        openViolations: 0,
        criticalViolations: 0,
        activePolicies: 0,
        activeFrameworks: 0,
      };
    }
  }

  private static async _fetchOpenApprovals(
    ctx: TenantContext,
  ): Promise<Record<string, unknown>> {
    try {
      const threads = await prisma.approvalThread.findMany({
        where: { companyId: ctx.companyId },
        include: {
          comments: {
            select: { id: true, body: true, createdAt: true },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      });

      return {
        total: threads.length,
        items: threads.slice(0, 5).map((t) => ({
          id: t.id,
          transactionId: t.transactionId,
          latestComment: t.comments[0]?.body ?? null,
          createdAt: t.createdAt.toISOString(),
        })),
      };
    } catch {
      return { total: 0, items: [] };
    }
  }

  private static async _fetchAnomalies(
    ctx: TenantContext,
  ): Promise<unknown[]> {
    try {
      const snapshots = await prisma.intelligenceSnapshot.findMany({
        where: { companyId: ctx.companyId },
        orderBy: { takenAt: "desc" },
        take: 50,
        select: { metric: true, value: true, label: true, takenAt: true },
      });

      const byMetric: Record<string, number[]> = {};
      for (const s of snapshots) {
        if (!byMetric[s.metric]) byMetric[s.metric] = [];
        byMetric[s.metric].push(Number(s.value));
      }

      const anomalies: unknown[] = [];
      for (const [metric, values] of Object.entries(byMetric)) {
        if (values.length < 4) continue;
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance =
          values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
        const stdDev = Math.sqrt(variance);
        const latest = values[0];
        if (stdDev > 0 && Math.abs(latest - mean) / stdDev > 2) {
          anomalies.push({
            metric,
            currentValue: latest,
            mean,
            deviation: Math.abs(latest - mean) / stdDev,
            direction: latest > mean ? "spike" : "drop",
          });
        }
      }

      return anomalies;
    } catch {
      return [];
    }
  }

  private static _computeScenarioResults(
    scenarioType: ScenarioType,
    params: Record<string, unknown>,
  ): {
    output: Record<string, unknown>;
    risks: string[];
    recommendations: string[];
  } {
    const baseAmount = (params.baseAmount as number) ?? 1_000_000;
    const changeRate = (params.changeRate as number) ?? 0.1;
    const risks: string[] = [];
    const recommendations: string[] = [];

    switch (scenarioType) {
      case "revenue_decline": {
        const revenueImpact = baseAmount * changeRate;
        risks.push(`Revenue reduction of $${revenueImpact.toLocaleString()}`);
        recommendations.push("Implement cost reduction plan targeting 60% of revenue impact");
        return {
          output: {
            scenarioType,
            revenueImpact: -revenueImpact,
            breakEvenMonths: Math.ceil((baseAmount * 0.3) / (revenueImpact / 12)),
            marginImpact: -(changeRate * 100),
          },
          risks,
          recommendations,
        };
      }
      case "revenue_growth": {
        const growthAmount = baseAmount * changeRate;
        recommendations.push("Invest in sales capacity to sustain growth trajectory");
        return {
          output: {
            scenarioType,
            growthAmount,
            projectedRevenue: baseAmount + growthAmount,
            hiringNeed: Math.ceil(growthAmount / 200_000),
          },
          risks: ["Growth may outpace operational capacity"],
          recommendations,
        };
      }
      case "payroll_increase": {
        const increaseAmount = baseAmount * changeRate;
        risks.push(`Annual payroll increase of $${increaseAmount.toLocaleString()}`);
        recommendations.push("Evaluate productivity gains to offset cost increase");
        return {
          output: {
            scenarioType,
            annualIncrease: increaseAmount,
            monthlyImpact: increaseAmount / 12,
            headcountIncrease: Math.ceil(increaseAmount / 100_000),
          },
          risks,
          recommendations,
        };
      }
      case "hiring_freeze": {
        const savings = baseAmount * changeRate;
        recommendations.push("Prioritize critical roles for exception approval");
        return {
          output: {
            scenarioType,
            projectedSavings: savings,
            riskReduction: changeRate * 0.5,
            deliveryImpact: "MODERATE",
          },
          risks: ["Key person dependency increases"],
          recommendations,
        };
      }
      case "customer_default": {
        const defaultAmount = baseAmount * changeRate;
        risks.push(`Customer default exposure of $${defaultAmount.toLocaleString()}`);
        recommendations.push("Review credit limits for top 20 customers");
        return {
          output: {
            scenarioType,
            exposureAmount: defaultAmount,
            badDebtProvision: defaultAmount * 0.8,
            insuranceRecovery: defaultAmount * 0.3,
          },
          risks,
          recommendations,
        };
      }
      case "fx_movement": {
        const fxExposure = (params.exposureAmount as number) ?? baseAmount;
        const rateChange = (params.rateChange as number) ?? 0.05;
        const impact = fxExposure * rateChange;
        risks.push(`FX impact of $${impact.toLocaleString()} with ${(rateChange * 100).toFixed(1)}% movement`);
        recommendations.push("Hedge 50% of net foreign currency exposure");
        return {
          output: {
            scenarioType,
            fxExposure,
            rateChange,
            impactAmount: impact,
            hedgeRecommendation: "PARTIAL",
          },
          risks,
          recommendations,
        };
      }
      case "interest_rate": {
        const rateShift = (params.rateShift as number) ?? 0.02;
        const interestImpact = baseAmount * rateShift;
        risks.push(
          `Interest expense change of $${interestImpact.toLocaleString()} with ${(rateShift * 100).toFixed(1)}% rate movement`,
        );
        recommendations.push("Evaluate fixed-rate hedging for 50% of floating exposure");
        return {
          output: {
            scenarioType,
            rateShift,
            annualImpact: interestImpact,
            hedgeRecommendation: rateShift > 0 ? "FIXED" : "FLOATING",
          },
          risks,
          recommendations,
        };
      }
      case "tax_increase": {
        const taxImpact = baseAmount * changeRate;
        risks.push(`Additional tax liability of $${taxImpact.toLocaleString()}`);
        recommendations.push("Accelerate deductible expenses into current period");
        return {
          output: {
            scenarioType,
            additionalLiability: taxImpact,
            quarterlyImpact: taxImpact / 4,
            effectiveRateChange: changeRate * 100,
          },
          risks,
          recommendations,
        };
      }
      case "acquisition": {
        const dealValue = (params.dealValue as number) ?? baseAmount;
        risks.push(
          `Integration risk on $${dealValue.toLocaleString()} acquisition`,
        );
        recommendations.push("Complete due diligence within 90-day window");
        recommendations.push("Establish integration PMO with weekly steering committee");
        return {
          output: {
            scenarioType,
            dealValue,
            projectedROI: 0.15,
            paybackYears: 4,
            integrationComplexity: "HIGH",
          },
          risks,
          recommendations,
        };
      }
      case "capex": {
        const capexAmount = (params.capexAmount as number) ?? baseAmount;
        risks.push(`Capital expenditure commitment of $${capexAmount.toLocaleString()}`);
        recommendations.push("Phase investment over 12 months to manage cash flow");
        return {
          output: {
            scenarioType,
            capexAmount,
            depreciationAnnual: capexAmount / 5,
            paybackPeriod: 36,
          },
          risks,
          recommendations,
        };
      }
      default:
        return {
          output: { scenarioType, parameters: params },
          risks: ["Unspecified scenario type"],
          recommendations: ["Define scenario parameters for meaningful analysis"],
        };
    }
  }

  private static async _generateAdvisorResponse(
    _ctx: TenantContext,
    _conversationId: string,
    userMessage: string,
  ): Promise<string> {
    const lowerMsg = userMessage.toLowerCase();

    if (lowerMsg.includes("cash") || lowerMsg.includes("liquidity")) {
      return "Based on your current cash positions, I recommend reviewing accounts with balances below threshold. Consider consolidating surplus funds and establishing an automated sweep arrangement. Would you like me to run a cash flow stress scenario?";
    }
    if (lowerMsg.includes("approval") || lowerMsg.includes("pending")) {
      return "You have pending approvals requiring attention. Prioritize approvals flagged as CRITICAL urgency. I can surface the details of any specific approval if you'd like.";
    }
    if (lowerMsg.includes("budget") || lowerMsg.includes("forecast")) {
      return "I can generate a scenario analysis for budget vs. actual variance. Consider running a working capital analysis to project cash needs for the next quarter. Shall I prepare a board pack with the latest financial summary?";
    }
    if (lowerMsg.includes("risk") || lowerMsg.includes("compliance")) {
      return "Your governance health score reflects current compliance posture. I recommend addressing any open CRITICAL violations first. I can generate a risk-focused scenario analysis if needed.";
    }
    return "I'm your CFO Advisor assistant. I can help with cash management, approvals, budgeting, risk assessment, and scenario analysis. What would you like to focus on?";
  }
}
