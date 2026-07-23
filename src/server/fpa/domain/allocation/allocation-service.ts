import type { FPAAllocation, AllocationMethod } from "../../types";

export class FPAAllocationService {
  private rules = new Map<string, FPAAllocation>();

  addRule(r: FPAAllocation): void {
    this.rules.set(r.id, r);
  }

  getRule(id: string): FPAAllocation | undefined {
    return this.rules.get(id);
  }

  getAllRules(): FPAAllocation[] {
    return [...this.rules.values()];
  }

  getActiveRules(): FPAAllocation[] {
    return this.getAllRules().filter((r) => r.isActive);
  }

  getBySource(sourceCostCenterId: string): FPAAllocation[] {
    return this.getAllRules().filter((r) => r.sourceCostCenterId === sourceCostCenterId);
  }

  getByMethod(method: AllocationMethod): FPAAllocation[] {
    return this.getAllRules().filter((r) => r.method === method);
  }

  count(): number {
    return this.rules.size;
  }
}
