import "dotenv/config";
import { describe, it, expect, afterAll } from "vitest";
import { PolicyEngineService } from "@/modules/policies/policies.service";
import { createCompany, createUser, createMembership } from "../test/helpers/factories";
import { buildTenantContext, cleanup } from "../test/helpers/db";
import { ValidationError } from "@/lib/errors/app-error";

afterAll(cleanup);

async function buildRealContext(companyId: string) {
  const user = await createUser();
  await createMembership(user.id, companyId, "ADMIN");
  return buildTenantContext(companyId, { userId: user.id, role: "ADMIN" });
}

describe("PolicyEngineService", () => {
  describe("createPolicy", () => {
    it("creates a policy with rules", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const policy = await PolicyEngineService.createPolicy(ctx, {
        name: "High Value Transfer",
        type: "APPROVAL",
        actionType: "REQUIRE_APPROVAL",
        priority: 10,
        rules: [
          { field: "amount", operator: "GREATER_THAN", value: "10000" },
          { field: "transactionType", operator: "EQUALS", value: "WIRE_TRANSFER" },
        ],
      });
      expect(policy.name).toBe("High Value Transfer");
      expect(policy.rules).toHaveLength(2);
    });

    it("rejects duplicate names", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      await PolicyEngineService.createPolicy(ctx, { name: "Unique", rules: [] });
      await expect(
        PolicyEngineService.createPolicy(ctx, { name: "Unique", rules: [] }),
      ).rejects.toThrow(ValidationError);
    });

    it("defaults type to APPROVAL", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const policy = await PolicyEngineService.createPolicy(ctx, { name: "Default Type", rules: [] });
      expect(policy.type).toBe("APPROVAL");
    });
  });

  describe("listPolicies", () => {
    it("returns only enabled by default", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      await PolicyEngineService.createPolicy(ctx, { name: "Enabled1", rules: [] });
      await PolicyEngineService.createPolicy(ctx, { name: "Enabled2", rules: [] });
      const list = await PolicyEngineService.listPolicies(ctx);
      expect(list).toHaveLength(2);
    });

    it("includes disabled when flag set", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const p = await PolicyEngineService.createPolicy(ctx, { name: "Toggled", rules: [] });
      await PolicyEngineService.updatePolicy(ctx, p.id, { enabled: false });
      const withoutDisabled = await PolicyEngineService.listPolicies(ctx);
      const withDisabled = await PolicyEngineService.listPolicies(ctx, true);
      expect(withoutDisabled).toHaveLength(0);
      expect(withDisabled).toHaveLength(1);
    });
  });

  describe("getPolicy", () => {
    it("returns null for missing policy", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const result = await PolicyEngineService.getPolicy(ctx, "nonexistent");
      expect(result).toBeNull();
    });

    it("returns policy with rules", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const created = await PolicyEngineService.createPolicy(ctx, {
        name: "Get Me", rules: [{ field: "amount", operator: "LESS_THAN", value: "500" }],
      });
      const result = await PolicyEngineService.getPolicy(ctx, created.id);
      expect(result).not.toBeNull();
      expect(result!.rules).toHaveLength(1);
      expect(result!.rules[0].field).toBe("amount");
    });
  });

  describe("updatePolicy", () => {
    it("partial updates fields", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const p = await PolicyEngineService.createPolicy(ctx, { name: "Original", priority: 50, rules: [] });
      await PolicyEngineService.updatePolicy(ctx, p.id, { priority: 99, enabled: false });
      const updated = await PolicyEngineService.getPolicy(ctx, p.id);
      expect(updated!.priority).toBe(99);
      expect(updated!.enabled).toBe(false);
      expect(updated!.name).toBe("Original");
    });

    it("rejects update of missing policy", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      await expect(
        PolicyEngineService.updatePolicy(ctx, "bad", { name: "Nope" }),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("deletePolicy", () => {
    it("deletes and removes from list", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const p = await PolicyEngineService.createPolicy(ctx, { name: "Delete Me", rules: [] });
      await PolicyEngineService.deletePolicy(ctx, p.id);
      const list = await PolicyEngineService.listPolicies(ctx, true);
      const found = list.find((l) => l.id === p.id);
      expect(found).toBeUndefined();
    });

    it("rejects delete of missing policy", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      await expect(
        PolicyEngineService.deletePolicy(ctx, "bad"),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("evaluateRules", () => {
    it("EQUALS operator matches", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const policy = await PolicyEngineService.createPolicy(ctx, {
        name: "Equals Test", rules: [{ field: "currency", operator: "EQUALS", value: "USD" }],
      });
      const result = await PolicyEngineService.testPolicy(ctx, policy.id, {
        amount: 100, transactionType: "WIRE", currency: "USD",
      });
      expect(result.matched).toBe(true);
    });

    it("EQUALS operator does not match", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const policy = await PolicyEngineService.createPolicy(ctx, {
        name: "No Match", rules: [{ field: "currency", operator: "EQUALS", value: "EUR" }],
      });
      const result = await PolicyEngineService.testPolicy(ctx, policy.id, {
        amount: 100, transactionType: "WIRE", currency: "USD",
      });
      expect(result.matched).toBe(false);
    });

    it("GREATER_THAN operator", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const policy = await PolicyEngineService.createPolicy(ctx, {
        name: "GT Test", rules: [{ field: "amount", operator: "GREATER_THAN", value: "1000" }],
      });
      const r1 = await PolicyEngineService.testPolicy(ctx, policy.id, { amount: 2000, transactionType: "WIRE", currency: "USD" });
      expect(r1.matched).toBe(true);
      const r2 = await PolicyEngineService.testPolicy(ctx, policy.id, { amount: 500, transactionType: "WIRE", currency: "USD" });
      expect(r2.matched).toBe(false);
    });

    it("LESS_THAN operator", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const policy = await PolicyEngineService.createPolicy(ctx, {
        name: "LT Test", rules: [{ field: "amount", operator: "LESS_THAN", value: "100" }],
      });
      const r1 = await PolicyEngineService.testPolicy(ctx, policy.id, { amount: 50, transactionType: "WIRE", currency: "USD" });
      expect(r1.matched).toBe(true);
      const r2 = await PolicyEngineService.testPolicy(ctx, policy.id, { amount: 150, transactionType: "WIRE", currency: "USD" });
      expect(r2.matched).toBe(false);
    });

    it("BETWEEN operator", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const policy = await PolicyEngineService.createPolicy(ctx, {
        name: "Between", rules: [{ field: "amount", operator: "BETWEEN", value: "100,500" }],
      });
      const r1 = await PolicyEngineService.testPolicy(ctx, policy.id, { amount: 300, transactionType: "WIRE", currency: "USD" });
      expect(r1.matched).toBe(true);
      const r2 = await PolicyEngineService.testPolicy(ctx, policy.id, { amount: 50, transactionType: "WIRE", currency: "USD" });
      expect(r2.matched).toBe(false);
    });

    it("IN operator", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const policy = await PolicyEngineService.createPolicy(ctx, {
        name: "In Set", rules: [{ field: "currency", operator: "IN", value: "USD,EUR" }],
      });
      const r1 = await PolicyEngineService.testPolicy(ctx, policy.id, { amount: 100, transactionType: "WIRE", currency: "EUR" });
      expect(r1.matched).toBe(true);
      const r2 = await PolicyEngineService.testPolicy(ctx, policy.id, { amount: 100, transactionType: "WIRE", currency: "GBP" });
      expect(r2.matched).toBe(false);
    });

    it("NOT_IN operator", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const policy = await PolicyEngineService.createPolicy(ctx, {
        name: "Not In", rules: [{ field: "currency", operator: "NOT_IN", value: "USD,EUR" }],
      });
      const r1 = await PolicyEngineService.testPolicy(ctx, policy.id, { amount: 100, transactionType: "WIRE", currency: "GBP" });
      expect(r1.matched).toBe(true);
    });

    it("CONTAINS operator", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const policy = await PolicyEngineService.createPolicy(ctx, {
        name: "Contains", rules: [{ field: "transactionType", operator: "CONTAINS", value: "WIRE" }],
      });
      const r1 = await PolicyEngineService.testPolicy(ctx, policy.id, { amount: 100, transactionType: "WIRE_TRANSFER", currency: "USD" });
      expect(r1.matched).toBe(true);
      const r2 = await PolicyEngineService.testPolicy(ctx, policy.id, { amount: 100, transactionType: "ACH", currency: "USD" });
      expect(r2.matched).toBe(false);
    });

    it("MATCHES operator (regex)", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const policy = await PolicyEngineService.createPolicy(ctx, {
        name: "Regex", rules: [{ field: "transactionType", operator: "MATCHES", value: "^WIRE" }],
      });
      const r1 = await PolicyEngineService.testPolicy(ctx, policy.id, { amount: 100, transactionType: "WIRE_TRANSFER", currency: "USD" });
      expect(r1.matched).toBe(true);
      const r2 = await PolicyEngineService.testPolicy(ctx, policy.id, { amount: 100, transactionType: "ACH", currency: "USD" });
      expect(r2.matched).toBe(false);
    });

    it("NEGATE operator inverts result", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const policy = await PolicyEngineService.createPolicy(ctx, {
        name: "Negate", rules: [{ field: "currency", operator: "EQUALS", value: "USD", negate: true }],
      });
      const r = await PolicyEngineService.testPolicy(ctx, policy.id, { amount: 100, transactionType: "WIRE", currency: "EUR" });
      expect(r.matched).toBe(true);
    });

    it("AND logic across multiple rules", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const policy = await PolicyEngineService.createPolicy(ctx, {
        name: "Multi Rule", rules: [
          { field: "amount", operator: "GREATER_THAN", value: "1000" },
          { field: "currency", operator: "EQUALS", value: "USD" },
        ],
      });
      const r1 = await PolicyEngineService.testPolicy(ctx, policy.id, { amount: 2000, transactionType: "WIRE", currency: "USD" });
      expect(r1.matched).toBe(true);
      const r2 = await PolicyEngineService.testPolicy(ctx, policy.id, { amount: 500, transactionType: "WIRE", currency: "USD" });
      expect(r2.matched).toBe(false);
      const r3 = await PolicyEngineService.testPolicy(ctx, policy.id, { amount: 2000, transactionType: "WIRE", currency: "EUR" });
      expect(r3.matched).toBe(false);
    });
  });

  describe("testAllPolicies", () => {
    it("returns first matched policy by priority", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      await PolicyEngineService.createPolicy(ctx, {
        name: "Low Priority", priority: 100,
        rules: [{ field: "amount", operator: "GREATER_THAN", value: "0" }],
      });
      await PolicyEngineService.createPolicy(ctx, {
        name: "High Priority", priority: 10,
        rules: [{ field: "currency", operator: "EQUALS", value: "USD" }],
      });
      const result = await PolicyEngineService.testAllPolicies(ctx, {
        amount: 5000, transactionType: "WIRE", currency: "USD",
      });
      expect(result.matchedPolicy).not.toBeNull();
      expect(result.matchedPolicy!.policyName).toBe("High Priority");
    });

    it("returns null when nothing matches", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      await PolicyEngineService.createPolicy(ctx, {
        name: "Strict", rules: [{ field: "amount", operator: "LESS_THAN", value: "0" }],
      });
      const result = await PolicyEngineService.testAllPolicies(ctx, {
        amount: 100, transactionType: "WIRE", currency: "USD",
      });
      expect(result.matchedPolicy).toBeNull();
    });
  });

  describe("listTestResults", () => {
    it("returns test results with policy name", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const policy = await PolicyEngineService.createPolicy(ctx, {
        name: "Tested Policy", rules: [{ field: "amount", operator: "EQUALS", value: "100" }],
      });
      await PolicyEngineService.testPolicy(ctx, policy.id, { amount: 100, transactionType: "WIRE", currency: "USD" });
      const results = await PolicyEngineService.listTestResults(ctx);
      expect(results).toHaveLength(1);
      expect(results[0].policyName).toBe("Tested Policy");
      expect(results[0].matched).toBe(true);
    });
  });
});
