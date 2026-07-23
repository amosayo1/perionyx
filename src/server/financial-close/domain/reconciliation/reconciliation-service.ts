import type { ReconciliationRecord, ReconciliationAdjustment, ReconciliationStatus, ReconciliationType } from "../../types";

export class ReconciliationService {
  private reconciliations = new Map<string, ReconciliationRecord>();

  add(rec: ReconciliationRecord): ReconciliationRecord {
    this.reconciliations.set(rec.id, rec);
    return rec;
  }

  get(id: string): ReconciliationRecord | undefined {
    return this.reconciliations.get(id);
  }

  getAll(): ReconciliationRecord[] {
    return Array.from(this.reconciliations.values());
  }

  getByPeriod(periodId: string): ReconciliationRecord[] {
    return this.getAll().filter((r) => r.periodId === periodId);
  }

  getByType(type: ReconciliationType): ReconciliationRecord[] {
    return this.getAll().filter((r) => r.reconciliationType === type);
  }

  getByStatus(status: ReconciliationStatus): ReconciliationRecord[] {
    return this.getAll().filter((r) => r.status === status);
  }

  getByAccount(accountId: string): ReconciliationRecord[] {
    return this.getAll().filter((r) => r.accountId === accountId);
  }

  getUnbalanced(): ReconciliationRecord[] {
    return this.getAll().filter((r) => !r.isBalanced && r.status !== "approved");
  }

  search(query: string): ReconciliationRecord[] {
    const q = query.toLowerCase();
    return this.getAll().filter((r) => r.accountName.toLowerCase().includes(q) || r.accountCode.toLowerCase().includes(q));
  }

  count(): number {
    return this.reconciliations.size;
  }

  update(id: string, updates: Partial<ReconciliationRecord>): ReconciliationRecord {
    const existing = this.reconciliations.get(id);
    if (!existing) throw new Error(`Reconciliation ${id} not found`);
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.reconciliations.set(id, updated);
    return updated;
  }

  delete(id: string): void {
    this.reconciliations.delete(id);
  }

  addAdjustment(recId: string, adjustment: ReconciliationAdjustment): ReconciliationRecord {
    const rec = this.reconciliations.get(recId);
    if (!rec) throw new Error(`Reconciliation ${recId} not found`);
    const adjustments = [...rec.adjustments, adjustment];
    const totalAdjustments = adjustments.reduce((sum, a) => sum + (a.type === "debit" ? a.amount : -a.amount), 0);
    const newDifference = rec.sourceBalance - rec.targetBalance + totalAdjustments;
    return this.update(recId, { adjustments, difference: newDifference, isBalanced: Math.abs(newDifference) < 0.01 });
  }

  approve(id: string, approvedBy: string): ReconciliationRecord {
    return this.update(id, { status: "approved", approvedBy, approvedDate: new Date() });
  }

  getCompletionStats(periodId: string): { total: number; matched: number; unmatched: number; approved: number; rate: number } {
    const periodRecs = this.getByPeriod(periodId);
    const total = periodRecs.length;
    const matched = periodRecs.filter((r) => r.status === "matched" || r.status === "approved").length;
    const unmatched = periodRecs.filter((r) => r.status === "unmatched" || r.status === "pending").length;
    const approved = periodRecs.filter((r) => r.status === "approved").length;
    return { total, matched, unmatched, approved, rate: total > 0 ? (matched / total) * 100 : 0 };
  }
}
