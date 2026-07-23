import { describe, it, expect } from "vitest";
import { loadTest } from "../load/load-test";

describe("Load Tests", () => {
  it("should handle concurrent operations", async () => {
    const result = await loadTest.run({
      name: "concurrent-math",
      concurrency: 10,
      durationMs: 100,
      fn: async () => {
        const x = Math.random() * 1000;
        const y = Math.random() * 1000;
        const _ = x * y;
      },
    });
    expect(result.completed).toBeGreaterThan(0);
    expect(result.errors).toBe(0);
    expect(result.opsPerSecond).toBeGreaterThan(0);
  });

  it("should handle mixed success/failure", async () => {
    let callCount = 0;
    const result = await loadTest.run({
      name: "mixed-results",
      concurrency: 5,
      durationMs: 100,
      fn: async () => {
        callCount++;
        if (callCount % 10 === 0) throw new Error("simulated error");
        await Promise.resolve();
      },
    });
    expect(result.completed + result.errors).toBeGreaterThan(0);
  });
});
