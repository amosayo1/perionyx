// ─────────────────────────────────────────────────────────────
// Enterprise Audit Specialist — Remediation Service
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  RemediationPlanSummary,
  RemediationStatus,
  RemediationVelocitySummary,
  GetRemediationPlansInput,
  CreateRemediationPlanInput,
  CreateRemediationTaskInput,
} from "./types";

export class RemediationService {
  /**
   * Get all remediation plans, optionally filtered.
   */
  static async getRemediationPlans(
    ctx: TenantContext,
    filters?: GetRemediationPlansInput,
  ) {
    const where: Prisma.RemediationPlanWhereInput = {
      companyId: ctx.companyId,
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.findingId) {
      where.findingId = filters.findingId;
    }

    const [plans, total] = await Promise.all([
      prisma.remediationPlan.findMany({
        where,
        orderBy: [{ status: "asc" }, { targetDate: "asc" }],
        take: filters?.limit ?? 50,
        skip: filters?.offset ?? 0,
      }),
      prisma.remediationPlan.count({ where }),
    ]);

    return { plans, total };
  }

  /**
   * Create a new remediation plan.
   */
  static async createPlan(
    ctx: TenantContext,
    input: CreateRemediationPlanInput,
  ) {
    const finding = await prisma.auditFinding.findFirst({
      where: {
        id: input.findingId,
        companyId: ctx.companyId,
      },
    });

    if (!finding) {
      throw new Error(`Finding ${input.findingId} not found`);
    }

    return prisma.remediationPlan.create({
      data: {
        companyId: ctx.companyId,
        findingId: input.findingId,
        planTitle: input.title,
        planDescription: input.description,
        remediationType: input.remediationType,
        targetDate: input.targetDate,
        startDate: new Date(),
        owner: input.owner ?? input.responsibleParty ?? "unassigned",
        estimatedCost: input.estimatedCost ?? null,
        status: "proposed",
        metadata: {} as unknown as Prisma.InputJsonValue,
      },
    });
  }

  /**
   * Update a remediation plan's status.
   */
  static async updatePlanStatus(
    ctx: TenantContext,
    planId: string,
    status: RemediationStatus,
  ) {
    const existing = await prisma.remediationPlan.findFirst({
      where: {
        id: planId,
        companyId: ctx.companyId,
      },
    });

    if (!existing) {
      throw new Error(`Remediation plan ${planId} not found`);
    }

    const updateData: Prisma.RemediationPlanUpdateInput = { status };

    if (status === "completed") {
      updateData.completedDate = new Date();
      updateData.progress = new Prisma.Decimal(1);
    }

    return prisma.remediationPlan.update({
      where: { id: planId },
      data: updateData,
    });
  }

  /**
   * Get all remediation tasks, optionally filtered by plan.
   */
  static async getRemediationTasks(
    ctx: TenantContext,
    planId?: string,
  ) {
    const where: Prisma.RemediationTaskWhereInput = {
      companyId: ctx.companyId,
    };

    if (planId) {
      where.planId = planId;
    }

    return prisma.remediationTask.findMany({
      where,
      orderBy: [{ dueDate: "asc" }, { priority: "desc" }],
    });
  }

  /**
   * Create a new remediation task.
   */
  static async createTask(
    ctx: TenantContext,
    input: CreateRemediationTaskInput,
  ) {
    const plan = await prisma.remediationPlan.findFirst({
      where: {
        id: input.planId,
        companyId: ctx.companyId,
      },
    });

    if (!plan) {
      throw new Error(`Remediation plan ${input.planId} not found`);
    }

    return prisma.remediationTask.create({
      data: {
        companyId: ctx.companyId,
        planId: input.planId,
        taskTitle: input.title,
        taskDescription: input.description ?? "",
        assignedTo: input.assignee ?? "unassigned",
        dueDate: input.dueDate ?? null,
        priority: input.priority ?? "medium",
        status: "pending",
        metadata: {} as unknown as Prisma.InputJsonValue,
      },
    });
  }

  /**
   * Update a remediation task's status.
   */
  static async updateTaskStatus(
    ctx: TenantContext,
    taskId: string,
    status: RemediationStatus,
  ) {
    const existing = await prisma.remediationTask.findFirst({
      where: {
        id: taskId,
        companyId: ctx.companyId,
      },
    });

    if (!existing) {
      throw new Error(`Remediation task ${taskId} not found`);
    }

    const updateData: Prisma.RemediationTaskUpdateInput = { status };

    if (status === "completed") {
      updateData.completedAt = new Date();
    }

    return prisma.remediationTask.update({
      where: { id: taskId },
      data: updateData,
    });
  }

  /**
   * Compute remediation velocity — how quickly findings are being remediated.
   */
  static async getRemediationVelocity(
    ctx: TenantContext,
  ): Promise<RemediationVelocitySummary> {
    const plans = await prisma.remediationPlan.findMany({
      where: { companyId: ctx.companyId },
      select: {
        status: true,
        createdAt: true,
        completedDate: true,
        targetDate: true,
      },
    });

    const totalPlans = plans.length;
    const onTrack = plans.filter(
      (p) => p.status === "in_progress" || p.status === "approved",
    ).length;
    const behindSchedule = plans.filter(
      (p) => p.status === "overdue",
    ).length;
    const completed = plans.filter(
      (p) => p.status === "completed",
    ).length;

    const completedPlans = plans.filter(
      (p) => p.completedDate && p.createdAt,
    );

    const averageDaysToRemediate =
      completedPlans.length > 0
        ? Math.round(
            completedPlans.reduce((sum: number, p) => {
              const days =
                (p.completedDate!.getTime() - p.createdAt.getTime()) /
                (1000 * 60 * 60 * 24);
              return sum + days;
            }, 0) / completedPlans.length,
          )
        : 0;

    return {
      totalPlans,
      onTrack,
      behindSchedule,
      completed,
      averageDaysToRemediate,
    };
  }

  /**
   * Escalate a remediation plan — mark as overdue and escalate.
   */
  static async escalateRemediation(
    ctx: TenantContext,
    planId: string,
  ) {
    const existing = await prisma.remediationPlan.findFirst({
      where: {
        id: planId,
        companyId: ctx.companyId,
      },
    });

    if (!existing) {
      throw new Error(`Remediation plan ${planId} not found`);
    }

    return prisma.remediationPlan.update({
      where: { id: planId },
      data: {
        status: "overdue",
        metadata: {
          ...(existing.metadata as Record<string, unknown>),
          escalatedAt: new Date().toISOString(),
          escalatedBy: ctx.userId,
        } as unknown as Prisma.InputJsonValue,
      },
    });
  }

  /**
   * Get remediation plan summary for dashboard display.
   */
  static async getRemediationPlanSummary(
    ctx: TenantContext,
  ): Promise<RemediationPlanSummary> {
    const plans = await prisma.remediationPlan.findMany({
      where: { companyId: ctx.companyId },
      select: { status: true, targetDate: true },
    });

    const now = new Date();
    const byStatus: Record<string, number> = {};
    let overdueCount = 0;
    let completedCount = 0;

    for (const p of plans) {
      byStatus[p.status] = (byStatus[p.status] ?? 0) + 1;

      if (
        p.status !== "completed" &&
        p.status !== "cancelled" &&
        p.targetDate < now
      ) {
        overdueCount++;
      }

      if (p.status === "completed") {
        completedCount++;
      }
    }

    return {
      total: plans.length,
      byStatus: byStatus as Record<RemediationStatus, number>,
      overdueCount,
      averageCompletionDays: 0,
    };
  }
}
