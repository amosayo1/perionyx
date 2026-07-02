import "dotenv/config";
import { describe, it, expect, afterAll } from "vitest";
import { Prisma } from "@prisma/client";
import { ledgerService } from "@/modules/ledger/ledger.service";
import { prisma } from "@/server/db/prisma";
import {
  createCompany, createWallet, createClearingWallet, createUser, createMembership,
} from "../test/helpers/factories";
import { cleanup } from "../test/helpers/db";

afterAll(cleanup);

describe("LedgerService", () => {
  describe("verifyWalletsAfterPosting", () => {
    it("returns drifted=false when balances match", async () => {
      const company = await createCompany();
      const wallet = await createWallet(company.id);
      const txn = await prisma.transaction.create({
        data: { companyId: company.id, type: "INTERNAL_TRANSFER" as any, status: "COMPLETED" as any, primaryAmount: 0, currency: "USD" },
      });

      const result = await ledgerService.verifyWalletsAfterPosting(
        [wallet.id], company.id, txn.id,
      );
      expect(result.drifted).toBe(false);
      expect(result.results).toHaveLength(0);
    });

    it("returns drifted=true when balances mismatch", async () => {
      const company = await createCompany();
      const wallet = await createWallet(company.id, { balance: 100 });
      const txn = await prisma.transaction.create({
        data: { companyId: company.id, type: "INTERNAL_TRANSFER" as any, status: "COMPLETED" as any, primaryAmount: 0, currency: "USD" },
      });

      const result = await ledgerService.verifyWalletsAfterPosting(
        [wallet.id], company.id, txn.id,
      );
      expect(result.drifted).toBe(true);
      expect(result.results[0].walletId).toBe(wallet.id);
      expect(result.results[0].stored).toBe("100");
      expect(result.results[0].derived).toBe("0");
    });
  });

  describe("recordTransfer", () => {
    it("completes a transfer between two wallets", async () => {
      const user = await createUser();
      const company = await createCompany();
      await createMembership(user.id, company.id);
      const from = await createWallet(company.id, { balance: 500 });
      const to = await createWallet(company.id, { balance: 100 });

      const txn = await ledgerService.recordTransfer(
        company.id, from.id, to.id, 200, "USD",
        { createdByUserId: user.id },
      );

      expect(txn.status).toBe("COMPLETED");
      const [fromUpdated, toUpdated] = await Promise.all([
        prisma.wallet.findUnique({ where: { id: from.id } }),
        prisma.wallet.findUnique({ where: { id: to.id } }),
      ]);
      expect(fromUpdated!.balance.toString()).toBe("300");
      expect(toUpdated!.balance.toString()).toBe("300");
    });

    it("rejects transfer to same wallet", async () => {
      const user = await createUser();
      const company = await createCompany();
      await createMembership(user.id, company.id);
      const wallet = await createWallet(company.id, { balance: 500 });

      await expect(
        ledgerService.recordTransfer(company.id, wallet.id, wallet.id, 100, "USD", {
          createdByUserId: user.id,
        }),
      ).rejects.toThrow();
    });
  });

  describe("recordCredit", () => {
    it("credits a wallet through the clearing wallet", async () => {
      const user = await createUser();
      const company = await createCompany();
      await createMembership(user.id, company.id);
      await createClearingWallet(company.id, "USD");
      const target = await createWallet(company.id, { balance: 0 });

      const txn = await ledgerService.recordCredit(
        company.id, target.id, 300, "USD",
        { createdByUserId: user.id },
      );

      expect(txn.status).toBe("COMPLETED");
      const updated = await prisma.wallet.findUnique({ where: { id: target.id } });
      expect(updated!.balance.toString()).toBe("300");
    });
  });

  describe("recordDebit", () => {
    it("debits a wallet through the clearing wallet", async () => {
      const user = await createUser();
      const company = await createCompany();
      await createMembership(user.id, company.id);
      await createClearingWallet(company.id, "USD");
      const source = await createWallet(company.id, { balance: 500 });

      const txn = await ledgerService.recordDebit(
        company.id, source.id, 200, "USD",
        { createdByUserId: user.id },
      );

      expect(txn.status).toBe("COMPLETED");
      const updated = await prisma.wallet.findUnique({ where: { id: source.id } });
      expect(updated!.balance.toString()).toBe("300");
    });
  });
});
