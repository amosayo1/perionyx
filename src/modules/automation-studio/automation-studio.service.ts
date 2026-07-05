import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { recordAudit, type DbClient } from "@/modules/audit";
import { WorkflowEngine } from "@/modules/workflow/engine";
import type { WorkflowStatus } from "@/modules/workflow/types";
import { GovernanceService } from "@/modules/governance/governance.service";
import { IntelligenceService } from "@/modules/enterprise-intelligence/intelligence.service";
import { DecisionService } from "@/modules/decision-intelligence/decision.service";
import { connectorOrchestrator } from "@/modules/connector-platform/orchestrator/orchestrator";
import { OperationsService } from "@/modules/operations/operations.service";
import { TemplateLibrary } from "./template-library";
import { AutomationRegistry } from "./automation-registry";
import { BusinessRulesBuilder, businessRulesBuilder } from "./business-rules-builder";
import { ApprovalMatrixEvaluator, approvalMatrixEvaluator } from "./approval-matrix-evaluator";
import { AutomationScheduler, automationScheduler } from "./automation-scheduler";
import { WorkflowAnalyticsService } from "./workflow-analytics.service";
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

  // ── Blueprints (Designer) ─────────────────────────────────────────────

  async createBlueprint(ctx: TenantContext, data: CreateBlueprintInput): Promise<WorkflowBlueprint> {
    const now = new Date().toISOString();
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
    const schedule = automationScheduler.createSchedule(data);
    automationScheduler.setCompanyId(schedule.id, ctx.companyId);

    schedule.companyId = ctx.companyId;
    schedule.createdBy = ctx.userId;

    this.registry.registerSchedule(schedule);

    await recordAudit(prisma as unknown as DbClient, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "AUTOMATION_SCHEDULE_CREATED",
      resourceType: "AutomationSchedule",
      resourceId: schedule.id,
      metadata: { name: data.name, triggerType: data.triggerType },
    });

    return schedule;
  }

  async updateSchedule(ctx: TenantContext, id: string, data: UpdateScheduleInput): Promise<AutomationSchedule | null> {
    const existing = this.registry.getSchedule(id);
    if (!existing || existing.companyId !== ctx.companyId) return null;

    const updated = automationScheduler.updateSchedule(id, data);
    if (updated) {
      this.registry.registerSchedule(updated);

      await recordAudit(prisma as unknown as DbClient, {
        companyId: ctx.companyId,
        actorUserId: ctx.userId,
        action: "AUTOMATION_SCHEDULE_UPDATED",
        resourceType: "AutomationSchedule",
        resourceId: id,
      });
    }

    return updated;
  }

  async deleteSchedule(ctx: TenantContext, id: string): Promise<boolean> {
    const existing = this.registry.getSchedule(id);
    if (!existing || existing.companyId !== ctx.companyId) return false;

    automationScheduler.deleteSchedule(id);
    this.registry.unregisterSchedule(id);

    await recordAudit(prisma as unknown as DbClient, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "AUTOMATION_SCHEDULE_DELETED",
      resourceType: "AutomationSchedule",
      resourceId: id,
    });

    return true;
  }

  listSchedules(ctx: TenantContext, templateId?: string): AutomationSchedule[] {
    return automationScheduler.listSchedules(ctx.companyId, templateId);
  }

  async triggerSchedule(ctx: TenantContext, id: string): Promise<string | null> {
    const schedule = this.registry.getSchedule(id);
    if (!schedule || schedule.companyId !== ctx.companyId) return null;
    return automationScheduler.triggerImmediate(schedule);
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
    return approvalMatrixEvaluator.listRules(ctx.companyId);
  }

  async getApprovalMatrixRule(ctx: TenantContext, id: string): Promise<ApprovalMatrixRule | null> {
    const rule = approvalMatrixEvaluator.getRule(id);
    return rule?.companyId === ctx.companyId ? rule : null;
  }

  async createApprovalMatrixRule(ctx: TenantContext, data: CreateApprovalMatrixRuleInput): Promise<ApprovalMatrixRule> {
    const now = new Date().toISOString();
    const rule: ApprovalMatrixRule = {
      id: crypto.randomUUID(),
      companyId: ctx.companyId,
      name: data.name,
      description: data.description ?? "",
      priority: data.priority,
      conditions: data.conditions,
      requiredApprovers: data.requiredApprovers,
      approverRoles: data.approverRoles,
      approvalMode: data.approvalMode ?? "sequential",
      timeoutMinutes: data.timeoutMinutes,
      escalationEnabled: data.escalationEnabled ?? false,
      escalationDelayMinutes: data.escalationDelayMinutes ?? null,
      escalationRoles: data.escalationRoles ?? null,
      delegationEnabled: data.delegationEnabled ?? false,
      delegationRoles: data.delegationRoles ?? null,
      departmentScope: data.departmentScope ?? null,
      thresholdField: data.thresholdField ?? null,
      thresholdOperator: data.thresholdOperator ?? null,
      thresholdValue: data.thresholdValue ?? null,
      isActive: data.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };

    approvalMatrixEvaluator.registerRule(rule);
    this.registry.registerApprovalRule(rule);

    await recordAudit(prisma as unknown as DbClient, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "AUTOMATION_APPROVAL_RULE_CREATED",
      resourceType: "ApprovalMatrixRule",
      resourceId: rule.id,
      metadata: { name: data.name, priority: data.priority },
    });

    return rule;
  }

  async updateApprovalMatrixRule(ctx: TenantContext, id: string, data: Partial<CreateApprovalMatrixRuleInput>): Promise<ApprovalMatrixRule | null> {
    const existing = approvalMatrixEvaluator.getRule(id);
    if (!existing || existing.companyId !== ctx.companyId) return null;

    const now = new Date().toISOString();
    const rule: ApprovalMatrixRule = {
      ...existing,
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.conditions !== undefined && { conditions: data.conditions }),
      ...(data.requiredApprovers !== undefined && { requiredApprovers: data.requiredApprovers }),
      ...(data.approverRoles !== undefined && { approverRoles: data.approverRoles }),
      ...(data.approvalMode !== undefined && { approvalMode: data.approvalMode }),
      ...(data.timeoutMinutes !== undefined && { timeoutMinutes: data.timeoutMinutes }),
      ...(data.escalationEnabled !== undefined && { escalationEnabled: data.escalationEnabled }),
      ...(data.escalationDelayMinutes !== undefined && { escalationDelayMinutes: data.escalationDelayMinutes }),
      ...(data.escalationRoles !== undefined && { escalationRoles: data.escalationRoles }),
      ...(data.delegationEnabled !== undefined && { delegationEnabled: data.delegationEnabled }),
      ...(data.delegationRoles !== undefined && { delegationRoles: data.delegationRoles }),
      ...(data.departmentScope !== undefined && { departmentScope: data.departmentScope }),
      ...(data.thresholdField !== undefined && { thresholdField: data.thresholdField }),
      ...(data.thresholdOperator !== undefined && { thresholdOperator: data.thresholdOperator }),
      ...(data.thresholdValue !== undefined && { thresholdValue: data.thresholdValue }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      updatedAt: now,
    };

    approvalMatrixEvaluator.registerRule(rule);
    this.registry.registerApprovalRule(rule);

    await recordAudit(prisma as unknown as DbClient, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "AUTOMATION_APPROVAL_RULE_UPDATED",
      resourceType: "ApprovalMatrixRule",
      resourceId: id,
    });

    return rule;
  }

  async deleteApprovalMatrixRule(ctx: TenantContext, id: string): Promise<boolean> {
    const existing = approvalMatrixEvaluator.getRule(id);
    if (!existing || existing.companyId !== ctx.companyId) return false;

    approvalMatrixEvaluator.unregisterRule(id);
    this.registry.unregisterApprovalRule(id);

    await recordAudit(prisma as unknown as DbClient, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "AUTOMATION_APPROVAL_RULE_DELETED",
      resourceType: "ApprovalMatrixRule",
      resourceId: id,
    });

    return true;
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
    const rule = businessRulesBuilder.registerRule(ctx.companyId, data);

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

  getBusinessRuleDefinition(id: string): BusinessRuleDefinition | undefined {
    return businessRulesBuilder.getRule(id);
  }

  listBusinessRuleDefinitions(ctx: TenantContext, category?: string): BusinessRuleDefinition[] {
    return businessRulesBuilder.listRules(ctx.companyId, category);
  }

  updateBusinessRuleDefinition(
    id: string,
    data: Partial<Omit<BusinessRuleDefinition, "id" | "companyId" | "createdAt">>,
  ): BusinessRuleDefinition | null {
    return businessRulesBuilder.updateRule(id, data);
  }

  deleteBusinessRuleDefinition(ctx: TenantContext, id: string): boolean {
    const rule = businessRulesBuilder.getRule(id);
    if (!rule || rule.companyId !== ctx.companyId) return false;
    return businessRulesBuilder.unregisterRule(id);
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
    const schedules = automationScheduler.listSchedules(ctx.companyId);
    const activeSchedules = schedules.filter((s) => s.enabled).length;

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

  // ── Private ───────────────────────────────────────────────────────────

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
