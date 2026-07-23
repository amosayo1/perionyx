import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { recordAudit } from "@/modules/audit";
import { ConflictError, ForbiddenError } from "@/lib/errors/app-error";
import { emitRealtimeEvent } from "@/server/realtime";
import { RealtimeEvents, RealtimeChannels } from "@/server/realtime";
import { WorkflowVersionSnapshotService } from "./version-snapshot.service";
import { WorkflowStateMachine } from "./state-machine";
import { stepRegistry } from "./step-registry";
import { ApprovalStepExecutor } from "./steps/approval-step";
import { DecisionStepExecutor } from "./steps/decision-step";
import { PolicyEvaluationStepExecutor } from "./steps/policy-evaluation-step";
import { NotificationStepExecutor } from "./steps/notification-step";
import { DelayStepExecutor } from "./steps/delay-step";
import { ConnectorStepExecutor } from "./steps/connector-step";
import { AiRecommendationStepExecutor } from "./steps/ai-recommendation-step";
import { ConditionalBranchStepExecutor } from "./steps/conditional-step";
import { HumanTaskStepExecutor } from "./steps/human-task-step";
import type {
  WorkflowStatus, StepStatus, StepDefinition, WorkflowExecutionContext,
  WorkflowMetricsSummary, WorkflowInstanceSummary, WorkflowDefinitionSummary,
  WorkflowEventType, StepResult,
} from "./types";

export interface ApprovalConfigEnricher {
  (
    ctx: TenantContext,
    stepDef: StepDefinition,
    instanceInput?: Record<string, unknown>,
  ): Promise<Record<string, unknown> | null>;
}

export interface ApprovalHistoryRecorder {
  (
    instanceId: string,
    stepId: string,
    approverId: string,
    approverRole: string,
    action: "approved" | "rejected" | "delegated" | "escalated" | "timed_out",
    comment?: string | null,
    delegatedTo?: string | null,
  ): Promise<void>;
}

export class WorkflowEngine {
  private static sharedInstance: WorkflowEngine | null = null;

  static getInstance(): WorkflowEngine {
    if (!WorkflowEngine.sharedInstance) {
      WorkflowEngine.sharedInstance = new WorkflowEngine();
    }
    return WorkflowEngine.sharedInstance;
  }

  private approvalConfigEnricher: ApprovalConfigEnricher | null = null;
  private approvalHistoryRecorder: ApprovalHistoryRecorder | null = null;
  private stepInitialized = false;

  setApprovalConfigEnricher(enricher: ApprovalConfigEnricher): void {
    this.approvalConfigEnricher = enricher;
  }

  setApprovalHistoryRecorder(recorder: ApprovalHistoryRecorder): void {
    this.approvalHistoryRecorder = recorder;
  }

  private ensureSteps(): void {
    if (this.stepInitialized) return;
    this.stepInitialized = true;
    stepRegistry.register(new ApprovalStepExecutor());
    stepRegistry.register(new DecisionStepExecutor());
    stepRegistry.register(new PolicyEvaluationStepExecutor());
    stepRegistry.register(new NotificationStepExecutor());
    stepRegistry.register(new DelayStepExecutor());
    stepRegistry.register(new ConnectorStepExecutor());
    stepRegistry.register(new AiRecommendationStepExecutor());
    stepRegistry.register(new ConditionalBranchStepExecutor());
    stepRegistry.register(new HumanTaskStepExecutor());
  }

  // ── Definition CRUD ──────────────────────────────────────────────────

  async createDefinition(
    ctx: TenantContext,
    data: {
      name: string;
      description?: string;
      category?: string;
      steps: StepDefinition[];
      inputSchema?: Record<string, unknown>;
      outputSchema?: Record<string, unknown>;
      isSystem?: boolean;
    },
  ) {
    const existing = await prisma.workflowDefinition.findFirst({
      where: { companyId: ctx.companyId, name: data.name },
    });
    if (existing) throw new Error(`Workflow definition "${data.name}" already exists`);

    const def = await prisma.workflowDefinition.create({
      data: {
        companyId: ctx.companyId,
        name: data.name,
        description: data.description,
        category: data.category ?? "general",
        steps: data.steps as any,
        inputSchema: (data.inputSchema ?? null) as any,
        outputSchema: (data.outputSchema ?? null) as any,
        isSystem: data.isSystem ?? false,
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId, actorUserId: ctx.userId,
      action: "WORKFLOW_DEFINITION_CREATED",
      resourceType: "WorkflowDefinition", resourceId: def.id,
      metadata: { name: def.name, category: def.category, stepCount: data.steps.length },
    });

    return def;
  }

  async getDefinition(ctx: TenantContext, definitionId: string) {
    return prisma.workflowDefinition.findFirst({
      where: { id: definitionId, companyId: ctx.companyId },
    });
  }

  async listDefinitions(ctx: TenantContext, includeInactive = false): Promise<WorkflowDefinitionSummary[]> {
    const where: any = { companyId: ctx.companyId };
    if (!includeInactive) where.status = "ACTIVE";

    const defs = await prisma.workflowDefinition.findMany({
      where,
      orderBy: { name: "asc" },
    });

    return defs.map((d) => ({
      id: d.id,
      name: d.name,
      description: d.description,
      category: d.category,
      status: d.status,
      version: d.version,
      stepCount: (d.steps as any[]).length,
      isSystem: d.isSystem,
    }));
  }

  async updateDefinition(ctx: TenantContext, definitionId: string, data: Partial<{
    name: string; description: string; category: string; steps: StepDefinition[];
    status: string; inputSchema: Record<string, unknown>; outputSchema: Record<string, unknown>;
  }>) {
    const def = await prisma.workflowDefinition.findFirst({
      where: { id: definitionId, companyId: ctx.companyId },
    });
    if (!def) throw new Error("Workflow definition not found");

    await WorkflowVersionSnapshotService.captureSnapshot(ctx, definitionId);

    const result = await prisma.workflowDefinition.updateMany({
      where: { id: definitionId, version: def.version },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.category !== undefined ? { category: data.category } : {}),
        ...(data.steps !== undefined ? { steps: data.steps as any } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.inputSchema !== undefined ? { inputSchema: data.inputSchema as any } : {}),
        ...(data.outputSchema !== undefined ? { outputSchema: data.outputSchema as any } : {}),
        version: { increment: 1 },
      },
    });
    if (result.count === 0) {
      throw new ConflictError("Concurrent modification detected — workflow definition was updated by another request.");
    }

    const updated = (await prisma.workflowDefinition.findUnique({ where: { id: definitionId } }))!;

    await recordAudit(prisma, {
      companyId: ctx.companyId, actorUserId: ctx.userId,
      action: "WORKFLOW_DEFINITION_UPDATED",
      resourceType: "WorkflowDefinition", resourceId: definitionId,
      metadata: { changes: Object.keys(data) },
    });

    return updated;
  }

  // ── Instance Lifecycle ───────────────────────────────────────────────

  async createInstance(
    ctx: TenantContext,
    definitionId: string,
    input?: Record<string, unknown>,
    options?: { scheduledFor?: string; cronExpression?: string; assignedToId?: string },
  ) {
    this.ensureSteps();

    const def = await prisma.workflowDefinition.findFirst({
      where: { id: definitionId, companyId: ctx.companyId },
    });
    if (!def) throw new Error("Workflow definition not found");
    if (def.status !== "ACTIVE") throw new Error("Workflow definition is not active");

    const steps = def.steps as any as StepDefinition[];

    const enrichedSteps = await Promise.all(
      steps.map(async (step) => {
        if (step.type === "approval" && this.approvalConfigEnricher) {
          const enrichedConfig = await this.approvalConfigEnricher(ctx, step, input);
          if (enrichedConfig) {
            return {
              ...step,
              config: { ...step.config, ...enrichedConfig },
            };
          }
        }
        return step;
      }),
    );

    const instance = await prisma.workflowInstance.create({
      data: {
        companyId: ctx.companyId,
        definitionId: def.id,
        status: "PENDING",
        input: (input ?? null) as any,
        variables: (input ?? {}) as any,
        metadata: (options ?? {}) as any,
        initiatedById: ctx.userId,
        assignedToId: options?.assignedToId,
        scheduledFor: options?.scheduledFor ? new Date(options.scheduledFor) : null,
        cronExpression: options?.cronExpression,
      },
    });

    const stepInstances = enrichedSteps.map((step) => ({
      instanceId: instance.id,
      companyId: ctx.companyId,
      stepId: step.id,
      stepType: step.type,
      label: step.label,
      status: "PENDING" as StepStatus,
      config: (step.config ?? null) as any,
      dependsOn: step.dependsOn ?? [],
    }));

    if (stepInstances.length > 0) {
      await prisma.workflowStepInstance.createMany({ data: stepInstances as any });
    }

    await this.recordEvent(instance.id, null, "CREATED", "Workflow created", ctx.userId, { definitionName: def.name });
    await recordAudit(prisma, {
      companyId: ctx.companyId, actorUserId: ctx.userId,
      action: "WORKFLOW_INSTANCE_CREATED",
      resourceType: "WorkflowInstance", resourceId: instance.id,
      metadata: { definitionName: def.name, stepCount: steps.length },
    });

    return instance;
  }

  async startInstance(ctx: TenantContext, instanceId: string) {
    const instance = await prisma.workflowInstance.findFirst({
      where: { id: instanceId, companyId: ctx.companyId },
      include: { definition: true, steps: true },
    });
    if (!instance) throw new Error("Workflow instance not found");

    const transition = WorkflowStateMachine.transition(instance.status as WorkflowStatus, "VALIDATED");
    if (!transition.valid) throw new Error(transition.message);

    await prisma.workflowInstance.update({
      where: { id: instanceId },
      data: { status: "VALIDATED" },
    });
    await this.recordEvent(instanceId, null, "STARTED", "Workflow validated", ctx.userId);

    const runTransition = WorkflowStateMachine.transition("VALIDATED", "RUNNING");
    if (!runTransition.valid) throw new Error(runTransition.message);

    await prisma.workflowInstance.update({
      where: { id: instanceId },
      data: { status: "RUNNING", startedAt: new Date() },
    });
    await this.recordEvent(instanceId, null, "STARTED", "Workflow execution started", ctx.userId);

    const steps = instance.definition.steps as any as StepDefinition[];
    const readySteps = this.getReadySteps(steps, []);

    for (const stepDef of readySteps) {
      await this.executeStep(ctx, instanceId, stepDef, instance.steps, instance.variables as Record<string, unknown>, instance.metadata as Record<string, unknown>);
    }

    return { instanceId, status: "RUNNING" };
  }

  async scheduleInstance(
    ctx: TenantContext,
    definitionId: string,
    input?: Record<string, unknown>,
    scheduledFor?: string,
  ) {
    const instance = await this.createInstance(ctx, definitionId, input, { scheduledFor });
    return { instanceId: instance.id, scheduledFor };
  }

  // ── Step Execution ───────────────────────────────────────────────────

  private async executeStep(
    ctx: TenantContext,
    instanceId: string,
    stepDef: StepDefinition,
    stepInstances: any[],
    variables: Record<string, unknown>,
    metadata: Record<string, unknown>,
  ) {
    const executor = stepRegistry.get(stepDef.type);
    if (!executor) {
      await this.failStep(instanceId, stepDef.id, `No executor registered for step type: ${stepDef.type}`);
      return;
    }

    const dbStep = stepInstances.find((s) => s.stepId === stepDef.id);
    if (!dbStep) return;

    await prisma.workflowStepInstance.update({
      where: { id: dbStep.id },
      data: { status: "RUNNING", startedAt: new Date() },
    });
    await this.recordEvent(instanceId, stepDef.id, "STEP_STARTED", `Step started: ${stepDef.label}`, ctx.userId);

    const execCtx: WorkflowExecutionContext = {
      tenant: ctx,
      instanceId,
      definitionId: "",
      companyId: ctx.companyId,
      userId: ctx.userId,
      variables,
      currentStep: stepDef,
      metadata,
    };

    try {
      const result = await executor.execute(execCtx, stepDef);

      if (result.waitFor === "approval") {
        await prisma.workflowStepInstance.update({
          where: { id: dbStep.id },
          data: { status: "WAITING_APPROVAL", output: (result.output ?? {}) as any },
        });
        await prisma.workflowInstance.update({
          where: { id: instanceId },
          data: { status: "WAITING", currentStepId: stepDef.id, currentStepType: stepDef.type },
        });
        await this.recordEvent(instanceId, stepDef.id, "APPROVAL_REQUESTED", `Approval requested: ${stepDef.label}`, ctx.userId);
        return;
      }

      if (result.waitFor === "input") {
        await prisma.workflowStepInstance.update({
          where: { id: dbStep.id },
          data: { status: "WAITING_INPUT", output: (result.output ?? {}) as any },
        });
        await prisma.workflowInstance.update({
          where: { id: instanceId },
          data: { status: "WAITING", currentStepId: stepDef.id, currentStepType: stepDef.type },
        });
        await this.recordEvent(instanceId, stepDef.id, "STEP_STARTED", `Waiting for input: ${stepDef.label}`, ctx.userId);
        return;
      }

      if (result.skipRemaining) {
        await prisma.workflowStepInstance.update({
          where: { id: dbStep.id },
          data: { status: "COMPLETED", output: (result.output ?? {}) as any, completedAt: new Date() },
        });
        await this.completeInstance(ctx, instanceId);
        return;
      }

      if (!result.success) {
        await this.failStep(instanceId, stepDef.id, result.error ?? "Unknown error");
        return;
      }

      const newVariables = { ...variables, ...(result.output ?? {}) };
      await prisma.workflowStepInstance.update({
        where: { id: dbStep.id },
        data: { status: "COMPLETED", output: (result.output ?? {}) as any, completedAt: new Date() },
      });
      await prisma.workflowInstance.update({
        where: { id: instanceId },
        data: { variables: newVariables as any },
      });
      await this.recordEvent(instanceId, stepDef.id, "STEP_COMPLETED", `Step completed: ${stepDef.label}`, ctx.userId);

      const allSteps = await prisma.workflowStepInstance.findMany({
        where: { instanceId },
        orderBy: { createdAt: "asc" },
      });

      if (result.transitionTo) {
        const nextStepDef = (await prisma.workflowDefinition.findFirst({
          where: { instances: { some: { id: instanceId } } },
        }))?.steps as any as StepDefinition[] | undefined;
        if (nextStepDef) {
          const targetDef = nextStepDef.find((s) => s.id === result.transitionTo);
          if (targetDef) {
            await this.executeStep(ctx, instanceId, targetDef, allSteps, newVariables, metadata);
          }
        }
        return;
      }

      const completedSteps = allSteps.filter((s) => s.status === "COMPLETED" || s.status === "SKIPPED");
      if (completedSteps.length === allSteps.length) {
        await this.completeInstance(ctx, instanceId);
        return;
      }

      const nextReady = this.getReadySteps(
        (await prisma.workflowDefinition.findUnique({ where: { id: stepInstances[0]?.instance?.definitionId ?? "" } }))?.steps as any as StepDefinition[] ?? [],
        allSteps.filter((s) => s.status === "COMPLETED" || s.status === "SKIPPED").map((s) => s.stepId),
      );

      for (const ns of nextReady) {
        await this.executeStep(ctx, instanceId, ns, allSteps, newVariables, metadata);
      }
    } catch (err: any) {
      await this.failStep(instanceId, stepDef.id, err?.message ?? "Step execution error");
    }
  }

  // ── Resume / Complete / Cancel ───────────────────────────────────────

  async resumeInstance(ctx: TenantContext, instanceId: string, input?: Record<string, unknown>) {
    const instance = await prisma.workflowInstance.findFirst({
      where: { id: instanceId, companyId: ctx.companyId },
      include: { steps: true },
    });
    if (!instance) throw new Error("Workflow instance not found");

    const transition = WorkflowStateMachine.transition(instance.status as WorkflowStatus, "RUNNING");
    if (!transition.valid) throw new Error(transition.message);

    const newVariables = { ...(instance.variables as Record<string, unknown> ?? {}), ...(input ?? {}) };
    await prisma.workflowInstance.update({
      where: { id: instanceId },
      data: { status: "RUNNING", variables: newVariables as any, currentStepId: null, currentStepType: null },
    });
    await this.recordEvent(instanceId, null, "RESUMED", "Workflow resumed", ctx.userId);

    const pendingStep = instance.steps.find((s) => s.status === "WAITING_APPROVAL" || s.status === "WAITING_INPUT");
    if (pendingStep) {
      const def = await prisma.workflowDefinition.findUnique({ where: { id: instance.definitionId } });
      if (!def) return { instanceId, status: "RUNNING" };
      const steps = def.steps as any as StepDefinition[];
      const stepDef = steps.find((s) => s.id === pendingStep.stepId);
      if (stepDef) {
        await this.executeStep(ctx, instanceId, stepDef, instance.steps, newVariables, instance.metadata as Record<string, unknown>);
      }
    }

    return { instanceId, status: "RUNNING" };
  }

  async cancelInstance(ctx: TenantContext, instanceId: string, reason?: string) {
    const instance = await prisma.workflowInstance.findFirst({
      where: { id: instanceId, companyId: ctx.companyId },
    });
    if (!instance) throw new Error("Workflow instance not found");

    const transition = WorkflowStateMachine.transition(instance.status as WorkflowStatus, "CANCELLED");
    if (!transition.valid) throw new Error(transition.message);

    await prisma.workflowInstance.update({
      where: { id: instanceId },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });
    await this.recordEvent(instanceId, null, "CANCELLED", reason ?? "Workflow cancelled", ctx.userId);
    await recordAudit(prisma, {
      companyId: ctx.companyId, actorUserId: ctx.userId,
      action: "WORKFLOW_INSTANCE_CANCELLED",
      resourceType: "WorkflowInstance", resourceId: instanceId,
      metadata: { reason },
    });

    return { instanceId, status: "CANCELLED" };
  }

  async pauseInstance(ctx: TenantContext, instanceId: string) {
    const instance = await prisma.workflowInstance.findFirst({
      where: { id: instanceId, companyId: ctx.companyId },
    });
    if (!instance) throw new Error("Workflow instance not found");

    const transition = WorkflowStateMachine.transition(instance.status as WorkflowStatus, "PAUSED");
    if (!transition.valid) throw new Error(transition.message);

    await prisma.workflowInstance.update({
      where: { id: instanceId },
      data: { status: "PAUSED" },
    });
    await this.recordEvent(instanceId, null, "PAUSED", "Workflow paused", ctx.userId);

    return { instanceId, status: "PAUSED" };
  }

  // ── Query ────────────────────────────────────────────────────────────

  async getInstance(ctx: TenantContext, instanceId: string) {
    return prisma.workflowInstance.findFirst({
      where: { id: instanceId, companyId: ctx.companyId },
      include: {
        definition: { select: { name: true, category: true } },
        steps: { orderBy: { createdAt: "asc" } },
        events: { orderBy: { timestamp: "asc" } },
      },
    });
  }

  async listInstances(
    ctx: TenantContext,
    opts?: { status?: WorkflowStatus; definitionId?: string; limit?: number },
  ): Promise<WorkflowInstanceSummary[]> {
    const where: any = { companyId: ctx.companyId };
    if (opts?.status) where.status = opts.status;
    if (opts?.definitionId) where.definitionId = opts.definitionId;

    const instances = await prisma.workflowInstance.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: opts?.limit ?? 50,
      include: { definition: { select: { name: true } } },
    });

    return instances.map((i) => ({
      id: i.id,
      definitionId: i.definitionId,
      definitionName: i.definition.name,
      status: i.status as WorkflowStatus,
      currentStep: i.currentStepType ?? undefined,
      initiatedBy: i.initiatedById ?? undefined,
      startedAt: i.startedAt?.toISOString(),
      completedAt: i.completedAt?.toISOString(),
      lastError: i.lastError ?? undefined,
      createdAt: i.createdAt.toISOString(),
    }));
  }

  async getMetrics(ctx: TenantContext): Promise<WorkflowMetricsSummary> {
    const [totalDefs, activeDefs, instances] = await Promise.all([
      prisma.workflowDefinition.count({ where: { companyId: ctx.companyId } }),
      prisma.workflowDefinition.count({ where: { companyId: ctx.companyId, status: "ACTIVE" } }),
      prisma.workflowInstance.findMany({
        where: { companyId: ctx.companyId },
        select: { status: true, startedAt: true, completedAt: true, createdAt: true },
      }),
    ]);

    const running = instances.filter((i) => i.status === "RUNNING").length;
    const waiting = instances.filter((i) => i.status === "WAITING").length;
    const failed = instances.filter((i) => i.status === "FAILED").length;
    const completed = instances.filter((i) => i.status === "COMPLETED").length;
    const cancelled = instances.filter((i) => i.status === "CANCELLED").length;

    const completedWithDuration = instances.filter((i) => i.status === "COMPLETED" && i.startedAt && i.completedAt);
    const totalDurationMs = completedWithDuration.reduce((sum, i) => sum + (i.completedAt!.getTime() - i.startedAt!.getTime()), 0);
    const averageDurationMs = completedWithDuration.length > 0 ? Math.round(totalDurationMs / completedWithDuration.length) : 0;

    const successRate = (running + completed + waiting) > 0
      ? Math.round((completed / (running + completed + waiting + failed + cancelled)) * 100)
      : 100;

    return {
      totalDefinitions: totalDefs,
      activeDefinitions: activeDefs,
      totalInstances: instances.length,
      runningInstances: running,
      waitingInstances: waiting,
      failedInstances: failed,
      completedInstances: completed,
      cancelledInstances: cancelled,
      averageDurationMs,
      successRate,
    };
  }

  async getInstanceEvents(ctx: TenantContext, instanceId: string, limit = 100) {
    return prisma.workflowEvent.findMany({
      where: { instanceId, companyId: ctx.companyId },
      orderBy: { timestamp: "desc" },
      take: limit,
    });
  }

  // ── Private Helpers ──────────────────────────────────────────────────

  private async completeInstance(ctx: TenantContext, instanceId: string) {
    await prisma.workflowInstance.update({
      where: { id: instanceId },
      data: { status: "COMPLETED", completedAt: new Date() },
    });
    await this.recordEvent(instanceId, null, "COMPLETED", "Workflow completed", ctx.userId);
    await recordAudit(prisma, {
      companyId: ctx.companyId, actorUserId: ctx.userId,
      action: "WORKFLOW_INSTANCE_COMPLETED",
      resourceType: "WorkflowInstance", resourceId: instanceId,
    });
  }

  private async failStep(instanceId: string, stepId: string, error: string) {
    await prisma.workflowStepInstance.updateMany({
      where: { instanceId, stepId },
      data: { status: "FAILED", error },
    });
    await prisma.workflowInstance.update({
      where: { id: instanceId },
      data: { status: "FAILED", failedAt: new Date(), lastError: error, errorCount: { increment: 1 } },
    });
    await this.recordEvent(instanceId, stepId, "STEP_FAILED", error);
  }

  private async recordEvent(
    instanceId: string,
    stepId: string | null,
    eventType: WorkflowEventType,
    label: string,
    actorId?: string,
    metadata?: Record<string, unknown>,
  ) {
    const instance = await prisma.workflowInstance.findUnique({
      where: { id: instanceId },
      select: { companyId: true },
    });
    if (!instance) return;

    await prisma.workflowEvent.create({
      data: {
        instanceId,
        companyId: instance.companyId,
        stepId,
        eventType,
        label,
        actorId: actorId ?? null,
        metadata: (metadata ?? null) as any,
        timestamp: new Date(),
      },
    });

    // Emit real-time event for connected clients
    const eventMap: Record<string, string> = {
      CREATED: RealtimeEvents.WORKFLOW_CREATED,
      STARTED: RealtimeEvents.WORKFLOW_STARTED,
      COMPLETED: RealtimeEvents.WORKFLOW_COMPLETED,
      FAILED: RealtimeEvents.WORKFLOW_FAILED,
      CANCELLED: RealtimeEvents.WORKFLOW_CANCELLED,
      PAUSED: RealtimeEvents.WORKFLOW_PAUSED,
      RESUMED: RealtimeEvents.WORKFLOW_RESUMED,
      STEP_STARTED: RealtimeEvents.WORKFLOW_STEP_STARTED,
      STEP_COMPLETED: RealtimeEvents.WORKFLOW_STEP_COMPLETED,
      STEP_FAILED: RealtimeEvents.WORKFLOW_STEP_FAILED,
      APPROVAL_REQUESTED: RealtimeEvents.APPROVAL_REQUESTED,
      APPROVAL_GRANTED: RealtimeEvents.APPROVAL_GRANTED,
      APPROVAL_REJECTED: RealtimeEvents.APPROVAL_REJECTED,
    };

    const realtimeEvent = eventMap[eventType];
    if (realtimeEvent) {
      const channel =
        eventType.startsWith("APPROVAL")
          ? RealtimeChannels.APPROVAL
          : RealtimeChannels.WORKFLOW;

      emitRealtimeEvent(instance.companyId, channel, realtimeEvent, {
        instanceId,
        stepId,
        eventType,
        label,
        metadata: metadata ?? null,
        timestamp: new Date().toISOString(),
      });
    }
  }

  private getReadySteps(steps: StepDefinition[], completedStepIds: string[]): StepDefinition[] {
    return steps.filter((step) => {
      if (completedStepIds.includes(step.id)) return false;
      if (!step.dependsOn || step.dependsOn.length === 0) return true;
      return step.dependsOn.every((depId) => completedStepIds.includes(depId));
    });
  }

  // ── Approval Response ────────────────────────────────────────────────

  async respondToApproval(
    ctx: TenantContext,
    instanceId: string,
    stepId: string,
    approved: boolean,
    response?: string,
  ) {
    const instance = await prisma.workflowInstance.findFirst({
      where: { id: instanceId, companyId: ctx.companyId },
      include: { steps: true },
    });
    if (!instance) throw new Error("Workflow instance not found");

    const step = instance.steps.find((s) => s.stepId === stepId);
    if (!step) throw new Error("Step not found");

    // ── P0-2: Authorization check ────────────────────────────────────────
    // Only steps in WAITING_APPROVAL can be responded to.
    if (step.status !== "WAITING_APPROVAL") {
      throw new ForbiddenError(
        `Step "${stepId}" is not currently awaiting approval.`,
      );
    }

    // If the step specifies required approver roles, the caller must hold
    // one of those roles.  An empty requiredApprovers list means no role
    // restriction (backward-compatible with pre-fix workflows).
    const stepConfig = (step.config as Record<string, unknown>) ?? {};
    const requiredRoles: string[] =
      (stepConfig.requiredApprovers as string[]) ?? [];

    if (
      requiredRoles.length > 0 &&
      !requiredRoles.includes(ctx.role)
    ) {
      throw new ForbiddenError(
        "You are not authorized to approve this step.",
      );
    }

    if (approved) {
      await prisma.workflowStepInstance.update({
        where: { id: step.id },
        data: { status: "COMPLETED", completedAt: new Date(), output: { approved: true, approvedBy: ctx.userId, response } as any },
      });
      await this.recordEvent(instanceId, stepId, "APPROVAL_GRANTED", `Approval granted by ${ctx.userId}`, ctx.userId);

      if (this.approvalHistoryRecorder) {
        await this.approvalHistoryRecorder(
          instanceId,
          stepId,
          ctx.userId,
          ctx.role ?? "unknown",
          "approved",
          response ?? null,
          null,
        );
      }

      const completedSteps = instance.steps.filter((s) => s.status === "COMPLETED" || s.status === "SKIPPED");
      const allSteps = await prisma.workflowStepInstance.findMany({
        where: { instanceId },
      });
      if (completedSteps.length === allSteps.length) {
        await this.completeInstance(ctx, instanceId);
      } else {
        await prisma.workflowInstance.update({
          where: { id: instanceId },
          data: { status: "RUNNING", currentStepId: null, currentStepType: null },
        });
        await this.recordEvent(instanceId, null, "RESUMED", "Workflow resumed after approval", ctx.userId);

        const def = await prisma.workflowDefinition.findUnique({ where: { id: instance.definitionId } });
        if (def) {
          const steps = def.steps as any as StepDefinition[];
          const newVariables = instance.variables as Record<string, unknown> ?? {};
          const nextReady = this.getReadySteps(steps, allSteps.filter((s) => s.status === "COMPLETED" || s.status === "SKIPPED").map((s) => s.stepId));
          for (const ns of nextReady) {
            await this.executeStep(ctx, instanceId, ns, allSteps, newVariables, instance.metadata as Record<string, unknown>);
          }
        }
      }
    } else {
      await prisma.workflowStepInstance.update({
        where: { id: step.id },
        data: { status: "FAILED", error: response ?? "Rejected", completedAt: new Date() },
      });
      await prisma.workflowInstance.update({
        where: { id: instanceId },
        data: { status: "FAILED", failedAt: new Date(), lastError: response ?? "Rejected" },
      });
      await this.recordEvent(instanceId, stepId, "APPROVAL_REJECTED", `Approval rejected by ${ctx.userId}: ${response ?? "No reason"}`, ctx.userId);

      if (this.approvalHistoryRecorder) {
        await this.approvalHistoryRecorder(
          instanceId,
          stepId,
          ctx.userId,
          ctx.role ?? "unknown",
          "rejected",
          response ?? null,
          null,
        );
      }
    }

    return { instanceId, stepId, approved };
  }

  async respondToTask(
    ctx: TenantContext,
    instanceId: string,
    stepId: string,
    input: Record<string, unknown>,
  ) {
    const instance = await prisma.workflowInstance.findFirst({
      where: { id: instanceId, companyId: ctx.companyId },
      include: { steps: true },
    });
    if (!instance) throw new Error("Workflow instance not found");

    const step = instance.steps.find((s) => s.stepId === stepId);
    if (!step) throw new Error("Step not found");

    await prisma.workflowStepInstance.update({
      where: { id: step.id },
      data: { status: "COMPLETED", completedAt: new Date(), output: { ...input, completedBy: ctx.userId } as any },
    });
    await this.recordEvent(instanceId, stepId, "STEP_COMPLETED", `Task completed: ${step.label}`, ctx.userId);

    const newVariables = { ...(instance.variables as Record<string, unknown> ?? {}), ...input };
    await prisma.workflowInstance.update({
      where: { id: instanceId },
      data: { status: "RUNNING", variables: newVariables as any, currentStepId: null, currentStepType: null },
    });
    await this.recordEvent(instanceId, null, "RESUMED", "Workflow resumed after task input", ctx.userId);

    const def = await prisma.workflowDefinition.findUnique({ where: { id: instance.definitionId } });
    if (def) {
      const steps = def.steps as any as StepDefinition[];
      const allSteps = await prisma.workflowStepInstance.findMany({ where: { instanceId } });
      const nextReady = this.getReadySteps(steps, allSteps.filter((s) => s.status === "COMPLETED" || s.status === "SKIPPED").map((s) => s.stepId));
      for (const ns of nextReady) {
        await this.executeStep(ctx, instanceId, ns, allSteps, newVariables, instance.metadata as Record<string, unknown>);
      }
    }

    return { instanceId, stepId, status: "completed" };
  }
}
