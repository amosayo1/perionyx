export { InvestmentService } from "./services/investment-service";
export type { InvestmentAPIs } from "./services/investment-service";

export { PortfolioService } from "./domain/portfolio/portfolio-service";
export type { PortfolioTreeNode } from "./domain/portfolio/portfolio-service";
export { SecuritiesService } from "./domain/securities/securities-service";
export { HoldingsService } from "./domain/holdings/holdings-service";
export { ValuationService } from "./domain/valuation/valuation-service";
export { YieldService } from "./domain/yield/yield-service";
export { IncomeService } from "./domain/income/income-service";
export { PerformanceService } from "./domain/performance/performance-service";
export { MaturityService } from "./domain/maturity/maturity-service";
export type { MaturityLadderEntry } from "./domain/maturity/maturity-service";
export { RiskService } from "./domain/risk/risk-service";
export type { ConcentrationAnalysis } from "./domain/risk/risk-service";
export { ComplianceService } from "./domain/compliance/compliance-service";
export { ForecastService } from "./domain/forecast/forecast-service";
export { AnalyticsService } from "./domain/analytics/analytics-service";

export type {
  Portfolio, Holding, Security, Issuer, PricingSnapshot,
  Valuation, YieldData, IncomeEntry, PerformanceData,
  RiskMetrics, ComplianceRule, ComplianceViolation, Forecast, AnalyticsKPI,
  InvestmentStatus, SecurityType, PortfolioType, CouponType, CouponFrequency,
  DayCountConvention, CreditRating, RiskRating, ESGScore, LiquidityRating,
  Currency, Region, MaturityBucket, AssetAllocation,
} from "./types";
