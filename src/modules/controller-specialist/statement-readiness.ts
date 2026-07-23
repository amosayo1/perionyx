// ─────────────────────────────────────────────────────────────
// Enterprise Controller Specialist — Statement Readiness Service
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  StatementType,
  StatementReadinessStatus,
  StatementReadinessSummary,
} from "./types";

const READINESS_WEIGHTS = {
  reconciledAccounts: 0.35,
  unapprovedJournals: 0.25,
  missingAdjustments: 0.20,
  outstandingReconciliations: 0.20,
} as const;

export class StatementReadinessService {
  // ─── Evaluate Readiness ────────────────────────────────────

  static async evaluateReadiness(
    ctx: TenantContext,
    period: string,
    statementType: StatementType,
  ) {
    const [journalStats, reconciliationStats, adjustmentCount, existing] =
      await Promise.all([
        prisma.journalReview.findMany({
          where: {
            companyId: ctx.companyId,
            postingDate: {
              gte: this.periodStart(period),
              lt: this.periodEnd(period),
            },
          },
          select: { status: true, riskLevel: true },
        }),
        prisma.closeTask.findMany({
          where: {
            companyId: ctx.companyId,
            category: "reconciliation",
          },
          select: { status: true, entityName: true },
        }),
        prisma.closeTask.count({
          where: {
            companyId: ctx.companyId,
            category: "journal",
            status: { in: ["PENDING", "BLOCKED"] },
            createdAt: {
              gte: this.periodStart(period),
              lt: this.periodEnd(period),
            },
          },
        }),
        prisma.statementReadiness.findUnique({
          where: {
            companyId_period_statementType: {
              companyId: ctx.companyId,
              period,
              statementType,
            },
          },
        }),
      ]);

    const totalJournals = journalStats.length;
    const unapprovedJournals = journalStats.filter(
      (j: { status: string }) =>
        j.status === "PENDING" || j.status === "FLAGGED",
    ).length;

    const totalAccounts = reconciliationStats.length;
    const reconciledAccounts = reconciliationStats.filter(
      (r: { status: string }) => r.status === "COMPLETED",
    ).length;
    const outstandingReconciliations = totalAccounts - reconciledAccounts;

    const blockingIssues: Array<{
      type: string;
      severity: string;
      description: string;
      count: number;
    }> = [];

    if (unapprovedJournals > 0) {
      blockingIssues.push({
        type: "unapproved_journals",
        severity: unapprovedJournals > 5 ? "HIGH" : "MEDIUM",
        description: `${unapprovedJournals} journal(s) pending approval or flagged for review`,
        count: unapprovedJournals,
      });
    }

    if (outstandingReconciliations > 0) {
      blockingIssues.push({
        type: "outstanding_reconciliations",
        severity:
          outstandingReconciliations > 3 ? "HIGH" : "MEDIUM",
        description: `${outstandingReconciliations} reconciliation(s) not completed`,
        count: outstandingReconciliations,
      });
    }

    if (adjustmentCount > 0) {
      blockingIssues.push({
        type: "missing_adjustments",
        severity: adjustmentCount > 3 ? "HIGH" : "LOW",
        description: `${adjustmentCount} adjustment(s) pending or blocked`,
        count: adjustmentCount,
      });
    }

    const highRiskJournals = journalStats.filter(
      (j: { riskLevel: string }) =>
        j.riskLevel === "HIGH" || j.riskLevel === "CRITICAL",
    ).length;
    if (highRiskJournals > 0) {
      blockingIssues.push({
        type: "high_risk_journals",
        severity: "HIGH",
        description: `${highRiskJournals} high/critical risk journal(s) require resolution`,
        count: highRiskJournals,
      });
    }

    const reconciledScore =
      totalAccounts > 0
        ? new Prisma.Decimal(reconciledAccounts).div(totalAccounts)
        : new Prisma.Decimal(1);

    const journalScore =
      totalJournals > 0
        ? new Prisma.Decimal(totalJournals - unapprovedJournals).div(
            totalJournals,
          )
        : new Prisma.Decimal(1);

    const adjustmentScore =
      adjustmentCount === 0
        ? new Prisma.Decimal(1)
        : new Prisma.Decimal(1)
            .div(adjustmentCount + 1)
            .toDecimalPlaces(4);

    const reconciliationOutstandingScore =
      outstandingReconciliations === 0
        ? new Prisma.Decimal(1)
        : new Prisma.Decimal(1)
            .div(outstandingReconciliations + 1)
            .toDecimalPlaces(4);

    const readinessScore = reconciledScore
      .mul(READINESS_WEIGHTS.reconciledAccounts)
      .add(journalScore.mul(READINESS_WEIGHTS.unapprovedJournals))
      .add(adjustmentScore.mul(READINESS_WEIGHTS.missingAdjustments))
      .add(
        reconciliationOutstandingScore.mul(
          READINESS_WEIGHTS.outstandingReconciliations,
        ),
      )
      .toDecimalPlaces(4);

    let status: StatementReadinessStatus;
    const scoreNum = readinessScore.toNumber();
    if (scoreNum >= 0.95 && blockingIssues.length === 0) {
      status = "READY";
    } else if (scoreNum >= 0.5) {
      status = "PARTIAL";
    } else {
      status = "NOT_READY";
    }

    const data = {
      readinessScore,
      status,
      blockingIssues: blockingIssues as unknown as Prisma.InputJsonValue,
      missingAdjustments: adjustmentCount,
      outstandingReconciliations,
      unapprovedJournals,
      totalAccounts,
      reconciledAccounts,
      lastCheckedAt: new Date(),
    };

    if (existing) {
      return prisma.statementReadiness.update({
        where: { id: existing.id },
        data,
      });
    }

    return prisma.statementReadiness.create({
      data: {
        companyId: ctx.companyId,
        period,
        statementType,
        ...data,
      },
    });
  }

  // ─── Readiness Summary ─────────────────────────────────────

  static async getReadinessSummary(
    ctx: TenantContext,
    period: string,
  ): Promise<StatementReadinessSummary> {
    const records = await prisma.statementReadiness.findMany({
      where: {
        companyId: ctx.companyId,
        period,
      },
    });

    const totalStatements = records.length;
    const readyStatements = records.filter(
      (r: { status: string }) => r.status === "READY" || r.status === "GENERATED",
    ).length;
    const partialStatements = records.filter(
      (r: { status: string }) => r.status === "PARTIAL",
    ).length;
    const notReadyStatements = records.filter(
      (r: { status: string }) => r.status === "NOT_READY",
    ).length;

    const averageReadiness =
      totalStatements > 0
        ? records.reduce(
            (sum, r) => sum + (r.readinessScore as unknown as Prisma.Decimal).toNumber(),
            0,
          ) / totalStatements
        : 0;

    return {
      totalStatements,
      readyStatements,
      partialStatements,
      notReadyStatements,
      averageReadiness: new Prisma.Decimal(averageReadiness).toDecimalPlaces(4),
    };
  }

  // ─── Blocking Issues ───────────────────────────────────────

  static async getBlockingIssues(
    ctx: TenantContext,
    period: string,
  ) {
    const records = await prisma.statementReadiness.findMany({
      where: {
        companyId: ctx.companyId,
        period,
        blockingIssues: { not: Prisma.JsonNull },
      },
      select: {
        statementType: true,
        blockingIssues: true,
        readinessScore: true,
        status: true,
      },
    });

    const allIssues: Array<{
      statementType: StatementType;
      readinessScore: Prisma.Decimal;
      status: StatementReadinessStatus;
      issues: Array<{
        type: string;
        severity: string;
        description: string;
        count: number;
      }>;
    }> = [];

    for (const record of records) {
      const issues = (record.blockingIssues as unknown as Array<{
        type: string;
        severity: string;
        description: string;
        count: number;
      }>) ?? [];

      if (issues.length > 0) {
        allIssues.push({
          statementType: record.statementType as StatementType,
          readinessScore: record.readinessScore as unknown as Prisma.Decimal,
          status: record.status as StatementReadinessStatus,
          issues,
        });
      }
    }

    return allIssues.sort((a, b) => {
      const scoreA = (a.readinessScore as unknown as Prisma.Decimal).toNumber();
      const scoreB = (b.readinessScore as unknown as Prisma.Decimal).toNumber();
      return scoreA - scoreB;
    });
  }

  // ─── Update Readiness ──────────────────────────────────────

  static async updateReadiness(
    ctx: TenantContext,
    period: string,
    statementType: StatementType,
    data: {
      status?: StatementReadinessStatus;
      metadata?: Record<string, unknown>;
    },
  ) {
    const existing = await prisma.statementReadiness.findUnique({
      where: {
        companyId_period_statementType: {
          companyId: ctx.companyId,
          period,
          statementType,
        },
      },
    });

    if (!existing) {
      throw new Error(
        `Statement readiness not found for ${statementType} in period ${period}`,
      );
    }

    const updateData: Prisma.StatementReadinessUpdateInput = {};

    if (data.status !== undefined) {
      updateData.status = data.status;
    }
    if (data.metadata !== undefined) {
      updateData.metadata = data.metadata as unknown as Prisma.InputJsonValue;
    }

    return prisma.statementReadiness.update({
      where: { id: existing.id },
      data: updateData,
    });
  }

  // ─── Readiness Trend ───────────────────────────────────────

  static async getReadinessTrend(
    ctx: TenantContext,
    periods?: number,
  ) {
    const limit = periods ?? 12;

    const records = await prisma.statementReadiness.findMany({
      where: {
        companyId: ctx.companyId,
      },
      orderBy: { createdAt: "desc" },
      take: limit * 10,
    });

    const byPeriod = new Map<
      string,
      {
        period: string;
        scores: number[];
        statuses: string[];
      }
    >();

    for (const record of records) {
      const existing = byPeriod.get(record.period);
      if (existing) {
        existing.scores.push(
          (record.readinessScore as unknown as Prisma.Decimal).toNumber(),
        );
        existing.statuses.push(record.status);
      } else {
        byPeriod.set(record.period, {
          period: record.period,
          scores: [
            (record.readinessScore as unknown as Prisma.Decimal).toNumber(),
          ],
          statuses: [record.status],
        });
      }
    }

    return Array.from(byPeriod.values())
      .slice(0, limit)
      .map((entry) => ({
        period: entry.period,
        averageScore: new Prisma.Decimal(
          entry.scores.reduce((a, b) => a + b, 0) / entry.scores.length,
        ).toDecimalPlaces(4),
        readyCount: entry.statuses.filter(
          (s) => s === "READY" || s === "GENERATED",
        ).length,
        totalStatements: entry.statuses.length,
      }));
  }

  // ─── Internal Helpers ──────────────────────────────────────

  private static periodStart(period: string): Date {
    const [year, month] = period.split("-").map(Number);
    return new Date(year, month - 1, 1);
  }

  private static periodEnd(period: string): Date {
    const [year, month] = period.split("-").map(Number);
    return new Date(year, month, 1);
  }
}
