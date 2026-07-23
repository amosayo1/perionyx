import type { TaxReconciliation, TaxAdjustment } from "../../types";

export class TaxReconciliationService {
  private reconciliations = new Map<string, TaxReconciliation>();
  private adjustments = new Map<string, TaxAdjustment>();

  addReconciliation(rec: TaxReconciliation): TaxReconciliation {
    this.reconciliations.set(rec.id, rec);
    return rec;
  }

  getReconciliation(id: string): TaxReconciliation | undefined {
    return this.reconciliations.get(id);
  }

  getAllReconciliations(): TaxReconciliation[] {
    return Array.from(this.reconciliations.values());
  }

  getByJurisdiction(jurisdictionId: string): TaxReconciliation[] {
    return this.getAllReconciliations().filter(r => r.jurisdictionId === jurisdictionId);
  }

  getByPeriod(period: string): TaxReconciliation[] {
    return this.getAllReconciliations().filter(r => r.period === period);
  }

  getByStatus(status: string): TaxReconciliation[] {
    return this.getAllReconciliations().filter(r => r.status === status);
  }

  getUnbalanced(): TaxReconciliation[] {
    return this.getAllReconciliations().filter(r => r.status === "unbalanced");
  }

  addAdjustment(adjustment: TaxAdjustment): TaxAdjustment {
    this.adjustments.set(adjustment.id, adjustment);
    return adjustment;
  }

  getAdjustment(id: string): TaxAdjustment | undefined {
    return this.adjustments.get(id);
  }

  getByReconciliation(): TaxAdjustment[] {
    return Array.from(this.adjustments.values());
  }

  getAllAdjustments(): TaxAdjustment[] {
    return Array.from(this.adjustments.values());
  }

  count(): number {
    return this.reconciliations.size;
  }
}
