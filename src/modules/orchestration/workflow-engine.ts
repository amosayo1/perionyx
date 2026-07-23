import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { WorkflowStatus, WorkflowStep, TriggerType, WorkflowExecutionData, WorkflowStepExecutionData, ExecutionResult } from "./types";


export class OrchestrationExecutionEngine {
  static async execute(
    ctx: TenantContext,
    workflowId: string,
    trigger: TriggerType,
    input?: Record<string, unknown>,
  ): Promise<ExecutionResult> {
    const def = await prisma.workflowDefinition.findUnique({ where: { id: workflowId } });
    if (!def || def.status !== "ACTIVE") throw new Error(`Workflow ${workflowId} not found or inactive`);
    if (def.companyId !== ctx.companyId) throw new Error("Cross-tenant access denied");

    const steps = (def.steps as unknown as WorkflowStep[]).sort((a, b) => a.index - b.index);
    const startTime = Date.now();

    const execution = await prisma.workflowExecution.create({
      data: {
        companyId: ctx.companyId,
        workflowId: def.id,
        status: "running",
        trigger,
        input: input as never ?? {},
        startedAt: new Date(),
      },
    });

    const stepRecords: WorkflowStepExecutionData[] = [];
    let finalStatus: WorkflowStatus = "completed";
    let finalError: string | undefined;

    try {
      for (const step of steps) {
        const stepStart = Date.now();
        try {
          const stepResult = await this.executeStep(ctx, execution.id, def.id, step, input);
          stepRecords.push(stepResult);
          if (stepResult.status === "failed") {
            finalStatus = "failed";
            finalError = stepResult.error;
            break;
          }
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : "Step execution failed";
          stepRecords.push({
            id: "",
            executionId: execution.id,
            workflowId: def.id,
            stepIndex: step.index,
            stepType: step.type,
            module: step.module,
            action: step.action,
            status: "failed",
            error: errMsg,
            startedAt: new Date(stepStart).toISOString(),
            completedAt: new Date().toISOString(),
            durationMs: Date.now() - stepStart,
            retryCount: 0,
          });
          finalStatus = "failed";
          finalError = errMsg;
          break;
        }
      }
    } catch (err) {
      finalStatus = "failed";
      finalError = err instanceof Error ? err.message : "Unknown execution error";
    }

    const durationMs = Date.now() - startTime;
    await prisma.workflowExecution.update({
      where: { id: execution.id },
      data: {
        status: finalStatus,
        output: finalStatus === "completed" ? { steps: stepRecords } as never : undefined,
        error: finalError,
        completedAt: new Date(),
        durationMs,
      },
    });



    return {
      executionId: execution.id,
      status: finalStatus,
      output: finalStatus === "completed" ? { steps: stepRecords } : undefined,
      error: finalError,
      durationMs,
    };
  }

  private static async executeStep(
    ctx: TenantContext,
    executionId: string,
    workflowId: string,
    step: WorkflowStep,
    input?: Record<string, unknown>,
  ): Promise<WorkflowStepExecutionData> {
    const startTime = Date.now();
    let status: WorkflowStepExecutionData["status"] = "completed";
    let error: string | undefined;
    let output: Record<string, unknown> | undefined;

    try {
      output = await this.dispatch(ctx, step, input);
    } catch (err) {
      status = "failed";
      error = err instanceof Error ? err.message : "Unknown step error";
    }

    const durationMs = Date.now() - startTime;

    await prisma.workflowStepExecution.create({
      data: {
        companyId: ctx.companyId,
        executionId,
        workflowId,
        stepIndex: step.index,
        stepType: step.type,
        module: step.module,
        action: step.action,
        input: (input ?? {}) as never,
        output: (output ?? {}) as never,
        status,
        error,
        startedAt: new Date(startTime),
        completedAt: new Date(),
        durationMs,
        retryCount: 0,
      },
    });

    return {
      id: "",
      executionId,
      workflowId,
      stepIndex: step.index,
      stepType: step.type,
      module: step.module,
      action: step.action,
      input: input ?? {},
      output,
      status,
      error,
      startedAt: new Date(startTime).toISOString(),
      completedAt: new Date().toISOString(),
      durationMs,
      retryCount: 0,
    };
  }

  private static async dispatch(
    ctx: TenantContext,
    step: WorkflowStep,
    _input?: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    switch (step.type) {
      case "module_action":
        return this.executeModuleAction(ctx, step);
      case "condition":
        return { result: true };
      case "notification":
        return { sent: true };
      case "delay": {
        const delayMs = step.config?.delayMs;
        if (delayMs) await new Promise((r) => setTimeout(r, delayMs as number));
        return { delayed: true };
      }
      case "sub_workflow":
        if (step.config?.workflowId) {
          const result = await this.execute(ctx, step.config.workflowId as string, "manual", _input);
          return result as unknown as Record<string, unknown>;
        }
        return { skipped: true };
      default:
        return { skipped: true };
    }
  }

  private static async executeModuleAction(
    _ctx: TenantContext,
    _step: WorkflowStep,
  ): Promise<Record<string, unknown>> {
    return { action: _step.action ?? "unknown", module: _step.module ?? "unknown", status: "simulated" };
  }

  static async getExecution(ctx: TenantContext, executionId: string): Promise<WorkflowExecutionData | null> {
    const exec = await prisma.workflowExecution.findUnique({
      where: { id: executionId },
      include: { steps: true },
    });
    if (!exec || exec.companyId !== ctx.companyId) return null;
    return {
      id: exec.id,
      companyId: exec.companyId,
      workflowId: exec.workflowId,
      status: exec.status as WorkflowStatus,
      trigger: exec.trigger as TriggerType,
      input: exec.input as Record<string, unknown> | undefined,
      output: exec.output as Record<string, unknown> | undefined,
      error: exec.error ?? undefined,
      startedAt: exec.startedAt?.toISOString(),
      completedAt: exec.completedAt?.toISOString(),
      durationMs: exec.durationMs ?? undefined,
      retryCount: exec.retryCount,
      maxRetries: exec.maxRetries,
      steps: exec.steps.map((s) => ({
        id: s.id,
        executionId: s.executionId,
        workflowId: s.workflowId,
        stepIndex: s.stepIndex,
        stepType: s.stepType as WorkflowStepExecutionData["stepType"],
        module: s.module ?? undefined,
        action: s.action ?? undefined,
        input: s.input as Record<string, unknown> | undefined,
        output: s.output as Record<string, unknown> | undefined,
        status: s.status as WorkflowStepExecutionData["status"],
        error: s.error ?? undefined,
        startedAt: s.startedAt?.toISOString(),
        completedAt: s.completedAt?.toISOString(),
        durationMs: s.durationMs ?? undefined,
        retryCount: s.retryCount,
      })),
      createdAt: exec.createdAt.toISOString(),
    };
  }

  static async listExecutions(
    ctx: TenantContext,
    opts?: { workflowId?: string; status?: WorkflowStatus; limit?: number },
  ): Promise<WorkflowExecutionData[]> {
    const where: Record<string, unknown> = { companyId: ctx.companyId };
    if (opts?.workflowId) where.workflowId = opts.workflowId;
    if (opts?.status) where.status = opts.status;

    const rows = await prisma.workflowExecution.findMany({
      where: where as never,
      orderBy: { createdAt: "desc" },
      take: opts?.limit ?? 50,
      include: { steps: true },
    });

    return rows.map((exec) => ({
      id: exec.id,
      companyId: exec.companyId,
      workflowId: exec.workflowId,
      status: exec.status as WorkflowStatus,
      trigger: exec.trigger as TriggerType,
      input: exec.input as Record<string, unknown> | undefined,
      output: exec.output as Record<string, unknown> | undefined,
      error: exec.error ?? undefined,
      startedAt: exec.startedAt?.toISOString(),
      completedAt: exec.completedAt?.toISOString(),
      durationMs: exec.durationMs ?? undefined,
      retryCount: exec.retryCount,
      maxRetries: exec.maxRetries,
      steps: exec.steps.map((s) => ({
        id: s.id,
        executionId: s.executionId,
        workflowId: s.workflowId,
        stepIndex: s.stepIndex,
        stepType: s.stepType as WorkflowStepExecutionData["stepType"],
        module: s.module ?? undefined,
        action: s.action ?? undefined,
        input: s.input as Record<string, unknown> | undefined,
        output: s.output as Record<string, unknown> | undefined,
        status: s.status as WorkflowStepExecutionData["status"],
        error: s.error ?? undefined,
        startedAt: s.startedAt?.toISOString(),
        completedAt: s.completedAt?.toISOString(),
        durationMs: s.durationMs ?? undefined,
        retryCount: s.retryCount,
      })),
      createdAt: exec.createdAt.toISOString(),
    }));
  }
}
