import type { VarianceRecord, VarianceType, VarianceDirection } from "../../types";

export class VarianceService {
  private variances = new Map<string, VarianceRecord>();

  addVariance(v: VarianceRecord): void {
    this.variances.set(v.id, v);
  }

  getVariance(id: string): VarianceRecord | undefined {
    return this.variances.get(id);
  }

  getAllVariances(): VarianceRecord[] {
    return [...this.variances.values()];
  }

  getByType(type: VarianceType): VarianceRecord[] {
    return this.getAllVariances().filter((v) => v.type === type);
  }

  getByDirection(direction: VarianceDirection): VarianceRecord[] {
    return this.getAllVariances().filter((v) => v.direction === direction);
  }

  getByCompany(companyId: string): VarianceRecord[] {
    return this.getAllVariances().filter((v) => v.companyId === companyId);
  }

  getByPeriod(period: string): VarianceRecord[] {
    return this.getAllVariances().filter((v) => v.period === period);
  }

  getBySeverity(severity: "low" | "medium" | "high" | "critical"): VarianceRecord[] {
    return this.getAllVariances().filter((v) => v.severity === severity);
  }

  getExceptions(): VarianceRecord[] {
    return this.getAllVariances().filter((v) => v.severity === "high" || v.severity === "critical");
  }

  count(): number {
    return this.variances.size;
  }
}
