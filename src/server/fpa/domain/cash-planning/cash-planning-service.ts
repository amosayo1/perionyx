import type { CashPlan } from "../../types";

export class CashPlanningService {
  private items = new Map<string, CashPlan>();

  add(plan: CashPlan): void { this.items.set(plan.id, plan); }

  get(id: string): CashPlan | undefined { return this.items.get(id); }

  getAll(): CashPlan[] { return Array.from(this.items.values()); }

  getByPlan(planId: string): CashPlan[] { return this.getAll().filter((p) => p.planId === planId); }

  getByPeriod(period: string): CashPlan[] { return this.getAll().filter((p) => p.period === period); }

  getLatest(): CashPlan | undefined {
    return this.getAll().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
  }

  getTotalBeginningCash(): number { return this.getAll().reduce((s, p) => s + p.beginningCash, 0); }

  getTotalEndingCash(): number { return this.getAll().reduce((s, p) => s + p.endingCash, 0); }

  getTotalExcessCash(): number { return this.getAll().reduce((s, p) => s + p.excessCash, 0); }

  count(): number { return this.items.size; }

  update(id: string, updates: Partial<CashPlan>): CashPlan | undefined {
    const existing = this.items.get(id); if (!existing) return undefined;
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.items.set(id, updated); return updated;
  }

  delete(id: string): boolean { return this.items.delete(id); }
}
