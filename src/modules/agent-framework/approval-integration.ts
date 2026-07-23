import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { recordAudit } from "@/modules/audit";
import { NotFoundError, ValidationError, ConflictError } from "@/lib/errors/app-error";

export interface ApprovalMetrics {
  pending: number;
  approved: number;
  rejected: number;
  escalated: number;
  avgTimeToDecisionMs: number | null;
  totalDecisions: number;
}

export interface ApprovalStatusResult {
  decisionId: string;
  status: string;
  approvedBy: string | null;
  approvedAt: Date | null;
  executionRequired: boolean;
  hasEvidence: boolean;
  risk: string;
  impact: string;
}

export class ApprovalIntegration {
  static async requestApproval(ctx: TenantContext, decisionId: string) {
    const decision = await prisma.agentDecision.findFirst({
      where: { id: decisionId, companyId: ctx.companyId },
    });

    if (!decision) {
      throw new NotFoundError("AgentDecision");
    }

    if (decision.status !== "PENDING") {
      throw new ConflictError(
        `Decision is already in "${decision.status}" status`,
      );
    }

    if (decision.risk !== "HIGH" && decision.risk !== "CRITICAL") {
      throw new ValidationError(
        "Only HIGH or CRITICAL risk decisions require approval",
      );
    }

    const agent = await prisma.agentDefinition.findFirst({
      where: { id: decision.agentId, companyId: ctx.companyId },
      select: { id: true, name: true },
    });

    if (!agent) {
      throw new NotFoundError("Agent");
    }

    const metadata = (decision.metadata as Record<string, unknown>) ?? {};
    const updated = await prisma.agentDecision.update({
      where: { id: decisionId },
      data: {
        metadata: {
          ...metadata,
          approvalRequested: true,
          approvalRequestedAt: new Date().toISOString(),
          approvalRequestedBy: ctx.userId,
          approvalNotes: null,
          escalationLevel: 0,
        } as Prisma.InputJsonValue,
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "decision.made",
      resourceType: "AgentDecision",
      resourceId: decisionId,
      metadata: {
        action: "approval_requested",
        agentId: decision.agentId,
        agentName: agent.name,
        title: decision.title,
        risk: decision.risk,
        impact: decision.impact,
      },
    });

    return updated;
  }

  static async getApprovalStatus(
    ctx: TenantContext,
    decisionId: string,
  ): Promise<ApprovalStatusResult> {
    const decision = await prisma.agentDecision.findFirst({
      where: { id: decisionId, companyId: ctx.companyId },
    });

    if (!decision) {
      throw new NotFoundError("AgentDecision");
    }

    const metadata = (decision.metadata as Record<string, unknown>) ?? {};

    return {
      decisionId: decision.id,
      status: decision.status,
      approvedBy: decision.approvedBy,
      approvedAt: decision.approvedAt,
      executionRequired:
        decision.risk === "HIGH" || decision.risk === "CRITICAL",
      hasEvidence:
        Array.isArray(decision.evidence) && decision.evidence.length > 0,
      risk: decision.risk,
      impact: decision.impact,
    };
  }

  static async handleApproval(
    ctx: TenantContext,
    decisionId: string,
    action: "APPROVE" | "REJECT" | "ESCALATE",
    userId: string,
    notes?: string,
  ) {
    const decision = await prisma.agentDecision.findFirst({
      where: { id: decisionId, companyId: ctx.companyId },
    });

    if (!decision) {
      throw new NotFoundError("AgentDecision");
    }

    if (decision.status !== "PENDING") {
      throw new ConflictError(
        `Cannot handle approval for decision in "${decision.status}" status`,
      );
    }

    const metadata = (decision.metadata as Record<string, unknown>) ?? {};

    if (action === "APPROVE") {
      const updated = await prisma.agentDecision.update({
        where: { id: decisionId },
        data: {
          status: "APPROVED",
          approvedBy: userId,
          approvedAt: new Date(),
          metadata: {
            ...metadata,
            approvalNotes: notes ?? null,
            approvedByUser: userId,
          } as Prisma.InputJsonValue,
        },
      });

      await recordAudit(prisma, {
        companyId: ctx.companyId,
        actorUserId: userId,
        action: "decision.approved",
        resourceType: "AgentDecision",
        resourceId: decisionId,
        metadata: {
          agentId: decision.agentId,
          title: decision.title,
          notes: notes ?? null,
        },
      });

      return updated;
    }

    if (action === "REJECT") {
      const updated = await prisma.agentDecision.update({
        where: { id: decisionId },
        data: {
          status: "REJECTED",
          approvedBy: userId,
          approvedAt: new Date(),
          metadata: {
            ...metadata,
            rejectionReason: notes ?? null,
            rejectedByUser: userId,
          } as Prisma.InputJsonValue,
        },
      });

      await recordAudit(prisma, {
        companyId: ctx.companyId,
        actorUserId: userId,
        action: "decision.rejected",
        resourceType: "AgentDecision",
        resourceId: decisionId,
        metadata: {
          agentId: decision.agentId,
          title: decision.title,
          reason: notes ?? null,
        },
      });

      return updated;
    }

    const currentLevel = (metadata.escalationLevel as number) ?? 0;

    const updated = await prisma.agentDecision.update({
      where: { id: decisionId },
      data: {
        metadata: {
          ...metadata,
          escalationLevel: currentLevel + 1,
          escalatedAt: new Date().toISOString(),
          escalatedBy: userId,
          escalationReason: notes ?? null,
        } as Prisma.InputJsonValue,
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: userId,
      action: "decision.made",
      resourceType: "AgentDecision",
      resourceId: decisionId,
      metadata: {
        action: "approval_escalated",
        agentId: decision.agentId,
        title: decision.title,
        escalationLevel: currentLevel + 1,
        reason: notes ?? null,
      },
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
        risk: { in: ["HIGH", "CRITICAL"] },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getApprovalHistory(
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
      where: {
        companyId: ctx.companyId,
        agentId,
        status: { in: ["APPROVED", "REJECTED"] },
      },
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 100),
    });
  }

  static async escalate(
    ctx: TenantContext,
    decisionId: string,
    reason: string,
  ) {
    const decision = await prisma.agentDecision.findFirst({
      where: { id: decisionId, companyId: ctx.companyId },
    });

    if (!decision) {
      throw new NotFoundError("AgentDecision");
    }

    if (decision.status !== "PENDING") {
      throw new ConflictError(
        `Cannot escalate decision in "${decision.status}" status`,
      );
    }

    const metadata = (decision.metadata as Record<string, unknown>) ?? {};
    const currentLevel = (metadata.escalationLevel as number) ?? 0;

    const updated = await prisma.agentDecision.update({
      where: { id: decisionId },
      data: {
        metadata: {
          ...metadata,
          escalationLevel: currentLevel + 1,
          escalatedAt: new Date().toISOString(),
          escalatedBy: ctx.userId,
          escalationReason: reason,
        } as Prisma.InputJsonValue,
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "decision.made",
      resourceType: "AgentDecision",
      resourceId: decisionId,
      metadata: {
        action: "escalated",
        agentId: decision.agentId,
        title: decision.title,
        escalationLevel: currentLevel + 1,
        reason,
      },
    });

    return updated;
  }

  static async delegate(
    ctx: TenantContext,
    decisionId: string,
    delegateToUserId: string,
  ) {
    const decision = await prisma.agentDecision.findFirst({
      where: { id: decisionId, companyId: ctx.companyId },
    });

    if (!decision) {
      throw new NotFoundError("AgentDecision");
    }

    if (decision.status !== "PENDING" && decision.status !== "APPROVED") {
      throw new ConflictError(
        `Cannot delegate decision in "${decision.status}" status`,
      );
    }

    const metadata = (decision.metadata as Record<string, unknown>) ?? {};

    const updated = await prisma.agentDecision.update({
      where: { id: decisionId },
      data: {
        metadata: {
          ...metadata,
          delegatedTo: delegateToUserId,
          delegatedAt: new Date().toISOString(),
          delegatedBy: ctx.userId,
        } as Prisma.InputJsonValue,
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "decision.made",
      resourceType: "AgentDecision",
      resourceId: decisionId,
      metadata: {
        action: "delegated",
        agentId: decision.agentId,
        title: decision.title,
        delegatedTo: delegateToUserId,
      },
    });

    return updated;
  }

  static async getApprovalMetrics(
    ctx: TenantContext,
    agentId: string,
  ): Promise<ApprovalMetrics> {
    const agent = await prisma.agentDefinition.findFirst({
      where: { id: agentId, companyId: ctx.companyId },
      select: { id: true },
    });

    if (!agent) {
      throw new NotFoundError("Agent");
    }

    const allDecisions = await prisma.agentDecision.findMany({
      where: { companyId: ctx.companyId, agentId },
      select: {
        status: true,
        createdAt: true,
        approvedAt: true,
        metadata: true,
      },
    });

    const pending = allDecisions.filter((d) => d.status === "PENDING").length;
    const approved = allDecisions.filter((d) => d.status === "APPROVED").length;
    const rejected = allDecisions.filter((d) => d.status === "REJECTED").length;
    const escalated = allDecisions.filter((d) => {
      const meta = (d.metadata as Record<string, unknown>) ?? {};
      return (meta.escalationLevel as number) ?? 0 > 0;
    }).length;

    const timesToDecision = allDecisions
      .filter((d) => d.approvedAt)
      .map((d) => d.approvedAt!.getTime() - d.createdAt.getTime());

    const avgTimeToDecisionMs =
      timesToDecision.length > 0
        ? Math.round(
            timesToDecision.reduce((a, b) => a + b, 0) /
              timesToDecision.length,
          )
        : null;

    return {
      pending,
      approved,
      rejected,
      escalated,
      avgTimeToDecisionMs,
      totalDecisions: allDecisions.length,
    };
  }
}
