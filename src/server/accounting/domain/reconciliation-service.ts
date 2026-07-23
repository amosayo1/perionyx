import type { Reconciliation, ReconciliationItem } from "../types";

export class ReconciliationService {
  private reconciliations = new Map<string, Reconciliation>();

  addReconciliation(rec: Reconciliation): void {
    this.reconciliations.set(rec.id, rec);
  }

  getReconciliation(id: string): Reconciliation | undefined {
    return this.reconciliations.get(id);
  }

  getAllReconciliations(): Reconciliation[] {
    return [...this.reconciliations.values()];
  }

  getByAccount(accountId: string): Reconciliation[] {
    return this.getAllReconciliations().filter((r) => r.accountId === accountId);
  }

  getByPeriod(periodId: string): Reconciliation[] {
    return this.getAllReconciliations().filter((r) => r.periodId === periodId);
  }

  getByStatus(status: string): Reconciliation[] {
    return this.getAllReconciliations().filter((r) => r.status === status);
  }

  getExceptions(): Reconciliation[] {
    return this.getByStatus("exception");
  }

  count(): number {
    return this.reconciliations.size;
  }
}
