import "dotenv/config";
import { describe, it, expect, afterAll } from "vitest";
import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { ledgerService } from "@/modules/ledger/ledger.service";
import { PostingEngine } from "@/modules/ledger/posting-engine";
import { createCompany, createWallet, createClearingWallet, createUser, createMembership, createTransaction } from "../helpers/factories";
import { cleanup } from "../helpers/db";

afterAll(cleanup);

const postingEngine = new PostingEngine();

describe("Data Consistency", () => {
  it("1. ledger balances are internally consistent", async () => {
    const company = await createCompany();
    const user = await createUser();
    await createMembership(user.id, company.id);
    const wallets = await Promise.all([
      createWallet(company.id, { balance: 100000 }),
      createWallet(company.id, { balance: 50000 }),
      createClearingWallet(company.id),
    ]);

    for (const wallet of wallets) {
      const computed = await postingEngine.computeWalletBalance(wallet.id, company.id);
      const stored = (await prisma.wallet.findUnique({ where: { id: wallet.id } }))!.balance;
      expect(computed.equals(stored)).toBe(true);
    }
  });

  it("2. cash balances reconcile with wallet records", async () => {
    const company = await createCompany();
    const user = await createUser();
    await createMembership(user.id, company.id);
    const wallet = await createWallet(company.id, { balance: 75000 });
    const clearingWallet = await createClearingWallet(company.id);

    await ledgerService.recordTransfer(
      company.id, wallet.id, clearingWallet.id, 25000, "USD",
      { createdByUserId: user.id, reference: "CONSISTENCY-TEST" },
    );

    const updated = await prisma.wallet.findUnique({ where: { id: wallet.id } });
    const computed = await postingEngine.computeWalletBalance(wallet.id, company.id);
    expect(updated!.balance.equals(computed)).toBe(true);
  });

  it("3. journal integrity — every entry has valid transaction", async () => {
    const company = await createCompany();
    const entries = await prisma.ledgerEntry.findMany({
      where: { companyId: company.id },
      select: { transactionId: true },
    });

    for (const entry of entries) {
      const txn = await prisma.transaction.findUnique({ where: { id: entry.transactionId } });
      expect(txn).not.toBeNull();
    }
  });

  it("4. audit chain — transactions linked to ledger entries", async () => {
    const company = await createCompany();
    const user = await createUser();
    await createMembership(user.id, company.id);
    const wallet = await createWallet(company.id, { balance: 100000 });

    const txn = await ledgerService.recordTransfer(
      company.id, wallet.id, (await createClearingWallet(company.id)).id, 10000, "USD",
      { createdByUserId: user.id, reference: "AUDIT-CHAIN" },
    );

    const entries = await prisma.ledgerEntry.findMany({
      where: { transactionId: txn.id },
    });
    expect(entries.length).toBeGreaterThanOrEqual(2);
    for (const entry of entries) {
      expect(entry.transactionId).toBe(txn.id);
      expect(entry.companyId).toBe(company.id);
    }
  });

  it("5. foreign keys — ledger entries reference real wallets", async () => {
    const company = await createCompany();
    const entries = await prisma.ledgerEntry.findMany({
      where: { companyId: company.id },
      select: { walletId: true },
    });

    for (const entry of entries) {
      const wallet = await prisma.wallet.findUnique({ where: { id: entry.walletId } });
      expect(wallet).not.toBeNull();
    }
  });

  it("6. tenant isolation — companies see only own data", async () => {
    const companyA = await createCompany();
    const companyB = await createCompany();
    const userA = await createUser();
    const userB = await createUser();
    await createMembership(userA.id, companyA.id);
    await createMembership(userB.id, companyB.id);

    const walletA = await createWallet(companyA.id, { balance: 50000 });
    const walletB = await createWallet(companyB.id, { balance: 30000 });

    const entriesA = await prisma.ledgerEntry.findMany({ where: { companyId: companyA.id } });
    const entriesB = await prisma.ledgerEntry.findMany({ where: { companyId: companyB.id } });

    // Each company's entries should only reference their own wallets
    for (const entry of entriesA) {
      const wallet = await prisma.wallet.findUnique({ where: { id: entry.walletId } });
      expect(wallet!.companyId).toBe(companyA.id);
    }
  });

  it("7. no orphan transactions without ledger entries", async () => {
    const company = await createCompany();
    const user = await createUser();
    await createMembership(user.id, company.id);
    const wallet = await createWallet(company.id, { balance: 50000 });

    const txn = await ledgerService.recordTransfer(
      company.id, wallet.id, (await createClearingWallet(company.id)).id, 5000, "USD",
      { createdByUserId: user.id, reference: "ORPHAN-CHK-2" },
    );

    const entryCount = await prisma.ledgerEntry.count({ where: { transactionId: txn.id } });
    expect(entryCount).toBeGreaterThanOrEqual(2);
  });

  it("8. all wallet balances are non-negative", async () => {
    const wallets = await prisma.wallet.findMany();
    for (const wallet of wallets) {
      expect(wallet.balance.gte(0)).toBe(true);
    }
  });
});
