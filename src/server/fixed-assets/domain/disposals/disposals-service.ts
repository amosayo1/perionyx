import type { DisposalRecord, DisposalType } from "../../types";

export class DisposalsService {
  private items = new Map<string, DisposalRecord>();

  add(record: DisposalRecord): void { this.items.set(record.id, record); }
  get(id: string): DisposalRecord | undefined { return this.items.get(id); }
  getAll(): DisposalRecord[] { return Array.from(this.items.values()); }
  getByAsset(assetId: string): DisposalRecord[] { return this.getAll().filter((r) => r.assetId === assetId); }
  getByType(type: DisposalType): DisposalRecord[] { return this.getAll().filter((r) => r.disposalType === type); }
  getByDateRange(from: Date, to: Date): DisposalRecord[] { return this.getAll().filter((r) => r.disposalDate >= from && r.disposalDate <= to); }
  getPendingApproval(): DisposalRecord[] { return this.getAll().filter((r) => !r.approvedBy); }
  getTotalProceeds(): number { return this.getAll().reduce((sum, r) => sum + r.netDisposalProceeds, 0); }
  getTotalGainLoss(): number { return this.getAll().reduce((sum, r) => sum + r.gainLoss, 0); }
  getByCounterparty(name: string): DisposalRecord[] { return this.getAll().filter((r) => r.counterparty === name); }
  count(): number { return this.items.size; }

  update(id: string, updates: Partial<DisposalRecord>): DisposalRecord | undefined {
    const existing = this.items.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.items.set(id, updated);
    return updated;
  }

  delete(id: string): boolean { return this.items.delete(id); }
}
