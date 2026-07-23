import type { TaxReturn, TaxReturnStatus, TaxType } from "../../types";

export class TaxReturnsService {
  private returns = new Map<string, TaxReturn>();

  addReturn(taxReturn: TaxReturn): TaxReturn {
    this.returns.set(taxReturn.id, taxReturn);
    return taxReturn;
  }

  getReturn(id: string): TaxReturn | undefined {
    return this.returns.get(id);
  }

  getAllReturns(): TaxReturn[] {
    return Array.from(this.returns.values());
  }

  getByJurisdiction(jurisdictionId: string): TaxReturn[] {
    return this.getAllReturns().filter(r => r.jurisdictionId === jurisdictionId);
  }

  getByStatus(status: TaxReturnStatus): TaxReturn[] {
    return this.getAllReturns().filter(r => r.status === status);
  }

  getByPeriod(period: string): TaxReturn[] {
    return this.getAllReturns().filter(r => r.period === period);
  }

  getByFiscalYear(fiscalYear: string): TaxReturn[] {
    return this.getAllReturns().filter(r => r.fiscalYear === fiscalYear);
  }

  getByType(type: TaxType): TaxReturn[] {
    return this.getAllReturns().filter(r => r.returnType === type);
  }

  getAmended(): TaxReturn[] {
    return this.getAllReturns().filter(r => r.status === "amended");
  }

  getSubmitted(): TaxReturn[] {
    return this.getAllReturns().filter(r => r.status === "submitted");
  }

  getDraft(): TaxReturn[] {
    return this.getAllReturns().filter(r => r.status === "draft");
  }

  count(): number {
    return this.returns.size;
  }
}
