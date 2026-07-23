export type IntelligenceCategory =
  | "financial"
  | "operational"
  | "compliance"
  | "treasury"
  | "governance"
  | "risk"
  | "workflow"
  | "approvals"
  | "productivity"
  | "adoption";

export type InsightPriority = "critical" | "high" | "medium" | "low" | "informational";

export type InsightStatus = "active" | "acknowledged" | "resolved" | "dismissed" | "expired";

export type SignalSource =
  | "treasury"
  | "payments"
  | "approvals"
  | "workflow_engine"
  | "automation_studio"
  | "compliance"
  | "risk"
  | "analytics"
  | "audit"
  | "policies"
  | "notifications"
  | "users"
  | "governance"
  | "reconciliation"
  | "connectors";

export interface Insight {
  id: string;
  title: string;
  description: string;
  businessImpact: string;
  severity: InsightPriority;
  category: IntelligenceCategory;
  affectedModule: SignalSource;
  recommendedAction: string;
  confidenceScore: number;
  source: SignalSource;
  evidenceRefs: string[];
  createdAt: string;
  expiresAt: string;
  status: InsightStatus;
  auditRef: string;
  companyId: string;
  metadata?: Record<string, unknown>;
}

export interface Signal {
  id: string;
  source: SignalSource;
  type: string;
  value: number | string | boolean;
  label: string;
  timestamp: string;
  companyId: string;
  metadata?: Record<string, unknown>;
}

export interface ScoredSignal extends Signal {
  score: number;
  reason: string;
}

export interface PriorityScore {
  overall: number;
  urgency: number;
  businessImpact: number;
  confidence: number;
  timeframe: number;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: InsightPriority;
  category: IntelligenceCategory;
  actions: string[];
  expectedImpact: string;
  effort: "low" | "medium" | "high";
  evidenceRefs: string[];
  createdAt: string;
  expiresAt: string;
  companyId: string;
}

export interface BusinessHealth {
  score: number;
  previousScore: number;
  trend: "improving" | "stable" | "declining";
  category: IntelligenceCategory;
  metrics: HealthMetric[];
  assessedAt: string;
}

export interface HealthMetric {
  label: string;
  value: number;
  target: number;
  status: "on_track" | "at_risk" | "off_track";
  trend: "up" | "down" | "stable";
}

export interface AttentionItem {
  id: string;
  type: "insight" | "recommendation" | "alert" | "approval" | "anomaly";
  priority: InsightPriority;
  title: string;
  description: string;
  actionUrl?: string;
  createdAt: string;
  companyId: string;
}

export interface ExecutiveSummary {
  period: { start: string; end: string };
  companyId: string;
  overallHealth: BusinessHealth;
  criticalAttention: AttentionItem[];
  topRisks: Insight[];
  topOpportunities: Recommendation[];
  keyMetrics: HealthMetric[];
  generatedAt: string;
  periodLabel: string;
}

export interface IntelligenceConfig {
  signalTTL: number;
  insightTTL: number;
  maxActiveInsights: number;
  minConfidenceThreshold: number;
  scoringWeights: {
    urgency: number;
    businessImpact: number;
    confidence: number;
    timeframe: number;
  };
}

export const DEFAULT_INTELLIGENCE_CONFIG: IntelligenceConfig = {
  signalTTL: 300_000,
  insightTTL: 900_000,
  maxActiveInsights: 50,
  minConfidenceThreshold: 0.3,
  scoringWeights: {
    urgency: 0.35,
    businessImpact: 0.35,
    confidence: 0.2,
    timeframe: 0.1,
  },
};
