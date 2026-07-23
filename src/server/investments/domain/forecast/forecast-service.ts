import type { Forecast, Holding, Security, IncomeEntry } from "../../types";

export class ForecastService {
  private forecasts: Map<string, Forecast> = new Map();

  record(forecast: Forecast): void {
    this.forecasts.set(forecast.id, forecast);
  }

  getByPortfolio(portfolioId: string): Forecast[] {
    return [...this.forecasts.values()]
      .filter((f) => f.portfolioId === portfolioId)
      .sort((a, b) => a.horizon.getTime() - b.horizon.getTime());
  }

  getLatest(portfolioId: string): Forecast | undefined {
    return this.getByPortfolio(portfolioId).pop();
  }

  generate(portfolioId: string, holdings: Holding[], securities: Map<string, Security>, income: IncomeEntry[]): Forecast {
    const interestIncome = income.filter((i) => i.type === "interest" || i.type === "coupon")
      .reduce((sum, i) => sum + i.amount, 0);
    const dividendIncome = income.filter((i) => i.type === "dividend")
      .reduce((sum, i) => sum + i.amount, 0);

    const totalValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);
    const maturingValue = holdings.filter((h) => {
      const sec = securities.get(h.securityId);
      return sec?.maturityDate && sec.maturityDate <= new Date(Date.now() + 365 * 86400000);
    }).reduce((sum, h) => sum + h.marketValue, 0);

    const forecast: Forecast = {
      id: `fc_${portfolioId}_${Date.now()}`,
      portfolioId,
      horizon: new Date(Date.now() + 365 * 86400000),
      projectedInterestIncome: interestIncome * 1.05,
      projectedDividendIncome: dividendIncome * 1.03,
      projectedCapitalGains: totalValue * 0.03,
      projectedMaturityProceeds: maturingValue,
      projectedCashInflows: interestIncome + dividendIncome + maturingValue,
      projectedPortfolioGrowth: totalValue * 1.04,
      projectedReturn: 4.5,
      projectedYield: 3.8,
      confidence: 0.75 + Math.random() * 0.15,
    };

    this.record(forecast);
    return forecast;
  }
}
