import type { Consolidation } from "../types";

export class ConsolidationService {
  private consolidations = new Map<string, Consolidation>();

  addConsolidation(c: Consolidation): void {
    this.consolidations.set(c.id, c);
  }

  getConsolidation(id: string): Consolidation | undefined {
    return this.consolidations.get(id);
  }

  getAllConsolidations(): Consolidation[] {
    return [...this.consolidations.values()];
  }

  getByParent(parentCompanyId: string): Consolidation[] {
    return this.getAllConsolidations().filter(
      (c) => c.parentCompanyId === parentCompanyId,
    );
  }

  getByPeriod(periodId: string): Consolidation[] {
    return this.getAllConsolidations().filter((c) => c.periodId === periodId);
  }

  getByStatus(status: string): Consolidation[] {
    return this.getAllConsolidations().filter((c) => c.status === status);
  }

  count(): number {
    return this.consolidations.size;
  }
}
