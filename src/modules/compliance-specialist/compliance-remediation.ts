// ─────────────────────────────────────────────────────────────
// Enterprise Compliance Specialist — Remediation
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  GetRemediationsInput,
  CreateRemediationInput,
  RemediationStatus,
} from "./types";

export class ComplianceRemediationService {
  static async getRemediations(
    ctx: TenantContext,
    filters?: GetRemediationsInput,
  ) {
    const where: Prisma.ComplianceRemediationWhereInput = {
      companyId: ctx.companyId,
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.violationId) {
      where.violationId = filters.violationId;
    }

    if (filters?.search) {
      where.OR = [
        { remediationTitle: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [remediations, total] = await Promise.all([
      prisma.complianceRemediation.findMany({
        where,
        orderBy: [{ status: "asc" }, { targetDate: "asc" }],
        take: filters?.limit ?? 50,
        skip: filters?.offset ?? 0,
      }),
      prisma.complianceRemediation.count({ where }),
    ]);

    return { remediations, total };
  }

  static async createRemediation(
    ctx: TenantContext,
    input: CreateRemediationInput,
  ) {
    const violation = await prisma.complianceViolation.findFirst({
      where: { id: input.violationId, companyId: ctx.companyId },
    });

    if (!violation) {
      throw new Error(`Violation ${input.violationId} not found`);
    }

    return prisma.complianceRemediation.create({
      data: {
        companyId: ctx.companyId,
        violationId: input.violationId,
        remediationTitle: input.title,
        description: input.description,
        owner: input.owner ?? ctx.userId,
        startDate: new Date(),
        targetDate: input.targetDate,
        status: "proposed",
        progress: 0,
        metadata: (input.metadata ?? {}) as unknown as Prisma.InputJsonValue,
      },
    });
  }

  static async updateRemediationStatus(
    ctx: TenantContext,
    id: string,
    status: RemediationStatus,
  ) {
    const existing = await prisma.complianceRemediation.findFirst({
      where: { id, companyId: ctx.companyId },
    });

    if (!existing) {
      throw new Error(`Remediation ${id} not found`);
    }

    const updateData: Prisma.ComplianceRemediationUpdateInput = { status };

    if (status === "completed") {
      updateData.completedDate = new Date();
      updateData.progress = 1;
    }

    return prisma.complianceRemediation.update({
      where: { id },
      data: updateData,
    });
  }

  static async getRemediationsByViolation(
    ctx: TenantContext,
    violationId: string,
  ) {
    const remediations = await prisma.complianceRemediation.findMany({
      where: {
        companyId: ctx.companyId,
        violationId,
      },
      orderBy: { createdAt: "desc" },
    });

    return remediations;
  }

  static async escalateRemediation(
    ctx: TenantContext,
    id: string,
  ) {
    const existing = await prisma.complianceRemediation.findFirst({
      where: { id, companyId: ctx.companyId },
    });

    if (!existing) {
      throw new Error(`Remediation ${id} not found`);
    }

    return prisma.complianceRemediation.update({
      where: { id },
      data: {
        status: "overdue",
        metadata: {
          ...(existing.metadata as Record<string, unknown>),
          escalated: true,
          escalationDate: new Date().toISOString(),
          escalatedBy: ctx.userId,
        } as unknown as Prisma.InputJsonValue,
      },
    });
  }
}
