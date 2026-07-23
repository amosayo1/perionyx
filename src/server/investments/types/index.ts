export type InvestmentStatus = "active" | "matured" | "sold" | "pending" | "settled" | "called" | "written-off";
export type SecurityType =
  | "cash-investment" | "money-market-fund" | "certificate-of-deposit" | "commercial-paper"
  | "treasury-bill" | "government-bond" | "municipal-bond" | "corporate-bond"
  | "floating-rate-note" | "fixed-deposit" | "structured-deposit" | "mutual-fund"
  | "exchange-traded-fund" | "equity" | "preferred-share" | "foreign-currency-deposit"
  | "alternative-investment" | "private-credit" | "other";
export type PortfolioType =
  | "enterprise" | "corporate" | "regional" | "legal-entity" | "department"
  | "business-unit" | "investment-strategy" | "liquidity" | "capital-preservation"
  | "income" | "growth" | "benchmark" | "consolidated";
export type CouponType = "fixed" | "floating" | "zero" | "step-up" | "deferred";
export type CouponFrequency = "monthly" | "quarterly" | "semi-annual" | "annual" | "at-maturity";
export type DayCountConvention = "actual/360" | "actual/365" | "30/360" | "actual/actual";
export type CreditRating = "AAA" | "AA+" | "AA" | "AA-" | "A+" | "A" | "A-" | "BBB+" | "BBB" | "BBB-" | "BB+" | "BB" | "BB-" | "B+" | "B" | "B-" | "CCC+" | "CCC" | "CCC-" | "CC" | "C" | "D" | "NR";
export type RiskRating = "low" | "medium-low" | "medium" | "medium-high" | "high" | "speculative";
export type ESGScore = "AAA" | "AA" | "A" | "BBB" | "BB" | "B" | "CCC";
export type LiquidityRating = "high" | "medium" | "low" | "illiquid";
export type Currency = string;
export type Region = "north-america" | "south-america" | "europe" | "asia-pacific" | "middle-east-africa" | "global";
export type MaturityBucket = "30-days" | "60-days" | "90-days" | "180-days" | "365-days" | "2-years" | "5-years" | "10-years" | "over-10-years";

export interface Portfolio {
  id: string;
  name: string;
  type: PortfolioType;
  parentId?: string;
  currency: Currency;
  region: Region;
  tenantId: string;
  status: "active" | "inactive";
  strategy?: string;
  investmentObjective?: string;
  benchmarkId?: string;
  targetDuration?: number;
  targetYield?: number;
  targetAllocation?: AssetAllocation[];
  restrictions?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AssetAllocation {
  assetClass: string;
  minPercent: number;
  maxPercent: number;
  targetPercent: number;
}

export interface Holding {
  id: string;
  portfolioId: string;
  securityId: string;
  quantity: number;
  units: number;
  costBasis: number;
  bookValue: number;
  marketValue: number;
  fairValue: number;
  faceValue?: number;
  parValue?: number;
  currency: Currency;
  fxRate: number;
  fxTranslation: number;
  purchaseDate: Date;
  settlementDate?: Date;
  accruedInterest: number;
  premium?: number;
  discount?: number;
  realizedGain: number;
  unrealizedGain: number;
  status: InvestmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Security {
  id: string;
  internalId: string;
  isin?: string;
  cusip?: string;
  ticker?: string;
  name: string;
  issuer: string;
  issuerId?: string;
  sector: string;
  country: string;
  region: Region;
  currency: Currency;
  securityType: SecurityType;
  creditRating: CreditRating;
  riskRating: RiskRating;
  esgRating?: ESGScore;
  liquidityRating: LiquidityRating;
  issueSize: number;
  outstandingAmount: number;
  coupon?: number;
  couponType?: CouponType;
  couponFrequency?: CouponFrequency;
  dayCountConvention?: DayCountConvention;
  issueDate: Date;
  maturityDate?: Date;
  callDate?: Date;
  putDate?: Date;
  nextCallDate?: Date;
  description?: string;
  status: "active" | "matured" | "called" | "defaulted";
  createdAt: Date;
  updatedAt: Date;
}

export interface Issuer {
  id: string;
  name: string;
  sector: string;
  country: string;
  region: Region;
  creditRating: CreditRating;
  riskRating: RiskRating;
  isGovernment: boolean;
  isSupranational: boolean;
  isFinancialInstitution: boolean;
  status: "active" | "inactive";
}

export interface PricingSnapshot {
  id: string;
  securityId: string;
  price: number;
  bid?: number;
  ask?: number;
  source: string;
  currency: Currency;
  asOf: Date;
  isLive: boolean;
}

export interface Valuation {
  id: string;
  portfolioId: string;
  asOf: Date;
  bookValue: number;
  marketValue: number;
  fairValue: number;
  nav: number;
  totalInvestments: number;
  cashHeld: number;
  accruedIncome: number;
  currency: Currency;
  fxRate: number;
  status: "preliminary" | "final" | "restated";
}

export interface YieldData {
  id: string;
  holdingId?: string;
  portfolioId?: string;
  asOf: Date;
  currentYield?: number;
  runningYield?: number;
  yieldToMaturity?: number;
  yieldToCall?: number;
  yieldToWorst?: number;
  effectiveYield?: number;
  annualizedYield?: number;
  incomeYield?: number;
  portfolioYield?: number;
  weightedAverageYield?: number;
}

export interface IncomeEntry {
  id: string;
  holdingId: string;
  type: "coupon" | "dividend" | "interest" | "capital-gain" | "capital-loss" | "fx-gain" | "fx-loss";
  amount: number;
  currency: Currency;
  exDate?: Date;
  payDate: Date;
  accruedDays?: number;
  status: "projected" | "accrued" | "received" | "reinvested";
}

export interface PerformanceData {
  id: string;
  portfolioId: string;
  period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "since-inception" | "rolling";
  startDate: Date;
  endDate: Date;
  returnValue: number;
  timeWeightedReturn: number;
  moneyWeightedReturn: number;
  irr?: number;
  alpha?: number;
  beta?: number;
  sharpeRatio?: number;
  sortinoRatio?: number;
  treynorRatio?: number;
  trackingError?: number;
  informationRatio?: number;
  benchmarkReturn?: number;
}

export interface RiskMetrics {
  id: string;
  portfolioId: string;
  asOf: Date;
  marketRisk: number;
  interestRateRisk: number;
  creditRisk: number;
  liquidityRisk: number;
  concentrationRisk: number;
  issuerRisk: number;
  sectorRisk: number;
  countryRisk: number;
  currencyRisk: number;
  durationRisk: number;
  valueAtRisk?: number;
  stressTestLoss?: number;
  diversificationScore: number;
}

export interface ComplianceRule {
  id: string;
  name: string;
  type: "issuer-limit" | "country-limit" | "sector-limit" | "counterparty-limit"
    | "credit-rating-limit" | "liquidity-limit" | "duration-limit"
    | "currency-limit" | "concentration-limit";
  parameters: Record<string, number | string>;
  severity: "warning" | "critical";
  enabled: boolean;
}

export interface ComplianceViolation {
  id: string;
  ruleId: string;
  portfolioId: string;
  severity: "warning" | "critical";
  status: "open" | "acknowledged" | "resolved" | "waived";
  description: string;
  actualValue: number;
  limitValue: number;
  detectedAt: Date;
  resolvedAt?: Date;
  waivedBy?: string;
  notes?: string;
}

export interface Forecast {
  id: string;
  portfolioId: string;
  horizon: Date;
  projectedInterestIncome: number;
  projectedDividendIncome: number;
  projectedCapitalGains: number;
  projectedMaturityProceeds: number;
  projectedCashInflows: number;
  projectedPortfolioGrowth: number;
  projectedReturn: number;
  projectedYield: number;
  confidence: number;
}

export interface AnalyticsKPI {
  totalInvestments: number;
  bookValue: number;
  marketValue: number;
  fairValue: number;
  nav: number;
  realizedGain: number;
  unrealizedGain: number;
  interestIncome: number;
  dividendIncome: number;
  portfolioReturn: number;
  portfolioYield: number;
  averageDuration: number;
  averageRating: string;
  diversificationScore: number;
  investmentConcentration: number;
  cashAvailable: number;
  upcomingMaturities: number;
  asOf: Date;
}

export interface Indexable {
  id: string;
  [key: string]: unknown;
}
