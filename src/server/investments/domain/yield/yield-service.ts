import type { YieldData } from "../../types";

export class YieldService {
  private records: Map<string, YieldData> = new Map();

  record(data: YieldData): void {
    this.records.set(data.id, data);
  }

  getLatest(holdingId: string): YieldData | undefined {
    return this.getByHolding(holdingId).sort((a, b) => b.asOf.getTime() - a.asOf.getTime())[0];
  }

  getByHolding(holdingId: string): YieldData[] {
    return [...this.records.values()].filter((y) => y.holdingId === holdingId);
  }

  getByPortfolio(portfolioId: string): YieldData[] {
    return [...this.records.values()].filter((y) => y.portfolioId === portfolioId);
  }

  getPortfolioYield(portfolioId: string): number {
    const yields = this.getByPortfolio(portfolioId);
    if (yields.length === 0) return 0;
    return yields.reduce((sum, y) => sum + (y.weightedAverageYield ?? 0), 0) / yields.length;
  }

  getWeightedAverageYield(portfolioIds: string[]): number {
    const allYields = portfolioIds.flatMap((id) => this.getByPortfolio(id));
    if (allYields.length === 0) return 0;
    return allYields.reduce((sum, y) => sum + (y.currentYield ?? 0), 0) / allYields.length;
  }
}
