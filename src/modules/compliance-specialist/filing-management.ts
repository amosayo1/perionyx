// ─────────────────────────────────────────────────────────────
// Enterprise Compliance Specialist — Filing Management
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  GetFilingsInput,
  CreateFilingInput,
  FilingStatus,
} from "./types";

export class FilingManagementService {
  static async getFilings(
    ctx: TenantContext,
    filters?: GetFilingsInput,
  ) {
    const where: Prisma.ComplianceFilingWhereInput = {
      companyId: ctx.companyId,
    };

    if (filters?.filingType) {
      where.filingType = filters.filingType;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.jurisdiction) {
      where.jurisdiction = filters.jurisdiction;
    }

    if (filters?.search) {
      where.OR = [
        { filingTitle: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [filings, total] = await Promise.all([
      prisma.complianceFiling.findMany({
        where,
        orderBy: { dueDate: "asc" },
        take: filters?.limit ?? 50,
        skip: filters?.offset ?? 0,
      }),
      prisma.complianceFiling.count({ where }),
    ]);

    return { filings, total };
  }

  static async createFiling(
    ctx: TenantContext,
    input: CreateFilingInput,
  ) {
    return prisma.complianceFiling.create({
      data: {
        companyId: ctx.companyId,
        filingType: input.filingType,
        filingTitle: input.title,
        jurisdiction: input.jurisdiction ?? null,
        filingFrequency: input.frequency,
        dueDate: input.dueDate,
        status: "not_started",
        metadata: (input.metadata ?? {}) as unknown as Prisma.InputJsonValue,
      },
    });
  }

  static async updateFilingStatus(
    ctx: TenantContext,
    id: string,
    status: FilingStatus,
  ) {
    const existing = await prisma.complianceFiling.findFirst({
      where: { id, companyId: ctx.companyId },
    });

    if (!existing) {
      throw new Error(`Filing ${id} not found`);
    }

    const updateData: Prisma.ComplianceFilingUpdateInput = { status };

    if (status === "submitted") {
      updateData.submissionDate = new Date();
    }

    return prisma.complianceFiling.update({
      where: { id },
      data: updateData,
    });
  }

  static async getFilingsByStatus(
    ctx: TenantContext,
    status: FilingStatus,
  ) {
    const filings = await prisma.complianceFiling.findMany({
      where: {
        companyId: ctx.companyId,
        status,
      },
      orderBy: { dueDate: "asc" },
    });

    return filings;
  }

  static async getLateFilings(
    ctx: TenantContext,
  ) {
    const now = new Date();

    const filings = await prisma.complianceFiling.findMany({
      where: {
        companyId: ctx.companyId,
        status: {
          notIn: ["submitted", "approved", "cancelled"],
        },
        dueDate: { lt: now },
      },
      orderBy: { dueDate: "asc" },
    });

    return filings;
  }

  static async getUpcomingFilings(
    ctx: TenantContext,
    days: number = 30,
  ) {
    const now = new Date();
    const futureDate = new Date(now);
    futureDate.setDate(futureDate.getDate() + days);

    const filings = await prisma.complianceFiling.findMany({
      where: {
        companyId: ctx.companyId,
        status: {
          notIn: ["submitted", "approved", "cancelled"],
        },
        dueDate: {
          gte: now,
          lte: futureDate,
        },
      },
      orderBy: { dueDate: "asc" },
    });

    return filings;
  }
}
