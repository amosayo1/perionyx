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

describe("Tax Workflow", () => {
  it("1. records taxable transaction with VAT tracking", async () => {
    const company = await createCompany();
    const user = await createUser();
    await createMembership(user.id, company.id);
    const opsWallet = await createWallet(company.id, { balance: 100000 });
    const taxWallet = await createWallet(company.id, { balance: 0, name: "VAT Output" });
    const expenseWallet = await createWallet(company.id, { balance: 0, name: "Expense" });

    const netAmount = 10000;
    const vatRate = 0.15;
    const vatAmount = Math.round(netAmount * vatRate);

    await postingEngine.postBatch({
      transactionId: `tax-txn-${Date.now()}`,
      companyId: company.id,
      currency: "USD",
      postings: [
        { walletId: opsWallet.id, side: "DEBIT", amount: netAmount + vatAmount, sequence: 0 },
        { walletId: expenseWallet.id, side: "CREDIT", amount: netAmount, sequence: 1 },
        { walletId: taxWallet.id, side: "CREDIT", amount: vatAmount, sequence: 2 },
      ],
    });

    const opsUpdated = await prisma.wallet.findUnique({ where: { id: opsWallet.id } });
    const taxUpdated = await prisma.wallet.findUnique({ where: { id: taxWallet.id } });
    expect(opsUpdated!.balance.toString()).toBe(String(100000 - netAmount - vatAmount));
    expect(taxUpdated!.balance.toString()).toBe(String(vatAmount));
  });

  it("2. tracks tax liability wallet balance", async () => {
    const company = await createCompany();
    const user = await createUser();
    await createMembership(user.id, company.id);
    const opsWallet = await createWallet(company.id, { balance: 200000 });
    const taxWallet = await createWallet(company.id, { balance: 0, name: "VAT Liability" });
    const incomeWallet = await createWallet(company.id, { balance: 0, name: "Revenue" });

    const txns = [
      { net: 25000, vat: 3750 },
      { net: 18000, vat: 2700 },
      { net: 32000, vat: 4800 },
    ];

    for (const t of txns) {
      await postingEngine.postBatch({
        transactionId: `tax-liability-${Date.now()}-${t.net}`,
        companyId: company.id,
        currency: "USD",
        postings: [
          { walletId: opsWallet.id, side: "DEBIT", amount: t.net + t.vat, sequence: 0 },
          { walletId: incomeWallet.id, side: "CREDIT", amount: t.net, sequence: 1 },
          { walletId: taxWallet.id, side: "CREDIT", amount: t.vat, sequence: 2 },
        ],
      });
    }

    const taxUpdated = await prisma.wallet.findUnique({ where: { id: taxWallet.id } });
    expect(taxUpdated!.balance.toString()).toBe(String(3750 + 2700 + 4800));
  });

  it("3. records tax payment to authority", async () => {
    const company = await createCompany();
    const user = await createUser();
    await createMembership(user.id, company.id);
    const opsWallet = await createWallet(company.id, { balance: 100000 });
    const taxWallet = await createWallet(company.id, { balance: 5000, name: "VAT Payable" });

    const payment = await ledgerService.recordTransfer(
      company.id, taxWallet.id, opsWallet.id, 5000, "USD",
      { createdByUserId: user.id, reference: "TAX-PMT-001 — VAT payment" },
    );
    expect(payment.status).toBe("COMPLETED");

    const taxUpdated = await prisma.wallet.findUnique({ where: { id: taxWallet.id } });
    expect(taxUpdated!.balance.toString()).toBe("0");
  });

  it("4. validates all tax transactions are balanced", async () => {
    const company = await createCompany();
    const user = await createUser();
    await createMembership(user.id, company.id);
    const opsWallet = await createWallet(company.id, { balance: 500000 });
    const taxWallet = await createWallet(company.id, { balance: 0, name: "Tax Pool" });

    const batchId = `tax-batch-${Date.now()}`;
    await postingEngine.postBatch({
      transactionId: batchId,
      companyId: company.id,
      currency: "USD",
      postings: [
        { walletId: opsWallet.id, side: "DEBIT", amount: 11500, sequence: 0 },
        { walletId: taxWallet.id, side: "CREDIT", amount: 1500, sequence: 1 },
        { walletId: opsWallet.id, side: "CREDIT", amount: 10000, sequence: 2 },
      ],
    });

    const balanced = await postingEngine.verifyTransactionBalance(batchId);
    expect(balanced).toBe(true);
  });
});
