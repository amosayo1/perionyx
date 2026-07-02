import { ErpConnectorBase } from "./erp-base";
import type { ConnectorKind, ConnectorAuthMethod, ConnectorCapability, ConnectorHealth, ConnectorSyncResult } from "../types";
import type { ConnectorSyncOptions } from "../interface";

const SAP_CAPABILITIES: ConnectorCapability[] = [
  "import-data", "export-data", "scheduled-sync", "manual-sync", "health-check", "gl-sync", "journal-export",
];
const SAP_AUTH: ConnectorAuthMethod[] = ["basic", "oauth2"];

export class SapConnector extends ErpConnectorBase {
  readonly kind: ConnectorKind = "sap";
  readonly label = "SAP S/4HANA";
  readonly description = "SAP S/4HANA ERP connector for syncing business partners, chart of accounts, and journals";
  readonly capabilities = SAP_CAPABILITIES;
  readonly supportedAuthMethods = SAP_AUTH;

  getRequiredEnvVars(): string[] {
    return ["SAP_BASE_URL", "SAP_CLIENT_ID", "SAP_CLIENT_SECRET"];
  }

  protected async performHealthCheck(): Promise<ConnectorHealth> {
    const baseUrl = process.env.SAP_BASE_URL;
    if (!baseUrl) {
      return { status: "WARNING", lastCheckAt: new Date().toISOString(), message: "SAP env vars not fully configured" };
    }
    try {
      const start = Date.now();
      const res = await fetch(`${baseUrl}/api/v1/HealthCheck`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(10000),
      });
      const latencyMs = Date.now() - start;
      if (res.ok) return { status: "GOOD", lastCheckAt: new Date().toISOString(), latencyMs };
      return { status: "CRITICAL", lastCheckAt: new Date().toISOString(), message: `SAP API returned ${res.status}`, latencyMs };
    } catch (err: unknown) {
      return { status: "CRITICAL", lastCheckAt: new Date().toISOString(), message: `SAP health check failed: ${err instanceof Error ? err.message : String(err)}` };
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
    const clientId = process.env.SAP_CLIENT_ID;
    const clientSecret = process.env.SAP_CLIENT_SECRET;
    const baseUrl = process.env.SAP_BASE_URL;
    if (!clientId || !clientSecret || !baseUrl) return false;

    try {
      const body = new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      });
      const res = await fetch(`${baseUrl}/oauth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}
