import type { ManagementReportEntry } from "../../types";

export class ManagementReportingService {
  private items = new Map<string, ManagementReportEntry>();

  add(entry: ManagementReportEntry): void { this.items.set(entry.id, entry); }
  get(id: string): ManagementReportEntry | undefined { return this.items.get(id); }
  getAll(): ManagementReportEntry[] { return Array.from(this.items.values()); }
  getByConsolidationRun(runId: string): ManagementReportEntry[] { return this.getAll().filter((e) => e.consolidationRunId === runId); }
  getByEntity(entityId: string): ManagementReportEntry[] { return this.getAll().filter((e) => e.entityId === entityId); }
  getByPeriod(periodId: string): ManagementReportEntry[] { return this.getAll().filter((e) => e.periodId === periodId); }
  getTotalRevenue(): number { return this.getAll().reduce((s, e) => s + e.revenue, 0); }
  getTotalNetIncome(): number { return this.getAll().reduce((s, e) => s + e.netIncome, 0); }
  getTotalExpenses(): number { return this.getAll().reduce((s, e) => s + e.expenses, 0); }
  count(): number { return this.items.size; }
  update(id: string, updates: Partial<ManagementReportEntry>): ManagementReportEntry | undefined {
    const existing = this.items.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.items.set(id, updated);
    return updated;
  }
  delete(id: string): boolean { return this.items.delete(id); }
}
