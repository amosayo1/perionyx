import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { recordAudit } from "@/modules/audit";
import { NotFoundError, ValidationError, ConflictError } from "@/lib/errors/app-error";
import type {
  AgentDelegation,
  DelegationType,
  DelegationStatus,
  AuditAction,
} from "./types";

const VALID_DELEGATION_TRANSITIONS: Record<DelegationStatus, DelegationStatus[]> = {
  PENDING: ["ACCEPTED", "REJECTED", "COMPLETED", "EXPIRED"],
  ACCEPTED: ["COMPLETED", "EXPIRED"],
  REJECTED: [],
  COMPLETED: [],
  EXPIRED: [],
};

export class CollaborationFramework {
  static async delegate(
    ctx: TenantContext,
    fromAgentId: string,
    toAgentId: string,
    taskId: string | null | undefined,
    delegationType: DelegationType,
    reason: string,
    traceId?: string,
  ): Promise<AgentDelegation> {
    const [fromAgent, toAgent] = await Promise.all([
      prisma.agentDefinition.findFirst({
        where: { id: fromAgentId, companyId: ctx.companyId },
        select: { id: true, name: true },
      }),
      prisma.agentDefinition.findFirst({
        where: { id: toAgentId, companyId: ctx.companyId },
        select: { id: true, name: true },
      }),
    ]);

    if (!fromAgent) throw new NotFoundError("Agent (from)");
    if (!toAgent) throw new NotFoundError("Agent (to)");

    if (fromAgentId === toAgentId) {
      throw new ValidationError("Cannot delegate to the same agent");
    }

    if (taskId) {
      const task = await prisma.agentTask.findFirst({
        where: { id: taskId, companyId: ctx.companyId },
        select: { id: true },
      });
      if (!task) throw new NotFoundError("AgentTask");
    }

    const delegation = await prisma.agentDelegation.create({
      data: {
        companyId: ctx.companyId,
        fromAgentId,
        toAgentId,
        taskId: taskId ?? null,
        delegationType,
        reason,
        status: "PENDING",
        context: {} as Prisma.InputJsonValue,
        traceId: traceId ?? null,
        startedAt: new Date(),
      },
    });

    await this.recordAgentAudit(ctx, fromAgentId, "delegation.created", delegation.id, {
      fromAgentId,
      fromAgentName: fromAgent.name,
      toAgentId,
      toAgentName: toAgent.name,
      delegationType,
      reason,
      taskId: taskId ?? null,
    });

    return this.toDelegation(delegation);
  }

  static async accept(
    ctx: TenantContext,
    delegationId: string,
  ): Promise<AgentDelegation> {
    const delegation = await this.findDelegationOrThrow(ctx, delegationId);

    this.validateTransition(delegation.status as DelegationStatus, "ACCEPTED");

    const updated = await prisma.agentDelegation.update({
      where: { id: delegationId },
      data: { status: "ACCEPTED" },
    });

    await this.recordAgentAudit(ctx, delegation.toAgentId, "delegation.created", delegationId, {
      action: "accepted",
      fromAgentId: delegation.fromAgentId,
      toAgentId: delegation.toAgentId,
      previousStatus: delegation.status,
    });

    return this.toDelegation(updated);
  }

  static async reject(
    ctx: TenantContext,
    delegationId: string,
    reason?: string,
  ): Promise<AgentDelegation> {
    const delegation = await this.findDelegationOrThrow(ctx, delegationId);

    this.validateTransition(delegation.status as DelegationStatus, "REJECTED");

    const updated = await prisma.agentDelegation.update({
      where: { id: delegationId },
      data: {
        status: "REJECTED",
        result: reason ? { rejectionReason: reason } as Prisma.InputJsonValue : undefined,
      },
    });

    await this.recordAgentAudit(ctx, delegation.toAgentId, "delegation.created", delegationId, {
      action: "rejected",
      fromAgentId: delegation.fromAgentId,
      toAgentId: delegation.toAgentId,
      previousStatus: delegation.status,
      reason: reason ?? null,
    });

    return this.toDelegation(updated);
  }

  static async complete(
    ctx: TenantContext,
    delegationId: string,
    result?: Record<string, unknown>,
  ): Promise<AgentDelegation> {
    const delegation = await this.findDelegationOrThrow(ctx, delegationId);

    this.validateTransition(delegation.status as DelegationStatus, "COMPLETED");

    const now = new Date();
    const durationMs = now.getTime() - delegation.startedAt.getTime();

    const updated = await prisma.agentDelegation.update({
      where: { id: delegationId },
      data: {
        status: "COMPLETED",
        result: (result ?? { completed: true }) as Prisma.InputJsonValue,
        completedAt: now,
      },
    });

    await this.recordAgentAudit(ctx, delegation.toAgentId, "delegation.created", delegationId, {
      action: "completed",
      fromAgentId: delegation.fromAgentId,
      toAgentId: delegation.toAgentId,
      previousStatus: delegation.status,
      durationMs,
    });

    return this.toDelegation(updated);
  }

  static async cancel(
    ctx: TenantContext,
    delegationId: string,
  ): Promise<AgentDelegation> {
    const delegation = await this.findDelegationOrThrow(ctx, delegationId);

    if (delegation.status !== "PENDING" && delegation.status !== "ACCEPTED") {
      throw new ConflictError(
        `Cannot cancel delegation in "${delegation.status}" status`,
      );
    }

    const now = new Date();
    const durationMs = now.getTime() - delegation.startedAt.getTime();

    const updated = await prisma.agentDelegation.update({
      where: { id: delegationId },
      data: {
        status: "EXPIRED",
        completedAt: now,
      },
    });

    await this.recordAgentAudit(ctx, delegation.fromAgentId, "delegation.created", delegationId, {
      action: "cancelled",
      fromAgentId: delegation.fromAgentId,
      toAgentId: delegation.toAgentId,
      previousStatus: delegation.status,
      durationMs,
    });

    return this.toDelegation(updated);
  }

  static async getDelegationsFrom(
    ctx: TenantContext,
    agentId: string,
    limit = 20,
  ): Promise<AgentDelegation[]> {
    await this.findAgentOrThrow(ctx, agentId);

    const rows = await prisma.agentDelegation.findMany({
      where: { companyId: ctx.companyId, fromAgentId: agentId },
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 100),
    });

    return rows.map(this.toDelegation);
  }

  static async getDelegationsTo(
    ctx: TenantContext,
    agentId: string,
    limit = 20,
  ): Promise<AgentDelegation[]> {
    await this.findAgentOrThrow(ctx, agentId);

    const rows = await prisma.agentDelegation.findMany({
      where: { companyId: ctx.companyId, toAgentId: agentId },
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 100),
    });

    return rows.map(this.toDelegation);
  }

  static async getDelegationChain(
    ctx: TenantContext,
    traceId: string,
  ): Promise<AgentDelegation[]> {
    const rows = await prisma.agentDelegation.findMany({
      where: { companyId: ctx.companyId, traceId },
      orderBy: { createdAt: "asc" },
    });

    return rows.map(this.toDelegation);
  }

  static async getActiveDelegations(
    ctx: TenantContext,
    agentId: string,
  ): Promise<AgentDelegation[]> {
    await this.findAgentOrThrow(ctx, agentId);

    const rows = await prisma.agentDelegation.findMany({
      where: {
        companyId: ctx.companyId,
        OR: [{ fromAgentId: agentId }, { toAgentId: agentId }],
        status: { in: ["PENDING", "ACCEPTED"] },
      },
      orderBy: { createdAt: "desc" },
    });

    return rows.map(this.toDelegation);
  }

  static async getDelegationStats(
    ctx: TenantContext,
    agentId: string,
  ): Promise<{
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    avgCompletionTimeMs: number | null;
  }> {
    await this.findAgentOrThrow(ctx, agentId);

    const allDelegations = await prisma.agentDelegation.findMany({
      where: {
        companyId: ctx.companyId,
        OR: [{ fromAgentId: agentId }, { toAgentId: agentId }],
      },
      select: {
        delegationType: true,
        status: true,
        startedAt: true,
        completedAt: true,
      },
    });

    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};

    for (const d of allDelegations) {
      byType[d.delegationType] = (byType[d.delegationType] ?? 0) + 1;
      byStatus[d.status] = (byStatus[d.status] ?? 0) + 1;
    }

    const completionTimes = allDelegations
      .filter((d) => d.completedAt && d.startedAt)
      .map((d) => d.completedAt!.getTime() - d.startedAt.getTime());

    const avgCompletionTimeMs =
      completionTimes.length > 0
        ? Math.round(
            completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length,
          )
        : null;

    return {
      total: allDelegations.length,
      byType,
      byStatus,
      avgCompletionTimeMs,
    };
  }

  private static validateTransition(
    current: DelegationStatus,
    target: DelegationStatus,
  ) {
    const allowed = VALID_DELEGATION_TRANSITIONS[current];
    if (!allowed || !allowed.includes(target)) {
      throw new ValidationError(
        `Invalid delegation transition from ${current} to ${target}. Allowed: ${allowed?.join(", ") ?? "none"}`,
      );
    }
  }

  private static async findAgentOrThrow(
    ctx: TenantContext,
    agentId: string,
  ) {
    const agent = await prisma.agentDefinition.findFirst({
      where: { id: agentId, companyId: ctx.companyId },
      select: { id: true },
    });

    if (!agent) {
      throw new NotFoundError("Agent");
    }

    return agent;
  }

  private static async findDelegationOrThrow(
    ctx: TenantContext,
    delegationId: string,
  ) {
    const delegation = await prisma.agentDelegation.findFirst({
      where: { id: delegationId, companyId: ctx.companyId },
    });

    if (!delegation) {
      throw new NotFoundError("AgentDelegation");
    }

    return delegation;
  }

  private static async recordAgentAudit(
    ctx: TenantContext,
    agentId: string,
    action: AuditAction,
    resourceId: string | null,
    metadata?: Record<string, unknown>,
  ) {
    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action,
      resourceType: "AgentDelegation",
      resourceId,
      metadata: {
        agentId,
        ...(metadata ?? {}),
      } as Prisma.InputJsonValue,
    });
  }

  private static toDelegation(row: {
    id: string;
    companyId: string;
    fromAgentId: string;
    toAgentId: string;
    taskId: string | null;
    delegationType: string;
    reason: string;
    status: string;
    context: unknown;
    result: unknown;
    traceId: string | null;
    startedAt: Date;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): AgentDelegation {
    return {
      id: row.id,
      companyId: row.companyId,
      fromAgentId: row.fromAgentId,
      toAgentId: row.toAgentId,
      taskId: row.taskId,
      delegationType: row.delegationType as DelegationType,
      reason: row.reason,
      status: row.status as DelegationStatus,
      context: (row.context as Record<string, unknown>) ?? {},
      result: row.result ?? null,
      traceId: row.traceId,
      startedAt: row.startedAt.toISOString(),
      completedAt: row.completedAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
