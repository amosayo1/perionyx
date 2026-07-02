import "dotenv/config";
import { describe, it, expect, afterAll } from "vitest";
import { ApiKeyService } from "@/modules/api-keys/api-keys.service";
import { createCompany, createUser, createMembership } from "../test/helpers/factories";
import { buildTenantContext, cleanup } from "../test/helpers/db";

afterAll(cleanup);

async function buildRealContext(companyId: string) {
  const user = await createUser();
  await createMembership(user.id, companyId, "ADMIN");
  return buildTenantContext(companyId, { userId: user.id, role: "ADMIN" });
}

describe("ApiKeyService", () => {
  describe("create", () => {
    it("creates an API key with default scopes", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const result = await ApiKeyService.create(ctx, { name: "Test Key" });
      expect(result.name).toBe("Test Key");
      expect(result.key).toMatch(/^va_[0-9a-f]{64}$/);
      expect(result.prefix).toBe(result.key.slice(0, 10));
      expect(result.lastChars).toBe(result.key.slice(-4));
      expect(result.scopes).toEqual(["read:accounts"]);
      expect(result.active).toBe(true);
    });

    it("creates an API key with custom scopes", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const result = await ApiKeyService.create(ctx, {
        name: "Admin Key",
        scopes: ["admin:all", "write:transfers"],
      });
      expect(result.scopes).toEqual(["admin:all", "write:transfers"]);
    });

    it("creates an API key with expiration", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const future = new Date(Date.now() + 86400000).toISOString();
      const result = await ApiKeyService.create(ctx, { name: "Expiring Key", expiresAt: future });
      expect(result.expiresAt).toBe(future);
    });

    it("returns the full key only on creation", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const created = await ApiKeyService.create(ctx, { name: "Show Once" });
      expect(created.key).toBeDefined();
      const list = await ApiKeyService.list(ctx);
      const listed = list.find((k) => k.id === created.id);
      expect((listed as { key?: string }).key).toBeUndefined();
    });
  });

  describe("list", () => {
    it("returns only keys for the tenant", async () => {
      const companyA = await createCompany();
      const companyB = await createCompany();
      const ctxA = await buildRealContext(companyA.id);
      const ctxB = await buildRealContext(companyB.id);

      await ApiKeyService.create(ctxA, { name: "Key A" });
      await ApiKeyService.create(ctxB, { name: "Key B" });

      const listA = await ApiKeyService.list(ctxA);
      expect(listA).toHaveLength(1);
      expect(listA[0].name).toBe("Key A");

      const listB = await ApiKeyService.list(ctxB);
      expect(listB).toHaveLength(1);
      expect(listB[0].name).toBe("Key B");
    });
  });

  describe("validate", () => {
    it("returns companyId and scopes for a valid key", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const created = await ApiKeyService.create(ctx, { name: "Valid Key" });
      const result = await ApiKeyService.validate(`Bearer ${created.key}`);
      expect(result).not.toBeNull();
      expect(result!.companyId).toBe(company.id);
      expect(result!.scopes).toEqual(["read:accounts"]);
    });

    it("returns null for invalid key format", async () => {
      const result = await ApiKeyService.validate("Basic abc123");
      expect(result).toBeNull();
    });

    it("returns null for nonexistent key", async () => {
      const result = await ApiKeyService.validate("Bearer va_0000000000000000000000000000000000000000000000000000000000000000");
      expect(result).toBeNull();
    });

    it("returns null for deactivated key", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const created = await ApiKeyService.create(ctx, { name: "Deactivate Me" });
      await ApiKeyService.update(ctx, created.id, { active: false });
      const result = await ApiKeyService.validate(`Bearer ${created.key}`);
      expect(result).toBeNull();
    });

    it("returns null for expired key", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const past = new Date(Date.now() - 10000).toISOString();
      const created = await ApiKeyService.create(ctx, { name: "Expired", expiresAt: past });
      const result = await ApiKeyService.validate(`Bearer ${created.key}`);
      expect(result).toBeNull();
    });

    it("accepts null auth header", async () => {
      const result = await ApiKeyService.validate(null);
      expect(result).toBeNull();
    });
  });

  describe("update", () => {
    it("updates name and scopes", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const created = await ApiKeyService.create(ctx, { name: "Original" });
      await ApiKeyService.update(ctx, created.id, { name: "Updated", scopes: ["admin:all"] });
      const list = await ApiKeyService.list(ctx);
      const updated = list.find((k) => k.id === created.id);
      expect(updated!.name).toBe("Updated");
      expect(updated!.scopes).toEqual(["admin:all"]);
    });
  });

  describe("rotate", () => {
    it("generates a new key with different value", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const created = await ApiKeyService.create(ctx, { name: "Rotate Me" });
      const oldKey = created.key;
      const rotated = await ApiKeyService.rotate(ctx, created.id);
      expect(rotated.key).not.toBe(oldKey);
      const oldValid = await ApiKeyService.validate(`Bearer ${oldKey}`);
      expect(oldValid).toBeNull();
      const newValid = await ApiKeyService.validate(`Bearer ${rotated.key}`);
      expect(newValid).not.toBeNull();
    });
  });

  describe("delete", () => {
    it("removes the key and returns success", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const created = await ApiKeyService.create(ctx, { name: "Delete Me" });
      const result = await ApiKeyService.delete(ctx, created.id);
      expect(result.success).toBe(true);
      const list = await ApiKeyService.list(ctx);
      expect(list.find((k) => k.id === created.id)).toBeUndefined();
    });
  });
});
