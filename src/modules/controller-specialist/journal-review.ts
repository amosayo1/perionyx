// ─────────────────────────────────────────────────────────────
// Enterprise Controller Specialist — Journal Review Service
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  JournalType,
  JournalRiskType,
  RiskLevel,
  JournalReviewSummary,
  JournalReviewFilter,
  CreateJournalReviewInput,
  UpdateJournalReviewInput,
  UnusualJournalParams,
  GetJournalRiskSummaryParams,
} from "./types";

const RISK_SCORE: Record<RiskLevel, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
};

export class JournalReviewService {
  // ─── List Reviews ─────────────────────────────────────────

  static async getJournalReviews(
    ctx: TenantContext,
    params?: JournalReviewFilter & { limit?: number; offset?: number },
  ) {
    const where: Prisma.JournalReviewWhereInput = {
      companyId: ctx.companyId,
    };

    if (params?.status) {
      where.status = params.status;
    }
    if (params?.journalType) {
      where.journalType = params.journalType;
    }
    if (params?.riskLevel) {
      where.riskLevel = params.riskLevel;
    }
    if (params?.reviewerId) {
      where.reviewerId = params.reviewerId;
    }
    if (params?.from || params?.to) {
      where.postingDate = {
        ...(params?.from ? { gte: new Date(params.from) } : {}),
        ...(params?.to ? { lte: new Date(params.to) } : {}),
      };
    }

    const [reviews, total] = await Promise.all([
      prisma.journalReview.findMany({
        where,
        include: {
          riskAssessments: {
            select: {
              id: true,
              riskType: true,
              severity: true,
              confidence: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: params?.limit ?? 50,
        skip: params?.offset ?? 0,
      }),
      prisma.journalReview.count({ where }),
    ]);

    return { reviews, total };
  }

  // ─── Create Review ────────────────────────────────────────

  static async createJournalReview(
    ctx: TenantContext,
    input: CreateJournalReviewInput,
  ) {
    const existing = await prisma.journalReview.findFirst({
      where: {
        companyId: ctx.companyId,
        journalId: input.journalId,
      },
    });

    if (existing) {
      throw new Error(`Journal review already exists for journal ${input.journalId}`);
    }

    return prisma.journalReview.create({
      data: {
        companyId: ctx.companyId,
        journalId: input.journalId,
        journalType: input.journalType,
        amount: input.amount,
        currency: input.currency ?? "USD",
        postingDate: input.postingDate,
        accountCode: input.accountCode,
        accountName: input.accountName,
        description: input.description ?? "",
        reference: input.reference,
        sourceSystem: input.sourceSystem ?? "gl",
        supportingDocs:
          (input.supportingDocs as unknown as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        status: "PENDING",
        riskLevel: "LOW",
      },
    });
  }

  // ─── Update Review ────────────────────────────────────────

  static async updateJournalReview(
    ctx: TenantContext,
    reviewId: string,
    input: UpdateJournalReviewInput,
  ) {
    const existing = await prisma.journalReview.findFirst({
      where: {
        id: reviewId,
        companyId: ctx.companyId,
      },
    });

    if (!existing) {
      throw new Error(`Journal review ${reviewId} not found`);
    }

    const updateData: Prisma.JournalReviewUpdateInput = {};

    if (input.status !== undefined) {
      updateData.status = input.status;
    }
    if (input.reviewerId !== undefined) {
      updateData.reviewerId = input.reviewerId;
    }
    if (input.reviewNotes !== undefined) {
      updateData.reviewNotes = input.reviewNotes;
    }
    if (input.riskLevel !== undefined) {
      updateData.riskLevel = input.riskLevel;
    }
    if (input.approvedBy !== undefined) {
      updateData.approvedBy = input.approvedBy;
      updateData.approvedAt = new Date();
    }
    if (input.metadata !== undefined) {
      updateData.metadata = input.metadata as unknown as Prisma.InputJsonValue;
    }

    return prisma.journalReview.update({
      where: { id: reviewId },
      data: updateData,
    });
  }

  // ─── Risk Assessment ──────────────────────────────────────

  static async assessJournalRisk(ctx: TenantContext, reviewId: string) {
    const review = await prisma.journalReview.findFirst({
      where: {
        id: reviewId,
        companyId: ctx.companyId,
      },
      include: {
        riskAssessments: true,
      },
    });

    if (!review) {
      throw new Error(`Journal review ${reviewId} not found`);
    }

    const flags: Array<{
      riskType: JournalRiskType;
      severity: RiskLevel;
      confidence: Prisma.Decimal;
      description: string;
    }> = [];

    const amount = review.amount as unknown as Prisma.Decimal;

    if (amount.abs().gt(100000)) {
      flags.push({
        riskType: "large",
        severity: "HIGH",
        confidence: new Prisma.Decimal(0.9),
        description: `Large journal amount: ${amount.toString()} ${review.currency}`,
      });
    }

    if (amount.abs().mod(1000).eq(0) && amount.abs().gt(0)) {
      flags.push({
        riskType: "round_amount",
        severity: "LOW",
        confidence: new Prisma.Decimal(0.6),
        description: "Round amount detected — may indicate estimation rather than precise posting",
      });
    }

    const now = new Date();
    if (review.postingDate) {
      const daysDiff = Math.floor(
        (now.getTime() - review.postingDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysDiff > 7) {
        flags.push({
          riskType: "late",
          severity: daysDiff > 30 ? "HIGH" : "MEDIUM",
          confidence: new Prisma.Decimal(Math.min(0.5 + daysDiff * 0.01, 0.95)),
          description: `Journal posted ${daysDiff} days after period — late posting`,
        });
      }
    }

    const duplicates = await prisma.journalReview.findMany({
      where: {
        companyId: ctx.companyId,
        id: { not: reviewId },
        amount: amount,
        accountCode: review.accountCode ?? undefined,
        postingDate: review.postingDate ?? undefined,
      },
    });

    if (duplicates.length > 0) {
      flags.push({
        riskType: "duplicate",
        severity: "HIGH",
        confidence: new Prisma.Decimal(0.85),
        description: `${duplicates.length} potential duplicate(s) found with matching amount, account, and date`,
      });
    }

    const existingRiskTypes = new Set(
      review.riskAssessments.map((r: { riskType: string }) => r.riskType),
    );

    const newRiskFlags: string[] = [
      ...((review.riskFlags as unknown as string[]) ?? []),
    ];

    const createdRisks = await prisma.$transaction(async (tx) => {
      const results: Array<{ id: string; riskType: string }> = [];

      for (const flag of flags) {
        if (!existingRiskTypes.has(flag.riskType)) {
          const risk = await tx.journalRisk.create({
            data: {
              companyId: ctx.companyId,
              journalReviewId: reviewId,
              riskType: flag.riskType,
              severity: flag.severity,
              confidence: flag.confidence,
              description: flag.description,
            },
          });
          results.push({ id: risk.id, riskType: flag.riskType });

          if (!newRiskFlags.includes(flag.riskType)) {
            newRiskFlags.push(flag.riskType);
          }
        }
      }

      const highestSeverity = flags.reduce<RiskLevel>(
        (max, f) =>
          RISK_SCORE[f.severity] > RISK_SCORE[max] ? f.severity : max,
        review.riskLevel as RiskLevel,
      );

      if (RISK_SCORE[highestSeverity] > RISK_SCORE[review.riskLevel as RiskLevel]) {
        await tx.journalReview.update({
          where: { id: reviewId },
          data: {
            riskLevel: highestSeverity,
            riskFlags: newRiskFlags as unknown as Prisma.InputJsonValue,
          },
        });
      }

      return results;
    });

    return {
      assessedFlags: createdRisks,
      totalFlags: flags.length,
      overallRiskLevel:
        flags.length > 0
          ? flags.reduce<RiskLevel>(
              (max, f) =>
                RISK_SCORE[f.severity] > RISK_SCORE[max] ? f.severity : max,
              "LOW",
            )
          : review.riskLevel,
    };
  }

  // ─── Risk Summary ─────────────────────────────────────────

  static async getJournalRiskSummary(
    ctx: TenantContext,
    params?: GetJournalRiskSummaryParams,
  ): Promise<JournalReviewSummary> {
    const where: Prisma.JournalReviewWhereInput = {
      companyId: ctx.companyId,
    };

    if (params?.journalType) {
      where.journalType = params.journalType;
    }
    if (params?.from || params?.to) {
      where.postingDate = {
        ...(params?.from ? { gte: new Date(params.from) } : {}),
        ...(params?.to ? { lte: new Date(params.to) } : {}),
      };
    }

    const reviews = await prisma.journalReview.findMany({
      where,
      select: {
        status: true,
        riskLevel: true,
      },
    });

    const totalReviews = reviews.length;
    const pendingReviews = reviews.filter((r: { status: string }) => r.status === "PENDING").length;
    const flaggedReviews = reviews.filter((r: { status: string }) => r.status === "FLAGGED").length;
    const approvedReviews = reviews.filter((r: { status: string }) => r.status === "APPROVED").length;

    const riskDistribution: Record<RiskLevel, number> = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0,
    };

    let totalRiskScore = 0;
    for (const r of reviews) {
      const level = r.riskLevel as RiskLevel;
      if (riskDistribution[level] !== undefined) {
        riskDistribution[level]++;
      }
      totalRiskScore += RISK_SCORE[level] ?? 0;
    }

    const averageRiskLevel =
      totalReviews > 0
        ? totalRiskScore / totalReviews
        : 0;

    return {
      totalReviews,
      pendingReviews,
      flaggedReviews,
      approvedReviews,
      riskDistribution,
      averageRiskLevel,
    };
  }

  // ─── Flag Journal ─────────────────────────────────────────

  static async flagJournal(
    ctx: TenantContext,
    reviewId: string,
    riskType: JournalRiskType,
    description: string,
  ) {
    const review = await prisma.journalReview.findFirst({
      where: {
        id: reviewId,
        companyId: ctx.companyId,
      },
    });

    if (!review) {
      throw new Error(`Journal review ${reviewId} not found`);
    }

    return prisma.$transaction(async (tx) => {
      const risk = await tx.journalRisk.create({
        data: {
          companyId: ctx.companyId,
          journalReviewId: reviewId,
          riskType,
          severity: "MEDIUM",
          confidence: new Prisma.Decimal(0.7),
          description,
        },
      });

      const existingFlags = (review.riskFlags as unknown as string[]) ?? [];
      const updatedFlags = existingFlags.includes(riskType)
        ? existingFlags
        : [...existingFlags, riskType];

      await tx.journalReview.update({
        where: { id: reviewId },
        data: {
          status: "FLAGGED",
          riskFlags: updatedFlags as unknown as Prisma.InputJsonValue,
          riskLevel:
            riskType === "policy_violation" || riskType === "duplicate"
              ? "HIGH"
              : review.riskLevel,
        },
      });

      return risk;
    });
  }

  // ─── Unusual Journals ─────────────────────────────────────

  static async getUnusualJournals(
    ctx: TenantContext,
    params?: UnusualJournalParams,
  ) {
    const lookbackDays = params?.lookbackDays ?? 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - lookbackDays);

    const where: Prisma.JournalReviewWhereInput = {
      companyId: ctx.companyId,
      postingDate: { gte: cutoffDate },
    };

    if (params?.journalType) {
      where.journalType = params.journalType;
    }

    const reviews = await prisma.journalReview.findMany({
      where,
      include: {
        riskAssessments: {
          where: { status: "OPEN" },
        },
      },
      orderBy: { amount: "desc" },
    });

    const amounts = reviews.map(
      (r: { amount: unknown }) => (r.amount as unknown as Prisma.Decimal).toNumber(),
    );
    const mean =
      amounts.length > 0
        ? amounts.reduce((a: number, b: number) => a + b, 0) / amounts.length
        : 0;
    const stdDev =
      amounts.length > 1
        ? Math.sqrt(
            amounts.reduce(
              (sum: number, val: number) => sum + Math.pow(val - mean, 2),
              0,
            ) / (amounts.length - 1),
          )
        : 0;

    const threshold = params?.threshold
      ? params.threshold.toNumber()
      : stdDev > 0
        ? mean + 2 * stdDev
        : Infinity;

    const unusual = reviews.filter(
      (r: { amount: unknown; riskAssessments: unknown[] }) => {
        const amt = (r.amount as unknown as Prisma.Decimal).toNumber();
        const hasOpenRisks = r.riskAssessments.length > 0;
        return amt > threshold || hasOpenRisks;
      },
    );

    return unusual.map(
      (r: {
        id: string;
        journalId: string;
        journalType: string;
        amount: unknown;
        currency: string;
        postingDate: Date | null;
        status: string;
        riskLevel: string;
        riskFlags: unknown;
        description: string;
        riskAssessments: unknown[];
      }) => ({
        id: r.id,
        journalId: r.journalId,
        journalType: r.journalType as JournalType,
        amount: r.amount as unknown as Prisma.Decimal,
        currency: r.currency,
        postingDate: r.postingDate,
        status: r.status,
        riskLevel: r.riskLevel,
        riskFlags: (r.riskFlags as unknown as string[]) ?? [],
        description: r.description,
        openRiskCount: (r.riskAssessments as unknown[]).length,
        flagCategories: (
          (r.riskAssessments as Array<{ riskType: string }>).map(
            (a) => a.riskType,
          ) as JournalRiskType[]
        ).filter(
          (v: JournalRiskType, i: number, a: JournalRiskType[]) =>
            a.indexOf(v) === i,
        ),
      }),
    );
  }
}
