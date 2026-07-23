import type { Scenario, ScenarioAssumption, ScenarioType, ScenarioComparison, PlanStatus } from "../../types";

export class ScenarioPlanningService {
  private scenarios = new Map<string, Scenario>();
  private assumptions = new Map<string, ScenarioAssumption>();

  addScenario(scenario: Scenario): void { this.scenarios.set(scenario.id, scenario); }
  getScenario(id: string): Scenario | undefined { return this.scenarios.get(id); }
  getAllScenarios(): Scenario[] { return Array.from(this.scenarios.values()); }
  getByType(type: ScenarioType): Scenario[] { return this.getAllScenarios().filter((s) => s.scenarioType === type); }
  getByStatus(status: PlanStatus): Scenario[] { return this.getAllScenarios().filter((s) => s.status === status); }
  getByFiscalYear(year: number): Scenario[] { return this.getAllScenarios().filter((s) => s.fiscalYear === year); }
  countScenarios(): number { return this.scenarios.size; }
  updateScenario(id: string, updates: Partial<Scenario>): Scenario | undefined {
    const existing = this.scenarios.get(id); if (!existing) return undefined;
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.scenarios.set(id, updated); return updated;
  }
  deleteScenario(id: string): boolean { return this.scenarios.delete(id); }

  addAssumption(assumption: ScenarioAssumption): void { this.assumptions.set(assumption.id, assumption); }
  getAssumptionsByScenario(scenarioId: string): ScenarioAssumption[] { return Array.from(this.assumptions.values()).filter((a) => a.scenarioId === scenarioId); }
  countAssumptions(): number { return this.assumptions.size; }

  compareScenarios(baseId: string, adjustedIds: string[]): ScenarioComparison[] {
    const base = this.scenarios.get(baseId);
    if (!base) return [];
    return adjustedIds.reduce((acc: ScenarioComparison[], id) => {
      const s = this.scenarios.get(id);
      if (!s) return acc;
      const varianceFromBase = s.netIncome - base.netIncome;
      const variancePercentFromBase = base.netIncome !== 0 ? (varianceFromBase / base.netIncome) * 100 : 0;
      acc.push({
        scenarioId: s.id,
        scenarioName: s.name,
        scenarioType: s.scenarioType,
        revenue: s.totalRevenue,
        expenses: s.totalExpenses,
        netIncome: s.netIncome,
        capital: s.totalCapital,
        cashFlow: s.totalCashFlow,
        varianceFromBase,
        variancePercentFromBase,
        riskLevel: s.riskLevel,
        probability: s.probability,
      });
      return acc;
    }, []);
  }

  calculateImpact(scenario: Scenario): ScenarioComparison {
    const base = this.scenarios.get(scenario.basePlanId);
    const baseRevenue = base?.totalRevenue ?? 0;
    const baseExpenses = base?.totalExpenses ?? 0;
    const baseNetIncome = base?.netIncome ?? 0;
    const varianceFromBase = scenario.netIncome - baseNetIncome;
    const variancePercentFromBase = baseNetIncome !== 0 ? (varianceFromBase / baseNetIncome) * 100 : 0;
    return {
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      scenarioType: scenario.scenarioType,
      revenue: scenario.totalRevenue,
      expenses: scenario.totalExpenses,
      netIncome: scenario.netIncome,
      capital: scenario.totalCapital,
      cashFlow: scenario.totalCashFlow,
      varianceFromBase,
      variancePercentFromBase,
      riskLevel: scenario.riskLevel,
      probability: scenario.probability,
    };
  }
}
