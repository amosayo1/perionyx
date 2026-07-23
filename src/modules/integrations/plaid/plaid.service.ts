import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { recordAudit } from "@/modules/audit";
import { notificationService, NotificationService } from "@/modules/notifications";
import { encrypt, decrypt } from "@/server/security/encryption";
import { isSimulated } from "@/modules/sandbox/simulation-flag";
import { FinancialTransactionManager, RowLockManager } from "@/lib/financial-transaction";

const plaidTxManager = new FinancialTransactionManager();
const plaidLockManager = new RowLockManager(plaidTxManager);

// Plaid types (avoid requiring the SDK just for env var checks)
type PlaidConfig = {
  clientId: string;
  secret: string;
  env: "sandbox" | "development" | "production";
};

function getPlaidConfig(): PlaidConfig | null {
  const clientId = process.env.PLAID_CLIENT_ID;
  const secret = process.env.PLAID_SECRET;
  if (!clientId || !secret) return null;
  return {
    clientId,
    secret,
    env: (process.env.PLAID_ENV as PlaidConfig["env"]) ?? "sandbox",
  };
}

async function getPlaidClient() {
  const config = getPlaidConfig();
  if (!config) return null;
  const { PlaidApi, PlaidEnvironments, Configuration } = await import("plaid");
  const client = new PlaidApi(
    new Configuration({
      basePath: PlaidEnvironments[config.env],
      baseOptions: {
        headers: {
          "PLAID-CLIENT-ID": config.clientId,
          "PLAID-SECRET": config.secret,
        },
      },
    }),
  );
  return client;
}

function getAccessToken(account: { plaidAccessToken: string | null }): string | null {
  if (!account.plaidAccessToken) return null;
  let decrypted: string | null = null;
  try { decrypted = decrypt(account.plaidAccessToken); } catch { return null; }
  return decrypted ?? account.plaidAccessToken;
}

export class PlaidService {
  static async createLinkToken(ctx: TenantContext) {
    const simulated = await isSimulated(ctx);
    if (simulated) {
      return { linkToken: "sandbox-mock-link-token", isMock: true };
    }

    const config = getPlaidConfig();
    if (!config) {
      // Demo/dev mode — return a mock token
      return { linkToken: "mock-link-token-dev-mode", isMock: true };
    }

    const client = await getPlaidClient();
    if (!client) throw new Error("Plaid client unavailable");

    const { Products, CountryCode } = await import("plaid");
    const response = await client.linkTokenCreate({
      user: { client_user_id: ctx.companyId },
      client_name: "Perionyx",
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: "en",
    });

    return { linkToken: response.data.link_token, isMock: false };
  }

  static async exchangePublicToken(ctx: TenantContext, publicToken: string, accountId: string) {
    const simulated = await isSimulated(ctx);
    if (simulated) {
      const mockAccessToken = encrypt(`sandbox-mock-access-${Date.now()}`);
      await prisma.treasuryAccount.update({
        where: { id: accountId, companyId: ctx.companyId },
        data: {
          plaidAccessToken: mockAccessToken,
          plaidAccountId: `sandbox-plaid-${Date.now()}`,
          plaidItemId: `sandbox-item-${Date.now()}`,
          lastSyncedAt: new Date(),
        },
      });

      await recordAudit(prisma, {
        companyId: ctx.companyId, actorUserId: ctx.userId,
        action: "PLAID_ACCOUNT_LINKED", resourceType: "TreasuryAccount", resourceId: accountId,
        metadata: { mode: "sandbox-simulated" },
      });

      return { success: true, mode: "sandbox-simulated", accountName: "Simulated Bank Account" };
    }

    const config = getPlaidConfig();
    if (!config) {
      // Demo/dev mode — simulate exchange
      const mockAccessToken = encrypt(`mock-access-${Date.now()}`);
      await prisma.treasuryAccount.update({
        where: { id: accountId, companyId: ctx.companyId },
        data: {
          plaidAccessToken: mockAccessToken,
          plaidAccountId: `mock-plaid-account-${Date.now()}`,
          plaidItemId: `mock-item-${Date.now()}`,
          lastSyncedAt: new Date(),
        },
      });

      await recordAudit(prisma, {
        companyId: ctx.companyId, actorUserId: ctx.userId,
        action: "PLAID_ACCOUNT_LINKED", resourceType: "TreasuryAccount", resourceId: accountId,
        metadata: { mode: "mock" },
      });

      return { success: true, mode: "mock" };
    }

    const client = await getPlaidClient();
    if (!client) throw new Error("Plaid client unavailable");

    const exchangeRes = await client.itemPublicTokenExchange({ public_token: publicToken });
    const accessToken = exchangeRes.data.access_token;
    const itemId = exchangeRes.data.item_id;

    // Get account details
    const accountsRes = await client.accountsGet({ access_token: accessToken });
    const plaidAccount = accountsRes.data.accounts[0];

    await prisma.treasuryAccount.update({
      where: { id: accountId, companyId: ctx.companyId },
      data: {
        plaidAccessToken: encrypt(accessToken),
        plaidAccountId: plaidAccount?.account_id,
        plaidItemId: itemId,
        lastSyncedAt: new Date(),
        accountNumber: plaidAccount?.mask ? `****${plaidAccount.mask}` : undefined,
        balance: plaidAccount?.balances?.current ?? 0,
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId, actorUserId: ctx.userId,
      action: "PLAID_ACCOUNT_LINKED", resourceType: "TreasuryAccount", resourceId: accountId,
      metadata: { plaidAccountId: plaidAccount?.account_id, itemId },
    });

    await notificationService.broadcast({
      companyId: ctx.companyId, eventType: "PLAID_ACCOUNT_LINKED",
      title: "Bank account linked",
      message: plaidAccount?.name ?? "Bank account connected via Plaid",
      link: `/accounts/${accountId}`, metadata: { plaidAccountId: plaidAccount?.account_id },
    });

    return { success: true, accountName: plaidAccount?.name, balance: plaidAccount?.balances?.current };
  }

  static async syncTransactions(ctx: TenantContext, accountId: string) {
    const account = await prisma.treasuryAccount.findFirst({
      where: { id: accountId, companyId: ctx.companyId },
    });
    if (!account) throw new Error("Account not found");

    const accessToken = getAccessToken(account);
    if (!accessToken) {
      throw new Error("Account not linked to Plaid");
    }

    const config = getPlaidConfig();
    if (!config || accessToken.startsWith("mock-")) {
      // Mock sync for demo
      return { syncedCount: 0, mode: "mock", message: "No real Plaid credentials configured" };
    }

    const client = await getPlaidClient();
    if (!client) throw new Error("Plaid client unavailable");

    const now = new Date();
    const startDate = account.lastSyncedAt
      ? new Date(account.lastSyncedAt.getTime() - 86400000).toISOString().split("T")[0]
      : new Date(now.getTime() - 30 * 86400000).toISOString().split("T")[0];
    const endDate = now.toISOString().split("T")[0];

    const response = await client.transactionsSync({
      access_token: accessToken,
    });

    const added = response.data.added;
    const modified = response.data.modified;

    // Get latest balance (external API call — outside lock)
    const balanceRes = await client.accountsBalanceGet({
      access_token: accessToken,
      options: { account_ids: account.plaidAccountId ? [account.plaidAccountId] : undefined },
    });

    const currentBalance: number | undefined = balanceRes.data.accounts[0]?.balances?.current ?? undefined;

    return plaidLockManager.withLocks(
      [{ entity: "TreasuryAccount", id: accountId }],
      async (tx) => {
        const acct = await tx.treasuryAccount.findFirst({
          where: { id: accountId, companyId: ctx.companyId },
        });
        if (!acct) throw new Error("Account not found");

        await tx.treasuryAccount.update({
          where: { id: accountId },
          data: { lastSyncedAt: new Date() },
        });

        if (currentBalance !== undefined) {
          await tx.treasuryAccount.update({
            where: { id: accountId },
            data: { balance: currentBalance },
          });
        }

        await recordAudit(tx, {
          companyId: ctx.companyId, actorUserId: ctx.userId,
          action: "PLAID_TRANSACTIONS_SYNCED", resourceType: "TreasuryAccount", resourceId: accountId,
          metadata: { added: added.length, modified: modified.length, newBalance: currentBalance },
        });

        return {
          syncedCount: added.length + modified.length,
          addedCount: added.length,
          modifiedCount: modified.length,
          balance: currentBalance ?? null,
        };
      },
    );
  }

  static async syncBalance(ctx: TenantContext, accountId: string) {
    const account = await prisma.treasuryAccount.findFirst({
      where: { id: accountId, companyId: ctx.companyId },
    });
    if (!account) throw new Error("Account not found");

    const accessToken = getAccessToken(account);
    if (!accessToken) {
      throw new Error("Account not linked to Plaid");
    }

    const config = getPlaidConfig();
    if (!config || accessToken.startsWith("mock-")) {
      // Simulate balance sync with random fluctuation for demo
      const fluctuation = (Math.random() - 0.5) * 1000;
      const newBalance = Math.max(0, Number(account.balance) + fluctuation);
      const rounded = Math.round(newBalance * 100) / 100;

      return plaidLockManager.withLocks(
        [{ entity: "TreasuryAccount", id: accountId }],
        async (tx) => {
          const acct = await tx.treasuryAccount.findFirst({
            where: { id: accountId, companyId: ctx.companyId },
          });
          if (!acct) throw new Error("Account not found");

          await tx.treasuryAccount.update({
            where: { id: accountId },
            data: { balance: rounded, lastSyncedAt: new Date() },
          });

          await recordAudit(tx, {
            companyId: ctx.companyId, actorUserId: ctx.userId,
            action: "PLAID_BALANCE_SYNCED", resourceType: "TreasuryAccount", resourceId: accountId,
            metadata: { previousBalance: acct.balance.toString(), newBalance: rounded, mode: "mock" },
          });

          return { previousBalance: acct.balance.toString(), newBalance: String(rounded) };
        },
      );
    }

    const client = await getPlaidClient();
    if (!client) throw new Error("Plaid client unavailable");

    const balanceRes = await client.accountsBalanceGet({
      access_token: accessToken,
      options: { account_ids: account.plaidAccountId ? [account.plaidAccountId] : undefined },
    });

    const newBalance: number | undefined = balanceRes.data.accounts[0]?.balances?.current ?? undefined;

    return plaidLockManager.withLocks(
      [{ entity: "TreasuryAccount", id: accountId }],
      async (tx) => {
        const acct = await tx.treasuryAccount.findFirst({
          where: { id: accountId, companyId: ctx.companyId },
        });
        if (!acct) throw new Error("Account not found");

        const previousBalance = acct.balance.toString();

        if (newBalance !== undefined) {
          await tx.treasuryAccount.update({
            where: { id: accountId },
            data: { balance: newBalance, lastSyncedAt: new Date() },
          });

          await recordAudit(tx, {
            companyId: ctx.companyId, actorUserId: ctx.userId,
            action: "PLAID_BALANCE_SYNCED", resourceType: "TreasuryAccount", resourceId: accountId,
            metadata: { previousBalance, newBalance },
          });
        }

        return { previousBalance, newBalance: String(newBalance ?? previousBalance) };
      },
    );
  }

  static async getLinkedAccounts(ctx: TenantContext) {
    const accounts = await prisma.treasuryAccount.findMany({
      where: { companyId: ctx.companyId, plaidAccessToken: { not: null } },
      select: {
        id: true, name: true, plaidAccountId: true, plaidItemId: true, lastSyncedAt: true,
        balance: true, currency: true, accountNumber: true,
      },
    });

    return accounts.map((a) => ({
      id: a.id,
      name: a.name,
      plaidAccountId: a.plaidAccountId,
      plaidItemId: a.plaidItemId,
      lastSyncedAt: a.lastSyncedAt?.toISOString() ?? null,
      balance: a.balance.toString(),
      currency: a.currency,
      accountNumber: a.accountNumber,
    }));
  }

  static async connectNewAccount(ctx: TenantContext, publicToken: string) {
    const simulated = await isSimulated(ctx);
    if (simulated) {
      const mockAccessToken = encrypt(`sandbox-mock-access-${Date.now()}`);
      const account = await prisma.treasuryAccount.create({
        data: {
          companyId: ctx.companyId,
          name: "Simulated Bank Account",
          currency: "USD",
          balance: 500000,
          plaidAccessToken: mockAccessToken,
          plaidAccountId: `sandbox-plaid-${Date.now()}`,
          plaidItemId: `sandbox-item-${Date.now()}`,
          lastSyncedAt: new Date(),
          accountNumber: "****1234",
        },
      });
      await recordAudit(prisma, {
        companyId: ctx.companyId, actorUserId: ctx.userId,
        action: "PLAID_ACCOUNT_LINKED", resourceType: "TreasuryAccount", resourceId: account.id,
        metadata: { mode: "sandbox-simulated", newAccount: true },
      });
      return { success: true, mode: "sandbox-simulated", accountId: account.id, accountName: account.name };
    }

    const config = getPlaidConfig();
    if (!config) {
      const mockAccessToken = encrypt(`mock-access-${Date.now()}`);
      const account = await prisma.treasuryAccount.create({
        data: {
          companyId: ctx.companyId,
          name: "Connected Bank Account",
          currency: "USD",
          balance: 250000,
          plaidAccessToken: mockAccessToken,
          plaidAccountId: `mock-plaid-account-${Date.now()}`,
          plaidItemId: `mock-item-${Date.now()}`,
          lastSyncedAt: new Date(),
          accountNumber: "****5678",
        },
      });
      await recordAudit(prisma, {
        companyId: ctx.companyId, actorUserId: ctx.userId,
        action: "PLAID_ACCOUNT_LINKED", resourceType: "TreasuryAccount", resourceId: account.id,
        metadata: { mode: "mock", newAccount: true },
      });
      return { success: true, mode: "mock", accountId: account.id, accountName: account.name };
    }

    const client = await getPlaidClient();
    if (!client) throw new Error("Plaid client unavailable");

    const exchangeRes = await client.itemPublicTokenExchange({ public_token: publicToken });
    const accessToken = exchangeRes.data.access_token;
    const itemId = exchangeRes.data.item_id;

    const accountsRes = await client.accountsGet({ access_token: accessToken });
    const plaidAccount = accountsRes.data.accounts[0];
    if (!plaidAccount) throw new Error("No accounts found from Plaid");

    const currency = plaidAccount.balances?.iso_currency_code ?? "USD";
    const balance = plaidAccount.balances?.current ?? 0;
    const name = plaidAccount.official_name || plaidAccount.name || "Connected Bank Account";
    const accountNumber = plaidAccount.mask ? `****${plaidAccount.mask}` : undefined;

    const account = await prisma.treasuryAccount.create({
      data: {
        companyId: ctx.companyId,
        name,
        currency,
        balance,
        accountNumber,
        plaidAccessToken: encrypt(accessToken),
        plaidAccountId: plaidAccount.account_id,
        plaidItemId: itemId,
        lastSyncedAt: new Date(),
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId, actorUserId: ctx.userId,
      action: "PLAID_ACCOUNT_LINKED", resourceType: "TreasuryAccount", resourceId: account.id,
      metadata: { plaidAccountId: plaidAccount.account_id, itemId, newAccount: true },
    });

    await notificationService.broadcast({
      companyId: ctx.companyId, eventType: "PLAID_ACCOUNT_LINKED",
      title: "New bank account connected",
      message: `${name} linked via Plaid`,
      link: `/accounts/${account.id}`,
      metadata: { plaidAccountId: plaidAccount.account_id },
    });

    return { success: true, accountId: account.id, accountName: name, balance: String(balance) };
  }

  static async unlinkAccount(ctx: TenantContext, accountId: string) {
    const account = await prisma.treasuryAccount.findFirst({
      where: { id: accountId, companyId: ctx.companyId },
    });
    if (!account) throw new Error("Account not found");

    await prisma.treasuryAccount.update({
      where: { id: accountId },
      data: {
        plaidAccessToken: null,
        plaidAccountId: null,
        plaidItemId: null,
        lastSyncedAt: null,
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId, actorUserId: ctx.userId,
      action: "PLAID_ACCOUNT_UNLINKED", resourceType: "TreasuryAccount", resourceId: accountId,
    });

    await notificationService.broadcast({
      companyId: ctx.companyId, eventType: "PLAID_ACCOUNT_UNLINKED",
      title: "Bank account unlinked",
      message: `${account.name} has been disconnected`,
      link: `/accounts/${accountId}`,
    });

    return { success: true };
  }
}
