import type {
  ExecutiveSummary,
  Insight,
  InsightPriority,
  IntelligenceCategory,
  Recommendation,
  AttentionItem,
  BusinessHealth,
  Signal,
  SignalSource,
} from "./types";
import { insightAggregator } from "./insight-aggregator";
import { insightRegistry } from "./insight-registry";
import { riskSignalAnalyzer } from "./risk-signal-analyzer";
import { opportunityDetector } from "./opportunity-detector";
import { recommendationEngine } from "./recommendation-engine";
import { attentionQueue } from "./attention-queue";
import { businessHealthCalculator } from "./business-health-calculator";
import { executiveSummaryGenerator } from "./executive-summary-generator";
import { businessSignalCollector } from "./business-signal-collector";
import { priorityScorer } from "./priority-scorer";

export class ExecutiveIntelligenceEngine {
  async refresh(companyId: string): Promise<void> {
    await insightAggregator.aggregate(companyId);
  }

  async getInsights(companyId: string, options?: {
    minPriority?: InsightPriority;
    category?: IntelligenceCategory;
    status?: Insight["status"];
  }): Promise<Insight[]> {
    await this.ensureFresh(companyId);
    let insights = insightRegistry.getActiveInsights(companyId);

    if (options?.minPriority) {
      const rank = ["informational", "low", "medium", "high", "critical"];
      const minRank = rank.indexOf(options.minPriority);
      insights = insights.filter((i) => rank.indexOf(i.severity) >= minRank);
    }
    if (options?.category) {
      insights = insights.filter((i) => i.category === options.category);
    }
    if (options?.status) {
      insights = insights.filter((i) => i.status === options.status);
    }

    return insights.sort((a, b) => priorityScorer.compareInsights(a, b));
  }

  async getExecutiveSummary(companyId: string): Promise<ExecutiveSummary> {
    await this.ensureFresh(companyId);
    return executiveSummaryGenerator.generate(companyId);
  }

  async getRecommendations(companyId: string): Promise<Recommendation[]> {
    await this.ensureFresh(companyId);
    return recommendationEngine.generateRecommendations(companyId);
  }

  async getBusinessHealth(companyId: string): Promise<BusinessHealth[]> {
    await this.ensureFresh(companyId);
    return businessHealthCalculator.calculateHealth(companyId);
  }

  async getOverallHealth(companyId: string): Promise<BusinessHealth> {
    await this.ensureFresh(companyId);
    return businessHealthCalculator.calculateOverallHealth(companyId);
  }

  async getAttentionQueue(companyId: string): Promise<AttentionItem[]> {
    await this.ensureFresh(companyId);
    return attentionQueue.getAttentionItems(companyId);
  }

  async getSignals(companyId: string): Promise<Signal[]> {
    return businessSignalCollector.collectAll(companyId);
  }

  async acknowledgeInsight(insightId: string): Promise<void> {
    insightAggregator.acknowledgeInsight(insightId);
  }

  async dismissInsight(insightId: string): Promise<void> {
    insightAggregator.dismissInsight(insightId);
  }

  async resolveInsight(insightId: string): Promise<void> {
    insightAggregator.resolveInsight(insightId);
  }

  async generateBrief(companyId: string): Promise<string> {
    await this.ensureFresh(companyId);
    return executiveSummaryGenerator.generateBrief(companyId);
  }

  getInsightCount(companyId: string): number {
    return insightRegistry.getActiveInsights(companyId).length;
  }

  private lastRefresh = new Map<string, number>();
  private readonly refreshInterval = 60_000;

  private async ensureFresh(companyId: string): Promise<void> {
    const last = this.lastRefresh.get(companyId) ?? 0;
    if (Date.now() - last > this.refreshInterval) {
      await this.refresh(companyId);
      this.lastRefresh.set(companyId, Date.now());
    }
  }
}

export const executiveIntelligenceEngine = new ExecutiveIntelligenceEngine();
