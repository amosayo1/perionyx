import type { ProfitCenter } from "../../types";

export class ProfitCenterService {
  private centers = new Map<string, ProfitCenter>();

  addProfitCenter(pc: ProfitCenter): void {
    this.centers.set(pc.id, pc);
  }

  getProfitCenter(id: string): ProfitCenter | undefined {
    return this.centers.get(id);
  }

  getAllProfitCenters(): ProfitCenter[] {
    return [...this.centers.values()];
  }

  getByCompany(companyId: string): ProfitCenter[] {
    return this.getAllProfitCenters().filter((c) => c.companyId === companyId);
  }

  getByBusinessUnit(businessUnit: string): ProfitCenter[] {
    return this.getAllProfitCenters().filter((c) => c.businessUnit === businessUnit);
  }

  getByRegion(region: string): ProfitCenter[] {
    return this.getAllProfitCenters().filter((c) => c.region === region);
  }

  count(): number {
    return this.centers.size;
  }
}
