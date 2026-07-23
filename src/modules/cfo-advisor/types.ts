export type BriefingPeriod = "daily" | "weekly" | "monthly";

export type BriefingStatus = "GENERATING" | "GENERATED" | "DELIVERED" | "FAILED";

export type ScenarioType =
  | "revenue_decline"
  | "revenue_growth"
  | "payroll_increase"
  | "hiring_freeze"
  | "customer_default"
  | "fx_movement"
  | "interest_rate"
  | "tax_increase"
  | "acquisition"
  | "capex"
  | "custom";

export type ScenarioStatus = "DRAFT" | "RUNNING" | "COMPLETED" | "FAILED";

export type InsightType =
  | "trend"
  | "anomaly"
  | "risk"
  | "opportunity"
  | "alert"
  | "milestone";

export type InsightCategory =
  | "cash"
  | "revenue"
  | "expense"
  | "liquidity"
  | "compliance"
  | "operational";

export type InsightSeverity = "INFO" | "WARNING" | "CRITICAL";

export type InsightSourceType = "briefing" | "scenario" | "recommendation" | "system";

export type PriorityUrgency = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type PriorityStatus = "OPEN" | "IN_PROGRESS" | "COMPLETED" | "DEFERRED";

export type DecisionType =
  | "strategic"
  | "operational"
  | "financial"
  | "risk"
  | "investment";

export type DecisionStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "DEFERRED"
  | "EXECUTED";

export type RecommendationCategory =
  | "cash"
  | "liquidity"
  | "working_capital"
  | "revenue"
  | "expense"
  | "treasury"
  | "compliance"
  | "risk"
  | "close"
  | "strategic";

export type RecommendationStatus =
  | "PENDING"
  | "ACKNOWLEDGED"
  | "ACCEPTED"
  | "REJECTED"
  | "EXECUTED";

export type ConversationRole = "user" | "advisor" | "system";

export type ContentType =
  | "text"
  | "briefing"
  | "recommendation"
  | "scenario"
  | "evidence"
  | "decision";

export type BoardPackStatus =
  | "DRAFT"
  | "GENERATING"
  | "READY"
  | "DISTRIBUTED";

// ── Domain Interfaces ──────────────────────────────────────────────────

export interface ExecutiveBriefing {
  id: string;
  companyId: string;
  briefingDate: string;
  period: BriefingPeriod;
  status: BriefingStatus;
  cashPosition: Record<string, unknown>;
  liquidity: Record<string, unknown>;
  workingCapital: Record<string, unknown>;
  revenueTrends: Record<string, unknown>;
  expenseTrends: Record<string, unknown>;
  treasuryHealth: Record<string, unknown>;
  financialIntegrity: Record<string, unknown>;
  closeReadiness: Record<string, unknown>;
  complianceHealth: Record<string, unknown>;
  operationalRisks: unknown[];
  significantAnomalies: unknown[];
  criticalAlerts: unknown[];
  openApprovals: unknown[];
  recommendedActions: unknown[];
  executiveSummary: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ExecutiveRecommendation {
  id: string;
  companyId: string;
  briefingId: string | null;
  category: RecommendationCategory;
  title: string;
  executiveSummary: string;
  businessReason: string;
  financialImpact: Record<string, unknown>;
  confidence: number;
  riskLevel: PriorityUrgency;
  priority: number;
  status: RecommendationStatus;
  requiredApprovals: string[];
  suggestedNextSteps: unknown[];
  evidenceIds: string[];
  agentDecisionId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ScenarioAnalysis {
  id: string;
  companyId: string;
  name: string;
  description: string;
  scenarioType: ScenarioType;
  status: ScenarioStatus;
  parameters: Record<string, unknown>;
  assumptions: unknown[];
  results: Record<string, unknown>;
  riskAssessment: Record<string, unknown>;
  recommendations: unknown[];
  sensitivityAnalysis: Record<string, unknown>;
  runAt: string | null;
  completedAt: string | null;
  duration: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ScenarioExecution {
  id: string;
  companyId: string;
  scenarioId: string;
  status: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  error: Record<string, unknown> | null;
  startedAt: string;
  completedAt: string | null;
  duration: number | null;
  createdAt: string;
}

export interface ExecutiveConversation {
  id: string;
  companyId: string;
  userId: string;
  title: string;
  status: string;
  context: Record<string, unknown>;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ExecutiveMessage {
  id: string;
  companyId: string;
  conversationId: string;
  role: ConversationRole;
  content: string;
  contentType: ContentType;
  references: unknown[];
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface ExecutiveInsight {
  id: string;
  companyId: string;
  insightType: InsightType;
  category: InsightCategory;
  title: string;
  description: string;
  severity: InsightSeverity;
  data: Record<string, unknown>;
  sourceType: InsightSourceType;
  sourceId: string | null;
  acknowledged: boolean;
  acknowledgedAt: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface ExecutivePriority {
  id: string;
  companyId: string;
  title: string;
  description: string;
  priorityType: string;
  urgency: PriorityUrgency;
  status: PriorityStatus;
  dueDate: string | null;
  referenceType: string | null;
  referenceId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ExecutiveDecision {
  id: string;
  companyId: string;
  title: string;
  description: string;
  decisionType: DecisionType;
  status: DecisionStatus;
  recommendation: string;
  reasoning: string;
  evidence: unknown[];
  alternatives: unknown[];
  financialImpact: Record<string, unknown>;
  riskLevel: PriorityUrgency;
  approvedBy: string | null;
  approvedAt: string | null;
  executedAt: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ExecutiveWorkspacePreference {
  id: string;
  companyId: string;
  userId: string;
  layout: Record<string, unknown>;
  pinnedWidgets: string[];
  hiddenWidgets: string[];
  briefingTime: string | null;
  notificationPrefs: Record<string, unknown>;
  theme: string;
  config: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ExecutiveBoardPack {
  id: string;
  companyId: string;
  title: string;
  period: string;
  year: number;
  status: BoardPackStatus;
  sections: unknown[];
  highlights: Record<string, unknown>;
  commentary: Record<string, unknown>;
  risks: unknown[];
  opportunities: unknown[];
  capitalAllocation: Record<string, unknown>;
  cashStrategy: Record<string, unknown>;
  distributedAt: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// ── Input Types ────────────────────────────────────────────────────────

export interface GenerateBriefingInput {
  period?: BriefingPeriod;
  briefingDate?: string;
}

export interface CreateRecommendationInput {
  briefingId?: string;
  category: RecommendationCategory;
  title: string;
  executiveSummary?: string;
  businessReason?: string;
  financialImpact?: Record<string, unknown>;
  confidence?: number;
  riskLevel?: PriorityUrgency;
  priority?: number;
  requiredApprovals?: string[];
  suggestedNextSteps?: unknown[];
  evidenceIds?: string[];
  agentDecisionId?: string;
}

export interface RunScenarioInput {
  name: string;
  description?: string;
  scenarioType: ScenarioType;
  parameters?: Record<string, unknown>;
  assumptions?: unknown[];
}

export interface CreateConversationInput {
  userId: string;
  title?: string;
}

export interface SendMessageInput {
  conversationId: string;
  content: string;
  contentType?: ContentType;
  references?: unknown[];
}

export interface CreatePriorityInput {
  title: string;
  description?: string;
  priorityType: string;
  urgency?: PriorityUrgency;
  dueDate?: string;
  referenceType?: string;
  referenceId?: string;
}

export interface CreateDecisionInput {
  title: string;
  description?: string;
  decisionType: DecisionType;
  recommendation?: string;
  reasoning?: string;
  riskLevel?: PriorityUrgency;
  evidence?: unknown[];
  alternatives?: unknown[];
  financialImpact?: Record<string, unknown>;
}

export interface UpdateWorkspacePreferencesInput {
  layout?: Record<string, unknown>;
  pinnedWidgets?: string[];
  hiddenWidgets?: string[];
  briefingTime?: string;
  notificationPrefs?: Record<string, unknown>;
  theme?: string;
  config?: Record<string, unknown>;
}

// ── Query Types ────────────────────────────────────────────────────────

export interface BriefingQuery {
  period?: BriefingPeriod;
  status?: BriefingStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface RecommendationQuery {
  category?: RecommendationCategory;
  status?: RecommendationStatus;
  riskLevel?: PriorityUrgency;
  page?: number;
  limit?: number;
}

export interface ScenarioQuery {
  scenarioType?: ScenarioType;
  status?: ScenarioStatus;
  page?: number;
  limit?: number;
}

export interface InsightQuery {
  insightType?: InsightType;
  category?: InsightCategory;
  severity?: InsightSeverity;
  acknowledged?: boolean;
  page?: number;
  limit?: number;
}

export interface PriorityQuery {
  urgency?: PriorityUrgency;
  status?: PriorityStatus;
  priorityType?: string;
  page?: number;
  limit?: number;
}

export interface DecisionQuery {
  decisionType?: DecisionType;
  status?: DecisionStatus;
  riskLevel?: PriorityUrgency;
  page?: number;
  limit?: number;
}

// ── Response Types ─────────────────────────────────────────────────────

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CFODashboardData {
  briefing: ExecutiveBriefing | null;
  priorities: ExecutivePriority[];
  recommendations: ExecutiveRecommendation[];
  insights: ExecutiveInsight[];
  decisions: ExecutiveDecision[];
  scenarios: ScenarioAnalysis[];
  conversationCount: number;
}
