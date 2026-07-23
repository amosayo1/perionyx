import type { StressTest, Scenario, HistoricalLossEvent } from "../types";

export class StressTestingService {
  private stressTests = new Map<string, StressTest>();
  private scenarios = new Map<string, Scenario>();
  private historicalLosses = new Map<string, HistoricalLossEvent>();

  addStressTest(test: StressTest): void {
    this.stressTests.set(test.id, test);
  }

  getStressTest(id: string): StressTest | undefined {
    return this.stressTests.get(id);
  }

  getAllStressTests(): StressTest[] {
    return [...this.stressTests.values()];
  }

  getCompletedStressTests(): StressTest[] {
    return this.getAllStressTests().filter((t) => t.status === "completed");
  }

  addScenario(scenario: Scenario): void {
    this.scenarios.set(scenario.id, scenario);
  }

  getScenario(id: string): Scenario | undefined {
    return this.scenarios.get(id);
  }

  getAllScenarios(): Scenario[] {
    return [...this.scenarios.values()];
  }

  getActiveScenarios(): Scenario[] {
    return this.getAllScenarios().filter((s) => s.status === "active");
  }

  addHistoricalLoss(event: HistoricalLossEvent): void {
    this.historicalLosses.set(event.id, event);
  }

  getHistoricalLoss(id: string): HistoricalLossEvent | undefined {
    return this.historicalLosses.get(id);
  }

  getAllHistoricalLosses(): HistoricalLossEvent[] {
    return [...this.historicalLosses.values()];
  }

  getTotalHistoricalLoss(): number {
    return this.getAllHistoricalLosses().reduce(
      (sum, e) => sum + e.lossAmount,
      0,
    );
  }

  getTotalRecovery(): number {
    return this.getAllHistoricalLosses().reduce(
      (sum, e) => sum + (e.recoveryAmount ?? 0),
      0,
    );
  }
}
