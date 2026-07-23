import type {
  Portfolio,
  Holding,
  Security,
  Issuer,
  Valuation,
  YieldData,
  IncomeEntry,
  PerformanceData,
  RiskMetrics,
  ComplianceRule,
  ComplianceViolation,
  Forecast,
  AnalyticsKPI,
  PortfolioTreeNode,
  MaturityLadderEntry,
  ConcentrationAnalysis,
} from "../../server/investments";

export type {
  Portfolio,
  Holding,
  Security,
  Issuer,
  Valuation,
  YieldData,
  IncomeEntry,
  PerformanceData,
  RiskMetrics,
  ComplianceRule,
  ComplianceViolation,
  Forecast,
  AnalyticsKPI,
  PortfolioTreeNode,
  MaturityLadderEntry,
  ConcentrationAnalysis,
};

export interface InvestmentOverviewMetrics {
  totalPortfolios: number;
  totalHoldings: number;
  totalSecurities: number;
  totalMarketValue: number;
  totalBookValue: number;
  totalUnrealizedGain: number;
  portfolioReturn: number;
  portfolioYield: number;
  diversificationScore: number;
  asOf: Date;
}

export interface InvestmentChartDataPoint {
  period: string;
  value: number;
  previousValue?: number;
  forecast?: number;
}
