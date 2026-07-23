import type { TenantContext } from "@/server/context/tenant-context";

// ── Score types ──
export type ScoreType = "integrity" | "close-readiness" | "treasury-health" | "working-capital" | "operational" | "compliance";
export type Severity = "critical" | "warning" | "normal" | "good";
export type TrendDirection = "up" | "down" | "flat" | "volatile";
export type KPIStatus = "on_track" | "at_risk" | "critical" | "neutral";
export type KPICategory = "financial" | "treasury" | "risk" | "operational" | "compliance" | "executive";
export type RecommendationPriority = "critical" | "high" | "normal" | "low";
export type RecommendationConfidence = "high" | "medium" | "low";
export type RecommendationStatus = "active" | "acknowledged" | "implemented" | "dismissed";
export type RecommendationCategory = "integrity" | "close" | "treasury" | "working-capital" | "operational" | "compliance" | "general";
export type TrendPeriod = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
export type InsightEventType = "score_change" | "kpi_threshold" | "recommendation" | "alert" | "milestone";
export type AlertType = "integrity_drop" | "close_risk" | "liquidity_decline" | "risk_increase" | "compliance_issue" | "recommendation_critical";
export type ScorecardRole = "ceo" | "cfo" | "controller" | "treasurer" | "finance-manager" | "board" | "auditor";
export type ExplainTargetType = "score" | "kpi" | "recommendation" | "metric";
export type ExplainSourceType = "report" | "ledger" | "journal" | "transaction" | "document" | "import" | "integration" | "approval" | "audit";

// ── Score Component ──
export interface ScoreComponent {
  label: string; value: number; weight: number; maxScore: number;
  severity: Severity; evidence?: string; affectedModules?: string[];
}

// ── Financial Score ──
export interface FinancialScoreData {
  id: string; companyId: string; scoreType: ScoreType;
  score: number; previousScore?: number; change?: number; changePercent?: number;
  severity: Severity; summary?: string;
  components?: ScoreComponent[]; evidence?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  calculatedAt: string; createdAt: string;
}

// ── KPI ──
export interface KPIValueData {
  id: string; companyId: string; kpiKey: string; label: string;
  category: KPICategory; currentValue: number; previousValue?: number;
  targetValue?: number; thresholdLow?: number; thresholdHigh?: number;
  unit?: string; trend?: TrendDirection; variance?: number; variancePercent?: number;
  status: KPIStatus; metadata?: Record<string, unknown>;
  recordedAt: string;
}

// ── Recommendation ──
export interface IntelligenceRecommendationData {
  id: string; companyId: string; category: RecommendationCategory;
  title: string; description?: string; reason: string;
  evidence?: Record<string, unknown>; confidence: RecommendationConfidence;
  priority: RecommendationPriority; affectedModules?: string[];
  expectedImpact?: string; status: RecommendationStatus;
  sourceScoreType?: string; actionUrl?: string;
  createdAt: string; resolvedAt?: string;
}

// ── Trend ──
export interface DataPoint { date: string; value: number; }
export interface ForecastPoint { date: string; value: number; confidence: number; }
export interface IntelligenceTrendData {
  id: string; companyId: string; trendKey: string; label: string;
  period: TrendPeriod; dataPoints: DataPoint[];
  direction: TrendDirection; changePercent?: number;
  forecast?: ForecastPoint[]; calculatedAt: string;
}

// ── Insight ──
export interface InsightEventData {
  id: string; companyId: string; eventType: InsightEventType;
  title: string; description?: string; severity: Severity;
  impact?: string; evidence?: Record<string, unknown>;
  metadata?: Record<string, unknown>; isRead: boolean;
  createdAt: string;
}

// ── Alert ──
export interface HealthAlertData {
  id: string; companyId: string; alertType: AlertType;
  title: string; message?: string; severity: Severity;
  scoreType?: string; threshold?: number; currentValue?: number;
  isResolved: boolean; resolvedAt?: string; createdAt: string;
}

// ── Scorecard ──
export interface ScorecardData {
  id: string; companyId: string; role: ScorecardRole;
  periodStart: string; periodEnd: string;
  scores?: Record<string, number>; kpis?: Record<string, number>;
  recommendations?: Record<string, unknown>[]; summary?: string;
  generatedAt: string;
}

// ── Explain ──
export interface ExplainSourceData {
  id: string; companyId: string; targetType: ExplainTargetType;
  targetId: string; sourceType: ExplainSourceType;
  sourceId: string; sourceLabel?: string; sourceUrl?: string;
  metadata?: Record<string, unknown>; createdAt: string;
}

// ── Health Dashboard ──
export interface HealthDashboardData {
  scores: FinancialScoreData[];
  kpis: KPIValueData[];
  recommendations: IntelligenceRecommendationData[];
  alerts: HealthAlertData[];
  cashPosition?: number;
  insights: InsightEventData[];
  trendSummaries: { key: string; label: string; direction: string; changePercent?: number }[];
}

// ── Engine Results ──
export interface EngineResult {
  score: number; previousScore?: number; components: ScoreComponent[];
  summary: string; severity: Severity; evidence: Record<string, unknown>;
  recommendations: Array<{ title: string; reason: string; priority: RecommendationPriority; confidence: RecommendationConfidence }>;
}
