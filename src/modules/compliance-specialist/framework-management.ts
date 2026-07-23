// ─────────────────────────────────────────────────────────────
// Enterprise Compliance Specialist — Framework Management
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  GetFrameworksInput,
  CreateFrameworkInput,
  UpdateFrameworkInput,
  GetRequirementsInput,
  CreateRequirementInput,
} from "./types";

export class FrameworkManagementService {
  static async getFrameworks(
    ctx: TenantContext,
    filters?: GetFrameworksInput,
  ) {
    const where: Prisma.ComplianceFrameworkWhereInput = {
      companyId: ctx.companyId,
    };

    if (filters?.frameworkType) {
      where.frameworkType = filters.frameworkType;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { frameworkName: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [frameworks, total] = await Promise.all([
      prisma.complianceFramework.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: filters?.limit ?? 50,
        skip: filters?.offset ?? 0,
      }),
      prisma.complianceFramework.count({ where }),
    ]);

    return { frameworks, total };
  }

  static async createFramework(
    ctx: TenantContext,
    input: CreateFrameworkInput,
  ) {
    const count = await prisma.complianceFramework.count({
      where: { companyId: ctx.companyId },
    });

    return prisma.complianceFramework.create({
      data: {
        companyId: ctx.companyId,
        frameworkType: input.frameworkType,
        frameworkName: input.name,
        frameworkCode: `FW-${String(count + 1).padStart(4, "0")}`,
        description: input.description,
        jurisdiction: input.jurisdiction ?? null,
        effectiveDate: input.effectiveDate ?? new Date(),
        status: "active",
        metadata: (input.metadata ?? {}) as unknown as Prisma.InputJsonValue,
      },
    });
  }

  static async updateFramework(
    ctx: TenantContext,
    id: string,
    input: UpdateFrameworkInput,
  ) {
    const existing = await prisma.complianceFramework.findFirst({
      where: { id, companyId: ctx.companyId },
    });

    if (!existing) {
      throw new Error(`Framework ${id} not found`);
    }

    return prisma.complianceFramework.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { frameworkName: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.jurisdiction !== undefined && { jurisdiction: input.jurisdiction }),
        ...(input.effectiveDate !== undefined && { effectiveDate: input.effectiveDate }),
        ...(input.metadata !== undefined && {
          metadata: input.metadata as unknown as Prisma.InputJsonValue,
        }),
      },
    });
  }

  static async getRequirements(
    ctx: TenantContext,
    filters?: GetRequirementsInput,
  ) {
    const where: Prisma.ComplianceRequirementWhereInput = {
      companyId: ctx.companyId,
    };

    if (filters?.frameworkId) {
      where.frameworkId = filters.frameworkId;
    }

    if (filters?.requirementType) {
      where.requirementType = filters.requirementType;
    }

    if (filters?.search) {
      where.OR = [
        { requirementName: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [requirements, total] = await Promise.all([
      prisma.complianceRequirement.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: filters?.limit ?? 50,
        skip: filters?.offset ?? 0,
      }),
      prisma.complianceRequirement.count({ where }),
    ]);

    return { requirements, total };
  }

  static async createRequirement(
    ctx: TenantContext,
    input: CreateRequirementInput,
  ) {
    const framework = await prisma.complianceFramework.findFirst({
      where: { id: input.frameworkId, companyId: ctx.companyId },
    });

    if (!framework) {
      throw new Error(`Framework ${input.frameworkId} not found`);
    }

    const count = await prisma.complianceRequirement.count({
      where: { companyId: ctx.companyId, frameworkId: input.frameworkId },
    });

    return prisma.complianceRequirement.create({
      data: {
        companyId: ctx.companyId,
        frameworkId: input.frameworkId,
        requirementType: input.requirementType,
        requirementName: input.title,
        requirementCode: `REQ-${String(count + 1).padStart(4, "0")}`,
        description: input.description,
        category: input.requirementType,
        metadata: (input.metadata ?? {}) as unknown as Prisma.InputJsonValue,
      },
    });
  }
}
