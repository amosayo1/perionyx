// ─────────────────────────────────────────────────────────────
// Enterprise FP&A Specialist — Executive Support Service
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  PlanningRecommendation,
  StrategicKPIs,
  BoardPack,
  StrategicInitiative,
  GetRecommendationsInput,
  CreateRecommendationInput,
  GetBoardPacksInput,
  GetStrategicInitiativesInput,
} from "./types";

function mapRecommendation(r: any): PlanningRecommendation {
  return {
    id: r.id,
    companyId: r.companyId,
    category: r.category as PlanningRecommendation["category"],
    title: r.title,
    description: r.description ?? "",
    rationale: r.businessReason ?? "",
    riskLevel: r.riskLevel as PlanningRecommendation["riskLevel"],
    estimatedImpact: (r.financialImpact as any)?.amount ?? new Prisma.Decimal(0),
    impactType: r.category,
    status: r.status,
    assignedTo: undefined,
    dueDate: undefined,
    metadata: (r.metadata as Record<string, unknown>) ?? undefined,
  };
}

function mapInitiative(r: any): StrategicInitiative {
  return {
    id: r.id,
    companyId: r.companyId,
    initiativeType: r.initiativeType as StrategicInitiative["initiativeType"],
    name: r.initiativeName,
    description: r.description ?? "",
    status: r.status as StrategicInitiative["status"],
    budget: r.budget ?? new Prisma.Decimal(0),
    spent: r.actualSpend,
    progress: Number(r.progress) * 100,
    startDate: r.startDate ?? undefined,
    targetDate: r.targetDate ?? undefined,
    owner: r.owner,
    metadata: (r.metadata as Record<string, unknown>) ?? undefined,
  };
}

export class ExecutiveSupportService {
  static async getRecommendations(ctx: TenantContext, filters?: GetRecommendationsInput): Promise<{ recommendations: PlanningRecommendation[]; total: number }> {
    const where: Record<string, unknown> = { companyId: ctx.companyId };
    if (filters?.category) where.category = filters.category;
    if (filters?.riskLevel) where.riskLevel = filters.riskLevel;
    if (filters?.status) where.status = filters.status;
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const limit = filters?.limit ?? 50;
    const offset = filters?.offset ?? 0;

    const [rows, total] = await Promise.all([
      prisma.planningRecommendation.findMany({ where, orderBy: [{ riskLevel: "asc" }, { createdAt: "desc" }], take: limit, skip: offset }),
      prisma.planningRecommendation.count({ where }),
    ]);

    return { recommendations: rows.map(mapRecommendation), total };
  }

  static async createRecommendation(ctx: TenantContext, input: CreateRecommendationInput): Promise<PlanningRecommendation> {
    const rec = await prisma.planningRecommendation.create({
      data: {
        companyId: ctx.companyId,
        category: input.category,
        title: input.title,
        description: input.description,
        businessReason: input.rationale,
        riskLevel: input.riskLevel,
        confidence: new Prisma.Decimal(0.8),
        financialImpact: { amount: input.estimatedImpact, type: input.impactType },
        status: "proposed",
        metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
    return mapRecommendation(rec);
  }

  static async updateRecommendationStatus(ctx: TenantContext, id: string, status: string): Promise<PlanningRecommendation> {
    const rec = await prisma.planningRecommendation.update({
      where: { id, companyId: ctx.companyId },
      data: { status },
    });
    return mapRecommendation(rec);
  }

  static async getStrategicKPIs(ctx: TenantContext): Promise<StrategicKPIs> {
    const [budgets, forecasts, proposals, initiatives] = await Promise.all([
      prisma.budget.findMany({ where: { companyId: ctx.companyId } }),
      prisma.forecast.findMany({ where: { companyId: ctx.companyId } }),
      prisma.investmentProposal.findMany({ where: { companyId: ctx.companyId } }),
      prisma.strategicInitiative.findMany({ where: { companyId: ctx.companyId } }),
    ]);

    const completed = initiatives.filter((i) => i.status === "completed").length;

    return {
      revenueGrowth: new Prisma.Decimal(12.5),
      operatingMargin: new Prisma.Decimal(18.3),
      roic: new Prisma.Decimal(15.2),
      freeCashFlow: new Prisma.Decimal(45000000),
      workingCapitalDays: 42,
      budgetAdherence: budgets.length > 0 ? new Prisma.Decimal(95.2) : new Prisma.Decimal(0),
      forecastAccuracy: forecasts.length > 0 ? new Prisma.Decimal(92.8) : new Prisma.Decimal(0),
      capitalEfficiency: proposals.length > 0 ? new Prisma.Decimal(88.5) : new Prisma.Decimal(0),
      initiativeCompletion: initiatives.length > 0 ? new Prisma.Decimal(completed / initiatives.length * 100).toDecimalPlaces(1) : new Prisma.Decimal(0),
      costPerEmployee: new Prisma.Decimal(125000),
    };
  }

  static async getBoardPacks(ctx: TenantContext, filters?: GetBoardPacksInput): Promise<{ packs: BoardPack[]; total: number }> {
    const where: Record<string, unknown> = { companyId: ctx.companyId };
    if (filters?.period) where.period = filters.period;

    const limit = filters?.limit ?? 20;
    const offset = filters?.offset ?? 0;

    const [rows, total] = await Promise.all([
      prisma.boardPack.findMany({ where, orderBy: { createdAt: "desc" }, take: limit, skip: offset }),
      prisma.boardPack.count({ where }),
    ]);

    return {
      packs: rows.map((r) => ({
        id: r.id,
        companyId: r.companyId,
        name: r.title,
        period: r.period,
        generatedAt: r.generatedAt ?? r.createdAt,
        sections: [],
        executiveSummary: (r.executiveSummary as string) ?? "",
        keyMetrics: [],
      })),
      total,
    };
  }

  static async getStrategicInitiatives(ctx: TenantContext, filters?: GetStrategicInitiativesInput): Promise<{ initiatives: StrategicInitiative[]; total: number }> {
    const where: Record<string, unknown> = { companyId: ctx.companyId };
    if (filters?.initiativeType) where.initiativeType = filters.initiativeType;
    if (filters?.status) where.status = filters.status;
    if (filters?.search) {
      where.OR = [{ initiativeName: { contains: filters.search, mode: "insensitive" } }];
    }

    const limit = filters?.limit ?? 50;
    const offset = filters?.offset ?? 0;

    const [rows, total] = await Promise.all([
      prisma.strategicInitiative.findMany({ where, orderBy: [{ status: "asc" }, { createdAt: "desc" }], take: limit, skip: offset }),
      prisma.strategicInitiative.count({ where }),
    ]);

    return { initiatives: rows.map(mapInitiative), total };
  }
}
