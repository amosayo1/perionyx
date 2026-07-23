export class StressTestRunner {
  async run(config: {
    name: string;
    rampUpMs: number;
    peakConcurrency: number;
    sustainedMs: number;
    fn: (index: number) => Promise<void>;
  }): Promise<StressTestResult> {
    const startTime = Date.now();
    let completed = 0;
    let errors = 0;
    let peakMemory = 0;

    const rampStep = config.peakConcurrency / (config.rampUpMs / 100);

    for (let concurrency = 1; concurrency <= config.peakConcurrency; concurrency += rampStep) {
      const batch = Array.from({ length: Math.floor(concurrency) }, async (_, i) => {
        try {
          await config.fn(completed + i);
          completed++;
        } catch {
          errors++;
        }
      });
      await Promise.all(batch);
      peakMemory = Math.max(peakMemory, process.memoryUsage().heapUsed);
    }

    const sustainedEnd = startTime + config.rampUpMs + config.sustainedMs;
    while (Date.now() < sustainedEnd) {
      const batch = Array.from({ length: config.peakConcurrency }, async (_, i) => {
        try {
          await config.fn(completed + i);
          completed++;
        } catch {
          errors++;
        }
      });
      await Promise.all(batch);
    }

    const elapsedMs = Date.now() - startTime;
    return {
      name: config.name,
      completed,
      errors,
      durationMs: elapsedMs,
      peakConcurrency: config.peakConcurrency,
      peakMemoryMb: Math.round(peakMemory / 1024 / 1024 * 100) / 100,
      opsPerSecond: Math.round((completed / elapsedMs) * 1000),
      errorRate: Math.round((errors / (completed + errors)) * 10000) / 100,
    };
  }
}

export interface StressTestResult {
  name: string;
  completed: number;
  errors: number;
  durationMs: number;
  peakConcurrency: number;
  peakMemoryMb: number;
  opsPerSecond: number;
  errorRate: number;
}

export const stressTest = new StressTestRunner();
