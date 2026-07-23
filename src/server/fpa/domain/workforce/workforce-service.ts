import type { WorkforcePlan, WorkforcePlanItem, WorkforceCategory } from "../../types";

export class WorkforceService {
  private plans = new Map<string, WorkforcePlan>();

  addPlan(p: WorkforcePlan): void {
    this.plans.set(p.id, p);
  }

  getPlan(id: string): WorkforcePlan | undefined {
    return this.plans.get(id);
  }

  getAllPlans(): WorkforcePlan[] {
    return [...this.plans.values()];
  }

  getByCategory(category: WorkforceCategory): WorkforcePlan[] {
    return this.getAllPlans().filter((p) => p.category === category);
  }

  getByCompany(companyId: string): WorkforcePlan[] {
    return this.getAllPlans().filter((p) => p.companyId === companyId);
  }

  getByYear(year: number): WorkforcePlan[] {
    return this.getAllPlans().filter((p) => p.fiscalYear === year);
  }

  addItem(item: WorkforcePlanItem): void {
    const plan = this.plans.get(item.planId);
    if (plan && plan.items) {
      (plan.items as any[]).push(item);
    }
  }

  getItems(planId: string): WorkforcePlanItem[] {
    const plan = this.plans.get(planId);
    return plan && plan.items ? [...plan.items] : [];
  }

  count(): number {
    return this.plans.size;
  }
}
