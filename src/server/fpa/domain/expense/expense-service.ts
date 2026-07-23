import type { ExpensePlan, ExpensePlanItem, ExpenseCategory } from "../../types";

export class ExpensePlanningService {
  private plans = new Map<string, ExpensePlan>();

  addPlan(p: ExpensePlan): void {
    this.plans.set(p.id, p);
  }

  getPlan(id: string): ExpensePlan | undefined {
    return this.plans.get(id);
  }

  getAllPlans(): ExpensePlan[] {
    return [...this.plans.values()];
  }

  getByCategory(category: ExpenseCategory): ExpensePlan[] {
    return this.getAllPlans().filter((p) => p.category === category);
  }

  getByCompany(companyId: string): ExpensePlan[] {
    return this.getAllPlans().filter((p) => p.companyId === companyId);
  }

  getByYear(year: number): ExpensePlan[] {
    return this.getAllPlans().filter((p) => p.fiscalYear === year);
  }

  addItem(item: ExpensePlanItem): void {
    const plan = this.plans.get(item.planId);
    if (plan && plan.items) {
      (plan.items as any[]).push(item);
    }
  }

  getItems(planId: string): ExpensePlanItem[] {
    const plan = this.plans.get(planId);
    return plan && plan.items ? [...plan.items] : [];
  }

  count(): number {
    return this.plans.size;
  }
}
