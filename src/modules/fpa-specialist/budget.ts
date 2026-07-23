// ─────────────────────────────────────────────────────────────
// Enterprise FP&A Specialist — Budget Service
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  Budget,
  BudgetVersion,
  BudgetLine,
  BudgetVariance,
  GetBudgetsInput,
  CreateBudgetInput,
  GetBudgetLinesInput,
  CreateBudgetLineInput,
  UpdateBudgetLineInput,
} from "./types";

function mapBudget(r: any): Budget {
  return {
    id: r.id,
    companyId: r.companyId,
    budgetType: r.budgetType as Budget["budgetType"],
    name: r.budgetName,
    description: r.description ?? "",
    fiscalYear: r.fiscalYear,
    status: r.status,
    lockedAt: r.lockedAt ?? undefined,
    version: 1,
    metadata: (r.metadata as Record<string, unknown>) ?? undefined,
  };
}

export class BudgetService {
  static async getBudgets(ctx: TenantContext, filters?: GetBudgetsInput): Promise<{ budgets: Budget[]; total: number }> {
    const where: Record<string, unknown> = { companyId: ctx.companyId };
    if (filters?.budgetType) where.budgetType = filters.budgetType;
    if (filters?.fiscalYear) where.fiscalYear = filters.fiscalYear;
    if (filters?.status) where.status = filters.status;
    if (filters?.search) {
      where.OR = [{ budgetName: { contains: filters.search, mode: "insensitive" } }];
    }

    const limit = filters?.limit ?? 50;
    const offset = filters?.offset ?? 0;

    const [rows, total] = await Promise.all([
      prisma.budget.findMany({ where, orderBy: { createdAt: "desc" }, take: limit, skip: offset }),
      prisma.budget.count({ where }),
    ]);

    return { budgets: rows.map(mapBudget), total };
  }

  static async createBudget(ctx: TenantContext, input: CreateBudgetInput): Promise<Budget> {
    const budget = await prisma.budget.create({
      data: {
        companyId: ctx.companyId,
        budgetType: input.budgetType,
        budgetName: input.name,
        fiscalYear: input.fiscalYear,
        totalAmount: new Prisma.Decimal(0),
        status: "draft",
        metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
    return mapBudget(budget);
  }

  static async getBudgetVersions(ctx: TenantContext, budgetId: string): Promise<BudgetVersion[]> {
    const rows = await prisma.budgetVersion.findMany({
      where: { budgetId, budget: { companyId: ctx.companyId } },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((r) => ({
      id: r.id,
      budgetId: r.budgetId,
      versionNumber: parseInt(r.version, 10) || 1,
      name: r.changeDescription,
      status: "active",
      totalAmount: r.totalAmount,
      createdBy: r.approvedBy ?? undefined,
      createdAt: r.createdAt,
      metadata: (r.metadata as Record<string, unknown>) ?? undefined,
    }));
  }

  static async createVersion(ctx: TenantContext, input: { budgetId: string; name: string }): Promise<BudgetVersion> {
    const existing = await prisma.budgetVersion.findMany({ where: { budgetId: input.budgetId }, orderBy: { createdAt: "desc" }, take: 1 });
    const nextNum = existing.length > 0 ? (parseInt(existing[0].version, 10) || 0) + 1 : 1;

    const version = await prisma.budgetVersion.create({
      data: {
        companyId: ctx.companyId,
        budgetId: input.budgetId,
        version: String(nextNum),
        changeDescription: input.name,
        effectiveDate: new Date(),
        totalAmount: new Prisma.Decimal(0),
      },
    });

    return {
      id: version.id,
      budgetId: version.budgetId,
      versionNumber: nextNum,
      name: version.changeDescription,
      status: "draft",
      totalAmount: version.totalAmount,
      createdAt: version.createdAt,
    };
  }

  static async getBudgetLines(ctx: TenantContext, budgetId: string, filters?: GetBudgetLinesInput): Promise<{ lines: BudgetLine[]; total: number }> {
    const where: Record<string, unknown> = { budgetId, companyId: ctx.companyId };
    if (filters?.department) where.department = filters.department;
    if (filters?.accountCode) where.accountCode = filters.accountCode;
    if (filters?.search) {
      where.OR = [
        { accountName: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const limit = filters?.limit ?? 100;
    const offset = filters?.offset ?? 0;

    const [rows, total] = await Promise.all([
      prisma.budgetLine.findMany({ where, orderBy: { lineNumber: "asc" }, take: limit, skip: offset }),
      prisma.budgetLine.count({ where }),
    ]);

    return {
      lines: rows.map((l) => ({
        id: l.id,
        budgetId: l.budgetId,
        versionId: "",
        accountCode: l.accountCode ?? "",
        accountName: l.accountName,
        department: l.department ?? undefined,
        description: l.description ?? "",
        budgetAmount: l.budgetAmount,
        actualAmount: l.actualAmount,
        variance: l.variance,
        variancePercent: l.variancePercent,
        metadata: (l.metadata as Record<string, unknown>) ?? undefined,
      })),
      total,
    };
  }

  static async createLine(ctx: TenantContext, input: CreateBudgetLineInput): Promise<BudgetLine> {
    const count = await prisma.budgetLine.count({ where: { budgetId: input.budgetId, companyId: ctx.companyId } });
    const line = await prisma.budgetLine.create({
      data: {
        companyId: ctx.companyId,
        budgetId: input.budgetId,
        lineNumber: count + 1,
        accountCode: input.accountCode,
        accountName: input.accountName,
        category: "expense",
        department: input.department,
        description: input.description,
        budgetAmount: new Prisma.Decimal(input.budgetAmount),
        actualAmount: new Prisma.Decimal(0),
        variance: new Prisma.Decimal(0),
        variancePercent: new Prisma.Decimal(0),
        metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });

    return {
      id: line.id,
      budgetId: line.budgetId,
      versionId: "",
      accountCode: line.accountCode ?? "",
      accountName: line.accountName,
      department: line.department ?? undefined,
      description: line.description ?? "",
      budgetAmount: line.budgetAmount,
      actualAmount: line.actualAmount,
      variance: line.variance,
      variancePercent: line.variancePercent,
      metadata: (line.metadata as Record<string, unknown>) ?? undefined,
    };
  }

  static async updateLine(ctx: TenantContext, lineId: string, input: UpdateBudgetLineInput): Promise<BudgetLine> {
    const line = await prisma.budgetLine.update({
      where: { id: lineId, companyId: ctx.companyId },
      data: {
        ...(input.accountName !== undefined && { accountName: input.accountName }),
        ...(input.department !== undefined && { department: input.department }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.budgetAmount !== undefined && {
          budgetAmount: new Prisma.Decimal(input.budgetAmount),
          variance: new Prisma.Decimal(input.budgetAmount).minus(new Prisma.Decimal(0)),
        }),
        ...(input.metadata !== undefined && { metadata: input.metadata as Prisma.InputJsonValue }),
      },
    });

    return {
      id: line.id,
      budgetId: line.budgetId,
      versionId: "",
      accountCode: line.accountCode ?? "",
      accountName: line.accountName,
      department: line.department ?? undefined,
      description: line.description ?? "",
      budgetAmount: line.budgetAmount,
      actualAmount: line.actualAmount,
      variance: line.variance,
      variancePercent: line.variancePercent,
      metadata: (line.metadata as Record<string, unknown>) ?? undefined,
    };
  }

  static async lockBudget(ctx: TenantContext, budgetId: string): Promise<Budget> {
    const budget = await prisma.budget.update({
      where: { id: budgetId, companyId: ctx.companyId },
      data: { status: "locked", lockedAt: new Date() },
    });
    return mapBudget(budget);
  }

  static async getBudgetVariance(ctx: TenantContext, budgetId: string): Promise<BudgetVariance> {
    const lines = await prisma.budgetLine.findMany({
      where: { budgetId, companyId: ctx.companyId },
    });

    let totalBudget = new Prisma.Decimal(0);
    let totalActual = new Prisma.Decimal(0);
    const byDepartment: Record<string, Prisma.Decimal> = {};
    const materialVariances: BudgetLine[] = [];

    const mappedLines: BudgetLine[] = lines.map((l) => {
      totalBudget = totalBudget.plus(l.budgetAmount);
      totalActual = totalActual.plus(l.actualAmount);

      const dept = l.department ?? "unallocated";
      byDepartment[dept] = (byDepartment[dept] ?? new Prisma.Decimal(0)).plus(l.variance);

      const line: BudgetLine = {
        id: l.id,
        budgetId: l.budgetId,
        versionId: "",
        accountCode: l.accountCode ?? "",
        accountName: l.accountName,
        department: l.department ?? undefined,
        description: l.description ?? "",
        budgetAmount: l.budgetAmount,
        actualAmount: l.actualAmount,
        variance: l.variance,
        variancePercent: l.variancePercent,
        metadata: (l.metadata as Record<string, unknown>) ?? undefined,
      };

      if (l.variancePercent.abs().gt(10)) materialVariances.push(line);
      return line;
    });

    const totalVariance = totalBudget.minus(totalActual);
    const variancePercent = totalBudget.gt(0) ? totalVariance.div(totalBudget).times(100).toDecimalPlaces(2) : new Prisma.Decimal(0);

    return { totalBudget, totalActual, totalVariance, variancePercent, lines: mappedLines, byDepartment, materialVariances };
  }
}
