// ─────────────────────────────────────────────────────────────
// Enterprise Finance Collaboration — Decision Registry
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  RegistryDecisionType,
  RegistryDecisionStatus,
  GetDecisionsInput,
  CreateDecisionInput,
  DecisionRegistryEntry,
} from "./types";

export class DecisionRegistry {
  // ─── Decisions ──────────────────────────────────────────

  static async getDecisions(
    ctx: TenantContext,
    filters?: GetDecisionsInput,
  ) {
    const where: Prisma.DecisionRegistryWhereInput = {
      companyId: ctx.companyId,
    };

    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.decisionType) {
      where.decisionType = filters.decisionType;
    }
    if (filters?.decidedBy) {
      where.decidedBy = filters.decidedBy;
    }

    const [decisions, total] = await Promise.all([
      prisma.decisionRegistry.findMany({
        where,
        orderBy: { decisionNumber: "desc" },
        take: filters?.limit ?? 50,
        skip: filters?.offset ?? 0,
      }),
      prisma.decisionRegistry.count({ where }),
    ]);

    return {
      decisions: decisions.map((d) => ({
        id: d.id,
        decisionNumber: d.decisionNumber,
        decisionType: d.decisionType as RegistryDecisionType,
        status: d.status as RegistryDecisionStatus,
        title: d.title,
        description: d.description,
        decidedBy: d.decidedBy,
        approvals: (d.approvals as string[]) ?? [],
        rejections: (d.rejects as Array<{ rejector: string; reason: string }>) ?? [],
        context: (d.metadata as Record<string, unknown>) ?? {},
        createdAt: d.createdAt,
        resolvedAt: d.updatedAt,
      })) as DecisionRegistryEntry[],
      total,
    };
  }

  static async createDecision(
    ctx: TenantContext,
    input: CreateDecisionInput,
  ) {
    const maxDecision = await prisma.decisionRegistry.findFirst({
      where: { companyId: ctx.companyId },
      orderBy: { decisionNumber: "desc" },
      select: { decisionNumber: true },
    });

    const nextDecisionNumber = (maxDecision?.decisionNumber ?? 0) + 1;

    return prisma.$transaction(async (tx) => {
      const decision = await tx.decisionRegistry.create({
        data: {
          companyId: ctx.companyId,
          decisionNumber: nextDecisionNumber,
          decisionType: input.decisionType,
          status: "proposed",
          title: input.title,
          description: input.description,
          decidedBy: input.decidedBy,
          decidedByType: "human",
          metadata: (input.context ?? {}) as unknown as Prisma.InputJsonValue,
        },
      });

      await tx.collaborationTimeline.create({
        data: {
          companyId: ctx.companyId,
          eventType: "decision",
          eventTitle: "Decision proposed",
          eventDescription: `Decision #${nextDecisionNumber}: "${input.title}"`,
          eventSource: "system",
          sourceType: "human",
          specialistName: input.decidedBy,
        },
      });

      return decision;
    });
  }

  static async updateDecisionStatus(
    ctx: TenantContext,
    decisionId: string,
    status: RegistryDecisionStatus,
  ) {
    const existing = await prisma.decisionRegistry.findFirst({
      where: {
        id: decisionId,
        companyId: ctx.companyId,
      },
    });

    if (!existing) {
      throw new Error(`Decision ${decisionId} not found`);
    }

    return prisma.decisionRegistry.update({
      where: { id: decisionId },
      data: {
        status,
      },
    });
  }

  static async addApproval(
    ctx: TenantContext,
    decisionId: string,
    approver: string,
  ) {
    const existing = await prisma.decisionRegistry.findFirst({
      where: {
        id: decisionId,
        companyId: ctx.companyId,
      },
    });

    if (!existing) {
      throw new Error(`Decision ${decisionId} not found`);
    }

    const currentApprovals = (existing.approvals as string[]) ?? [];
    const updatedApprovals = [...currentApprovals, approver];

    const updated = await prisma.decisionRegistry.update({
      where: { id: decisionId },
      data: {
        approvals: updatedApprovals as unknown as Prisma.InputJsonValue,
      },
    });

    await prisma.collaborationTimeline.create({
      data: {
        companyId: ctx.companyId,
        eventType: "approval",
        eventTitle: "Decision approved",
        eventDescription: `Decision #${existing.decisionNumber} approved by ${approver}`,
        eventSource: "system",
        sourceType: "human",
        specialistName: approver,
      },
    });

    return updated;
  }

  static async addRejection(
    ctx: TenantContext,
    decisionId: string,
    rejector: string,
    reason: string,
  ) {
    const existing = await prisma.decisionRegistry.findFirst({
      where: {
        id: decisionId,
        companyId: ctx.companyId,
      },
    });

    if (!existing) {
      throw new Error(`Decision ${decisionId} not found`);
    }

    const currentRejects = (existing.rejects as Array<{ rejector: string; reason: string }>) ?? [];
    const updatedRejects = [...currentRejects, { rejector, reason }];

    const updated = await prisma.decisionRegistry.update({
      where: { id: decisionId },
      data: {
        rejects: updatedRejects as unknown as Prisma.InputJsonValue,
      },
    });

    await prisma.collaborationTimeline.create({
      data: {
        companyId: ctx.companyId,
        eventType: "decision",
        eventTitle: "Decision rejected",
        eventDescription: `Decision #${existing.decisionNumber} rejected by ${rejector}: ${reason}`,
        eventSource: "system",
        sourceType: "human",
        specialistName: rejector,
      },
    });

    return updated;
  }

  static async getDecisionById(
    ctx: TenantContext,
    decisionId: string,
  ) {
    const decision = await prisma.decisionRegistry.findFirst({
      where: {
        id: decisionId,
        companyId: ctx.companyId,
      },
    });

    if (!decision) {
      throw new Error(`Decision ${decisionId} not found`);
    }

    return {
      id: decision.id,
      decisionNumber: decision.decisionNumber,
      decisionType: decision.decisionType as RegistryDecisionType,
      status: decision.status as RegistryDecisionStatus,
      title: decision.title,
      description: decision.description,
      decidedBy: decision.decidedBy,
      approvals: (decision.approvals as string[]) ?? [],
      rejections: (decision.rejects as Array<{ rejector: string; reason: string }>) ?? [],
      context: (decision.metadata as Record<string, unknown>) ?? {},
      createdAt: decision.createdAt,
      resolvedAt: decision.updatedAt,
    };
  }
}
