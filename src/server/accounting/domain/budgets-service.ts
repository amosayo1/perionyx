import type { Budget } from "../types";

export class BudgetsService {
  private budgets = new Map<string, Budget>();

  addBudget(b: Budget): void {
    this.budgets.set(b.id, b);
  }

  getBudget(id: string): Budget | undefined {
    return this.budgets.get(id);
  }

  getAllBudgets(): Budget[] {
    return [...this.budgets.values()];
  }

  getByFiscalYear(yearId: string): Budget[] {
    return this.getAllBudgets().filter((b) => b.fiscalYearId === yearId);
  }

  getByCompany(companyId: string): Budget[] {
    return this.getAllBudgets().filter((b) => b.companyId === companyId);
  }

  getActiveBudgets(): Budget[] {
    return this.getAllBudgets().filter((b) => b.status === "active");
  }

  count(): number {
    return this.budgets.size;
  }
}
