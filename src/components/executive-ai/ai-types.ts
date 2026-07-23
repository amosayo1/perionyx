import type {
  ExecutiveInsight, AIRecommendation, AnomalyDetection, AIForecast,
  CrossDomainInsight, AIModelMetrics, ExecutiveSummary, AIKPI, AIAlert, AIAggregateMetrics,
  InsightCategory, AnomalySeverity, InsightStatus, ConfidenceLevel, ForecastHorizon, AIModelType,
} from "../../server/executive-ai/types";

export type {
  ExecutiveInsight, AIRecommendation, AnomalyDetection, AIForecast,
  CrossDomainInsight, AIModelMetrics, ExecutiveSummary, AIKPI, AIAlert, AIAggregateMetrics,
  InsightCategory, AnomalySeverity, InsightStatus, ConfidenceLevel, ForecastHorizon, AIModelType,
};

export interface AIOverviewMetrics {
  totalInsights: number;
  activeInsights: number;
  criticalAnomalies: number;
  totalRecommendations: number;
  implementedRecommendations: number;
  pendingRecommendations: number;
  totalForecasts: number;
  modelCount: number;
  activeModels: number;
  avgConfidence: number;
  healthScore: number;
  totalAlerts: number;
  activeAlerts: number;
  recentInsights: number;
  crossDomainInsights: number;
}
