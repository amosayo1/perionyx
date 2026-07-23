import { PortfolioService } from "../domain/portfolio/portfolio-service";
import { SecuritiesService } from "../domain/securities/securities-service";
import { HoldingsService } from "../domain/holdings/holdings-service";
import { ValuationService } from "../domain/valuation/valuation-service";
import { YieldService } from "../domain/yield/yield-service";
import { IncomeService } from "../domain/income/income-service";
import { PerformanceService } from "../domain/performance/performance-service";
import { MaturityService } from "../domain/maturity/maturity-service";
import { RiskService } from "../domain/risk/risk-service";
import { ComplianceService } from "../domain/compliance/compliance-service";
import { ForecastService } from "../domain/forecast/forecast-service";
import { AnalyticsService } from "../domain/analytics/analytics-service";
import type { Security, Holding, Portfolio, Issuer, PricingSnapshot, Valuation, YieldData, IncomeEntry, PerformanceData, RiskMetrics, ComplianceRule, ComplianceViolation, Forecast, AnalyticsKPI } from "../types";

export class InvestmentService {
  public portfolios: PortfolioService;
  public securities: SecuritiesService;
  public holdings: HoldingsService;
  public valuation: ValuationService;
  public yield_: YieldService;
  public income: IncomeService;
  public performance: PerformanceService;
  public maturity: MaturityService;
  public risk: RiskService;
  public compliance: ComplianceService;
  public forecast: ForecastService;
  public analytics: AnalyticsService;

  constructor() {
    this.portfolios = new PortfolioService();
    this.securities = new SecuritiesService();
    this.holdings = new HoldingsService();
    this.valuation = new ValuationService();
    this.yield_ = new YieldService();
    this.income = new IncomeService();
    this.performance = new PerformanceService();
    this.maturity = new MaturityService();
    this.risk = new RiskService();
    this.compliance = new ComplianceService();
    this.forecast = new ForecastService();
    this.analytics = new AnalyticsService(this.holdings, this.securities, this.performance, this.risk);
  }

  getAPIs(): InvestmentAPIs {
    return {
      portfolios: this.portfolios,
      securities: this.securities,
      holdings: this.holdings,
      valuation: this.valuation,
      yield: this.yield_,
      income: this.income,
      performance: this.performance,
      maturity: this.maturity,
      risk: this.risk,
      compliance: this.compliance,
      forecast: this.forecast,
      analytics: this.analytics,
    };
  }
}

export interface InvestmentAPIs {
  portfolios: PortfolioService;
  securities: SecuritiesService;
  holdings: HoldingsService;
  valuation: ValuationService;
  yield: YieldService;
  income: IncomeService;
  performance: PerformanceService;
  maturity: MaturityService;
  risk: RiskService;
  compliance: ComplianceService;
  forecast: ForecastService;
  analytics: AnalyticsService;
}

export type { Security, Holding, Portfolio, Issuer, PricingSnapshot, Valuation, YieldData, IncomeEntry, PerformanceData, RiskMetrics, ComplianceRule, ComplianceViolation, Forecast, AnalyticsKPI };
