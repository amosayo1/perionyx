import type { DirectTaxProvision, TaxType } from "../../types";

export class DirectTaxService {
  private provisions = new Map<string, DirectTaxProvision>();

  addProvision(provision: DirectTaxProvision): DirectTaxProvision {
    this.provisions.set(provision.id, provision);
    return provision;
  }

  getProvision(id: string): DirectTaxProvision | undefined {
    return this.provisions.get(id);
  }

  getAllProvisions(): DirectTaxProvision[] {
    return Array.from(this.provisions.values());
  }

  getByJurisdiction(jurisdictionId: string): DirectTaxProvision[] {
    return this.getAllProvisions().filter(p => p.jurisdictionId === jurisdictionId);
  }

  getByPeriod(period: string): DirectTaxProvision[] {
    return this.getAllProvisions().filter(p => p.period === period);
  }

  getByType(type: string): DirectTaxProvision[] {
    return this.getAllProvisions().filter(p => p.provisionType === type);
  }

  getByFiscalYear(fiscalYear: string): DirectTaxProvision[] {
    return this.getAllProvisions().filter(p => p.fiscalYear === fiscalYear);
  }

  getCurrentTax(): DirectTaxProvision[] {
    return this.getAllProvisions().filter(p => p.provisionType === "current");
  }

  getDeferredTax(): DirectTaxProvision[] {
    return this.getAllProvisions().filter(p => p.provisionType === "deferred");
  }

  getEstimatedTax(): DirectTaxProvision[] {
    return this.getAllProvisions().filter(p => p.provisionType === "estimated");
  }

  count(): number {
    return this.provisions.size;
  }
}
