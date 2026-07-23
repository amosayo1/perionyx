import type { BudgetPlan, BudgetLineItem, PlanType, PlanStatus } from "../../types";

export class BudgetingService {
  private plans = new Map<string, BudgetPlan>();
  private lineItems = new Map<string, BudgetLineItem>();

  addPlan(plan: BudgetPlan): void { this.plans.set(plan.id, plan); }
  getPlan(id: string): BudgetPlan | undefined { return this.plans.get(id); }
  getAllPlans(): BudgetPlan[] { return Array.from(this.plans.values()); }
  getPlansByType(type: PlanType): BudgetPlan[] { return this.getAllPlans().filter((p) => p.planType === type); }
  getPlansByStatus(status: PlanStatus): BudgetPlan[] { return this.getAllPlans().filter((p) => p.status === status); }
  getPlansByFiscalYear(year: number): BudgetPlan[] { return this.getAllPlans().filter((p) => p.fiscalYear === year); }
  getPlansByDepartment(dept: string): BudgetPlan[] { return this.getAllPlans().filter((p) => p.department === dept); }
  getActivePlans(): BudgetPlan[] { return this.getAllPlans().filter((p) => p.status !== "archived"); }
  getApprovedPlans(): BudgetPlan[] { return this.getPlansByStatus("approved"); }
  getDraftPlans(): BudgetPlan[] { return this.getPlansByStatus("draft"); }
  approvePlan(id: string, userId: string): BudgetPlan | undefined {
    const p = this.plans.get(id); if (!p) return undefined;
    const updated = { ...p, status: "approved" as const, approvedBy: userId, approvedAt: new Date(), updatedAt: new Date() };
    this.plans.set(id, updated); return updated;
  }
  lockPlan(id: string): BudgetPlan | undefined {
    const p = this.plans.get(id); if (!p) return undefined;
    const updated = { ...p, status: "locked" as const, updatedAt: new Date() };
    this.plans.set(id, updated); return updated;
  }
  getTotalRevenueBudget(): number { return this.getAllPlans().reduce((s, p) => s + p.totalRevenue, 0); }
  getTotalExpenseBudget(): number { return this.getAllPlans().reduce((s, p) => s + p.totalExpenses, 0); }
  countPlans(): number { return this.plans.size; }
  updatePlan(id: string, updates: Partial<BudgetPlan>): BudgetPlan | undefined {
    const existing = this.plans.get(id); if (!existing) return undefined;
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.plans.set(id, updated); return updated;
  }
  deletePlan(id: string): boolean { return this.plans.delete(id); }

  addLineItem(item: BudgetLineItem): void { this.lineItems.set(item.id, item); }
  getLineItem(id: string): BudgetLineItem | undefined { return this.lineItems.get(id); }
  getLineItemsByPlan(planId: string): BudgetLineItem[] { return Array.from(this.lineItems.values()).filter((i) => i.planId === planId); }
  getAllLineItems(): BudgetLineItem[] { return Array.from(this.lineItems.values()); }
  deleteLineItem(id: string): boolean { return this.lineItems.delete(id); }
}
