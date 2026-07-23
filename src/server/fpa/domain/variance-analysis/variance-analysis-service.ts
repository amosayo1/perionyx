import type { VarianceAnalysisRecord } from "../../types";

export class VarianceAnalysisService {
  private items = new Map<string, VarianceAnalysisRecord>();

  add(record: VarianceAnalysisRecord): void { this.items.set(record.id, record); }

  get(id: string): VarianceAnalysisRecord | undefined { return this.items.get(id); }

  getAll(): VarianceAnalysisRecord[] { return Array.from(this.items.values()); }

  getByType(type: string): VarianceAnalysisRecord[] { return this.getAll().filter((r) => r.varianceType === type); }

  getByFiscalYear(year: number): VarianceAnalysisRecord[] { return this.getAll().filter((r) => r.fiscalYear === year); }

  getByDepartment(dept: string): VarianceAnalysisRecord[] { return this.getAll().filter((r) => r.department === dept); }

  getByCategory(cat: string): VarianceAnalysisRecord[] { return this.getAll().filter((r) => r.category === cat); }

  getSignificant(threshold: number): VarianceAnalysisRecord[] {
    return this.getAll().filter((r) => Math.abs(r.variancePercent) >= threshold);
  }

  getFavorable(): VarianceAnalysisRecord[] { return this.getAll().filter((r) => r.direction === "favorable"); }

  getUnfavorable(): VarianceAnalysisRecord[] { return this.getAll().filter((r) => r.direction === "unfavorable"); }

  calculateVariance(
    actual: number, plan: number, type: string, year: number, period: number,
    accountCode: string, accountName: string
  ): VarianceAnalysisRecord {
    const variance = actual - plan;
    const variancePercent = plan !== 0 ? (variance / Math.abs(plan)) * 100 : 0;
    const direction = variance > 0 ? "favorable" : variance < 0 ? "unfavorable" : "neutral";
    const threshold = 10;
    return {
      id: crypto.randomUUID(),
      varianceType: type as any,
      fiscalYear: year,
      fiscalPeriod: period,
      accountCode,
      accountName,
      category: "",
      actualAmount: actual,
      planAmount: plan,
      variance,
      variancePercent,
      direction: direction as any,
      isSignificant: Math.abs(variancePercent) >= threshold,
      threshold,
      currency: "USD",
      companyId: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  getTotalVariance(): number { return this.getAll().reduce((s, r) => s + r.variance, 0); }

  getAverageVariancePercent(): number {
    const all = this.getAll(); if (all.length === 0) return 0;
    return all.reduce((s, r) => s + r.variancePercent, 0) / all.length;
  }

  count(): number { return this.items.size; }

  update(id: string, updates: Partial<VarianceAnalysisRecord>): VarianceAnalysisRecord | undefined {
    const existing = this.items.get(id); if (!existing) return undefined;
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.items.set(id, updated); return updated;
  }

  delete(id: string): boolean { return this.items.delete(id); }
}
