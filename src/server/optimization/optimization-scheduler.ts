import type { OptimizationConfig, OptimizationRecommendation } from "./types";
import { DEFAULT_OPTIMIZATION_CONFIG } from "./types";
import { optimizationEvidenceCollector } from "./optimization-evidence-collector";
import { optimizationRecommendationEngine } from "./optimization-recommendation-engine";
import { optimizationCache } from "./optimization-cache";
import { optimizationAuditService } from "./optimization-audit-service";

export class OptimizationScheduler {
  private timers = new Map<string, ReturnType<typeof setInterval>>();
  private running = false;

  private configs = new Map<string, OptimizationConfig>();

  setConfig(tenantId: string, config: Partial<OptimizationConfig>): void {
    const existing = this.configs.get(tenantId) ?? DEFAULT_OPTIMIZATION_CONFIG;
    this.configs.set(tenantId, { ...existing, ...config });
  }

  async start(tenantId: string, companyId: string): Promise<void> {
    if (this.timers.has(tenantId)) return;

    const config = this.configs.get(tenantId) ?? DEFAULT_OPTIMIZATION_CONFIG;
    if (!config.enabled) return;

    await this.runAnalysis(tenantId, companyId, config);

    const timer = setInterval(
      () => this.runAnalysis(tenantId, companyId, config),
      config.runIntervalMs,
    );
    this.timers.set(tenantId, timer);
    this.running = true;
  }

  stop(tenantId: string): void {
    const timer = this.timers.get(tenantId);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(tenantId);
    }
    if (this.timers.size === 0) {
      this.running = false;
    }
  }

  stopAll(): void {
    for (const [tenantId] of this.timers) {
      this.stop(tenantId);
    }
  }

  isRunning(): boolean {
    return this.running;
  }

  async runAnalysis(tenantId: string, companyId: string, config?: OptimizationConfig): Promise<OptimizationRecommendation[]> {
    const cfg = config ?? this.configs.get(tenantId) ?? DEFAULT_OPTIMIZATION_CONFIG;

    const { allRecommendations } = await optimizationEvidenceCollector.collect(companyId, tenantId, cfg);

    const recommendations = optimizationRecommendationEngine.generate(allRecommendations, cfg);

    optimizationCache.setRecommendations(companyId, recommendations);
    optimizationAuditService.recordAnalysisRun(companyId);

    return recommendations;
  }
}

export const optimizationScheduler = new OptimizationScheduler();
