export class LoadTestRunner {
  async run(config: {
    name: string;
    concurrency: number;
    durationMs: number;
    fn: (index: number) => Promise<void>;
  }): Promise<LoadTestResult> {
    const startTime = Date.now();
    let completed = 0;
    let errors = 0;
    const latencies: number[] = [];

    const runBatch = async (batchSize: number) => {
      const batch = Array.from({ length: batchSize }, async (_, i) => {
        const opStart = performance.now();
        try {
          await config.fn(completed + i);
          latencies.push(performance.now() - opStart);
          completed++;
        } catch {
          errors++;
        }
      });
      await Promise.all(batch);
    };

    while (Date.now() - startTime < config.durationMs) {
      await runBatch(config.concurrency);
    }

    const elapsedMs = Date.now() - startTime;
    return {
      name: config.name,
      completed,
      errors,
      durationMs: elapsedMs,
      opsPerSecond: Math.round((completed / elapsedMs) * 1000),
      averageLatencyMs: latencies.length > 0
        ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length * 100) / 100
        : 0,
      p95LatencyMs: latencies.length > 0
        ? Math.round(latencies.sort((a, b) => a - b)[Math.floor(latencies.length * 0.95)] * 100) / 100
        : 0,
      p99LatencyMs: latencies.length > 0
        ? Math.round(latencies.sort((a, b) => a - b)[Math.floor(latencies.length * 0.99)] * 100) / 100
        : 0,
    };
  }
}

export interface LoadTestResult {
  name: string;
  completed: number;
  errors: number;
  durationMs: number;
  opsPerSecond: number;
  averageLatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
}

export const loadTest = new LoadTestRunner();
