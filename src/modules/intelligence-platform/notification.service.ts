import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { HealthAlertData, Severity, AlertType } from "./types";
import { FinancialIntegrityEngine } from "./engines/financial-integrity.engine";
import { CloseReadinessEngine } from "./engines/close-readiness.engine";
import { TreasuryIntelligenceEngine } from "./engines/treasury-intelligence.engine";
import { ComplianceIntelligenceEngine } from "./engines/compliance-intelligence.engine";

export class IntelligenceNotificationService {
  static async evaluateAndNotify(ctx: TenantContext): Promise<void> {
    const companyId = ctx.companyId;

    const [integrity, close, treasury, compliance, prevIntegrity, prevCompliance, prevClose] =
      await Promise.all([
        FinancialIntegrityEngine.calculate(ctx),
        CloseReadinessEngine.calculate(ctx),
        TreasuryIntelligenceEngine.calculate(ctx),
        ComplianceIntelligenceEngine.calculate(ctx),
        prisma.financialScore.findFirst({
          where: { companyId, scoreType: "integrity" },
          orderBy: { calculatedAt: "desc" },
          skip: 1,
        }),
        prisma.financialScore.findFirst({
          where: { companyId, scoreType: "compliance" },
          orderBy: { calculatedAt: "desc" },
          skip: 1,
        }),
        prisma.financialScore.findFirst({
          where: { companyId, scoreType: "close-readiness" },
          orderBy: { calculatedAt: "desc" },
          skip: 1,
        }),
      ]);

    const alerts: Array<{
      alertType: AlertType;
      title: string;
      message: string;
      severity: Severity;
      scoreType?: string;
      threshold?: number;
      currentValue?: number;
    }> = [];

    // integrity_drop
    if (prevIntegrity && integrity.score < prevIntegrity.score - 10) {
      alerts.push({
        alertType: "integrity_drop",
        title: "Financial Integrity Score Dropped",
        message: `Integrity score dropped from ${prevIntegrity.score} to ${integrity.score} (${Math.round(prevIntegrity.score - integrity.score)} point decrease)`,
        severity: "warning",
        scoreType: "integrity",
        threshold: prevIntegrity.score - 10,
        currentValue: integrity.score,
      });
    }

    // close_risk
    if (close.score < 50) {
      alerts.push({
        alertType: "close_risk",
        title: "Close Readiness at Risk",
        message: `Close readiness score is ${close.score}/100, below the 50 threshold`,
        severity: "critical",
        scoreType: "close-readiness",
        threshold: 50,
        currentValue: close.score,
      });
    }

    // liquidity_decline
    const liquidityComponent = treasury.components.find((c) => c.label === "Liquidity Score");
    if (liquidityComponent && liquidityComponent.value < 40) {
      alerts.push({
        alertType: "liquidity_decline",
        title: "Liquidity Declining",
        message: `Liquidity score is ${liquidityComponent.value}/100, below the 40 threshold`,
        severity: "critical",
        scoreType: "treasury-health",
        threshold: 40,
        currentValue: liquidityComponent.value,
      });
    }

    // compliance_issue
    if (prevCompliance && compliance.score < prevCompliance.score - 15) {
      alerts.push({
        alertType: "compliance_issue",
        title: "Compliance Score Dropped Significantly",
        message: `Compliance score dropped from ${prevCompliance.score} to ${compliance.score} (${Math.round(prevCompliance.score - compliance.score)} point decrease)`,
        severity: "critical",
        scoreType: "compliance",
        threshold: prevCompliance.score - 15,
        currentValue: compliance.score,
      });
    }

    // recommendation_critical
    const criticalRecs = await prisma.intelligenceRecommendation.count({
      where: { companyId, status: "active", priority: "critical" },
    });
    if (criticalRecs > 0) {
      alerts.push({
        alertType: "recommendation_critical",
        title: "Critical Recommendations Require Attention",
        message: `${criticalRecs} critical recommendation${criticalRecs > 1 ? "s" : ""} require${criticalRecs > 1 ? "" : "s"} action`,
        severity: "warning",
        threshold: 0,
        currentValue: criticalRecs,
      });
    }

    // Persist alerts
    for (const alert of alerts) {
      await prisma.healthAlert.create({
        data: {
          companyId,
          alertType: alert.alertType,
          title: alert.title,
          message: alert.message,
          severity: alert.severity,
          scoreType: alert.scoreType,
          threshold: alert.threshold,
          currentValue: alert.currentValue,
        } as any,
      });
    }
  }

  static async getAlerts(
    ctx: TenantContext,
    opts?: { alertType?: string; isResolved?: boolean; severity?: string },
  ): Promise<HealthAlertData[]> {
    const where: Record<string, unknown> = { companyId: ctx.companyId };
    if (opts?.alertType) where.alertType = opts.alertType;
    if (opts?.isResolved !== undefined) where.isResolved = opts.isResolved;
    if (opts?.severity) where.severity = opts.severity;

    const records = await prisma.healthAlert.findMany({
      where: where as any,
      orderBy: { createdAt: "desc" },
    });

    return records.map((r) => ({
      id: r.id,
      companyId: r.companyId,
      alertType: r.alertType as AlertType,
      title: r.title,
      message: r.message ?? undefined,
      severity: r.severity as Severity,
      scoreType: r.scoreType ?? undefined,
      threshold: r.threshold ?? undefined,
      currentValue: r.currentValue ?? undefined,
      isResolved: r.isResolved,
      resolvedAt: r.resolvedAt?.toISOString(),
      createdAt: r.createdAt.toISOString(),
    }));
  }

  static async resolveAlert(ctx: TenantContext, id: string): Promise<void> {
    await prisma.healthAlert.updateMany({
      where: { id, companyId: ctx.companyId },
      data: { isResolved: true, resolvedAt: new Date() },
    });
  }
}
