// ─────────────────────────────────────────────────────────────
// Enterprise Audit Specialist — Continuous Audit Service
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  ContinuousAuditResult,
  ControlFailureRecord,
  MissingApprovalRecord,
  LateReconciliationRecord,
  HighRiskEventRecord,
  UnusualBehaviorRecord,
} from "./types";

export class ContinuousAuditService {
  /**
   * Run a full continuous audit scan across all domains.
   */
  static async runContinuousAudit(
    ctx: TenantContext,
  ): Promise<ContinuousAuditResult> {
    const [
      controlFailures,
      missingApprovals,
      lateReconciliations,
      highRiskEvents,
      unusualBehavior,
    ] = await Promise.all([
      this.getControlFailures(ctx),
      this.getMissingApprovals(ctx),
      this.getLateReconciliations(ctx),
      this.getHighRiskEvents(ctx),
      this.getUnusualBehavior(ctx),
    ]);

    const issueCount =
      controlFailures.length +
      missingApprovals.length +
      lateReconciliations.length +
      highRiskEvents.length +
      unusualBehavior.length;

    const overallScore = new Prisma.Decimal(1)
      .sub(new Prisma.Decimal(issueCount * 0.02))
      .toDecimalPlaces(4);

    const clampedScore = overallScore.lt(0)
      ? new Prisma.Decimal(0)
      : overallScore;

    return {
      runDate: new Date(),
      controlFailures,
      missingApprovals,
      lateReconciliations,
      highRiskEvents,
      unusualBehavior,
      overallScore: clampedScore,
    };
  }

  /**
   * Get historical continuous audit results from audit log.
   */
  static async getAuditResults(
    ctx: TenantContext,
  ) {
    return prisma.auditLog.findMany({
      where: {
        companyId: ctx.companyId,
        action: "continuous_audit_run",
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
  }

  /**
   * Detect control failures — controls that have failed recently.
   */
  static async getControlFailures(
    ctx: TenantContext,
  ): Promise<ControlFailureRecord[]> {
    const failures = await prisma.controlTest.findMany({
      where: {
        companyId: ctx.companyId,
        result: "ineffective",
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      include: {
        control: {
          select: { controlName: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const byControl: Record<
      string,
      { name: string; count: number; lastFailure: Date }
    > = {};

    for (const f of failures) {
      const key = f.controlId;
      if (!byControl[key]) {
        byControl[key] = {
          name: f.control?.controlName ?? "Unknown",
          count: 0,
          lastFailure: f.createdAt,
        };
      }
      byControl[key].count++;
    }

    return Object.entries(byControl).map(([controlId, data]) => ({
      controlId,
      controlName: data.name,
      failureCount: data.count,
      lastFailure: data.lastFailure,
      severity: data.count >= 5 ? "critical" : data.count >= 3 ? "high" : "medium",
    }));
  }

  /**
   * Detect missing approvals — transactions with pending approvals past due.
   */
  static async getMissingApprovals(
    ctx: TenantContext,
  ): Promise<MissingApprovalRecord[]> {
    const pendingApprovals = await prisma.transactionApproval.findMany({
      where: {
        companyId: ctx.companyId,
        status: "pending",
      },
      include: {
        transaction: {
          select: { id: true, primaryAmount: true, type: true },
        },
      },
      take: 50,
    });

    return pendingApprovals.map((a) => ({
      transactionId: a.transactionId,
      amount: a.transaction?.primaryAmount ?? new Prisma.Decimal(0),
      type: a.transaction?.type ?? "unknown",
      expectedApprover: a.approvingUserId ?? "unassigned",
      daysOverdue: Math.floor(
        (Date.now() - a.createdAt.getTime()) / (1000 * 60 * 60 * 24),
      ),
    }));
  }

  /**
   * Detect late reconciliations — reconciliation cases past due date.
   */
  static async getLateReconciliations(
    ctx: TenantContext,
  ): Promise<LateReconciliationRecord[]> {
    const lateCases = await prisma.reconciliationCase.findMany({
      where: {
        companyId: ctx.companyId,
        status: { in: ["OPEN", "IN_PROGRESS", "EXCEPTION"] },
        dueDate: { lt: new Date() },
      },
      orderBy: { dueDate: "asc" },
      take: 50,
    });

    return lateCases.map((r) => ({
      reconciliationId: r.id,
      accountName: r.title,
      dueDate: r.dueDate!,
      daysLate: Math.floor(
        (Date.now() - r.dueDate!.getTime()) / (1000 * 60 * 60 * 24),
      ),
      amount: r.totalDebit.add(r.totalCredit),
    }));
  }

  /**
   * Detect high-risk events — transactions with high amounts or unusual patterns.
   */
  static async getHighRiskEvents(
    ctx: TenantContext,
  ): Promise<HighRiskEventRecord[]> {
    const recentTransactions = await prisma.transaction.findMany({
      where: {
        companyId: ctx.companyId,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { primaryAmount: "desc" },
      take: 50,
    });

    // Flag transactions with amounts significantly above median
    const amounts = recentTransactions.map((t) => t.primaryAmount.toNumber());
    const sortedAmounts = [...amounts].sort((a, b) => a - b);
    const median = sortedAmounts[Math.floor(sortedAmounts.length / 2)] ?? 0;
    const threshold = median * 5;

    return recentTransactions
      .filter((t) => t.primaryAmount.toNumber() > threshold && threshold > 0)
      .map((t) => ({
        eventId: t.id,
        eventType: t.type,
        description: t.reference ?? "High-value transaction",
        amount: t.primaryAmount,
        riskScore: new Prisma.Decimal(
          Math.min(t.primaryAmount.toNumber() / (threshold * 2), 1),
        ).toDecimalPlaces(4),
        timestamp: t.createdAt,
      }));
  }

  /**
   * Detect unusual behavior — audit log entries with unusual patterns.
   */
  static async getUnusualBehavior(
    ctx: TenantContext,
  ): Promise<UnusualBehaviorRecord[]> {
    const recentLogs = await prisma.auditLog.findMany({
      where: {
        companyId: ctx.companyId,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    const byUser: Record<string, { count: number; timestamps: Date[]; actions: string[] }> = {};

    for (const log of recentLogs) {
      const key = log.actorUserId ?? "system";
      if (!byUser[key]) {
        byUser[key] = { count: 0, timestamps: [], actions: [] };
      }
      byUser[key].count++;
      byUser[key].timestamps.push(log.createdAt);
      byUser[key].actions.push(log.action);
    }

    const unusual: UnusualBehaviorRecord[] = [];

    for (const [userId, data] of Object.entries(byUser)) {
      if (data.count > 50) {
        unusual.push({
          userId,
          userName: userId,
          behaviorType: "high_volume_activity",
          description: `${data.count} actions in the past 7 days`,
          riskScore: new Prisma.Decimal(Math.min(data.count / 100, 1)).toDecimalPlaces(4),
          detectedAt: new Date(),
        });
      }

      const afterHoursActions = data.timestamps.filter((t) => {
        const hour = t.getHours();
        return hour >= 0 && hour < 6;
      });

      if (afterHoursActions.length >= 3) {
        unusual.push({
          userId,
          userName: userId,
          behaviorType: "after_hours_activity",
          description: `${afterHoursActions.length} actions during off-hours (midnight-6 AM)`,
          riskScore: new Prisma.Decimal(0.6).toDecimalPlaces(4),
          detectedAt: new Date(),
        });
      }
    }

    return unusual;
  }
}
