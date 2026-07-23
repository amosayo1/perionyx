import type { MinorityInterestRecord } from "../../types";

export class MinorityInterestService {
  private items = new Map<string, MinorityInterestRecord>();

  add(record: MinorityInterestRecord): void { this.items.set(record.id, record); }

  get(id: string): MinorityInterestRecord | undefined { return this.items.get(id); }

  getAll(): MinorityInterestRecord[] { return Array.from(this.items.values()); }

  getByConsolidationRun(runId: string): MinorityInterestRecord[] {
    return this.getAll().filter((r) => r.consolidationRunId === runId);
  }

  getByEntity(entityId: string): MinorityInterestRecord[] {
    return this.getAll().filter((r) => r.entityId === entityId);
  }

  getByPeriod(periodId: string): MinorityInterestRecord[] {
    return this.getAll().filter((r) => r.periodId === periodId);
  }

  calculateMinorityInterest(
    entityId: string,
    minorityPct: number,
    totalEquity: number,
    totalNetIncome: number,
  ): MinorityInterestRecord {
    const minorityEquity = totalEquity * (minorityPct / 100);
    const minorityNetIncome = totalNetIncome * (minorityPct / 100);
    const endingBalance = minorityEquity + minorityNetIncome;
    const record: MinorityInterestRecord = {
      id: crypto.randomUUID(),
      consolidationRunId: "",
      periodId: "",
      entityId,
      entityName: "",
      minorityPercentage: minorityPct,
      totalEquity,
      minorityEquity,
      totalNetIncome,
      minorityNetIncome,
      beginningBalance: 0,
      endingBalance,
      currency: "",
      companyId: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.items.set(record.id, record);
    return record;
  }

  getTotalMinorityEquity(): number {
    return this.getAll().reduce((s, r) => s + r.endingBalance, 0);
  }

  getTotalMinorityNetIncome(): number {
    return this.getAll().reduce((s, r) => s + r.minorityNetIncome, 0);
  }

  count(): number { return this.items.size; }

  update(id: string, updates: Partial<MinorityInterestRecord>): MinorityInterestRecord {
    const existing = this.items.get(id);
    if (!existing) throw new Error(`MinorityInterestRecord ${id} not found`);
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.items.set(id, updated);
    return updated;
  }

  delete(id: string): void { this.items.delete(id); }
}
