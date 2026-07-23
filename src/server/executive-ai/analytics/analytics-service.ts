import type { AIKPI, AIAlert, ExecutiveSummary, AIAggregateMetrics } from "../types";
import { IntelligenceService } from "../intelligence/intelligence-service";
import { RecommendationService } from "../recommendations/recommendations-service";
import { AnomalyService } from "../anomaly-detection/anomaly-service";
import { ForecastService } from "../forecast/forecast-service";
import { ReasoningService } from "../reasoning/reasoning-service";
import { ModelMetricsService } from "../model-metrics/model-service";

export class AnalyticsService {
  private kpis = new Map<string, AIKPI>();
  private alerts = new Map<string, AIAlert>();
  private summaries = new Map<string, ExecutiveSummary>();

  addKPI(kpi: AIKPI): AIKPI {
    this.kpis.set(kpi.name, kpi);
    return kpi;
  }

  getKPI(name: string): AIKPI | undefined {
    return this.kpis.get(name);
  }

  getAllKPIs(): AIKPI[] {
    return Array.from(this.kpis.values());
  }

  addAlert(alert: AIAlert): AIAlert {
    this.alerts.set(alert.id, alert);
    return alert;
  }

  getAlert(id: string): AIAlert | undefined {
    return this.alerts.get(id);
  }

  getAllAlerts(): AIAlert[] {
    return Array.from(this.alerts.values());
  }

  getActiveAlerts(): AIAlert[] {
    return this.getAllAlerts().filter(a => !a.dismissed);
  }

  dismissAlert(id: string): void {
    const alert = this.alerts.get(id);
    if (alert) alert.dismissed = true;
  }

  addSummary(summary: ExecutiveSummary): ExecutiveSummary {
    this.summaries.set(summary.id, summary);
    return summary;
  }

  getSummary(id: string): ExecutiveSummary | undefined {
    return this.summaries.get(id);
  }

  getAllSummaries(): ExecutiveSummary[] {
    return Array.from(this.summaries.values());
  }

  generateSummary(
    intelligence: IntelligenceService,
    recommendations: RecommendationService,
    anomalies: AnomalyService,
    forecasts: ForecastService,
    reasoning: ReasoningService,
    models: ModelMetricsService
  ): ExecutiveSummary {
    const allInsights = intelligence.getAll();
    const allRecs = recommendations.getAll();
    const allAnomalies = anomalies.getAll();
    const allForecasts = forecasts.getAll();
    const allCrossDomain = reasoning.getAllCrossDomainInsights();

    const criticalAnomalies = allAnomalies.filter(a => a.severity === "critical" || a.severity === "high");
    const pendingRecs = allRecs.filter(r => r.status === "pending");
    const activeInsights = allInsights.filter(i => i.status !== "dismissed");
    const increasingForecasts = allForecasts.filter(f => f.trend === "increasing");
    const decreasingForecasts = allForecasts.filter(f => f.trend === "decreasing");

    const healthScore = this.computeHealthScore(intelligence, anomalies, recommendations, forecasts, models);
    const overallHealth: "good" | "warning" | "critical" = healthScore >= 75 ? "good" : healthScore >= 50 ? "warning" : "critical";

    const summary = `Executive AI Summary: ${allInsights.length} insights active, ${criticalAnomalies.length} critical anomalies requiring attention, ${pendingRecs.length} pending recommendations, ${allForecasts.length} forecasts tracked across ${forecasts.getAll().length} domains. Overall health: ${overallHealth} (${healthScore}/100).${increasingForecasts.length > 0 ? ` ${increasingForecasts.length} metrics showing positive trend.` : ""}${decreasingForecasts.length > 0 ? ` ${decreasingForecasts.length} metrics declining.` : ""}${allCrossDomain.length > 0 ? ` ${allCrossDomain.length} cross-domain correlations identified.` : ""}`;

    const id = `summary-${Date.now()}`;
    const entry: ExecutiveSummary = {
      id,
      period: new Date().toISOString().slice(0, 7),
      generatedAt: new Date(),
      keyInsights: allInsights.slice(0, 5),
      topRecommendations: pendingRecs.slice(0, 5),
      criticalAnomalies: criticalAnomalies.slice(0, 5),
      forecasts: allForecasts.slice(0, 5),
      overallHealth,
      summary,
      companyId: "default",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.summaries.set(id, entry);
    return entry;
  }

  private computeHealthScore(
    intelligence: IntelligenceService,
    anomalies: AnomalyService,
    recommendations: RecommendationService,
    forecasts: ForecastService,
    models: ModelMetricsService
  ): number {
    const allAnomalies = anomalies.getAll();
    const allInsights = intelligence.getAll();
    const allRecs = recommendations.getAll();
    const allModels = models.getAll();

    const criticalAnomalyPenalty = allAnomalies.filter(a => a.severity === "critical").length * 15;
    const unacknowledgedAnomalyPenalty = allAnomalies.filter(a => !a.acknowledged).length * 5;
    const pendingRecPenalty = allRecs.filter(r => r.status === "pending").length * 3;
    const dismissedInsights = allInsights.filter(i => i.status === "dismissed").length * 2;

    const activeModelBonus = allModels.filter(m => m.status === "active").length * 5;
    const avgAccuracy = allModels.filter(m => m.accuracy !== undefined).reduce((s, m) => s + (m.accuracy || 0), 0);
    const accuracyBonus = allModels.length > 0 ? (avgAccuracy / allModels.length) * 0.2 : 0;

    return Math.max(0, Math.min(100, 70 - criticalAnomalyPenalty - unacknowledgedAnomalyPenalty - pendingRecPenalty - dismissedInsights + activeModelBonus + accuracyBonus));
  }

  count(): number {
    return this.kpis.size;
  }
}
