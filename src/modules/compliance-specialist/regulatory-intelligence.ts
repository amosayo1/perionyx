// ─────────────────────────────────────────────────────────────
// Enterprise Compliance Specialist — Regulatory Intelligence
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  GetRegulatoryUpdatesInput,
  CreateRegulatoryUpdateInput,
  AssessRegulatoryUpdateInput,
} from "./types";

export class RegulatoryIntelligenceService {
  static async getRegulatoryUpdates(
    ctx: TenantContext,
    filters?: GetRegulatoryUpdatesInput,
  ) {
    const where: Prisma.RegulatoryUpdateWhereInput = {
      companyId: ctx.companyId,
    };

    if (filters?.updateType) {
      where.updateType = filters.updateType;
    }

    if (filters?.jurisdiction) {
      where.jurisdiction = filters.jurisdiction;
    }

    if (filters?.impactLevel) {
      where.frameworkCode = filters.impactLevel;
    }

    if (filters?.search) {
      where.OR = [
        { updateTitle: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [updates, total] = await Promise.all([
      prisma.regulatoryUpdate.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: filters?.limit ?? 50,
        skip: filters?.offset ?? 0,
      }),
      prisma.regulatoryUpdate.count({ where }),
    ]);

    return { updates, total };
  }

  static async createUpdate(
    ctx: TenantContext,
    input: CreateRegulatoryUpdateInput,
  ) {
    return prisma.regulatoryUpdate.create({
      data: {
        companyId: ctx.companyId,
        updateType: input.updateType,
        updateTitle: input.title,
        description: input.summary,
        source: input.sourceUrl ?? "manual",
        jurisdiction: input.jurisdiction,
        effectiveDate: input.effectiveDate ?? new Date(),
        assessmentStatus: "pending",
        affectedProcesses: [] as unknown as Prisma.InputJsonValue,
        affectedControls: [] as unknown as Prisma.InputJsonValue,
        affectedSpecialists: [] as unknown as Prisma.InputJsonValue,
        metadata: (input.metadata ?? {}) as unknown as Prisma.InputJsonValue,
      },
    });
  }

  static async assessUpdate(
    ctx: TenantContext,
    id: string,
    input: AssessRegulatoryUpdateInput,
  ) {
    const existing = await prisma.regulatoryUpdate.findFirst({
      where: { id, companyId: ctx.companyId },
    });

    if (!existing) {
      throw new Error(`Regulatory update ${id} not found`);
    }

    return prisma.regulatoryUpdate.update({
      where: { id },
      data: {
        assessmentStatus: "assessed",
        affectedProcesses: input.affectedFrameworks as unknown as Prisma.InputJsonValue,
        affectedControls: input.affectedPolicies as unknown as Prisma.InputJsonValue,
        impactAssessment: {
          notes: input.assessmentNotes,
          actionRequired: input.actionRequired,
          deadline: input.deadline,
          assessedBy: ctx.userId,
          assessedAt: new Date(),
        } as unknown as Prisma.InputJsonValue,
      },
    });
  }

  static async getPendingAssessments(
    ctx: TenantContext,
  ) {
    const updates = await prisma.regulatoryUpdate.findMany({
      where: {
        companyId: ctx.companyId,
        assessmentStatus: "pending",
      },
      orderBy: { createdAt: "desc" },
    });

    return updates;
  }

  static async getUpdatesByJurisdiction(
    ctx: TenantContext,
    jurisdiction: string,
  ) {
    const updates = await prisma.regulatoryUpdate.findMany({
      where: {
        companyId: ctx.companyId,
        jurisdiction,
      },
      orderBy: { createdAt: "desc" },
    });

    return updates;
  }
}
