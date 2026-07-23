import { describe, it, expect } from "vitest";

describe("Contract Tests", () => {
  interface ContractViolation {
    path: string;
    expected: string;
    actual: unknown;
  }

  const validateContract = <T>(
    data: unknown,
    shape: Record<keyof T, string>,
  ): ContractViolation[] => {
    const violations: ContractViolation[] = [];
    for (const key of Object.keys(shape)) {
      if (data == null || !(key in (data as Record<string, unknown>))) {
        violations.push({ path: key, expected: shape[key as keyof typeof shape], actual: undefined });
        continue;
      }
      const value = (data as Record<string, unknown>)[key];
      const actualType = typeof value;
      const expectedType = shape[key as keyof typeof shape];
      if (actualType !== expectedType && !(expectedType === "array" && Array.isArray(value))) {
        violations.push({ path: key, expected: expectedType, actual: actualType });
      }
    }
    return violations;
  };

  it("should validate API response contract", () => {
    const response = {
      id: "123",
      name: "test",
      amount: 1000,
      tags: ["a", "b"],
    };
    const shape = { id: "string", name: "string", amount: "number", tags: "array" };
    const violations = validateContract(response, shape);
    expect(violations).toHaveLength(0);
  });

  it("should detect contract violations", () => {
    const response = { id: 123, name: "test", amount: "1000" };
    const shape = { id: "string", amount: "number" };
    const violations = validateContract(response, shape);
    expect(violations.length).toBeGreaterThan(0);
  });

  it("should validate error response contract", () => {
    const error = { error: "Not found", code: 404, details: null };
    const shape = { error: "string", code: "number" };
    const violations = validateContract(error, shape);
    expect(violations).toHaveLength(0);
  });
});
