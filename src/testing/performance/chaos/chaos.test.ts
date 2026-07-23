import { describe, it, expect } from "vitest";
import { chaosTest } from "../chaos/chaos-test";

describe("Chaos Tests", () => {
  it("should handle random failures gracefully", async () => {
    const result = await chaosTest.run({
      name: "random-failures",
      durationMs: 500,
      scenarios: [
        { name: "network-timeout", fn: () => { throw new Error("timeout"); } },
        { name: "null-input", fn: () => { const x: unknown = null; String(x); } },
        { name: "empty-result", fn: () => [] },
        { name: "large-payload", fn: () => new Array(1000).fill("data") },
      ],
    });
    expect(result.scenariosTested).toBe(4);
    expect(result.totalOperations).toBeGreaterThan(0);
    expect(result.resilience).toBeGreaterThanOrEqual(0);
  });
});
