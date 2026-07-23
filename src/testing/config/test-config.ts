export interface TestConfig {
  coverage: {
    enabled: boolean;
    threshold: number;
    reporters: string[];
  };
  parallel: {
    enabled: boolean;
    maxWorkers: number;
  };
  performance: {
    benchmarkIterations: number;
    loadTestDurationMs: number;
  };
  security: {
    scanEnabled: boolean;
    dependencyAudit: boolean;
  };
}

export const defaultTestConfig: TestConfig = {
  coverage: {
    enabled: true,
    threshold: 85,
    reporters: ["text", "json", "html", "lcov"],
  },
  parallel: {
    enabled: true,
    maxWorkers: 4,
  },
  performance: {
    benchmarkIterations: 1000,
    loadTestDurationMs: 5000,
  },
  security: {
    scanEnabled: true,
    dependencyAudit: true,
  },
};

export function getTestConfig(): TestConfig {
  return { ...defaultTestConfig };
}
