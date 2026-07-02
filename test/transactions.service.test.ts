import "dotenv/config";
import { describe, it, expect, afterAll } from "vitest";
import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { creditWallet, transferBetweenWallets } from "@/modules/transactions/transactions.service";
import {
  createCompany, createWallet, createClearingWallet, createUser, createMembership,
} from "../test/helpers/factories";
import { cleanup, buildTenantContext } from "../test/helpers/db";

afterAll(cleanup);

describe("transactions.service", () => {
  describe("creditWallet", () => {
    it("credits a standard wallet", async () => {
      const user = await createUser();
      const company = await createCompany();
      await createMembership(user.id, company.id);
      await createClearingWallet(company.id, "USD");
      const target = await createWallet(company.id, { balance: 100 });

      const ctx = buildTenantContext(company.id, { userId: user.id });
      const result = await creditWallet(ctx, {
        walletId: target.id,
        amount: new Prisma.Decimal(250),
        idempotencyKey: `credit-test-1-${Date.now()}`,
      });

      expect(result.status).toBe("COMPLETED");
      const updated = await prisma.wallet.findUnique({ where: { id: target.id } });
      expect(updated!.balance.toString()).toBe("350");
    });

    it("handles idempotent replay", async () => {
      const user = await createUser();
      const company = await createCompany();
      await createMembership(user.id, company.id);
      await createClearingWallet(company.id, "USD");
      const target = await createWallet(company.id, { balance: 0 });

      const key = `credit-idem-${Date.now()}`;
      const ctx = buildTenantContext(company.id, { userId: user.id });
      const first = await creditWallet(ctx, {
        walletId: target.id,
        amount: new Prisma.Decimal(100),
        idempotencyKey: key,
      });
      const second = await creditWallet(ctx, {
        walletId: target.id,
        amount: new Prisma.Decimal(100),
        idempotencyKey: key,
      });

      expect(first.id).toBe(second.id);
      const updated = await prisma.wallet.findUnique({ where: { id: target.id } });
      expect(updated!.balance.toString()).toBe("100");
    });
  });

  describe("transferBetweenWallets", () => {
    it("transfers between same-currency wallets", async () => {
      const user = await createUser();
      const company = await createCompany();
      await createMembership(user.id, company.id);
      const from = await createWallet(company.id, { balance: 500 });
      const to = await createWallet(company.id, { balance: 0 });

      const ctx = buildTenantContext(company.id, { userId: user.id });
      const result = await transferBetweenWallets(ctx, {
        fromWalletId: from.id,
        toWalletId: to.id,
        amount: new Prisma.Decimal(200),
        idempotencyKey: `transfer-test-1-${Date.now()}`,
      });

      expect(result.status).toBe("COMPLETED");
      const [fromUpdated, toUpdated] = await Promise.all([
        prisma.wallet.findUnique({ where: { id: from.id } }),
        prisma.wallet.findUnique({ where: { id: to.id } }),
      ]);
      expect(fromUpdated!.balance.toString()).toBe("300");
      expect(toUpdated!.balance.toString()).toBe("200");
    });

    it("rejects transfer to same wallet", async () => {
      const user = await createUser();
      const company = await createCompany();
      await createMembership(user.id, company.id);
      const wallet = await createWallet(company.id);

      const ctx = buildTenantContext(company.id, { userId: user.id });
      await expect(
        transferBetweenWallets(ctx, {
          fromWalletId: wallet.id,
          toWalletId: wallet.id,
          amount: new Prisma.Decimal(100),
          idempotencyKey: `transfer-self-${Date.now()}`,
        }),
      ).rejects.toThrow("Cannot transfer to the same wallet");
    });

    it("handles cross-currency transfer", async () => {
      const user = await createUser();
      const company = await createCompany();
      await createMembership(user.id, company.id);
      const from = await createWallet(company.id, { currency: "USD", balance: 1000 });
      const to = await createWallet(company.id, { currency: "EUR", balance: 0 });

      const ctx = buildTenantContext(company.id, { userId: user.id });
      const result = await transferBetweenWallets(ctx, {
        fromWalletId: from.id,
        toWalletId: to.id,
        amount: new Prisma.Decimal(100),
        idempotencyKey: `cross-ccy-${Date.now()}`,
      });

      expect(result.status).toBe("COMPLETED");
      const toUpdated = await prisma.wallet.findUnique({ where: { id: to.id } });
      expect(toUpdated!.balance.greaterThan(0)).toBe(true);
    });
  });
});
