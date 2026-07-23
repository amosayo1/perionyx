export type ExecutiveRole =
  | "CFO"
  | "TREASURER"
  | "CONTROLLER"
  | "FINANCE_MANAGER"
  | "AUDITOR"
  | "ADMINISTRATOR"
  | "OPERATIONS";

export type BriefingType =
  | "MORNING_BRIEFING"
  | "EVENING_SUMMARY"
  | "WEEKLY_EXECUTIVE_REVIEW"
  | "MONTHLY_FINANCIAL_SUMMARY"
  | "QUARTERLY_BUSINESS_REVIEW"
  | "YEAR_END_EXECUTIVE_SUMMARY";

export type BriefingFrequency = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";

export type BriefingSectionType =
  | "EXECUTIVE_OVERVIEW"
  | "CASH_POSITION"
  | "TREASURY_STATUS"
  | "LIQUIDITY"
  | "WORKFLOW_HEALTH"
  | "APPROVALS_AWAITING_ACTION"
  | "COMPLIANCE_ALERTS"
  | "RISK_SUMMARY"
  | "OPERATIONAL_HEALTH"
  | "RECENT_SIGNIFICANT_EVENTS"
  | "BUSINESS_TRENDS"
  | "FORECAST_HIGHLIGHTS"
  | "RECOMMENDED_ACTIONS";

export type RecommendationType =
  | "IMMEDIATE_ACTION"
  | "RECOMMENDED_REVIEW"
  | "POTENTIAL_RISK"
  | "EMERGING_TREND"
  | "UPCOMING_DEADLINE";

export type NarrativeTone = "executive" | "analytical" | "alert";

export interface BriefingRecommendation {
  type: RecommendationType;
  title: string;
  description: string;
  rationale: string;
  confidenceScore: number;
  evidenceRef: string;
  relatedModule: string;
  priority: "critical" | "high" | "medium" | "low";
}

export interface BriefingMetric {
  label: string;
  value: string | number;
  previousValue?: string | number;
  change?: number;
  changePercent?: number;
  direction?: "up" | "down" | "neutral";
  status?: "positive" | "negative" | "neutral" | "attention";
  format?: "currency" | "percent" | "number" | "duration";
}

export interface BriefingSection {
  type: BriefingSectionType;
  title: string;
  tone: NarrativeTone;
  narrative: string;
  metrics: BriefingMetric[];
  recommendations: BriefingRecommendation[];
  dataFreshness: string;
  auditRef: string;
}

export interface ExecutiveBriefing {
  id: string;
  type: BriefingType;
  frequency: BriefingFrequency;
  companyId: string;
  role: ExecutiveRole;
  title: string;
  period: { start: string; end: string };
  periodLabel: string;
  sections: BriefingSection[];
  overallNarrative: string;
  keyTakeaways: string[];
  generatedAt: string;
  expiresAt: string;
  version: number;
  generationTimeMs: number;
  auditRef: string;
}

export interface BriefingConfig {
  companyId: string;
  timezone: string;
  businessHoursStart: number;
  businessHoursEnd: number;
  operatingThreshold: number;
  reportingCurrency: string;
  fiscalYearStart: string;
}

export const DEFAULT_BRIEFING_CONFIG: BriefingConfig = {
  companyId: "",
  timezone: "America/New_York",
  businessHoursStart: 8,
  businessHoursEnd: 18,
  operatingThreshold: 100000,
  reportingCurrency: "USD",
  fiscalYearStart: "01-01",
};

export const FREQUENCY_MAP: Record<BriefingType, BriefingFrequency> = {
  MORNING_BRIEFING: "daily",
  EVENING_SUMMARY: "daily",
  WEEKLY_EXECUTIVE_REVIEW: "weekly",
  MONTHLY_FINANCIAL_SUMMARY: "monthly",
  QUARTERLY_BUSINESS_REVIEW: "quarterly",
  YEAR_END_EXECUTIVE_SUMMARY: "yearly",
};

export const ROLE_SECTION_PRIORITY: Record<ExecutiveRole, BriefingSectionType[]> = {
  CFO: [
    "EXECUTIVE_OVERVIEW", "CASH_POSITION", "LIQUIDITY", "RISK_SUMMARY",
    "FORECAST_HIGHLIGHTS", "TREASURY_STATUS", "BUSINESS_TRENDS",
    "RECOMMENDED_ACTIONS", "APPROVALS_AWAITING_ACTION", "COMPLIANCE_ALERTS",
    "WORKFLOW_HEALTH", "OPERATIONAL_HEALTH", "RECENT_SIGNIFICANT_EVENTS",
  ],
  TREASURER: [
    "CASH_POSITION", "TREASURY_STATUS", "LIQUIDITY", "FORECAST_HIGHLIGHTS",
    "RECENT_SIGNIFICANT_EVENTS", "RISK_SUMMARY", "APPROVALS_AWAITING_ACTION",
    "RECOMMENDED_ACTIONS", "OPERATIONAL_HEALTH",
  ],
  CONTROLLER: [
    "EXECUTIVE_OVERVIEW", "COMPLIANCE_ALERTS", "RISK_SUMMARY",
    "APPROVALS_AWAITING_ACTION", "OPERATIONAL_HEALTH",
    "RECENT_SIGNIFICANT_EVENTS", "RECOMMENDED_ACTIONS", "CASH_POSITION",
  ],
  FINANCE_MANAGER: [
    "APPROVALS_AWAITING_ACTION", "WORKFLOW_HEALTH", "OPERATIONAL_HEALTH",
    "BUSINESS_TRENDS", "CASH_POSITION", "RECOMMENDED_ACTIONS",
    "EXECUTIVE_OVERVIEW",
  ],
  AUDITOR: [
    "COMPLIANCE_ALERTS", "RISK_SUMMARY", "RECENT_SIGNIFICANT_EVENTS",
    "APPROVALS_AWAITING_ACTION", "OPERATIONAL_HEALTH", "EXECUTIVE_OVERVIEW",
  ],
  ADMINISTRATOR: [
    "EXECUTIVE_OVERVIEW", "CASH_POSITION", "TREASURY_STATUS", "LIQUIDITY",
    "WORKFLOW_HEALTH", "APPROVALS_AWAITING_ACTION", "COMPLIANCE_ALERTS",
    "RISK_SUMMARY", "OPERATIONAL_HEALTH", "RECENT_SIGNIFICANT_EVENTS",
    "BUSINESS_TRENDS", "FORECAST_HIGHLIGHTS", "RECOMMENDED_ACTIONS",
  ],
  OPERATIONS: [
    "WORKFLOW_HEALTH", "OPERATIONAL_HEALTH", "RECENT_SIGNIFICANT_EVENTS",
    "APPROVALS_AWAITING_ACTION", "CASH_POSITION", "RECOMMENDED_ACTIONS",
  ],
};

export const BRIEFING_TYPES: { type: BriefingType; label: string; hour: number; minute: number; dayOfWeek?: number; dayOfMonth?: number }[] = [
  { type: "MORNING_BRIEFING", label: "Morning Briefing", hour: 6, minute: 0 },
  { type: "EVENING_SUMMARY", label: "Evening Summary", hour: 18, minute: 0 },
  { type: "WEEKLY_EXECUTIVE_REVIEW", label: "Weekly Executive Review", hour: 7, minute: 0, dayOfWeek: 1 },
  { type: "MONTHLY_FINANCIAL_SUMMARY", label: "Monthly Financial Summary", hour: 7, minute: 0, dayOfMonth: 1 },
  { type: "QUARTERLY_BUSINESS_REVIEW", label: "Quarterly Business Review", hour: 8, minute: 0, dayOfMonth: 1 },
  { type: "YEAR_END_EXECUTIVE_SUMMARY", label: "Year-End Executive Summary", hour: 8, minute: 0, dayOfMonth: 1 },
];
