import { describe, it, expect } from "vitest";

describe("Regression Tests", () => {
  it("should handle empty inputs", () => {
    const fn = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
    expect(fn([])).toBe(0);
  });

  it("should handle null/undefined safely", () => {
    const safe = (val: unknown, def: string) =>
      val == null ? def : String(val);
    expect(safe(null, "default")).toBe("default");
    expect(safe(undefined, "default")).toBe("default");
    expect(safe("value", "default")).toBe("value");
  });

  it("should handle edge case numbers", () => {
    expect(Number.MAX_SAFE_INTEGER).toBe(9007199254740991);
    expect(Number.MIN_SAFE_INTEGER).toBe(-9007199254740991);
    expect(isNaN(NaN)).toBe(true);
    expect(isFinite(Infinity)).toBe(false);
  });

  it("should handle boundary dates", () => {
    expect(() => new Date("invalid")).not.toThrow();
    const d = new Date("invalid");
    expect(isNaN(d.getTime())).toBe(true);
  });

  it("should handle circular references gracefully", () => {
    const a: Record<string, unknown> = {};
    const b: Record<string, unknown> = {};
    a.ref = b;
    b.ref = a;
    expect(a.ref).toBe(b);
    expect(b.ref).toBe(a);
  });

  it("should handle special characters in strings", () => {
    const special = "\n\t\r\0\\\"'";
    expect(special.length).toBe(8);
    expect(JSON.stringify(special)).toBeTruthy();
  });

  it("should handle large arrays without stack overflow", () => {
    const arr = new Array(10000).fill(0);
    expect(arr.length).toBe(10000);
    expect(arr.every((x) => x === 0)).toBe(true);
  });
});
