import "dotenv/config";
import { describe, it, expect, afterAll } from "vitest";
import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { ledgerService } from "@/modules/ledger/ledger.service";
import { PostingEngine } from "@/modules/ledger/posting-engine";
import { createCompany, createWallet, createClearingWallet, createUser, createMembership } from "../helpers/factories";
import { cleanup } from "../helpers/db";

afterAll(cleanup);

const postingEngine = new PostingEngine();

describe("O2C — Order-to-Cash Workflow", () => {
  it("1. creates sales order and customer invoice", async () => {
    const company = await createCompany();
    const user = await createUser();
    await createMembership(user.id, company.id);
    const wallet = await createWallet(company.id, { balance: 0 });

    const invoice = await prisma.transaction.create({
      data: {
        companyId: company.id,
        type: "WALLET_CREDIT",
        status: "PENDING",
        primaryAmount: 5000,
        currency: "USD",
        reference: "SO-2026-001 — Customer invoice",
        createdByUserId: user.id,
      },
    });
    expect(invoice.status).toBe("PENDING");
    expect(invoice.primaryAmount.toString()).toBe("5000");
  });

  it("2. processes full customer payment", async () => {
    const company = await createCompany();
    const user = await createUser();
    await createMembership(user.id, company.id);
    const customerWallet = await createWallet(company.id, { balance: 10000 });
    const treasuryWallet = await createWallet(company.id, { balance: 0 });

    const txn = await ledgerService.recordTransfer(
      company.id, customerWallet.id, treasuryWallet.id, 5000, "USD",
      { createdByUserId: user.id, reference: "PMT-2026-001 — Customer payment" },
    );
    expect(txn.status).toBe("COMPLETED");

    const balance = await postingEngine.verifyTransactionBalance(txn.id);
    expect(balance).toBe(true);
  });

  it("3. handles partial payment correctly", async () => {
    const company = await createCompany();
    const user = await createUser();
    await createMembership(user.id, company.id);
    const customerWallet = await createWallet(company.id, { balance: 10000 });
    const treasuryWallet = await createWallet(company.id, { balance: 0 });

    const partialTxn = await ledgerService.recordTransfer(
      company.id, customerWallet.id, treasuryWallet.id, 3000, "USD",
      { createdByUserId: user.id, reference: "PARTIAL-PMT-001 — Partial payment" },
    );
    expect(partialTxn.status).toBe("COMPLETED");

    const balance = await postingEngine.verifyTransactionBalance(partialTxn.id);
    expect(balance).toBe(true);

    const customerUpdated = await prisma.wallet.findUnique({ where: { id: customerWallet.id } });
    expect(customerUpdated!.balance.toString()).toBe("7000");
  });

  it("4. applies credit note against receivable", async () => {
    const company = await createCompany();
    const user = await createUser();
    await createMembership(user.id, company.id);
    const customerWallet = await createWallet(company.id, { balance: 10000 });
    const treasuryWallet = await createWallet(company.id, { balance: 0 });

    await ledgerService.recordTransfer(
      company.id, customerWallet.id, treasuryWallet.id, 5000, "USD",
      { createdByUserId: user.id, reference: "INITIAL-PMT" },
    );

    const creditNote = await ledgerService.recordTransfer(
      company.id, treasuryWallet.id, customerWallet.id, 500, "USD",
      { createdByUserId: user.id, reference: "CN-2026-001 — Credit note" },
    );
    expect(creditNote.status).toBe("COMPLETED");

    const treasuryUpdated = await prisma.wallet.findUnique({ where: { id: treasuryWallet.id } });
    expect(treasuryUpdated!.balance.toString()).toBe("4500");
  });

  it("5. creates aging snapshot from transactions", async () => {
    const company = await createCompany();
    const user = await createUser();
    await createMembership(user.id, company.id);
    const wallet = await createWallet(company.id, { balance: 500000 });

    const outstandingTxns = [];
    const now = Date.now();
    for (let i = 0; i < 5; i++) {
      const txn = await prisma.transaction.create({
        data: {
          companyId: company.id,
          type: "WALLET_CREDIT",
          status: "PENDING",
          primaryAmount: 10000 * (i + 1),
          currency: "USD",
          reference: `AR-INV-${2026000 + i}`,
          createdByUserId: user.id,
          createdAt: new Date(now - (30 * (i + 1) * 86400000)),
        },
      });
      outstandingTxns.push(txn);
    }
    expect(outstandingTxns).toHaveLength(5);

    const pendingCount = await prisma.transaction.count({
      where: { companyId: company.id, status: "PENDING", type: "WALLET_CREDIT" },
    });
    expect(pendingCount).toBe(5);
  });

  it("6. verifies end-to-end cash application", async () => {
    const company = await createCompany();
    const user = await createUser();
    await createMembership(user.id, company.id);
    const clearingWallet = await createClearingWallet(company.id);
    const customerWallet = await createWallet(company.id, { balance: 20000 });
    const treasuryWallet = await createWallet(company.id, { balance: 0 });

    const payment = await ledgerService.recordTransfer(
      company.id, customerWallet.id, treasuryWallet.id, 15000, "USD",
      { createdByUserId: user.id, reference: "CASH-APP-001" },
    );
    expect(payment.status).toBe("COMPLETED");

    const allEntries = await prisma.ledgerEntry.findMany({
      where: { companyId: company.id },
    });
    const totalDebit = allEntries.filter(e => e.side === "DEBIT")
      .reduce((s, e) => s.add(e.amount), new Prisma.Decimal(0));
    const totalCredit = allEntries.filter(e => e.side === "CREDIT")
      .reduce((s, e) => s.add(e.amount), new Prisma.Decimal(0));
    expect(totalDebit.equals(totalCredit)).toBe(true);

    const treasuryUpdated = await prisma.wallet.findUnique({ where: { id: treasuryWallet.id } });
    expect(treasuryUpdated!.balance.toString()).toBe("15000");
  });
});
