import type { BusinessHealth, HealthMetric, IntelligenceCategory } from "./types";
import { prisma } from "@/server/db/prisma";
import { riskSignalAnalyzer } from "./risk-signal-analyzer";

export class BusinessHealthCalculator {
  async calculateHealth(companyId: string): Promise<BusinessHealth[]> {
    const categories: { category: IntelligenceCategory; calculator: () => Promise<HealthMetric[]> }[] = [
      { category: "treasury", calculator: () => this.calculateTreasuryHealth(companyId) },
      { category: "approvals", calculator: () => this.calculateApprovalHealth(companyId) },
      { category: "risk", calculator: () => this.calculateRiskHealth(companyId) },
      { category: "compliance", calculator: () => this.calculateComplianceHealth(companyId) },
      { category: "workflow", calculator: () => this.calculateWorkflowHealth(companyId) },
      { category: "operational", calculator: () => this.calculateOperationalHealth(companyId) },
    ];

    const results = await Promise.allSettled(
      categories.map(async ({ category, calculator }) => {
        const metrics = await calculator();
        const score = this.computeScore(metrics);
        return { category, metrics, score };
      }),
    );

    const healths: BusinessHealth[] = [];
    for (const result of results) {
      if (result.status === "fulfilled") {
        const { category, metrics, score } = result.value;
        healths.push({
          score,
          previousScore: score,
          trend: "stable",
          category,
          metrics,
          assessedAt: new Date().toISOString(),
        });
      }
    }

    return healths;
  }

  async calculateOverallHealth(companyId: string): Promise<BusinessHealth> {
    const healths = await this.calculateHealth(companyId);
    const overallScore = healths.length > 0
      ? healths.reduce((sum, h) => sum + h.score, 0) / healths.length
      : 0;

    const allMetrics = healths.flatMap((h) => h.metrics);
    const worsening = healths.filter((h) => h.trend === "declining").length;

    return {
      score: overallScore,
      previousScore: overallScore,
      trend: worsening > healths.length / 2 ? "declining" : worsening > 0 ? "stable" : "improving",
      category: "financial",
      metrics: allMetrics,
      assessedAt: new Date().toISOString(),
    };
  }

  private async calculateTreasuryHealth(companyId: string): Promise<HealthMetric[]> {
    const metrics: HealthMetric[] = [];

    const walletCount = await prisma.wallet.count({ where: { companyId } });
    const pendingTx = await prisma.transaction.count({ where: { companyId, status: "PENDING" } });
    const failedTx = await prisma.transaction.count({ where: { companyId, status: "FAILED" } });

    metrics.push({
      label: "Active Wallets",
      value: walletCount,
      target: Math.max(walletCount, 1),
      status: walletCount > 0 ? "on_track" : "at_risk",
      trend: "stable",
    });

    const pendingRate = walletCount > 0 ? pendingTx / walletCount : 0;
    metrics.push({
      label: "Transaction Success Rate",
      value: 100 - (failedTx / Math.max(pendingTx + failedTx, 1)) * 100,
      target: 99,
      status: failedTx > 5 ? "off_track" : failedTx > 0 ? "at_risk" : "on_track",
      trend: pendingRate > 0.5 ? "down" : "stable",
    });

    return metrics;
  }

  private async calculateApprovalHealth(companyId: string): Promise<HealthMetric[]> {
    const pending = await prisma.transactionApproval.count({
      where: { transaction: { companyId }, status: "PENDING" },
    });
    const overdue = await prisma.transactionApproval.count({
      where: { transaction: { companyId }, status: "PENDING", createdAt: { lt: new Date(Date.now() - 86_400_000) } },
    });

    return [
      {
        label: "Pending Approvals",
        value: pending,
        target: 10,
        status: pending > 15 ? "off_track" : pending > 5 ? "at_risk" : "on_track",
        trend: pending > 10 ? "up" : "stable",
      },
      {
        label: "SLA Compliance",
        value: pending > 0 ? ((pending - overdue) / pending) * 100 : 100,
        target: 95,
        status: overdue > 5 ? "off_track" : overdue > 0 ? "at_risk" : "on_track",
        trend: overdue > 0 ? "down" : "stable",
      },
    ];
  }

  private async calculateRiskHealth(companyId: string): Promise<HealthMetric[]> {
    const assessment = await riskSignalAnalyzer.analyze(companyId);

    return [
      {
        label: "Risk Score",
        value: Math.max(0, 100 - assessment.score),
        target: 80,
        status: assessment.score >= 50 ? "off_track" : assessment.score >= 20 ? "at_risk" : "on_track",
        trend: assessment.score > 0 ? "down" : "stable",
      },
      {
        label: "Open Violations",
        value: assessment.contributingFactors.length,
        target: 0,
        status: assessment.contributingFactors.length > 0 ? "at_risk" : "on_track",
        trend: assessment.contributingFactors.length > 3 ? "up" : "stable",
      },
    ];
  }

  private async calculateComplianceHealth(companyId: string): Promise<HealthMetric[]> {
    const violations = await prisma.policyViolation.count({ where: { companyId, status: "OPEN" } });
    const totalPolicies = await prisma.policy.count({ where: { companyId, enabled: true } });

    return [
      {
        label: "Policy Compliance",
        value: totalPolicies > 0 ? ((totalPolicies - violations) / totalPolicies) * 100 : 100,
        target: 95,
        status: violations > 3 ? "off_track" : violations > 0 ? "at_risk" : "on_track",
        trend: violations > 0 ? "down" : "stable",
      },
    ];
  }

  private async calculateWorkflowHealth(companyId: string): Promise<HealthMetric[]> {
    const [failed, total] = await Promise.all([
      prisma.workflowInstance.count({ where: { companyId, status: "FAILED" } }),
      prisma.workflowInstance.count({ where: { companyId } }),
    ]);

    const successRate = total > 0 ? ((total - failed) / total) * 100 : 100;

    return [
      {
        label: "Workflow Success Rate",
        value: successRate,
        target: 95,
        status: successRate < 80 ? "off_track" : successRate < 95 ? "at_risk" : "on_track",
        trend: failed > 5 ? "down" : "stable",
      },
    ];
  }

  private async calculateOperationalHealth(companyId: string): Promise<HealthMetric[]> {
    const failedSyncs = await prisma.connectorRun.count({
      where: { companyId, status: "FAILED" },
    });

    return [
      {
        label: "Connector Health",
        value: Math.max(0, 100 - failedSyncs * 5),
        target: 95,
        status: failedSyncs > 3 ? "off_track" : failedSyncs > 0 ? "at_risk" : "on_track",
        trend: failedSyncs > 0 ? "down" : "stable",
      },
    ];
  }

  private computeScore(metrics: HealthMetric[]): number {
    if (metrics.length === 0) return 0;
    const scores = metrics.map((m) => {
      if (m.status === "on_track") return 1;
      if (m.status === "at_risk") return 0.5;
      return 0;
    });
    return scores.reduce<number>((a, b) => a + b, 0) / scores.length;
  }
}

export const businessHealthCalculator = new BusinessHealthCalculator();
