import type { AccountingPeriod, FiscalYear, ClosingChecklist, PeriodStatus, CloseStatus } from "../../types";

export class PeriodsService {
  private periods = new Map<string, AccountingPeriod>();
  private fiscalYears = new Map<string, FiscalYear>();
  private checklists = new Map<string, ClosingChecklist>();

  createPeriod(period: AccountingPeriod): AccountingPeriod {
    this.periods.set(period.id, period);
    return period;
  }

  getPeriod(id: string): AccountingPeriod | undefined {
    return this.periods.get(id);
  }

  getAllPeriods(): AccountingPeriod[] {
    return Array.from(this.periods.values());
  }

  getOpenPeriods(): AccountingPeriod[] {
    return this.getAllPeriods().filter(p => p.status === "open" || p.status === "reopened");
  }

  getClosedPeriods(): AccountingPeriod[] {
    return this.getAllPeriods().filter(p => p.status === "hard-close" || p.status === "locked");
  }

  softClose(id: string): AccountingPeriod | undefined {
    return this.updateStatus(id, "soft-close");
  }

  hardClose(id: string): AccountingPeriod | undefined {
    return this.updateStatus(id, "hard-close");
  }

  reopen(id: string): AccountingPeriod | undefined {
    return this.updateStatus(id, "reopened");
  }

  lockPeriod(id: string): AccountingPeriod | undefined {
    return this.updateStatus(id, "locked");
  }

  private updateStatus(id: string, status: PeriodStatus): AccountingPeriod | undefined {
    const period = this.periods.get(id);
    if (!period) return undefined;
    const updated = { ...period, status, closeDate: ["hard-close", "locked"].includes(status) ? new Date() : period.closeDate, updatedAt: new Date() };
    this.periods.set(id, updated);
    return updated;
  }

  createFiscalYear(fy: FiscalYear): FiscalYear {
    this.fiscalYears.set(fy.id, fy);
    return fy;
  }

  getFiscalYear(id: string): FiscalYear | undefined {
    return this.fiscalYears.get(id);
  }

  getAllFiscalYears(): FiscalYear[] {
    return Array.from(this.fiscalYears.values());
  }

  getCurrentPeriod(): AccountingPeriod | undefined {
    const now = new Date();
    return this.getAllPeriods().find(p => p.startDate <= now && p.endDate >= now);
  }

  addChecklistItem(item: ClosingChecklist): ClosingChecklist {
    this.checklists.set(item.id, item);
    return item;
  }

  getChecklist(periodId: string): ClosingChecklist[] {
    return Array.from(this.checklists.values()).filter(c => c.periodId === periodId);
  }

  updateChecklist(id: string, status: CloseStatus, userId?: string): ClosingChecklist | undefined {
    const item = this.checklists.get(id);
    if (!item) return undefined;
    const updated = {
      ...item,
      status,
      completedBy: status === "completed" || status === "verified" ? userId || item.completedBy : item.completedBy,
      completedAt: status === "completed" || status === "verified" ? new Date() : item.completedAt,
      updatedAt: new Date(),
    };
    this.checklists.set(id, updated);
    return updated;
  }

  count(): number {
    return this.periods.size;
  }

  countFiscalYears(): number {
    return this.fiscalYears.size;
  }

  countChecklistItems(): number {
    return this.checklists.size;
  }
}
