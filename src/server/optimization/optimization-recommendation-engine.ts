import type { OptimizationRecommendation, AnalyzerResult, OptimizationConfig, OptimizationPriority } from "./types";
import { optimizationRegistry } from "./optimization-registry";

export class OptimizationRecommendationEngine {
  generate(results: AnalyzerResult[], config: OptimizationConfig): OptimizationRecommendation[] {
    const all: OptimizationRecommendation[] = [];

    for (const result of results) {
      for (const rec of result.recommendations) {
        const def = optimizationRegistry.getDefinition(rec.title.toLowerCase().replace(/\s+/g, "-"));
        if (def) {
          rec.confidenceScore = Math.max(rec.confidenceScore, def.defaultConfidence);
        }
        all.push(rec);
      }
    }

    const filtered = all.filter((r) => r.confidenceScore >= config.minimumConfidenceScore);

    const scored = this.score(filtered);
    const deduplicated = this.deduplicate(scored);
    const prioritized = this.prioritize(deduplicated);

    return prioritized.slice(0, config.maxRecommendationsPerRun);
  }

  private score(recommendations: OptimizationRecommendation[]): OptimizationRecommendation[] {
    return recommendations.map((r) => {
      const score =
        r.confidenceScore * 0.3 +
        Math.min(r.estimatedHoursSaved / 200, 1) * 0.2 +
        Math.min(r.estimatedRiskReduction / 100, 1) * 0.15 +
        Math.min(r.estimatedCostReduction / 50000, 1) * 0.15 +
        (r.estimatedProductivityGain / 100) * 0.1 +
        this.priorityScore(r.priority) * 0.1;

      return { ...r, confidenceScore: Math.round(score * 100) / 100 };
    });
  }

  private priorityScore(priority: OptimizationPriority): number {
    const scores: Record<OptimizationPriority, number> = { critical: 1, high: 0.8, medium: 0.5, low: 0.3, opportunity: 0.1 };
    return scores[priority] ?? 0.3;
  }

  private deduplicate(recommendations: OptimizationRecommendation[]): OptimizationRecommendation[] {
    const seen = new Set<string>();
    return recommendations.filter((r) => {
      const key = `${r.title}-${r.category}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private prioritize(recommendations: OptimizationRecommendation[]): OptimizationRecommendation[] {
    return recommendations.sort((a, b) => {
      const aScore = this.compositeScore(a);
      const bScore = this.compositeScore(b);
      return bScore - aScore;
    });
  }

  private compositeScore(r: OptimizationRecommendation): number {
    return (
      r.confidenceScore * 0.25 +
      this.priorityScore(r.priority) * 0.2 +
      Math.min(r.estimatedHoursSaved / 200, 1) * 0.15 +
      Math.min(r.estimatedCostReduction / 50000, 1) * 0.15 +
      Math.min(r.estimatedRiskReduction / 100, 1) * 0.15 +
      Math.min(r.estimatedProductivityGain / 100, 1) * 0.1
    );
  }
}

export const optimizationRecommendationEngine = new OptimizationRecommendationEngine();
