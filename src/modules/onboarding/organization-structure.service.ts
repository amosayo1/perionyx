import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { OrganizationUnitType } from "@prisma/client";
import { NotFoundError, ValidationError } from "@/lib/errors/app-error";
import { recordAudit } from "@/modules/audit";
import type { DbClient } from "@/modules/audit";

export interface CreateOrgUnitInput {
  type: OrganizationUnitType;
  name: string;
  code?: string;
  description?: string;
  currency?: string;
  country?: string;
  parentId?: string;
  sortOrder?: number;
}

export interface UpdateOrgUnitInput {
  name?: string;
  code?: string;
  description?: string;
  currency?: string;
  country?: string;
  parentId?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}

export interface OrgUnitNode {
  id: string;
  companyId: string;
  parentId: string | null;
  type: OrganizationUnitType;
  name: string;
  code: string | null;
  description: string | null;
  currency: string | null;
  country: string | null;
  isActive: boolean;
  sortOrder: number;
  children: OrgUnitNode[];
  createdAt: string;
  updatedAt: string;
}

export interface OrgStructureSummary {
  totalUnits: number;
  byType: Record<string, number>;
  rootUnits: number;
  maxDepth: number;
}

export class OrganizationStructureService {
  async createUnit(ctx: TenantContext, input: CreateOrgUnitInput) {
    if (input.parentId) {
      const parent = await prisma.organizationUnit.findFirst({
        where: { id: input.parentId, companyId: ctx.companyId },
      });
      if (!parent) throw new NotFoundError("Parent organization unit");
    }

    const unit = await prisma.organizationUnit.create({
      data: {
        companyId: ctx.companyId,
        type: input.type,
        name: input.name,
        code: input.code,
        description: input.description,
        currency: input.currency,
        country: input.country,
        parentId: input.parentId,
        sortOrder: input.sortOrder ?? 0,
      },
    });

    await recordAudit(prisma as unknown as DbClient, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "ORG_UNIT_CREATED",
      resourceType: "OrganizationUnit",
      resourceId: unit.id,
      metadata: { type: input.type, name: input.name },
    });

    return unit;
  }

  async updateUnit(ctx: TenantContext, id: string, data: UpdateOrgUnitInput) {
    const existing = await prisma.organizationUnit.findFirst({
      where: { id, companyId: ctx.companyId },
    });
    if (!existing) throw new NotFoundError("Organization unit");

    if (data.parentId !== undefined && data.parentId !== null) {
      const parent = await prisma.organizationUnit.findFirst({
        where: { id: data.parentId, companyId: ctx.companyId },
      });
      if (!parent) throw new NotFoundError("Parent organization unit");
      if (await this.isDescendant(id, data.parentId)) {
        throw new ValidationError("Cannot set a descendant as parent");
      }
    }

    const unit = await prisma.organizationUnit.update({
      where: { id },
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
        currency: data.currency,
        country: data.country,
        parentId: data.parentId,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      },
    });

    await recordAudit(prisma as unknown as DbClient, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "ORG_UNIT_UPDATED",
      resourceType: "OrganizationUnit",
      resourceId: id,
    });

    return unit;
  }

  async deleteUnit(ctx: TenantContext, id: string) {
    const existing = await prisma.organizationUnit.findFirst({
      where: { id, companyId: ctx.companyId },
      include: { children: { take: 1 } },
    });
    if (!existing) throw new NotFoundError("Organization unit");
    if (existing.children.length > 0) {
      throw new ValidationError("Cannot delete unit with children. Reassign or delete children first.");
    }

    await prisma.organizationUnit.delete({ where: { id } });

    await recordAudit(prisma as unknown as DbClient, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "ORG_UNIT_DELETED",
      resourceType: "OrganizationUnit",
      resourceId: id,
    });
  }

  async getUnit(ctx: TenantContext, id: string) {
    const unit = await prisma.organizationUnit.findFirst({
      where: { id, companyId: ctx.companyId },
    });
    if (!unit) throw new NotFoundError("Organization unit");
    return unit;
  }

  async listUnits(ctx: TenantContext, type?: OrganizationUnitType) {
    return prisma.organizationUnit.findMany({
      where: { companyId: ctx.companyId, ...(type ? { type } : {}) },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  }

  async getTree(ctx: TenantContext): Promise<OrgUnitNode[]> {
    const units = await prisma.organizationUnit.findMany({
      where: { companyId: ctx.companyId },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    const nodeMap = new Map<string, OrgUnitNode>();
    const roots: OrgUnitNode[] = [];

    for (const u of units) {
      nodeMap.set(u.id, {
        id: u.id,
        companyId: u.companyId,
        parentId: u.parentId,
        type: u.type as OrganizationUnitType,
        name: u.name,
        code: u.code,
        description: u.description,
        currency: u.currency,
        country: u.country,
        isActive: u.isActive,
        sortOrder: u.sortOrder,
        children: [],
        createdAt: u.createdAt.toISOString(),
        updatedAt: u.updatedAt.toISOString(),
      });
    }

    for (const node of nodeMap.values()) {
      if (node.parentId) {
        const parent = nodeMap.get(node.parentId);
        if (parent) parent.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  async getSummary(ctx: TenantContext): Promise<OrgStructureSummary> {
    const units = await prisma.organizationUnit.findMany({
      where: { companyId: ctx.companyId },
    });

    const byType: Record<string, number> = {};
    for (const u of units) {
      byType[u.type] = (byType[u.type] ?? 0) + 1;
    }

    const maxDepth = this.calculateMaxDepth(units);

    return {
      totalUnits: units.length,
      byType,
      rootUnits: units.filter((u) => !u.parentId).length,
      maxDepth,
    };
  }

  async bulkCreate(ctx: TenantContext, inputs: CreateOrgUnitInput[]): Promise<number> {
    const created = await prisma.organizationUnit.createMany({
      data: inputs.map((i) => ({
        companyId: ctx.companyId,
        type: i.type,
        name: i.name,
        code: i.code,
        description: i.description,
        currency: i.currency,
        country: i.country,
        parentId: i.parentId,
        sortOrder: i.sortOrder ?? 0,
      })),
    });

    await recordAudit(prisma as unknown as DbClient, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "ORG_UNITS_BULK_CREATED",
      resourceType: "OrganizationUnit",
      resourceId: ctx.companyId,
      metadata: { count: created.count },
    });

    return created.count;
  }

  private async isDescendant(unitId: string, candidateDescendantId: string): Promise<boolean> {
    let current = candidateDescendantId;
    for (let i = 0; i < 100; i++) {
      const unit = await prisma.organizationUnit.findUnique({
        where: { id: current },
        select: { parentId: true },
      });
      if (!unit || !unit.parentId) return false;
      if (unit.parentId === unitId) return true;
      current = unit.parentId;
    }
    return false;
  }

  private calculateMaxDepth(units: Array<{ id: string; parentId: string | null }>): number {
    const children = new Map<string, string[]>();
    for (const u of units) {
      if (u.parentId) {
        const existing = children.get(u.parentId) ?? [];
        existing.push(u.id);
        children.set(u.parentId, existing);
      }
    }

    let maxDepth = 0;
    const visit = (nodeId: string, depth: number) => {
      maxDepth = Math.max(maxDepth, depth);
      for (const child of children.get(nodeId) ?? []) {
        visit(child, depth + 1);
      }
    };

    for (const u of units) {
      if (!u.parentId) visit(u.id, 1);
    }

    return maxDepth;
  }
}
