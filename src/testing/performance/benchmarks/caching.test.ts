import { benchmark, printBenchmarkReport } from "../benchmark-runner";

describe("Performance Benchmarks", () => {
  it("Caching benchmarks", async () => {
    const cache = new Map<string, unknown>();
    const results = await benchmark.run({
      name: "Caching",
      benchmarks: [
        {
          name: "cache set (Map)",
          fn: () => { cache.set(`key_${Math.random()}`, { data: "test", timestamp: Date.now() }); },
          iterations: 10000,
        },
        {
          name: "cache get (Map)",
          fn: () => { cache.get("key_0"); },
          iterations: 100000,
        },
        {
          name: "JSON serialization",
          fn: () => { JSON.stringify({ id: "1", name: "test", data: [1, 2, 3] }); },
          iterations: 50000,
        },
        {
          name: "JSON deserialization",
          fn: () => { JSON.parse('{"id":"1","name":"test","data":[1,2,3]}'); },
          iterations: 50000,
        },
      ],
    });
    printBenchmarkReport(results);
    expect(results).toHaveLength(4);
  });

  it("Queue operation benchmarks", async () => {
    const queue: unknown[] = [];
    const results = await benchmark.run({
      name: "Queue Operations",
      benchmarks: [
        {
          name: "queue enqueue",
          fn: () => { queue.push({ id: Math.random(), type: "test" }); },
          iterations: 10000,
        },
        {
          name: "queue dequeue",
          fn: () => { queue.shift(); },
          iterations: 10000,
        },
      ],
    });
    printBenchmarkReport(results);
    expect(results).toHaveLength(2);
  });

  it("Array operation benchmarks", async () => {
    const data = Array.from({ length: 10000 }, (_, i) => ({ id: i, value: Math.random() }));
    const results = await benchmark.run({
      name: "Array Operations (10k items)",
      benchmarks: [
        {
          name: "filter",
          fn: () => { data.filter((x) => x.value > 0.5); },
          iterations: 1000,
        },
        {
          name: "map",
          fn: () => { data.map((x) => x.value * 2); },
          iterations: 1000,
        },
        {
          name: "reduce",
          fn: () => { data.reduce((sum, x) => sum + x.value, 0); },
          iterations: 1000,
        },
        {
          name: "sort",
          fn: () => { [...data].sort((a, b) => a.value - b.value); },
          iterations: 100,
        },
        {
          name: "find",
          fn: () => { data.find((x) => x.id === 5000); },
          iterations: 10000,
        },
      ],
    });
    printBenchmarkReport(results);
    expect(results).toHaveLength(5);
  });
});
