export type ForecastStatus = "draft" | "approved" | "locked" | "superseded";
export type ScenarioType = "base" | "optimistic" | "pessimistic" | "expansion" | "recession" | "acquisition" | "capital_raise" | "fx_shock" | "interest_shock" | "supply_chain" | "customer_default" | "pandemic" | "custom";
export type StressType = "revenue_decline" | "expense_increase" | "delayed_collections" | "bank_failure" | "currency_crash" | "interest_increase" | "credit_event" | "supply_disruption" | "payroll_shock" | "black_swan";
export type RiskLevel = "low" | "medium" | "high" | "critical";
export type CashCategory = "operating" | "investing" | "financing" | "fx" | "tax";
export type ForecastHorizon = "weekly" | "monthly" | "quarterly" | "annual";

export interface DashboardFilters {
  entity: string | null;
  region: string | null;
  currency: string | null;
  forecastHorizon: string | null;
  scenario: string | null;
  businessUnit: string | null;
  forecastType: string | null;
  confidence: string | null;
  riskLevel: string | null;
  liquidityTier: string | null;
  cashCategory: string | null;
  department: string | null;
  dateRange: [string, string] | null;
  status: string | null;
  owner: string | null;
}

export interface CashForecast {
  id: string;
  entity: string;
  region: string;
  currency: string;
  period: string;
  horizon: ForecastHorizon;
  openingCash: number;
  inflows: number;
  outflows: number;
  operatingCash: number;
  investingCash: number;
  financingCash: number;
  fxImpact: number;
  taxes: number;
  endingCash: number;
  variance: number;
  variancePercent: number;
  confidence: number;
  status: ForecastStatus;
  owner: string;
  approvals: string[];
  notes: string;
}

export interface ForecastScenario {
  id: string;
  name: string;
  type: ScenarioType;
  description: string;
  entity: string;
  currency: string;
  probability: number;
  impact: number;
  upside: number;
  downside: number;
  projectedCash: number;
  liquidityScore: number;
  fundingGap: number;
  cashRunway: number;
  risk: RiskLevel;
  assumptions: string[];
  factors: string[];
  createdBy: string;
  createdAt: string;
}

export interface StressTestResult {
  id: string;
  name: string;
  type: StressType;
  severity: RiskLevel;
  impact: number;
  impactPercent: number;
  liquidityAfter: number;
  survivalMonths: number;
  fundingGap: number;
  recoveryTime: string;
  affectedEntities: string[];
  affectedCurrencies: string[];
  triggeredBy: string;
  probability: number;
}

export interface VarianceRecord {
  id: string;
  period: string;
  entity: string;
  currency: string;
  forecastType: string;
  category: CashCategory;
  forecasted: number;
  actual: number;
  variance: number;
  variancePercent: number;
  reason: string;
  owner: string;
  status: "open" | "investigating" | "explained" | "resolved";
}

export interface FundingProjection {
  id: string;
  period: string;
  entity: string;
  currency: string;
  fundingRequired: number;
  fundingAvailable: number;
  fundingGap: number;
  gapPercent: number;
  source: string;
  priority: "critical" | "high" | "medium" | "low";
  maturityDate: string;
  status: "projected" | "committed" | "secured" | "overdue";
}

export interface LiquidityProjection {
  id: string;
  period: string;
  entity: string;
  currency: string;
  projectedLiquidity: number;
  minimumLiquidity: number;
  liquidityBuffer: number;
  availableCash: number;
  restrictedCash: number;
  liquidityRatio: number;
  coverageDays: number;
  status: "healthy" | "warning" | "critical";
}

export interface ForecastAssumption {
  id: string;
  category: string;
  name: string;
  currentValue: number;
  previousValue: number;
  change: number;
  changePercent: number;
  trend: "up" | "down" | "stable";
  confidence: number;
  source: string;
  lastUpdated: string;
  sensitivity: "low" | "medium" | "high";
}

export interface ForecastAlert {
  id: string;
  category: string;
  severity: "info" | "warning" | "critical" | "emergency";
  title: string;
  message: string;
  entity: string;
  forecastPeriod: string;
  suggestedAction: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface ForecastRecommendation {
  id: string;
  title: string;
  description: string;
  impact: number;
  impactLabel: string;
  priority: "critical" | "high" | "medium" | "low";
  category: string;
  entity: string;
  roi: string;
}

export interface ExecutiveInsight {
  label: string;
  value: string;
  description: string;
  entity: string;
  severity: "positive" | "warning" | "critical";
}

export interface ForecastMetrics {
  forecastHorizon: string;
  forecastConfidence: number;
  cashRunway: number;
  projectedEndingCash: number;
  fundingRequirement: number;
  expectedLiquidity: number;
  scenarioCount: number;
  stressTestCount: number;
  forecastAccuracy: number;
  cashBurn: number;
  largestRisk: string;
  largestOpportunity: string;
  entities: number;
  regions: number;
  currencies: number;
  alerts: number;
  trend: "up" | "down" | "stable";
  lastUpdated: string;
}

export interface SensitivityResult {
  variable: string;
  impact: number;
  probability: number;
  sensitivity: "low" | "medium" | "high";
  direction: "positive" | "negative";
}

export interface ScenarioComparison {
  scenario: string;
  projectedCash: number;
  liquidity: number;
  fundingGap: number;
  cashRunway: number;
  confidence: number;
  risk: RiskLevel;
}

export interface TrendPoint {
  date: string;
  value: number;
  label: string;
}

export interface AnalyticsSeries {
  name: string;
  data: TrendPoint[];
  color: string;
}
