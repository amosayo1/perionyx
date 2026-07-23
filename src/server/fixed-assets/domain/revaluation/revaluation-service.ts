import type { RevaluationRecord, RevaluationType } from "../../types";

export class RevaluationService {
  private items = new Map<string, RevaluationRecord>();

  add(record: RevaluationRecord): void { this.items.set(record.id, record); }
  get(id: string): RevaluationRecord | undefined { return this.items.get(id); }
  getAll(): RevaluationRecord[] { return Array.from(this.items.values()); }
  getByAsset(assetId: string): RevaluationRecord[] { return this.getAll().filter((r) => r.assetId === assetId); }
  getByType(type: RevaluationType): RevaluationRecord[] { return this.getAll().filter((r) => r.revaluationType === type); }
  getByDateRange(from: Date, to: Date): RevaluationRecord[] { return this.getAll().filter((r) => r.revaluationDate >= from && r.revaluationDate <= to); }
  getPendingApproval(): RevaluationRecord[] { return this.getAll().filter((r) => !r.approvedBy); }
  getTotalSurplus(): number { return this.getAll().reduce((sum, r) => sum + r.revaluationSurplus, 0); }
  getTotalLoss(): number { return this.getAll().reduce((sum, r) => sum + r.revaluationLoss, 0); }
  getNetRevaluation(): number { return this.getTotalSurplus() - this.getTotalLoss(); }
  count(): number { return this.items.size; }

  update(id: string, updates: Partial<RevaluationRecord>): RevaluationRecord | undefined {
    const existing = this.items.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.items.set(id, updated);
    return updated;
  }

  delete(id: string): boolean { return this.items.delete(id); }
}
