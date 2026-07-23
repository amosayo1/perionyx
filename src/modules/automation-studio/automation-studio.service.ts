import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { recordAudit, type DbClient } from "@/modules/audit";
import { WorkflowEngine } from "@/modules/workflow/engine";
import type { WorkflowStatus } from "@/modules/workflow/types";
import { logger } from "@/lib/logger";
import { GovernanceService } from "@/modules/governance/governance.service";
import { IntelligenceService } from "@/modules/enterprise-intelligence/intelligence.service";
import { DecisionService } from "@/modules/decision-intelligence/decision.service";
import { connectorOrchestrator } from "@/modules/connector-platform/orchestrator/orchestrator";
import { OperationsService } from "@/modules/operations/operations.service";
import { getCached, CacheTier, tenantKey, CacheDomains } from "@/server/cache";
import { invalidateWorkflow, invalidateAutomation, invalidateApproval, invalidateDashboard, invalidateAnalytics } from "@/server/cache/invalidation";
import { TemplateLibrary } from "./template-library";
import { AutomationRegistry } from "./automation-registry";
import { BusinessRulesBuilder, businessRulesBuilder } from "./business-rules-builder";
import { ApprovalMatrixEvaluator, approvalMatrixEvaluator } from "./approval-matrix-evaluator";
import { AutomationScheduler, automationScheduler } from "./automation-scheduler";
import { WorkflowAnalyticsService } from "./workflow-analytics.service";
import { automationStudioPersistence } from "./persistence/persistence.service";
import type { ScheduledExecutionPayload } from "./automation-scheduler";
import type {
  AutomationTemplate,
  AutomationCategory,
  WorkflowBlueprint,
  CreateBlueprintInput,
  UpdateBlueprintInput,
  ApprovalMatrixRule,
  CreateApprovalMatrixRuleInput,
  BusinessRule,
  CreateBusinessRuleInput,
  AutomationSchedule,
  CreateScheduleInput,
  UpdateScheduleInput,
  AutomationAnalytics,
  AutomationExecutionResult,
  ExecuteTemplateInput,
  ExecuteBlueprintInput,
  ListExecutionsOptions,
  RegistryState,
  ExecutionTrend,
  CategoryBreakdown,
  TopPerformingTemplate,
  BusinessRuleDefinition,
  CreateBusinessRuleDefinitionInput,
  ApprovalConfig,
  ApprovalHistoryEntry,
  ConditionGroup,
  RuleAction,
  WorkflowAnalytics,
} from "./types";

export class AutomationStudioService {
  private workflowEngine: WorkflowEngine;
  private templateLibrary: TemplateLibrary;
  private registry: AutomationRegistry;
  private intelligenceService: IntelligenceService;
  private decisionService: DecisionService;
  private rulesBuilder: BusinessRulesBuilder;
  private approvalEvaluator: ApprovalMatrixEvaluator;
  private scheduler: AutomationScheduler;
  private workflowAnalytics: WorkflowAnalyticsService;
  private persistence: typeof automationStudioPersistence;

  constructor() {
    this.workflowEngine = WorkflowEngine.getInstance();
    this.templateLibrary = new TemplateLibrary();
    this.registry = new AutomationRegistry();
    this.intelligenceService = new IntelligenceService();
    this.decisionService = new DecisionService();
    this.rulesBuilder = new BusinessRulesBuilder();
    this.approvalEvaluator = new ApprovalMatrixEvaluator();
    this.scheduler = new AutomationScheduler();
    this.workflowAnalytics = new WorkflowAnalyticsService();
    this.persistence = automationStudioPersistence;

    this.workflowEngine.setApprovalConfigEnricher(async (ctx, stepDef, instanceInput) => {
      const context: Record<string, unknown> = {
        ...(stepDef.config ?? {}),
        ...(instanceInput ?? {}),
      };
      const config = this.approvalEvaluator.resolveApprovalConfig(context, ctx.companyId, {
        amount: context.amount as number | undefined,
        department: context.department as string | undefined,
      });
      if (!config) return null;
      return this.approvalEvaluator.toStepConfig(config);
    });

    this.workflowEngine.setApprovalHistoryRecorder(async (
      instanceId, stepId, approverId, approverRole, action, comment, delegatedTo,
    ) => {
      this.approvalEvaluator.recordHistory({
        id: crypto.randomUUID(),
        ruleId: "",
        instanceId,
        stepId,
        approverId,
        approverRole,
        action,
        comment: comment ?? null,
        delegatedTo: delegatedTo ?? null,
        actedAt: new Date().toISOString(),
      });
    });

    this.setSchedulerDefaultHandler(async (payload) => {
      let definitionId: string | null = null;

      if (payload.templateId) {
        const template = this.templateLibrary.getById(payload.templateId);
        if (!template) {
          logger.error({ payload }, "[AutomationStudioService] Template not found for schedule trigger");
          return;
        }

        const definitionInput = this.templateLibrary.toWorkflowDefinitionInput(payload.templateId, payload.companyId);
        if (!definitionInput) {
          logger.error({ payload }, "[AutomationStudioService] Failed to convert template to definition");
          return;
        }

        const systemCtx: TenantContext = {
          userId: "system",
          companyId: payload.companyId,
          role: "ADMIN",
        };

        const definition = await this.workflowEngine.createDefinition(systemCtx, {
          name: `${definitionInput.name as string} (Scheduled)`,
          description: definitionInput.description as string | undefined,
          category: definitionInput.category as string | undefined,
          steps: definitionInput.steps as any,
          inputSchema: definitionInput.inputSchema as Record<string, unknown> | undefined,
          outputSchema: definitionInput.outputSchema as Record<string, unknown> | undefined,
          isSystem: true,
        });
        definitionId = definition.id;
      } else if (payload.blueprintId) {
        definitionId = payload.blueprintId;
      } else {
        logger.warn({ payload }, "[AutomationStudioService] Schedule has neither templateId nor blueprintId");
        return;
      }

      const systemCtx: TenantContext = {
        userId: "system",
        companyId: payload.companyId,
        role: "ADMIN",
      };

      const instance = await this.workflowEngine.createInstance(
        systemCtx,
        definitionId,
        payload.input ?? undefined,
      );

      await this.workflowEngine.startInstance(systemCtx, instance.id);
    });
  }

  // ── Templates ─────────────────────────────────────────────────────────

  listTemplates(category?: AutomationCategory): AutomationTemplate[] {
    if (category) {
      return this.templateLibrary.getByCategory(category);
    }
    return this.templateLibrary.getAll();
  }

  getTemplate(id: string): AutomationTemplate | undefined {
    return this.templateLibrary.getById(id);
  }

  searchTemplates(query: string): AutomationTemplate[] {
    return this.templateLibrary.search(query);
  }

  getTemplateCategories(): { category: string; count: number }[] {
    return this.templateLibrary.getCategories();
  }

  async ensureBuiltinTemplates(ctx: TenantContext): Promise<void> {
    await this.persistence.seedBuiltinTemplates(ctx.companyId);
  }

  async listPersistedTemplates(ctx: TenantContext, category?: string) {
    return this.persistence.listTemplates(ctx.companyId, category);
  }

  // ── Blueprints (Designer) ─────────────────────────────────────────────

  async createBlueprint(ctx: TenantContext, data: CreateBlueprintInput): Promise<WorkflowBlueprint> {
    const stepsJson = JSON.parse(JSON.stringify(data.steps)) as Prisma.InputJsonValue;
    const record = await prisma.workflowDefinition.create({
      data: {
        companyId: ctx.companyId,
        name: data.name,
        description: data.description ?? null,
        category: data.category,
        steps: stepsJson,
        inputSchema: (data.inputSchema ?? null) as Prisma.InputJsonValue,
        outputSchema: (data.outputSchema ?? null) as Prisma.InputJsonValue,
        status: "DRAFT",
        version: 1,
        isSystem: false,
      },
    });

    await recordAudit(prisma as unknown as DbClient, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "AUTOMATION_BLUEPRINT_CREATED",
      resourceType: "WorkflowDefinition",
      resourceId: record.id,
      metadata: { name: data.name, category: data.category, stepCount: data.steps.length },
    });

    void invalidateWorkflow(ctx.companyId);
    void invalidateDashboard(ctx.companyId);

    return this.toBlueprint(record);
  }

  async updateBlueprint(ctx: TenantContext, id: string, data: UpdateBlueprintInput): Promise<WorkflowBlueprint | null> {
    const existing = await prisma.workflowDefinition.findFirst({
      where: { id, companyId: ctx.companyId },
    });
    if (!existing) return null;

    const updateData: Record<string, unknown> = {
      version: { increment: 1 },
    };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.steps !== undefined) updateData.steps = JSON.parse(JSON.stringify(data.steps)) as Prisma.InputJsonValue;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.inputSchema !== undefined) updateData.inputSchema = data.inputSchema as Prisma.InputJsonValue;
    if (data.outputSchema !== undefined) updateData.outputSchema = data.outputSchema as Prisma.InputJsonValue;

    const record = await prisma.workflowDefinition.update({
      where: { id },
      data: updateData as Prisma.WorkflowDefinitionUpdateInput,
    });

    await recordAudit(prisma as unknown as DbClient, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "AUTOMATION_BLUEPRINT_UPDATED",
      resourceType: "WorkflowDefinition",
      resourceId: id,
      metadata: { version: record.version },
    });

    void invalidateWorkflow(ctx.companyId);
    void invalidateDashboard(ctx.companyId);

    return this.toBlueprint(record);
  }

  async publishBlueprint(ctx: TenantContext, id: string): Promise<WorkflowBlueprint | null> {
    const existing = await prisma.workflowDefinition.findFirst({
      where: { id, companyId: ctx.companyId, status: "DRAFT" },
    });
    if (!existing) return null;

    const record = await prisma.workflowDefinition.update({
      where: { id },
      data: { status: "ACTIVE", version: { increment: 1 } },
    });

    await recordAudit(prisma as unknown as DbClient, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "AUTOMATION_BLUEPRINT_PUBLISHED",
      resourceType: "WorkflowDefinition",
      resourceId: id,
    });

    void invalidateWorkflow(ctx.companyId);
    void invalidateDashboard(ctx.companyId);

    return this.toBlueprint(record);
  }

  async archiveBlueprint(ctx: TenantContext, id: string): Promise<boolean> {
    const existing = await prisma.workflowDefinition.findFirst({
      where: { id, companyId: ctx.companyId },
    });
    if (!existing) return false;

    await prisma.workflowDefinition.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });

    await recordAudit(prisma as unknown as DbClient, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "AUTOMATION_BLUEPRINT_ARCHIVED",
      resourceType: "WorkflowDefinition",
      resourceId: id,
    });

    void invalidateWorkflow(ctx.companyId);
    void invalidateDashboard(ctx.companyId);

    return true;
  }

  async getBlueprint(ctx: TenantContext, id: string): Promise<WorkflowBlueprint | null> {
    const record = await prisma.workflowDefinition.findFirst({
      where: { id, companyId: ctx.companyId },
    });
    return record ? this.toBlueprint(record) : null;
  }

  async listBlueprints(ctx: TenantContext): Promise<WorkflowBlueprint[]> {
    const records = await prisma.workflowDefinition.findMany({
      where: { companyId: ctx.companyId },
      orderBy: { updatedAt: "desc" },
    });
    return records.map((r) => this.toBlueprint(r));
  }

  // ── Execution (delegates to WorkflowEngine) ───────────────────────────

  async executeTemplate(ctx: TenantContext, input: ExecuteTemplateInput): Promise<AutomationExecutionResult> {
    const template = this.templateLibrary.getById(input.templateId);
    if (!template) {
      throw new Error(`Template not found: ${input.templateId}`);
    }

    const definition = await this.workflowEngine.createDefinition(ctx, {
      name: template.name,
      description: template.description,
      category: template.category,
      steps: template.steps,
      inputSchema: template.inputSchema ?? undefined,
      outputSchema: template.outputSchema ?? undefined,
      isSystem: true,
    });

    const instance = await this.workflowEngine.createInstance(
      ctx,
      definition.id,
      input.input,
      {
        scheduledFor: input.scheduledFor,
        assignedToId: input.assignedToId,
      },
    );

    const started = await this.workflowEngine.startInstance(ctx, instance.id);

    await recordAudit(prisma as unknown as DbClient, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "AUTOMATION_EXECUTED_TEMPLATE",
      resourceType: "WorkflowInstance",
      resourceId: instance.id,
      metadata: { templateId: input.templateId, definitionId: definition.id } as Prisma.InputJsonValue,
    });

    return { instanceId: instance.id, status: started.status as WorkflowStatus, definitionId: definition.id };
  }

  async executeBlueprint(ctx: TenantContext, input: ExecuteBlueprintInput): Promise<AutomationExecutionResult> {
    const blueprint = await this.getBlueprint(ctx, input.blueprintId);
    if (!blueprint) {
      throw new Error(`Blueprint not found: ${input.blueprintId}`);
    }
    if (blueprint.status !== "published") {
      throw new Error(`Blueprint ${input.blueprintId} is not published`);
    }

    const instance = await this.workflowEngine.createInstance(
      ctx,
      input.blueprintId,
      input.input,
      {
        scheduledFor: input.scheduledFor,
        assignedToId: input.assignedToId,
      },
    );

    const started = await this.workflowEngine.startInstance(ctx, instance.id);

    await recordAudit(prisma as unknown as DbClient, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "AUTOMATION_EXECUTED_BLUEPRINT",
      resourceType: "WorkflowInstance",
      resourceId: instance.id,
      metadata: { blueprintId: input.blueprintId } as Prisma.InputJsonValue,
    });

    return { instanceId: instance.id, status: started.status as WorkflowStatus, definitionId: input.blueprintId };
  }

  async listExecutions(ctx: TenantContext, options?: ListExecutionsOptions): Promise<AutomationExecutionResult[]> {
    const summaries = await this.workflowEngine.listInstances(ctx, options as Record<string, unknown>);
    return summaries.map((s) => ({
      instanceId: s.id,
      status: s.status as WorkflowStatus,
      definitionId: s.definitionId,
    }));
  }

  // ── Schedules ─────────────────────────────────────────────────────────

  async createSchedule(ctx: TenantContext, data: CreateScheduleInput): Promise<AutomationSchedule> {
    const now = new Date();

    const record = await this.persistence.createSchedule(ctx, {
      name: data.name,
      triggerType: data.triggerType,
      cronExpression: data.cronExpression ?? null,
      startAt: data.startAt ?? null,
      eventSource: data.eventSource ?? null,
      eventType: data.eventType ?? null,
      templateId: data.templateId ?? null,
      blueprintId: data.blueprintId ?? null,
      input: (data.input ?? null) as Prisma.InputJsonValue,
      enabled: data.enabled ?? true,
    });

    const schedule: AutomationSchedule = {
      id: record.id,
      companyId: ctx.companyId,
      templateId: record.templateId,
      blueprintId: record.blueprintId,
      name: record.name,
      triggerType: record.triggerType as AutomationSchedule["triggerType"],
      cronExpression: record.cronExpression,
      startAt: record.startAt?.toISOString() ?? null,
      eventSource: record.eventSource,
      eventType: record.eventType,
      input: record.input as Record<string, unknown> | null,
      enabled: record.enabled,
      lastRunAt: record.lastRunAt?.toISOString() ?? null,
      nextRunAt: record.nextRunAt?.toISOString() ?? null,
      createdBy: ctx.userId,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };

    automationScheduler.registerSchedule(schedule);

    void invalidateAutomation(ctx.companyId);
    void invalidateDashboard(ctx.companyId);

    return schedule;
  }

  async updateSchedule(ctx: TenantContext, id: string, data: UpdateScheduleInput): Promise<AutomationSchedule | null> {
    const existing = await this.persistence.getSchedule(id);
    if (!existing || existing.companyId !== ctx.companyId) return null;

    const updateData: Record<string, unknown> = {};
    if (data.triggerType !== undefined) updateData.triggerType = data.triggerType;
    if (data.cronExpression !== undefined) updateData.cronExpression = data.cronExpression;
    if (data.startAt !== undefined) updateData.startAt = data.startAt;
    if (data.eventSource !== undefined) updateData.eventSource = data.eventSource;
    if (data.eventType !== undefined) updateData.eventType = data.eventType;
    if (data.input !== undefined) updateData.input = data.input as Prisma.InputJsonValue;
    if (data.enabled !== undefined) updateData.enabled = data.enabled;

    const record = await this.persistence.updateSchedule(ctx, id, updateData);
    if (!record) return null;

    const schedule: AutomationSchedule = {
      id: record.id,
      companyId: record.companyId,
      templateId: record.templateId,
      blueprintId: record.blueprintId,
      name: record.name,
      triggerType: record.triggerType as AutomationSchedule["triggerType"],
      cronExpression: record.cronExpression,
      startAt: record.startAt?.toISOString() ?? null,
      eventSource: record.eventSource,
      eventType: record.eventType,
      input: record.input as Record<string, unknown> | null,
      enabled: record.enabled,
      lastRunAt: record.lastRunAt?.toISOString() ?? null,
      nextRunAt: record.nextRunAt?.toISOString() ?? null,
      createdBy: record.createdByUserId ?? "",
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };

    automationScheduler.registerSchedule(schedule);

    void invalidateAutomation(ctx.companyId);
    void invalidateDashboard(ctx.companyId);

    return schedule;
  }

  async deleteSchedule(ctx: TenantContext, id: string): Promise<boolean> {
    const existing = await this.persistence.getSchedule(id);
    if (!existing || existing.companyId !== ctx.companyId) return false;

    const deleted = await this.persistence.deleteSchedule(ctx, id);
    if (deleted) {
      automationScheduler.deleteSchedule(id);
    }

    if (deleted) {
      void invalidateAutomation(ctx.companyId);
      void invalidateDashboard(ctx.companyId);
    }

    return deleted;
  }

  async listSchedules(ctx: TenantContext, templateId?: string): Promise<AutomationSchedule[]> {
    const records = await this.persistence.listSchedules(ctx.companyId, templateId);
    return Array.from(records).map((r) => ({
      id: r.id,
      companyId: r.companyId,
      templateId: r.templateId,
      blueprintId: r.blueprintId,
      name: r.name,
      triggerType: r.triggerType as AutomationSchedule["triggerType"],
      cronExpression: r.cronExpression,
      startAt: r.startAt?.toISOString() ?? null,
      eventSource: r.eventSource,
      eventType: r.eventType,
      input: r.input as Record<string, unknown> | null,
      enabled: r.enabled,
      lastRunAt: r.lastRunAt?.toISOString() ?? null,
      nextRunAt: r.nextRunAt?.toISOString() ?? null,
      createdBy: r.createdByUserId ?? "",
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  }

  async triggerSchedule(ctx: TenantContext, id: string): Promise<string | null> {
    const record = await this.persistence.getSchedule(id);
    if (!record || record.companyId !== ctx.companyId) return null;

    const schedule: AutomationSchedule = {
      id: record.id,
      companyId: record.companyId,
      templateId: record.templateId,
      blueprintId: record.blueprintId,
      name: record.name,
      triggerType: record.triggerType as AutomationSchedule["triggerType"],
      cronExpression: record.cronExpression,
      startAt: record.startAt?.toISOString() ?? null,
      eventSource: record.eventSource,
      eventType: record.eventType,
      input: record.input as Record<string, unknown> | null,
      enabled: record.enabled,
      lastRunAt: record.lastRunAt?.toISOString() ?? null,
      nextRunAt: record.nextRunAt?.toISOString() ?? null,
      createdBy: record.createdByUserId ?? "",
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };

    const jobId = await automationScheduler.triggerImmediate(schedule);
    if (jobId) {
      await this.persistence.updateScheduleRunTimes(record.id, new Date());
    }

    return jobId;
  }

  async triggerEvent(
    eventType: string,
    context: Record<string, unknown>,
    companyId: string,
  ): Promise<void> {
    await automationScheduler.triggerEvent(eventType, context, companyId);
  }

  // ── Approval Matrix ───────────────────────────────────────────────────

  async getApprovalMatrixRules(ctx: TenantContext): Promise<ApprovalMatrixRule[]> {
    const records = await this.persistence.listApprovalMatrixRules(ctx.companyId);
    return records.map(this.recordToApprovalMatrixRule);
  }

  async getApprovalMatrixRule(ctx: TenantContext, id: string): Promise<ApprovalMatrixRule | null> {
    const record = await this.persistence.getApprovalMatrixRule(id);
    if (!record || record.companyId !== ctx.companyId) return null;
    return this.recordToApprovalMatrixRule(record);
  }

  async createApprovalMatrixRule(ctx: TenantContext, data: CreateApprovalMatrixRuleInput): Promise<ApprovalMatrixRule> {
    const record = await this.persistence.createApprovalMatrixRule(ctx, {
      name: data.name,
      description: data.description,
      priority: data.priority,
      conditions: JSON.parse(JSON.stringify(data.conditions)) as Prisma.InputJsonValue,
      requiredApprovers: data.requiredApprovers,
      approverRoles: data.approverRoles,
      approvalMode: data.approvalMode,
      timeoutMinutes: data.timeoutMinutes,
      escalationEnabled: data.escalationEnabled,
      escalationDelayMinutes: data.escalationDelayMinutes ?? null,
      escalationRoles: data.escalationRoles,
      delegationEnabled: data.delegationEnabled,
      delegationRoles: data.delegationRoles,
      departmentScope: data.departmentScope ?? null,
      thresholdField: data.thresholdField ?? null,
      thresholdOperator: data.thresholdOperator ?? null,
      thresholdValue: data.thresholdValue ?? null,
      isActive: data.isActive,
    });

    const rule = this.recordToApprovalMatrixRule(record);
    approvalMatrixEvaluator.registerRule(rule);

    void invalidateApproval(ctx.companyId);
    void invalidateDashboard(ctx.companyId);

    return rule;
  }

  async updateApprovalMatrixRule(ctx: TenantContext, id: string, data: Partial<CreateApprovalMatrixRuleInput>): Promise<ApprovalMatrixRule | null> {
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.conditions !== undefined) updateData.conditions = JSON.parse(JSON.stringify(data.conditions)) as Prisma.InputJsonValue;
    if (data.requiredApprovers !== undefined) updateData.requiredApprovers = data.requiredApprovers;
    if (data.approverRoles !== undefined) updateData.approverRoles = data.approverRoles;
    if (data.approvalMode !== undefined) updateData.approvalMode = data.approvalMode;
    if (data.timeoutMinutes !== undefined) updateData.timeoutMinutes = data.timeoutMinutes;
    if (data.escalationEnabled !== undefined) updateData.escalationEnabled = data.escalationEnabled;
    if (data.escalationDelayMinutes !== undefined) updateData.escalationDelayMinutes = data.escalationDelayMinutes;
    if (data.escalationRoles !== undefined) updateData.escalationRoles = data.escalationRoles;
    if (data.delegationEnabled !== undefined) updateData.delegationEnabled = data.delegationEnabled;
    if (data.delegationRoles !== undefined) updateData.delegationRoles = data.delegationRoles;
    if (data.departmentScope !== undefined) updateData.departmentScope = data.departmentScope;
    if (data.thresholdField !== undefined) updateData.thresholdField = data.thresholdField;
    if (data.thresholdOperator !== undefined) updateData.thresholdOperator = data.thresholdOperator;
    if (data.thresholdValue !== undefined) updateData.thresholdValue = data.thresholdValue;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const record = await this.persistence.updateApprovalMatrixRule(ctx, id, updateData);
    if (!record) return null;

    const rule = this.recordToApprovalMatrixRule(record);
    approvalMatrixEvaluator.registerRule(rule);

    void invalidateApproval(ctx.companyId);
    void invalidateDashboard(ctx.companyId);

    return rule;
  }

  async deleteApprovalMatrixRule(ctx: TenantContext, id: string): Promise<boolean> {
    const deleted = await this.persistence.deleteApprovalMatrixRule(ctx, id);
    if (deleted) {
      approvalMatrixEvaluator.unregisterRule(id);
    }
    if (deleted) {
      void invalidateApproval(ctx.companyId);
      void invalidateDashboard(ctx.companyId);
    }
    return deleted;
  }

  resolveApprovalConfig(
    ctx: TenantContext,
    context: Record<string, unknown>,
    options?: { amount?: number; department?: string },
  ): ApprovalConfig | null {
    return approvalMatrixEvaluator.resolveApprovalConfig(context, ctx.companyId, options);
  }

  getApprovalHistory(instanceId: string, stepId: string): ApprovalHistoryEntry[] {
    return approvalMatrixEvaluator.getHistory(instanceId, stepId);
  }

  recordApprovalHistory(entry: ApprovalHistoryEntry): void {
    approvalMatrixEvaluator.recordHistory(entry);
  }

  // ── Business Rules (Builder) ──────────────────────────────────────────

  async createBusinessRuleDefinition(
    ctx: TenantContext,
    data: CreateBusinessRuleDefinitionInput,
  ): Promise<BusinessRuleDefinition> {
    const record = await this.persistence.createBusinessRuleDefinition(ctx, {
      name: data.name,
      description: data.description,
      category: data.category,
      priority: data.priority,
      when: data.when as unknown as Prisma.InputJsonValue,
      then: data.then as unknown as Prisma.InputJsonValue,
      isActive: data.isActive,
    });

    const rule: BusinessRuleDefinition = {
      id: record.id,
      companyId: record.companyId,
      name: record.name,
      description: record.description,
      category: record.category,
      priority: record.priority,
      when: record.when as unknown as ConditionGroup,
      then: record.then as unknown as RuleAction[],
      isActive: record.isActive,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };

    businessRulesBuilder.registerRule(ctx.companyId, data);

    await recordAudit(prisma as unknown as DbClient, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "AUTOMATION_BUSINESS_RULE_DEFINITION_CREATED",
      resourceType: "BusinessRuleDefinition",
      resourceId: rule.id,
      metadata: { name: data.name, category: data.category },
    });

    return rule;
  }

  async getBusinessRuleDefinition(id: string): Promise<BusinessRuleDefinition | undefined> {
    const record = await this.persistence.getBusinessRuleDefinition(id);
    if (!record) return undefined;
    return {
      id: record.id,
      companyId: record.companyId,
      name: record.name,
      description: record.description,
      category: record.category,
      priority: record.priority,
      when: record.when as unknown as ConditionGroup,
      then: record.then as unknown as RuleAction[],
      isActive: record.isActive,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }

  async listBusinessRuleDefinitions(ctx: TenantContext, category?: string): Promise<BusinessRuleDefinition[]> {
    const records = await this.persistence.listBusinessRuleDefinitions(ctx.companyId, category);
    return records.map((r) => ({
      id: r.id,
      companyId: r.companyId,
      name: r.name,
      description: r.description,
      category: r.category,
      priority: r.priority,
      when: r.when as unknown as ConditionGroup,
      then: r.then as unknown as RuleAction[],
      isActive: r.isActive,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  }

  async updateBusinessRuleDefinition(
    id: string,
    data: Partial<Omit<BusinessRuleDefinition, "id" | "companyId" | "createdAt">>,
  ): Promise<BusinessRuleDefinition | null> {
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.when !== undefined) updateData.when = JSON.parse(JSON.stringify(data.when)) as Prisma.InputJsonValue;
    if (data.then !== undefined) updateData.then = JSON.parse(JSON.stringify(data.then)) as Prisma.InputJsonValue;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const record = await this.persistence.updateBusinessRuleDefinition({} as TenantContext, id, updateData);
    if (!record) return null;

    return {
      id: record.id,
      companyId: record.companyId,
      name: record.name,
      description: record.description,
      category: record.category,
      priority: record.priority,
      when: record.when as unknown as ConditionGroup,
      then: record.then as unknown as RuleAction[],
      isActive: record.isActive,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }

  async deleteBusinessRuleDefinition(ctx: TenantContext, id: string): Promise<boolean> {
    const deleted = await this.persistence.deleteBusinessRuleDefinition(ctx, id);
    if (deleted) {
      businessRulesBuilder.unregisterRule(id);
    }
    return deleted;
  }

  evaluateBusinessRule(
    id: string,
    variables: Record<string, unknown>,
  ): { matched: boolean; actions: RuleAction[] } {
    const rule = businessRulesBuilder.getRule(id);
    if (!rule) return { matched: false, actions: [] };
    return businessRulesBuilder.evaluate(rule, variables);
  }

  evaluateAllBusinessRules(
    ctx: TenantContext,
    variables: Record<string, unknown>,
  ): Array<{ rule: BusinessRuleDefinition; actions: RuleAction[] }> {
    const rules = businessRulesBuilder.listRules(ctx.companyId);
    return businessRulesBuilder.evaluateAll(rules, variables);
  }

  getRequiredVariables(id: string): string[] {
    const rule = businessRulesBuilder.getRule(id);
    if (!rule) return [];
    return businessRulesBuilder.getRequiredVariables(rule);
  }

  // ── Business Rules (Simple/Config-based) ──────────────────────────────

  async getBusinessRules(ctx: TenantContext, category?: string): Promise<BusinessRule[]> {
    return this.registry.listBusinessRules(ctx.companyId, category);
  }

  async getBusinessRule(ctx: TenantContext, id: string): Promise<BusinessRule | null> {
    const rule = this.registry.getBusinessRule(id);
    return rule?.companyId === ctx.companyId ? rule : null;
  }

  async createBusinessRule(ctx: TenantContext, data: CreateBusinessRuleInput): Promise<BusinessRule> {
    const now = new Date().toISOString();
    const rule: BusinessRule = {
      id: crypto.randomUUID(),
      companyId: ctx.companyId,
      name: data.name,
      description: data.description ?? "",
      category: data.category,
      ruleType: data.ruleType,
      config: data.config,
      priority: data.priority,
      isActive: data.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };

    this.registry.registerBusinessRule(rule);

    await recordAudit(prisma as unknown as DbClient, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "AUTOMATION_BUSINESS_RULE_CREATED",
      resourceType: "BusinessRule",
      resourceId: rule.id,
      metadata: { name: data.name, ruleType: data.ruleType },
    });

    return rule;
  }

  async updateBusinessRule(ctx: TenantContext, id: string, data: Partial<CreateBusinessRuleInput>): Promise<BusinessRule | null> {
    const existing = this.registry.getBusinessRule(id);
    if (!existing || existing.companyId !== ctx.companyId) return null;

    const now = new Date().toISOString();
    const rule: BusinessRule = {
      ...existing,
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.ruleType !== undefined && { ruleType: data.ruleType }),
      ...(data.config !== undefined && { config: data.config }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      updatedAt: now,
    };

    this.registry.registerBusinessRule(rule);

    await recordAudit(prisma as unknown as DbClient, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "AUTOMATION_BUSINESS_RULE_UPDATED",
      resourceType: "BusinessRule",
      resourceId: id,
    });

    return rule;
  }

  async deleteBusinessRule(ctx: TenantContext, id: string): Promise<boolean> {
    const existing = this.registry.getBusinessRule(id);
    if (!existing || existing.companyId !== ctx.companyId) return false;

    this.registry.unregisterBusinessRule(id);

    await recordAudit(prisma as unknown as DbClient, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "AUTOMATION_BUSINESS_RULE_DELETED",
      resourceType: "BusinessRule",
      resourceId: id,
    });

    return true;
  }

  // ── Scheduler Default Handler ─────────────────────────────────────────

  setSchedulerDefaultHandler(handler: (payload: ScheduledExecutionPayload) => Promise<void>): void {
    automationScheduler.setDefaultHandler(handler);
  }

  registerScheduleEventHandler(eventType: string, handler: (payload: ScheduledExecutionPayload) => Promise<void>): void {
    automationScheduler.registerEventHandler(eventType, handler);
  }

  // ── Scheduler Sync ────────────────────────────────────────────────────

  async syncAllSchedules(): Promise<void> {
    await automationScheduler.syncAllSchedules();
  }

  getSchedulerStats(): { total: number; enabled: number; cron: number; event: number } {
    return automationScheduler.getStats();
  }

  // ── Analytics ─────────────────────────────────────────────────────────

  async getAnalytics(ctx: TenantContext): Promise<AutomationAnalytics> {
    const cacheKey = tenantKey(ctx.companyId, CacheDomains.DASHBOARD, "automation", "analytics");
    return getCached(cacheKey, () => this._getAnalytics(ctx), CacheTier.SHORT);
  }

  private async _getAnalytics(ctx: TenantContext): Promise<AutomationAnalytics> {
    const now = new Date();
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(todayStart.getTime() - 30 * 24 * 60 * 60 * 1000);

    const allInstances = await prisma.workflowInstance.findMany({
      where: { companyId: ctx.companyId },
      include: { definition: true },
      orderBy: { createdAt: "desc" },
    });

    const totalInstances = allInstances.length;
    const completedInstances = allInstances.filter((i) => i.status === "COMPLETED");
    const failedInstances = allInstances.filter((i) => i.status === "FAILED");

    const executionsToday = allInstances.filter((i) => new Date(i.createdAt) >= todayStart).length;
    const executionsThisWeek = allInstances.filter((i) => new Date(i.createdAt) >= weekStart).length;
    const executionsThisMonth = allInstances.filter((i) => new Date(i.createdAt) >= monthStart).length;

    const successRate = totalInstances > 0 ? completedInstances.length / totalInstances : 0;
    const failureRate = totalInstances > 0 ? failedInstances.length / totalInstances : 0;

    const totalDurationMs = completedInstances
      .filter((i) => i.startedAt && i.completedAt)
      .reduce((sum, i) => sum + (new Date(i.completedAt!).getTime() - new Date(i.startedAt!).getTime()), 0);

    const averageDurationMs = completedInstances.length > 0
      ? Math.round(totalDurationMs / completedInstances.length)
      : 0;

    const templates = this.templateLibrary.getAll();
    const blueprints = await prisma.workflowDefinition.findMany({
      where: { companyId: ctx.companyId },
    });

    const activeBlueprints = blueprints.filter((b) => b.status === "ACTIVE").length;
    const scheduleRecords = await this.persistence.listSchedules(ctx.companyId);
    const activeSchedules = scheduleRecords.filter((s) => s.enabled).length;

    const definitionsWithStats = new Map<string, { name: string; count: number; completed: number }>();
    for (const inst of allInstances) {
      const defId = inst.definitionId;
      const current = definitionsWithStats.get(defId) ?? { name: inst.definition?.name ?? defId, count: 0, completed: 0 };
      current.count++;
      if (inst.status === "COMPLETED") current.completed++;
      definitionsWithStats.set(defId, current);
    }

    const topPerformingTemplates: TopPerformingTemplate[] = Array.from(definitionsWithStats.entries())
      .map(([defId, stats]) => ({
        templateId: defId,
        name: stats.name,
        executionCount: stats.count,
        successRate: stats.count > 0 ? stats.completed / stats.count : 0,
        averageDurationMs,
      }))
      .sort((a, b) => b.executionCount - a.executionCount)
      .slice(0, 10);

    const dailyGroups = new Map<string, { count: number; failures: number }>();
    for (const inst of allInstances) {
      const dateKey = inst.createdAt.toISOString().slice(0, 10);
      const group = dailyGroups.get(dateKey) ?? { count: 0, failures: 0 };
      group.count++;
      if (inst.status === "FAILED") group.failures++;
      dailyGroups.set(dateKey, group);
    }

    const executionTrend: ExecutionTrend[] = Array.from(dailyGroups.entries())
      .map(([date, stats]) => ({ date, count: stats.count, failures: stats.failures }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const categoryMap = new Map<string, { count: number; completed: number }>();
    for (const inst of allInstances) {
      const cat = inst.definition?.category ?? "general";
      const group = categoryMap.get(cat) ?? { count: 0, completed: 0 };
      group.count++;
      if (inst.status === "COMPLETED") group.completed++;
      categoryMap.set(cat, group);
    }

    const categoryBreakdown: CategoryBreakdown[] = Array.from(categoryMap.entries())
      .map(([category, stats]) => ({
        category,
        count: stats.count,
        successRate: stats.count > 0 ? stats.completed / stats.count : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const workflowMetrics = await this.workflowEngine.getMetrics(ctx);

    return {
      totalTemplates: templates.length,
      activeBlueprints,
      activeSchedules,
      executionsToday,
      executionsThisWeek,
      executionsThisMonth,
      successRate,
      failureRate,
      averageDurationMs,
      topPerformingTemplates,
      executionTrend,
      categoryBreakdown,
      workflowMetrics,
    };
  }

  // ── Governance Integration ────────────────────────────────────────────

  async getGovernanceHealth(ctx: TenantContext) {
    return GovernanceService.getGovernanceHealthScore(ctx);
  }

  async getGovernanceViolations(ctx: TenantContext, limit?: number) {
    return GovernanceService.listViolations(ctx, { limit });
  }

  // ── Intelligence Integration ──────────────────────────────────────────

  async evaluateAllIntelligence(ctx: TenantContext) {
    return this.intelligenceService.evaluateAll(ctx);
  }

  async getTopDecisions(ctx: TenantContext, limit?: number) {
    return this.decisionService.getTopDecisions(ctx, limit);
  }

  async evaluateAllDecisions(ctx: TenantContext) {
    return this.decisionService.evaluateAll(ctx);
  }

  // ── Connector Integration ─────────────────────────────────────────────

  async getConnectorHealth(ctx: TenantContext) {
    return OperationsService.getConnectorHealth(ctx);
  }

  async getSyncMetrics(ctx: TenantContext) {
    return OperationsService.getSyncMetrics(ctx);
  }

  // ── Workflow Analytics ────────────────────────────────────────────────

  async getWorkflowAnalytics(ctx: TenantContext): Promise<WorkflowAnalytics> {
    return this.workflowAnalytics.getAnalytics(ctx);
  }

  // ── Registry State ────────────────────────────────────────────────────

  async getRegistryState(ctx: TenantContext): Promise<RegistryState> {
    const blueprints = await prisma.workflowDefinition.findMany({
      where: { companyId: ctx.companyId },
    });

    return this.registry.getState(
      this.templateLibrary.getTemplateCount(),
      blueprints.filter((b) => b.status === "ACTIVE").length,
      blueprints.filter((b) => b.status === "DRAFT").length,
    );
  }

  // ── Readiness Reports ─────────────────────────────────────────────────

  async saveReadinessReport(ctx: TenantContext, report: {
    overallScore: number;
    passedChecks: number;
    warnedChecks: number;
    failedChecks: number;
    checks: unknown[];
    suggestions: string[];
  }) {
    return this.persistence.saveReadinessReport(ctx.companyId, {
      ...report,
      checks: JSON.parse(JSON.stringify(report.checks)) as Prisma.InputJsonValue,
    });
  }

  async getLatestReadinessReport(ctx: TenantContext) {
    return this.persistence.getLatestReadinessReport(ctx.companyId);
  }

  async listReadinessReports(ctx: TenantContext) {
    return this.persistence.listReadinessReports(ctx.companyId);
  }

  // ── User Preferences ──────────────────────────────────────────────────

  async getPreference(ctx: TenantContext, key: string) {
    return this.persistence.getPreference(ctx.companyId, ctx.userId, key);
  }

  async setPreference(ctx: TenantContext, key: string, value: unknown) {
    return this.persistence.setPreference(ctx.companyId, ctx.userId, key, value as Prisma.InputJsonValue);
  }

  async listPreferences(ctx: TenantContext) {
    return this.persistence.listPreferences(ctx.companyId, ctx.userId);
  }

  async deletePreference(ctx: TenantContext, key: string) {
    return this.persistence.deletePreference(ctx.companyId, ctx.userId, key);
  }

  // ── Private ───────────────────────────────────────────────────────────

  private recordToApprovalMatrixRule(record: {
    id: string;
    companyId: string;
    name: string;
    description: string;
    priority: number;
    conditions: unknown;
    requiredApprovers: number;
    approverRoles: string[];
    approvalMode: string;
    timeoutMinutes: number;
    escalationEnabled: boolean;
    escalationDelayMinutes: number | null;
    escalationRoles: string[];
    delegationEnabled: boolean;
    delegationRoles: string[];
    departmentScope: string | null;
    thresholdField: string | null;
    thresholdOperator: string | null;
    thresholdValue: number | { toNumber(): number } | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): ApprovalMatrixRule {
    return {
      id: record.id,
      companyId: record.companyId,
      name: record.name,
      description: record.description,
      priority: record.priority,
      conditions: record.conditions as ApprovalMatrixRule["conditions"],
      requiredApprovers: record.requiredApprovers,
      approverRoles: record.approverRoles,
      approvalMode: record.approvalMode as ApprovalMatrixRule["approvalMode"],
      timeoutMinutes: record.timeoutMinutes,
      escalationEnabled: record.escalationEnabled,
      escalationDelayMinutes: record.escalationDelayMinutes,
      escalationRoles: record.escalationRoles.length > 0 ? record.escalationRoles : null,
      delegationEnabled: record.delegationEnabled,
      delegationRoles: record.delegationRoles.length > 0 ? record.delegationRoles : null,
      departmentScope: record.departmentScope,
      thresholdField: record.thresholdField,
      thresholdOperator: record.thresholdOperator as ApprovalMatrixRule["thresholdOperator"],
      thresholdValue: typeof record.thresholdValue === "number"
        ? record.thresholdValue
        : record.thresholdValue != null
          ? Number(String(record.thresholdValue))
          : null,
      isActive: record.isActive,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }

  private toBlueprint(record: {
    id: string;
    companyId: string;
    name: string;
    description: string | null;
    steps: unknown;
    category: string;
    inputSchema: unknown;
    outputSchema: unknown;
    status: string;
    version: number;
    isSystem: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): WorkflowBlueprint {
    return {
      id: record.id,
      companyId: record.companyId,
      name: record.name,
      description: record.description ?? "",
      steps: record.steps as WorkflowBlueprint["steps"],
      category: record.category as AutomationCategory,
      inputSchema: record.inputSchema as Record<string, unknown> | null,
      outputSchema: record.outputSchema as Record<string, unknown> | null,
      status: record.status as WorkflowBlueprint["status"],
      version: record.version,
      isSystem: record.isSystem,
      createdBy: record.companyId,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }
}
