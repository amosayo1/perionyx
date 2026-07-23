import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { WorkflowScheduleData } from "./types";
import { OrchestrationExecutionEngine } from "./workflow-engine";

export class SchedulerService {
  static async list(ctx: TenantContext): Promise<WorkflowScheduleData[]> {
    const rows = await prisma.workflowSchedule.findMany({
      where: { companyId: ctx.companyId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((s) => ({
      id: s.id, companyId: s.companyId, workflowId: s.workflowId,
      cron: s.cron, timezone: s.timezone, isActive: s.isActive,
      lastRunAt: s.lastRunAt?.toISOString(), nextRunAt: s.nextRunAt?.toISOString(),
      createdAt: s.createdAt.toISOString(),
    }));
  }

  static async create(ctx: TenantContext, data: {
    workflowId: string; cron: string; timezone?: string;
  }): Promise<WorkflowScheduleData> {
    const schedule = await prisma.workflowSchedule.create({
      data: {
        companyId: ctx.companyId,
        workflowId: data.workflowId,
        cron: data.cron,
        timezone: data.timezone ?? "UTC",
      },
    });
    return {
      id: schedule.id, companyId: schedule.companyId, workflowId: schedule.workflowId,
      cron: schedule.cron, timezone: schedule.timezone, isActive: schedule.isActive,
      createdAt: schedule.createdAt.toISOString(),
    };
  }

  static async update(ctx: TenantContext, id: string, data: Partial<{
    cron: string; timezone: string; isActive: boolean;
  }>): Promise<WorkflowScheduleData> {
    const existing = await prisma.workflowSchedule.findUnique({ where: { id } });
    if (!existing || existing.companyId !== ctx.companyId) throw new Error("Not found");
    const updated = await prisma.workflowSchedule.update({ where: { id }, data: data as never });
    return {
      id: updated.id, companyId: updated.companyId, workflowId: updated.workflowId,
      cron: updated.cron, timezone: updated.timezone, isActive: updated.isActive,
      lastRunAt: updated.lastRunAt?.toISOString(), nextRunAt: updated.nextRunAt?.toISOString(),
      createdAt: updated.createdAt.toISOString(),
    };
  }

  static async delete(ctx: TenantContext, id: string): Promise<void> {
    const existing = await prisma.workflowSchedule.findUnique({ where: { id } });
    if (!existing || existing.companyId !== ctx.companyId) throw new Error("Not found");
    await prisma.workflowSchedule.delete({ where: { id } });
  }

  static async executeDue(ctx: TenantContext): Promise<void> {
    const due = await prisma.workflowSchedule.findMany({
      where: {
        companyId: ctx.companyId,
        isActive: true,
        nextRunAt: { lte: new Date() },
      },
    });
    for (const schedule of due) {
      await OrchestrationExecutionEngine.execute(ctx, schedule.workflowId, "schedule");
      await prisma.workflowSchedule.update({
        where: { id: schedule.id },
        data: {
          lastRunAt: new Date(),
          nextRunAt: this.computeNextRun(schedule.cron, schedule.timezone),
        },
      });
    }
  }

  private static computeNextRun(_cron: string, _timezone: string): Date {
    return new Date(Date.now() + 3600000);
  }
}
