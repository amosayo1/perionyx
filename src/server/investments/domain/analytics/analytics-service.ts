import type { AnalyticsKPI, Holding, Security, PerformanceData, RiskMetrics } from "../../types";
import type { HoldingsService } from "../holdings/holdings-service";
import type { SecuritiesService } from "../securities/securities-service";
import type { PerformanceService } from "../performance/performance-service";
import type { RiskService } from "../risk/risk-service";

export class AnalyticsService {
  constructor(
    private holdingsService: HoldingsService,
    private securitiesService: SecuritiesService,
    private performanceService: PerformanceService,
    private riskService: RiskService,
  ) {}

  getKPIs(portfolioId: string): AnalyticsKPI {
    const holdings = this.holdingsService.getByPortfolio(portfolioId);
    const performance = this.performanceService.getByPeriod(portfolioId, "yearly");
    const risk = this.riskService.getLatest(portfolioId);

    return {
      totalInvestments: holdings.length,
      bookValue: holdings.reduce((sum, h) => sum + h.bookValue, 0),
      marketValue: holdings.reduce((sum, h) => sum + h.marketValue, 0),
      fairValue: holdings.reduce((sum, h) => sum + h.fairValue, 0),
      nav: holdings.reduce((sum, h) => sum + h.marketValue, 0),
      realizedGain: holdings.reduce((sum, h) => sum + h.realizedGain, 0),
      unrealizedGain: holdings.reduce((sum, h) => sum + h.unrealizedGain, 0),
      interestIncome: 0,
      dividendIncome: 0,
      portfolioReturn: performance?.returnValue ?? 0,
      portfolioYield: 0,
      averageDuration: risk?.durationRisk ?? 0,
      averageRating: "A",
      diversificationScore: risk?.diversificationScore ?? 0,
      investmentConcentration: risk?.concentrationRisk ?? 0,
      cashAvailable: 0,
      upcomingMaturities: 0,
      asOf: new Date(),
    };
  }
}
