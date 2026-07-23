import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { recordAudit } from "@/modules/audit";
import { NotFoundError, ValidationError, ConflictError } from "@/lib/errors/app-error";
import type { DecisionStatus, RiskLevel } from "./types";

export interface DecisionCreateInput {
  sessionId?: string;
  taskId?: string;
  title: string;
  recommendation: string;
  reason?: string;
  confidence?: number;
  impact?: RiskLevel;
  risk?: RiskLevel;
  alternatives?: unknown[];
  requiredApprovals?: string[];
  evidence?: unknown[];
  metadata?: Record<string, unknown>;
}

export interface DecisionListQuery {
  agentId?: string;
  status?: DecisionStatus;
  impact?: RiskLevel;
  risk?: RiskLevel;
  search?: string;
  page?: number;
  limit?: number;
}

export interface DecisionStats {
  total: number;
  approved: number;
  rejected: number;
  pending: number;
  executed: number;
  expired: number;
  byImpact: Record<string, number>;
  byRisk: Record<string, number>;
}

const VALID_TRANSITIONS: Record<DecisionStatus, DecisionStatus[]> = {
  PENDING: ["APPROVED", "REJECTED", "EXECUTED", "EXPIRED", "CANCELLED"],
  APPROVED: ["EXECUTED", "CANCELLED", "EXPIRED"],
  REJECTED: [],
  EXECUTED: [],
  EXPIRED: [],
  CANCELLED: [],
};

export class DecisionEngine {
  static async create(ctx: TenantContext, agentId: string, input: DecisionCreateInput) {
    const agent = await prisma.agentDefinition.findFirst({
      where: { id: agentId, companyId: ctx.companyId },
      select: { id: true },
    });

    if (!agent) {
      throw new NotFoundError("Agent");
    }

    if (input.sessionId) {
      const session = await prisma.agentSession.findFirst({
        where: { id: input.sessionId, companyId: ctx.companyId, agentId },
        select: { id: true },
      });
      if (!session) {
        throw new NotFoundError("AgentSession");
      }
    }

    if (input.taskId) {
      const task = await prisma.agentTask.findFirst({
        where: { id: input.taskId, companyId: ctx.companyId, agentId },
        select: { id: true },
      });
      if (!task) {
        throw new NotFoundError("AgentTask");
      }
    }

    const decision = await prisma.agentDecision.create({
      data: {
        companyId: ctx.companyId,
        agentId,
        sessionId: input.sessionId ?? null,
        taskId: input.taskId ?? null,
        title: input.title,
        recommendation: input.recommendation,
        reason: input.reason ?? "",
        confidence: input.confidence ?? 0,
        impact: input.impact ?? "LOW",
        risk: input.risk ?? "LOW",
        alternatives: (input.alternatives ?? []) as Prisma.InputJsonValue,
        requiredApprovals: input.requiredApprovals ?? [],
        evidence: (input.evidence ?? []) as Prisma.InputJsonValue,
        metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });

    await this.recordAgentAudit(ctx, agentId, "decision.made", decision.id, {
      title: decision.title,
      impact: decision.impact,
      risk: decision.risk,
      confidence: String(decision.confidence),
    });

    return decision;
  }

  static async get(ctx: TenantContext, decisionId: string) {
    const decision = await prisma.agentDecision.findFirst({
      where: { id: decisionId, companyId: ctx.companyId },
      include: {
        agent: { select: { id: true, name: true, role: true, status: true } },
      },
    });

    if (!decision) {
      throw new NotFoundError("AgentDecision");
    }

    return decision;
  }

  static async list(ctx: TenantContext, query: DecisionListQuery) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.AgentDecisionWhereInput = {
      companyId: ctx.companyId,
      ...(query.agentId ? { agentId: query.agentId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.impact ? { impact: query.impact } : {}),
      ...(query.risk ? { risk: query.risk } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: "insensitive" } },
              { recommendation: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [rows, total] = await Promise.all([
      prisma.agentDecision.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          agent: { select: { id: true, name: true, role: true, status: true } },
        },
      }),
      prisma.agentDecision.count({ where }),
    ]);

    return { decisions: rows, total, page, limit };
  }

  static async approve(ctx: TenantContext, decisionId: string, userId: string) {
    const decision = await this.findDecisionOrThrow(ctx, decisionId);

    if (!VALID_TRANSITIONS[decision.status as DecisionStatus]?.includes("APPROVED" as DecisionStatus)) {
      throw new ValidationError(
        `Cannot approve decision in "${decision.status}" status`,
      );
    }

    const updated = await prisma.agentDecision.update({
      where: { id: decisionId },
      data: {
        status: "APPROVED",
        approvedBy: userId,
        approvedAt: new Date(),
      },
    });

    await this.recordAgentAudit(ctx, decision.agentId, "decision.approved", decisionId, {
      approvedBy: userId,
      title: decision.title,
      previousStatus: decision.status,
    });

    return updated;
  }

  static async reject(
    ctx: TenantContext,
    decisionId: string,
    userId: string,
    reason?: string,
  ) {
    const decision = await this.findDecisionOrThrow(ctx, decisionId);

    if (!VALID_TRANSITIONS[decision.status as DecisionStatus]?.includes("REJECTED" as DecisionStatus)) {
      throw new ValidationError(
        `Cannot reject decision in "${decision.status}" status`,
      );
    }

    const updated = await prisma.agentDecision.update({
      where: { id: decisionId },
      data: {
        status: "REJECTED",
        approvedBy: userId,
        approvedAt: new Date(),
        metadata: {
          ...((decision.metadata as Record<string, unknown>) ?? {}),
          rejectionReason: reason ?? null,
          rejectedBy: userId,
        } as Prisma.InputJsonValue,
      },
    });

    await this.recordAgentAudit(ctx, decision.agentId, "decision.rejected", decisionId, {
      rejectedBy: userId,
      reason: reason ?? null,
      title: decision.title,
      previousStatus: decision.status,
    });

    return updated;
  }

  static async execute(ctx: TenantContext, decisionId: string) {
    const decision = await this.findDecisionOrThrow(ctx, decisionId);

    if (!VALID_TRANSITIONS[decision.status as DecisionStatus]?.includes("EXECUTED" as DecisionStatus)) {
      throw new ValidationError(
        `Cannot execute decision in "${decision.status}" status`,
      );
    }

    const updated = await prisma.agentDecision.update({
      where: { id: decisionId },
      data: {
        status: "EXECUTED",
        executedAt: new Date(),
      },
    });

    await this.recordAgentAudit(ctx, decision.agentId, "decision.made", decisionId, {
      executedAt: updated.executedAt,
      title: decision.title,
    });

    return updated;
  }

  static async expire(ctx: TenantContext, decisionId: string) {
    const decision = await this.findDecisionOrThrow(ctx, decisionId);

    if (!VALID_TRANSITIONS[decision.status as DecisionStatus]?.includes("EXPIRED" as DecisionStatus)) {
      throw new ValidationError(
        `Cannot expire decision in "${decision.status}" status`,
      );
    }

    const updated = await prisma.agentDecision.update({
      where: { id: decisionId },
      data: { status: "EXPIRED" },
    });

    await this.recordAgentAudit(ctx, decision.agentId, "decision.made", decisionId, {
      expiredAt: new Date().toISOString(),
      title: decision.title,
      previousStatus: decision.status,
    });

    return updated;
  }

  static async getPendingApprovals(ctx: TenantContext, agentId: string) {
    const agent = await prisma.agentDefinition.findFirst({
      where: { id: agentId, companyId: ctx.companyId },
      select: { id: true },
    });

    if (!agent) {
      throw new NotFoundError("Agent");
    }

    return prisma.agentDecision.findMany({
      where: {
        companyId: ctx.companyId,
        agentId,
        status: "PENDING",
      },
      orderBy: { createdAt: "desc" },
      include: {
        agent: { select: { id: true, name: true, role: true, status: true } },
      },
    });
  }

  static async getDecisionHistory(
    ctx: TenantContext,
    agentId: string,
    limit = 20,
  ) {
    const agent = await prisma.agentDefinition.findFirst({
      where: { id: agentId, companyId: ctx.companyId },
      select: { id: true },
    });

    if (!agent) {
      throw new NotFoundError("Agent");
    }

    return prisma.agentDecision.findMany({
      where: { companyId: ctx.companyId, agentId },
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 100),
      include: {
        agent: { select: { id: true, name: true, role: true, status: true } },
      },
    });
  }

  static async getDecisionStats(
    ctx: TenantContext,
    agentId: string,
  ): Promise<DecisionStats> {
    const agent = await prisma.agentDefinition.findFirst({
      where: { id: agentId, companyId: ctx.companyId },
      select: { id: true },
    });

    if (!agent) {
      throw new NotFoundError("Agent");
    }

    const [statusCounts, impactCounts, riskCounts] = await Promise.all([
      prisma.agentDecision.groupBy({
        by: ["status"],
        where: { companyId: ctx.companyId, agentId },
        _count: { id: true },
      }),
      prisma.agentDecision.groupBy({
        by: ["impact"],
        where: { companyId: ctx.companyId, agentId },
        _count: { id: true },
      }),
      prisma.agentDecision.groupBy({
        by: ["risk"],
        where: { companyId: ctx.companyId, agentId },
        _count: { id: true },
      }),
    ]);

    const statusMap = Object.fromEntries(
      statusCounts.map((s) => [s.status, s._count.id]),
    );

    const byImpact: Record<string, number> = {};
    for (const i of impactCounts) {
      byImpact[i.impact] = i._count.id;
    }

    const byRisk: Record<string, number> = {};
    for (const r of riskCounts) {
      byRisk[r.risk] = r._count.id;
    }

    return {
      total: statusCounts.reduce((sum, s) => sum + s._count.id, 0),
      approved: statusMap["APPROVED"] ?? 0,
      rejected: statusMap["REJECTED"] ?? 0,
      pending: statusMap["PENDING"] ?? 0,
      executed: statusMap["EXECUTED"] ?? 0,
      expired: statusMap["EXPIRED"] ?? 0,
      byImpact,
      byRisk,
    };
  }

  static async addAlternative(
    ctx: TenantContext,
    decisionId: string,
    alternative: unknown,
  ) {
    const decision = await this.findDecisionOrThrow(ctx, decisionId);

    const currentAlternatives = (decision.alternatives as unknown[]) ?? [];

    const updated = await prisma.agentDecision.update({
      where: { id: decisionId },
      data: {
        alternatives: [...currentAlternatives, alternative] as Prisma.InputJsonValue,
      },
    });

    await this.recordAgentAudit(ctx, decision.agentId, "decision.made", decisionId, {
      action: "alternative_added",
      alternativeCount: currentAlternatives.length + 1,
    });

    return updated;
  }

  private static async findDecisionOrThrow(ctx: TenantContext, decisionId: string) {
    const decision = await prisma.agentDecision.findFirst({
      where: { id: decisionId, companyId: ctx.companyId },
    });

    if (!decision) {
      throw new NotFoundError("AgentDecision");
    }

    return decision;
  }

  private static async recordAgentAudit(
    ctx: TenantContext,
    agentId: string,
    action: string,
    resourceId: string | null,
    metadata?: Record<string, unknown>,
  ) {
    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action,
      resourceType: "AgentDecision",
      resourceId,
      metadata: (metadata ?? {}) as Prisma.InputJsonValue,
    });
  }
}
