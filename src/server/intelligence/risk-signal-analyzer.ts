import type { Insight, Signal } from "./types";
import { prisma } from "@/server/db/prisma";
import { insightRegistry } from "./insight-registry";

interface RiskAssessment {
  score: number;
  level: "low" | "moderate" | "elevated" | "high" | "critical";
  contributingFactors: string[];
  insights: Insight[];
}

export class RiskSignalAnalyzer {
  async analyze(companyId: string): Promise<RiskAssessment> {
    const contributingFactors: string[] = [];
    const insights: Insight[] = [];

    const [openAlerts, violations, failedSyncs, pendingApprovals] = await Promise.all([
      prisma.riskAlert.findMany({ where: { companyId, status: "OPEN" } }),
      prisma.policyViolation.findMany({ where: { companyId, status: "OPEN" } }),
      prisma.connectorRun.count({ where: { companyId, status: "FAILED" } }),
      prisma.transactionApproval.count({ where: { transaction: { companyId }, status: "PENDING", createdAt: { lt: new Date(Date.now() - 86_400_000) } } }),
    ]);

    let score = 0;

    if (openAlerts.length > 0) {
      const criticalCount = openAlerts.filter((a) => a.severity === "CRITICAL").length;
      score += criticalCount * 15 + openAlerts.length * 5;
      contributingFactors.push(`${openAlerts.length} open risk alerts (${criticalCount} critical)`);
    }

    if (violations.length > 0) {
      score += violations.length * 8;
      contributingFactors.push(`${violations.length} open policy violations`);
    }

    if (failedSyncs > 0) {
      score += failedSyncs * 3;
      contributingFactors.push(`${failedSyncs} failed connector syncs`);
    }

    if (pendingApprovals > 5) {
      score += pendingApprovals * 2;
      contributingFactors.push(`${pendingApprovals} approvals overdue >24h`);
    }

    const level = score >= 50 ? "critical" : score >= 30 ? "high" : score >= 15 ? "elevated" : score >= 5 ? "moderate" : "low";

    const riskInsights = insightRegistry.getInsightsByCategory("risk", companyId);
    insights.push(...riskInsights);

    return { score, level, contributingFactors, insights };
  }

  async getTopRisks(companyId: string, limit = 5): Promise<Insight[]> {
    const insights = insightRegistry.getInsightsByCategory("risk", companyId);
    const priorityRank = ["informational", "low", "medium", "high", "critical"];

    return insights
      .filter((i) => i.status === "active")
      .sort((a, b) => priorityRank.indexOf(b.severity) - priorityRank.indexOf(a.severity))
      .slice(0, limit);
  }
}

export const riskSignalAnalyzer = new RiskSignalAnalyzer();
