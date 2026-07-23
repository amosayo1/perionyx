import type { CapitalPlan, CapitalCategory } from "../../types";
import type { CapitalPlanItemBackward as CapitalPlanItem } from "../../types";

export class CapitalPlanningService {
  private plans = new Map<string, CapitalPlan>();

  addPlan(p: CapitalPlan): void {
    this.plans.set(p.id, p);
  }

  getPlan(id: string): CapitalPlan | undefined {
    return this.plans.get(id);
  }

  getAllPlans(): CapitalPlan[] {
    return [...this.plans.values()];
  }

  getByCategory(category: CapitalCategory): CapitalPlan[] {
    return this.getAllPlans().filter((p) => p.category === category);
  }

  getByCompany(companyId: string): CapitalPlan[] {
    return this.getAllPlans().filter((p) => p.companyId === companyId);
  }

  getByYear(year: number): CapitalPlan[] {
    return this.getAllPlans().filter((p) => p.fiscalYear === year);
  }

  addItem(item: CapitalPlanItem): void {
    const plan = this.plans.get(item.planId);
    if (plan && plan.items) {
      (plan.items as CapitalPlanItem[]).push(item);
    }
  }

  getItems(planId: string): CapitalPlanItem[] {
    const plan = this.plans.get(planId);
    return plan && plan.items ? [...plan.items as CapitalPlanItem[]] : [];
  }

  count(): number {
    return this.plans.size;
  }
}
