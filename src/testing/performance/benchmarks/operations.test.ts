import { describe, it, expect } from "vitest";
import { benchmark, printBenchmarkReport } from "../benchmark-runner";

describe("Performance Benchmarks", () => {
  it("should benchmark array operations", async () => {
    const results = await benchmark.run({
      name: "Array Operations",
      benchmarks: [
        {
          name: "array map",
          fn: () => {
            Array.from({ length: 1000 }, (_, i) => i).map((x) => x * 2);
          },
          iterations: 10000,
        },
        {
          name: "array filter",
          fn: () => {
            Array.from({ length: 1000 }, (_, i) => i).filter((x) => x > 500);
          },
          iterations: 10000,
        },
        {
          name: "array reduce",
          fn: () => {
            Array.from({ length: 1000 }, (_, i) => i).reduce((a, b) => a + b, 0);
          },
          iterations: 10000,
        },
      ],
    });
    expect(results).toHaveLength(3);
    for (const r of results) {
      expect(r.averageTimeMs).toBeLessThan(10);
      expect(r.opsPerSecond).toBeGreaterThan(0);
    }
  });

  it("should benchmark object operations", async () => {
    const results = await benchmark.run({
      name: "Object Operations",
      benchmarks: [
        {
          name: "object spread",
          fn: () => {
            const obj = { a: 1, b: 2, c: 3 };
            return { ...obj, d: 4 };
          },
          iterations: 10000,
        },
        {
          name: "object assign",
          fn: () => {
            const obj = { a: 1, b: 2, c: 3 };
            return Object.assign({}, obj, { d: 4 });
          },
          iterations: 10000,
        },
      ],
    });
    expect(results).toHaveLength(2);
  });

  it("should benchmark string operations", async () => {
    const results = await benchmark.run({
      name: "String Operations",
      benchmarks: [
        {
          name: "string concat",
          fn: () => {
            let s = "";
            for (let i = 0; i < 100; i++) s += String(i);
          },
          iterations: 1000,
        },
        {
          name: "JSON stringify",
          fn: () => {
            JSON.stringify({ a: 1, b: "test", c: [1, 2, 3] });
          },
          iterations: 10000,
        },
        {
          name: "JSON parse",
          fn: () => {
            JSON.parse('{"a":1,"b":"test","c":[1,2,3]}');
          },
          iterations: 10000,
        },
      ],
    });
    expect(results).toHaveLength(3);
  });
});
