import "dotenv/config";
import { describe, it, expect, afterAll } from "vitest";
import { TreasuryService } from "@/modules/treasury/treasury.service";
import { createCompany, createMembership, createUser } from "../test/helpers/factories";
import { buildTenantContext, cleanup } from "../test/helpers/db";
import { ValidationError } from "@/lib/errors/app-error";

afterAll(cleanup);

async function buildRealContext(companyId: string) {
  const user = await createUser();
  await createMembership(user.id, companyId, "ADMIN");
  return buildTenantContext(companyId, { userId: user.id, role: "ADMIN" });
}

describe("TreasuryService", () => {
  describe("listAccounts", () => {
    it("returns empty list when no accounts exist", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const accounts = await TreasuryService.listAccounts(ctx);
      expect(accounts).toEqual([]);
    });

    it("returns accounts with active controls", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      await TreasuryService.createAccount(ctx, { name: "Ops Account", currency: "USD" });
      const accounts = await TreasuryService.listAccounts(ctx);
      expect(accounts).toHaveLength(1);
      expect(accounts[0].name).toBe("Ops Account");
      expect(accounts[0].controls).toEqual([]);
    });
  });

  describe("createAccount", () => {
    it("creates and audits an account", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const account = await TreasuryService.createAccount(ctx, {
        name: "Main Treasury",
        currency: "USD",
        description: "Primary operating account",
      });
      expect(account.name).toBe("Main Treasury");
      expect(account.currency).toBe("USD");
      expect(account.balance).toBe("0");
      expect(account.isActive).toBe(true);
    });

    it("rejects duplicate names", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      await TreasuryService.createAccount(ctx, { name: "Dupe" });
      await expect(
        TreasuryService.createAccount(ctx, { name: "Dupe" }),
      ).rejects.toThrow(ValidationError);
    });

    it("defaults to USD currency", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const account = await TreasuryService.createAccount(ctx, { name: "No Currency" });
      expect(account.currency).toBe("USD");
    });
  });

  describe("getAccount", () => {
    it("returns null for missing account", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const result = await TreasuryService.getAccount(ctx, "nonexistent");
      expect(result).toBeNull();
    });

    it("returns account with recent transfers", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const a1 = await TreasuryService.createAccount(ctx, { name: "A" });
      const a2 = await TreasuryService.createAccount(ctx, { name: "B" });
      await TreasuryService.transfer(ctx, { fromAccountId: a1.id, toAccountId: a2.id, amount: 50 });
      const result = await TreasuryService.getAccount(ctx, a1.id);
      expect(result).not.toBeNull();
      expect(result!.recentTransfers).toHaveLength(1);
      expect(result!.recentTransfers[0].amount).toBe("50");
    });
  });

  describe("addControl", () => {
    it("adds a control to an account", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const account = await TreasuryService.createAccount(ctx, { name: "Controlled" });
      const control = await TreasuryService.addControl(ctx, account.id, {
        type: "SPENDING_LIMIT", scope: "DAILY", value: 10000, description: "Daily cap",
      });
      expect(control.type).toBe("SPENDING_LIMIT");
      expect(control.value).toBe("10000");
    });

    it("rejects control on missing account", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      await expect(
        TreasuryService.addControl(ctx, "bad-id", { type: "BLOCK", scope: "ALL", value: 0 }),
      ).rejects.toThrow(ValidationError);
    });

    it("includes control in account details", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const account = await TreasuryService.createAccount(ctx, { name: "Controlled2" });
      await TreasuryService.addControl(ctx, account.id, { type: "SPENDING_LIMIT", scope: "MONTHLY", value: 50000 });
      const detail = await TreasuryService.getAccount(ctx, account.id);
      expect(detail!.controls).toHaveLength(1);
    });
  });

  describe("deposit", () => {
    it("increments balance and returns updated value", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const account = await TreasuryService.createAccount(ctx, { name: "Deposit Account" });
      const result = await TreasuryService.deposit(ctx, { accountId: account.id, amount: 1000 });
      expect(result.balance).toBe("1000");

      const detail = await TreasuryService.getAccount(ctx, account.id);
      expect(detail!.balance).toBe("1000");
    });

    it("rejects zero or negative amount", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const account = await TreasuryService.createAccount(ctx, { name: "No Negatives" });
      await expect(
        TreasuryService.deposit(ctx, { accountId: account.id, amount: 0 }),
      ).rejects.toThrow(ValidationError);
      await expect(
        TreasuryService.deposit(ctx, { accountId: account.id, amount: -50 }),
      ).rejects.toThrow(ValidationError);
    });

    it("rejects deposit to missing account", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      await expect(
        TreasuryService.deposit(ctx, { accountId: "bad", amount: 100 }),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("transfer", () => {
    it("transfers between two accounts", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const from = await TreasuryService.createAccount(ctx, { name: "Source" });
      const to = await TreasuryService.createAccount(ctx, { name: "Dest" });
      await TreasuryService.deposit(ctx, { accountId: from.id, amount: 500 });

      const result = await TreasuryService.transfer(ctx, {
        fromAccountId: from.id, toAccountId: to.id, amount: 200, reference: "test transfer",
      });
      expect(result.status).toBe("COMPLETED");
      expect(result.amount).toBe("200");
      expect(result.reference).toBe("test transfer");

      const fromDetail = await TreasuryService.getAccount(ctx, from.id);
      const toDetail = await TreasuryService.getAccount(ctx, to.id);
      expect(fromDetail!.balance).toBe("300");
      expect(toDetail!.balance).toBe("200");
    });

    it("rejects same-account transfer", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const account = await TreasuryService.createAccount(ctx, { name: "Lonely" });
      await expect(
        TreasuryService.transfer(ctx, { fromAccountId: account.id, toAccountId: account.id, amount: 100 }),
      ).rejects.toThrow(ValidationError);
    });

    it("rejects transfer with missing account", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const account = await TreasuryService.createAccount(ctx, { name: "Exists" });
      await expect(
        TreasuryService.transfer(ctx, { fromAccountId: account.id, toAccountId: "bad", amount: 100 }),
      ).rejects.toThrow(ValidationError);
    });

    it("rejects zero/negative amount", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const from = await TreasuryService.createAccount(ctx, { name: "F" });
      const to = await TreasuryService.createAccount(ctx, { name: "T" });
      await expect(
        TreasuryService.transfer(ctx, { fromAccountId: from.id, toAccountId: to.id, amount: 0 }),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("listTransfers", () => {
    it("returns paginated transfers with cursor", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const from = await TreasuryService.createAccount(ctx, { name: "F" });
      const to = await TreasuryService.createAccount(ctx, { name: "T" });
      await TreasuryService.deposit(ctx, { accountId: from.id, amount: 1000 });
      await TreasuryService.transfer(ctx, { fromAccountId: from.id, toAccountId: to.id, amount: 100 });
      await TreasuryService.transfer(ctx, { fromAccountId: from.id, toAccountId: to.id, amount: 200 });

      const page1 = await TreasuryService.listTransfers(ctx, 1);
      expect(page1.items).toHaveLength(1);
      expect(page1.nextCursor).toBeDefined();

      const page2 = await TreasuryService.listTransfers(ctx, 1, page1.nextCursor);
      expect(page2.items).toHaveLength(1);
      expect(page2.nextCursor).toBeUndefined();
    });
  });

  describe("getAccountHistory", () => {
    it("returns transfers with direction and counterparty", async () => {
      const company = await createCompany();
      const ctx = await buildRealContext(company.id);
      const from = await TreasuryService.createAccount(ctx, { name: "Src" });
      const to = await TreasuryService.createAccount(ctx, { name: "Dst" });
      await TreasuryService.deposit(ctx, { accountId: from.id, amount: 500 });
      await TreasuryService.transfer(ctx, { fromAccountId: from.id, toAccountId: to.id, amount: 150 });

      const fromHistory = await TreasuryService.getAccountHistory(ctx, from.id);
      expect(fromHistory).toHaveLength(1);
      expect(fromHistory[0].direction).toBe("DEBIT");
      expect(fromHistory[0].counterparty).toBe("Dst");

      const toHistory = await TreasuryService.getAccountHistory(ctx, to.id);
      expect(toHistory[0].direction).toBe("CREDIT");
      expect(toHistory[0].counterparty).toBe("Src");
    });
  });
});
