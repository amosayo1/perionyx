import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { WorkflowExecutionData, WorkflowStatus, WorkflowMetricData } from "./types";
import { OrchestrationExecutionEngine } from "./workflow-engine";

export class MonitorService {
  static async getRunningExecutions(ctx: TenantContext): Promise<WorkflowExecutionData[]> {
    return OrchestrationExecutionEngine.listExecutions(ctx, { status: "running" });
  }

  static async getFailedExecutions(ctx: TenantContext, limit = 20): Promise<WorkflowExecutionData[]> {
    return OrchestrationExecutionEngine.listExecutions(ctx, { status: "failed", limit });
  }

  static async getPendingExecutions(ctx: TenantContext): Promise<WorkflowExecutionData[]> {
    return OrchestrationExecutionEngine.listExecutions(ctx, { status: "pending" });
  }

  static async getExecutionById(ctx: TenantContext, executionId: string): Promise<WorkflowExecutionData | null> {
    return OrchestrationExecutionEngine.getExecution(ctx, executionId);
  }

  static async cancelExecution(ctx: TenantContext, executionId: string): Promise<void> {
    const exec = await prisma.workflowExecution.findUnique({ where: { id: executionId } });
    if (!exec || exec.companyId !== ctx.companyId) throw new Error("Not found");
    await prisma.workflowExecution.update({
      where: { id: executionId },
      data: { status: "cancelled", completedAt: new Date() },
    });
  }

  static async retryExecution(ctx: TenantContext, executionId: string): Promise<WorkflowExecutionData | null> {
    const exec = await prisma.workflowExecution.findUnique({ where: { id: executionId } });
    if (!exec || exec.companyId !== ctx.companyId) throw new Error("Not found");
    if (exec.status !== "failed") throw new Error("Can only retry failed executions");
    if (exec.retryCount >= exec.maxRetries) throw new Error("Max retries exceeded");

    await prisma.workflowExecution.update({
      where: { id: executionId },
      data: { status: "running", retryCount: { increment: 1 }, error: null, startedAt: new Date() },
    });

    const result = await OrchestrationExecutionEngine.execute(ctx, exec.workflowId, exec.trigger as import("./types").TriggerType, exec.input as Record<string, unknown> | undefined);
    return OrchestrationExecutionEngine.getExecution(ctx, result.executionId);
  }

  static async recordMetric(ctx: TenantContext, data: {
    workflowId: string; periodStart: Date; periodEnd: Date;
    totalExecutions: number; completed: number; failed: number;
    avgDurationMs?: number; p95DurationMs?: number;
  }): Promise<WorkflowMetricData> {
    const m = await prisma.workflowMetric.create({
      data: {
        companyId: ctx.companyId,
        workflowId: data.workflowId,
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
        totalExecutions: data.totalExecutions,
        completed: data.completed,
        failed: data.failed,
        avgDurationMs: data.avgDurationMs,
        p95DurationMs: data.p95DurationMs,
      },
    });
    return {
      id: m.id, companyId: m.companyId, workflowId: m.workflowId,
      periodStart: m.periodStart.toISOString(), periodEnd: m.periodEnd.toISOString(),
      totalExecutions: m.totalExecutions, completed: m.completed, failed: m.failed,
      avgDurationMs: m.avgDurationMs ?? undefined, p95DurationMs: m.p95DurationMs ?? undefined,
      createdAt: m.createdAt.toISOString(),
    };
  }
}
