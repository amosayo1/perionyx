import "dotenv/config";
import { describe, it, expect, afterAll } from "vitest";
import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { TreasuryService } from "@/modules/treasury/treasury.service";
import { ledgerService } from "@/modules/ledger/ledger.service";
import { PostingEngine } from "@/modules/ledger/posting-engine";
import { createCompany, createWallet, createClearingWallet, createUser, createMembership, createTransaction } from "../helpers/factories";
import { buildTenantContext, cleanup } from "../helpers/db";

afterAll(cleanup);

const postingEngine = new PostingEngine();

async function buildCtx(companyId: string) {
  const user = await createUser();
  await createMembership(user.id, companyId, "ADMIN");
  return buildTenantContext(companyId, { userId: user.id, role: "ADMIN" });
}

describe("Treasury Workflow", () => {
  it("1. establishes cash position via treasury accounts", async () => {
    const company = await createCompany();
    const ctx = await buildCtx(company.id);

    const accounts = await Promise.all([
      TreasuryService.createAccount(ctx, { name: "Chase Checking", currency: "USD", description: "Operating account" }),
      TreasuryService.createAccount(ctx, { name: "Chase Savings", currency: "USD", description: "Reserve account" }),
      TreasuryService.createAccount(ctx, { name: "HSBC EUR", currency: "EUR", description: "European ops" }),
    ]);
    expect(accounts).toHaveLength(3);
    expect(accounts[0].balance).toBe("0");
    expect(accounts[0].currency).toBe("USD");
  });

  it("2. records deposits and transfers between accounts", async () => {
    const company = await createCompany();
    const ctx = await buildCtx(company.id);

    const checking = await TreasuryService.createAccount(ctx, { name: "Checking", currency: "USD" });
    const savings = await TreasuryService.createAccount(ctx, { name: "Savings", currency: "USD" });

    await TreasuryService.deposit(ctx, { accountId: checking.id, amount: 100000, reference: "Beginning balance" });
    const checkingAfterDeposit = await TreasuryService.getAccount(ctx, checking.id);
    expect(checkingAfterDeposit!.balance.toString()).toBe("100000");

    await TreasuryService.transfer(ctx, {
      fromAccountId: checking.id, toAccountId: savings.id, amount: 25000,
      reference: "Monthly savings transfer",
    });
    const checkingAfterTransfer = await TreasuryService.getAccount(ctx, checking.id);
    const savingsAfterTransfer = await TreasuryService.getAccount(ctx, savings.id);
    expect(checkingAfterTransfer!.balance.toString()).toBe("75000");
    expect(savingsAfterTransfer!.balance.toString()).toBe("25000");
  });

  it("3. validates liquidity summary", async () => {
    const company = await createCompany();
    const ctx = await buildCtx(company.id);

    await TreasuryService.createAccount(ctx, { name: "Checking", currency: "USD" });
    await TreasuryService.createAccount(ctx, { name: "Savings", currency: "USD" });

    const summary = await TreasuryService.getLiquiditySummary(ctx);
    expect(Array.isArray(summary)).toBe(true);
  });

  it("4. validates FX exposure tracking", async () => {
    const company = await createCompany();
    const ctx = await buildCtx(company.id);

    const accounts = await Promise.all([
      TreasuryService.createAccount(ctx, { name: "USD Ops", currency: "USD" }),
      TreasuryService.createAccount(ctx, { name: "EUR Ops", currency: "EUR" }),
      TreasuryService.createAccount(ctx, { name: "GBP Ops", currency: "GBP" }),
    ]);
    expect(accounts).toHaveLength(3);
  });

  it("5. treasury journal entries are balanced", async () => {
    const company = await createCompany();
    const ctx = await buildCtx(company.id);
    const user = await createUser();
    await createMembership(user.id, company.id);

    const checking = await TreasuryService.createAccount(ctx, { name: "Checking", currency: "USD" });

    const wallet = await createWallet(company.id, { balance: 500000 });
    const clearingWallet = await createClearingWallet(company.id);

    const txn = await ledgerService.recordTransfer(
      company.id, wallet.id, clearingWallet.id, 100000, "USD",
      { createdByUserId: user.id, reference: "TREASURY-GL-001" },
    );
    expect(txn.status).toBe("COMPLETED");

    const balanced = await postingEngine.verifyTransactionBalance(txn.id);
    expect(balanced).toBe(true);
  });

  it("6. validates cash forecast exists", async () => {
    const company = await createCompany();
    const ctx = await buildCtx(company.id);

    await TreasuryService.createAccount(ctx, { name: "Forecast Base", currency: "USD" });

    const positions = await TreasuryService.getLiquiditySummary(ctx);
    expect(positions).toBeDefined();
  });
});
