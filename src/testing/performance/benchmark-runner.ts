export interface BenchmarkResult {
  name: string;
  iterations: number;
  totalTimeMs: number;
  averageTimeMs: number;
  minTimeMs: number;
  maxTimeMs: number;
  opsPerSecond: number;
  memoryUsageMb: number;
}

export interface BenchmarkSuite {
  name: string;
  benchmarks: BenchmarkDefinition[];
  setup?: () => Promise<void>;
  teardown?: () => Promise<void>;
}

interface BenchmarkDefinition {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: () => Promise<any> | any;
  iterations?: number;
}

export class BenchmarkRunner {
  async run(suite: BenchmarkSuite): Promise<BenchmarkResult[]> {
    if (suite.setup) await suite.setup();
    const results: BenchmarkResult[] = [];

    for (const bench of suite.benchmarks) {
      const iterations = bench.iterations ?? 1000;
      const times: number[] = [];

      const memBefore = process.memoryUsage().heapUsed;

      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        await bench.fn();
        const end = performance.now();
        times.push(end - start);
      }

      const memAfter = process.memoryUsage().heapUsed;
      const totalTimeMs = times.reduce((a, b) => a + b, 0);
      const minTimeMs = Math.min(...times);
      const maxTimeMs = Math.max(...times);

      results.push({
        name: bench.name,
        iterations,
        totalTimeMs: Math.round(totalTimeMs * 100) / 100,
        averageTimeMs: Math.round((totalTimeMs / iterations) * 100) / 100,
        minTimeMs: Math.round(minTimeMs * 100) / 100,
        maxTimeMs: Math.round(maxTimeMs * 100) / 100,
        opsPerSecond: Math.round(iterations / (totalTimeMs / 1000)),
        memoryUsageMb: Math.round((memAfter - memBefore) / 1024 / 1024 * 100) / 100,
      });
    }

    if (suite.teardown) await suite.teardown();
    return results;
  }
}

export function printBenchmarkReport(results: BenchmarkResult[]): void {
  console.log("\n=== BENCHMARK REPORT ===\n");
  for (const r of results) {
    console.log(`${r.name}:`);
    console.log(`  Iterations:    ${r.iterations.toLocaleString()}`);
    console.log(`  Total time:    ${r.totalTimeMs}ms`);
    console.log(`  Average:       ${r.averageTimeMs}ms`);
    console.log(`  Min:           ${r.minTimeMs}ms`);
    console.log(`  Max:           ${r.maxTimeMs}ms`);
    console.log(`  Ops/sec:       ${r.opsPerSecond.toLocaleString()}`);
    console.log(`  Memory delta:  ${r.memoryUsageMb}MB`);
    console.log();
  }
}

export const benchmark = new BenchmarkRunner();
