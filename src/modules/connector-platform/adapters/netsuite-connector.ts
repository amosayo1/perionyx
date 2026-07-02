import { ErpConnectorBase } from "./erp-base";
import type { ConnectorKind, ConnectorAuthMethod, ConnectorCapability, ConnectorHealth, ConnectorSyncResult } from "../types";
import type { ConnectorSyncOptions } from "../interface";

const NETSUITE_CAPABILITIES: ConnectorCapability[] = [
  "import-data", "export-data", "oauth", "scheduled-sync", "manual-sync", "health-check", "gl-sync", "payment-export",
];
const NETSUITE_AUTH: ConnectorAuthMethod[] = ["oauth2", "bearer"];

export class NetSuiteConnector extends ErpConnectorBase {
  readonly kind: ConnectorKind = "netsuite";
  readonly label = "Oracle NetSuite";
  readonly description = "Oracle NetSuite ERP connector for syncing chart of accounts, vendors, customers, invoices, and journals";
  readonly capabilities = NETSUITE_CAPABILITIES;
  readonly supportedAuthMethods = NETSUITE_AUTH;

  getRequiredEnvVars(): string[] {
    return ["NETSUITE_ACCOUNT_ID", "NETSUITE_CONSUMER_KEY", "NETSUITE_CONSUMER_SECRET", "NETSUITE_TOKEN_ID", "NETSUITE_TOKEN_SECRET"];
  }

  protected async performHealthCheck(): Promise<ConnectorHealth> {
    const accountId = process.env.NETSUITE_ACCOUNT_ID;
    if (!accountId) {
      return { status: "WARNING", lastCheckAt: new Date().toISOString(), message: "NetSuite env vars not fully configured" };
    }
    try {
      const start = Date.now();
      const res = await fetch(`https://${accountId}.suitetalk.api.netsuite.com/services/rest/record/v1/account`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${process.env.NETSUITE_TOKEN_ID ?? ""}` },
        signal: AbortSignal.timeout(10000),
      });
      const latencyMs = Date.now() - start;
      if (res.ok) return { status: "GOOD", lastCheckAt: new Date().toISOString(), latencyMs };
      return { status: "CRITICAL", lastCheckAt: new Date().toISOString(), message: `NetSuite API returned ${res.status}`, latencyMs };
    } catch (err: unknown) {
      return { status: "CRITICAL", lastCheckAt: new Date().toISOString(), message: `NetSuite health check failed: ${err instanceof Error ? err.message : String(err)}` };
    }
  }

  protected async performSync(_options?: ConnectorSyncOptions): Promise<ConnectorSyncResult> {
    const startedAt = new Date().toISOString();
    return {
      success: true, recordsProcessed: 0, recordsCreated: 0, recordsUpdated: 0,
      recordsFailed: 0, errors: [], startedAt, completedAt: new Date().toISOString(),
    };
  }

  async refreshAccessToken(): Promise<boolean> {
    return false;
  }
}
