// ─────────────────────────────────────────────────────────────
// Enterprise FP&A Specialist — Type Definitions
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";

// ─── Plan Types ────────────────────────────────────────────

export type PlanType =
  | "strategic"
  | "annual"
  | "rolling"
  | "projected"
  | "long_range"
  | "contingency";

export type PlanningCycleType =
  | "annual"
  | "quarterly"
  | "monthly"
  | "rolling_12"
  | "rolling_3"
  | "ad_hoc";

export type BudgetType =
  | "operating"
  | "capital"
  | "project"
  | "department"
  | "zero_based"
  | "incremental"
  | "activity_based";

// ─── Forecast Types ────────────────────────────────────────

export type ForecastType =
  | "revenue"
  | "expense"
  | "cash_flow"
  | "balance_sheet"
  | "headcount"
  | "working_capital";

export type ForecastHorizon =
  | "weekly"
  | "monthly"
  | "quarterly"
  | "semi_annual"
  | "annual"
  | "multi_year";

// ─── Scenario Types ───────────────────────────────────────

export type ScenarioType =
  | "base"
  | "optimistic"
  | "pessimistic"
  | "stress_test"
  | "what_if"
  | "monte_carlo"
  | "sensitivity"
  | "custom";

// ─── Driver Types ──────────────────────────────────────────

export type DriverCategory =
  | "revenue"
  | "cost"
  | "volume"
  | "price"
  | "headcount"
  | "productivity"
  | "market"
  | "macroeconomic"
  | "operational"
  | "financial";

// ─── Variance Types ────────────────────────────────────────

export type VarianceAnalysisType =
  | "budget_vs_actual"
  | "forecast_vs_actual"
  | "period_over_period"
  | "year_over_year"
  | "rolling_variance"
  | "bridge_analysis";

// ─── Capital Types ─────────────────────────────────────────

export type CapitalPlanStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "implemented"
  | "completed";

export type InvestmentType =
  | "infrastructure"
  | "technology"
  | "acquisition"
  | "rnd"
  | "market_expansion"
  | "working_capital"
  | "maintenance"
  | "strategic";

export type InvestmentStatus =
  | "proposed"
  | "evaluated"
  | "approved"
  | "funded"
  | "in_progress"
  | "completed"
  | "deferred"
  | "cancelled";

export type InvestmentPriority =
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "backlog";

// ─── Initiative Types ──────────────────────────────────────

export type InitiativeType =
  | "cost_reduction"
  | "revenue_growth"
  | "efficiency"
  | "digital_transformation"
  | "market_entry"
  | "product_development"
  | "compliance"
  | "sustainability";

export type InitiativeStatus =
  | "proposed"
  | "planned"
  | "active"
  | "on_track"
  | "at_risk"
  | "delayed"
  | "completed"
  | "cancelled";

// ─── Recommendation Types ──────────────────────────────────

export type RecommendationCategory =
  | "cost_optimization"
  | "revenue_enhancement"
  | "capital_allocation"
  | "risk_mitigation"
  | "process_improvement"
  | "strategic_realignment"
  | "resource_optimization"
  | "compliance_action";

export type RiskLevel =
  | "low"
  | "medium"
  | "high"
  | "critical";

// ─── Briefing Types ────────────────────────────────────────

export type BriefingType =
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "ad_hoc"
  | "board_summary"
  | "variance_deep_dive"
  | "forecast_review"
  | "capital_review";

// ─── Dashboard Interfaces ──────────────────────────────────

export interface FPADashboardData {
  period: string;
  overallScore: Prisma.Decimal;
  activePlans: number;
  activeBudgets: number;
  activeForecasts: number;
  openScenarios: number;
  totalDrivers: number;
  pendingProposals: number;
  budgetVariance: Prisma.Decimal;
  forecastAccuracy: Prisma.Decimal;
  capitalUtilization: Prisma.Decimal;
  topVariances: VarianceSummaryRecord[];
  recentRecommendations: RecommendationRecord[];
  upcomingDeadlines: PlanningDeadlineRecord[];
}

export interface VarianceSummaryRecord {
  id: string;
  name: string;
  varianceType: VarianceAnalysisType;
  variancePercent: Prisma.Decimal;
  materialityFlag: boolean;
  period: string;
}

export interface RecommendationRecord {
  id: string;
  category: RecommendationCategory;
  title: string;
  description: string;
  riskLevel: RiskLevel;
  estimatedImpact: Prisma.Decimal;
  status: string;
}

export interface PlanningDeadlineRecord {
  id: string;
  deadlineType: string;
  title: string;
  dueDate: Date;
  status: string;
  daysUntilDue: number;
}

// ─── Planning Interfaces ───────────────────────────────────

export interface StrategicPlan {
  id: string;
  companyId: string;
  planType: PlanType;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: string;
  version: number;
  metadata?: Record<string, unknown>;
}

export interface PlanningCycle {
  id: string;
  companyId: string;
  cycleType: PlanningCycleType;
  name: string;
  startDate: Date;
  endDate: Date;
  status: string;
  lockedAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface PlanningHealth {
  overallScore: Prisma.Decimal;
  activePlans: number;
  lockedCycles: number;
  pendingApprovals: number;
  onTrackInitiatives: number;
  atRiskInitiatives: number;
  overdueActions: number;
}

// ─── Budget Interfaces ─────────────────────────────────────

export interface Budget {
  id: string;
  companyId: string;
  budgetType: BudgetType;
  name: string;
  description: string;
  fiscalYear: number;
  status: string;
  lockedAt?: Date;
  version: number;
  metadata?: Record<string, unknown>;
}

export interface BudgetVersion {
  id: string;
  budgetId: string;
  versionNumber: number;
  name: string;
  status: string;
  totalAmount: Prisma.Decimal;
  createdBy?: string;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

export interface BudgetLine {
  id: string;
  budgetId: string;
  versionId: string;
  accountCode: string;
  accountName: string;
  department?: string;
  description: string;
  budgetAmount: Prisma.Decimal;
  actualAmount: Prisma.Decimal;
  variance: Prisma.Decimal;
  variancePercent: Prisma.Decimal;
  metadata?: Record<string, unknown>;
}

export interface BudgetVariance {
  totalBudget: Prisma.Decimal;
  totalActual: Prisma.Decimal;
  totalVariance: Prisma.Decimal;
  variancePercent: Prisma.Decimal;
  lines: BudgetLine[];
  byDepartment: Record<string, Prisma.Decimal>;
  materialVariances: BudgetLine[];
}

// ─── Forecast Interfaces ───────────────────────────────────

export interface Forecast {
  id: string;
  companyId: string;
  forecastType: ForecastType;
  name: string;
  description: string;
  horizon: ForecastHorizon;
  status: string;
  version: number;
  metadata?: Record<string, unknown>;
}

export interface ForecastVersion {
  id: string;
  forecastId: string;
  versionNumber: number;
  name: string;
  status: string;
  totalAmount: Prisma.Decimal;
  createdBy?: string;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

export interface ForecastAccuracy {
  mape: Prisma.Decimal;
  mad: Prisma.Decimal;
  bias: Prisma.Decimal;
  accuracyScore: Prisma.Decimal;
  periods: ForecastAccuracyPeriod[];
}

export interface ForecastAccuracyPeriod {
  period: string;
  forecast: Prisma.Decimal;
  actual: Prisma.Decimal;
  error: Prisma.Decimal;
  errorPercent: Prisma.Decimal;
}

export interface ForecastTrend {
  forecastType: ForecastType;
  periods: ForecastTrendPeriod[];
  direction: "increasing" | "decreasing" | "stable";
  momentum: Prisma.Decimal;
}

export interface ForecastTrendPeriod {
  period: string;
  value: Prisma.Decimal;
  lowerBound?: Prisma.Decimal;
  upperBound?: Prisma.Decimal;
}

// ─── Scenario Interfaces ───────────────────────────────────

export interface Scenario {
  id: string;
  companyId: string;
  scenarioType: ScenarioType;
  name: string;
  description: string;
  status: string;
  assumptions: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface ScenarioResult {
  id: string;
  scenarioId: string;
  revenueImpact: Prisma.Decimal;
  expenseImpact: Prisma.Decimal;
  profitImpact: Prisma.Decimal;
  cashFlowImpact: Prisma.Decimal;
  riskScore: Prisma.Decimal;
  probability?: Prisma.Decimal;
  metrics: Record<string, Prisma.Decimal>;
  period: string;
}

export interface ScenarioComparison {
  scenarios: ScenarioSummary[];
  metrics: ComparisonMetric[];
}

export interface ScenarioSummary {
  id: string;
  name: string;
  scenarioType: ScenarioType;
  profitImpact: Prisma.Decimal;
  riskScore: Prisma.Decimal;
}

export interface ComparisonMetric {
  metric: string;
  values: Record<string, Prisma.Decimal>;
}

export interface ScenarioImpact {
  revenueChange: Prisma.Decimal;
  expenseChange: Prisma.Decimal;
  profitChange: Prisma.Decimal;
  cashFlowChange: Prisma.Decimal;
  roi?: Prisma.Decimal;
  paybackPeriod?: number;
  affectedDepartments: string[];
}

// ─── Driver Interfaces ─────────────────────────────────────

export interface BusinessDriver {
  id: string;
  companyId: string;
  category: DriverCategory;
  name: string;
  description: string;
  unit: string;
  currentValue: Prisma.Decimal;
  baseValue: Prisma.Decimal;
  lowerBound?: Prisma.Decimal;
  upperBound?: Prisma.Decimal;
  isActive: boolean;
  metadata?: Record<string, unknown>;
}

export interface DriverAssumption {
  id: string;
  companyId: string;
  driverId?: string;
  name: string;
  description: string;
  value: Prisma.Decimal;
  confidence: Prisma.Decimal;
  source: string;
  validFrom: Date;
  validTo?: Date;
  metadata?: Record<string, unknown>;
}

export interface SensitivityResult {
  driverId: string;
  driverName: string;
  range: SensitivityRange[];
  elasticity: Prisma.Decimal;
  impactRank: number;
}

export interface SensitivityRange {
  value: Prisma.Decimal;
  impact: Prisma.Decimal;
  impactPercent: Prisma.Decimal;
}

// ─── Variance Interfaces ───────────────────────────────────

export interface VarianceAnalysis {
  id: string;
  companyId: string;
  analysisType: VarianceAnalysisType;
  name: string;
  description: string;
  period: string;
  status: string;
  totalVariance: Prisma.Decimal;
  materialVariances: number;
  metadata?: Record<string, unknown>;
}

export interface VarianceTrend {
  analysisType: VarianceAnalysisType;
  periods: VarianceTrendPeriod[];
}

export interface VarianceTrendPeriod {
  period: string;
  variance: Prisma.Decimal;
  direction: "improving" | "deteriorating" | "stable";
}

export interface VarianceKeyDriver {
  name: string;
  impact: Prisma.Decimal;
  impactPercent: Prisma.Decimal;
  direction: "favorable" | "unfavorable";
  explanation: string;
}

// ─── Capital Interfaces ────────────────────────────────────

export interface CapitalPlan {
  id: string;
  companyId: string;
  name: string;
  description: string;
  totalBudget: Prisma.Decimal;
  utilizedBudget: Prisma.Decimal;
  status: CapitalPlanStatus;
  fiscalYear: number;
  metadata?: Record<string, unknown>;
}

export interface InvestmentProposal {
  id: string;
  companyId: string;
  capitalPlanId?: string;
  investmentType: InvestmentType;
  name: string;
  description: string;
  requestedAmount: Prisma.Decimal;
  approvedAmount?: Prisma.Decimal;
  status: InvestmentStatus;
  priority: InvestmentPriority;
  expectedROI?: Prisma.Decimal;
  paybackPeriod?: number;
  proposedBy?: string;
  metadata?: Record<string, unknown>;
}

export interface ROIAnalysis {
  proposalId: string;
  initialInvestment: Prisma.Decimal;
  annualReturn: Prisma.Decimal;
  roi: Prisma.Decimal;
  irr: Prisma.Decimal;
  npv: Prisma.Decimal;
  paybackPeriod: number;
  riskAdjustedReturn: Prisma.Decimal;
  cashFlows: CashFlowPeriod[];
}

export interface CashFlowPeriod {
  period: string;
  inflow: Prisma.Decimal;
  outflow: Prisma.Decimal;
  net: Prisma.Decimal;
  cumulative: Prisma.Decimal;
}

// ─── Executive Support Interfaces ──────────────────────────

export interface PlanningRecommendation {
  id: string;
  companyId: string;
  category: RecommendationCategory;
  title: string;
  description: string;
  rationale: string;
  riskLevel: RiskLevel;
  estimatedImpact: Prisma.Decimal;
  impactType: string;
  status: string;
  assignedTo?: string;
  dueDate?: Date;
  metadata?: Record<string, unknown>;
}

export interface StrategicKPIs {
  revenueGrowth: Prisma.Decimal;
  operatingMargin: Prisma.Decimal;
  roic: Prisma.Decimal;
  freeCashFlow: Prisma.Decimal;
  workingCapitalDays: number;
  budgetAdherence: Prisma.Decimal;
  forecastAccuracy: Prisma.Decimal;
  capitalEfficiency: Prisma.Decimal;
  initiativeCompletion: Prisma.Decimal;
  costPerEmployee: Prisma.Decimal;
}

export interface BoardPack {
  id: string;
  companyId: string;
  name: string;
  period: string;
  generatedAt: Date;
  sections: BoardPackSection[];
  executiveSummary: string;
  keyMetrics: BoardPackMetric[];
}

export interface BoardPackSection {
  title: string;
  content: string;
  metrics: BoardPackMetric[];
}

export interface BoardPackMetric {
  label: string;
  value: Prisma.Decimal;
  change?: Prisma.Decimal;
  trend?: "up" | "down" | "flat";
}

export interface StrategicInitiative {
  id: string;
  companyId: string;
  initiativeType: InitiativeType;
  name: string;
  description: string;
  status: InitiativeStatus;
  budget: Prisma.Decimal;
  spent: Prisma.Decimal;
  progress: number;
  startDate?: Date;
  targetDate?: Date;
  owner?: string;
  metadata?: Record<string, unknown>;
}

// ─── Briefing Interfaces ───────────────────────────────────

export interface FPABriefing {
  briefingType: BriefingType;
  generatedAt: Date;
  period: string;
  summary: string;
  keyMetrics: BriefingMetric[];
  criticalItems: BriefingItem[];
  topVariances: VarianceSummaryRecord[];
  forecastHighlights: string[];
  recommendations: string[];
}

export interface BriefingMetric {
  label: string;
  value: Prisma.Decimal;
  change?: Prisma.Decimal;
  trend?: "up" | "down" | "flat";
}

export interface BriefingItem {
  id: string;
  type: "variance" | "forecast" | "budget" | "proposal" | "initiative" | "deadline";
  title: string;
  description: string;
  severity: RiskLevel;
  actionRequired: boolean;
}

// ─── Input Types ───────────────────────────────────────────

export interface GetPlansInput {
  planType?: PlanType;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CreatePlanInput {
  planType: PlanType;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  metadata?: Record<string, unknown>;
}

export interface UpdatePlanInput {
  name?: string;
  description?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  metadata?: Record<string, unknown>;
}

export interface GetCyclesInput {
  cycleType?: PlanningCycleType;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface CreateCycleInput {
  cycleType: PlanningCycleType;
  name: string;
  startDate: Date;
  endDate: Date;
  metadata?: Record<string, unknown>;
}

export interface GetBudgetsInput {
  budgetType?: BudgetType;
  fiscalYear?: number;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CreateBudgetInput {
  budgetType: BudgetType;
  name: string;
  description: string;
  fiscalYear: number;
  metadata?: Record<string, unknown>;
}

export interface GetBudgetLinesInput {
  versionId?: string;
  department?: string;
  accountCode?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CreateBudgetLineInput {
  budgetId: string;
  versionId: string;
  accountCode: string;
  accountName: string;
  department?: string;
  description: string;
  budgetAmount: number;
  metadata?: Record<string, unknown>;
}

export interface UpdateBudgetLineInput {
  accountName?: string;
  department?: string;
  description?: string;
  budgetAmount?: number;
  metadata?: Record<string, unknown>;
}

export interface GetForecastsInput {
  forecastType?: ForecastType;
  horizon?: ForecastHorizon;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CreateForecastInput {
  forecastType: ForecastType;
  name: string;
  description: string;
  horizon: ForecastHorizon;
  metadata?: Record<string, unknown>;
}

export interface GetScenariosInput {
  scenarioType?: ScenarioType;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CreateScenarioInput {
  scenarioType: ScenarioType;
  name: string;
  description: string;
  assumptions: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface ExecuteScenarioInput {
  period: string;
  parameters?: Record<string, unknown>;
}

export interface CompareScenariosInput {
  scenarioIds: string[];
  metrics?: string[];
}

export interface GetDriversInput {
  category?: DriverCategory;
  isActive?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CreateDriverInput {
  category: DriverCategory;
  name: string;
  description: string;
  unit: string;
  currentValue: number;
  baseValue: number;
  lowerBound?: number;
  upperBound?: number;
  metadata?: Record<string, unknown>;
}

export interface UpdateDriverInput {
  name?: string;
  description?: string;
  unit?: string;
  currentValue?: number;
  baseValue?: number;
  lowerBound?: number;
  upperBound?: number;
  isActive?: boolean;
  metadata?: Record<string, unknown>;
}

export interface CreateAssumptionInput {
  driverId?: string;
  name: string;
  description: string;
  value: number;
  confidence: number;
  source: string;
  validFrom: Date;
  validTo?: Date;
  metadata?: Record<string, unknown>;
}

export interface SensitivityAnalysisInput {
  lowerBound: number;
  upperBound: number;
  steps: number;
}

export interface GetAnalysesInput {
  analysisType?: VarianceAnalysisType;
  period?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CreateAnalysisInput {
  analysisType: VarianceAnalysisType;
  name: string;
  description: string;
  period: string;
  metadata?: Record<string, unknown>;
}

export interface GetCapitalPlansInput {
  status?: CapitalPlanStatus;
  fiscalYear?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CreateCapitalPlanInput {
  name: string;
  description: string;
  totalBudget: number;
  fiscalYear: number;
  metadata?: Record<string, unknown>;
}

export interface GetProposalsInput {
  investmentType?: InvestmentType;
  status?: InvestmentStatus;
  priority?: InvestmentPriority;
  capitalPlanId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CreateProposalInput {
  capitalPlanId?: string;
  investmentType: InvestmentType;
  name: string;
  description: string;
  requestedAmount: number;
  priority: InvestmentPriority;
  expectedROI?: number;
  paybackPeriod?: number;
  proposedBy?: string;
  metadata?: Record<string, unknown>;
}

export interface GetRecommendationsInput {
  category?: RecommendationCategory;
  riskLevel?: RiskLevel;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CreateRecommendationInput {
  category: RecommendationCategory;
  title: string;
  description: string;
  rationale: string;
  riskLevel: RiskLevel;
  estimatedImpact: number;
  impactType: string;
  assignedTo?: string;
  dueDate?: Date;
  metadata?: Record<string, unknown>;
}

export interface GetBoardPacksInput {
  period?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface GetStrategicInitiativesInput {
  initiativeType?: InitiativeType;
  status?: InitiativeStatus;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface GetBriefingsInput {
  briefingType?: BriefingType;
  limit?: number;
  offset?: number;
}

export interface CreateBriefingInput {
  briefingType: BriefingType;
  period?: string;
  customNotes?: string;
}
