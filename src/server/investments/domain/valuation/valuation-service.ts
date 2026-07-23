import type { Valuation } from "../../types";

export class ValuationService {
  private snapshots: Map<string, Valuation> = new Map();

  record(snapshot: Valuation): void {
    this.snapshots.set(snapshot.id, snapshot);
  }

  getLatest(portfolioId: string): Valuation | undefined {
    const entries = [...this.snapshots.values()]
      .filter((v) => v.portfolioId === portfolioId)
      .sort((a, b) => b.asOf.getTime() - a.asOf.getTime());
    return entries[0];
  }

  getHistory(portfolioId: string): Valuation[] {
    return [...this.snapshots.values()]
      .filter((v) => v.portfolioId === portfolioId)
      .sort((a, b) => a.asOf.getTime() - b.asOf.getTime());
  }

  getPortfolioNAV(portfolioId: string): number {
    const latest = this.getLatest(portfolioId);
    return latest?.nav ?? 0;
  }

  getConsolidatedNAV(portfolioIds: string[]): number {
    return portfolioIds.reduce((sum, id) => sum + this.getPortfolioNAV(id), 0);
  }
}
