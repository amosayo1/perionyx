import type { EquityAccountRecord } from "../../types";

export class EquityAccountingService {
  private items = new Map<string, EquityAccountRecord>();

  add(record: EquityAccountRecord): void { this.items.set(record.id, record); }

  get(id: string): EquityAccountRecord | undefined { return this.items.get(id); }

  getAll(): EquityAccountRecord[] { return Array.from(this.items.values()); }

  getByConsolidationRun(runId: string): EquityAccountRecord[] {
    return this.getAll().filter((r) => r.consolidationRunId === runId);
  }

  getByEntity(entityId: string): EquityAccountRecord[] {
    return this.getAll().filter((r) => r.entityId === entityId);
  }

  getByPeriod(periodId: string): EquityAccountRecord[] {
    return this.getAll().filter((r) => r.periodId === periodId);
  }

  calculateEquityShare(
    investmentCost: number,
    ownershipPct: number,
    investeeEquity: number,
    goodwill: number,
  ): EquityAccountRecord {
    const equityShare = investeeEquity * (ownershipPct / 100);
    const carryingAmount = investmentCost + equityShare + goodwill;
    const record: EquityAccountRecord = {
      id: crypto.randomUUID(),
      consolidationRunId: "",
      periodId: "",
      entityId: "",
      investmentCost,
      equityShare,
      goodwill,
      fairValueAdjustment: 0,
      postAcquisitionReserves: 0,
      carryingAmount,
      currency: "",
      companyId: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.items.set(record.id, record);
    return record;
  }

  getTotalGoodwill(): number {
    return this.getAll().reduce((s, r) => s + r.goodwill, 0);
  }

  getTotalCarryingAmount(): number {
    return this.getAll().reduce((s, r) => s + r.carryingAmount, 0);
  }

  count(): number { return this.items.size; }

  update(id: string, updates: Partial<EquityAccountRecord>): EquityAccountRecord {
    const existing = this.items.get(id);
    if (!existing) throw new Error(`EquityAccountRecord ${id} not found`);
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.items.set(id, updated);
    return updated;
  }

  delete(id: string): void { this.items.delete(id); }
}
