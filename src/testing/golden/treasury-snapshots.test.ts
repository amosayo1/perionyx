import { describe, it, expect } from "vitest";
import { GoldenSnapshotManager } from "./golden-snapshot";
import path from "path";

const snapshots = new GoldenSnapshotManager(
  path.join(process.cwd(), "src/testing/golden/__snapshots__"),
);

describe("GoldenSnapshots", () => {
  it("should match treasury positions snapshot", async () => {
    const data = {
      positions: [
        { id: "cp_001", balance: 5000000, currency: "USD" },
        { id: "cp_002", balance: 3000000, currency: "EUR" },
      ],
      generatedAt: new Date().toISOString(),
    };
    const result = await snapshots.match("treasury-positions", data);
    expect(result).toBe(true);
  });
});
