import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { WorkflowEngine } from "@/modules/workflow/engine";
import { OperationsService } from "@/modules/operations/operations.service";
import type {
  WorkflowAnalytics,
  StepDurationSummary,
  ApprovalBottleneck,
  StepFailureRate,
  MostUsedWorkflow,
  TopPerformingTemplate,
  AnalyticsQueryOptions,
} from "./types";

export class WorkflowAnalyticsService {
  private workflowEngine: WorkflowEngine;

  constructor() {
    this.workflowEngine = WorkflowEngine.getInstance();
  }

  async getAnalytics(ctx: TenantContext, options?: AnalyticsQueryOptions): Promise<WorkflowAnalytics> {
    const now = new Date();
    const limit = options?.limit ?? 5000;
    const dateFrom = options?.dateFrom ? new Date(options.dateFrom) : undefined;
    const dateTo = options?.dateTo ? new Date(options.dateTo) : undefined;

    const stepWhere: Record<string, unknown> = {
      instance: { companyId: ctx.companyId },
    };
    if (dateFrom || dateTo) {
      const startedAt: Record<string, Date> = {};
      if (dateFrom) startedAt.gte = dateFrom;
      if (dateTo) startedAt.lte = dateTo;
      stepWhere.startedAt = startedAt;
    }

    const [metrics, stepInstances, queueMetrics, mostUsedWorkflows] = await Promise.all([
      this.workflowEngine.getMetrics(ctx),
      prisma.workflowStepInstance.findMany({
        where: stepWhere as any,
        take: limit,
        orderBy: { startedAt: "desc" },
        select: {
          stepType: true,
          status: true,
          startedAt: true,
          completedAt: true,
          error: true,
          instanceId: true,
          label: true,
          instance: { select: { definition: { select: { name: true } } } },
        },
      }),
      OperationsService.getQueueStatus().catch(() => [] as { queueName: string; queued: number; active: number; failed: number; scheduled: number }[]),
      this.computeMostUsedWorkflows(ctx),
    ]);

    const running = metrics.runningInstances;
    const completed = metrics.completedInstances;
    const failed = metrics.failedInstances;
    const waiting = metrics.waitingInstances;
    const paused = metrics.totalInstances - running - completed - failed - waiting - metrics.cancelledInstances;
    const totalInstances = metrics.totalInstances;
    const averageExecutionTimeMs = metrics.averageDurationMs;
    const totalForRate = running + completed + waiting + failed + metrics.cancelledInstances;
    const successRate = totalForRate > 0 ? Math.round((completed / totalForRate) * 100) : 100;
    const failureRate = totalForRate > 0 ? Math.round((failed / totalForRate) * 100) : 0;

    const stepDuration = this.computeStepDuration(stepInstances);
    const approvalBottlenecks = this.computeApprovalBottlenecks(stepInstances, now);
    const stepFailureRate = this.computeStepFailureRate(stepInstances);
    const topTemplates = this.computeTopTemplates(metrics);

    return {
      running,
      completed,
      failed,
      waiting,
      paused: paused < 0 ? 0 : paused,
      cancelled: metrics.cancelledInstances,
      totalInstances,
      averageExecutionTimeMs,
      successRate,
      failureRate,
      stepDuration,
      approvalBottlenecks,
      stepFailureRate,
      topTemplates,
      mostUsedWorkflows,
      queueMetrics: queueMetrics.map((q) => ({
        queueName: q.queueName,
        queued: q.queued,
        active: q.active,
        failed: q.failed,
        scheduled: q.scheduled,
      })),
      computedAt: now.toISOString(),
    };
  }

  private computeStepDuration(
    steps: { stepType: string; startedAt: Date | null; completedAt: Date | null }[],
  ): StepDurationSummary[] {
    const byType = new Map<string, number[]>();

    for (const step of steps) {
      if (!step.startedAt || !step.completedAt) continue;
      const durationMs = step.completedAt.getTime() - step.startedAt.getTime();
      if (durationMs < 0) continue;

      const existing = byType.get(step.stepType) ?? [];
      existing.push(durationMs);
      byType.set(step.stepType, existing);
    }

    return Array.from(byType.entries())
      .map(([stepType, durations]) => ({
        stepType,
        averageDurationMs: Math.round(
          durations.reduce((a, b) => a + b, 0) / durations.length,
        ),
        minDurationMs: Math.min(...durations),
        maxDurationMs: Math.max(...durations),
        executionCount: durations.length,
      }))
      .sort((a, b) => b.executionCount - a.executionCount);
  }

  private computeApprovalBottlenecks(
    steps: Array<{
      stepType: string;
      status: string;
      startedAt: Date | null;
      instanceId: string;
      label: string;
      instance: { definition: { name: string } | null };
    }>,
    now: Date,
  ): ApprovalBottleneck[] {
    return steps
      .filter((s) => s.status === "WAITING_APPROVAL" && s.startedAt)
      .map((s) => {
        const startedAt = s.startedAt!;
        const waitTimeMs = now.getTime() - startedAt.getTime();
        return {
          stepType: s.stepType,
          definitionName: s.instance?.definition?.name ?? null,
          instanceId: s.instanceId,
          stepLabel: s.label,
          waitingSince: startedAt.toISOString(),
          waitTimeMs,
          waitTimeMinutes: Math.round(waitTimeMs / 60000),
        };
      })
      .sort((a, b) => b.waitTimeMs - a.waitTimeMs);
  }

  private computeStepFailureRate(
    steps: Array<{
      stepType: string;
      status: string;
      error: string | null;
      completedAt: Date | null;
    }>,
  ): StepFailureRate[] {
    const byType = new Map<
      string,
      { total: number; failed: number; completed: number }
    >();

    for (const step of steps) {
      if (!step.completedAt) continue;
      const existing = byType.get(step.stepType) ?? {
        total: 0,
        failed: 0,
        completed: 0,
      };
      existing.total++;
      if (step.status === "FAILED") {
        existing.failed++;
      } else if (step.status === "COMPLETED") {
        existing.completed++;
      }
      byType.set(step.stepType, existing);
    }

    return Array.from(byType.entries())
      .map(([stepType, stats]) => ({
        stepType,
        totalExecutions: stats.total,
        failedCount: stats.failed,
        completedCount: stats.completed,
        failureRate:
          stats.total > 0
            ? Math.round((stats.failed / stats.total) * 10000) / 100
            : 0,
      }))
      .sort((a, b) => b.failureRate - a.failureRate);
  }

  private computeTopTemplates(metrics: {
    completedInstances: number;
    failedInstances: number;
    totalInstances: number;
    averageDurationMs: number;
  }): TopPerformingTemplate[] {
    const totalForRate = metrics.totalInstances;
    const successRate =
      totalForRate > 0
        ? Math.round((metrics.completedInstances / totalForRate) * 100)
        : 100;

    return [
      {
        templateId: "all",
        name: "All Workflows",
        executionCount: metrics.totalInstances,
        successRate,
        averageDurationMs: metrics.averageDurationMs,
      },
    ];
  }

  private async computeMostUsedWorkflows(
    ctx: TenantContext,
  ): Promise<MostUsedWorkflow[]> {
    const grouped = await prisma.workflowInstance.groupBy({
      by: ["definitionId"],
      where: { companyId: ctx.companyId },
      _count: { id: true },
      _max: { createdAt: true },
      orderBy: { _count: { id: "desc" } },
      take: 20,
    });

    if (grouped.length === 0) return [];

    const defIds = grouped.map((g) => g.definitionId);
    const definitions = await prisma.workflowDefinition.findMany({
      where: { id: { in: defIds } },
      select: { id: true, name: true },
    });

    const defMap = new Map(definitions.map((d) => [d.id, d.name]));

    return grouped.map((g) => ({
      definitionId: g.definitionId,
      name: defMap.get(g.definitionId) ?? "Unknown",
      executionCount: g._count.id,
      lastExecutedAt: g._max.createdAt?.toISOString() ?? null,
    }));
  }
}
