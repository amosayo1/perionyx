export class ChaosTestRunner {
  async run(config: {
    name: string;
    scenarios: ChaosScenario[];
    durationMs: number;
  }): Promise<ChaosTestResult> {
    const startTime = Date.now();
    const failures: string[] = [];
    const recovered: string[] = [];
    let totalOperations = 0;
    let failedOperations = 0;

    const interval = setInterval(() => {
      if (Date.now() - startTime >= config.durationMs) {
        clearInterval(interval);
        return;
      }
      const scenario = config.scenarios[Math.floor(Math.random() * config.scenarios.length)];
      totalOperations++;
      try {
        scenario.fn();
        recovered.push(scenario.name);
      } catch {
        failures.push(scenario.name);
        failedOperations++;
      }
    }, 100);

    await new Promise((resolve) => setTimeout(resolve, config.durationMs + 100));

    return {
      name: config.name,
      durationMs: Date.now() - startTime,
      scenariosTested: config.scenarios.length,
      totalOperations,
      failedOperations,
      failures,
      recovered,
      resilience: Math.round(((totalOperations - failedOperations) / totalOperations) * 10000) / 100,
    };
  }
}

export interface ChaosScenario {
  name: string;
  fn: () => void;
}

export interface ChaosTestResult {
  name: string;
  durationMs: number;
  scenariosTested: number;
  totalOperations: number;
  failedOperations: number;
  failures: string[];
  recovered: string[];
  resilience: number;
}

export const chaosTest = new ChaosTestRunner();
