import type { Insight, Recommendation, SignalSource } from "./types";
import { insightRegistry } from "./insight-registry";
import { riskSignalAnalyzer } from "./risk-signal-analyzer";
import { opportunityDetector } from "./opportunity-detector";
import { priorityScorer } from "./priority-scorer";

export class RecommendationEngine {
  async generateRecommendations(companyId: string): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    const topRisks = await riskSignalAnalyzer.getTopRisks(companyId, 3);
    for (const risk of topRisks) {
      recommendations.push(this.riskToRecommendation(risk));
    }

    const opportunities = await opportunityDetector.detectOpportunities(companyId);
    recommendations.push(...opportunities);

    const insights = insightRegistry.getActiveInsights(companyId);
    for (const insight of insights) {
      if (insight.severity === "critical" || insight.severity === "high") {
        recommendations.push(this.insightToRecommendation(insight));
      }
    }

    recommendations.sort((a, b) => priorityScorer.getThreshold(b.priority) - priorityScorer.getThreshold(a.priority));
    return recommendations;
  }

  getTopRecommendations(companyId: string, limit = 5): Recommendation[] {
    const insights = insightRegistry.getActiveInsights(companyId);
    const threshold = priorityScorer.getThreshold("medium");

    return insights
      .filter((i) => i.status === "active" && priorityScorer.getThreshold(i.severity) >= threshold)
      .map((i) => this.insightToRecommendation(i))
      .sort((a, b) => priorityScorer.getThreshold(b.priority) - priorityScorer.getThreshold(a.priority))
      .slice(0, limit);
  }

  private riskToRecommendation(risk: Insight): Recommendation {
    return {
      id: `rec-risk-${risk.id}`,
      title: `Mitigate: ${risk.title}`,
      description: risk.description,
      priority: risk.severity,
      category: "risk",
      actions: [risk.recommendedAction],
      expectedImpact: "Reduce risk exposure and prevent potential financial loss",
      effort: "medium",
      evidenceRefs: risk.evidenceRefs,
      createdAt: new Date().toISOString(),
      expiresAt: risk.expiresAt,
      companyId: risk.companyId,
    };
  }

  private insightToRecommendation(insight: Insight): Recommendation {
    return {
      id: `rec-${insight.id}`,
      title: insight.title,
      description: insight.description,
      priority: insight.severity,
      category: insight.category,
      actions: [insight.recommendedAction],
      expectedImpact: insight.businessImpact,
      effort: "medium",
      evidenceRefs: insight.evidenceRefs,
      createdAt: new Date().toISOString(),
      expiresAt: insight.expiresAt,
      companyId: insight.companyId,
    };
  }
}

export const recommendationEngine = new RecommendationEngine();
