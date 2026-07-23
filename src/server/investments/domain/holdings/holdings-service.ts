import type { Holding, InvestmentStatus } from "../../types";

export class HoldingsService {
  private holdings: Map<string, Holding> = new Map();

  add(holding: Holding): void {
    this.holdings.set(holding.id, holding);
  }

  getById(id: string): Holding | undefined {
    return this.holdings.get(id);
  }

  getAll(): Holding[] {
    return [...this.holdings.values()];
  }

  getByPortfolio(portfolioId: string): Holding[] {
    return this.getAll().filter((h) => h.portfolioId === portfolioId);
  }

  getBySecurity(securityId: string): Holding[] {
    return this.getAll().filter((h) => h.securityId === securityId);
  }

  getByStatus(status: InvestmentStatus): Holding[] {
    return this.getAll().filter((h) => h.status === status);
  }

  getTotalBookValue(portfolioId: string): number {
    return this.getByPortfolio(portfolioId).reduce((sum, h) => sum + h.bookValue, 0);
  }

  getTotalMarketValue(portfolioId: string): number {
    return this.getByPortfolio(portfolioId).reduce((sum, h) => sum + h.marketValue, 0);
  }

  getTotalUnrealizedGain(portfolioId: string): number {
    return this.getByPortfolio(portfolioId).reduce((sum, h) => sum + h.unrealizedGain, 0);
  }

  getTotalRealizedGain(portfolioId: string): number {
    return this.getByPortfolio(portfolioId).reduce((sum, h) => sum + h.realizedGain, 0);
  }
}
