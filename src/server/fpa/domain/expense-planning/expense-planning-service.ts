import type { ExpensePlan } from "../../types";

export class ExpensePlanningService {
  private items = new Map<string, ExpensePlan>();

  add(plan: ExpensePlan): void { this.items.set(plan.id, plan); }
  get(id: string): ExpensePlan | undefined { return this.items.get(id); }
  getAll(): ExpensePlan[] { return Array.from(this.items.values()); }
  getByPlan(planId: string): ExpensePlan[] { return this.getAll().filter((e) => e.planId === planId); }
  getByDepartment(dept: string): ExpensePlan[] { return this.getAll().filter((e) => e.department === dept); }
  getByExpenseType(type: string): ExpensePlan[] { return this.getAll().filter((e) => e.expenseType === type); }
  getByCategory(cat: string): ExpensePlan[] { return this.getAll().filter((e) => e.category === cat); }
  getByPeriod(period: string): ExpensePlan[] { return this.getAll().filter((e) => e.period === period); }
  getTotalExpenses(): number { return this.getAll().reduce((s, e) => s + e.amount, 0); }
  getFixedCosts(): number { return this.getAll().filter((e) => e.expenseType === "fixed").reduce((s, e) => s + e.amount, 0); }
  getVariableCosts(): number { return this.getAll().filter((e) => e.expenseType === "variable").reduce((s, e) => s + e.amount, 0); }
  getDiscretionaryCosts(): number { return this.getAll().filter((e) => e.isDiscretionary).reduce((s, e) => s + e.amount, 0); }
  count(): number { return this.items.size; }
  update(id: string, updates: Partial<ExpensePlan>): ExpensePlan | undefined {
    const existing = this.items.get(id); if (!existing) return undefined;
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.items.set(id, updated); return updated;
  }
  delete(id: string): boolean { return this.items.delete(id); }
}
