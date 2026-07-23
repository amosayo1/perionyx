import { prisma } from "@/server/db/prisma";
import { Prisma } from "@prisma/client";
import type { TenantContext } from "@/server/context/tenant-context";
import { recordAudit, type DbClient } from "@/modules/audit";
import { BUILTIN_TEMPLATES } from "../templates";
import type { ApprovalMatrixRuleRecord, BusinessRuleDefinitionRecord, AutomationScheduleRecord, AutomationTemplateRecord } from "./types";

export class AutomationStudioPersistenceService {
  // ── Approval Matrix Rules ─────────────────────────────────────────────

  async listApprovalMatrixRules(companyId: string): Promise<ApprovalMatrixRuleRecord[]> {
    return prisma.approvalMatrixRule.findMany({
      where: { companyId },
      orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
    });
  }

  async getApprovalMatrixRule(id: string): Promise<ApprovalMatrixRuleRecord | null> {
    return prisma.approvalMatrixRule.findUnique({ where: { id } });
  }

  async createApprovalMatrixRule(
    ctx: TenantContext,
    data: {
      name: string;
      description?: string;
      priority: number;
      conditions: Prisma.InputJsonValue;
      requiredApprovers: number;
      approverRoles: string[];
      approvalMode?: string;
      timeoutMinutes: number;
      escalationEnabled?: boolean;
      escalationDelayMinutes?: number | null;
      escalationRoles?: string[];
      delegationEnabled?: boolean;
      delegationRoles?: string[];
      departmentScope?: string | null;
      thresholdField?: string | null;
      thresholdOperator?: string | null;
      thresholdValue?: number | string | null;
      isActive?: boolean;
    },
  ): Promise<ApprovalMatrixRuleRecord> {
    const record = await prisma.approvalMatrixRule.create({
      data: {
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
        escalationRoles: data.escalationRoles ?? [],
        delegationEnabled: data.delegationEnabled ?? false,
        delegationRoles: data.delegationRoles ?? [],
        departmentScope: data.departmentScope ?? null,
        thresholdField: data.thresholdField ?? null,
        thresholdOperator: data.thresholdOperator ?? null,
        thresholdValue: data.thresholdValue != null ? String(data.thresholdValue) : null,
        isActive: data.isActive ?? true,
        version: 1,
        createdByUserId: ctx.userId,
      },
    });

    await recordAudit(prisma as unknown as DbClient, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "AUTOMATION_APPROVAL_RULE_PERSISTED",
      resourceType: "ApprovalMatrixRule",
      resourceId: record.id,
      metadata: { name: data.name, priority: data.priority },
    });

    return record;
  }

  async updateApprovalMatrixRule(
    ctx: TenantContext,
    id: string,
    data: Record<string, unknown>,
  ): Promise<ApprovalMatrixRuleRecord | null> {
    const existing = await prisma.approvalMatrixRule.findUnique({ where: { id } });
    if (!existing || existing.companyId !== ctx.companyId) return null;

    // Build update payload explicitly to avoid Prisma type spread issues
    const updatePayload: Prisma.ApprovalMatrixRuleUpdateInput = {
      version: existing.version + 1,
      updatedBy: { connect: { id: ctx.userId } },
    };
    for (const [key, value] of Object.entries(data)) {
      if (key !== "company" && key !== "companyId" && key !== "id") {
        (updatePayload as Record<string, unknown>)[key] = value;
      }
    }

    const record = await prisma.approvalMatrixRule.update({
      where: { id },
      data: updatePayload,
    });

    await recordAudit(prisma as unknown as DbClient, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "AUTOMATION_APPROVAL_RULE_UPDATED",
      resourceType: "ApprovalMatrixRule",
      resourceId: id,
      metadata: { version: record.version },
    });

    return record;
  }

  async deleteApprovalMatrixRule(ctx: TenantContext, id: string): Promise<boolean> {
    const existing = await prisma.approvalMatrixRule.findUnique({ where: { id } });
    if (!existing || existing.companyId !== ctx.companyId) return false;

    await prisma.approvalMatrixRule.delete({ where: { id } });

    await recordAudit(prisma as unknown as DbClient, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "AUTOMATION_APPROVAL_RULE_DELETED",
      resourceType: "ApprovalMatrixRule",
      resourceId: id,
    });

    return true;
  }

  // ── Business Rule Definitions ─────────────────────────────────────────

  async listBusinessRuleDefinitions(companyId: string, category?: string): Promise<BusinessRuleDefinitionRecord[]> {
    return prisma.businessRuleDefinition.findMany({
      where: { companyId, ...(category ? { category } : {}) },
      orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
    });
  }

  async getBusinessRuleDefinition(id: string): Promise<BusinessRuleDefinitionRecord | null> {
    return prisma.businessRuleDefinition.findUnique({ where: { id } });
  }

  async createBusinessRuleDefinition(
    ctx: TenantContext,
    data: {
      name: string;
      description?: string;
      category: string;
      priority: number;
      when: Prisma.InputJsonValue;
      then: Prisma.InputJsonValue;
      isActive?: boolean;
    },
  ): Promise<BusinessRuleDefinitionRecord> {
    const record = await prisma.businessRuleDefinition.create({
      data: {
        companyId: ctx.companyId,
        name: data.name,
        description: data.description ?? "",
        category: data.category,
        priority: data.priority,
        when: data.when,
        then: data.then,
        isActive: data.isActive ?? true,
        version: 1,
        createdByUserId: ctx.userId,
      },
    });

    await recordAudit(prisma as unknown as DbClient, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "AUTOMATION_BUSINESS_RULE_DEFINITION_PERSISTED",
      resourceType: "BusinessRuleDefinition",
      resourceId: record.id,
      metadata: { name: data.name, category: data.category },
    });

    return record;
  }

  async updateBusinessRuleDefinition(
    ctx: TenantContext,
    id: string,
    data: Record<string, unknown>,
  ): Promise<BusinessRuleDefinitionRecord | null> {
    const existing = await prisma.businessRuleDefinition.findUnique({ where: { id } });
    if (!existing || existing.companyId !== ctx.companyId) return null;

    const updatePayload: Prisma.BusinessRuleDefinitionUpdateInput = {
      version: existing.version + 1,
      updatedBy: { connect: { id: ctx.userId } },
    };
    for (const [key, value] of Object.entries(data)) {
      if (key !== "company" && key !== "companyId" && key !== "id") {
        (updatePayload as Record<string, unknown>)[key] = value;
      }
    }

    const record = await prisma.businessRuleDefinition.update({
      where: { id },
      data: updatePayload,
    });

    return record;
  }

  async deleteBusinessRuleDefinition(ctx: TenantContext, id: string): Promise<boolean> {
    const existing = await prisma.businessRuleDefinition.findUnique({ where: { id } });
    if (!existing || existing.companyId !== ctx.companyId) return false;

    await prisma.businessRuleDefinition.delete({ where: { id } });
    return true;
  }

  // ── Automation Schedules ──────────────────────────────────────────────

  async listSchedules(companyId: string, templateId?: string): Promise<AutomationScheduleRecord[]> {
    return prisma.automationSchedule.findMany({
      where: { companyId, ...(templateId ? { templateId } : {}) },
      orderBy: { createdAt: "desc" },
    });
  }

  async getSchedule(id: string): Promise<AutomationScheduleRecord | null> {
    return prisma.automationSchedule.findUnique({ where: { id } });
  }

  async createSchedule(
    ctx: TenantContext,
    data: {
      name: string;
      triggerType: string;
      cronExpression?: string | null;
      startAt?: string | null;
      eventSource?: string | null;
      eventType?: string | null;
      templateId?: string | null;
      blueprintId?: string | null;
      input?: Prisma.InputJsonValue;
      enabled?: boolean;
    },
  ): Promise<AutomationScheduleRecord> {
    const record = await prisma.automationSchedule.create({
      data: {
        companyId: ctx.companyId,
        name: data.name,
        triggerType: data.triggerType,
        cronExpression: data.cronExpression ?? null,
        startAt: data.startAt ? new Date(data.startAt) : null,
        eventSource: data.eventSource ?? null,
        eventType: data.eventType ?? null,
        templateId: data.templateId ?? null,
        blueprintId: data.blueprintId ?? null,
        input: (data.input ?? null) as Prisma.InputJsonValue,
        enabled: data.enabled ?? true,
        version: 1,
        createdByUserId: ctx.userId,
      },
    });

    await recordAudit(prisma as unknown as DbClient, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "AUTOMATION_SCHEDULE_PERSISTED",
      resourceType: "AutomationSchedule",
      resourceId: record.id,
      metadata: { name: data.name, triggerType: data.triggerType },
    });

    return record;
  }

  async updateSchedule(
    ctx: TenantContext,
    id: string,
    data: Record<string, unknown>,
  ): Promise<AutomationScheduleRecord | null> {
    const existing = await prisma.automationSchedule.findUnique({ where: { id } });
    if (!existing || existing.companyId !== ctx.companyId) return null;

    const updatePayload: Prisma.AutomationScheduleUpdateInput = {
      version: existing.version + 1,
      updatedBy: { connect: { id: ctx.userId } },
    };
    for (const [key, value] of Object.entries(data)) {
      if (key !== "company" && key !== "companyId" && key !== "id") {
        let typedValue = value;
        if (key === "startAt" && typeof value === "string") typedValue = new Date(value);
        if (key === "lastRunAt" && typeof value === "string") typedValue = new Date(value);
        if (key === "nextRunAt" && typeof value === "string") typedValue = new Date(value);
        (updatePayload as Record<string, unknown>)[key] = typedValue;
      }
    }

    const record = await prisma.automationSchedule.update({
      where: { id },
      data: updatePayload,
    });

    return record;
  }

  async deleteSchedule(ctx: TenantContext, id: string): Promise<boolean> {
    const existing = await prisma.automationSchedule.findUnique({ where: { id } });
    if (!existing || existing.companyId !== ctx.companyId) return false;

    await prisma.automationSchedule.delete({ where: { id } });
    return true;
  }

  async updateScheduleRunTimes(id: string, lastRunAt: Date, nextRunAt?: Date): Promise<void> {
    await prisma.automationSchedule.update({
      where: { id },
      data: {
        lastRunAt,
        ...(nextRunAt ? { nextRunAt } : {}),
        version: { increment: 1 },
      },
    });
  }

  async setScheduleEnabled(id: string, enabled: boolean): Promise<void> {
    await prisma.automationSchedule.update({
      where: { id },
      data: { enabled, version: { increment: 1 } },
    });
  }

  // ── Automation Templates ──────────────────────────────────────────────

  async listTemplates(companyId: string, category?: string): Promise<AutomationTemplateRecord[]> {
    return prisma.automationTemplate.findMany({
      where: { companyId, ...(category ? { category } : {}) },
      orderBy: { name: "asc" },
    });
  }

  async getTemplate(id: string): Promise<AutomationTemplateRecord | null> {
    return prisma.automationTemplate.findUnique({ where: { id } });
  }

  async createTemplate(
    ctx: TenantContext,
    data: {
      name: string;
      description?: string;
      category: string;
      icon?: string;
      kind?: string;
      steps: Prisma.InputJsonValue;
      inputSchema?: Prisma.InputJsonValue | null;
      outputSchema?: Prisma.InputJsonValue | null;
      triggerType?: string;
      popularity?: string;
      status?: string;
      metadata: Prisma.InputJsonValue;
      isSystem?: boolean;
    },
  ): Promise<AutomationTemplateRecord> {
    return prisma.automationTemplate.create({
      data: {
        companyId: ctx.companyId,
        name: data.name,
        description: data.description ?? "",
        category: data.category,
        icon: data.icon ?? "FileText",
        kind: data.kind ?? "semi_automated",
        steps: data.steps,
        inputSchema: data.inputSchema !== undefined && data.inputSchema !== null
          ? data.inputSchema
          : Prisma.NullableJsonNullValueInput.JsonNull,
        outputSchema: data.outputSchema !== undefined && data.outputSchema !== null
          ? data.outputSchema
          : Prisma.NullableJsonNullValueInput.JsonNull,
        triggerType: data.triggerType ?? "manual",
        popularity: data.popularity ?? "medium",
        status: data.status ?? "active",
        metadata: data.metadata,
        version: 1,
        isSystem: data.isSystem ?? false,
        createdByUserId: ctx.userId,
      },
    });
  }

  async seedBuiltinTemplates(companyId: string): Promise<number> {
    const count = await prisma.automationTemplate.count({ where: { companyId, isSystem: true } });
    if (count > 0) return 0;

    const records = BUILTIN_TEMPLATES.map((tpl) => ({
      companyId,
      name: tpl.name,
      description: tpl.description,
      category: tpl.category,
      icon: tpl.icon,
      kind: tpl.kind,
      steps: tpl.steps as unknown as Prisma.InputJsonValue,
      inputSchema: tpl.inputSchema !== null && tpl.inputSchema !== undefined
        ? tpl.inputSchema as Prisma.InputJsonValue
        : Prisma.NullableJsonNullValueInput.JsonNull,
      outputSchema: tpl.outputSchema !== null && tpl.outputSchema !== undefined
        ? tpl.outputSchema as Prisma.InputJsonValue
        : Prisma.NullableJsonNullValueInput.JsonNull,
      triggerType: tpl.triggerType,
      popularity: tpl.popularity,
      status: tpl.status,
      metadata: tpl.metadata as unknown as Prisma.InputJsonValue,
      version: 1,
      isSystem: true,
    }));

    await prisma.automationTemplate.createMany({ data: records });
    return records.length;
  }

  // ── Readiness Reports ─────────────────────────────────────────────────

  async saveReadinessReport(
    companyId: string,
    data: {
      overallScore: number;
      passedChecks: number;
      warnedChecks: number;
      failedChecks: number;
      checks: Prisma.InputJsonValue;
      suggestions: string[];
    },
  ) {
    return prisma.readinessReport.create({
      data: {
        companyId,
        overallScore: data.overallScore,
        passedChecks: data.passedChecks,
        warnedChecks: data.warnedChecks,
        failedChecks: data.failedChecks,
        checks: data.checks,
        suggestions: data.suggestions,
        version: 1,
      },
    });
  }

  async getLatestReadinessReport(companyId: string) {
    return prisma.readinessReport.findFirst({
      where: { companyId },
      orderBy: { createdAt: "desc" },
    });
  }

  async listReadinessReports(companyId: string) {
    return prisma.readinessReport.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  }

  // ── User Preferences ──────────────────────────────────────────────────

  async getPreference(companyId: string, userId: string, key: string) {
    return prisma.userPreference.findUnique({
      where: { companyId_userId_key: { companyId, userId, key } },
    });
  }

  async setPreference(companyId: string, userId: string, key: string, value: Prisma.InputJsonValue) {
    return prisma.userPreference.upsert({
      where: { companyId_userId_key: { companyId, userId, key } },
      create: { companyId, userId, key, value },
      update: { value },
    });
  }

  async listPreferences(companyId: string, userId: string) {
    return prisma.userPreference.findMany({
      where: { companyId, userId },
    });
  }

  async deletePreference(companyId: string, userId: string, key: string) {
    return prisma.userPreference.delete({
      where: { companyId_userId_key: { companyId, userId, key } },
    });
  }
}

export const automationStudioPersistence = new AutomationStudioPersistenceService();
