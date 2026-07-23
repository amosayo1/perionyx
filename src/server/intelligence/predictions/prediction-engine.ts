import type { Prediction, BusinessInsight, ForecastSummary, PredictionCategory, PredictionSeverity, InsightType } from "./types";
import { CATEGORY_LABELS, CONFIDENCE_THRESHOLDS } from "./types";
import { predictionRegistry } from "./prediction-registry";
import { predictionEvidenceCollector } from "./prediction-evidence-collector";
import { predictionCache } from "./prediction-cache";
import { predictionScheduler } from "./prediction-scheduler";
import { predictionHistory } from "./prediction-history";
import { predictionAuditService } from "./prediction-audit-service";
import { predictionEvaluator } from "./prediction-evaluator";
import { recommendationPrioritizer } from "./recommendation-prioritizer";

export class PredictionEngine {
  constructor() {
    this.registerRules();
  }

  private registerRules(): void {
    const rules = [
      { id: "cash-shortage", name: "Cash Shortage", category: "CASH_FLOW" as const, description: "Detect potential cash shortages", enabled: true, intervalMs: 3_600_000 },
      { id: "late-approvals", name: "Late Approvals", category: "APPROVALS" as const, description: "Detect approvals exceeding SLA", enabled: true, intervalMs: 3_600_000 },
      { id: "workflow-bottlenecks", name: "Workflow Bottlenecks", category: "WORKFLOW_DELAYS" as const, description: "Detect workflow capacity issues", enabled: true, intervalMs: 3_600_000 },
      { id: "sla-breach", name: "SLA Breach Risk", category: "APPROVALS" as const, description: "Approvals approaching SLA limit", enabled: true, intervalMs: 3_600_000 },
      { id: "month-end-risk", name: "Month-End Completion Risk", category: "OPERATIONAL_CAPACITY" as const, description: "Month-end close completion risk", enabled: true, intervalMs: 86_400_000 },
      { id: "reconciliation-delay", name: "Reconciliation Delays", category: "OPERATIONAL_CAPACITY" as const, description: "Aged reconciliation exceptions", enabled: true, intervalMs: 86_400_000 },
      { id: "outstanding-approvals", name: "Outstanding Approvals", category: "APPROVALS" as const, description: "Accumulated pending approvals", enabled: true, intervalMs: 3_600_000 },
      { id: "high-risk-workflows", name: "High-Risk Workflows", category: "WORKFLOW_DELAYS" as const, description: "Workflow failure rate monitoring", enabled: true, intervalMs: 86_400_000 },
      { id: "overdue-compliance", name: "Overdue Compliance Tasks", category: "COMPLIANCE" as const, description: "Aged violations and alerts", enabled: true, intervalMs: 86_400_000 },
      { id: "forecast-variance", name: "Forecast Variance", category: "FORECAST_ACCURACY" as const, description: "Projected balance variance", enabled: true, intervalMs: 86_400_000 },
      { id: "duplicate-payment", name: "Duplicate Payment Risk", category: "RISK" as const, description: "Potential duplicate payments", enabled: true, intervalMs: 3_600_000 },
      { id: "inactive-users", name: "Inactive Users", category: "USER_ADOPTION" as const, description: "User engagement monitoring", enabled: true, intervalMs: 86_400_000 },
    ];

    for (const rule of rules) {
      predictionRegistry.registerRule(rule);
    }
  }

  async refresh(companyId: string): Promise<Prediction[]> {
    const predictions = await predictionEvidenceCollector.collectAll(companyId);
    predictionRegistry.removeExpired();
    predictionCache.invalidate(companyId);

    const ttlMs = 3_600_000;
    predictionCache.setPredictions(companyId, predictions, ttlMs);

    return predictions;
  }

  async getPredictions(companyId: string, category?: PredictionCategory): Promise<Prediction[]> {
    const cached = predictionCache.getPredictions(companyId, category);
    if (cached) return cached;

    const predictions = await this.refresh(companyId);
    if (category) return predictions.filter((p) => p.category === category);
    return predictions;
  }

  async getActivePredictions(companyId: string): Promise<Prediction[]> {
    const predictions = await this.getPredictions(companyId);
    return predictions.filter((p) => p.status === "active");
  }

  async getForecastSummary(companyId: string): Promise<ForecastSummary> {
    const cached = predictionCache.getSummary(companyId);
    if (cached) return cached;

    const predictions = await this.getPredictions(companyId);
    const insights = await this.generateInsights(companyId);

    const criticalCount = predictions.filter((p) => p.severity === "critical" && p.status === "active").length;

    const confidenceScores = predictions.map((p) => p.confidenceScore);
    const avgConfidence = confidenceScores.length > 0
      ? confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length
      : 0;

    const overallConfidence: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH" =
      avgConfidence >= CONFIDENCE_THRESHOLDS.VERY_HIGH.min ? "VERY_HIGH"
      : avgConfidence >= CONFIDENCE_THRESHOLDS.HIGH.min ? "HIGH"
      : avgConfidence >= CONFIDENCE_THRESHOLDS.MEDIUM.min ? "MEDIUM"
      : "LOW";

    const summary: ForecastSummary = {
      period: {
        start: new Date(Date.now() - 86_400_000).toISOString(),
        end: new Date().toISOString(),
      },
      predictions: predictions.filter((p) => p.status === "active"),
      insights,
      overallConfidence,
      criticalCount,
      generatedAt: new Date().toISOString(),
    };

    predictionCache.setSummary(companyId, summary, 3_600_000);
    return summary;
  }

  async generateInsights(companyId: string): Promise<BusinessInsight[]> {
    const cached = predictionCache.getInsights(companyId);
    if (cached) return cached;

    const predictions = await this.getPredictions(companyId);
    const insights: BusinessInsight[] = [];
    const now = new Date().toISOString();

    const categoryTrends = new Map<PredictionCategory, number>();
    for (const pred of predictions) {
      categoryTrends.set(pred.category, (categoryTrends.get(pred.category) ?? 0) + 1);
    }

    for (const [category, count] of categoryTrends) {
      if (count >= 2) {
        insights.push({
          id: `insight-trend-${category}-${Date.now()}`,
          type: "TREND",
          category,
          title: `${CATEGORY_LABELS[category]} Activity`,
          description: `${count} active prediction${count !== 1 ? "s" : ""} in ${CATEGORY_LABELS[category].toLowerCase()}`,
          confidence: count >= 4 ? "HIGH" : "MEDIUM",
          confidenceScore: Math.min(count * 0.15, 0.9),
          evidence: predictions.filter((p) => p.category === category).map((p) => ({
            type: "prediction", description: p.title, value: p.confidence, source: "PredictionEngine", timestamp: p.createdAt,
          })),
          supportingData: { category, predictionCount: count },
          companyId,
          createdAt: now,
          expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
        });
      }
    }

    const severityCounts: Record<PredictionSeverity, number> = { critical: 0, high: 0, medium: 0, low: 0, informational: 0 };
    for (const pred of predictions) {
      if (pred.status === "active") severityCounts[pred.severity]++;
    }

    if (severityCounts.critical > 0) {
      insights.push({
        id: `insight-critical-${Date.now()}`,
        type: "ANOMALY",
        category: "RISK",
        title: "Critical Predictions Require Attention",
        description: `${severityCounts.critical} critical prediction${severityCounts.critical !== 1 ? "s" : ""} require${severityCounts.critical !== 1 ? "" : "s"} immediate action`,
        confidence: "HIGH",
        confidenceScore: 0.85,
        evidence: predictions.filter((p) => p.severity === "critical" && p.status === "active").map((p) => ({
          type: "critical", description: p.title, value: p.severity, source: "PredictionEngine", timestamp: p.createdAt,
        })),
        supportingData: { criticalCount: severityCounts.critical },
        companyId,
        createdAt: now,
        expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
      });
    }

    const topRecs = recommendationPrioritizer.getTopRecommendations(predictions, 3);
    if (topRecs.length > 0) {
      insights.push({
        id: `insight-recommendations-${Date.now()}`,
        type: "RECOMMENDATION",
        category: "OPERATIONAL_CAPACITY",
        title: "Recommended Actions Available",
        description: `${topRecs.length} prioritized recommendation${topRecs.length !== 1 ? "s" : ""} based on active predictions`,
        confidence: "HIGH",
        confidenceScore: 0.8,
        evidence: topRecs.map((r) => ({
          type: "recommendation", description: r.action, value: r.predictionTitle, source: "RecommendationPrioritizer", timestamp: now,
        })),
        supportingData: { recommendations: topRecs.map((r) => ({ action: r.action, priority: r.priority })) },
        companyId,
        createdAt: now,
        expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
      });
    }

    predictionCache.setInsights(companyId, insights, 3_600_000);
    return insights;
  }

  async getPredictionAccuracy(companyId: string): Promise<{ average: number; count: number }> {
    return predictionHistory.getOverallAccuracy(companyId);
  }

  async getPredictionTimeline(companyId: string) {
    return predictionHistory.getTimeline(companyId);
  }

  async getHistory(predictionId: string) {
    return predictionHistory.getHistory(predictionId);
  }

  async confirmPrediction(predictionId: string, actorId?: string): Promise<void> {
    predictionRegistry.updateStatus(predictionId, "confirmed");
    predictionHistory.record(predictionId, "CONFIRMED", "Prediction confirmed by user", actorId);
    predictionAuditService.recordStatusChange(predictionId, "", "active", "confirmed");
  }

  async dismissPrediction(predictionId: string, actorId?: string): Promise<void> {
    predictionRegistry.updateStatus(predictionId, "dismissed");
    predictionHistory.record(predictionId, "DISMISSED", "Prediction dismissed by user", actorId);
    predictionAuditService.recordStatusChange(predictionId, "", "active", "dismissed");
  }

  async resolvePrediction(predictionId: string, actorId?: string): Promise<void> {
    predictionRegistry.updateStatus(predictionId, "resolved");
    predictionHistory.record(predictionId, "RESOLVED", "Prediction resolved", actorId);
    predictionAuditService.recordStatusChange(predictionId, "", "active", "resolved");
  }

  schedule(companyId: string): void {
    predictionScheduler.scheduleImmediate(companyId, async () => { await this.refresh(companyId); }, "predictions");
  }

  unschedule(companyId: string): void {
    predictionScheduler.unscheduleAll(companyId);
  }

  invalidateCache(companyId: string): void {
    predictionCache.invalidate(companyId);
  }

  getRuleCount(): number {
    return predictionRegistry.getAllRules().length;
  }

  getPredictionCount(companyId?: string): number {
    if (companyId) return predictionRegistry.getAll(companyId).length;
    return predictionRegistry.getCount();
  }
}

export const predictionEngine = new PredictionEngine();
