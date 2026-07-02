import type { IConnector, ConnectorAuthConfig, ConnectorSyncOptions } from "../interface";
import type {
  ConnectorKind,
  ConnectorAuthMethod,
  ConnectorCapability,
  ConnectorConfigRecord,
  ConnectorHealth,
  ConnectorSyncResult,
} from "../types";

const NOT_CONFIGURED_MESSAGE = "Not configured — set environment variables to enable";

export abstract class ErpConnectorBase implements IConnector {
  abstract readonly kind: ConnectorKind;
  abstract readonly label: string;
  abstract readonly description: string;
  abstract readonly capabilities: ConnectorCapability[];
  abstract readonly supportedAuthMethods: ConnectorAuthMethod[];

  protected config: ConnectorConfigRecord | null = null;
  protected configured = false;

  abstract getRequiredEnvVars(): string[];

  async initialize(config: ConnectorConfigRecord): Promise<void> {
    this.config = config;
    this.configured = this.getRequiredEnvVars().every((v) => !!process.env[v]);
  }

  async validateConfig(): Promise<{ ok: boolean; errors: string[] }> {
    if (!this.config) return { ok: false, errors: ["Connector not initialized"] };
    if (!this.configured) {
      return { ok: false, errors: [`${this.label} is not configured. Required: ${this.getRequiredEnvVars().join(", ")}`] };
    }
    return { ok: true, errors: [] };
  }

  async authenticate(_auth: ConnectorAuthConfig): Promise<{ ok: boolean; message?: string }> {
    if (!this.configured) return { ok: false, message: NOT_CONFIGURED_MESSAGE };
    return { ok: true, message: `${this.label} authenticated` };
  }

  async connect(): Promise<ConnectorHealth> {
    return this.healthCheck();
  }

  async disconnect(): Promise<void> {
    this.config = null;
  }

  async healthCheck(): Promise<ConnectorHealth> {
    if (!this.configured) {
      return { status: "WARNING", lastCheckAt: new Date().toISOString(), message: NOT_CONFIGURED_MESSAGE };
    }
    return this.performHealthCheck();
  }

  async syncData(options?: ConnectorSyncOptions): Promise<ConnectorSyncResult> {
    if (!this.configured) {
      const now = new Date().toISOString();
      return {
        success: false, recordsProcessed: 0, recordsCreated: 0, recordsUpdated: 0,
        recordsFailed: 0, errors: [NOT_CONFIGURED_MESSAGE], startedAt: now, completedAt: now,
      };
    }
    return this.performSync(options);
  }

  async refreshAccessToken(): Promise<boolean> {
    return false;
  }

  getConfig(): ConnectorConfigRecord {
    if (!this.config) throw new Error("Connector not initialized");
    return this.config;
  }

  protected abstract performHealthCheck(): Promise<ConnectorHealth>;
  protected abstract performSync(options?: ConnectorSyncOptions): Promise<ConnectorSyncResult>;
}
