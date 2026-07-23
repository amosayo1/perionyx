import type { PlanningRecommendation, BudgetPlan, VarianceAnalysisRecord, Forecast } from "../../types";

export class RecommendationsService {
  private items = new Map<string, PlanningRecommendation>();

  add(rec: PlanningRecommendation): void { this.items.set(rec.id, rec); }

  get(id: string): PlanningRecommendation | undefined { return this.items.get(id); }

  getAll(): PlanningRecommendation[] { return Array.from(this.items.values()); }

  getByType(type: string): PlanningRecommendation[] { return this.getAll().filter((r) => r.type === type); }

  getByPriority(priority: string): PlanningRecommendation[] { return this.getAll().filter((r) => r.priority === priority); }

  getActive(): PlanningRecommendation[] { return this.getAll().filter((r) => r.status === "active"); }

  getImplemented(): PlanningRecommendation[] { return this.getAll().filter((r) => r.status === "implemented"); }

  getByPlan(planId: string): PlanningRecommendation[] { return this.getAll().filter((r) => r.planId === planId); }

  generateBudgetRecommendations(plans: BudgetPlan[], variances: VarianceAnalysisRecord[]): PlanningRecommendation[] {
    const recs: PlanningRecommendation[] = [];
    for (const plan of plans) {
      const planVariances = variances.filter((v) => v.fiscalYear === plan.fiscalYear);
      const totalVariance = planVariances.reduce((s, v) => s + v.variance, 0);
      if (Math.abs(totalVariance) > plan.totalExpenses * 0.1) {
        recs.push(this.makeRec("budget", "Budget reallocation needed", `Plan ${plan.label} has significant variance of ${totalVariance}. Review budget allocation.`, "high", plan.id));
      }
    }
    return recs;
  }

  generateForecastRecommendations(forecasts: Forecast[], variances: VarianceAnalysisRecord[]): PlanningRecommendation[] {
    const recs: PlanningRecommendation[] = [];
    for (const forecast of forecasts) {
      if (forecast.confidenceLevel < 70) {
        recs.push(this.makeRec("forecast", "Improve forecast confidence", `Forecast ${forecast.label} has low confidence (${forecast.confidenceLevel}%). Review assumptions.`, "high", forecast.id));
      }
    }
    return recs;
  }

  generateCostRecommendations(expenses: any[]): PlanningRecommendation[] {
    const recs: PlanningRecommendation[] = [];
    const discretionary = expenses.filter((e: any) => e.isDiscretionary);
    const totalDiscretionary = discretionary.reduce((s: number, e: any) => s + e.amount, 0);
    if (totalDiscretionary > 0) {
      recs.push(this.makeRec("cost", "Review discretionary spending", `Total discretionary expenses: ${totalDiscretionary}. Identify reduction opportunities.`, "medium"));
    }
    return recs;
  }

  private makeRec(type: string, title: string, description: string, priority: string, planId?: string): PlanningRecommendation {
    return {
      id: crypto.randomUUID(),
      type: type as any,
      title,
      description,
      priority: priority as any,
      status: "active",
      impact: "",
      effort: "medium",
      planId,
      companyId: "",
      createdAt: new Date(),
    };
  }

  count(): number { return this.items.size; }

  update(id: string, updates: Partial<PlanningRecommendation>): PlanningRecommendation | undefined {
    const existing = this.items.get(id); if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.items.set(id, updated); return updated;
  }

  delete(id: string): boolean { return this.items.delete(id); }
}
