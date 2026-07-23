// ─────────────────────────────────────────────────────────────
// Executive Command Center — Type Definitions
// NEVER generates financial data — only composes specialist outputs
// ─────────────────────────────────────────────────────────────

// ─── Health Score ──────────────────────────────────────────

export type EnterpriseHealthScore = {
  overall: number;
  financial: number;
  treasury: number;
  operational: number;
  compliance: number;
  risk: number;
  governance: number;
  breakdown: HealthBreakdownItem[];
  calculatedAt: Date;
  companyId: string;
};

export type HealthBreakdownItem = {
  domain: string;
  score: number;
  weight: number;
  source: string;
  status: "excellent" | "good" | "warning" | "critical";
  trend: "improving" | "stable" | "declining";
};

// ─── KPIs ──────────────────────────────────────────────────

export type ExecutiveKPI = {
  id: string;
  name: string;
  value: number | string;
  previousValue?: number | string;
  unit: string;
  change?: number;
  changePercent?: number;
  trend: "up" | "down" | "stable";
  status: "on-track" | "warning" | "critical";
  source: string;
  sourceId?: string;
  drillDown?: DrillDownLink;
  lastUpdated: Date;
  companyId: string;
};

export type DrillDownLink = {
  type: "specialist" | "entity" | "report" | "workflow";
  specialist?: string;
  endpoint?: string;
  entityId?: string;
  entityType?: string;
  label: string;
};

// ─── Alerts ────────────────────────────────────────────────

export type ExecutiveAlert = {
  id: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  category: string;
  title: string;
  message: string;
  source: string;
  sourceId?: string;
  actionRequired: boolean;
  recommendedAction?: string;
  createdAt: Date;
  acknowledgedAt?: Date;
  companyId: string;
};

// ─── Recommendations ───────────────────────────────────────

export type ExecutiveRecommendation = {
  id: string;
  title: string;
  category: string;
  priority: "critical" | "high" | "medium" | "low";
  summary: string;
  businessReason: string;
  financialImpact?: string;
  confidence: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  source: string;
  requiredApprovals: string[];
  status: "pending" | "acknowledged" | "accepted" | "rejected";
  createdAt: Date;
  companyId: string;
};

// ─── Briefings ─────────────────────────────────────────────

export type ExecutiveBriefing = {
  id: string;
  briefingType: "morning" | "evening" | "weekly" | "adhoc";
  executiveSummary: string;
  sections: BriefingSection[];
  keyDecisions: string[];
  urgentActions: string[];
  generatedAt: Date;
  companyId: string;
};

export type BriefingSection = {
  title: string;
  source: string;
  highlights: string[];
  metrics: Record<string, string | number>;
  status: "good" | "warning" | "critical";
};

// ─── Risk Summary ──────────────────────────────────────────

export type EnterpriseRiskSummary = {
  overallScore: number;
  categories: RiskCategory[];
  topRisks: RiskItem[];
  mitigationProgress: number;
  companyId: string;
};

export type RiskCategory = {
  name: string;
  score: number;
  trend: "improving" | "stable" | "declining";
  source: string;
};

export type RiskItem = {
  id: string;
  title: string;
  category: string;
  severity: "critical" | "high" | "medium" | "low";
  likelihood: number;
  impact: number;
  mitigation: string;
  owner?: string;
  source: string;
  companyId: string;
};

// ─── Calendar ──────────────────────────────────────────────

export type ExecutiveCalendarEvent = {
  id: string;
  title: string;
  type:
    | "board-meeting"
    | "committee"
    | "filing-deadline"
    | "close-period"
    | "audit"
    | "review"
    | "other";
  date: Date;
  endDate?: Date;
  source: string;
  status: "upcoming" | "in-progress" | "completed" | "overdue";
  companyId: string;
};

// ─── Drill-Down ────────────────────────────────────────────

export type DrillDownContext = {
  domain: string;
  specialist: string;
  entityId?: string;
  entityType?: string;
  evidence: DrillDownEvidence[];
  relatedEntities: RelatedEntity[];
  auditTrail: AuditTrailEntry[];
  recommendations: string[];
};

export type DrillDownEvidence = {
  id: string;
  type: "document" | "transaction" | "report" | "audit-log" | "approval";
  title: string;
  source: string;
  url?: string;
  date: Date;
};

export type RelatedEntity = {
  id: string;
  type: string;
  name: string;
  relationship: string;
};

export type AuditTrailEntry = {
  id: string;
  action: string;
  actor: string;
  timestamp: Date;
  details: string;
};

// ─── Unified Dashboard ─────────────────────────────────────

export type ExecutiveCommandCenterData = {
  healthScore: EnterpriseHealthScore;
  kpis: ExecutiveKPI[];
  alerts: ExecutiveAlert[];
  recommendations: ExecutiveRecommendation[];
  calendar: ExecutiveCalendarEvent[];
  riskSummary: EnterpriseRiskSummary;
  specialistStatus: SpecialistStatus[];
  generatedAt: Date;
  companyId: string;
};

export type SpecialistStatus = {
  name: string;
  domain: string;
  available: boolean;
  dashboardLoaded: boolean;
  lastError?: string;
  loadTimeMs: number;
};

// ─── Enterprise Pilot Environment ──────────────────────────

export type PilotCompany = {
  id: string;
  name: string;
  industry: string;
  description: string;
  employees: number;
  revenue: string;
  currency: string;
  countries: string[];
  subsidiaries: number;
  dataYears: number;
  features: string[];
};

export type IndustryTemplate = {
  industry: string;
  name: string;
  description: string;
  icon: string;
  typicalRevenue: string;
  typicalEmployees: number;
  commonEntities: string[];
  regulatoryFrameworks: string[];
  keyMetrics: string[];
  sampleData: IndustrySampleData;
};

export type IndustrySampleData = {
  accounts: number;
  transactions: number;
  journalEntries: number;
  bankAccounts: number;
  vendors: number;
  customers: number;
  employees: number;
  assets: number;
  liabilities: number;
  equityItems: number;
  budgets: number;
  forecasts: number;
  taxJurisdictions: number;
  auditFindings: number;
  compliancePolicies: number;
  boardMeetings: number;
  resolutions: number;
};

// ─── Demo Scenarios ────────────────────────────────────────

export type DemoScenario = {
  id: string;
  name: string;
  description: string;
  category:
    | "close"
    | "treasury"
    | "governance"
    | "audit"
    | "compliance"
    | "tax"
    | "planning"
    | "crisis"
    | "investigation"
    | "ma"
    | "briefing";
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: string;
  steps: ScenarioStep[];
  specialists: string[];
  learningObjectives: string[];
  prerequisites: string[];
};

export type ScenarioStep = {
  id: string;
  title: string;
  description: string;
  specialist: string;
  action: string;
  expectedResult: string;
  drillDown?: DrillDownLink;
  tips: string[];
};

// ─── Performance ───────────────────────────────────────────

export type PerformanceMetric = {
  name: string;
  value: number;
  unit: string;
  target: number;
  status: "met" | "approaching" | "missed";
  measuredAt: Date;
};

export type DashboardPerformance = {
  loadTime: number;
  apiCalls: number;
  parallelQueries: number;
  cacheHits: number;
  cacheMisses: number;
  renderTime: number;
  dataSize: number;
  timestamp: Date;
};
