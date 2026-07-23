import type { FPABudget, FPABudgetItem, BudgetStatus, BudgetType } from "../../types";

export class BudgetsService {
  private budgets = new Map<string, FPABudget>();

  addBudget(b: FPABudget): void {
    this.budgets.set(b.id, b);
  }

  getBudget(id: string): FPABudget | undefined {
    return this.budgets.get(id);
  }

  getAllBudgets(): FPABudget[] {
    return [...this.budgets.values()];
  }

  getByStatus(status: BudgetStatus): FPABudget[] {
    return this.getAllBudgets().filter((b) => b.status === status);
  }

  getByType(type: BudgetType): FPABudget[] {
    return this.getAllBudgets().filter((b) => b.type === type);
  }

  getByCompany(companyId: string): FPABudget[] {
    return this.getAllBudgets().filter((b) => b.companyId === companyId);
  }

  getByFiscalYear(year: number): FPABudget[] {
    return this.getAllBudgets().filter((b) => b.fiscalYear === year);
  }

  getActiveBudgets(): FPABudget[] {
    return this.getAllBudgets().filter((b) => b.status === "active");
  }

  addItem(item: FPABudgetItem): void {
    const budget = this.budgets.get(item.budgetId);
    if (budget) {
      budget.items.push(item);
    }
  }

  getItems(budgetId: string): FPABudgetItem[] {
    const budget = this.budgets.get(budgetId);
    return budget ? [...budget.items] : [];
  }

  count(): number {
    return this.budgets.size;
  }
}
