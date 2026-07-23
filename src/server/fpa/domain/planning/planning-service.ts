import type { PlanningLevel } from "../../types";

export interface PlanningRecord {
  id: string;
  name: string;
  companyId: string;
  level: PlanningLevel;
  fiscalYear: number;
  entityId?: string;
  region?: string;
  businessUnit?: string;
  departmentId?: string;
  totalAmount: number;
  currency: string;
  status: "draft" | "active" | "locked" | "archived";
  createdAt: Date;
  updatedAt: Date;
}

export class PlanningService {
  private plans = new Map<string, PlanningRecord>();

  addPlan(p: PlanningRecord): void {
    this.plans.set(p.id, p);
  }

  getPlan(id: string): PlanningRecord | undefined {
    return this.plans.get(id);
  }

  getAllPlans(): PlanningRecord[] {
    return [...this.plans.values()];
  }

  getByLevel(level: PlanningLevel): PlanningRecord[] {
    return this.getAllPlans().filter((p) => p.level === level);
  }

  getByCompany(companyId: string): PlanningRecord[] {
    return this.getAllPlans().filter((p) => p.companyId === companyId);
  }

  getByYear(year: number): PlanningRecord[] {
    return this.getAllPlans().filter((p) => p.fiscalYear === year);
  }

  count(): number {
    return this.plans.size;
  }
}
