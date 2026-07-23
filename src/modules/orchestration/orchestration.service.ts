import type { TenantContext } from "@/server/context/tenant-context";
import { OrchestrationExecutionEngine } from "./workflow-engine";
import { WorkflowBuilder } from "./workflow-builder";
import { AutomationEngine } from "./automation-engine";
import { SchedulerService } from "./scheduler.service";
import { TemplateLibrary } from "./template-library";
import type {
  WorkflowExecutionData, WorkflowDefinitionData, WorkflowTemplateData,
  AutomationRuleData, WorkflowScheduleData, WorkflowLogData,
  WorkflowMetricData, WorkflowNotificationData, MonitoringSummary,
  WorkflowAnalyticsData,
} from "./types";
import { prisma } from "@/server/db/prisma";

export class OrchestrationService {
  static WorkflowEngine = OrchestrationExecutionEngine;
  static WorkflowBuilder = WorkflowBuilder;
  static AutomationEngine = AutomationEngine;
  static SchedulerService = SchedulerService;
  static TemplateLibrary = TemplateLibrary;

  static async getMonitoringSummary(ctx: TenantContext): Promise<MonitoringSummary> {
    const [totalWorkflows, activeWorkflows, running, pending, failedToday, completedToday, metrics] =
      await Promise.all([
        prisma.workflowDefinition.count({ where: { companyId: ctx.companyId } }),
        prisma.workflowDefinition.count({ where: { companyId: ctx.companyId, status: "ACTIVE" } }),
        prisma.workflowExecution.count({ where: { companyId: ctx.companyId, status: "running" } }),
        prisma.workflowExecution.count({ where: { companyId: ctx.companyId, status: "pending" } }),
        prisma.workflowExecution.count({
          where: {
            companyId: ctx.companyId,
            status: "failed",
            createdAt: { gte: new Date(Date.now() - 86400000) },
          },
        }),
        prisma.workflowExecution.count({
          where: {
            companyId: ctx.companyId,
            status: "completed",
            createdAt: { gte: new Date(Date.now() - 86400000) },
          },
        }),
        prisma.workflowMetric.aggregate({
          where: { companyId: ctx.companyId },
          _avg: { avgDurationMs: true },
          _max: { p95DurationMs: true },
        }),
      ]);

    return {
      totalWorkflows,
      activeWorkflows,
      runningExecutions: running,
      pendingExecutions: pending,
      failedToday,
      completedToday,
      avgDurationMs: metrics._avg.avgDurationMs ?? 0,
      p95DurationMs: metrics._max.p95DurationMs ?? 0,
      retryRate: completedToday + failedToday > 0 ? failedToday / (completedToday + failedToday) : 0,
    };
  }

  static async getAnalytics(ctx: TenantContext, periodStart?: string, periodEnd?: string): Promise<WorkflowAnalyticsData> {
    const end = periodEnd ? new Date(periodEnd) : new Date();
    const start = periodStart ? new Date(periodStart) : new Date(end.getTime() - 30 * 86400000);

    const [executions, metrics] = await Promise.all([
      prisma.workflowExecution.findMany({
        where: { companyId: ctx.companyId, createdAt: { gte: start, lte: end } },
        orderBy: { createdAt: "asc" },
      }),
      prisma.workflowMetric.aggregate({
        where: { companyId: ctx.companyId },
        _avg: { avgDurationMs: true },
        _max: { p95DurationMs: true },
      }),
    ]);

    const byTrigger: Record<string, number> = {};
    const hourlyDistribution = new Array(24).fill(0);
    for (const e of executions) {
      byTrigger[e.trigger] = (byTrigger[e.trigger] ?? 0) + 1;
      const hour = e.createdAt.getHours();
      hourlyDistribution[hour]++;
    }

    const completed = executions.filter((e) => e.status === "completed").length;
    const failed = executions.filter((e) => e.status === "failed").length;

    return {
      periodStart: start.toISOString(),
      periodEnd: end.toISOString(),
      totalExecutions: executions.length,
      completed,
      failed,
      avgDurationMs: metrics._avg.avgDurationMs ?? 0,
      p95DurationMs: metrics._max.p95DurationMs ?? 0,
      byWorkflow: [],
      byTrigger,
      hourlyDistribution,
    };
  }

  static async listLogs(ctx: TenantContext, executionId?: string): Promise<WorkflowLogData[]> {
    const where: Record<string, unknown> = { companyId: ctx.companyId };
    if (executionId) where.executionId = executionId;
    const rows = await prisma.workflowLog.findMany({
      where: where as never,
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return rows.map((l) => ({
      id: l.id, companyId: l.companyId, executionId: l.executionId,
      workflowId: l.workflowId, level: l.level as WorkflowLogData["level"],
      message: l.message, metadata: l.metadata as Record<string, unknown> | undefined,
      createdAt: l.createdAt.toISOString(),
    }));
  }

  static async getMetrics(ctx: TenantContext, workflowId?: string): Promise<WorkflowMetricData[]> {
    const where: Record<string, unknown> = { companyId: ctx.companyId };
    if (workflowId) where.workflowId = workflowId;
    const rows = await prisma.workflowMetric.findMany({
      where: where as never,
      orderBy: { createdAt: "desc" },
      take: 30,
    });
    return rows.map((m) => ({
      id: m.id, companyId: m.companyId, workflowId: m.workflowId,
      periodStart: m.periodStart.toISOString(), periodEnd: m.periodEnd.toISOString(),
      totalExecutions: m.totalExecutions, completed: m.completed, failed: m.failed,
      avgDurationMs: m.avgDurationMs ?? undefined,
      p95DurationMs: m.p95DurationMs ?? undefined,
      createdAt: m.createdAt.toISOString(),
    }));
  }

  static async listNotifications(ctx: TenantContext): Promise<WorkflowNotificationData[]> {
    const rows = await prisma.workflowNotification.findMany({
      where: { companyId: ctx.companyId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((n) => ({
      id: n.id, companyId: n.companyId, workflowId: n.workflowId,
      triggerOn: n.triggerOn as WorkflowNotificationData["triggerOn"],
      roleTarget: n.roleTarget ?? undefined,
      channel: n.channel as WorkflowNotificationData["channel"],
      template: n.template ?? undefined,
      isActive: n.isActive,
      createdAt: n.createdAt.toISOString(),
    }));
  }

  static async createNotification(ctx: TenantContext, data: {
    workflowId: string; triggerOn: string; roleTarget?: string;
    channel?: string; template?: string;
  }): Promise<WorkflowNotificationData> {
    const n = await prisma.workflowNotification.create({
      data: {
        companyId: ctx.companyId,
        workflowId: data.workflowId,
        triggerOn: data.triggerOn,
        roleTarget: data.roleTarget,
        channel: data.channel ?? "in-app",
        template: data.template,
      },
    });
    return {
      id: n.id, companyId: n.companyId, workflowId: n.workflowId,
      triggerOn: n.triggerOn as WorkflowNotificationData["triggerOn"],
      roleTarget: n.roleTarget ?? undefined,
      channel: n.channel as WorkflowNotificationData["channel"],
      template: n.template ?? undefined,
      isActive: n.isActive,
      createdAt: n.createdAt.toISOString(),
    };
  }

  static async emitEvent(ctx: TenantContext, eventType: string, source: string, payload?: Record<string, unknown>): Promise<void> {
    await AutomationEngine.evaluate(ctx, eventType, payload);
  }
}
