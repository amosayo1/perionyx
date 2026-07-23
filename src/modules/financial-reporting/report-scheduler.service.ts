import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { logger } from "@/lib/logger";
import type { ReportConfig, ReportSchedule, ExportFormat, ScheduleFrequency } from "./types";

const FREQUENCY_ALIAS: Record<string, string> = {
  daily: "daily",
  weekly: "weekly",
  monthly: "monthly",
  quarterly: "quarterly",
  yearly: "yearly",
  annual: "yearly",
};

export class ReportSchedulerService {
  static async createSchedule(
    ctx: TenantContext,
    data: {
      definitionId: string;
      name: string;
      frequency: string;
      recipients: string[];
      format: ExportFormat;
      config: ReportConfig;
    },
  ): Promise<ReportSchedule> {
    const definition = await prisma.financialReportDefinition.findUnique({
      where: { id: data.definitionId },
    });

    if (!definition || definition.companyId !== ctx.companyId) {
      throw new Error(`Report definition "${data.definitionId}" not found`);
    }

    const nextRunAt = this.calculateNextRun(data.frequency);

    const record = await prisma.financialReportSchedule.create({
      data: {
        id: crypto.randomUUID(),
        definitionId: data.definitionId,
        companyId: ctx.companyId,
        name: data.name,
        frequency: FREQUENCY_ALIAS[data.frequency] ?? data.frequency,
        recipients: data.recipients as any,
        format: data.format,
        config: data.config as unknown as any,
        isActive: true,
        nextRunAt: nextRunAt ?? undefined,
        createdBy: ctx.userId,
      },
    });

    logger.info({ scheduleId: record.id, frequency: data.frequency }, "report_schedule_created");

    return this.mapSchedule(record);
  }

  static async updateSchedule(
    ctx: TenantContext,
    scheduleId: string,
    data: Partial<ReportSchedule>,
  ): Promise<ReportSchedule> {
    const existing = await prisma.financialReportSchedule.findUnique({
      where: { id: scheduleId },
    });

    if (!existing || existing.companyId !== ctx.companyId) {
      throw new Error(`Report schedule "${scheduleId}" not found`);
    }

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.frequency !== undefined) {
      const freq = FREQUENCY_ALIAS[data.frequency] ?? data.frequency;
      updateData.frequency = freq;
      updateData.nextRunAt = this.calculateNextRun(freq) ?? undefined;
    }
    if (data.recipients !== undefined) updateData.recipients = data.recipients as any;
    if (data.format !== undefined) updateData.format = data.format;
    if (data.config !== undefined) updateData.config = data.config as unknown as any;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const record = await prisma.financialReportSchedule.update({
      where: { id: scheduleId },
      data: updateData,
    });

    return this.mapSchedule(record);
  }

  static async deleteSchedule(ctx: TenantContext, scheduleId: string): Promise<void> {
    const existing = await prisma.financialReportSchedule.findUnique({
      where: { id: scheduleId },
    });

    if (!existing || existing.companyId !== ctx.companyId) {
      throw new Error(`Report schedule "${scheduleId}" not found`);
    }

    await prisma.financialReportSchedule.delete({
      where: { id: scheduleId },
    });

    logger.info({ scheduleId }, "report_schedule_deleted");
  }

  static async listSchedules(
    ctx: TenantContext,
    opts: { definitionId?: string; isActive?: boolean; limit?: number; offset?: number } = {},
  ): Promise<{ schedules: ReportSchedule[]; total: number }> {
    const where: Record<string, unknown> = { companyId: ctx.companyId };
    if (opts.definitionId) where.definitionId = opts.definitionId;
    if (opts.isActive !== undefined) where.isActive = opts.isActive;

    const [records, total] = await Promise.all([
      prisma.financialReportSchedule.findMany({
        where: where as any,
        orderBy: { nextRunAt: "asc" },
        take: opts.limit ?? 50,
        skip: opts.offset ?? 0,
      }),
      prisma.financialReportSchedule.count({
        where: where as any,
      }),
    ]);

    return {
      schedules: records.map((r) => this.mapSchedule(r)),
      total,
    };
  }

  static async getSchedule(ctx: TenantContext, scheduleId: string): Promise<ReportSchedule | null> {
    const record = await prisma.financialReportSchedule.findUnique({
      where: { id: scheduleId },
    });

    if (!record || record.companyId !== ctx.companyId) return null;

    return this.mapSchedule(record);
  }

  static async getDueSchedules(): Promise<ReportSchedule[]> {
    const now = new Date();
    const records = await prisma.financialReportSchedule.findMany({
      where: {
        isActive: true,
        nextRunAt: { lte: now },
      },
      orderBy: { nextRunAt: "asc" },
    });

    return records.map((r) => this.mapSchedule(r));
  }

  static calculateNextRun(frequency: string, fromDate?: Date): Date | null {
    const now = fromDate ?? new Date();
    const freq = FREQUENCY_ALIAS[frequency] ?? frequency;
    const next = new Date(now);

    switch (freq) {
      case "daily":
        next.setDate(next.getDate() + 1);
        next.setHours(6, 0, 0, 0);
        return next;
      case "weekly":
        next.setDate(next.getDate() + ((7 - next.getDay() + 1) % 7 || 7));
        next.setHours(6, 0, 0, 0);
        return next;
      case "monthly":
        next.setMonth(next.getMonth() + 1);
        next.setDate(1);
        next.setHours(6, 0, 0, 0);
        return next;
      case "quarterly":
        next.setMonth(next.getMonth() + 3 - (next.getMonth() % 3));
        next.setDate(1);
        next.setHours(6, 0, 0, 0);
        return next;
      case "yearly":
        next.setFullYear(next.getFullYear() + 1);
        next.setMonth(0);
        next.setDate(1);
        next.setHours(6, 0, 0, 0);
        return next;
      default:
        return null;
    }
  }

  private static mapSchedule(record: {
    id: string; definitionId: string; companyId: string; name: string;
    frequency: string; cronExpression: string | null; recipients: unknown;
    format: string; config: unknown; isActive: boolean;
    lastRunAt: Date | null; lastRunStatus: string | null; nextRunAt: Date | null;
    createdBy: string; createdAt: Date; updatedAt: Date;
  }): ReportSchedule {
    return {
      id: record.id,
      definitionId: record.definitionId,
      companyId: record.companyId,
      name: record.name,
      frequency: record.frequency as ScheduleFrequency,
      cronExpression: record.cronExpression ?? undefined,
      recipients: (record.recipients ?? []) as string[],
      format: record.format as ExportFormat,
      config: record.config as unknown as ReportConfig,
      isActive: record.isActive,
      lastRunAt: record.lastRunAt?.toISOString(),
      nextRunAt: record.nextRunAt?.toISOString(),
      createdBy: record.createdBy,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }
}
