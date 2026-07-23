// ─────────────────────────────────────────────────────────────
// Enterprise Controller Specialist — Close Management Service
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  ClosePeriodType,
  CloseStatus,
  CloseTaskStatus,
  CloseCalendarEntry,
  CloseProgress,
  CreateClosePeriodInput,
  CreateCloseTaskInput,
  UpdateCloseTaskInput,
  ClosePeriodFilter,
  CreateMilestoneInput,
  MilestoneRecord,
  MilestoneStatus,
} from "./types";

export class CloseManagementService {
  // ─── Close Periods ────────────────────────────────────────

  static async getClosePeriods(
    ctx: TenantContext,
    params?: ClosePeriodFilter & { limit?: number; offset?: number },
  ) {
    const where: Prisma.ClosePeriodWhereInput = {
      companyId: ctx.companyId,
    };

    if (params?.status) {
      where.status = params.status;
    }
    if (params?.closeType) {
      where.closeType = params.closeType;
    }
    if (params?.period) {
      where.period = params.period;
    }
    if (params?.from || params?.to) {
      where.period = {
        ...(where.period as string | undefined ? { equals: where.period as string } : {}),
        ...(params?.from ? { gte: params.from } : {}),
        ...(params?.to ? { lte: params.to } : {}),
      } as string;
    }

    const [periods, total] = await Promise.all([
      prisma.closePeriod.findMany({
        where,
        include: {
          tasks: {
            select: {
              id: true,
              status: true,
              category: true,
              priority: true,
            },
          },
          milestones: {
            select: {
              id: true,
              name: true,
              status: true,
              targetDate: true,
            },
          },
        },
        orderBy: { period: "desc" },
        take: params?.limit ?? 50,
        skip: params?.offset ?? 0,
      }),
      prisma.closePeriod.count({ where }),
    ]);

    return { periods, total };
  }

  static async getClosePeriod(ctx: TenantContext, periodId: string) {
    const period = await prisma.closePeriod.findFirst({
      where: {
        id: periodId,
        companyId: ctx.companyId,
      },
      include: {
        tasks: {
          orderBy: { createdAt: "asc" },
        },
        dependencies: true,
        milestones: {
          orderBy: { targetDate: "asc" },
        },
        forecasts: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!period) {
      throw new Error(`Close period ${periodId} not found`);
    }

    return period;
  }

  static async createClosePeriod(
    ctx: TenantContext,
    input: CreateClosePeriodInput,
  ) {
    const existing = await prisma.closePeriod.findUnique({
      where: {
        companyId_period_closeType: {
          companyId: ctx.companyId,
          period: input.period,
          closeType: input.closeType,
        },
      },
    });

    if (existing) {
      throw new Error(
        `Close period already exists for ${input.period} (${input.closeType})`,
      );
    }

    return prisma.$transaction(async (tx) => {
      const period = await tx.closePeriod.create({
        data: {
          companyId: ctx.companyId,
          period: input.period,
          closeType: input.closeType,
          status: "OPEN",
          estimatedCompletion: input.estimatedCompletion,
        },
      });

      if (input.tasks && input.tasks.length > 0) {
        const tasksData = input.tasks.map((task) => ({
          companyId: ctx.companyId,
          closePeriodId: period.id,
          title: task.title,
          description: task.description ?? "",
          category: task.category,
          priority: task.priority ?? "MEDIUM",
          assignedTo: task.assignedTo,
          dueDate: task.dueDate,
          entityName: task.entityName,
          departmentName: task.departmentName,
          dependencyIds: task.dependencyIds ?? [],
        }));

        await tx.closeTask.createMany({ data: tasksData });

        await tx.closePeriod.update({
          where: { id: period.id },
          data: { totalTasks: tasksData.length },
        });
      }

      return period;
    });
  }

  // ─── Close Tasks ──────────────────────────────────────────

  static async updateCloseTask(
    ctx: TenantContext,
    taskId: string,
    input: UpdateCloseTaskInput,
  ) {
    const existing = await prisma.closeTask.findFirst({
      where: {
        id: taskId,
        companyId: ctx.companyId,
      },
    });

    if (!existing) {
      throw new Error(`Close task ${taskId} not found`);
    }

    const updateData: Prisma.CloseTaskUpdateInput = {};

    if (input.status !== undefined) {
      updateData.status = input.status;
    }
    if (input.assignedTo !== undefined) {
      updateData.assignedTo = input.assignedTo;
    }
    if (input.blockedReason !== undefined) {
      updateData.blockedReason = input.blockedReason;
    }
    if (input.completedAt !== undefined) {
      updateData.completedAt = input.completedAt;
    }
    if (input.metadata !== undefined) {
      updateData.metadata = input.metadata as unknown as Prisma.InputJsonValue;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const task = await tx.closeTask.update({
        where: { id: taskId },
        data: updateData,
      });

      if (input.status === "COMPLETED" && !input.completedAt) {
        await tx.closeTask.update({
          where: { id: taskId },
          data: { completedAt: new Date() },
        });
      }

      await this.recalculateProgress(tx, existing.closePeriodId);

      return task;
    });

    return updated;
  }

  // ─── Progress ─────────────────────────────────────────────

  static async getCloseProgress(
    ctx: TenantContext,
    periodId: string,
  ): Promise<CloseProgress> {
    const period = await prisma.closePeriod.findFirst({
      where: {
        id: periodId,
        companyId: ctx.companyId,
      },
      include: {
        tasks: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!period) {
      throw new Error(`Close period ${periodId} not found`);
    }

    const totalTasks = period.tasks.length;
    const completedTasks = period.tasks.filter(
      (t: { status: string }) => t.status === "COMPLETED",
    ).length;
    const blockedTasks = period.tasks.filter(
      (t: { status: string }) => t.status === "BLOCKED",
    ).length;
    const overdueTasks = period.tasks.filter(
      (t: { status: string }) => t.status === "OVERDUE",
    ).length;
    const percentComplete =
      totalTasks > 0
        ? new Prisma.Decimal(completedTasks)
            .div(totalTasks)
            .mul(100)
            .toDecimalPlaces(2)
        : new Prisma.Decimal(0);

    return {
      totalTasks,
      completedTasks,
      blockedTasks,
      overdueTasks,
      percentComplete: percentComplete.toNumber(),
    };
  }

  // ─── Calendar ─────────────────────────────────────────────

  static async getCloseCalendar(
    ctx: TenantContext,
    year?: number,
  ): Promise<CloseCalendarEntry[]> {
    const targetYear = year ?? new Date().getFullYear();
    const periodPrefix = targetYear.toString();

    const periods = await prisma.closePeriod.findMany({
      where: {
        companyId: ctx.companyId,
        period: {
          startsWith: periodPrefix,
        },
      },
      include: {
        tasks: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: { period: "asc" },
    });

    return periods.map((p) => {
      const total = p.tasks.length;
      const completed = p.tasks.filter(
        (t: { status: string }) => t.status === "COMPLETED",
      ).length;
      const blocked = p.tasks.filter(
        (t: { status: string }) => t.status === "BLOCKED",
      ).length;
      const overdue = p.tasks.filter(
        (t: { status: string }) => t.status === "OVERDUE",
      ).length;

      return {
        id: p.id,
        period: p.period,
        closeType: p.closeType as ClosePeriodType,
        status: p.status as CloseStatus,
        progress: p.overallProgress,
        estimatedCompletion: p.estimatedCompletion,
        actualCloseDate: p.actualCloseDate,
        taskStats: { total, completed, blocked, overdue },
      };
    });
  }

  // ─── Forecast ─────────────────────────────────────────────

  static async generateCloseForecast(ctx: TenantContext, periodId: string) {
    const period = await prisma.closePeriod.findFirst({
      where: {
        id: periodId,
        companyId: ctx.companyId,
      },
      include: {
        tasks: {
          where: {
            status: { notIn: ["COMPLETED", "SKIPPED"] },
          },
          orderBy: { dueDate: "asc" },
        },
      },
    });

    if (!period) {
      throw new Error(`Close period ${periodId} not found`);
    }

    const remainingTasks = period.tasks.length;
    const blockedTasks = period.tasks.filter(
      (t: { status: string }) => t.status === "BLOCKED",
    ).length;

    const criticalPathTaskIds = period.tasks
      .filter((t: { priority: string }) => t.priority === "CRITICAL")
      .map((t: { id: string }) => t.id);

    const avgDurationHours =
      remainingTasks > 0
        ? new Prisma.Decimal(remainingTasks).mul(2.5)
        : new Prisma.Decimal(0);

    const estimatedCompletion = new Date();
    estimatedCompletion.setHours(
      estimatedCompletion.getHours() + avgDurationHours.toNumber(),
    );

    const confidence =
      remainingTasks === 0
        ? new Prisma.Decimal(1)
        : blockedTasks === 0
          ? new Prisma.Decimal(0.85)
          : new Prisma.Decimal(0.6);

    const scenarios = [
      {
        name: "optimistic",
        estimatedCompletion: new Date(
          estimatedCompletion.getTime() - 24 * 60 * 60 * 1000,
        ).toISOString(),
        confidence: confidence.mul(1.1).gt(1) ? 1 : confidence.mul(1.1).toNumber(),
      },
      {
        name: "expected",
        estimatedCompletion: estimatedCompletion.toISOString(),
        confidence: confidence.toNumber(),
      },
      {
        name: "pessimistic",
        estimatedCompletion: new Date(
          estimatedCompletion.getTime() + 2 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        confidence: Math.max(confidence.mul(0.8).toNumber(), 0.3),
      },
    ];

    const risks: Array<{
      type: string;
      severity: string;
      description: string;
    }> = [];

    if (blockedTasks > 0) {
      risks.push({
        type: "blocked_tasks",
        severity: "HIGH",
        description: `${blockedTasks} task(s) are blocked and may delay close completion`,
      });
    }

    const overdueTasks = period.tasks.filter(
      (t: { status: string; dueDate: Date | null }) =>
        t.status === "OVERDUE" ||
        (t.dueDate && t.dueDate < new Date() && t.status !== "COMPLETED"),
    ).length;

    if (overdueTasks > 0) {
      risks.push({
        type: "overdue_tasks",
        severity: "CRITICAL",
        description: `${overdueTasks} task(s) are overdue`,
      });
    }

    if (remainingTasks > 10) {
      risks.push({
        type: "high_volume",
        severity: "MEDIUM",
        description: `${remainingTasks} tasks remaining — high volume may cause bottlenecks`,
      });
    }

    const forecast = await prisma.closeForecast.create({
      data: {
        companyId: ctx.companyId,
        closePeriodId: periodId,
        forecastDate: new Date(),
        estimatedCompletion,
        confidence,
        remainingTasks,
        blockedTasks,
        averageTaskDurationHours: avgDurationHours,
        criticalPathTaskIds,
        risks: risks as unknown as Prisma.InputJsonValue,
        scenarios: scenarios as unknown as Prisma.InputJsonValue,
      },
    });

    return forecast;
  }

  // ─── Milestones ───────────────────────────────────────────

  static async getMilestones(
    ctx: TenantContext,
    periodId: string,
  ): Promise<MilestoneRecord[]> {
    const milestones = await prisma.closeMilestone.findMany({
      where: {
        closePeriodId: periodId,
        companyId: ctx.companyId,
      },
      orderBy: { targetDate: "asc" },
    });

    return milestones.map((m) => ({
      id: m.id,
      companyId: m.companyId,
      closePeriodId: m.closePeriodId,
      name: m.name,
      description: m.description,
      targetDate: m.targetDate,
      actualDate: m.actualDate,
      status: m.status as MilestoneStatus,
      requiredTaskIds: m.requiredTaskIds,
      metadata: (m.metadata as Record<string, unknown>) ?? {},
      createdAt: m.createdAt,
    }));
  }

  static async createMilestone(
    ctx: TenantContext,
    input: CreateMilestoneInput,
  ): Promise<MilestoneRecord> {
    const period = await prisma.closePeriod.findFirst({
      where: {
        id: input.closePeriodId,
        companyId: ctx.companyId,
      },
    });

    if (!period) {
      throw new Error(`Close period ${input.closePeriodId} not found`);
    }

    const milestone = await prisma.closeMilestone.create({
      data: {
        companyId: ctx.companyId,
        closePeriodId: input.closePeriodId,
        name: input.name,
        description: input.description ?? "",
        targetDate: input.targetDate,
        requiredTaskIds: input.requiredTaskIds ?? [],
      },
    });

    return {
      id: milestone.id,
      companyId: milestone.companyId,
      closePeriodId: milestone.closePeriodId,
      name: milestone.name,
      description: milestone.description,
      targetDate: milestone.targetDate,
      actualDate: milestone.actualDate,
      status: milestone.status as MilestoneStatus,
      requiredTaskIds: milestone.requiredTaskIds,
      metadata: (milestone.metadata as Record<string, unknown>) ?? {},
      createdAt: milestone.createdAt,
    };
  }

  // ─── Internal Helpers ─────────────────────────────────────

  private static async recalculateProgress(
    tx: Prisma.TransactionClient,
    periodId: string,
  ) {
    const tasks = await tx.closeTask.findMany({
      where: { closePeriodId: periodId },
      select: { id: true, status: true, entityName: true, departmentName: true },
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(
      (t: { status: string }) => t.status === "COMPLETED",
    ).length;
    const blockedTasks = tasks.filter(
      (t: { status: string }) => t.status === "BLOCKED",
    ).length;
    const overdueTasks = tasks.filter(
      (t: { status: string }) => t.status === "OVERDUE",
    ).length;

    const overallProgress =
      totalTasks > 0
        ? new Prisma.Decimal(completedTasks).div(totalTasks).toDecimalPlaces(4)
        : new Prisma.Decimal(0);

    const entityCompletion: Record<string, { completed: number; total: number }> = {};
    const departmentCompletion: Record<string, { completed: number; total: number }> = {};

    for (const task of tasks) {
      if (task.entityName) {
        if (!entityCompletion[task.entityName]) {
          entityCompletion[task.entityName] = { completed: 0, total: 0 };
        }
        entityCompletion[task.entityName].total++;
        if (task.status === "COMPLETED") {
          entityCompletion[task.entityName].completed++;
        }
      }

      if (task.departmentName) {
        if (!departmentCompletion[task.departmentName]) {
          departmentCompletion[task.departmentName] = { completed: 0, total: 0 };
        }
        departmentCompletion[task.departmentName].total++;
        if (task.status === "COMPLETED") {
          departmentCompletion[task.departmentName].completed++;
        }
      }
    }

    await tx.closePeriod.update({
      where: { id: periodId },
      data: {
        overallProgress,
        totalTasks,
        completedTasks,
        blockedTasks,
        overdueTasks,
        entityCompletion: entityCompletion as unknown as Prisma.InputJsonValue,
        departmentCompletion:
          departmentCompletion as unknown as Prisma.InputJsonValue,
      },
    });
  }
}
