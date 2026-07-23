import type { WorkforcePlan } from "../../types";

export class WorkforcePlanningService {
  private items = new Map<string, WorkforcePlan>();

  add(plan: WorkforcePlan): void { this.items.set(plan.id, plan); }
  get(id: string): WorkforcePlan | undefined { return this.items.get(id); }
  getAll(): WorkforcePlan[] { return Array.from(this.items.values()); }
  getByPlan(planId: string): WorkforcePlan[] { return this.getAll().filter((w) => w.planId === planId); }
  getByDepartment(dept: string): WorkforcePlan[] { return this.getAll().filter((w) => w.department === dept); }
  getByFiscalYear(year: number): WorkforcePlan[] { return this.getAll().filter((w) => w.fiscalYear === year); }
  getTotalHeadcount(): number { return this.getAll().reduce((s, w) => s + w.headcountPlanned, 0); }
  getTotalCompensation(): number { return this.getAll().reduce((s, w) => s + w.totalCompensation, 0); }
  count(): number { return this.items.size; }
  update(id: string, updates: Partial<WorkforcePlan>): WorkforcePlan | undefined {
    const existing = this.items.get(id); if (!existing) return undefined;
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.items.set(id, updated); return updated;
  }
  delete(id: string): boolean { return this.items.delete(id); }

  calculateAttritionRate(plan: WorkforcePlan): number {
    if (plan.headcountCurrent === 0) return 0;
    return (plan.headcountAttrition / plan.headcountCurrent) * 100;
  }
}
