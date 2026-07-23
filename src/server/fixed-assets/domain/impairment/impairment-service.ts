import type { ImpairmentRecord } from "../../types";

export class ImpairmentService {
  private items = new Map<string, ImpairmentRecord>();

  add(record: ImpairmentRecord): void {
    this.items.set(record.id, record);
  }

  get(id: string): ImpairmentRecord | undefined {
    return this.items.get(id);
  }

  getAll(): ImpairmentRecord[] {
    return Array.from(this.items.values());
  }

  getByAsset(assetId: string): ImpairmentRecord[] {
    return this.getAll().filter((r) => r.assetId === assetId);
  }

  getByIndicator(indicator: string): ImpairmentRecord[] {
    return this.getAll().filter((r) => r.indicator === indicator);
  }

  getByDateRange(from: Date, to: Date): ImpairmentRecord[] {
    return this.getAll().filter((r) => r.impairmentDate >= from && r.impairmentDate <= to);
  }

  getPendingApproval(): ImpairmentRecord[] {
    return this.getAll().filter((r) => !r.approvedBy);
  }

  getTotalImpairmentLoss(): number {
    return this.getAll().reduce((sum, r) => sum + r.impairmentLoss, 0);
  }

  getReversals(): ImpairmentRecord[] {
    return this.getAll().filter((r) => r.reversed);
  }

  count(): number {
    return this.items.size;
  }

  update(id: string, updates: Partial<ImpairmentRecord>): ImpairmentRecord | undefined {
    const existing = this.items.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.items.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.items.delete(id);
  }
}

export default ImpairmentService;
