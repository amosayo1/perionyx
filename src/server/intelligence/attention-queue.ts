import type { AttentionItem, InsightPriority, SignalSource } from "./types";
import { insightRegistry } from "./insight-registry";
import { riskSignalAnalyzer } from "./risk-signal-analyzer";
import { prisma } from "@/server/db/prisma";

export class AttentionQueue {
  async getAttentionItems(companyId: string): Promise<AttentionItem[]> {
    const items: AttentionItem[] = [];

    const insights = insightRegistry.getActiveInsights(companyId);
    for (const insight of insights) {
      if (insight.status !== "active") continue;
      items.push({
        id: `attn-insight-${insight.id}`,
        type: "insight",
        priority: insight.severity,
        title: insight.title,
        description: insight.description,
        createdAt: insight.createdAt,
        companyId,
      });
    }

    const riskAssessment = await riskSignalAnalyzer.analyze(companyId);
    if (riskAssessment.score >= 15) {
      items.push({
        id: `attn-risk-${companyId}`,
        type: "alert",
        priority: riskAssessment.level === "critical" ? "critical" : "high",
        title: `${riskAssessment.level.charAt(0).toUpperCase() + riskAssessment.level.slice(1)} Risk Level`,
        description: `Risk score ${riskAssessment.score}. ${riskAssessment.contributingFactors.join(". ")}`,
        createdAt: new Date().toISOString(),
        companyId,
      });
    }

    const overdueApprovals = await prisma.transactionApproval.count({
      where: { transaction: { companyId }, status: "PENDING", createdAt: { lt: new Date(Date.now() - 86_400_000) } },
    });
    if (overdueApprovals > 0) {
      items.push({
        id: `attn-approval-${companyId}`,
        type: "approval",
        priority: overdueApprovals > 5 ? "critical" : "high",
        title: `${overdueApprovals} Approvals Exceeding SLA`,
        description: "Transactions requiring approval have been pending for over 24 hours.",
        actionUrl: "/approvals",
        createdAt: new Date().toISOString(),
        companyId,
      });
    }

    items.sort((a, b) => {
      const rank = { critical: 0, high: 1, medium: 2, low: 3, informational: 4 };
      return rank[a.priority] - rank[b.priority];
    });

    return items;
  }

  getCriticalAttentionCount(companyId: string): number {
    const insights = insightRegistry.getActiveInsights(companyId);
    return insights.filter((i) => i.severity === "critical" && i.status === "active").length;
  }
}

export const attentionQueue = new AttentionQueue();
