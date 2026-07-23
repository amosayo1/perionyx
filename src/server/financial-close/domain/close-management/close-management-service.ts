import type { ClosePeriod, ClosePeriodType, ClosePeriodStatus, CloseProgress } from "../../types";

export class CloseManagementService {
  private periods = new Map<string, ClosePeriod>();

  add(period: ClosePeriod): ClosePeriod {
    this.periods.set(period.id, period);
    return period;
  }

  get(id: string): ClosePeriod | undefined {
    return this.periods.get(id);
  }

  getAll(): ClosePeriod[] {
    return Array.from(this.periods.values());
  }

  getByStatus(status: ClosePeriodStatus): ClosePeriod[] {
    return this.getAll().filter((p) => p.status === status);
  }

  getByType(type: ClosePeriodType): ClosePeriod[] {
    return this.getAll().filter((p) => p.periodType === type);
  }

  getByFiscalYear(year: number): ClosePeriod[] {
    return this.getAll().filter((p) => p.fiscalYear === year);
  }

  getActive(): ClosePeriod[] {
    return this.getAll().filter((p) => p.status === "inProgress" || p.status === "review" || p.status === "notStarted");
  }

  getLatest(): ClosePeriod | undefined {
    const active = this.getActive();
    if (active.length === 0) return undefined;
    return active.reduce((a, b) => (a.endDate > b.endDate ? a : b));
  }

  search(query: string): ClosePeriod[] {
    const q = query.toLowerCase();
    return this.getAll().filter(
      (p) => p.label.toLowerCase().includes(q) || p.closeLead.toLowerCase().includes(q),
    );
  }

  count(): number {
    return this.periods.size;
  }

  update(id: string, updates: Partial<ClosePeriod>): ClosePeriod {
    const existing = this.periods.get(id);
    if (!existing) throw new Error(`ClosePeriod ${id} not found`);
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.periods.set(id, updated);
    return updated;
  }

  delete(id: string): void {
    this.periods.delete(id);
  }

  startPeriod(id: string): ClosePeriod {
    return this.update(id, { status: "inProgress" });
  }

  completePeriod(id: string, actualCloseDate: Date): ClosePeriod {
    return this.update(id, {
      status: "locked",
      actualCloseDate,
      daysToClose: Math.round((actualCloseDate.getTime() - (this.get(id)?.startDate ?? new Date()).getTime()) / 86400000),
    });
  }

  reopenPeriod(id: string): ClosePeriod {
    return this.update(id, { status: "reopened" });
  }

  calculateProgress(periodId: string, tasks: { status: string }[]): CloseProgress {
    const period = this.get(periodId);
    if (!period) throw new Error(`Period ${periodId} not found`);
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const inProgress = tasks.filter((t) => t.status === "inProgress").length;
    const blocked = tasks.filter((t) => t.status === "blocked").length;
    const notStarted = tasks.filter((t) => t.status === "notStarted").length;
    const progressPercent = total > 0 ? (completed / total) * 100 : 0;
    const now = new Date();
    const daysElapsed = Math.max(0, Math.round((now.getTime() - period.startDate.getTime()) / 86400000));
    const daysRemaining = Math.max(0, Math.round((period.targetCloseDate.getTime() - now.getTime()) / 86400000));
    const onTrack = progressPercent >= (daysElapsed / Math.max(daysElapsed + daysRemaining, 1)) * 100;
    return { periodId, periodLabel: period.label, totalTasks: total, completedTasks: completed, inProgressTasks: inProgress, blockedTasks: blocked, notStartedTasks: notStarted, progressPercent: Math.round(progressPercent * 100) / 100, daysElapsed, daysRemaining, onTrack };
  }

  getDaysToCloseDistribution(): { range: string; count: number }[] {
    const closed = this.getAll().filter((p) => p.actualCloseDate);
    const ranges = [
      { range: "0-3 days", min: 0, max: 3, count: 0 },
      { range: "4-7 days", min: 4, max: 7, count: 0 },
      { range: "8-14 days", min: 8, max: 14, count: 0 },
      { range: "15+ days", min: 15, max: 999, count: 0 },
    ];
    for (const p of closed) {
      const days = p.daysToClose;
      for (const r of ranges) {
        if (days >= r.min && days <= r.max) r.count++;
      }
    }
    return ranges;
  }
}
