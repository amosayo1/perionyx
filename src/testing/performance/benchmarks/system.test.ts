import { benchmark, printBenchmarkReport } from "../benchmark-runner";

describe("System Performance Benchmarks", () => {
  it("Startup simulation", async () => {
    const results = await benchmark.run({
      name: "Startup Operations",
      benchmarks: [
        {
          name: "import resolution",
          fn: () => { const m = new Map(); m.set("a", 1); m.get("a"); },
          iterations: 100000,
        },
        {
          name: "config parsing",
          fn: () => { JSON.parse('{"cache":{"ttl":60},"db":{"pool":10}}'); },
          iterations: 10000,
        },
        {
          name: "dependency injection",
          fn: () => {
            class A { constructor(public name: string) {} }
            new A("test");
          },
          iterations: 100000,
        },
      ],
    });
    expect(results).toHaveLength(3);
  });

  it("Memory benchmarks", async () => {
    const results = await benchmark.run({
      name: "Memory Operations",
      benchmarks: [
        {
          name: "object allocation",
          fn: () => { return { a: 1, b: 2, c: 3, d: 4, e: 5 }; },
          iterations: 100000,
        },
        {
          name: "array allocation",
          fn: () => { return new Array(100).fill(0); },
          iterations: 50000,
        },
        {
          name: "string concatenation",
          fn: () => {
            let s = "";
            for (let i = 0; i < 10; i++) s += "test";
          },
          iterations: 10000,
        },
      ],
    });
    expect(results).toHaveLength(3);
  });

  it("Latency micro-benchmarks", async () => {
    const results = await benchmark.run({
      name: "Latency Micro-benchmarks",
      benchmarks: [
        {
          name: "Promise.resolve latency",
          fn: async () => { await Promise.resolve(); },
          iterations: 10000,
        },
        {
          name: "setTimeout 0 latency",
          fn: () => { return new Promise((r) => setTimeout(r, 0)); },
          iterations: 100,
        },
        {
          name: "Math.random",
          fn: () => { Math.random(); },
          iterations: 100000,
        },
        {
          name: "Date.now",
          fn: () => { Date.now(); },
          iterations: 100000,
        },
      ],
    });
    expect(results).toHaveLength(4);
  });
});
