import type { CostCenter } from "../../types";

export class CostCenterService {
  private centers = new Map<string, CostCenter>();

  addCostCenter(cc: CostCenter): void {
    this.centers.set(cc.id, cc);
  }

  getCostCenter(id: string): CostCenter | undefined {
    return this.centers.get(id);
  }

  getAllCostCenters(): CostCenter[] {
    return [...this.centers.values()];
  }

  getByCompany(companyId: string): CostCenter[] {
    return this.getAllCostCenters().filter((c) => c.companyId === companyId);
  }

  getByDepartment(department: string): CostCenter[] {
    return this.getAllCostCenters().filter((c) => c.department === department);
  }

  getByStatus(status: "active" | "inactive" | "frozen"): CostCenter[] {
    return this.getAllCostCenters().filter((c) => c.status === status);
  }

  getChildren(parentId: string): CostCenter[] {
    return this.getAllCostCenters().filter((c) => c.parentId === parentId);
  }

  getTree(): CostCenter[] {
    return this.getAllCostCenters().filter((c) => !c.parentId);
  }

  search(query: string): CostCenter[] {
    const q = query.toLowerCase();
    return this.getAllCostCenters().filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q),
    );
  }

  count(): number {
    return this.centers.size;
  }
}
