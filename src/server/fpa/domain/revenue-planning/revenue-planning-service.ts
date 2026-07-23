import type { RevenuePlan } from "../../types";

export class RevenuePlanningService {
  private items = new Map<string, RevenuePlan>();

  add(plan: RevenuePlan): void { this.items.set(plan.id, plan); }
  get(id: string): RevenuePlan | undefined { return this.items.get(id); }
  getAll(): RevenuePlan[] { return Array.from(this.items.values()); }
  getByPlan(planId: string): RevenuePlan[] { return this.getAll().filter((r) => r.planId === planId); }
  getByProductLine(line: string): RevenuePlan[] { return this.getAll().filter((r) => r.productLine === line); }
  getByRevenueType(type: string): RevenuePlan[] { return this.getAll().filter((r) => r.revenueType === type); }
  getByDepartment(dept: string): RevenuePlan[] { return this.getAll().filter((r) => r.department === dept); }
  getByPeriod(period: string): RevenuePlan[] { return this.getAll().filter((r) => r.period === period); }
  getTotalRevenue(): number { return this.getAll().reduce((s, r) => s + r.revenue, 0); }
  getTotalCOGS(): number { return this.getAll().reduce((s, r) => s + r.costOfGoodsSold, 0); }
  getAverageGrossMargin(): number {
    const all = this.getAll();
    if (all.length === 0) return 0;
    return all.reduce((s, r) => s + r.grossMarginPercent, 0) / all.length;
  }
  count(): number { return this.items.size; }
  update(id: string, updates: Partial<RevenuePlan>): RevenuePlan | undefined {
    const existing = this.items.get(id); if (!existing) return undefined;
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.items.set(id, updated); return updated;
  }
  delete(id: string): boolean { return this.items.delete(id); }
}
