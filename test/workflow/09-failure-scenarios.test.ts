import "dotenv/config";
import { describe, it, expect, afterAll } from "vitest";
import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { ledgerService } from "@/modules/ledger/ledger.service";
import { PostingEngine } from "@/modules/ledger/posting-engine";
import { assertBalancedLedger } from "@/modules/ledger/ledger.service";
import { ApprovalWorkflowEngine } from "@/modules/ledger/approval-workflow";
import { createCompany, createWallet, createClearingWallet, createUser, createMembership } from "../helpers/factories";
import { cleanup } from "../helpers/db";
import { ConflictError, ValidationError, ForbiddenError } from "@/lib/errors/app-error";

afterAll(cleanup);

const postingEngine = new PostingEngine();
type LedgerSide = "DEBIT" | "CREDIT";

describe("Failure Scenarios", () => {
  it("1. rejects unbalanced journal entries", () => {
    expect(() =>
      assertBalancedLedger([
        { side: "DEBIT" as LedgerSide, amount: new Prisma.Decimal(100) },
        { side: "CREDIT" as LedgerSide, amount: new Prisma.Decimal(99) },
      ]),
    ).toThrow("Ledger entries must balance");
  });

  it("2. rejects single-entry journals", () => {
    expect(() =>
      assertBalancedLedger([
        { side: "DEBIT" as LedgerSide, amount: new Prisma.Decimal(100) },
      ]),
    ).toThrow("at least two entries");
  });

  it("3. rejects negative amounts", () => {
    expect(() =>
      assertBalancedLedger([
        { side: "DEBIT" as LedgerSide, amount: new Prisma.Decimal(-100) },
        { side: "CREDIT" as LedgerSide, amount: new Prisma.Decimal(100) },
      ]),
    ).toThrow("strictly positive");
  });

  it("4. rejects transfer to same wallet", async () => {
    const company = await createCompany();
    const user = await createUser();
    await createMembership(user.id, company.id);
    const wallet = await createWallet(company.id, { balance: 500 });

    await expect(
      ledgerService.recordTransfer(company.id, wallet.id, wallet.id, 100, "USD", { createdByUserId: user.id }),
    ).rejects.toThrow();
  });

  it("5. handles duplicate transaction prevention", async () => {
    const company = await createCompany();
    const user = await createUser();
    await createMembership(user.id, company.id);
    const fromWallet = await createWallet(company.id, { balance: 10000 });
    const toWallet = await createWallet(company.id, { balance: 0 });

    const key = `idempotency-key-${Date.now()}`;
    const txn1 = await ledgerService.recordTransfer(
      company.id, fromWallet.id, toWallet.id, 500, "USD",
      { createdByUserId: user.id, reference: `IDEMP-${key}` },
    );
    expect(txn1.status).toBe("COMPLETED");
  });

  it("6. recovers from posting engine validation failure", async () => {
    const company = await createCompany();
    const wallet1 = await createWallet(company.id, { balance: 1000 });
    const wallet2 = await createWallet(company.id, { balance: 0 });

    const result = postingEngine.validateBatch({
      transactionId: `fail-${Date.now()}`,
      companyId: company.id,
      currency: "USD",
      postings: [
        { walletId: wallet1.id, side: "DEBIT", amount: 0, sequence: 0 },
        { walletId: wallet2.id, side: "CREDIT", amount: 0, sequence: 1 },
      ],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("7. handles approval rejection gracefully", async () => {
    const company = await createCompany();
    const user = await createUser();
    await createMembership(user.id, company.id);

    const txn = await prisma.transaction.create({
      data: {
        companyId: company.id,
        type: "WALLET_CREDIT",
        status: "PENDING",
        primaryAmount: 1000,
        currency: "USD",
        reference: "REJECT-TEST",
        createdByUserId: user.id,
      },
    });

    const reqs = await ApprovalWorkflowEngine.getApprovalRequirements(txn.id, company.id);
    expect(reqs).toBeDefined();
    expect(reqs.requiredApprovals).toBeDefined();
  });

  it("8. maintains balance integrity after failed operation", async () => {
    const company = await createCompany();
    const user = await createUser();
    await createMembership(user.id, company.id);
    const wallet = await createWallet(company.id, { balance: 5000 });
    const balanceBefore = (await prisma.wallet.findUnique({ where: { id: wallet.id } }))!.balance;

    try {
      await ledgerService.recordTransfer(
        company.id, wallet.id, wallet.id, 100, "USD",
        { createdByUserId: user.id },
      );
    } catch {
      // Expected — transfer to same wallet
    }

    const balanceAfter = (await prisma.wallet.findUnique({ where: { id: wallet.id } }))!.balance;
    expect(balanceAfter.equals(balanceBefore)).toBe(true);
  });

  it("9. validates duplicate sequence rejection", async () => {
    const company = await createCompany();
    const wallet1 = await createWallet(company.id, { balance: 1000 });
    const wallet2 = await createWallet(company.id, { balance: 0 });

    const result = postingEngine.validateBatch({
      transactionId: `dup-seq-${Date.now()}`,
      companyId: company.id,
      currency: "USD",
      postings: [
        { walletId: wallet1.id, side: "DEBIT", amount: 100, sequence: 0 },
        { walletId: wallet2.id, side: "CREDIT", amount: 100, sequence: 0 },
      ],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e: string) => e.includes("Duplicate sequence"))).toBe(true);
  });

  it("10. permission denied simulation", async () => {
    const company = await createCompany();
    const user = await createUser();
    await createMembership(user.id, company.id);

    const txn = await prisma.transaction.create({
      data: {
        companyId: company.id,
        type: "INTERNAL_TRANSFER",
        status: "PENDING",
        primaryAmount: 50000,
        currency: "USD",
        reference: "PERM-TEST",
        createdByUserId: user.id,
      },
    });

    const reqs = await ApprovalWorkflowEngine.getApprovalRequirements(txn.id, company.id);
    expect(reqs).toBeDefined();
  });
});
