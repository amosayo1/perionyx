import type { AllocationRule, AllocationRun } from "../types";

export class AllocationsService {
  private rules = new Map<string, AllocationRule>();
  private runs = new Map<string, AllocationRun>();

  addRule(rule: AllocationRule): void {
    this.rules.set(rule.id, rule);
  }

  getRule(id: string): AllocationRule | undefined {
    return this.rules.get(id);
  }

  getAllRules(): AllocationRule[] {
    return [...this.rules.values()];
  }

  getActiveRules(): AllocationRule[] {
    return this.getAllRules().filter((r) => r.isActive);
  }

  addRun(run: AllocationRun): void {
    this.runs.set(run.id, run);
  }

  getRun(id: string): AllocationRun | undefined {
    return this.runs.get(id);
  }

  getAllRuns(): AllocationRun[] {
    return [...this.runs.values()];
  }

  getRunsByPeriod(periodId: string): AllocationRun[] {
    return this.getAllRuns().filter((r) => r.periodId === periodId);
  }

  countRules(): number {
    return this.rules.size;
  }

  countRuns(): number {
    return this.runs.size;
  }
}
