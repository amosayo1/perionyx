import type { AccountReconciliation, ReconcilingItem, ReconciliationStatus } from "../../types";

export class AccountReconciliationService {
  private reconciliations = new Map<string, AccountReconciliation>();

  add(rec: AccountReconciliation): AccountReconciliation {
    this.reconciliations.set(rec.id, rec);
    return rec;
  }

  get(id: string): AccountReconciliation | undefined {
    return this.reconciliations.get(id);
  }

  getAll(): AccountReconciliation[] {
    return Array.from(this.reconciliations.values());
  }

  getByPeriod(periodId: string): AccountReconciliation[] {
    return this.getAll().filter((r) => r.periodId === periodId);
  }

  getByStatus(status: ReconciliationStatus): AccountReconciliation[] {
    return this.getAll().filter((r) => r.status === status);
  }

  getByAccount(accountId: string): AccountReconciliation[] {
    return this.getAll().filter((r) => r.accountId === accountId);
  }

  getUnmatched(): AccountReconciliation[] {
    return this.getAll().filter((r) => Math.abs(r.difference) > 0.01 && r.status !== "approved");
  }

  count(): number {
    return this.reconciliations.size;
  }

  update(id: string, updates: Partial<AccountReconciliation>): AccountReconciliation {
    const existing = this.reconciliations.get(id);
    if (!existing) throw new Error(`AccountReconciliation ${id} not found`);
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.reconciliations.set(id, updated);
    return updated;
  }

  delete(id: string): void {
    this.reconciliations.delete(id);
  }

  addReconcilingItem(recId: string, item: ReconcilingItem): AccountReconciliation {
    const rec = this.reconciliations.get(recId);
    if (!rec) throw new Error(`AccountReconciliation ${recId} not found`);
    const items = [...rec.reconcilingItems, item];
    const glTotal = items.filter((i) => i.type === "gl").reduce((s, i) => s + i.amount, 0);
    const slTotal = items.filter((i) => i.type === "subledger").reduce((s, i) => s + i.amount, 0);
    return this.update(recId, { reconcilingItems: items, difference: rec.glBalance - rec.subledgerBalance + glTotal - slTotal });
  }

  approve(id: string, approvedBy: string): AccountReconciliation {
    return this.update(id, { status: "approved", approvedBy, updatedAt: new Date() });
  }
}
