import "dotenv/config";
import { describe, it, expect, afterAll } from "vitest";
import { Prisma } from "@prisma/client";
import { postingEngine } from "@/modules/ledger/posting-engine";
import { prisma } from "@/server/db/prisma";
import { createCompany, createWallet, createLedgerEntry, createTransaction } from "../test/helpers/factories";
import { cleanup } from "../test/helpers/db";

afterAll(cleanup);

describe("PostingEngine", () => {
  describe("validateBatch", () => {
    it("rejects fewer than 2 postings", () => {
      const result = postingEngine.validateBatch({
        transactionId: "tx1",
        companyId: "c1",
        currency: "USD",
        postings: [{ walletId: "w1", side: "DEBIT", amount: 100, sequence: 0 }],
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Transaction must have at least 2 ledger entries");
    });

    it("rejects unbalanced batch", () => {
      const result = postingEngine.validateBatch({
        transactionId: "tx1",
        companyId: "c1",
        currency: "USD",
        postings: [
          { walletId: "w1", side: "DEBIT", amount: 100, sequence: 0 },
          { walletId: "w2", side: "CREDIT", amount: 50, sequence: 1 },
        ],
      });
      expect(result.valid).toBe(false);
    });

    it("accepts balanced batch", () => {
      const result = postingEngine.validateBatch({
        transactionId: "tx1",
        companyId: "c1",
        currency: "USD",
        postings: [
          { walletId: "w1", side: "DEBIT", amount: 100, sequence: 0 },
          { walletId: "w2", side: "CREDIT", amount: 100, sequence: 1 },
        ],
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("postBatch", () => {
    it("creates ledger entries and updates wallet balances", async () => {
      const company = await createCompany();
      const from = await createWallet(company.id, { balance: 200 });
      const to = await createWallet(company.id, { balance: 0 });
      const txn = await createTransaction(company.id, { status: "PENDING" as any });

      await postingEngine.postBatch({
        transactionId: txn.id,
        companyId: company.id,
        currency: "USD",
        postings: [
          { walletId: from.id, side: "DEBIT", amount: 75, sequence: 0 },
          { walletId: to.id, side: "CREDIT", amount: 75, sequence: 1 },
        ],
      });

      const [fromUpdated, toUpdated, entries] = await Promise.all([
        prisma.wallet.findUnique({ where: { id: from.id } }),
        prisma.wallet.findUnique({ where: { id: to.id } }),
        prisma.ledgerEntry.findMany({ where: { transactionId: txn.id }, orderBy: { sequence: "asc" } }),
      ]);
      expect(fromUpdated!.balance.toString()).toBe("125");
      expect(toUpdated!.balance.toString()).toBe("75");
      expect(entries).toHaveLength(2);
      expect(entries[0].side).toBe("DEBIT");
      expect(entries[1].side).toBe("CREDIT");
    });
  });

  describe("computeWalletBalance", () => {
    it("returns 0 for wallet with no entries", async () => {
      const company = await createCompany();
      const wallet = await createWallet(company.id);
      const balance = await postingEngine.computeWalletBalance(wallet.id, company.id);
      expect(balance.toString()).toBe("0");
    });

    it("derives balance from ledger entries", async () => {
      const company = await createCompany();
      const wallet = await createWallet(company.id);
      const txn = await createTransaction(company.id);

      await createLedgerEntry(company.id, txn.id, wallet.id, { side: "CREDIT", amount: 200, sequence: 0 });
      await createLedgerEntry(company.id, txn.id, wallet.id, { side: "DEBIT", amount: 50, sequence: 1 });

      const balance = await postingEngine.computeWalletBalance(wallet.id, company.id);
      expect(balance.toString()).toBe("150");
    });
  });

  describe("getTransactionPostings", () => {
    it("returns ledger entries for a transaction", async () => {
      const company = await createCompany();
      const w1 = await createWallet(company.id);
      const w2 = await createWallet(company.id);
      const txn = await createTransaction(company.id);

      await createLedgerEntry(company.id, txn.id, w1.id, { side: "DEBIT", amount: 100, sequence: 0 });
      await createLedgerEntry(company.id, txn.id, w2.id, { side: "CREDIT", amount: 100, sequence: 1 });

      const postings = await postingEngine.getTransactionPostings(txn.id);
      expect(postings).toHaveLength(2);
      expect(postings[0].side).toBe("DEBIT");
      expect(postings[1].side).toBe("CREDIT");
    });
  });
});
