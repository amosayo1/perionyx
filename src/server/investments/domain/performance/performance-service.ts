import type { PerformanceData } from "../../types";

export class PerformanceService {
  private records: Map<string, PerformanceData> = new Map();

  record(data: PerformanceData): void {
    this.records.set(data.id, data);
  }

  getByPortfolio(portfolioId: string): PerformanceData[] {
    return [...this.records.values()]
      .filter((p) => p.portfolioId === portfolioId)
      .sort((a, b) => b.endDate.getTime() - a.endDate.getTime());
  }

  getByPeriod(portfolioId: string, period: PerformanceData["period"]): PerformanceData | undefined {
    return this.getByPortfolio(portfolioId).find((p) => p.period === period);
  }

  getReturn(portfolioId: string, period: PerformanceData["period"]): number {
    return this.getByPeriod(portfolioId, period)?.returnValue ?? 0;
  }

  getSharpeRatio(portfolioId: string): number {
    return this.getByPeriod(portfolioId, "yearly")?.sharpeRatio ?? 0;
  }

  getRollingReturns(portfolioId: string): PerformanceData[] {
    return this.getByPortfolio(portfolioId).filter((p) => p.period === "rolling");
  }

  getSinceInception(portfolioId: string): PerformanceData | undefined {
    return this.getByPeriod(portfolioId, "since-inception");
  }
}
