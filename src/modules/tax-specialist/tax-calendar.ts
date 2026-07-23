// ─────────────────────────────────────────────────────────────
// Enterprise Tax Specialist — Tax Calendar Service
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  TaxDeadline,
  TaxFiling,
  GetDeadlinesInput,
  CreateDeadlineInput,
  DeadlineStatus,
  GetFilingsInput,
  CreateFilingInput,
  FilingStatus,
  DeadlineType,
  FilingType,
} from "./types";

function mapDeadline(r: any): TaxDeadline {
  return {
    id: r.id,
    companyId: r.companyId,
    jurisdictionId: r.jurisdictionId,
    deadlineType: r.deadlineType as DeadlineType,
    name: r.deadlineTitle,
    description: "",
    dueDate: r.dueDate,
    status: r.status as DeadlineStatus,
    extendedUntil: undefined,
    assignedTo: undefined,
    metadata: (r.metadata as any) ?? undefined,
  };
}

function mapFiling(r: any): TaxFiling {
  return {
    id: r.id,
    companyId: r.companyId,
    returnId: r.returnId ?? undefined,
    filingType: r.filingType as FilingType,
    name: r.filingTitle,
    jurisdictionId: r.jurisdictionId,
    taxType: r.filingType,
    period: "",
    status: r.status as FilingStatus,
    filedDate: r.submissionDate ?? undefined,
    dueDate: r.dueDate,
    confirmationNumber: undefined,
    metadata: (r.metadata as any) ?? undefined,
  };
}

export class TaxCalendarService {
  static async getDeadlines(
    ctx: TenantContext,
    filters?: GetDeadlinesInput,
  ): Promise<{ deadlines: TaxDeadline[]; total: number }> {
    const where: any = { companyId: ctx.companyId };
    if (filters?.deadlineType) where.deadlineType = filters.deadlineType;
    if (filters?.status) where.status = filters.status;
    if (filters?.jurisdictionId) where.jurisdictionId = filters.jurisdictionId;
    if (filters?.search) {
      where.OR = [{ deadlineTitle: { contains: filters.search, mode: "insensitive" } }];
    }

    const [rows, total] = await Promise.all([
      prisma.taxDeadline.findMany({
        where,
        orderBy: { dueDate: "asc" },
        take: filters?.limit ?? 50,
        skip: filters?.offset ?? 0,
      }),
      prisma.taxDeadline.count({ where }),
    ]);

    return { deadlines: rows.map(mapDeadline), total };
  }

  static async createDeadline(
    ctx: TenantContext,
    input: CreateDeadlineInput,
  ): Promise<TaxDeadline> {
    const daysUntil = Math.ceil((input.dueDate.getTime() - Date.now()) / 86400000);
    let status: string = "upcoming";
    if (daysUntil <= 0) status = "overdue";
    else if (daysUntil <= 7) status = "due_today";

    const row = await prisma.taxDeadline.create({
      data: {
        companyId: ctx.companyId,
        jurisdictionId: input.jurisdictionId,
        deadlineTitle: input.name,
        deadlineType: input.deadlineType,
        dueDate: input.dueDate,
        status,
        reminderDaysBefore: 14,
        metadata: (input.metadata as any) ?? {},
      },
    });
    return mapDeadline(row);
  }

  static async updateDeadlineStatus(
    ctx: TenantContext,
    id: string,
    status: DeadlineStatus,
  ): Promise<TaxDeadline> {
    const row = await prisma.taxDeadline.update({
      where: { id },
      data: { status },
    });
    return mapDeadline(row);
  }

  static async getUpcomingDeadlines(
    ctx: TenantContext,
    days: number = 30,
  ): Promise<TaxDeadline[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);

    const rows = await prisma.taxDeadline.findMany({
      where: {
        companyId: ctx.companyId,
        dueDate: { gte: new Date(), lte: cutoff },
        status: { not: "completed" },
      },
      orderBy: { dueDate: "asc" },
    });

    return rows.map(mapDeadline);
  }

  static async getOverdueDeadlines(
    ctx: TenantContext,
  ): Promise<TaxDeadline[]> {
    const rows = await prisma.taxDeadline.findMany({
      where: {
        companyId: ctx.companyId,
        dueDate: { lt: new Date() },
        status: { not: "completed" },
      },
      orderBy: { dueDate: "asc" },
    });

    return rows.map(mapDeadline);
  }

  static async getFilings(
    ctx: TenantContext,
    filters?: GetFilingsInput,
  ): Promise<{ filings: TaxFiling[]; total: number }> {
    const where: any = { companyId: ctx.companyId };
    if (filters?.filingType) where.filingType = filters.filingType;
    if (filters?.status) where.status = filters.status;
    if (filters?.jurisdictionId) where.jurisdictionId = filters.jurisdictionId;
    if (filters?.search) {
      where.OR = [{ filingTitle: { contains: filters.search, mode: "insensitive" } }];
    }

    const [rows, total] = await Promise.all([
      prisma.taxFiling.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: filters?.limit ?? 50,
        skip: filters?.offset ?? 0,
      }),
      prisma.taxFiling.count({ where }),
    ]);

    return { filings: rows.map(mapFiling), total };
  }

  static async createFiling(
    ctx: TenantContext,
    input: CreateFilingInput,
  ): Promise<TaxFiling> {
    const row = await prisma.taxFiling.create({
      data: {
        companyId: ctx.companyId,
        jurisdictionId: input.jurisdictionId,
        returnId: input.returnId ?? null,
        filingTitle: input.name,
        filingType: input.filingType,
        status: "pending",
        dueDate: input.dueDate,
        metadata: (input.metadata as any) ?? {},
      },
    });
    return mapFiling(row);
  }

  static async updateFilingStatus(
    ctx: TenantContext,
    id: string,
    status: FilingStatus,
  ): Promise<TaxFiling> {
    const row = await prisma.taxFiling.update({
      where: { id },
      data: {
        status,
        ...(status === "submitted" || status === "accepted" ? { submissionDate: new Date() } : {}),
      },
    });
    return mapFiling(row);
  }
}
