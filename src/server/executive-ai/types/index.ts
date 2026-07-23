export type InsightCategory = "financial" | "operational" | "risk" | "compliance" | "treasury" | "tax" | "investments" | "revenue" | "cost" | "fraud" | "anomaly" | "forecast" | "recommendation";
export type AnomalySeverity = "low" | "medium" | "high" | "critical";
export type InsightStatus = "new" | "reviewed" | "acknowledged" | "actioned" | "dismissed";
export type ForecastHorizon = "7-days" | "30-days" | "90-days" | "quarter" | "year";
export type ConfidenceLevel = "very-low" | "low" | "medium" | "high" | "very-high";
export type AIModelType = "anomaly-detection" | "forecasting" | "classification" | "recommendation" | "nlp" | "reasoning";

export interface ExecutiveInsight {
  id: string;
  title: string;
  description: string;
  category: InsightCategory;
  severity: AnomalySeverity;
  confidence: ConfidenceLevel;
  status: InsightStatus;
  sourceDomain: string;
  sourceEntityId?: string;
  sourceEntityType?: string;
  metrics: Record<string, number>;
  recommendations: string[];
  tags: string[];
  detectedAt: Date;
  expiresAt?: Date;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIRecommendation {
  id: string;
  type: string;
  title: string;
  description: string;
  category: InsightCategory;
  impact: string;
  effort: "low" | "medium" | "high";
  roi?: number;
  confidence: ConfidenceLevel;
  sourceDomain: string;
  actions: string[];
  status: "pending" | "implemented" | "dismissed";
  implementedAt?: Date;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnomalyDetection {
  id: string;
  entityType: string;
  entityId: string;
  metric: string;
  expectedValue: number;
  actualValue: number;
  variance: number;
  variancePercent: number;
  severity: AnomalySeverity;
  category: InsightCategory;
  description: string;
  detectedAt: Date;
  acknowledged: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIForecast {
  id: string;
  domain: string;
  metric: string;
  horizon: ForecastHorizon;
  historicalValues: number[];
  forecastValues: number[];
  lowerBound: number[];
  upperBound: number[];
  confidence: ConfidenceLevel;
  seasonality?: string;
  trend: "increasing" | "decreasing" | "stable";
  seasonalityDescription?: string;
  keyDrivers: string[];
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NaturalLanguageQuery {
  id: string;
  query: string;
  intent: string;
  entities: string;
  translatedQuery?: string;
  results: string;
  confidence: ConfidenceLevel;
  executionTime: number;
  status: "pending" | "success" | "failed";
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CrossDomainInsight {
  id: string;
  title: string;
  description: string;
  domains: string[];
  correlation: string;
  significance: string;
  affectedMetrics: Record<string, number>;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIModelMetrics {
  modelType: AIModelType;
  name: string;
  version: string;
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  latency: number;
  lastTrained: Date;
  trainingDataSize: number;
  status: "active" | "training" | "inactive";
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExecutiveSummary {
  id: string;
  period: string;
  generatedAt: Date;
  keyInsights: ExecutiveInsight[];
  topRecommendations: AIRecommendation[];
  criticalAnomalies: AnomalyDetection[];
  forecasts: AIForecast[];
  overallHealth: "good" | "warning" | "critical";
  summary: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIKPI {
  name: string;
  value: number;
  previousValue: number;
  target: number;
  unit: string;
  category: string;
  trend: "up" | "down" | "stable";
  status: "good" | "warning" | "critical";
}

export interface AIAlert {
  id: string;
  severity: "critical" | "warning" | "info";
  type: string;
  title: string;
  message: string;
  actionRequired: boolean;
  dismissed: boolean;
  companyId: string;
  createdAt: Date;
}

export interface AIAggregateMetrics {
  totalInsights: number;
  activeInsights: number;
  criticalAnomalies: number;
  totalRecommendations: number;
  pendingRecommendations: number;
  totalForecasts: number;
  modelCount: number;
  activeModels: number;
  avgConfidence: number;
  healthScore: number;
}

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
