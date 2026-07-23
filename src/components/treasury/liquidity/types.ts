export interface DashboardFilters {
  region: string | null;
  legalEntity: string | null;
  businessUnit: string | null;
  currency: string | null;
  liquidityPool: string | null;
  forecastHorizon: string | null;
  fundingStatus: string | null;
  riskLevel: string | null;
  scenario: string | null;
  dateRange: [string, string] | null;
}

export interface LiquiditySummary {
  currentLiquidity: number;
  availableLiquidity: number;
  restrictedLiquidity: number;
  idleCash: number;
  netLiquidity: number;
  workingCapital: number;
  coverageRatio: number;
  liquidityBuffer: number;
  daysCashRemaining: number;
  forecastConfidence: number;
  entities: number;
  regions: number;
  currencies: number;
  fundingRequests: number;
  treasuryAlerts: number;
  lastUpdated: string;
  dailyDelta: number;
  dailyDeltaPercent: number;
  trend: "up" | "down" | "stable";
  status: "healthy" | "watch" | "critical";
}

export interface LiquidityPool {
  id: string;
  name: string;
  type: string;
  currentBalance: number;
  targetBalance: number;
  utilization: number;
  availablePercent: number;
  policyCompliance: "compliant" | "warning" | "violation";
  healthScore: number;
  recommendedTransfer: number;
  trend: "up" | "down" | "stable";
  currency: string;
  region: string;
  members: number;
}

export interface ForecastPeriod {
  horizon: string;
  horizonDays: number;
  openingBalance: number;
  expectedInflows: number;
  expectedOutflows: number;
  closingBalance: number;
  minimumBuffer: number;
  surplus: number;
  deficit: number;
  confidence: number;
  risk: "low" | "medium" | "high";
}

export interface FundingRequestItem {
  id: string;
  entity: string;
  businessUnit: string;
  priority: "critical" | "high" | "medium" | "low";
  amountRequired: number;
  needDate: string;
  fundingSource: string;
  approvalStatus: "pending" | "approved" | "rejected" | "executing" | "completed";
  fundingMethod: string;
  risk: "low" | "medium" | "high";
  recommendedAction: string;
}

export interface IntercompanyFundingRow {
  fromEntity: string;
  toEntity: string;
  amount: number;
  interestRate: number;
  settlementDate: string;
  status: "pending" | "approved" | "executing" | "completed";
  approval: string;
  expectedCompletion: string;
}

export interface RegionLiquidity {
  region: string;
  totalCash: number;
  available: number;
  restricted: number;
  netLiquidity: number;
  liquidityScore: number;
  fundingNeed: number;
  cashBurn: number;
  coverageDays: number;
  forecast: "positive" | "stable" | "negative";
  trend: "up" | "down" | "stable";
}

export interface LiquidityAlert {
  id: string;
  category: string;
  severity: "info" | "warning" | "critical" | "emergency";
  title: string;
  message: string;
  entity: string;
  suggestedAction: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface LiquidityInsight {
  type: string;
  title: string;
  description: string;
  severity: "positive" | "warning" | "critical";
  value: string;
  action?: string;
}

export interface ScenarioResult {
  name: string;
  description: string;
  liquidityImpact: number;
  fundingImpact: number;
  coverageRatio: number;
  workingCapital: number;
  liquidityScore: number;
  recommendedActions: string[];
  riskRating: "low" | "medium" | "high" | "critical";
}

export interface TreasuryRecommendation {
  id: string;
  action: string;
  rationale: string;
  impact: number;
  impactLabel: string;
  priority: "critical" | "high" | "medium" | "low";
  category: string;
  entity: string;
}

export interface EntityLiquidity {
  entity: string;
  region: string;
  currency: string;
  available: number;
  restricted: number;
  netLiquidity: number;
  liquidityScore: number;
  cashBurn: number;
  coverageDays: number;
  status: "healthy" | "watch" | "critical";
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

export interface CoverageMetrics {
  currentRatio: number;
  quickRatio: number;
  cashRatio: number;
  coverageDays: number;
  liquidityCoverage: number;
}

export interface CashBurnMetrics {
  dailyBurn: number;
  weeklyBurn: number;
  monthlyBurn: number;
  quarterlyBurn: number;
  runwayDays: number;
}

export interface LiquidityCompositionItem {
  category: string;
  amount: number;
  percentage: number;
  trend: "up" | "down" | "stable";
  color: string;
}
