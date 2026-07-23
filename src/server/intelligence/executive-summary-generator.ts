import type { ExecutiveSummary, AttentionItem, Insight, Recommendation, HealthMetric } from "./types";
import { attentionQueue } from "./attention-queue";
import { businessHealthCalculator } from "./business-health-calculator";
import { riskSignalAnalyzer } from "./risk-signal-analyzer";
import { recommendationEngine } from "./recommendation-engine";
import { insightRegistry } from "./insight-registry";

export class ExecutiveSummaryGenerator {
  async generate(companyId: string): Promise<ExecutiveSummary> {
    const healths = await businessHealthCalculator.calculateHealth(companyId);
    const overallHealth = await businessHealthCalculator.calculateOverallHealth(companyId);
    const queue = await attentionQueue.getAttentionItems(companyId);
    const topRisks = await riskSignalAnalyzer.getTopRisks(companyId, 3);
    const recommendations = recommendationEngine.getTopRecommendations(companyId, 3);

    const criticalAttention = queue.filter((item) => item.priority === "critical" || item.priority === "high");

    const now = new Date();
    const startOfPeriod = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const periodLabel = this.formatPeriodLabel(now);

    return {
      period: {
        start: startOfPeriod.toISOString(),
        end: now.toISOString(),
      },
      companyId,
      overallHealth,
      criticalAttention: criticalAttention.slice(0, 5),
      topRisks,
      topOpportunities: recommendations,
      keyMetrics: overallHealth.metrics,
      generatedAt: now.toISOString(),
      periodLabel,
    };
  }

  async generateBrief(companyId: string): Promise<string> {
    const summary = await this.generate(companyId);

    const lines: string[] = [
      `# Executive Brief — ${summary.periodLabel}`,
      "",
      `## Overall Health: ${(summary.overallHealth.score * 100).toFixed(0)}% (${summary.overallHealth.trend})`,
      "",
    ];

    if (summary.criticalAttention.length > 0) {
      lines.push("## Requires Immediate Attention");
      for (const item of summary.criticalAttention) {
        lines.push(`- [${item.priority.toUpperCase()}] ${item.title}: ${item.description}`);
      }
      lines.push("");
    }

    if (summary.topRisks.length > 0) {
      lines.push("## Top Risks");
      for (const risk of summary.topRisks) {
        lines.push(`- ${risk.title} (${risk.severity})`);
      }
      lines.push("");
    }

    if (summary.topOpportunities.length > 0) {
      lines.push("## Recommended Actions");
      for (const rec of summary.topOpportunities) {
        lines.push(`- ${rec.title}: ${rec.actions.join("; ")}`);
      }
      lines.push("");
    }

    return lines.join("\n");
  }

  private formatPeriodLabel(date: Date): string {
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return "Today";
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
}

export const executiveSummaryGenerator = new ExecutiveSummaryGenerator();
