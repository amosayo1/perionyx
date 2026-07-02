import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { ReconciliationEngine } from "@/modules/ledger/reconciliation-engine";
import { recordAudit } from "@/modules/audit";

export type ReconciliationRunSummary = {
  id: string;
  status: string;
  type: string;
  summary: Record<string, any> | null;
  exceptionCount: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
};

export type ExceptionSummary = {
  id: string;
  type: string;
  severity: string;
  resourceType: string;
  resourceId: string;
  message: string;
  details: Record<string, any> | null;
  resolved: boolean;
  resolvedAt: string | null;
  createdAt: string;
};

export type ReportSummary = {
  id: string;
  title: string;
  type: string;
  format: string;
  totalIssues: number;
  resolvedIssues: number;
  createdAt: string;
};

export class ReconciliationService {
  static async initiateRun(ctx: TenantContext, type: string = "FULL"): Promise<string> {
    const run = await prisma.reconciliationRun.create({
      data: {
        companyId: ctx.companyId,
        status: "IN_PROGRESS",
        type,
        startedAt: new Date(),
      },
    });

    try {
      const report = await ReconciliationEngine.reconcileCompany(ctx.companyId);
      const exceptions = report.issues.map((issue) => ({
        runId: run.id,
        companyId: ctx.companyId,
        type: issue.type,
        severity: issue.severity,
        resourceType: issue.resourceType,
        resourceId: issue.resourceId,
        message: issue.message,
        details: (issue.details as Record<string, any>) ?? null,
      }));

      if (exceptions.length > 0) {
        await prisma.reconciliationException.createMany({ data: exceptions });
      }

      const summary = {
        walletsChecked: report.summary.walletsChecked,
        totalWallets: report.summary.totalWallets,
        issuesFound: report.summary.issuesFound,
        isHealthy: report.summary.isHealthy,
        exceptionsByType: this.groupExceptionsByType(report.issues),
      };

      await prisma.reconciliationRun.update({
        where: { id: run.id },
        data: {
          status: "COMPLETED",
          summary,
          completedAt: new Date(),
        },
      });

      await prisma.reconciliationReport.create({
        data: {
          runId: run.id,
          companyId: ctx.companyId,
          title: `Reconciliation Report - ${new Date().toISOString().split("T")[0]}`,
          type,
          data: report as any,
          totalIssues: report.issues.length,
        },
      });

      await recordAudit(prisma, {
        companyId: ctx.companyId,
        actorUserId: ctx.userId,
        action: "RECONCILIATION_RUN_COMPLETED",
        resourceType: "ReconciliationRun",
        resourceId: run.id,
        metadata: { type, issuesFound: report.issues.length, isHealthy: report.summary.isHealthy },
      });

      return run.id;
    } catch (error) {
      await prisma.reconciliationRun.update({
        where: { id: run.id },
        data: { status: "FAILED", completedAt: new Date() },
      });

      await recordAudit(prisma, {
        companyId: ctx.companyId,
        actorUserId: ctx.userId,
        action: "RECONCILIATION_RUN_FAILED",
        resourceType: "ReconciliationRun",
        resourceId: run.id,
        severity: "WARNING",
        metadata: { type, error: String(error) },
      });

      throw error;
    }
  }

  static async listRuns(ctx: TenantContext, limit: number = 20, cursor?: string): Promise<{ items: ReconciliationRunSummary[]; nextCursor?: string }> {
    const rows = await prisma.reconciliationRun.findMany({
      where: { companyId: ctx.companyId },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    let nextCursor: string | undefined;
    if (rows.length > limit) {
      rows.pop();
      nextCursor = rows[rows.length - 1]?.id;
    }

    const items = await Promise.all(
      rows.map(async (r) => ({
        id: r.id,
        status: r.status,
        type: r.type,
        summary: r.summary as Record<string, any> | null,
        exceptionCount: await prisma.reconciliationException.count({ where: { runId: r.id } }),
        startedAt: r.startedAt?.toISOString() ?? null,
        completedAt: r.completedAt?.toISOString() ?? null,
        createdAt: r.createdAt.toISOString(),
      }))
    );

    return { items, nextCursor };
  }

  static async getRun(ctx: TenantContext, runId: string) {
    const run = await prisma.reconciliationRun.findFirst({
      where: { id: runId, companyId: ctx.companyId },
    });
    if (!run) return null;

    const exceptions = await prisma.reconciliationException.findMany({
      where: { runId },
      orderBy: { createdAt: "asc" },
    });

    const reports = await prisma.reconciliationReport.findMany({
      where: { runId },
      orderBy: { createdAt: "desc" },
    });

    return {
      ...run,
      summary: run.summary as Record<string, any> | null,
      startedAt: run.startedAt?.toISOString() ?? null,
      completedAt: run.completedAt?.toISOString() ?? null,
      createdAt: run.createdAt.toISOString(),
      updatedAt: run.updatedAt.toISOString(),
      exceptions: exceptions.map((e) => ({
        ...e,
        details: e.details as Record<string, any> | null,
        createdAt: e.createdAt.toISOString(),
        resolvedAt: e.resolvedAt?.toISOString() ?? null,
      })),
      reports: reports.map((r) => ({
        ...r,
        data: r.data as Record<string, any>,
        createdAt: r.createdAt.toISOString(),
      })),
    };
  }

  static async listExceptions(ctx: TenantContext, opts: { resolved?: boolean; severity?: string; limit?: number; cursor?: string }) {
    const where: any = { companyId: ctx.companyId };
    if (opts.resolved !== undefined) where.resolved = opts.resolved;
    if (opts.severity) where.severity = opts.severity;

    const limit = opts.limit ?? 20;
    const rows = await prisma.reconciliationException.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      ...(opts.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
    });

    let nextCursor: string | undefined;
    if (rows.length > limit) {
      rows.pop();
      nextCursor = rows[rows.length - 1]?.id;
    }

    return {
      items: rows.map((e) => ({
        id: e.id,
        type: e.type,
        severity: e.severity,
        resourceType: e.resourceType,
        resourceId: e.resourceId,
        message: e.message,
        details: e.details as Record<string, any> | null,
        resolved: e.resolved,
        resolvedAt: e.resolvedAt?.toISOString() ?? null,
        createdAt: e.createdAt.toISOString(),
      })),
      nextCursor,
    };
  }

  static async resolveException(ctx: TenantContext, exceptionId: string) {
    const exception = await prisma.reconciliationException.findFirst({
      where: { id: exceptionId, companyId: ctx.companyId },
    });
    if (!exception) return null;

    const updated = await prisma.reconciliationException.update({
      where: { id: exceptionId },
      data: { resolved: true, resolvedAt: new Date(), resolvedByUserId: ctx.userId },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "RECONCILIATION_EXCEPTION_RESOLVED",
      resourceType: "ReconciliationException",
      resourceId: exceptionId,
    });

    return updated;
  }

  static async listReports(ctx: TenantContext, limit: number = 20, cursor?: string): Promise<{ items: ReportSummary[]; nextCursor?: string }> {
    const rows = await prisma.reconciliationReport.findMany({
      where: { companyId: ctx.companyId },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    let nextCursor: string | undefined;
    if (rows.length > limit) {
      rows.pop();
      nextCursor = rows[rows.length - 1]?.id;
    }

    return {
      items: rows.map((r) => ({
        id: r.id,
        title: r.title,
        type: r.type,
        format: r.format,
        totalIssues: r.totalIssues,
        resolvedIssues: r.resolvedIssues,
        createdAt: r.createdAt.toISOString(),
      })),
      nextCursor,
    };
  }

  static async getReport(ctx: TenantContext, reportId: string) {
    const report = await prisma.reconciliationReport.findFirst({
      where: { id: reportId, companyId: ctx.companyId },
    });
    if (!report) return null;

    return {
      ...report,
      data: report.data as Record<string, any>,
      createdAt: report.createdAt.toISOString(),
    };
  }

  static async getReconciliationHealth(ctx: TenantContext) {
    const lastRun = await prisma.reconciliationRun.findFirst({
      where: { companyId: ctx.companyId },
      orderBy: { createdAt: "desc" },
    });

    const openExceptions = await prisma.reconciliationException.count({
      where: { companyId: ctx.companyId, resolved: false },
    });

    const recentExceptions = await prisma.reconciliationException.count({
      where: { companyId: ctx.companyId, resolved: false, createdAt: { gte: new Date(Date.now() - 7 * 86400000) } },
    });

    const totalRuns = await prisma.reconciliationRun.count({
      where: { companyId: ctx.companyId },
    });

    const failedRuns = await prisma.reconciliationRun.count({
      where: { companyId: ctx.companyId, status: "FAILED" },
    });

    return {
      lastRunAt: lastRun?.completedAt?.toISOString() ?? null,
      lastRunStatus: lastRun?.status ?? null,
      openExceptions,
      recentExceptions,
      totalRuns,
      failedRuns,
      health: openExceptions === 0 ? "GOOD" : openExceptions > 5 ? "CRITICAL" : "WARNING",
    };
  }

  private static groupExceptionsByType(issues: any[]): Record<string, number> {
    const groups: Record<string, number> = {};
    for (const issue of issues) {
      groups[issue.type] = (groups[issue.type] ?? 0) + 1;
    }
    return groups;
  }
}
