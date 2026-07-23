// ─────────────────────────────────────────────────────────────
// Enterprise Compliance Specialist — Obligation Tracker
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  GetObligationsInput,
  CreateObligationInput,
  ObligationStatus,
} from "./types";

export class ObligationTrackerService {
  static async getObligations(
    ctx: TenantContext,
    filters?: GetObligationsInput,
  ) {
    const where: Prisma.ComplianceObligationWhereInput = {
      companyId: ctx.companyId,
    };

    if (filters?.obligationType) {
      where.obligationType = filters.obligationType;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { obligationTitle: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [obligations, total] = await Promise.all([
      prisma.complianceObligation.findMany({
        where,
        orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
        take: filters?.limit ?? 50,
        skip: filters?.offset ?? 0,
      }),
      prisma.complianceObligation.count({ where }),
    ]);

    return { obligations, total };
  }

  static async createObligation(
    ctx: TenantContext,
    input: CreateObligationInput,
  ) {
    return prisma.complianceObligation.create({
      data: {
        companyId: ctx.companyId,
        obligationType: input.obligationType,
        obligationTitle: input.title,
        description: input.description,
        requirementId: input.frameworkId ?? null,
        dueDate: input.dueDate ?? null,
        owner: input.assignee ?? ctx.userId,
        status: "pending",
        metadata: (input.metadata ?? {}) as unknown as Prisma.InputJsonValue,
      },
    });
  }

  static async updateObligationStatus(
    ctx: TenantContext,
    id: string,
    status: ObligationStatus,
  ) {
    const existing = await prisma.complianceObligation.findFirst({
      where: { id, companyId: ctx.companyId },
    });

    if (!existing) {
      throw new Error(`Obligation ${id} not found`);
    }

    const updateData: Prisma.ComplianceObligationUpdateInput = { status };

    if (status === "completed") {
      updateData.completedDate = new Date();
    }

    return prisma.complianceObligation.update({
      where: { id },
      data: updateData,
    });
  }

  static async getOverdueObligations(
    ctx: TenantContext,
  ) {
    const now = new Date();

    const obligations = await prisma.complianceObligation.findMany({
      where: {
        companyId: ctx.companyId,
        status: { in: ["pending", "in_progress"] },
        dueDate: { lt: now },
      },
      orderBy: { dueDate: "asc" },
    });

    return obligations;
  }

  static async getUpcomingDeadlines(
    ctx: TenantContext,
    days: number = 30,
  ) {
    const now = new Date();
    const futureDate = new Date(now);
    futureDate.setDate(futureDate.getDate() + days);

    const obligations = await prisma.complianceObligation.findMany({
      where: {
        companyId: ctx.companyId,
        status: { in: ["pending", "in_progress"] },
        dueDate: {
          gte: now,
          lte: futureDate,
        },
      },
      orderBy: { dueDate: "asc" },
    });

    return obligations;
  }
}
