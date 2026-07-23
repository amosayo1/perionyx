export interface TreasuryHealthScore {
  overall: number;
  liquidity: number;
  forecastAccuracy: number;
  paymentSuccess: number;
  bankHealth: number;
  compliance: number;
  cashAvailability: number;
  label: "Excellent" | "Good" | "Fair" | "Needs Attention";
}

export interface SummaryMetric {
  label: string;
  value: string;
  change: number;
  changePercent: number;
  direction: "up" | "down" | "stable";
  status: "healthy" | "warning" | "critical";
}

export interface ExecutiveKPI {
  id: string;
  label: string;
  value: string;
  numericValue: number;
  change: number;
  changePercent: number;
  direction: "up" | "down" | "stable";
  status: "healthy" | "warning" | "critical";
  icon: string;
}

export interface CashPositionSummary {
  totalCash: number;
  availableCash: number;
  restrictedCash: number;
  idleCash: number;
  workingCapital: number;
  changePercent: number;
}

export interface LiquiditySummary {
  liquidityScore: number;
  fundingNeeds: number;
  coverageRatio: number;
  poolUtilization: number;
  daysCashRemaining: number;
}

export interface PaymentSummary {
  paymentsToday: number;
  paymentsTodayValue: number;
  collectionsToday: number;
  collectionsTodayValue: number;
  pendingApprovals: number;
  pendingApprovalsValue: number;
  netCashFlow: number;
}

export interface BankAccountSummary {
  activeAccounts: number;
  totalBanks: number;
  dormantAccounts: number;
  complianceIssues: number;
  totalSignatories: number;
  mandatesExpiring: number;
}

export interface ForecastSummary {
  forecastAccuracy: number;
  forecast30Day: number;
  variance: number;
  variancePercent: number;
  confidenceScore: number;
  cashRunway: number;
}

export interface WorkingCapitalSummary {
  netWorkingCapital: number;
  currentRatio: number;
  dso: number;
  dpo: number;
  inventoryDays: number;
}

export interface RiskSummary {
  overallScore: number;
  fxExposure: number;
  counterpartyRisk: number;
  policyBreaches: number;
  var1d95: number;
}

export interface RegionSummary {
  name: string;
  totalCash: number;
  availableLiquidity: number;
  forecastHealth: "positive" | "stable" | "negative";
  healthScore: number;
  entityCount: number;
  currencyCount: number;
  topEntity: string;
}

export interface EntitySummary {
  name: string;
  region: string;
  totalCash: number;
  availableLiquidity: number;
  paymentVolume: number;
  healthScore: number;
  status: "healthy" | "watch" | "critical";
}

export interface CurrencySummary {
  code: string;
  exposure: number;
  totalCash: number;
  riskScore: number;
  hedgePercent: number;
  trend: "up" | "down" | "stable";
}

export interface InstitutionSummary {
  name: string;
  relationshipScore: number;
  accountCount: number;
  totalBalance: number;
  health: "healthy" | "watch" | "critical";
  serviceLevel: "premium" | "standard" | "basic";
}

export interface CommandCenterAlert {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  message: string;
  module: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  category: string;
  impact: string;
}

export interface Insight {
  id: string;
  label: string;
  value: string;
  description: string;
  severity: "positive" | "warning" | "critical";
  module: string;
}

export interface QuickAction {
  id: string;
  label: string;
  route: string;
  icon: string;
  description: string;
}

export interface ActivityItem {
  id: string;
  action: string;
  module: string;
  entity: string;
  timestamp: string;
  type: "payment" | "collection" | "transfer" | "approval" | "alert" | "update" | "compliance";
}

export interface PerformanceMetric {
  label: string;
  current: number;
  previous: number;
  target: number;
  unit: string;
  direction: "up" | "down" | "stable";
}

export interface NavigationCard {
  id: string;
  title: string;
  description: string;
  route: string;
  icon: string;
  status: "active" | "coming_soon";
  metrics: { label: string; value: string }[];
}

export interface ComingSoonModule {
  id: string;
  title: string;
  description: string;
  icon: string;
  eta: string;
}
