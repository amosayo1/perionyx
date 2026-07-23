export type PredictionCategory =
  | "TREASURY" | "CASH_FLOW" | "LIQUIDITY" | "WORKING_CAPITAL"
  | "RECEIVABLES" | "PAYABLES" | "APPROVALS" | "WORKFLOW_DELAYS"
  | "COMPLIANCE" | "RISK" | "POLICY_VIOLATIONS" | "OPERATIONAL_CAPACITY"
  | "USER_ADOPTION" | "FORECAST_ACCURACY";

export type PredictionSeverity = "critical" | "high" | "medium" | "low" | "informational";

export type ConfidenceLevel = "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";

export type PredictionStatus = "active" | "confirmed" | "dismissed" | "expired" | "resolved";

export type PredictionHorizon = "NEAR_TERM" | "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "CUSTOM";

export type PredictionEvent = "GENERATED" | "UPDATED" | "CONFIRMED" | "DISMISSED" | "RESOLVED" | "ACCURACY_EVALUATED";

export type InsightType = "TREND" | "ANOMALY" | "PATTERN" | "RECOMMENDATION";

export interface PredictionEvidence {
  type: string;
  description: string;
  value: string | number;
  source: string;
  timestamp: string;
}

export interface PredictionRecommendation {
  action: string;
  rationale: string;
  priority: "critical" | "high" | "medium" | "low";
  effort: "low" | "medium" | "high";
}

export interface Prediction {
  id: string;
  title: string;
  category: PredictionCategory;
  description: string;
  businessExplanation: string;
  confidence: ConfidenceLevel;
  confidenceScore: number;
  confidenceExplanation: string;
  evidence: PredictionEvidence[];
  supportingData: Record<string, unknown>;
  affectedModules: string[];
  recommendations: PredictionRecommendation[];
  severity: PredictionSeverity;
  businessImpact: string;
  horizon: PredictionHorizon;
  timeframe: { start: string; end: string };
  status: PredictionStatus;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  auditRef: string;
}

export interface PredictionHistoryEntry {
  predictionId: string;
  event: PredictionEvent;
  timestamp: string;
  details: string;
  actorId?: string;
}

export interface BusinessInsight {
  id: string;
  type: InsightType;
  category: PredictionCategory;
  title: string;
  description: string;
  confidence: ConfidenceLevel;
  confidenceScore: number;
  evidence: PredictionEvidence[];
  supportingData: Record<string, unknown>;
  companyId: string;
  createdAt: string;
  expiresAt: string;
}

export interface ForecastSummary {
  period: { start: string; end: string };
  predictions: Prediction[];
  insights: BusinessInsight[];
  overallConfidence: ConfidenceLevel;
  criticalCount: number;
  generatedAt: string;
}

export interface PredictionAccuracy {
  predictionId: string;
  predicted: boolean;
  actual: boolean;
  accuracy: number;
  evaluatedAt: string;
}

export const CONFIDENCE_THRESHOLDS: Record<ConfidenceLevel, { min: number; max: number }> = {
  LOW: { min: 0, max: 0.4 },
  MEDIUM: { min: 0.4, max: 0.7 },
  HIGH: { min: 0.7, max: 0.9 },
  VERY_HIGH: { min: 0.9, max: 1.0 },
};

export const CATEGORY_LABELS: Record<PredictionCategory, string> = {
  TREASURY: "Treasury",
  CASH_FLOW: "Cash Flow",
  LIQUIDITY: "Liquidity",
  WORKING_CAPITAL: "Working Capital",
  RECEIVABLES: "Receivables",
  PAYABLES: "Payables",
  APPROVALS: "Approvals",
  WORKFLOW_DELAYS: "Workflow Delays",
  COMPLIANCE: "Compliance",
  RISK: "Risk",
  POLICY_VIOLATIONS: "Policy Violations",
  OPERATIONAL_CAPACITY: "Operational Capacity",
  USER_ADOPTION: "User Adoption",
  FORECAST_ACCURACY: "Forecast Accuracy",
};
