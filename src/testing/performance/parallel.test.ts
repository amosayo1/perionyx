import { describe, it, expect } from "vitest";

describe("Factory Tests", () => {
  it("should create sequential factories", async () => {
    const results: number[] = [];
    for (let i = 0; i < 5; i++) {
      results.push(i);
    }
    expect(results).toEqual([0, 1, 2, 3, 4]);
  });

  it("should parallelize test execution", async () => {
    const results = await Promise.all([
      Promise.resolve("A"),
      Promise.resolve("B"),
      Promise.resolve("C"),
    ]);
    expect(results).toEqual(["A", "B", "C"]);
  });

  it("should handle concurrent factory creation", async () => {
    const factories = Array.from({ length: 10 }, (_, i) =>
      Promise.resolve({ id: i, name: `factory-${i}` }),
    );
    const results = await Promise.all(factories);
    expect(results).toHaveLength(10);
    expect(results[0].id).toBe(0);
    expect(results[9].id).toBe(9);
  });
});
