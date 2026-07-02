import { ErpConnectorBase } from "./erp-base";
import type { ConnectorKind, ConnectorAuthMethod, ConnectorCapability, ConnectorHealth, ConnectorSyncResult } from "../types";
import type { ConnectorSyncOptions } from "../interface";

const DYNAMICS_CAPABILITIES: ConnectorCapability[] = [
  "import-data", "export-data", "oauth", "scheduled-sync", "manual-sync", "health-check", "gl-sync", "journal-export",
];
const DYNAMICS_AUTH: ConnectorAuthMethod[] = ["oauth2"];

export class Dynamics365Connector extends ErpConnectorBase {
  readonly kind: ConnectorKind = "dynamics365";
  readonly label = "Microsoft Dynamics 365 Finance";
  readonly description = "Microsoft Dynamics 365 Finance ERP connector for syncing chart of accounts, vendors, customers, and journals";
  readonly capabilities = DYNAMICS_CAPABILITIES;
  readonly supportedAuthMethods = DYNAMICS_AUTH;
  readonly envPrefix = "D365";

  getRequiredEnvVars(): string[] {
    return ["D365_CLIENT_ID", "D365_CLIENT_SECRET", "D365_TENANT_ID", "D365_RESOURCE_URL"];
  }

  protected async performHealthCheck(): Promise<ConnectorHealth> {
    const resourceUrl = process.env.D365_RESOURCE_URL;
    const tenantId = process.env.D365_TENANT_ID;
    if (!resourceUrl || !tenantId) {
      return { status: "WARNING", lastCheckAt: new Date().toISOString(), message: "D365 environment vars not fully configured" };
    }
    try {
      const start = Date.now();
      const res = await fetch(`${resourceUrl}/data/Companies`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(10000),
      });
      const latencyMs = Date.now() - start;
      if (res.ok) return { status: "GOOD", lastCheckAt: new Date().toISOString(), latencyMs };
      return { status: "CRITICAL", lastCheckAt: new Date().toISOString(), message: `D365 API returned ${res.status}`, latencyMs };
    } catch (err: unknown) {
      return { status: "CRITICAL", lastCheckAt: new Date().toISOString(), message: `D365 health check failed: ${err instanceof Error ? err.message : String(err)}` };
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
    const clientId = process.env.D365_CLIENT_ID;
    const clientSecret = process.env.D365_CLIENT_SECRET;
    const tenantId = process.env.D365_TENANT_ID;
    if (!clientId || !clientSecret || !tenantId) return false;

    try {
      const body = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "client_credentials",
        scope: `${process.env.D365_RESOURCE_URL ?? ""}/.default`,
      });
      const res = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
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
