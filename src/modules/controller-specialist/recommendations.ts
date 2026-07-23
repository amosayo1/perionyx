// ─────────────────────────────────────────────────────────────
// Enterprise Controller Specialist — Recommendations Service
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  RecommendationCategory,
  RiskLevel,
  RecommendationInput,
} from "./types";

export class RecommendationsService {
  // ─── List Recommendations ──────────────────────────────────

  static async getRecommendations(
    ctx: TenantContext,
    params?: {
      category?: RecommendationCategory;
      status?: string;
      riskLevel?: RiskLevel;
      limit?: number;
      offset?: number;
    },
  ) {
    const where: Prisma.AccountingRecommendationWhereInput = {
      companyId: ctx.companyId,
    };

    if (params?.category) {
      where.category = params.category;
    }
    if (params?.status) {
      where.status = params.status;
    }
    if (params?.riskLevel) {
      where.riskLevel = params.riskLevel;
    }

    const [recommendations, total] = await Promise.all([
      prisma.accountingRecommendation.findMany({
        where,
        orderBy: [
          { priority: "desc" },
          { createdAt: "desc" },
        ],
        take: params?.limit ?? 50,
        skip: params?.offset ?? 0,
      }),
      prisma.accountingRecommendation.count({ where }),
    ]);

    return { recommendations, total };
  }

  // ─── Create Recommendation ─────────────────────────────────

  static async createRecommendation(
    ctx: TenantContext,
    input: RecommendationInput,
  ) {
    const priority = this.calculatePriority(input.riskLevel, input.confidence);

    return prisma.accountingRecommendation.create({
      data: {
        companyId: ctx.companyId,
        category: input.category,
        title: input.title,
        description: input.description,
        businessReason: input.businessReason,
        confidence: input.confidence,
        riskLevel: input.riskLevel,
        evidence:
          (input.evidence as unknown as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        affectedModules: input.affectedModules ?? [],
        requiredApprovals: input.requiredApprovals ?? [],
        status: "OPEN",
        priority,
      },
    });
  }

  // ─── Update Recommendation ─────────────────────────────────

  static async updateRecommendation(
    ctx: TenantContext,
    recId: string,
    input: {
      status?: string;
      assignedTo?: string;
      metadata?: Record<string, unknown>;
    },
  ) {
    const existing = await prisma.accountingRecommendation.findFirst({
      where: {
        id: recId,
        companyId: ctx.companyId,
      },
    });

    if (!existing) {
      throw new Error(`Recommendation ${recId} not found`);
    }

    const updateData: Prisma.AccountingRecommendationUpdateInput = {};

    if (input.status !== undefined) {
      updateData.status = input.status;
    }
    if (input.assignedTo !== undefined) {
      updateData.assignedTo = input.assignedTo;
    }
    if (input.metadata !== undefined) {
      updateData.metadata = input.metadata as unknown as Prisma.InputJsonValue;
    }

    return prisma.accountingRecommendation.update({
      where: { id: recId },
      data: updateData,
    });
  }

  // ─── Recommendation Summary ────────────────────────────────

  static async getRecommendationSummary(ctx: TenantContext) {
    const recommendations = await prisma.accountingRecommendation.findMany({
      where: {
        companyId: ctx.companyId,
      },
      select: {
        category: true,
        status: true,
        riskLevel: true,
        priority: true,
      },
    });

    const byCategory: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    const byRisk: Record<string, number> = {};

    for (const rec of recommendations) {
      byCategory[rec.category] = (byCategory[rec.category] ?? 0) + 1;
      byStatus[rec.status] = (byStatus[rec.status] ?? 0) + 1;
      byRisk[rec.riskLevel] = (byRisk[rec.riskLevel] ?? 0) + 1;
    }

    const totalOpen = byStatus["OPEN"] ?? 0;
    const totalAccepted = byStatus["ACCEPTED"] ?? 0;
    const totalImplemented = byStatus["IMPLEMENTED"] ?? 0;
    const totalRejected = byStatus["REJECTED"] ?? 0;
    const totalExpired = byStatus["EXPIRED"] ?? 0;

    const avgPriority =
      recommendations.length > 0
        ? recommendations.reduce((sum, r) => sum + r.priority, 0) /
          recommendations.length
        : 0;

    return {
      total: recommendations.length,
      totalOpen,
      totalAccepted,
      totalImplemented,
      totalRejected,
      totalExpired,
      byCategory,
      byStatus,
      byRisk,
      averagePriority: Math.round(avgPriority),
    };
  }

  // ─── Top Recommendations ───────────────────────────────────

  static async getTopRecommendations(
    ctx: TenantContext,
    limit?: number,
  ) {
    return prisma.accountingRecommendation.findMany({
      where: {
        companyId: ctx.companyId,
        status: "OPEN",
      },
      orderBy: [
        { priority: "desc" },
        { confidence: "desc" },
      ],
      take: limit ?? 10,
    });
  }

  // ─── Internal Helpers ──────────────────────────────────────

  private static calculatePriority(
    riskLevel: RiskLevel,
    confidence: Prisma.Decimal,
  ): number {
    const riskScores: Record<RiskLevel, number> = {
      LOW: 1,
      MEDIUM: 2,
      HIGH: 3,
      CRITICAL: 4,
    };

    const riskScore = riskScores[riskLevel] ?? 1;
    const confidenceScore = confidence.toNumber();

    return Math.round(riskScore * 25 * (0.5 + confidenceScore * 0.5));
  }
}
