import type { IntercompanyReconciliation, IntercompanyItem, ReconciliationStatus } from "../../types";

export class IntercompanyReconciliationService {
  private reconciliations = new Map<string, IntercompanyReconciliation>();

  add(rec: IntercompanyReconciliation): IntercompanyReconciliation {
    this.reconciliations.set(rec.id, rec);
    return rec;
  }

  get(id: string): IntercompanyReconciliation | undefined {
    return this.reconciliations.get(id);
  }

  getAll(): IntercompanyReconciliation[] {
    return Array.from(this.reconciliations.values());
  }

  getByPeriod(periodId: string): IntercompanyReconciliation[] {
    return this.getAll().filter((r) => r.periodId === periodId);
  }

  getByStatus(status: ReconciliationStatus): IntercompanyReconciliation[] {
    return this.getAll().filter((r) => r.status === status);
  }

  getByEntity(entity: string): IntercompanyReconciliation[] {
    return this.getAll().filter((r) => r.fromEntity === entity || r.toEntity === entity);
  }

  getUnmatched(): IntercompanyReconciliation[] {
    return this.getAll().filter((r) => Math.abs(r.difference) > 0.01 && r.status !== "approved");
  }

  count(): number {
    return this.reconciliations.size;
  }

  update(id: string, updates: Partial<IntercompanyReconciliation>): IntercompanyReconciliation {
    const existing = this.reconciliations.get(id);
    if (!existing) throw new Error(`ICReconciliation ${id} not found`);
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.reconciliations.set(id, updated);
    return updated;
  }

  delete(id: string): void {
    this.reconciliations.delete(id);
  }

  addItem(recId: string, item: IntercompanyItem): IntercompanyReconciliation {
    const rec = this.reconciliations.get(recId);
    if (!rec) throw new Error(`ICReconciliation ${recId} not found`);
    const items = [...rec.items, item];
    const totalDiff = items.reduce((s, i) => s + i.difference, 0);
    return this.update(recId, { items, difference: totalDiff });
  }

  approve(id: string, approvedBy: string): IntercompanyReconciliation {
    return this.update(id, { status: "approved", approvedBy, updatedAt: new Date() });
  }

  getCompletionStats(periodId: string): { total: number; matched: number; unmatched: number; rate: number } {
    const periodRecs = this.getByPeriod(periodId);
    const total = periodRecs.length;
    const matched = periodRecs.filter((r) => r.status === "approved" || r.status === "matched").length;
    const unmatched = periodRecs.filter((r) => Math.abs(r.difference) > 0.01 && r.status !== "approved").length;
    return { total, matched, unmatched, rate: total > 0 ? (matched / total) * 100 : 0 };
  }
}
