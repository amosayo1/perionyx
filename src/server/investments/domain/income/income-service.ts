import type { IncomeEntry } from "../../types";

export class IncomeService {
  private entries: Map<string, IncomeEntry> = new Map();

  record(entry: IncomeEntry): void {
    this.entries.set(entry.id, entry);
  }

  getByHolding(holdingId: string): IncomeEntry[] {
    return [...this.entries.values()].filter((e) => e.holdingId === holdingId);
  }

  getByPortfolio(holdingIds: string[]): IncomeEntry[] {
    return [...this.entries.values()].filter((e) => holdingIds.includes(e.holdingId));
  }

  getByDateRange(start: Date, end: Date): IncomeEntry[] {
    return [...this.entries.values()].filter(
      (e) => e.payDate >= start && e.payDate <= end,
    );
  }

  getProjectedIncome(): IncomeEntry[] {
    return [...this.entries.values()].filter((e) => e.status === "projected");
  }

  getTotalInterestIncome(holdingIds: string[]): number {
    return this.getByPortfolio(holdingIds)
      .filter((e) => e.type === "interest" || e.type === "coupon")
      .reduce((sum, e) => sum + e.amount, 0);
  }

  getTotalDividendIncome(holdingIds: string[]): number {
    return this.getByPortfolio(holdingIds)
      .filter((e) => e.type === "dividend")
      .reduce((sum, e) => sum + e.amount, 0);
  }

  getIncomeCalendar(holdingIds: string[]): IncomeEntry[] {
    return this.getByPortfolio(holdingIds).sort((a, b) => a.payDate.getTime() - b.payDate.getTime());
  }
}
