import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { logger } from "@/lib/logger";
import type { ReportType, ReportConfig, ReportExecution, ReportSection } from "./types";
import { getBuilder } from "./report-registry";

export class ReportEngine {
  static generateId(): string {
    return crypto.randomUUID();
  }

  static validateConfig(config: ReportConfig): void {
    if (!config.dateRange || !config.dateRange.start || !config.dateRange.end) {
      throw new Error("Report config must include a valid dateRange with start and end dates");
    }
    if (!config.currency) {
      throw new Error("Report config must specify a currency");
    }
    if (!config.companyIds || config.companyIds.length === 0) {
      throw new Error("Report config must include at least one companyId");
    }
    if (new Date(config.dateRange.start) > new Date(config.dateRange.end)) {
      throw new Error("Report dateRange start must be before or equal to end");
    }
  }

  static async execute(
    ctx: TenantContext,
    reportType: ReportType,
    config: ReportConfig,
  ): Promise<ReportExecution> {
    this.validateConfig(config);

    const builder = await getBuilder(reportType);

    const startTime = performance.now();
    let sections: ReportSection[] = [];
    let error: string | undefined;

    try {
      sections = await builder.build(ctx, config);
    } catch (err) {
      error = err instanceof Error ? err.message : "Unknown error during report generation";
      logger.error({ reportType, error }, "report_execution_failed");
    }

    const executionTimeMs = Math.round(performance.now() - startTime);
    const totalRows = sections.reduce((sum, s) => sum + s.rows.length, 0);

    const execution: ReportExecution = {
      id: this.generateId(),
      definitionId: "",
      companyId: ctx.companyId,
      status: error ? "failed" : "completed",
      reportType,
      config,
      sections,
      totalRows,
      executionTimeMs,
      error,
      requestedBy: ctx.userId,
      completedAt: error ? undefined : new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    return execution;
  }

  static async executeAndSave(
    ctx: TenantContext,
    definitionId: string,
    requestedBy: string,
  ): Promise<ReportExecution> {
    const definition = await prisma.financialReportDefinition.findUnique({
      where: { id: definitionId },
    });

    if (!definition || definition.companyId !== ctx.companyId) {
      throw new Error(`Report definition "${definitionId}" not found`);
    }

    const config = definition.config as unknown as ReportConfig;
    const execution = await this.execute(ctx, definition.reportType as ReportType, config);

    execution.definitionId = definition.id;
    execution.requestedBy = requestedBy;

    await prisma.financialReportExecution.create({
      data: {
        id: execution.id,
        definitionId: definition.id,
        companyId: ctx.companyId,
        status: execution.status,
        reportType: execution.reportType,
        config: JSON.parse(JSON.stringify(config)) as any,
        sections: JSON.parse(JSON.stringify(execution.sections)) as any,
        summary: execution.summary ? JSON.parse(JSON.stringify(execution.summary)) as any : undefined,
        totalRows: execution.totalRows,
        executionTimeMs: execution.executionTimeMs,
        error: execution.error,
        requestedBy,
        completedAt: execution.completedAt ? new Date(execution.completedAt) : undefined,
      },
    });

    await prisma.financialReportDefinition.update({
      where: { id: definition.id },
      data: { lastRunAt: new Date() },
    });

    return execution;
  }

  static async getExecution(
    ctx: TenantContext,
    executionId: string,
  ): Promise<ReportExecution | null> {
    const record = await prisma.financialReportExecution.findUnique({
      where: { id: executionId },
    });

    if (!record || record.companyId !== ctx.companyId) return null;

    return {
      id: record.id,
      definitionId: record.definitionId,
      companyId: record.companyId,
      status: record.status as ReportExecution["status"],
      reportType: record.reportType as ReportType,
      config: record.config as unknown as ReportConfig,
      sections: record.sections as unknown as ReportSection[],
      summary: record.summary ? (JSON.parse(JSON.stringify(record.summary)) as ReportExecution["summary"]) : undefined,
      totalRows: record.totalRows,
      executionTimeMs: record.executionTimeMs,
      error: record.error ?? undefined,
      requestedBy: record.requestedBy,
      completedAt: record.completedAt?.toISOString(),
      createdAt: record.createdAt.toISOString(),
    };
  }

  static async listExecutions(
    ctx: TenantContext,
    opts: { definitionId?: string; limit?: number; offset?: number } = {},
  ): Promise<{ executions: ReportExecution[]; total: number }> {
    const where: Record<string, unknown> = { companyId: ctx.companyId };
    if (opts.definitionId) where.definitionId = opts.definitionId;

    const [records, total] = await Promise.all([
      prisma.financialReportExecution.findMany({
        where: where as any,
        orderBy: { createdAt: "desc" },
        take: opts.limit ?? 50,
        skip: opts.offset ?? 0,
      }),
      prisma.financialReportExecution.count({
        where: where as any,
      }),
    ]);

    const executions = records.map((r) => ({
      id: r.id,
      definitionId: r.definitionId,
      companyId: r.companyId,
      status: r.status as ReportExecution["status"],
      reportType: r.reportType as ReportType,
      config: r.config as unknown as ReportConfig,
      sections: r.sections as unknown as ReportSection[],
      summary: r.summary ? (JSON.parse(JSON.stringify(r.summary)) as ReportExecution["summary"]) : undefined,
      totalRows: r.totalRows,
      executionTimeMs: r.executionTimeMs,
      error: r.error ?? undefined,
      requestedBy: r.requestedBy,
      completedAt: r.completedAt?.toISOString(),
      createdAt: r.createdAt.toISOString(),
    }));

    return { executions, total };
  }
}
