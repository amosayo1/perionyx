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

describe("Fixed Assets Workflow", () => {
  it("1. records asset acquisition via treasury", async () => {
    const company = await createCompany();
    const user = await createUser();
    await createMembership(user.id, company.id);
    const opsWallet = await createWallet(company.id, { balance: 500000 });
    const assetWallet = await createWallet(company.id, { balance: 0, name: "Fixed Asset — Equipment" });

    const txn = await ledgerService.recordTransfer(
      company.id, opsWallet.id, assetWallet.id, 75000, "USD",
      { createdByUserId: user.id, reference: "FA-ACQ-001 — Equipment acquisition" },
    );
    expect(txn.status).toBe("COMPLETED");

    const opsUpdated = await prisma.wallet.findUnique({ where: { id: opsWallet.id } });
    expect(opsUpdated!.balance.toString()).toBe("425000");
  });

  it("2. capitalizes asset and creates ledger entries", async () => {
    const company = await createCompany();
    const user = await createUser();
    await createMembership(user.id, company.id);
    const opsWallet = await createWallet(company.id, { balance: 1000000 });
    const fixedAssetWallet = await createWallet(company.id, { balance: 0, name: "Capital Asset — Building" });

    const txn = await ledgerService.recordTransfer(
      company.id, opsWallet.id, fixedAssetWallet.id, 500000, "USD",
      { createdByUserId: user.id, reference: "FA-CAP-001 — Building capitalization" },
    );
    expect(txn.status).toBe("COMPLETED");

    const balanced = await postingEngine.verifyTransactionBalance(txn.id);
    expect(balanced).toBe(true);

    const entries = await prisma.ledgerEntry.findMany({
      where: { transactionId: txn.id },
      orderBy: { sequence: "asc" },
    });
    expect(entries.length).toBeGreaterThanOrEqual(2);
  });

  it("3. validates asset lifecycle via balance tracking", async () => {
    const company = await createCompany();
    const user = await createUser();
    await createMembership(user.id, company.id);
    const assetWallet = await createWallet(company.id, { balance: 100000, name: "Asset — Vehicle" });

    const computed = await postingEngine.computeWalletBalance(assetWallet.id, company.id);
    expect(computed.equals(new Prisma.Decimal(100000))).toBe(true);
  });

  it("4. records asset disposal", async () => {
    const company = await createCompany();
    const user = await createUser();
    await createMembership(user.id, company.id);
    const opsWallet = await createWallet(company.id, { balance: 500000 });
    const assetWallet = await createWallet(company.id, { balance: 50000, name: "Asset — Old Equipment" });

    const disposal = await ledgerService.recordTransfer(
      company.id, assetWallet.id, opsWallet.id, 50000, "USD",
      { createdByUserId: user.id, reference: "FA-DISP-001 — Equipment disposal" },
    );
    expect(disposal.status).toBe("COMPLETED");

    const assetUpdated = await prisma.wallet.findUnique({ where: { id: assetWallet.id } });
    expect(assetUpdated!.balance.toString()).toBe("0");
  });

  it("5. all asset transactions have balanced ledgers", async () => {
    const company = await createCompany();
    const user = await createUser();
    await createMembership(user.id, company.id);
    const wallets = await Promise.all([
      createWallet(company.id, { balance: 1000000 }),
      createWallet(company.id, { balance: 0, name: "Asset Pool" }),
      createClearingWallet(company.id),
    ]);

    const txns = [];
    for (let i = 0; i < 3; i++) {
      const txn = await ledgerService.recordTransfer(
        company.id, wallets[0].id, wallets[1].id, 25000 * (i + 1), "USD",
        { createdByUserId: user.id, reference: `FA-BAL-00${i + 1}` },
      );
      txns.push(txn);
    }

    for (const txn of txns) {
      const balanced = await postingEngine.verifyTransactionBalance(txn.id);
      expect(balanced).toBe(true);
    }
  });
});
