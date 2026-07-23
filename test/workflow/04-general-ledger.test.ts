import "dotenv/config";
import { describe, it, expect, afterAll } from "vitest";
import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { ledgerService } from "@/modules/ledger/ledger.service";
import { PostingEngine } from "@/modules/ledger/posting-engine";
import { assertBalancedLedger } from "@/modules/ledger/ledger.service";
import { createCompany, createWallet, createClearingWallet, createUser, createMembership } from "../helpers/factories";
import { cleanup } from "../helpers/db";

afterAll(cleanup);

const postingEngine = new PostingEngine();
type LedgerSide = "DEBIT" | "CREDIT";

describe("General Ledger Workflow", () => {
  it("1. validates ledger assertion — debits equal credits", () => {
    expect(() =>
      assertBalancedLedger([
        { side: "DEBIT" as LedgerSide, amount: new Prisma.Decimal(100) },
        { side: "CREDIT" as LedgerSide, amount: new Prisma.Decimal(100) },
      ]),
    ).not.toThrow();

    expect(() =>
      assertBalancedLedger([
        { side: "DEBIT" as LedgerSide, amount: new Prisma.Decimal(100) },
        { side: "DEBIT" as LedgerSide, amount: new Prisma.Decimal(100) },
      ]),
    ).toThrow();
  });

  it("2. validates posting rules — minimum two entries", () => {
    expect(() =>
      assertBalancedLedger([
        { side: "DEBIT" as LedgerSide, amount: new Prisma.Decimal(100) },
      ]),
    ).toThrow();
  });

  it("3. validates posting rules — amounts must be positive", () => {
    expect(() =>
      assertBalancedLedger([
        { side: "DEBIT" as LedgerSide, amount: new Prisma.Decimal(-100) },
        { side: "CREDIT" as LedgerSide, amount: new Prisma.Decimal(100) },
      ]),
    ).toThrow();
  });

  it("4. creates journal via recordTransfer", async () => {
    const company = await createCompany();
    const user = await createUser();
    await createMembership(user.id, company.id);
    const fromWallet = await createWallet(company.id, { balance: 50000 });
    const toWallet = await createWallet(company.id, { balance: 0 });

    const txn = await ledgerService.recordTransfer(
      company.id, fromWallet.id, toWallet.id, 25000, "USD",
      { createdByUserId: user.id, reference: "JOURNAL-001" },
    );
    expect(txn.status).toBe("COMPLETED");

    const entries = await prisma.ledgerEntry.findMany({
      where: { transactionId: txn.id },
      orderBy: { sequence: "asc" },
    });
    expect(entries).toHaveLength(2);
    expect(entries[0].side).toBe("DEBIT");
    expect(entries[1].side).toBe("CREDIT");
    expect(entries[0].amount.equals(entries[1].amount)).toBe(true);
  });

  it("5. validates posting batch integrity", async () => {
    const result = postingEngine.validateBatch({
      transactionId: "test",
      companyId: "test",
      currency: "USD",
      postings: [
        { walletId: "w1", side: "DEBIT", amount: 500, sequence: 0 },
        { walletId: "w2", side: "CREDIT", amount: 500, sequence: 1 },
      ],
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("6. validates posting batch rejects unbalanced", async () => {
    const result = postingEngine.validateBatch({
      transactionId: "test",
      companyId: "test",
      currency: "USD",
      postings: [
        { walletId: "w1", side: "DEBIT", amount: 500, sequence: 0 },
        { walletId: "w2", side: "CREDIT", amount: 300, sequence: 1 },
      ],
    });
    expect(result.valid).toBe(false);
  });

  it("7. posts batch and verifies stored balances", async () => {
    const company = await createCompany();
    const fromWallet = await createWallet(company.id, { balance: 10000 });
    const toWallet = await createWallet(company.id, { balance: 0 });

    await postingEngine.postBatch({
      transactionId: `batch-${Date.now()}`,
      companyId: company.id,
      currency: "USD",
      postings: [
        { walletId: fromWallet.id, side: "DEBIT", amount: 3000, sequence: 0 },
        { walletId: toWallet.id, side: "CREDIT", amount: 3000, sequence: 1 },
      ],
    });

    const fromUpdated = await prisma.wallet.findUnique({ where: { id: fromWallet.id } });
    const toUpdated = await prisma.wallet.findUnique({ where: { id: toWallet.id } });
    expect(fromUpdated!.balance.toString()).toBe("7000");
    expect(toUpdated!.balance.toString()).toBe("3000");
  });

  it("8. verifies computed wallet balance matches stored", async () => {
    const company = await createCompany();
    const user = await createUser();
    await createMembership(user.id, company.id);
    const wallet = await createWallet(company.id, { balance: 50000 });

    const computed = await postingEngine.computeWalletBalance(wallet.id, company.id);
    const stored = (await prisma.wallet.findUnique({ where: { id: wallet.id } }))!.balance;
    expect(computed.equals(stored)).toBe(true);
  });

  it("9. multi-currency transfer posts correctly", async () => {
    const company = await createCompany();
    const user = await createUser();
    await createMembership(user.id, company.id);
    const usdWallet = await createWallet(company.id, { balance: 100000, currency: "USD" });
    const eurWallet = await createWallet(company.id, { balance: 50000, currency: "EUR" });

    const txn = await ledgerService.recordTransfer(
      company.id, usdWallet.id, eurWallet.id, 10000, "USD",
      { createdByUserId: user.id, reference: "MULTI-CUR-001" },
    );
    expect(txn.status).toBe("COMPLETED");

    const balanced = await postingEngine.verifyTransactionBalance(txn.id);
    expect(balanced).toBe(true);
  });

  it("10. audit trail exists for GL postings", async () => {
    const company = await createCompany();
    const user = await createUser();
    await createMembership(user.id, company.id);
    const wallet = await createWallet(company.id, { balance: 50000 });

    await ledgerService.recordTransfer(
      company.id, wallet.id, (await createClearingWallet(company.id)).id, 5000, "USD",
      { createdByUserId: user.id, reference: "AUDIT-TEST" },
    );

    const entries = await prisma.ledgerEntry.findMany({
      where: { companyId: company.id },
      take: 5,
    });
    expect(entries.length).toBeGreaterThanOrEqual(2);
    for (const entry of entries) {
      expect(entry.transactionId).toBeTruthy();
      expect(entry.companyId).toBe(company.id);
      expect(entry.amount.gt(0)).toBe(true);
    }
  });
});
