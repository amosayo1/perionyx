import type { OptimizationRecommendation, OptimizationSummary, OptimizationConfig, RecommendationLifecycle, OptimizationCategory, OptimizationPriority } from "./types";
import { DEFAULT_OPTIMIZATION_CONFIG, OPTIMIZATION_CATEGORY_LABELS } from "./types";
import { optimizationEvidenceCollector } from "./optimization-evidence-collector";
import { optimizationRecommendationEngine } from "./optimization-recommendation-engine";
import { optimizationAuditService } from "./optimization-audit-service";
import { optimizationCache } from "./optimization-cache";
import { optimizationScheduler } from "./optimization-scheduler";
import { optimizationRegistry } from "./optimization-registry";

export class EnterpriseOptimizationEngine {
  private configs = new Map<string, OptimizationConfig>();

  setConfig(tenantId: string, config: Partial<OptimizationConfig>): void {
    const existing = this.configs.get(tenantId) ?? DEFAULT_OPTIMIZATION_CONFIG;
    this.configs.set(tenantId, { ...existing, ...config });
    optimizationScheduler.setConfig(tenantId, config);
  }

  getConfig(tenantId: string): OptimizationConfig {
    return this.configs.get(tenantId) ?? DEFAULT_OPTIMIZATION_CONFIG;
  }

  async start(tenantId: string, companyId: string): Promise<void> {
    await optimizationScheduler.start(tenantId, companyId);
  }

  stop(tenantId: string): void {
    optimizationScheduler.stop(tenantId);
  }

  async runAnalysis(tenantId: string, companyId: string): Promise<OptimizationRecommendation[]> {
    const config = this.configs.get(tenantId) ?? DEFAULT_OPTIMIZATION_CONFIG;
    return optimizationScheduler.runAnalysis(tenantId, companyId, config);
  }

  getRecommendations(companyId: string): OptimizationRecommendation[] {
    const cached = optimizationCache.getRecommendations(companyId);
    if (cached) return cached;
    return [];
  }

  getRecommendationsByPriority(companyId: string, priority: OptimizationPriority): OptimizationRecommendation[] {
    return this.getRecommendations(companyId).filter((r) => r.priority === priority);
  }

  getRecommendationsByCategory(companyId: string, category: OptimizationCategory): OptimizationRecommendation[] {
    return this.getRecommendations(companyId).filter((r) => r.category === category);
  }

  getRecommendationsByLifecycle(companyId: string, lifecycle: RecommendationLifecycle): OptimizationRecommendation[] {
    return this.getRecommendations(companyId).filter((r) => r.lifecycle === lifecycle);
  }

  getSummary(companyId: string): OptimizationSummary {
    const cached = optimizationCache.getSummary(companyId);
    if (cached) return cached;

    const recommendations = this.getRecommendations(companyId);
    const summary = this.buildSummary(recommendations);
    optimizationCache.setSummary(companyId, summary);
    return summary;
  }

  async updateLifecycle(
    recommendationId: string,
    lifecycle: RecommendationLifecycle,
    userId: string,
    companyId: string,
  ): Promise<OptimizationRecommendation | null> {
    const cached = optimizationCache.getRecommendations(companyId);
    if (!cached) return null;

    const idx = cached.findIndex((r) => r.id === recommendationId);
    if (idx === -1) return null;

    const oldLifecycle = cached[idx].lifecycle;
    cached[idx] = { ...cached[idx], lifecycle, updatedAt: new Date().toISOString() };

    optimizationCache.setRecommendations(companyId, cached);
    optimizationCache.invalidate(companyId);

    optimizationAuditService.recordLifecycleChange(recommendationId, userId, companyId, oldLifecycle, lifecycle);

    if (lifecycle === "reviewed") optimizationAuditService.recordReviewed(recommendationId, userId, companyId);
    if (lifecycle === "accepted") optimizationAuditService.recordAccepted(recommendationId, userId, companyId);
    if (lifecycle === "rejected") optimizationAuditService.recordRejected(recommendationId, userId, companyId);
    if (lifecycle === "implemented") optimizationAuditService.recordImplemented(recommendationId, userId, companyId);
    if (lifecycle === "measured") optimizationAuditService.recordMeasured(recommendationId, userId, companyId, "measured");

    return cached[idx];
  }

  getCategories(): Record<string, string> {
    return { ...OPTIMIZATION_CATEGORY_LABELS };
  }

  getRegisteredTypes(): string[] {
    return optimizationRegistry.getAllDefinitions().map((d) => d.type);
  }

  getAuditLog(companyId: string) {
    return optimizationAuditService.getByCompany(companyId);
  }

  invalidateCache(companyId: string): void {
    optimizationCache.invalidate(companyId);
  }

  isSchedulerRunning(): boolean {
    return optimizationScheduler.isRunning();
  }

  private buildSummary(recommendations: OptimizationRecommendation[]): OptimizationSummary {
    const byPriority = this.groupBy(recommendations, "priority") as Record<string, number>;
    const byCategory = this.groupBy(recommendations, "category") as Record<string, number>;
    const byLifecycle = this.groupBy(recommendations, "lifecycle") as Record<string, number>;

    const totalEstimatedHoursSaved = recommendations.reduce((s, r) => s + r.estimatedHoursSaved, 0);
    const totalEstimatedCostReduction = recommendations.reduce((s, r) => s + r.estimatedCostReduction, 0);
    const totalEstimatedRiskReduction = recommendations.reduce((s, r) => s + r.estimatedRiskReduction, 0);

    const criticalHigh = recommendations.filter((r) => r.priority === "critical" || r.priority === "high");
    const quickWins = recommendations.filter((r) => r.estimatedHoursSaved <= 20 && r.confidenceScore >= 0.7);
    const longTerm = recommendations.filter((r) => r.estimatedHoursSaved > 100 || r.priority === "opportunity");

    return {
      total: recommendations.length,
      byPriority: byPriority as any,
      byCategory: byCategory as any,
      byLifecycle: byLifecycle as any,
      totalEstimatedHoursSaved,
      totalEstimatedCostReduction,
      totalEstimatedRiskReduction,
      topOpportunities: criticalHigh.slice(0, 5),
      quickWins: quickWins.slice(0, 5),
      largestBottlenecks: criticalHigh.filter((r) => r.estimatedHoursSaved > 50).slice(0, 5),
      highestRisks: criticalHigh.filter((r) => r.estimatedRiskReduction > 30).slice(0, 5),
      longTermImprovements: longTerm.slice(0, 5),
      potentialROI: totalEstimatedCostReduction + totalEstimatedHoursSaved * 50,
      generatedAt: new Date().toISOString(),
    };
  }

  private groupBy(items: OptimizationRecommendation[], key: string): Record<string, number> {
    return items.reduce((acc, item) => {
      const val = (item as any)[key] as string;
      acc[val] = (acc[val] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}

export const enterpriseOptimizationEngine = new EnterpriseOptimizationEngine();
