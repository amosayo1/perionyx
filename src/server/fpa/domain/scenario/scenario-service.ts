import type { FPAScenario, ScenarioType } from "../../types";

export class ScenarioService {
  private scenarios = new Map<string, FPAScenario>();

  addScenario(s: FPAScenario): void {
    this.scenarios.set(s.id, s);
  }

  getScenario(id: string): FPAScenario | undefined {
    return this.scenarios.get(id);
  }

  getAllScenarios(): FPAScenario[] {
    return [...this.scenarios.values()];
  }

  getByType(type: ScenarioType): FPAScenario[] {
    return this.getAllScenarios().filter((s) => s.type === type);
  }

  getByStatus(status: "draft" | "active" | "archived"): FPAScenario[] {
    return this.getAllScenarios().filter((s) => s.status === status);
  }

  getByCompany(companyId: string): FPAScenario[] {
    return this.getAllScenarios().filter((s) => s.companyId === companyId);
  }

  count(): number {
    return this.scenarios.size;
  }
}
