import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { AutomationRuleData, AutomationAction } from "./types";
import { OrchestrationExecutionEngine } from "./workflow-engine";


export class AutomationEngine {
  static async evaluate(ctx: TenantContext, eventType: string, payload?: Record<string, unknown>): Promise<void> {
    const rules = await prisma.automationRule.findMany({
      where: { companyId: ctx.companyId, eventType, isActive: true },
      orderBy: { priority: "desc" },
    });

    for (const rule of rules) {
      if (rule.cooldownSec) {
        const recent = await prisma.workflowLog.findFirst({
          where: {
            companyId: ctx.companyId,
            message: `automation:${rule.id}`,
            createdAt: { gte: new Date(Date.now() - rule.cooldownSec * 1000) },
          },
        });
        if (recent) continue;
      }

      const condition = rule.condition as Record<string, unknown> | null;
      if (condition && !this.evaluateCondition(condition, payload)) continue;

      const actions = rule.actions as unknown as AutomationAction[];
      for (const action of actions) {
        await this.executeAction(ctx, rule.id, action, payload);
      }
    }
  }

  static async list(ctx: TenantContext): Promise<AutomationRuleData[]> {
    const rows = await prisma.automationRule.findMany({
      where: { companyId: ctx.companyId },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });
    return rows.map((r) => ({
      id: r.id,
      companyId: r.companyId,
      name: r.name,
      description: r.description ?? undefined,
      eventType: r.eventType,
      condition: r.condition as Record<string, unknown> | undefined,
      actions: r.actions as unknown as AutomationAction[],
      priority: r.priority,
      isActive: r.isActive,
      cooldownSec: r.cooldownSec ?? undefined,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  }

  static async create(ctx: TenantContext, data: {
    name: string; description?: string; eventType: string;
    condition?: Record<string, unknown>; actions: AutomationAction[];
    priority?: number; cooldownSec?: number;
  }): Promise<AutomationRuleData> {
    const rule = await prisma.automationRule.create({
      data: {
        companyId: ctx.companyId,
        name: data.name,
        description: data.description,
        eventType: data.eventType,
        condition: data.condition as never ?? undefined,
        actions: data.actions as never,
        priority: data.priority ?? 0,
        cooldownSec: data.cooldownSec,
      },
    });
    return {
      id: rule.id, companyId: rule.companyId, name: rule.name,
      description: rule.description ?? undefined, eventType: rule.eventType,
      condition: rule.condition as Record<string, unknown> | undefined,
      actions: rule.actions as unknown as AutomationAction[],
      priority: rule.priority, isActive: rule.isActive,
      cooldownSec: rule.cooldownSec ?? undefined,
      createdAt: rule.createdAt.toISOString(), updatedAt: rule.updatedAt.toISOString(),
    };
  }

  static async update(ctx: TenantContext, id: string, data: Partial<{
    name: string; description: string; eventType: string;
    condition: Record<string, unknown>; actions: AutomationAction[];
    priority: number; isActive: boolean; cooldownSec: number;
  }>): Promise<AutomationRuleData> {
    const existing = await prisma.automationRule.findUnique({ where: { id } });
    if (!existing || existing.companyId !== ctx.companyId) throw new Error("Not found");
    const updated = await prisma.automationRule.update({ where: { id }, data: data as never });
    return {
      id: updated.id, companyId: updated.companyId, name: updated.name,
      description: updated.description ?? undefined, eventType: updated.eventType,
      condition: updated.condition as Record<string, unknown> | undefined,
      actions: updated.actions as unknown as AutomationAction[],
      priority: updated.priority, isActive: updated.isActive,
      cooldownSec: updated.cooldownSec ?? undefined,
      createdAt: updated.createdAt.toISOString(), updatedAt: updated.updatedAt.toISOString(),
    };
  }

  static async delete(ctx: TenantContext, id: string): Promise<void> {
    const existing = await prisma.automationRule.findUnique({ where: { id } });
    if (!existing || existing.companyId !== ctx.companyId) throw new Error("Not found");
    await prisma.automationRule.delete({ where: { id } });
  }

  private static async executeAction(
    ctx: TenantContext, ruleId: string, action: AutomationAction, payload?: Record<string, unknown>,
  ): Promise<void> {
    switch (action.type) {
      case "start_workflow":
        if (action.params?.workflowId) {
          await OrchestrationExecutionEngine.execute(ctx, action.params.workflowId as string, "automation", payload);
        }
        break;
      case "send_notification":
        break;
      case "log_audit":
        await prisma.workflowLog.create({
          data: {
            companyId: ctx.companyId,
            executionId: "automation",
            workflowId: "automation",
            level: "info",
            message: `automation:${ruleId}`,
            metadata: { action: action.type } as never,
          },
        });
        break;
      default:
        break;
    }
  }

  private static evaluateCondition(_condition: Record<string, unknown>, _payload?: Record<string, unknown>): boolean {
    return true;
  }
}
