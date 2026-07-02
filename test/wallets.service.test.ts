import "dotenv/config";
import { describe, it, expect, afterAll } from "vitest";
import { createWallet, listWallets, getWalletForTenant } from "@/modules/wallets/wallets.service";
import { createCompany, createUser, createMembership } from "../test/helpers/factories";
import { buildTenantContext, cleanup } from "../test/helpers/db";
import { NotFoundError } from "@/lib/errors/app-error";

afterAll(cleanup);

async function buildRealContext(companyId: string) {
  const user = await createUser();
  await createMembership(user.id, companyId, "ADMIN");
  return buildTenantContext(companyId, { userId: user.id, role: "ADMIN" });
}

describe("WalletsService", () => {
  describe("listWallets", () => {
    it("returns empty list when no wallets exist", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const wallets = await listWallets(ctx);
      expect(wallets).toEqual([]);
    });

    it("returns only wallets for the tenant company", async () => {
      const companyA = await createCompany();
      const companyB = await createCompany();
      const ctxA = await buildRealContext(companyA.id);
      const ctxB = await buildRealContext(companyB.id);

      await createWallet(ctxA, { name: "A-Wallet", currency: "USD" });
      await createWallet(ctxB, { name: "B-Wallet", currency: "EUR" });

      const listA = await listWallets(ctxA);
      expect(listA).toHaveLength(1);
      expect(listA[0].name).toBe("A-Wallet");

      const listB = await listWallets(ctxB);
      expect(listB).toHaveLength(1);
      expect(listB[0].name).toBe("B-Wallet");
    });
  });

  describe("createWallet", () => {
    it("creates a wallet with default balance 0", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const wallet = await createWallet(ctx, { name: "My Wallet", currency: "USD" });
      expect(wallet.name).toBe("My Wallet");
      expect(wallet.currency).toBe("USD");
      expect(wallet.balance.toString()).toBe("0");
      expect(wallet.kind).toBe("STANDARD");
    });

    it("creates wallets in different currencies", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const usd = await createWallet(ctx, { name: "USD Wallet", currency: "USD" });
      const eur = await createWallet(ctx, { name: "EUR Wallet", currency: "EUR" });
      expect(usd.currency).toBe("USD");
      expect(eur.currency).toBe("EUR");
    });

    it("records an audit log on creation", async () => {
      const { prisma } = await import("@/server/db/prisma");
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);

      const wallet = await createWallet(ctx, { name: "Audited Wallet", currency: "USD" });

      const auditLog = await prisma.auditLog.findFirst({
        where: { resourceId: wallet.id, action: "wallet.create" },
      });
      expect(auditLog).not.toBeNull();
      expect(auditLog!.actorUserId).toBe(ctx.userId);
      expect(auditLog!.companyId).toBe(company.id);
    });
  });

  describe("getWalletForTenant", () => {
    it("returns wallet for the correct tenant", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const created = await createWallet(ctx, { name: "Find Me" });
      const found = await getWalletForTenant(ctx, created.id);
      expect(found.id).toBe(created.id);
      expect(found.name).toBe("Find Me");
    });

    it("throws NotFoundError for wallet in different tenant", async () => {
      const companyA = await createCompany();
      const companyB = await createCompany();
      const ctxA = await buildRealContext(companyA.id);
      const ctxB = await buildRealContext(companyB.id);

      const wallet = await createWallet(ctxA, { name: "Tenant A Wallet" });

      await expect(
        getWalletForTenant(ctxB, wallet.id),
      ).rejects.toThrow(NotFoundError);
    });

    it("throws NotFoundError for missing wallet", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      await expect(
        getWalletForTenant(ctx, "nonexistent-id"),
      ).rejects.toThrow(NotFoundError);
    });
  });
});
