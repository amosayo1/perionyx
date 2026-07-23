import type { IConnector, ConnectorAuthConfig, ConnectorSyncOptions } from "../interface";
import type {
  ConnectorKind,
  ConnectorAuthMethod,
  ConnectorCapability,
  ConnectorConfigRecord,
  ConnectorHealth,
  ConnectorSyncResult,
} from "../types";
import { encrypt, decrypt } from "@/server/security/encryption";
import { PlaidBankingService } from "../services/plaid-banking.service";
import { FinancialNormalizer } from "@/modules/financial-mapping";

type PlaidClient = Awaited<ReturnType<typeof createPlaidClient>>;

async function createPlaidClient() {
  const clientId = process.env.PLAID_CLIENT_ID;
  const secret = process.env.PLAID_SECRET;
  if (!clientId || !secret) return null;
  const env = (process.env.PLAID_ENV ?? "sandbox") as "sandbox" | "development" | "production";
  const { PlaidApi, PlaidEnvironments, Configuration } = await import("plaid");
  return new PlaidApi(
    new Configuration({
      basePath: PlaidEnvironments[env],
      baseOptions: {
        headers: {
          "PLAID-CLIENT-ID": clientId,
          "PLAID-SECRET": secret,
        },
      },
    }),
  );
}

export class PlaidConnector implements IConnector {
  readonly kind: ConnectorKind = "plaid";
  readonly label = "Plaid";
  readonly description = "Bank account connectivity via Plaid";
  readonly capabilities: ConnectorCapability[] = [
    "import-data",
    "webhooks",
    "oauth",
    "scheduled-sync",
    "manual-sync",
    "health-check",
  ];
  readonly supportedAuthMethods: ConnectorAuthMethod[] = ["oauth2"];

  private config: ConnectorConfigRecord | null = null;
  private client: PlaidClient = null;
  private service: PlaidBankingService = new PlaidBankingService();

  async initialize(config: ConnectorConfigRecord): Promise<void> {
    this.config = config;
    this.client = await createPlaidClient();
  }

  async validateConfig(): Promise<{ ok: boolean; errors: string[] }> {
    const errors: string[] = [];
    if (!this.config) {
      errors.push("Connector not initialized");
      return { ok: false, errors };
    }
    if (!process.env.PLAID_CLIENT_ID) errors.push("PLAID_CLIENT_ID env var not set");
    if (!process.env.PLAID_SECRET) errors.push("PLAID_SECRET env var not set");
    if (!this.client) errors.push("Failed to create Plaid API client");
    return { ok: errors.length === 0, errors };
  }

  async authenticate(auth: ConnectorAuthConfig): Promise<{ ok: boolean; message?: string }> {
    if (!this.config || !this.client) {
      return { ok: false, message: "Connector not initialized" };
    }
    try {
      const publicToken = auth.credentials.publicToken;
      if (!publicToken) {
        return { ok: false, message: "No publicToken provided in auth credentials" };
      }
      const { Products, CountryCode } = await import("plaid");
      const exchangeRes = await this.client.itemPublicTokenExchange({ public_token: publicToken });
      const accessToken = exchangeRes.data.access_token;
      const itemId = exchangeRes.data.item_id;

      const accountsRes = await this.client.accountsGet({ access_token: accessToken });

      const encryptedToken = encrypt(accessToken);
      const configData = (this.config.config ?? {}) as Record<string, unknown>;
      configData.accessToken = encryptedToken;
      configData.itemId = itemId;

      this.config = { ...this.config, config: configData };

      const { PrismaClient } = await import("@prisma/client");
      const { prisma } = await import("@/server/db/prisma");
      const { ConflictError } = await import("@/lib/errors/app-error");
      const plaidCurrent = await prisma.connectorConfig.findUnique({
        where: { id: this.config.id },
        select: { version: true },
      });
      if (!plaidCurrent) throw new Error("Connector config not found");
      const plaidResult = await prisma.connectorConfig.updateMany({
        where: { id: this.config.id, version: plaidCurrent.version },
        data: { config: configData as any, version: { increment: 1 } },
      });
      if (plaidResult.count === 0) throw new ConflictError("Concurrent modification detected");

      const companyId = this.config.companyId;
      for (const plaidAccount of accountsRes.data.accounts) {
        const normalized = FinancialNormalizer.normalizeExternalAccount("plaid", {
          ...plaidAccount,
          institution_name: "",
          institution_id: itemId,
        });
        await this.service.createExternalAccount(companyId, {
          ...normalized,
          itemId,
        });
      }

      return { ok: true, message: `Plaid connected — ${accountsRes.data.accounts.length} account(s) linked` };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { ok: false, message: `Plaid authentication failed: ${message}` };
    }
  }

  async connect(): Promise<ConnectorHealth> {
    if (!this.config || !this.client) {
      return { status: "UNKNOWN", lastCheckAt: null, message: "Not initialized" };
    }
    try {
      const accessToken = this.getDecryptedAccessToken();
      if (!accessToken) {
        return { status: "WARNING", lastCheckAt: new Date().toISOString(), message: "No access token — authenticate first" };
      }
      const response = await this.client.accountsGet({ access_token: accessToken });
      return {
        status: "GOOD",
        lastCheckAt: new Date().toISOString(),
        message: `Connected — ${response.data.accounts.length} account(s) found`,
        latencyMs: 0,
      };
    } catch (err: unknown) {
      return {
        status: "CRITICAL",
        lastCheckAt: new Date().toISOString(),
        message: err instanceof Error ? err.message : String(err),
      };
    }
  }

  async disconnect(): Promise<void> {
    if (!this.config) return;
    try {
      const accessToken = this.getDecryptedAccessToken();
      if (accessToken && this.client) {
        await this.client.itemRemove({ access_token: accessToken });
      }
    } catch {
      // best-effort removal
    }
    const configData = (this.config.config ?? {}) as Record<string, unknown>;
    delete configData.accessToken;
    delete configData.itemId;
    this.config = { ...this.config, config: configData };
    this.client = null;
  }

  async healthCheck(): Promise<ConnectorHealth> {
    if (!this.client) {
      return { status: "WARNING", lastCheckAt: new Date().toISOString(), message: "Plaid API credentials not configured" };
    }
    try {
      const start = Date.now();
      const { CountryCode } = await import("plaid");
      const response = await this.client.institutionsGet({
        count: 1,
        offset: 0,
        country_codes: [CountryCode.Us],
      });
      const latencyMs = Date.now() - start;
      return {
        status: response.data.institutions.length > 0 ? "GOOD" : "WARNING",
        lastCheckAt: new Date().toISOString(),
        message: `Plaid API reachable — ${response.data.total} institutions available`,
        latencyMs,
      };
    } catch (err: unknown) {
      return {
        status: "CRITICAL",
        lastCheckAt: new Date().toISOString(),
        message: err instanceof Error ? err.message : String(err),
      };
    }
  }

  async syncData(options?: ConnectorSyncOptions): Promise<ConnectorSyncResult> {
    const startedAt = new Date().toISOString();
    if (!this.config || !this.client) {
      return {
        success: false, recordsProcessed: 0, recordsCreated: 0, recordsUpdated: 0,
        recordsFailed: 0, errors: ["Not initialized"], startedAt,
        completedAt: new Date().toISOString(),
      };
    }
    const companyId = this.config.companyId;
    const connectorId = this.config.id;
    const errors: string[] = [];
    let totalCreated = 0;
    let totalUpdated = 0;
    let totalFailed = 0;

    try {
      const accounts = await this.service.getExternalAccounts(companyId);
      if (accounts.length === 0) {
        return {
          success: true, recordsProcessed: 0, recordsCreated: 0, recordsUpdated: 0,
          recordsFailed: 0, errors: [], startedAt, completedAt: new Date().toISOString(),
        };
      }

      for (const account of accounts) {
        try {
          const result = await this.syncSingleAccount(companyId, connectorId, account);
          totalCreated += result.created;
          totalUpdated += result.updated;
          totalFailed += result.failed;
          if (result.error) errors.push(`Account ${account.name}: ${result.error}`);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          errors.push(`Account ${account.name}: ${msg}`);
          totalFailed++;
        }
      }

      await this.service.updateConnectionStatus(companyId, connectorId, "active");

      return {
        success: errors.length < accounts.length,
        recordsProcessed: totalCreated + totalUpdated,
        recordsCreated: totalCreated,
        recordsUpdated: totalUpdated,
        recordsFailed: totalFailed,
        errors,
        startedAt,
        completedAt: new Date().toISOString(),
      };
    } catch (err: unknown) {
      return {
        success: false, recordsProcessed: 0, recordsCreated: 0, recordsUpdated: 0,
        recordsFailed: 0, errors: [err instanceof Error ? err.message : String(err)],
        startedAt, completedAt: new Date().toISOString(),
      };
    }
  }

  private async syncSingleAccount(
    companyId: string,
    connectorId: string,
    account: { id: string; externalId: string },
  ): Promise<{ created: number; updated: number; failed: number; error?: string }> {
    const accessToken = this.getDecryptedAccessToken();
    if (!accessToken) return { created: 0, updated: 0, failed: 1, error: "No access token" };

    let syncLogId: string | null = null;
    try {
      const syncLog = await this.service.createSyncLog(companyId, connectorId, "plaid", "full", "running", {
        recordsProcessed: 0, recordsCreated: 0, recordsUpdated: 0, recordsFailed: 0,
      });
      syncLogId = syncLog.id;

      const txResponse = await this.client!.transactionsSync({
        access_token: accessToken,
        options: { include_personal_finance_category: true },
      });

      let created = 0;
      let updated = 0;

      for (const tx of txResponse.data.added) {
        const normalized = FinancialNormalizer.normalizeTransaction("plaid", account.id, tx as unknown as Record<string, unknown>);
        await this.service.upsertExternalTransaction(companyId, normalized);
        created++;
      }

      for (const tx of txResponse.data.modified) {
        const normalized = FinancialNormalizer.normalizeTransaction("plaid", account.id, tx as unknown as Record<string, unknown>);
        await this.service.upsertExternalTransaction(companyId, normalized);
        updated++;
      }

      const balanceResponse = await this.client!.accountsBalanceGet({
        access_token: accessToken,
        options: { account_ids: [account.externalId] },
      });

      for (const bal of balanceResponse.data.accounts) {
        const balances = bal.balances;
        if (balances) {
          const normalized = FinancialNormalizer.normalizeBalance("plaid", account.id, {
            current: balances.current,
            available: balances.available,
            limit: balances.limit,
            iso_currency_code: balances.iso_currency_code ?? "USD",
          } as Record<string, unknown>);
          await this.service.createExternalBalance(companyId, normalized);
        }
      }

      const total = created + updated;
      await this.service.createSyncLog(companyId, connectorId, "plaid", "full", "completed", {
        recordsProcessed: total, recordsCreated: created, recordsUpdated: updated, recordsFailed: 0,
      });

      return { created, updated, failed: 0 };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (syncLogId) {
        await this.service.createSyncLog(companyId, connectorId, "plaid", "full", "failed", {
          recordsProcessed: 0, recordsCreated: 0, recordsUpdated: 0, recordsFailed: 1,
        });
      }
      return { created: 0, updated: 0, failed: 1, error: msg };
    }
  }

  async createLinkToken(ctx: { companyId: string; userId: string }): Promise<{ linkToken: string; expiration: string }> {
    if (!this.client) {
      return { linkToken: "mock-link-token-dev-mode", expiration: new Date(Date.now() + 86400000).toISOString() };
    }
    const { Products, CountryCode } = await import("plaid");
    const response = await this.client.linkTokenCreate({
      user: { client_user_id: ctx.companyId },
      client_name: "Perionyx",
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: "en",
    });
    return {
      linkToken: response.data.link_token,
      expiration: response.data.expiration ?? new Date(Date.now() + 86400000).toISOString(),
    };
  }

  async getInstitutions(query?: string): Promise<{ institutionId: string; name: string }[]> {
    if (!this.client) return [];
    const { CountryCode } = await import("plaid");
    try {
      const response = await this.client.institutionsGet({
        count: 50,
        offset: 0,
        country_codes: [CountryCode.Us],
        options: query ? { include_optional_metadata: true } : undefined,
      });
      return response.data.institutions.map((inst) => ({
        institutionId: inst.institution_id,
        name: inst.name,
      }));
    } catch {
      return [];
    }
  }

  async getLinkedAccounts(): Promise<{
    id: string;
    externalId: string;
    name: string;
    type: string | null;
    subtype: string | null;
    mask: string | null;
    currency: string;
    institutionName: string | null;
  }[]> {
    if (!this.config) return [];
    const accounts = await this.service.getExternalAccounts(this.config.companyId);
    return accounts.map((a: { id: string; externalId: string; name: string; type: string | null; subtype: string | null; mask: string | null; currency: string; institutionName: string | null }) => ({
      id: a.id,
      externalId: a.externalId,
      name: a.name,
      type: a.type,
      subtype: a.subtype,
      mask: a.mask,
      currency: a.currency,
      institutionName: a.institutionName,
    }));
  }

  async syncBalances(): Promise<ConnectorSyncResult> {
    const startedAt = new Date().toISOString();
    if (!this.config || !this.client) {
      return {
        success: false, recordsProcessed: 0, recordsCreated: 0, recordsUpdated: 0,
        recordsFailed: 0, errors: ["Not initialized"], startedAt,
        completedAt: new Date().toISOString(),
      };
    }

    const companyId = this.config.companyId;
    const connectorId = this.config.id;
    const accessToken = this.getDecryptedAccessToken();
    if (!accessToken) {
      return {
        success: false, recordsProcessed: 0, recordsCreated: 0, recordsUpdated: 0,
        recordsFailed: 0, errors: ["No access token"], startedAt,
        completedAt: new Date().toISOString(),
      };
    }

    try {
      const balanceResponse = await this.client.accountsBalanceGet({ access_token: accessToken });
      let created = 0;

      for (const bal of balanceResponse.data.accounts) {
        const externalAccount = await this.service.findExternalAccountByExternalId(companyId, bal.account_id);
        if (!externalAccount) continue;
        const normalized = FinancialNormalizer.normalizeBalance("plaid", externalAccount.id, {
          current: bal.balances?.current,
          available: bal.balances?.available,
          limit: bal.balances?.limit,
          iso_currency_code: bal.balances?.iso_currency_code ?? "USD",
        } as Record<string, unknown>);
        await this.service.createExternalBalance(companyId, normalized);
        created++;
      }

      return {
        success: true, recordsProcessed: created, recordsCreated: created,
        recordsUpdated: 0, recordsFailed: 0, errors: [], startedAt,
        completedAt: new Date().toISOString(),
      };
    } catch (err: unknown) {
      return {
        success: false, recordsProcessed: 0, recordsCreated: 0, recordsUpdated: 0,
        recordsFailed: 0, errors: [err instanceof Error ? err.message : String(err)],
        startedAt, completedAt: new Date().toISOString(),
      };
    }
  }

  async syncTransactions(): Promise<ConnectorSyncResult> {
    if (!this.config) {
      return {
        success: false, recordsProcessed: 0, recordsCreated: 0, recordsUpdated: 0,
        recordsFailed: 0, errors: ["Not initialized"], startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };
    }
    return this.syncData({ fullSync: false });
  }

  async refreshAccessToken(): Promise<boolean> {
    return true;
  }

  getConfig(): ConnectorConfigRecord {
    if (!this.config) throw new Error("Connector not initialized");
    return this.config;
  }

  private getDecryptedAccessToken(): string | null {
    if (!this.config) return null;
    const cfg = this.config.config as Record<string, unknown> | undefined;
    const encrypted = cfg?.accessToken as string | undefined;
    if (!encrypted) return null;
    try { return decrypt(encrypted); } catch { return null; }
  }
}
