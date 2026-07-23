export type RiskSeverity = "low" | "medium" | "high" | "critical";
export type RiskDirection = "long" | "short" | "flat";
export type HedgeType = "forward" | "option" | "swap" | "natural";
export type DerivativeType = "forward" | "futures" | "option" | "swap" | "ndf";
export type OptionType = "call" | "put";
export type PolicyStatus = "compliant" | "breached" | "pending_review";
export type BreachSeverity = "info" | "warning" | "critical" | "emergency";
export type StressCategory = "fx_shock" | "interest_shock" | "liquidity_crisis" | "bank_failure" | "country_sanctions" | "commodity_spike" | "revenue_decline" | "customer_default" | "supply_disruption" | "pandemic";

export interface DashboardFilters {
  region: string | null;
  country: string | null;
  currency: string | null;
  counterparty: string | null;
  riskType: string | null;
  entity: string | null;
  severity: string | null;
  policy: string | null;
  date: [string, string] | null;
  status: string | null;
}

export interface FXExposure {
  id: string;
  currency: string;
  longAmount: number;
  shortAmount: number;
  netExposure: number;
  functionalCurrency: string;
  reportingCurrency: string;
  fxRate: number;
  gainLoss: number;
  hedgePercentage: number;
  policyStatus: PolicyStatus;
  trend: "up" | "down" | "stable";
  entity: string;
  region: string;
}

export interface InterestRateExposure {
  id: string;
  entity: string;
  currency: string;
  fixedAmount: number;
  floatingAmount: number;
  totalExposure: number;
  fixedPercentage: number;
  floatingPercentage: number;
  durationYears: number;
  sensitivityBps: number;
  annualImpact: number;
  policyLimit: number;
  status: PolicyStatus;
  benchmark: string;
}

export interface CounterpartyRisk {
  id: string;
  counterparty: string;
  country: string;
  creditRating: string;
  exposure: number;
  limit: number;
  utilization: number;
  riskScore: number;
  health: "healthy" | "watch" | "critical";
  collateralHeld: number;
  nettingEligible: boolean;
  lastReview: string;
}

export interface CountryRisk {
  id: string;
  country: string;
  region: string;
  exposure: number;
  politicalRisk: number;
  economicRisk: number;
  currencyRisk: number;
  compositeScore: number;
  riskLevel: RiskSeverity;
  trend: "improving" | "stable" | "deteriorating";
  limits: number;
}

export interface LiquidityRisk {
  id: string;
  entity: string;
  currency: string;
  projectedOutflow: number;
  availableLiquidity: number;
  coverageRatio: number;
  stressScenario: string;
  survivalDays: number;
  riskLevel: RiskSeverity;
}

export interface ConcentrationRisk {
  id: string;
  category: string;
  counterparty: string;
  exposure: number;
  totalPortfolio: number;
  concentration: number;
  limit: number;
  status: PolicyStatus;
}

export interface RiskPolicy {
  id: string;
  name: string;
  category: string;
  threshold: number;
  operator: "lt" | "gt" | "lte" | "gte" | "eq";
  currentValue: number;
  status: PolicyStatus;
  owner: string;
  approvalRequired: string;
  lastReview: string;
  nextReview: string;
}

export interface RiskLimit {
  id: string;
  name: string;
  counterparty: string;
  limitType: string;
  limitAmount: number;
  utilized: number;
  available: number;
  utilizationPercent: number;
  expiryDate: string;
  status: "active" | "exhausted" | "expiring" | "expired";
}

export interface RiskBreach {
  id: string;
  policy: string;
  description: string;
  severity: BreachSeverity;
  entity: string;
  value: number;
  threshold: number;
  breachedAt: string;
  acknowledged: boolean;
  resolved: boolean;
  owner: string;
  remediation: string;
}

export interface VaRCalculation {
  id: string;
  date: string;
  var1d95: number;
  var1d99: number;
  var10d95: number;
  var10d99: number;
  var30d95: number;
  var30d99: number;
  historicalVar: number;
  parametricVar: number;
  monteCarloVar: number;
  portfolioValue: number;
  methodology: string;
  confidence: string;
}

export interface StressScenario {
  id: string;
  name: string;
  type: StressCategory;
  description: string;
  severity: RiskSeverity;
  probability: number;
  impact: number;
  impactPercent: number;
  cashImpact: number;
  ebitdaImpact: number;
  liquidityImpact: number;
  debtImpact: number;
  covenantBreach: boolean;
  survivalMonths: number;
  recoveryTime: string;
  affectedEntities: string[];
  affectedCurrencies: string[];
}

export interface HedgePosition {
  id: string;
  type: HedgeType;
  instrument: string;
  entity: string;
  currency: string;
  notionalAmount: number;
  hedgeAmount: number;
  coveragePercent: number;
  effectiveness: number;
  maturityDate: string;
  counterparty: string;
  status: "active" | "maturing" | "matured" | "cancelled";
  fairValue: number;
  mtmGainLoss: number;
}

export interface DerivativePosition {
  id: string;
  type: DerivativeType;
  instrument: string;
  entity: string;
  currency: string;
  counterparty: string;
  notional: number;
  strike: number;
  maturityDate: string;
  premium: number;
  fairValue: number;
  mtmPnl: number;
  purpose: "hedging" | "trading";
  status: "active" | "exercised" | "expired" | "cancelled";
}

export interface ForwardContract {
  id: string;
  counterparty: string;
  currency: string;
  direction: RiskDirection;
  notional: number;
  forwardRate: number;
  spotRate: number;
  valuationDate: string;
  maturityDate: string;
  pnl: number;
  hedgeRelation: string;
  status: string;
}

export interface SwapPosition {
  id: string;
  type: "irs" | "ccs" | "cirs";
  entity: string;
  counterparty: string;
  currency: string;
  notional: number;
  fixedRate: number;
  floatingRate: string;
  maturityDate: string;
  fairValue: number;
  status: string;
}

export interface OptionPosition {
  id: string;
  optionType: OptionType;
  style: "european" | "american";
  entity: string;
  currency: string;
  counterparty: string;
  notional: number;
  strike: number;
  spot: number;
  premium: number;
  maturityDate: string;
  delta: number;
  gamma: number;
  vega: number;
  theta: number;
  mtmValue: number;
  status: string;
}

export interface TreasuryRiskAlert {
  id: string;
  category: string;
  severity: BreachSeverity;
  title: string;
  message: string;
  entity: string;
  source: string;
  owner: string;
  suggestedAction: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface RiskRecommendation {
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

export interface RiskMetrics {
  totalExposure: number;
  netFXExposure: number;
  grossFXExposure: number;
  interestExposure: number;
  liquidityRisk: number;
  counterpartyRisk: number;
  countryRisk: number;
  concentrationRisk: number;
  var1d95: number;
  var1d99: number;
  policyBreaches: number;
  hedgeRatio: number;
  overallRiskScore: number;
  openHedges: number;
  counterparties: number;
  countries: number;
  policies: number;
  stressScenarios: number;
  alerts: number;
  trend: "up" | "down" | "stable";
  lastUpdated: string;
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
