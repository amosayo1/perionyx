import type { RevenuePlan, RevenuePlanItem, RevenueDriver } from "../../types";

export class RevenuePlanningService {
  private plans = new Map<string, RevenuePlan>();

  addPlan(p: RevenuePlan): void {
    this.plans.set(p.id, p);
  }

  getPlan(id: string): RevenuePlan | undefined {
    return this.plans.get(id);
  }

  getAllPlans(): RevenuePlan[] {
    return [...this.plans.values()];
  }

  getByDriver(driver: RevenueDriver): RevenuePlan[] {
    return this.getAllPlans().filter((p) => p.driver === driver);
  }

  getByCompany(companyId: string): RevenuePlan[] {
    return this.getAllPlans().filter((p) => p.companyId === companyId);
  }

  getByYear(year: number): RevenuePlan[] {
    return this.getAllPlans().filter((p) => p.fiscalYear === year);
  }

  addItem(item: RevenuePlanItem): void {
    const plan = this.plans.get(item.planId);
    if (plan && plan.items) {
      (plan.items as any[]).push(item);
    }
  }

  getItems(planId: string): RevenuePlanItem[] {
    const plan = this.plans.get(planId);
    return plan && plan.items ? [...plan.items] : [];
  }

  count(): number {
    return this.plans.size;
  }
}
