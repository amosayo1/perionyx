import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { WorkflowStep, WorkflowDefinitionData, WorkflowCategory } from "./types";

export class WorkflowBuilder {
  static async create(
    ctx: TenantContext,
    data: {
      name: string;
      description?: string;
      category?: string;
      steps: WorkflowStep[];
    },
  ): Promise<WorkflowDefinitionData> {
    const def = await prisma.workflowDefinition.create({
      data: {
        companyId: ctx.companyId,
        name: data.name,
        description: data.description,
        category: data.category ?? "custom",
        steps: data.steps as never,
      },
    });
    return this.toData(def);
  }

  static async update(
    ctx: TenantContext,
    id: string,
    data: {
      name?: string;
      description?: string;
      category?: string;
      steps?: WorkflowStep[];
      status?: string;
    },
  ): Promise<WorkflowDefinitionData> {
    const existing = await prisma.workflowDefinition.findUnique({ where: { id } });
    if (!existing || existing.companyId !== ctx.companyId) throw new Error("Not found or cross-tenant access denied");

    const def = await prisma.workflowDefinition.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.steps !== undefined && { steps: data.steps as never }),
        ...(data.status !== undefined && { status: data.status }),
        version: { increment: 1 },
      },
    });
    return this.toData(def);
  }

  static async list(ctx: TenantContext, category?: string): Promise<WorkflowDefinitionData[]> {
    const where: Record<string, unknown> = { companyId: ctx.companyId };
    if (category) where.category = category;
    const rows = await prisma.workflowDefinition.findMany({
      where: where as never,
      orderBy: { createdAt: "desc" },
    });
    return rows.map((r) => this.toData(r));
  }

  static async get(ctx: TenantContext, id: string): Promise<WorkflowDefinitionData | null> {
    const def = await prisma.workflowDefinition.findUnique({ where: { id } });
    if (!def || def.companyId !== ctx.companyId) return null;
    return this.toData(def);
  }

  private static toData(def: {
    id: string; companyId: string; name: string; description: string | null;
    category: string; steps: unknown; version: number; status: string;
    isSystem: boolean; createdAt: Date; updatedAt: Date;
  }): WorkflowDefinitionData {
    return {
      id: def.id,
      companyId: def.companyId,
      name: def.name,
      description: def.description ?? undefined,
      category: def.category,
      steps: def.steps as WorkflowStep[],
      version: def.version,
      status: def.status,
      isSystem: def.isSystem,
      createdAt: def.createdAt.toISOString(),
      updatedAt: def.updatedAt.toISOString(),
    };
  }
}
