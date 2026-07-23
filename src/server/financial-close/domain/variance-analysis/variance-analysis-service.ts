import type { VarianceAnalysisRecord, VarianceDirection } from "../../types";

export class VarianceAnalysisService {
  private variances = new Map<string, VarianceAnalysisRecord>();

  add(v: VarianceAnalysisRecord): VarianceAnalysisRecord {
    this.variances.set(v.id, v);
    return v;
  }

  get(id: string): VarianceAnalysisRecord | undefined {
    return this.variances.get(id);
  }

  getAll(): VarianceAnalysisRecord[] {
    return Array.from(this.variances.values());
  }

  getByPeriod(periodId: string): VarianceAnalysisRecord[] {
    return this.getAll().filter((v) => v.periodId === periodId);
  }

  getByDirection(direction: VarianceDirection): VarianceAnalysisRecord[] {
    return this.getAll().filter((v) => v.direction === direction);
  }

  getSignificant(): VarianceAnalysisRecord[] {
    return this.getAll().filter((v) => v.isSignificant);
  }

  getByAccount(accountId: string): VarianceAnalysisRecord[] {
    return this.getAll().filter((v) => v.accountId === accountId);
  }

  search(query: string): VarianceAnalysisRecord[] {
    const q = query.toLowerCase();
    return this.getAll().filter((v) => v.accountName.toLowerCase().includes(q) || v.accountCode.toLowerCase().includes(q));
  }

  count(): number {
    return this.variances.size;
  }

  update(id: string, updates: Partial<VarianceAnalysisRecord>): VarianceAnalysisRecord {
    const existing = this.variances.get(id);
    if (!existing) throw new Error(`Variance ${id} not found`);
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.variances.set(id, updated);
    return updated;
  }

  delete(id: string): void {
    this.variances.delete(id);
  }

  calculateVariance(
    accountId: string, accountCode: string, accountName: string,
    currentAmount: number, priorAmount: number, threshold: number,
    periodId: string, direction?: VarianceDirection,
  ): VarianceAnalysisRecord {
    const variance = currentAmount - priorAmount;
    const variancePercent = priorAmount !== 0 ? (variance / Math.abs(priorAmount)) * 100 : 0;
    const dir = direction ?? (variance > 0 ? "unfavorable" : variance < 0 ? "favorable" : "neutral");
    const isSignificant = Math.abs(variancePercent) > threshold;

    const record: VarianceAnalysisRecord = {
      id: `var-${accountId}-${periodId}-${Date.now()}`,
      periodId, accountId, accountCode, accountName,
      currentPeriodAmount: currentAmount, priorPeriodAmount: priorAmount,
      variance, variancePercent: Math.round(variancePercent * 100) / 100,
      direction: dir as VarianceDirection,
      threshold, isSignificant, companyId: "company-1",
      createdAt: new Date(), updatedAt: new Date(),
    };
    this.variances.set(record.id, record);
    return record;
  }

  getSummaryStats(periodId: string): { total: number; significant: number; favorable: number; unfavorable: number; totalVariance: number } {
    const periodVars = this.getByPeriod(periodId);
    return {
      total: periodVars.length,
      significant: periodVars.filter((v) => v.isSignificant).length,
      favorable: periodVars.filter((v) => v.direction === "favorable").length,
      unfavorable: periodVars.filter((v) => v.direction === "unfavorable").length,
      totalVariance: periodVars.reduce((s, v) => s + Math.abs(v.variance), 0),
    };
  }
}
