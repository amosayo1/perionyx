// ─────────────────────────────────────────────────────────────
// Enterprise Controller Specialist — Accounting Health Service
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  AccountingExceptionType,
  RiskLevel,
  AccountingHealthSummary,
} from "./types";

export class AccountingHealthService {
  // ─── Capture Snapshot ──────────────────────────────────────

  static async captureSnapshot(ctx: TenantContext, period: string) {
    const [integrity, journalQuality, policyCompliance, exceptionCounts] =
      await Promise.all([
        this.evaluateIntegrity(ctx),
        this.evaluateJournalQuality(ctx),
        this.evaluatePolicyCompliance(ctx),
        this.countExceptions(ctx),
      ]);

    const healthScore = integrity.ledgerConsistency
      .mul(0.30)
      .add(journalQuality.qualityScore.mul(0.25))
      .add(policyCompliance.complianceScore.mul(0.25))
      .add(integrity.postingCompleteness.mul(0.20))
      .toDecimalPlaces(4);

    const riskScore = new Prisma.Decimal(1)
      .sub(healthScore)
      .toDecimalPlaces(4);

    const trends = (await this.getHealthTrend(ctx, 6)).map((t) => ({
      date: t.date,
      healthScore: t.healthScore,
      riskScore: t.riskScore,
    }));

    const existing = await prisma.accountingHealthSnapshot.findUnique({
      where: {
        companyId_snapshotDate: {
          companyId: ctx.companyId,
          snapshotDate: this.startOfDay(new Date()),
        },
      },
    });

    const data = {
      period,
      healthScore,
      riskScore,
      integrityScore: integrity.ledgerConsistency
        .add(integrity.postingCompleteness)
        .div(2)
        .toDecimalPlaces(4),
      ledgerConsistency: integrity.ledgerConsistency,
      journalQuality: journalQuality.qualityScore,
      reconciliationCompletion: journalQuality.reconciliationCompletion,
      policyCompliance: policyCompliance.complianceScore,
      postingCompleteness: integrity.postingCompleteness,
      duplicatePostings: exceptionCounts.duplicatePostings,
      suspenseAccounts: exceptionCounts.suspenseAccounts,
      openExceptions: exceptionCounts.openExceptions,
      trends: trends as unknown as Prisma.InputJsonValue,
    };

    if (existing) {
      return prisma.accountingHealthSnapshot.update({
        where: { id: existing.id },
        data,
      });
    }

    return prisma.accountingHealthSnapshot.create({
      data: {
        companyId: ctx.companyId,
        snapshotDate: new Date(),
        ...data,
      },
    });
  }

  // ─── Latest Snapshot ───────────────────────────────────────

  static async getLatestSnapshot(
    ctx: TenantContext,
    period?: string,
  ) {
    const where: Prisma.AccountingHealthSnapshotWhereInput = {
      companyId: ctx.companyId,
    };

    if (period) {
      where.period = period;
    }

    return prisma.accountingHealthSnapshot.findFirst({
      where,
      orderBy: { snapshotDate: "desc" },
    });
  }

  // ─── Health Trend ──────────────────────────────────────────

  static async getHealthTrend(
    ctx: TenantContext,
    periods?: number,
  ): Promise<AccountingHealthSummary["trends"]> {
    const limit = periods ?? 12;

    const snapshots = await prisma.accountingHealthSnapshot.findMany({
      where: {
        companyId: ctx.companyId,
      },
      orderBy: { snapshotDate: "desc" },
      take: limit,
    });

    return snapshots.reverse().map((s) => ({
      date: s.snapshotDate.toISOString(),
      healthScore: s.healthScore as unknown as Prisma.Decimal,
      riskScore: s.riskScore as unknown as Prisma.Decimal,
    }));
  }

  // ─── Evaluate Integrity ────────────────────────────────────

  static async evaluateIntegrity(ctx: TenantContext) {
    const [totalJournals, unbalancedJournals, pendingTasks] =
      await Promise.all([
        prisma.journalReview.count({
          where: { companyId: ctx.companyId },
        }),
        prisma.journalReview.count({
          where: {
            companyId: ctx.companyId,
            status: "FLAGGED",
            riskFlags: { array_contains: "unbalanced_entry" },
          },
        }),
        prisma.closeTask.count({
          where: {
            companyId: ctx.companyId,
            category: "reconciliation",
            status: { notIn: ["COMPLETED", "SKIPPED"] },
          },
        }),
      ]);

    const ledgerConsistency =
      totalJournals > 0
        ? new Prisma.Decimal(totalJournals - unbalancedJournals)
            .div(totalJournals)
            .toDecimalPlaces(4)
        : new Prisma.Decimal(1);

    const postingCompleteness =
      totalJournals > 0
        ? new Prisma.Decimal(
            totalJournals -
              (await prisma.journalReview.count({
                where: {
                  companyId: ctx.companyId,
                  status: "PENDING",
                },
              })),
          )
            .div(totalJournals)
            .toDecimalPlaces(4)
        : new Prisma.Decimal(1);

    return {
      ledgerConsistency,
      postingCompleteness,
      unbalancedJournals,
      pendingReconciliations: pendingTasks,
    };
  }

  // ─── Evaluate Journal Quality ──────────────────────────────

  static async evaluateJournalQuality(ctx: TenantContext) {
    const reviews = await prisma.journalReview.findMany({
      where: { companyId: ctx.companyId },
      select: {
        status: true,
        riskLevel: true,
        riskFlags: true,
        amount: true,
      },
    });

    const total = reviews.length;
    if (total === 0) {
      return {
        qualityScore: new Prisma.Decimal(1),
        reconciliationCompletion: new Prisma.Decimal(1),
        flaggedRate: new Prisma.Decimal(0),
        highRiskRate: new Prisma.Decimal(0),
      };
    }

    const flagged = reviews.filter(
      (r: { status: string }) => r.status === "FLAGGED",
    ).length;
    const highRisk = reviews.filter(
      (r: { riskLevel: string }) =>
        r.riskLevel === "HIGH" || r.riskLevel === "CRITICAL",
    ).length;

    const flaggedRate = new Prisma.Decimal(flagged).div(total).toDecimalPlaces(4);
    const highRiskRate = new Prisma.Decimal(highRisk)
      .div(total)
      .toDecimalPlaces(4);

    const qualityScore = new Prisma.Decimal(1)
      .sub(flaggedRate.mul(0.5))
      .sub(highRiskRate.mul(0.3))
      .toDecimalPlaces(4);

    const completedReconciliations = await prisma.closeTask.count({
      where: {
        companyId: ctx.companyId,
        category: "reconciliation",
        status: "COMPLETED",
      },
    });
    const totalReconciliations = await prisma.closeTask.count({
      where: {
        companyId: ctx.companyId,
        category: "reconciliation",
      },
    });

    const reconciliationCompletion =
      totalReconciliations > 0
        ? new Prisma.Decimal(completedReconciliations)
            .div(totalReconciliations)
            .toDecimalPlaces(4)
        : new Prisma.Decimal(1);

    return {
      qualityScore,
      reconciliationCompletion,
      flaggedRate,
      highRiskRate,
    };
  }

  // ─── Evaluate Policy Compliance ────────────────────────────

  static async evaluatePolicyCompliance(ctx: TenantContext) {
    const [totalJournals, policyViolations, lateJournals, largeJournals] =
      await Promise.all([
        prisma.journalReview.count({
          where: { companyId: ctx.companyId },
        }),
        prisma.journalReview.count({
          where: {
            companyId: ctx.companyId,
            riskFlags: { array_contains: "policy_violation" },
          },
        }),
        prisma.journalReview.count({
          where: {
            companyId: ctx.companyId,
            riskFlags: { array_contains: "late" },
          },
        }),
        prisma.journalReview.count({
          where: {
            companyId: ctx.companyId,
            riskFlags: { array_contains: "large" },
          },
        }),
      ]);

    const totalViolations = policyViolations + lateJournals + largeJournals;

    const complianceScore =
      totalJournals > 0
        ? new Prisma.Decimal(totalJournals - totalViolations)
            .div(totalJournals)
            .toDecimalPlaces(4)
        : new Prisma.Decimal(1);

    return {
      complianceScore,
      policyViolations,
      lateJournals,
      largeJournals,
      totalViolations,
    };
  }

  // ─── Accounting Exceptions ─────────────────────────────────

  static async getAccountingExceptions(
    ctx: TenantContext,
    params?: {
      exceptionType?: AccountingExceptionType;
      severity?: RiskLevel;
      status?: string;
      limit?: number;
      offset?: number;
    },
  ) {
    const where: Prisma.AccountingExceptionWhereInput = {
      companyId: ctx.companyId,
    };

    if (params?.exceptionType) {
      where.exceptionType = params.exceptionType;
    }
    if (params?.severity) {
      where.severity = params.severity;
    }
    if (params?.status) {
      where.status = params.status;
    }

    const [exceptions, total] = await Promise.all([
      prisma.accountingException.findMany({
        where,
        orderBy: [
          { severity: "desc" },
          { createdAt: "desc" },
        ],
        take: params?.limit ?? 50,
        skip: params?.offset ?? 0,
      }),
      prisma.accountingException.count({ where }),
    ]);

    return { exceptions, total };
  }

  static async createAccountingException(
    ctx: TenantContext,
    input: {
      exceptionType: AccountingExceptionType;
      severity?: RiskLevel;
      sourceSystem?: string;
      referenceId?: string;
      referenceType?: string;
      description: string;
      amount?: Prisma.Decimal;
      currency?: string;
      assignedTo?: string;
      evidence?: string[];
      metadata?: Record<string, unknown>;
    },
  ) {
    return prisma.accountingException.create({
      data: {
        companyId: ctx.companyId,
        exceptionType: input.exceptionType,
        severity: input.severity ?? "MEDIUM",
        status: "OPEN",
        sourceSystem: input.sourceSystem ?? "gl",
        referenceId: input.referenceId,
        referenceType: input.referenceType,
        description: input.description,
        amount: input.amount,
        currency: input.currency,
        assignedTo: input.assignedTo,
        evidence:
          (input.evidence as unknown as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        metadata:
          (input.metadata as unknown as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      },
    });
  }

  // ─── Internal Helpers ──────────────────────────────────────

  private static async countExceptions(ctx: TenantContext) {
    const [duplicatePostings, suspenseAccounts, openExceptions] =
      await Promise.all([
        prisma.accountingException.count({
          where: {
            companyId: ctx.companyId,
            exceptionType: "duplicate_posting",
            status: { notIn: ["RESOLVED", "DISMISSED"] },
          },
        }),
        prisma.accountingException.count({
          where: {
            companyId: ctx.companyId,
            exceptionType: "suspense_account",
            status: { notIn: ["RESOLVED", "DISMISSED"] },
          },
        }),
        prisma.accountingException.count({
          where: {
            companyId: ctx.companyId,
            status: { notIn: ["RESOLVED", "DISMISSED"] },
          },
        }),
      ]);

    return { duplicatePostings, suspenseAccounts, openExceptions };
  }

  private static startOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }
}
