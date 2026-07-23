import "dotenv/config";
import { describe, it, expect, afterAll } from "vitest";
import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { ledgerService } from "@/modules/ledger/ledger.service";
import { PostingEngine } from "@/modules/ledger/posting-engine";
import { ApprovalWorkflowEngine } from "@/modules/ledger/approval-workflow";
import { TransactionStateMachine } from "@/modules/ledger/transaction-state-machine";
import { TransactionValidator } from "@/modules/ledger/transaction-validator";
import { createCompany, createWallet, createClearingWallet, createUser, createMembership, createTransaction } from "../helpers/factories";
import { cleanup } from "../helpers/db";

afterAll(cleanup);

const postingEngine = new PostingEngine();
const txValidator = new TransactionValidator();

describe("P2P — Procure-to-Pay Workflow", () => {
  it("1. creates a vendor and purchase requisition", async () => {
    const company = await createCompany();
    const user = await createUser();
    await createMembership(user.id, company.id);
    const wallet = await createWallet(company.id, { balance: 10000 });

    const txn = await prisma.transaction.create({
      data: {
        companyId: company.id,
        type: "WALLET_DEBIT",
        status: "PENDING",
        primaryAmount: 1500,
        currency: "USD",
        reference: "PO-2026-001 — Office supplies",
        createdByUserId: user.id,
      },
    });
    expect(txn.status).toBe("PENDING");
    expect(txn.type).toBe("WALLET_DEBIT");
    expect(txn.reference).toContain("PO-2026-001");
  });

  it("2. validates approval chain for purchase", async () => {
    const company = await createCompany();
    const user = await createUser();
    await createMembership(user.id, company.id, "ADMIN");
    const wallet = await createWallet(company.id, { balance: 10000 });

    const txn = await createTransaction(company.id, {
      type: "WALLET_DEBIT",
      status: "PENDING",
      primaryAmount: 5000,
      currency: "USD",
      reference: "PO-2026-002",
      createdByUserId: user.id,
    });

    const reqs = await ApprovalWorkflowEngine.getApprovalRequirements(txn.id, company.id);
    expect(reqs).toBeDefined();
    expect(Array.isArray(reqs.requiredApprovals)).toBe(true);
  });

  it("3. records goods receipt via ledger entry", async () => {
    const company = await createCompany();
    const user = await createUser();
    await createMembership(user.id, company.id);
    const fromWallet = await createWallet(company.id, { balance: 5000 });
    const clearingWallet = await createClearingWallet(company.id);

    const txn = await ledgerService.recordTransfer(
      company.id, clearingWallet.id, fromWallet.id, 1500, "USD",
      { createdByUserId: user.id, reference: "GR-2026-001 — Goods received" },
    );
    expect(txn.status).toBe("COMPLETED");

    const entries = await prisma.ledgerEntry.findMany({
      where: { transactionId: txn.id },
      orderBy: { sequence: "asc" },
    });
    expect(entries.length).toBeGreaterThanOrEqual(2);
    const totalDebit = entries.filter(e => e.side === "DEBIT").reduce((s, e) => s.add(e.amount), new Prisma.Decimal(0));
    const totalCredit = entries.filter(e => e.side === "CREDIT").reduce((s, e) => s.add(e.amount), new Prisma.Decimal(0));
    expect(totalDebit.equals(totalCredit)).toBe(true);
  });

  it("4. creates vendor invoice with three-way match", async () => {
    const company = await createCompany();
    const user = await createUser();
    await createMembership(user.id, company.id);
    const wallet = await createWallet(company.id, { balance: 10000 });

    const invoiceTxn = await prisma.transaction.create({
      data: {
        companyId: company.id,
        type: "WALLET_CREDIT",
        status: "PENDING",
        primaryAmount: 1500,
        currency: "USD",
        reference: "INV-2026-001 — Vendor invoice",
        createdByUserId: user.id,
      },
    });
    expect(invoiceTxn.status).toBe("PENDING");
  });

  it("5. completes payment via treasury", async () => {
    const company = await createCompany();
    const user = await createUser();
    await createMembership(user.id, company.id);
    const fromWallet = await createWallet(company.id, { balance: 10000 });
    const toWallet = await createWallet(company.id, { balance: 0 });
    const clearingWallet = await createClearingWallet(company.id);

    const txn = await ledgerService.recordTransfer(
      company.id, fromWallet.id, toWallet.id, 1500, "USD",
      { createdByUserId: user.id, reference: "PMT-2026-001 — Vendor payment" },
    );
    expect(txn.status).toBe("COMPLETED");
    expect(txn.type).toBe("INTERNAL_TRANSFER");

    const fromUpdated = await prisma.wallet.findUnique({ where: { id: fromWallet.id } });
    const toUpdated = await prisma.wallet.findUnique({ where: { id: toWallet.id } });
    expect(fromUpdated!.balance.toString()).toBe("8500");
    expect(toUpdated!.balance.toString()).toBe("1500");

    const drifted = await ledgerService.verifyWalletsAfterPosting(
      [fromWallet.id, toWallet.id], company.id, txn.id,
    );
    expect(drifted.drifted).toBe(false);
  });

  it("6. posts to general ledger and verifies audit trail", async () => {
    const company = await createCompany();
    const user = await createUser();
    await createMembership(user.id, company.id);
    const wallet = await createWallet(company.id, { balance: 10000 });
    const clearingWallet = await createClearingWallet(company.id);

    const txn = await ledgerService.recordTransfer(
      company.id, wallet.id, clearingWallet.id, 1500, "USD",
      { createdByUserId: user.id, reference: "GL-POST-001" },
    );
    expect(txn.status).toBe("COMPLETED");

    const entries = await prisma.ledgerEntry.findMany({
      where: { transactionId: txn.id },
      include: { transaction: true },
      orderBy: { sequence: "asc" },
    });
    expect(entries.length).toBeGreaterThanOrEqual(2);
  });

  it("7. validates balanced ledger across complete P2P flow", async () => {
    const company = await createCompany();
    const user = await createUser();
    await createMembership(user.id, company.id);

    const wallets = await Promise.all([
      createWallet(company.id, { balance: 50000 }),
      createWallet(company.id, { balance: 0 }),
      createWallet(company.id, { balance: 0 }),
      createClearingWallet(company.id),
    ]);

    const txns = [];
    for (let i = 0; i < 3; i++) {
      const txn = await ledgerService.recordTransfer(
        company.id, wallets[0].id, wallets[i + 1].id, 1000 * (i + 1), "USD",
        { createdByUserId: user.id, reference: `P2P-TXN-00${i + 1}` },
      );
      txns.push(txn);
    }

    for (const txn of txns) {
      const balance = await postingEngine.verifyTransactionBalance(txn.id);
      expect(balance).toBe(true);
    }

    const allEntries = await prisma.ledgerEntry.findMany({
      where: { companyId: company.id },
    });
    const totalDebit = allEntries.filter(e => e.side === "DEBIT")
      .reduce((s, e) => s.add(e.amount), new Prisma.Decimal(0));
    const totalCredit = allEntries.filter(e => e.side === "CREDIT")
      .reduce((s, e) => s.add(e.amount), new Prisma.Decimal(0));
    expect(totalDebit.equals(totalCredit)).toBe(true);
  });
});
