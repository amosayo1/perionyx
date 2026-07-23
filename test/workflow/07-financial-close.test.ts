import "dotenv/config";
import { describe, it, expect, afterAll } from "vitest";
import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { ledgerService } from "@/modules/ledger/ledger.service";
import { PostingEngine } from "@/modules/ledger/posting-engine";
import { ReconciliationService } from "@/modules/reconciliation/reconciliation.service";
import { createCompany, createWallet, createClearingWallet, createUser, createMembership, createTransaction } from "../helpers/factories";
import { buildTenantContext, cleanup } from "../helpers/db";

afterAll(cleanup);

const postingEngine = new PostingEngine();

describe("Financial Close Workflow", () => {
  it("1. reconciles all wallets before close", async () => {
    const company = await createCompany();
    const user = await createUser();
    await createMembership(user.id, company.id);
    const wallet = await createWallet(company.id, { balance: 10000 });

    const computed = await postingEngine.computeWalletBalance(wallet.id, company.id);
    const stored = (await prisma.wallet.findUnique({ where: { id: wallet.id } }))!.balance;
    expect(computed.equals(stored)).toBe(true);
  });

  it("2. verifies all transactions are in final state", async () => {
    const company = await createCompany();
    const user = await createUser();
    await createMembership(user.id, company.id);
    const fromWallet = await createWallet(company.id, { balance: 50000 });
    const toWallet = await createWallet(company.id, { balance: 0 });

    const txn = await ledgerService.recordTransfer(
      company.id, fromWallet.id, toWallet.id, 10000, "USD",
      { createdByUserId: user.id, reference: "CLOSE-TEST" },
    );
    expect(txn.status).toBe("COMPLETED");

    const pendingCount = await prisma.transaction.count({
      where: { companyId: company.id, status: { not: "COMPLETED" } },
    });
    expect(pendingCount).toBe(0);
  });

  it("3. validates no orphan ledger entries", async () => {
    const company = await createCompany();
    const user = await createUser();
    await createMembership(user.id, company.id);
    const wallet = await createWallet(company.id, { balance: 50000 });

    const txn = await ledgerService.recordTransfer(
      company.id, wallet.id, (await createClearingWallet(company.id)).id, 5000, "USD",
      { createdByUserId: user.id, reference: "ORPHAN-CHK" },
    );

    const entries = await prisma.ledgerEntry.findMany({ where: { companyId: company.id } });
    for (const entry of entries) {
      const parent = await prisma.transaction.findUnique({ where: { id: entry.transactionId } });
      expect(parent).not.toBeNull();
    }
  });

  it("4. creates reconciliation run", async () => {
    const company = await createCompany();
    const user = await createUser();
    await createMembership(user.id, company.id);
    const ctx = buildTenantContext(company.id, { userId: user.id, role: "ADMIN" });

    const runId = await ReconciliationService.initiateRun(ctx, "FULL");
    expect(runId).toBeDefined();
    expect(typeof runId).toBe("string");
  });

  it("5. ledger drift detection works", async () => {
    const company = await createCompany();
    const wallet = await createWallet(company.id, { balance: 100 });
    const user = await createUser();
    await createMembership(user.id, company.id);

    const txn = await createTransaction(company.id, {
      type: "INTERNAL_TRANSFER",
      status: "COMPLETED",
      primaryAmount: 0,
      currency: "USD",
    });

    const result = await ledgerService.verifyWalletsAfterPosting(
      [wallet.id], company.id, txn.id,
    );
    expect(result.drifted).toBe(true);
    expect(result.results[0].walletId).toBe(wallet.id);
  });

  it("6. journal review before final close", async () => {
    const company = await createCompany();
    const user = await createUser();
    await createMembership(user.id, company.id);
    const wallet = await createWallet(company.id, { balance: 100000 });

    const entries = await prisma.ledgerEntry.findMany({
      where: { companyId: company.id },
      include: { transaction: true },
      orderBy: { createdAt: "desc" },
    });

    for (const entry of entries) {
      expect(entry.amount.gt(0)).toBe(true);
      expect(["DEBIT", "CREDIT"]).toContain(entry.side);
    }
  });
});
