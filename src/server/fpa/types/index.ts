export type PlanType = "annual" | "quarterly" | "monthly" | "rolling" | "strategic";
export type ForecastType = string;
export type ScenarioType = string;
export type PlanStatus = string;
export type VarianceType = string;
export type VarianceDirection = "favorable" | "unfavorable" | "neutral";
export type DriverCategory = "revenue" | "volume" | "pricing" | "headcount" | "salary" | "utilization" | "inflation" | "fx" | "capitalSpend" | "opex";
export type DriverTimePeriod = "monthly" | "quarterly" | "annual";
export type AlertSeverity = "info" | "warning" | "critical" | "emergency";
export type AlertCategory = "budget" | "forecast" | "scenario" | "variance" | "workforce" | "capital" | "cash" | "compliance";
export type RecommendationType = "budget" | "forecast" | "scenario" | "cost" | "revenue" | "workforce" | "capital" | "strategic";
export type PlanningCurrency = "USD" | "EUR" | "GBP" | "SGD" | "CNY" | "BRL" | "INR" | "JPY" | "CHF" | "AUD";

export interface BudgetPlan {
  id: string;
  planType: PlanType;
  fiscalYear: number;
  fiscalPeriod: number;
  label: string;
  status: PlanStatus;
  department?: string;
  costCenter?: string;
  entityId?: string;
  currency: PlanningCurrency;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  totalCapital: number;
  totalCashFlow: number;
  headcount: number;
  version: number;
  parentPlanId?: string;
  notes?: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetLineItem {
  id: string;
  planId: string;
  accountCode: string;
  accountName: string;
  category: string;
  amount: number;
  currency: PlanningCurrency;
  period: string;
  driverType?: string;
  driverValue?: number;
  notes?: string;
  sortOrder: number;
}

export interface Forecast {
  id: string;
  forecastType: ForecastType;
  fiscalYear: number;
  fiscalPeriod: number;
  label: string;
  status: PlanStatus;
  version: number;
  confidenceLevel: number;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  totalCapital: number;
  totalCashFlow: number;
  headcount: number;
  currency: PlanningCurrency;
  department?: string;
  entityId?: string;
  baselinePlanId?: string;
  notes?: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ForecastLineItem {
  id: string;
  forecastId: string;
  accountCode: string;
  accountName: string;
  category: string;
  amount: number;
  currency: PlanningCurrency;
  period: string;
  confidenceLower?: number;
  confidenceUpper?: number;
  driverValue?: number;
  notes?: string;
}

export interface Scenario {
  id: string;
  scenarioType: ScenarioType;
  name: string;
  description: string;
  fiscalYear: number;
  status: PlanStatus;
  assumptions: ScenarioAssumption[];
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  totalCapital: number;
  totalCashFlow: number;
  basePlanId: string;
  varianceAmount: number;
  variancePercent: number;
  riskLevel: "low" | "medium" | "high";
  probability: number;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScenarioAssumption {
  id: string;
  scenarioId: string;
  driver: DriverCategory;
  label: string;
  baseValue: number;
  scenarioValue: number;
  changePercent: number;
  impact: number;
}

export interface DriverDefinition {
  id: string;
  name: string;
  category: DriverCategory;
  description: string;
  unit: string;
  value: number;
  previousValue: number;
  growthRate: number;
  source: "manual" | "historical" | "external";
  period: DriverTimePeriod;
  department?: string;
  entityId?: string;
  isActive: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkforcePlan {
  id: string;
  planId: string;
  department: string;
  fiscalYear: number;
  headcountCurrent: number;
  headcountPlanned: number;
  headcountNewHires: number;
  headcountAttrition: number;
  averageSalary: number;
  totalSalaryCost: number;
  benefitsCost: number;
  payrollTax: number;
  totalCompensation: number;
  currency: PlanningCurrency;
  vacancyRate: number;
  attritionRate: number;
  createdBy: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
  category?: WorkforceCategory;
  items?: WorkforcePlanItem[];
}

export interface RevenuePlan {
  id: string;
  planId: string;
  productLine: string;
  revenueType: "product" | "service" | "subscription" | "other";
  volume: number;
  unitPrice: number;
  revenue: number;
  costOfGoodsSold: number;
  grossMargin: number;
  grossMarginPercent: number;
  growthRate: number;
  marketShare?: number;
  currency: PlanningCurrency;
  period: string;
  department?: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
  driver?: RevenueDriver;
  fiscalYear?: number;
  items?: RevenuePlanItem[];
}

export interface ExpensePlan {
  id: string;
  planId: string;
  department: string;
  expenseType: "fixed" | "variable" | "semiVariable";
  category: string;
  amount: number;
  currency: PlanningCurrency;
  period: string;
  costDriver?: string;
  driverValue?: number;
  isDiscretionary: boolean;
  notes?: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
  fiscalYear?: number;
  items?: ExpensePlanItem[];
}

export interface CapitalPlan {
  id: string;
  planId: string;
  projectName: string;
  projectType: "it" | "equipment" | "facilities" | "rAndD" | "other";
  totalBudget: number;
  spentToDate: number;
  remainingBudget: number;
  currency: PlanningCurrency;
  startDate: Date;
  endDate: Date;
  status: "planned" | "approved" | "inProgress" | "completed" | "cancelled";
  roi: number;
  paybackPeriod: number;
  priority: "low" | "medium" | "high" | "critical";
  department: string;
  sponsor: string;
  notes?: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
  category?: CapitalCategory;
  fiscalYear?: number;
  items?: CapitalPlanItemBackward[];
}

export interface CashPlan {
  id: string;
  planId: string;
  period: string;
  beginningCash: number;
  operatingInflows: number;
  operatingOutflows: number;
  netOperatingCash: number;
  investingInflows: number;
  investingOutflows: number;
  netInvestingCash: number;
  financingInflows: number;
  financingOutflows: number;
  netFinancingCash: number;
  netCashChange: number;
  endingCash: number;
  currency: PlanningCurrency;
  minimumCashTarget: number;
  excessCash: number;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VarianceAnalysisRecord {
  id: string;
  varianceType: VarianceType;
  fiscalYear: number;
  fiscalPeriod: number;
  accountCode: string;
  accountName: string;
  category: string;
  department?: string;
  actualAmount: number;
  planAmount: number;
  variance: number;
  variancePercent: number;
  direction: VarianceDirection;
  isSignificant: boolean;
  threshold: number;
  rootCause?: string;
  actionPlan?: string;
  currency: PlanningCurrency;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WhatIfAnalysis {
  id: string;
  name: string;
  description: string;
  baseScenarioId: string;
  adjustedScenarioId: string;
  fiscalYear: number;
  status: "draft" | "completed" | "reviewed";
  totalRevenueImpact: number;
  totalExpenseImpact: number;
  netIncomeImpact: number;
  totalCapitalImpact: number;
  totalCashImpact: number;
  assumptions: WhatIfAssumption[];
  results: WhatIfResult[];
  createdBy: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WhatIfAssumption {
  id: string;
  analysisId: string;
  driver: DriverCategory;
  label: string;
  baseValue: number;
  adjustedValue: number;
  changePercent: number;
}

export interface WhatIfResult {
  id: string;
  analysisId: string;
  metric: string;
  baseValue: number;
  adjustedValue: number;
  impact: number;
  impactPercent: number;
}

export interface StrategicPlan {
  id: string;
  name: string;
  description: string;
  fiscalYearStart: number;
  fiscalYearEnd: number;
  status: PlanStatus;
  vision: string;
  mission: string;
  objectives: StrategicObjective[];
  totalRevenue: number;
  totalExpenses: number;
  totalInvestment: number;
  projectedROI: number;
  currency: PlanningCurrency;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StrategicObjective {
  id: string;
  planId: string;
  objective: string;
  keyResults: StrategicKeyResult[];
  priority: "low" | "medium" | "high" | "critical";
  status: "notStarted" | "inProgress" | "onTrack" | "atRisk" | "completed";
  targetDate: Date;
  owner: string;
}

export interface StrategicKeyResult {
  id: string;
  objectiveId: string;
  metric: string;
  baseline: number;
  target: number;
  current: number;
  unit: string;
}

export interface PlanningAlert {
  id: string;
  type: AlertCategory;
  severity: AlertSeverity;
  title: string;
  message: string;
  planId?: string;
  isRead: boolean;
  isResolved: boolean;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  companyId: string;
  createdAt: Date;
}

export interface PlanningRecommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "active" | "implemented" | "dismissed";
  impact: string;
  effort: "low" | "medium" | "high";
  estimatedSavings?: number;
  planId?: string;
  companyId: string;
  createdAt: Date;
}

export interface PlanningKPI {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: "improving" | "worsening" | "stable";
  category: "budget" | "forecast" | "variance" | "workforce" | "capital" | "cash";
  status: "onTrack" | "atRisk" | "critical" | "exceeding";
  companyId: string;
}

export interface AggregatePlanningMetrics {
  totalPlans: number;
  activePlans: number;
  approvedPlans: number;
  totalRevenueBudget: number;
  totalExpenseBudget: number;
  totalCapitalBudget: number;
  totalForecasts: number;
  activeForecasts: number;
  totalScenarios: number;
  totalWhatIfAnalyses: number;
  totalWorkforcePlanned: number;
  totalCapitalProjects: number;
  totalStrategicPlans: number;
  budgetVariancePercent: number;
  forecastAccuracyPercent: number;
  planningCycleDays: number;
  scenarioCoverage: number;
}

export interface ExecutivePlanningSummary {
  activePlanLabel: string;
  totalRevenueBudget: number;
  totalExpenseBudget: number;
  budgetNetIncome: number;
  totalCapitalBudget: number;
  totalCashForecast: number;
  totalHeadcountPlanned: number;
  revenueForecast: number;
  expenseForecast: number;
  forecastNetIncome: number;
  budgetVariance: number;
  budgetVariancePercent: number;
  forecastConfidence: number;
  activeScenarios: number;
  pendingApprovals: number;
  varianceSignificant: number;
  openAlerts: number;
  capitalsProjectsActive: number;
  strategicPlansActive: number;
}

export interface ScenarioComparison {
  scenarioId: string;
  scenarioName: string;
  scenarioType: ScenarioType;
  revenue: number;
  expenses: number;
  netIncome: number;
  capital: number;
  cashFlow: number;
  varianceFromBase: number;
  variancePercentFromBase: number;
  riskLevel: string;
  probability: number;
}

// ── Backward-compatible type aliases (old system types) ──
export type BudgetStatus = "draft" | "active" | "locked" | "archived"
export type BudgetType = string
export type BudgetVersion = "draft" | "v1" | "v2" | "v3"
export type ForecastScenario = string
export type ForecastMethod = string
export type RollingForecastWindow = string
export type PlanningLevel = string
export type RevenueDriver = string
export type ExpenseCategory = "fixed" | "variable" | "semi_variable"
export type WorkforceCategory = "permanent" | "contract" | "temporary" | "executive"
export type CapitalCategory = string
export type AllocationMethod = string
export type ScorecardType = string
export type FPAKpiCategory = "budget" | "forecast" | "variance" | "workforce" | "capital" | "cash"

export interface FPABudgetItem { id: string; budgetId: string; accountCode: string; accountName: string; amount?: number; budgetAmount?: number; actualAmount?: number; variance?: number; variancePercent?: number; period: string; notes?: string; accountId?: string; [key: string]: unknown }
export interface FPABudget { id: string; label?: string; name?: string; type: BudgetType; status: BudgetStatus; fiscalYear: number; totalAmount: number; items: FPABudgetItem[]; companyId: string; createdAt: Date; [key: string]: unknown }
export interface FPAForecastItem { id: string; forecastId: string; accountCode: string; accountName: string; amount?: number; period: string; actualAmount?: number; forecastAmount?: number; notes?: string; [key: string]: unknown }
export interface FPAForecast { id: string; label?: string; name?: string; type: ForecastType; scenario: ForecastScenario; method: ForecastMethod; period: string; status?: PlanStatus; fiscalYear?: number; totalAmount: number; items: FPAForecastItem[]; confidence: number; companyId: string; createdAt: Date; [key: string]: unknown }
export interface RollingForecastItem { id: string; forecastId?: string; rollingForecastId?: string; period: string; amount?: number; forecastAmount?: number; actualAmount?: number; [key: string]: unknown }
export interface RollingForecast { id: string; label?: string; name?: string; fiscalYear?: number; period?: string; status: PlanStatus; totalAmount?: number; items: RollingForecastItem[]; companyId: string; createdAt: Date; [key: string]: unknown }
export interface VarianceRecord { id: string; fiscalYear?: number; accountCode: string; accountName: string; actualAmount: number; planAmount?: number; variance?: number; variancePercent?: number; severity: "low" | "medium" | "high" | "critical"; type: VarianceType; direction: VarianceDirection; period: string; companyId: string; budgetAmount?: number; forecastAmount?: number; absoluteVariance?: number; percentageVariance?: number; driver?: string; rootCause?: string; accountId?: string; createdAt: Date; [key: string]: unknown }
export interface FPAScenario { id: string; name: string; type: ScenarioType; status: PlanStatus; revenue?: number; expenses?: number; netIncome?: number; capital?: number; cashFlow?: number; riskLevel?: "low" | "medium" | "high"; probability?: number; companyId: string; createdAt: Date; [key: string]: unknown }
export interface ScenarioImpact { scenarioId?: string; metric: string; baseValue?: number; adjustedValue?: number; impact?: number; impactPercent?: number; baseline?: number; impacted?: number; variance?: number; variancePercent?: number; accountId?: string; accountCode?: string; accountName?: string; [key: string]: unknown }
export interface RevenuePlanItem { id: string; planId: string; revenueType: string; amount: number; period: string; [key: string]: unknown }
export interface ExpensePlanItem { id: string; planId: string; accountCode: string; amount: number; period: string; headcount?: number; departmentId?: string; isDiscretionary?: boolean; [key: string]: unknown }
export interface WorkforcePlanItem { id: string; planId: string; department: string; headcount: number; salary: number; totalCompensation: number; period: string; [key: string]: unknown }
export interface CapitalPlanItemBackward { id: string; planId: string; itemName: string; amount: number; period: string; [key: string]: unknown }
export type CapitalPlanItem = CapitalPlanItemBackward;
export type FPAExecutiveSummary = ExecutivePlanningSummary;
export interface CostCenter { id: string; code: string; name: string; description: string; department: string; status: "active" | "inactive" | "frozen"; parentId?: string; manager?: string; budget?: number; actual?: number; budgetAmount?: number; actualAmount?: number; level?: number; path?: string; companyId: string; createdAt: Date; [key: string]: unknown }
export interface ProfitCenter { id: string; code: string; name: string; businessUnit: string; region: string; revenue: number; cost: number; profit?: number; margin?: number; marginPercent?: number; product?: string; parentId?: string; level?: number; path?: string; companyId: string; createdAt: Date; [key: string]: unknown }
export interface FPAAllocation { id: string; sourceCostCenterId: string; targetCostCenterId?: string; targetCostCenterIds?: string[]; method: AllocationMethod; percentage?: number; isActive: boolean; amount?: number; fixedAmounts?: Record<string, number>; percentages?: Record<string, number>; period?: string; companyId: string; name?: string; description?: string; createdAt: Date; [key: string]: unknown }
export interface FPAKPI { id: string; name: string; value: number; target: number; status: string; category: string; trend: string; companyId: string; [key: string]: unknown }
export interface FPAScorecard { id: string; name: string; type: ScorecardType; percentage: number; status: string; period: string; companyId: string; createdAt: Date; [key: string]: unknown }
export interface FPAAlert { id: string; type: string; severity: string; title: string; message: string; dismissed: boolean; isRead?: boolean; isResolved?: boolean; planId?: string; companyId: string; period?: string; actionRequired?: string; createdAt: Date; [key: string]: unknown }
export interface FPARecommendation { id: string; type: string; title: string; description: string; priority?: string; status?: string; impact?: string; confidence?: number; period?: string; implemented?: boolean; planId?: string; companyId: string; createdAt: Date; [key: string]: unknown }
export interface PlanningTrend { id?: string; metric: string; period: string; value: number; previousValue: number; change: number; changePercent: number; direction?: string; [key: string]: unknown }
export interface ForecastRevision { id: string; forecastId: string; revisionNumber?: number; previousForecast?: number; newForecast?: number; previousAmount?: number; newAmount?: number; reason: string; revisedBy: string; revisedAt: Date; [key: string]: unknown }

export function computeMargin(revenue: number, cost: number): number {
  return revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0
}

export interface DriverImpactReport {
  driver: string;
  category: DriverCategory;
  baseValue: number;
  currentValue: number;
  changePercent: number;
  revenueImpact: number;
  expenseImpact: number;
  netIncomeImpact: number;
}
