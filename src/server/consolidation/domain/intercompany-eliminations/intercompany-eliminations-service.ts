import type { IntercompanyRecord, IntercompanyType, IntercompanyStatus } from "../../types";

export class IntercompanyEliminationsService {
  private items = new Map<string, IntercompanyRecord>();

  add(record: IntercompanyRecord): void { this.items.set(record.id, record); }
  get(id: string): IntercompanyRecord | undefined { return this.items.get(id); }
  getAll(): IntercompanyRecord[] { return Array.from(this.items.values()); }
  getByConsolidationRun(runId: string): IntercompanyRecord[] { return this.getAll().filter((r) => r.consolidationRunId === runId); }
  getByType(type: IntercompanyType): IntercompanyRecord[] { return this.getAll().filter((r) => r.intercompanyType === type); }
  getByStatus(status: IntercompanyStatus): IntercompanyRecord[] { return this.getAll().filter((r) => r.status === status); }
  getByFromEntity(entityId: string): IntercompanyRecord[] { return this.getAll().filter((r) => r.fromEntityId === entityId); }
  getByToEntity(entityId: string): IntercompanyRecord[] { return this.getAll().filter((r) => r.toEntityId === entityId); }
  getMatched(): IntercompanyRecord[] { return this.getByStatus("matched"); }
  getUnmatched(): IntercompanyRecord[] { return this.getByStatus("unmatched"); }
  getEliminated(): IntercompanyRecord[] { return this.getByStatus("eliminated"); }
  getByPeriod(periodId: string): IntercompanyRecord[] { return this.getAll().filter((r) => r.periodId === periodId); }
  getTotalUnmatched(): number { return this.getUnmatched().length; }
  getTotalEliminated(): number { return this.getEliminated().length; }
  getTotalEliminationAmount(): number { return this.getEliminated().reduce((s, r) => s + r.eliminationAmount, 0); }
  getTotalUnmatchedAmount(): number { return this.getUnmatched().reduce((s, r) => s + Math.abs(r.difference), 0); }
  matchRecords(id1: string, id2: string, eliminationAmount: number, userId: string): void {
    const r1 = this.items.get(id1); const r2 = this.items.get(id2);
    if (r1 && r2) {
      const updated1 = { ...r1, status: "matched" as const, matchedWithId: id2, updatedAt: new Date() };
      const updated2 = { ...r2, status: "matched" as const, matchedWithId: id1, updatedAt: new Date() };
      this.items.set(id1, updated1); this.items.set(id2, updated2);
    }
  }
  eliminate(id: string, amount: number, journalId: string, userId: string): IntercompanyRecord | undefined {
    const existing = this.items.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, status: "eliminated" as const, eliminationAmount: amount, eliminationJournalId: journalId, eliminationDate: new Date(), approvedById: userId, approvedAt: new Date(), updatedAt: new Date() };
    this.items.set(id, updated);
    return updated;
  }
  count(): number { return this.items.size; }
  update(id: string, updates: Partial<IntercompanyRecord>): IntercompanyRecord | undefined {
    const existing = this.items.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.items.set(id, updated);
    return updated;
  }
  delete(id: string): boolean { return this.items.delete(id); }
}
