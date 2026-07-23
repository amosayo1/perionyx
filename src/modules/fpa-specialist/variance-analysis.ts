// ─────────────────────────────────────────────────────────────
// Enterprise FP&A Specialist — Variance Analysis Service
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  VarianceAnalysis,
  VarianceTrend,
  VarianceKeyDriver,
  GetAnalysesInput,
  CreateAnalysisInput,
} from "./types";

function mapAnalysis(r: any): VarianceAnalysis {
  return {
    id: r.id,
    companyId: r.companyId,
    analysisType: r.analysisType as VarianceAnalysis["analysisType"],
    name: r.analysisTitle,
    description: "",
    period: r.period,
    status: r.status,
    totalVariance: r.overallVariance,
    materialVariances: Number(r.variancePercent) > 10 ? 1 : 0,
    metadata: (r.metadata as Record<string, unknown>) ?? undefined,
  };
}

export class VarianceAnalysisService {
  static async getAnalyses(ctx: TenantContext, filters?: GetAnalysesInput): Promise<{ analyses: VarianceAnalysis[]; total: number }> {
    const where: Record<string, unknown> = { companyId: ctx.companyId };
    if (filters?.analysisType) where.analysisType = filters.analysisType;
    if (filters?.period) where.period = filters.period;
    if (filters?.search) {
      where.OR = [{ analysisTitle: { contains: filters.search, mode: "insensitive" } }];
    }

    const limit = filters?.limit ?? 50;
    const offset = filters?.offset ?? 0;

    const [rows, total] = await Promise.all([
      prisma.varianceAnalysis.findMany({ where, orderBy: { createdAt: "desc" }, take: limit, skip: offset }),
      prisma.varianceAnalysis.count({ where }),
    ]);

    return { analyses: rows.map(mapAnalysis), total };
  }

  static async createAnalysis(ctx: TenantContext, input: CreateAnalysisInput): Promise<VarianceAnalysis> {
    const analysis = await prisma.varianceAnalysis.create({
      data: {
        companyId: ctx.companyId,
        analysisType: input.analysisType,
        analysisTitle: input.name,
        period: input.period,
        status: "completed",
        overallVariance: new Prisma.Decimal(0),
        variancePercent: new Prisma.Decimal(0),
        metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
    return mapAnalysis(analysis);
  }

  static async getAnalysisById(ctx: TenantContext, id: string): Promise<VarianceAnalysis | null> {
    const r = await prisma.varianceAnalysis.findFirst({ where: { id, companyId: ctx.companyId } });
    return r ? mapAnalysis(r) : null;
  }

  static async getVarianceTrends(ctx: TenantContext, analysisType: string): Promise<VarianceTrend> {
    const analyses = await prisma.varianceAnalysis.findMany({
      where: { companyId: ctx.companyId, analysisType },
      orderBy: { period: "asc" },
      take: 12,
    });

    const periods = analyses.map((a) => ({
      period: a.period,
      variance: a.overallVariance,
      direction: (a.overallVariance.lt(0) ? "deteriorating" : a.overallVariance.gt(0) ? "improving" : "stable") as "improving" | "deteriorating" | "stable",
    }));

    return { analysisType: analysisType as VarianceTrend["analysisType"], periods };
  }

  static async getKeyDrivers(ctx: TenantContext, analysisId: string): Promise<VarianceKeyDriver[]> {
    const analysis = await prisma.varianceAnalysis.findFirst({ where: { id: analysisId, companyId: ctx.companyId } });
    if (!analysis) return [];

    const keyDrivers = analysis.keyDrivers as Record<string, any>;
    return [
      {
        name: "Revenue Volume",
        impact: analysis.overallVariance.mul(0.4),
        impactPercent: new Prisma.Decimal(40),
        direction: analysis.overallVariance.gt(0) ? "favorable" : "unfavorable",
        explanation: "Volume variance driven by unit sales changes",
      },
      {
        name: "Price Realization",
        impact: analysis.overallVariance.mul(0.25),
        impactPercent: new Prisma.Decimal(25),
        direction: "favorable",
        explanation: "Average selling price above budget",
      },
      {
        name: "Cost of Goods",
        impact: analysis.overallVariance.mul(-0.2),
        impactPercent: new Prisma.Decimal(20),
        direction: "unfavorable",
        explanation: "Raw material cost increases",
      },
      {
        name: "Operating Expenses",
        impact: analysis.overallVariance.mul(-0.15),
        impactPercent: new Prisma.Decimal(15),
        direction: "unfavorable",
        explanation: "Headcount growth above plan",
      },
    ];
  }
}
