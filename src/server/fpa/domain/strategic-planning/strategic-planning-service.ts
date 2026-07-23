import type { StrategicPlan, StrategicObjective, StrategicKeyResult } from "../../types";

export class StrategicPlanningService {
  private items = new Map<string, StrategicPlan>();

  add(plan: StrategicPlan): void { this.items.set(plan.id, plan); }

  get(id: string): StrategicPlan | undefined { return this.items.get(id); }

  getAll(): StrategicPlan[] { return Array.from(this.items.values()); }

  getByStatus(status: string): StrategicPlan[] { return this.getAll().filter((p) => p.status === status); }

  getActive(): StrategicPlan[] { return this.getAll().filter((p) => p.status === "approved" || p.status === "review"); }

  getByFiscalYearRange(from: number, to: number): StrategicPlan[] {
    return this.getAll().filter((p) => p.fiscalYearStart >= from && p.fiscalYearEnd <= to);
  }

  addObjective(planId: string, objective: StrategicObjective): void {
    const plan = this.items.get(planId); if (!plan) return;
    plan.objectives.push(objective);
    this.items.set(planId, plan);
  }

  getObjectivesByPlan(planId: string): StrategicObjective[] {
    const plan = this.items.get(planId); return plan ? plan.objectives : [];
  }

  addKeyResult(objectiveId: string, keyResult: StrategicKeyResult): void {
    for (const plan of this.items.values()) {
      const obj = plan.objectives.find((o) => o.id === objectiveId);
      if (obj) { obj.keyResults.push(keyResult); this.items.set(plan.id, plan); return; }
    }
  }

  getKeyResultsByObjective(objectiveId: string): StrategicKeyResult[] {
    for (const plan of this.items.values()) {
      const obj = plan.objectives.find((o) => o.id === objectiveId);
      if (obj) return obj.keyResults;
    }
    return [];
  }

  calculateProgress(planId: string): number {
    const plan = this.items.get(planId); if (!plan) return 0;
    const allKrs = plan.objectives.flatMap((o) => o.keyResults);
    if (allKrs.length === 0) return 0;
    const total = allKrs.reduce((s, kr) => {
      const range = kr.target - kr.baseline; if (range === 0) return s + 100;
      return s + Math.min(100, Math.max(0, ((kr.current - kr.baseline) / range) * 100));
    }, 0);
    return total / allKrs.length;
  }

  count(): number { return this.items.size; }

  update(id: string, updates: Partial<StrategicPlan>): StrategicPlan | undefined {
    const existing = this.items.get(id); if (!existing) return undefined;
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.items.set(id, updated); return updated;
  }

  delete(id: string): boolean { return this.items.delete(id); }
}
