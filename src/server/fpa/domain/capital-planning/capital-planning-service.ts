import type { CapitalPlan } from "../../types";

export class CapitalPlanningService {
  private items = new Map<string, CapitalPlan>();

  add(plan: CapitalPlan): void { this.items.set(plan.id, plan); }

  get(id: string): CapitalPlan | undefined { return this.items.get(id); }

  getAll(): CapitalPlan[] { return Array.from(this.items.values()); }

  getByPlan(planId: string): CapitalPlan[] { return this.getAll().filter((p) => p.planId === planId); }

  getByDepartment(dept: string): CapitalPlan[] { return this.getAll().filter((p) => p.department === dept); }

  getByStatus(status: string): CapitalPlan[] { return this.getAll().filter((p) => p.status === status); }

  getByType(type: string): CapitalPlan[] { return this.getAll().filter((p) => p.projectType === type); }

  getByPriority(priority: string): CapitalPlan[] { return this.getAll().filter((p) => p.priority === priority); }

  getActive(): CapitalPlan[] { return this.getAll().filter((p) => p.status === "inProgress" || p.status === "approved"); }

  getTotalBudget(): number { return this.getAll().reduce((s, p) => s + p.totalBudget, 0); }

  getTotalSpent(): number { return this.getAll().reduce((s, p) => s + p.spentToDate, 0); }

  getTotalRemaining(): number { return this.getAll().reduce((s, p) => s + p.remainingBudget, 0); }

  count(): number { return this.items.size; }

  update(id: string, updates: Partial<CapitalPlan>): CapitalPlan | undefined {
    const existing = this.items.get(id); if (!existing) return undefined;
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.items.set(id, updated); return updated;
  }

  delete(id: string): boolean { return this.items.delete(id); }
}
