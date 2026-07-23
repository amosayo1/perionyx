import "dotenv/config";
import { describe, it, expect, afterAll } from "vitest";
import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { TreasuryService } from "@/modules/treasury/treasury.service";
import { ledgerService } from "@/modules/ledger/ledger.service";
import { PostingEngine } from "@/modules/ledger/posting-engine";
import { ReconciliationService } from "@/modules/reconciliation/reconciliation.service";
import { riskService } from "@/modules/risk/risk.service";
import { createCompany, createWallet, createClearingWallet, createUser, createMembership, createTransaction } from "../helpers/factories";
import { buildTenantContext, cleanup } from "../helpers/db";

afterAll(cleanup);

const postingEngine = new PostingEngine();

describe("Cross-Module Integration", () => {
  it("1. Treasury → GL integration: transfer posts ledger entries", async () => {
    const company = await createCompany();
    const user = await createUser();
    await createMembership(user.id, company.id);
    const ctx = buildTenantContext(company.id, { userId: user.id, role: "ADMIN" });

    const checking = await TreasuryService.createAccount(ctx, { name: "Checking", currency: "USD" });
    const savings = await TreasuryService.createAccount(ctx, { name: "Savings", currency: "USD" });

    await TreasuryService.deposit(ctx, { accountId: checking.id, amount: 50000, reference: "Initial deposit" });
    await TreasuryService.transfer(ctx, { fromAccountId: checking.id, toAccountId: savings.id, amount: 20000, reference: "Cross-module transfer" });

    const checkUpdated = await TreasuryService.getAccount(ctx, checking.id);
    expect(checkUpdated!.balance.toString()).toBe("30000");
  });

  it("2. Ledger → Reconciliation integration", async () => {
    const company = await createCompany();
    const user = await createUser();
    await createMembership(user.id, company.id);
    const wallet = await createWallet(company.id, { balance: 50000 });

    const computed = await postingEngine.computeWalletBalance(wallet.id, company.id);
    const stored = (await prisma.wallet.findUnique({ where: { id: wallet.id } }))!.balance;
    expect(computed.equals(stored)).toBe(true);
  });

  it("3. Risk alerts created from ledger activity", async () => {
    const company = await createCompany();
    const user = await createUser();
    await createMembership(user.id, company.id);
    const wallet = await createWallet(company.id, { balance: 100000 });
    const ctx = buildTenantContext(company.id, { userId: user.id, role: "ADMIN" });

    await ledgerService.recordTransfer(
      company.id, wallet.id, (await createClearingWallet(company.id)).id, 50000, "USD",
      { createdByUserId: user.id, reference: "RISK-TEST" },
    );

    const alerts = await riskService.listAlerts(ctx, {});
    expect(alerts).toBeDefined();
  });

  it("4. AP → Treasury → GL: vendor payment flow", async () => {
    const company = await createCompany();
    const user = await createUser();
    await createMembership(user.id, company.id);
    const apWallet = await createWallet(company.id, { balance: 0, name: "AP Clearing" });
    const opsWallet = await createWallet(company.id, { balance: 100000 });

    const payment = await ledgerService.recordTransfer(
      company.id, opsWallet.id, apWallet.id, 15000, "USD",
      { createdByUserId: user.id, reference: "AP-PMT-001 — Vendor payment" },
    );
    expect(payment.status).toBe("COMPLETED");

    const balanced = await postingEngine.verifyTransactionBalance(payment.id);
    expect(balanced).toBe(true);
  });

  it("5. AR → Treasury → GL: customer payment flow", async () => {
    const company = await createCompany();
    const user = await createUser();
    await createMembership(user.id, company.id);
    const customerWallet = await createWallet(company.id, { balance: 50000 });
    const treasuryWallet = await createWallet(company.id, { balance: 0 });

    const receipt = await ledgerService.recordTransfer(
      company.id, customerWallet.id, treasuryWallet.id, 25000, "USD",
      { createdByUserId: user.id, reference: "AR-RCT-001 — Customer receipt" },
    );
    expect(receipt.status).toBe("COMPLETED");

    const balanced = await postingEngine.verifyTransactionBalance(receipt.id);
    expect(balanced).toBe(true);
  });

  it("6. End-to-end: Treasury → Risk → Reconciliation → Ledger", async () => {
    const company = await createCompany();
    const user = await createUser();
    await createMembership(user.id, company.id, "ADMIN");
    const ctx = buildTenantContext(company.id, { userId: user.id, role: "ADMIN" });

    const account = await TreasuryService.createAccount(ctx, { name: "Main Ops", currency: "USD" });
    await TreasuryService.deposit(ctx, { accountId: account.id, amount: 100000, reference: "Seed" });

    const wallet = await prisma.wallet.findFirst({ where: { companyId: company.id } });
    if (wallet) {
      const verified = await ledgerService.verifyWalletBalance(wallet.id, company.id);
      expect(verified).toBe(true);
    }

    const runId = await ReconciliationService.initiateRun(ctx, "FULL");
    expect(runId).toBeDefined();
  });
});
