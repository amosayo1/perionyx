import type { IConnector, ConnectorAuthConfig, ConnectorSyncOptions } from "../interface";
import type {
  ConnectorKind,
  ConnectorAuthMethod,
  ConnectorCapability,
  ConnectorConfigRecord,
  ConnectorHealth,
  ConnectorSyncResult,
} from "../types";
import { FinancialNormalizer } from "@/modules/financial-mapping";
import { encrypt, decrypt } from "@/server/security/encryption";
import { prisma } from "@/server/db/prisma";
import { QuickBooksAccountingService } from "../services/quickbooks-accounting.service";

const QB_SANDBOX = "https://sandbox-quickbooks.api.intuit.com";
const QB_PRODUCTION = "https://quickbooks.api.intuit.com";
const QB_OAUTH_TOKEN = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";
const QB_REVOKE = "https://developer.api.intuit.com/v2/oauth2/tokens/revoke";

interface QBOAuthConfig {
  clientId: string;
  clientSecret: string;
  environment: "sandbox" | "production";
}

interface QBOQueryResponse {
  startPosition?: number;
  maxResults?: number;
  totalCount?: number;
  [entityName: string]: unknown;
}

interface QBOApiResponse<T> {
  QueryResponse?: QBOQueryResponse;
  Fault?: {
    Error: { Message: string; Detail: string }[];
  };
  JournalEntry?: T;
  Payment?: T;
}

export class QuickBooksConnector implements IConnector {
  readonly kind: ConnectorKind = "quickbooks";
  readonly label = "QuickBooks Online";
  readonly description = "QuickBooks Online accounting integration for syncing accounts, invoices, vendors, and customers";
  readonly capabilities: ConnectorCapability[] = [
    "import-data",
    "export-data",
    "webhooks",
    "oauth",
    "scheduled-sync",
    "manual-sync",
    "health-check",
  ];
  readonly supportedAuthMethods: ConnectorAuthMethod[] = ["oauth2"];

  private config: ConnectorConfigRecord | null = null;
  private configured = false;
  private oauthConfig: QBOAuthConfig | null = null;
  private service: QuickBooksAccountingService;

  constructor() {
    this.service = new QuickBooksAccountingService();
  }

  async initialize(config: ConnectorConfigRecord): Promise<void> {
    this.config = config;

    const clientId = process.env.QB_CLIENT_ID;
    const clientSecret = process.env.QB_CLIENT_SECRET;

    if (clientId && clientSecret) {
      this.configured = true;
      this.oauthConfig = {
        clientId,
        clientSecret,
        environment: (process.env.QB_ENV ?? "sandbox") as "sandbox" | "production",
      };
    }
  }

  async validateConfig(): Promise<{ ok: boolean; errors: string[] }> {
    if (!this.config) {
      return { ok: false, errors: ["Connector not initialized"] };
    }
    if (!this.configured || !this.oauthConfig) {
      return {
        ok: false,
        errors: [
          "QuickBooks Online is not configured. Set QB_CLIENT_ID and QB_CLIENT_SECRET environment variables.",
        ],
      };
    }
    return { ok: true, errors: [] };
  }

  async authenticate(auth: ConnectorAuthConfig): Promise<{ ok: boolean; message?: string }> {
    if (!this.configured || !this.oauthConfig || !this.config) {
      return { ok: false, message: "Not configured" };
    }

    try {
      const { clientId, clientSecret } = this.oauthConfig;
      const code = auth.credentials.code ?? "";
      const redirectUri = auth.credentials.redirectUri ?? "";

      const body = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      });

      const res = await fetch(QB_OAUTH_TOKEN, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: body.toString(),
      });

      const data = await res.json();

      if (!data.access_token) {
        return {
          ok: false,
          message: `QBO OAuth failed: ${data.error_description ?? data.error ?? "unknown"}`,
        };
      }

      const realmId = auth.credentials.realmId ?? data.realmId ?? "";

      await this.service.createOrUpdateConnection(this.config.companyId, this.config.id, realmId, {
        clientId,
        accessToken: encrypt(data.access_token),
        refreshToken: data.refresh_token ? encrypt(data.refresh_token) : undefined,
        tokenExpiresAt: data.expires_in
          ? new Date(Date.now() + data.expires_in * 1000)
          : undefined,
      });

      return { ok: true, message: "Successfully authenticated with QuickBooks Online" };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { ok: false, message: `QBO authentication error: ${message}` };
    }
  }

  async connect(): Promise<ConnectorHealth> {
    if (!this.configured || !this.config) {
      return { status: "UNKNOWN", lastCheckAt: null, message: "Not configured" };
    }

    try {
      const connection = await this.getConnection();
      if (!connection) {
        return {
          status: "UNKNOWN",
          lastCheckAt: new Date().toISOString(),
          message: "No QBO connection found. Authenticate first.",
        };
      }

      const token = await this.getAccessToken(connection);
      if (!token) {
        return {
          status: "CRITICAL",
          lastCheckAt: new Date().toISOString(),
          message: "Failed to obtain access token",
        };
      }

      const baseUrl = this.getBaseUrl();
      const res = await fetch(
        `${baseUrl}/v3/company/${connection.realmId}/companyinfo/${connection.realmId}`,
        {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        },
      );

      if (res.ok) {
        return {
          status: "GOOD",
          lastCheckAt: new Date().toISOString(),
          message: "Connected to QuickBooks Online",
        };
      }

      return {
        status: "CRITICAL",
        lastCheckAt: new Date().toISOString(),
        message: `QBO API returned ${res.status}`,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        status: "CRITICAL",
        lastCheckAt: new Date().toISOString(),
        message: `Connection failed: ${message}`,
      };
    }
  }

  async disconnect(): Promise<void> {
    if (!this.config) return;

    try {
      const connection = await this.getConnection();
      if (connection && connection.refreshToken && this.oauthConfig) {
        const refreshToken = decrypt(connection.refreshToken);
        if (refreshToken) {
          const body = new URLSearchParams({
            client_id: this.oauthConfig.clientId,
            client_secret: this.oauthConfig.clientSecret,
            refresh_token: refreshToken,
            grant_type: "refresh_token",
          });

          await fetch(QB_REVOKE, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: body.toString(),
          }).catch(() => {});
        }
      }
    } catch {
      // ignore errors during disconnect
    }

    await this.service.deleteConnection(this.config.companyId, this.config.id);
  }

  async healthCheck(): Promise<ConnectorHealth> {
    if (!this.configured || !this.oauthConfig) {
      return {
        status: "WARNING",
        lastCheckAt: new Date().toISOString(),
        message: "QuickBooks Online credentials not configured",
      };
    }

    if (!this.config) {
      return { status: "UNKNOWN", lastCheckAt: null, message: "Not initialized" };
    }

    const start = Date.now();

    try {
      const connection = await this.getConnection();
      if (!connection) {
        return {
          status: "WARNING",
          lastCheckAt: new Date().toISOString(),
          message: "No QBO connection established",
        };
      }

      const token = await this.getAccessToken(connection);
      if (!token) {
        return {
          status: "CRITICAL",
          lastCheckAt: new Date().toISOString(),
          message: "Unable to obtain valid access token",
        };
      }

      const baseUrl = this.getBaseUrl();
      const res = await fetch(
        `${baseUrl}/v3/company/${connection.realmId}/companyinfo/${connection.realmId}`,
        {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        },
      );

      const latencyMs = Date.now() - start;

      if (res.ok) {
        return { status: "GOOD", lastCheckAt: new Date().toISOString(), latencyMs };
      }

      return {
        status: "CRITICAL",
        lastCheckAt: new Date().toISOString(),
        message: `QBO API returned ${res.status}`,
        latencyMs,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        status: "CRITICAL",
        lastCheckAt: new Date().toISOString(),
        message: `Health check failed: ${message}`,
      };
    }
  }

  async syncData(options?: ConnectorSyncOptions): Promise<ConnectorSyncResult> {
    const startedAt = new Date().toISOString();

    if (!this.configured || !this.config) {
      return {
        success: false,
        recordsProcessed: 0,
        recordsCreated: 0,
        recordsUpdated: 0,
        recordsFailed: 0,
        errors: ["Not configured"],
        startedAt,
        completedAt: new Date().toISOString(),
      };
    }

    const connection = await this.getConnection();
    if (!connection) {
      return {
        success: false,
        recordsProcessed: 0,
        recordsCreated: 0,
        recordsUpdated: 0,
        recordsFailed: 0,
        errors: ["No QBO connection. Authenticate first."],
        startedAt,
        completedAt: new Date().toISOString(),
      };
    }

    const token = await this.getAccessToken(connection);
    if (!token) {
      return {
        success: false,
        recordsProcessed: 0,
        recordsCreated: 0,
        recordsUpdated: 0,
        recordsFailed: 0,
        errors: ["Failed to obtain access token"],
        startedAt,
        completedAt: new Date().toISOString(),
      };
    }

    const baseUrl = this.getBaseUrl();
    const companyId = this.config.companyId;
    const connectionId = connection.id;
    const errors: string[] = [];
    let totalProcessed = 0;
    let totalCreated = 0;
    let totalUpdated = 0;

    try {
      const accountsData = await this.queryQBO<Record<string, unknown>>(
        baseUrl,
        connection.realmId,
        token,
        "SELECT * FROM Account",
      );
      const accounts = this.extractResults(accountsData, "Account");
      if (accounts.length > 0) {
        const normalized = accounts.map((a) => FinancialNormalizer.normalizeChartOfAccount(a));
        const result = await this.service.syncChartOfAccounts(connectionId, companyId, normalized);
        totalProcessed += result.processed;
        totalCreated += result.created;
        totalUpdated += result.updated;
      }

      const vendorsData = await this.queryQBO<Record<string, unknown>>(
        baseUrl,
        connection.realmId,
        token,
        "SELECT * FROM Vendor",
      );
      const vendors = this.extractResults(vendorsData, "Vendor");
      if (vendors.length > 0) {
        const normalized = vendors.map((v) => FinancialNormalizer.normalizeVendor(v));
        const result = await this.service.syncVendors(connectionId, companyId, normalized);
        totalProcessed += result.processed;
        totalCreated += result.created;
        totalUpdated += result.updated;
      }

      const customersData = await this.queryQBO<Record<string, unknown>>(
        baseUrl,
        connection.realmId,
        token,
        "SELECT * FROM Customer",
      );
      const customers = this.extractResults(customersData, "Customer");
      if (customers.length > 0) {
        const normalized = customers.map((c) => FinancialNormalizer.normalizeCustomer(c));
        const result = await this.service.syncCustomers(connectionId, companyId, normalized);
        totalProcessed += result.processed;
        totalCreated += result.created;
        totalUpdated += result.updated;
      }

      const invoicesData = await this.queryQBO<Record<string, unknown>>(
        baseUrl,
        connection.realmId,
        token,
        "SELECT * FROM Invoice",
      );
      const invoices = this.extractResults(invoicesData, "Invoice");
      if (invoices.length > 0) {
        const normalized = invoices.map((inv) => FinancialNormalizer.normalizeInvoice(inv));
        const result = await this.service.syncInvoices(connectionId, companyId, normalized);
        totalProcessed += result.processed;
        totalCreated += result.created;
        totalUpdated += result.updated;
      }

      await this.service.createSyncLog(
        companyId,
        this.config.id,
        options?.fullSync ? "full" : "accounting",
        "completed",
        {
          processed: totalProcessed,
          created: totalCreated,
          updated: totalUpdated,
          failed: errors.length,
        },
      );

      await prisma.accountingConnection.update({
        where: { id: connection.id },
        data: { lastSyncAt: new Date() },
      });

      return {
        success: true,
        recordsProcessed: totalProcessed,
        recordsCreated: totalCreated,
        recordsUpdated: totalUpdated,
        recordsFailed: errors.length,
        errors,
        startedAt,
        completedAt: new Date().toISOString(),
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      errors.push(errorMsg);

      await this.service.createSyncLog(
        companyId,
        this.config.id,
        options?.fullSync ? "full" : "accounting",
        "failed",
        {
          processed: totalProcessed,
          created: totalCreated,
          updated: totalUpdated,
          failed: errors.length,
        },
      );

      return {
        success: false,
        recordsProcessed: totalProcessed,
        recordsCreated: totalCreated,
        recordsUpdated: totalUpdated,
        recordsFailed: errors.length,
        errors,
        startedAt,
        completedAt: new Date().toISOString(),
      };
    }
  }

  getConfig(): ConnectorConfigRecord {
    if (!this.config) throw new Error("Connector not initialized");
    return this.config;
  }

  async exportJournal(
    entries: Record<string, unknown>[],
  ): Promise<{ ok: boolean; message?: string; externalIds?: string[] }> {
    if (!this.configured || !this.config) {
      return { ok: false, message: "Not configured" };
    }

    const connection = await this.getConnection();
    if (!connection) return { ok: false, message: "No QBO connection" };

    const token = await this.getAccessToken(connection);
    if (!token) return { ok: false, message: "No access token" };

    const baseUrl = this.getBaseUrl();
    const externalIds: string[] = [];

    try {
      for (const entry of entries) {
        const normalized = FinancialNormalizer.normalizeJournalEntry(entry);
        const body = {
          TxnDate: normalized.transactionDate.toISOString().split("T")[0],
          CurrencyRef: { value: normalized.currency },
          Line: normalized.lineItems.map((line) => ({
            Description: line.description ?? "",
            Amount: Number(line.amount),
            DetailType: "JournalEntryLineDetail",
            JournalEntryLineDetail: {
              PostingType: line.side === "DEBIT" ? "Debit" : "Credit",
              AccountRef: { value: line.accountId, name: line.accountName },
            },
          })),
        };

        const res = await fetch(
          `${baseUrl}/v3/company/${connection.realmId}/journalentry`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(body),
          },
        );

        const data: QBOApiResponse<Record<string, unknown>> = await res.json();
        if (data.JournalEntry && "Id" in data.JournalEntry) {
          externalIds.push(String((data.JournalEntry as Record<string, unknown>).Id));
        }
      }

      return { ok: true, externalIds };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { ok: false, message: `Export journal failed: ${message}` };
    }
  }

  async exportPayment(
    payment: Record<string, unknown>,
  ): Promise<{ ok: boolean; message?: string; externalId?: string }> {
    if (!this.configured || !this.config) {
      return { ok: false, message: "Not configured" };
    }

    const connection = await this.getConnection();
    if (!connection) return { ok: false, message: "No QBO connection" };

    const token = await this.getAccessToken(connection);
    if (!token) return { ok: false, message: "No access token" };

    const baseUrl = this.getBaseUrl();

    try {
      const normalized = FinancialNormalizer.normalizePayment(payment);
      const body = {
        TxnDate: normalized.transactionDate.toISOString().split("T")[0],
        TotalAmt: Number(normalized.totalAmount),
        CurrencyRef: { value: normalized.currency },
        CustomerRef: { value: normalized.customerId, name: normalized.customerName },
        PrivateNote: normalized.reference,
      };

      const res = await fetch(
        `${baseUrl}/v3/company/${connection.realmId}/payment`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(body),
        },
      );

      const data: QBOApiResponse<Record<string, unknown>> = await res.json();
      if (data.Payment && "Id" in data.Payment) {
        return { ok: true, externalId: String((data.Payment as Record<string, unknown>).Id) };
      }

      return { ok: false, message: "Failed to create payment in QBO" };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { ok: false, message: `Export payment failed: ${message}` };
    }
  }

  private getBaseUrl(): string {
    const env = this.oauthConfig?.environment ?? "sandbox";
    return env === "production" ? QB_PRODUCTION : QB_SANDBOX;
  }

  private async getConnection() {
    if (!this.config) return null;
    return this.service.getConnection(this.config.companyId, this.config.id);
  }

  async refreshAccessToken(): Promise<boolean> {
    if (!this.config || !this.oauthConfig) return false;

    const connection = await this.getConnection();
    if (!connection || !connection.refreshToken) return false;

    const refreshToken = decrypt(connection.refreshToken);
    if (!refreshToken) return false;

    try {
      const result = await this.refreshOAuthToken(
        this.oauthConfig.clientId,
        this.oauthConfig.clientSecret,
        refreshToken,
      );

      if (result.accessToken) {
        await this.service.updateTokens(connection.id, {
          accessToken: encrypt(result.accessToken),
          refreshToken: result.refreshToken ? encrypt(result.refreshToken) : undefined,
          tokenExpiresAt: result.expiresIn
            ? new Date(Date.now() + result.expiresIn * 1000)
            : undefined,
        });
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  private async getAccessToken(connection: {
    id: string;
    accessToken: string;
    refreshToken: string | null;
    tokenExpiresAt: Date | null;
    realmId: string;
  }): Promise<string | null> {
    let accessToken: string | null = null;
    try {
      accessToken = decrypt(connection.accessToken);
    } catch {
      return null;
    }

    const isExpired =
      connection.tokenExpiresAt && new Date() >= new Date(connection.tokenExpiresAt);

    if (isExpired && connection.refreshToken && this.oauthConfig) {
      await this.refreshAccessToken();
      const updated = await this.getConnection();
      if (!updated) return null;
      try {
        return decrypt(updated.accessToken);
      } catch {
        return null;
      }
    }

    return accessToken;
  }

  private async refreshOAuthToken(
    clientId: string,
    clientSecret: string,
    refreshToken: string,
  ): Promise<{ accessToken: string | null; refreshToken: string | null; expiresIn: number | null }> {
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    });

    const res = await fetch(QB_OAUTH_TOKEN, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: body.toString(),
    });

    const data = await res.json();

    return {
      accessToken: data.access_token ?? null,
      refreshToken: data.refresh_token ?? null,
      expiresIn: data.expires_in ?? null,
    };
  }

  private async queryQBO<T>(
    baseUrl: string,
    realmId: string,
    token: string,
    query: string,
  ): Promise<QBOApiResponse<T>> {
    const url = `${baseUrl}/v3/company/${realmId}/query?query=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    return res.json();
  }

  private extractResults<T>(response: QBOApiResponse<T>, entityName: string): T[] {
    if (response.Fault) {
      const msgs = response.Fault.Error.map((e) => e.Message).join("; ");
      throw new Error(`QBO API error: ${msgs}`);
    }
    const items = response.QueryResponse?.[entityName];
    return (items as T[]) ?? [];
  }
}
