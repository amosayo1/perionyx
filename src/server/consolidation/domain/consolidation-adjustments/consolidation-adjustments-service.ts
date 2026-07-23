import type { ConsolidationAdjustment, AdjustmentType, AdjustmentStatus } from "../../types";

export class ConsolidationAdjustmentsService {
  private items = new Map<string, ConsolidationAdjustment>();

  add(adjustment: ConsolidationAdjustment): void { this.items.set(adjustment.id, adjustment); }

  get(id: string): ConsolidationAdjustment | undefined { return this.items.get(id); }

  getAll(): ConsolidationAdjustment[] { return Array.from(this.items.values()); }

  getByConsolidationRun(runId: string): ConsolidationAdjustment[] {
    return this.getAll().filter((a) => a.consolidationRunId === runId);
  }

  getByType(type: AdjustmentType): ConsolidationAdjustment[] {
    return this.getAll().filter((a) => a.adjustmentType === type);
  }

  getByStatus(status: AdjustmentStatus): ConsolidationAdjustment[] {
    return this.getAll().filter((a) => a.status === status);
  }

  getByEntity(entityId: string): ConsolidationAdjustment[] {
    return this.getAll().filter((a) => a.entityId === entityId);
  }

  getByPeriod(periodId: string): ConsolidationAdjustment[] {
    return this.getAll().filter((a) => a.periodId === periodId);
  }

  getPending(): ConsolidationAdjustment[] {
    return this.getByStatus("review");
  }

  getApproved(): ConsolidationAdjustment[] {
    return this.getByStatus("approved");
  }

  getPosted(): ConsolidationAdjustment[] {
    return this.getByStatus("posted");
  }

  approve(id: string, userId: string): ConsolidationAdjustment | undefined {
    const existing = this.items.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, status: "approved" as const, approvedById: userId, updatedAt: new Date() };
    this.items.set(id, updated);
    return updated;
  }

  reject(id: string, userId: string, reason: string): ConsolidationAdjustment | undefined {
    const existing = this.items.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, status: "rejected" as const, rejectedById: userId, rejectionReason: reason, updatedAt: new Date() };
    this.items.set(id, updated);
    return updated;
  }

  post(id: string, journalId: string): ConsolidationAdjustment | undefined {
    const existing = this.items.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, status: "posted" as const, glJournalId: journalId, postedDate: new Date(), updatedAt: new Date() };
    this.items.set(id, updated);
    return updated;
  }

  getTotalAdjustmentAmount(): number {
    return this.getApproved().reduce((s, a) => s + a.amount, 0);
  }

  count(): number { return this.items.size; }

  countByType(type: AdjustmentType): number {
    return this.getByType(type).length;
  }

  countByStatus(status: AdjustmentStatus): number {
    return this.getByStatus(status).length;
  }

  update(id: string, updates: Partial<ConsolidationAdjustment>): ConsolidationAdjustment {
    const existing = this.items.get(id);
    if (!existing) throw new Error(`ConsolidationAdjustment ${id} not found`);
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.items.set(id, updated);
    return updated;
  }

  delete(id: string): void { this.items.delete(id); }
}
