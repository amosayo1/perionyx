import type { AIAggregateMetrics } from "../types";
import { IntelligenceService } from "../intelligence/intelligence-service";
import { RecommendationService } from "../recommendations/recommendations-service";
import { AnomalyService } from "../anomaly-detection/anomaly-service";
import { ForecastService } from "../forecast/forecast-service";
import { ReasoningService } from "../reasoning/reasoning-service";
import { ModelMetricsService } from "../model-metrics/model-service";
import { AnalyticsService } from "../analytics/analytics-service";

export class ExecutiveAIService {
  intelligence: IntelligenceService;
  recommendations: RecommendationService;
  anomalies: AnomalyService;
  forecasts: ForecastService;
  reasoning: ReasoningService;
  modelMetrics: ModelMetricsService;
  analytics: AnalyticsService;

  constructor() {
    this.intelligence = new IntelligenceService();
    this.recommendations = new RecommendationService();
    this.anomalies = new AnomalyService();
    this.forecasts = new ForecastService();
    this.reasoning = new ReasoningService();
    this.modelMetrics = new ModelMetricsService();
    this.analytics = new AnalyticsService();
  }

  getAggregateMetrics(): AIAggregateMetrics {
    const allInsights = this.intelligence.getAll();
    const allAnomalies = this.anomalies.getAll();
    const allRecs = this.recommendations.getAll();
    const allForecasts = this.forecasts.getAll();
    const allModels = this.modelMetrics.getAll();

    const activeInsights = allInsights.filter(i => i.status !== "dismissed").length;
    const criticalAnomalies = allAnomalies.filter(a => a.severity === "critical").length;
    const pendingRecs = allRecs.filter(r => r.status === "pending").length;
    const activeModels = allModels.filter(m => m.status === "active").length;

    const confidences = allInsights.map(i => {
      const map: Record<string, number> = { "very-low": 0.1, low: 0.25, medium: 0.5, high: 0.75, "very-high": 0.95 };
      return map[i.confidence] || 0.5;
    });
    const avgConfidence = confidences.length > 0
      ? Math.round((confidences.reduce((s, c) => s + c, 0) / confidences.length) * 100)
      : 0;

    const healthScore = Math.round(
      allInsights.length > 0 || allModels.length > 0 ? Math.min(100, Math.max(0,
        70
        - criticalAnomalies * 10
        - allAnomalies.filter(a => !a.acknowledged).length * 3
        + activeModels * 5
        - pendingRecs * 2
      )) : 0
    );

    return {
      totalInsights: allInsights.length,
      activeInsights,
      criticalAnomalies,
      totalRecommendations: allRecs.length,
      pendingRecommendations: pendingRecs,
      totalForecasts: allForecasts.length,
      modelCount: allModels.length,
      activeModels,
      avgConfidence,
      healthScore,
    };
  }
}

export const executiveAIService = new ExecutiveAIService();
