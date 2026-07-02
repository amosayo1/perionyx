import type { IConnector } from "../interface";
import type {
  ConnectorKind,
  ConnectorAuthMethod,
  ConnectorCapability,
  ConnectorConfigRecord,
  ConnectorHealth,
  ConnectorSyncResult,
} from "../types";
import type { ConnectorAuthConfig, ConnectorSyncOptions } from "../interface";

export class LegacyConnectorAdapter implements IConnector {
  readonly kind: ConnectorKind;
  readonly label: string;
  readonly description: string;
  readonly capabilities: ConnectorCapability[];
  readonly supportedAuthMethods: ConnectorAuthMethod[];

  private config: ConnectorConfigRecord | null = null;
  private settleFn: ((companyId: string, tx: unknown) => Promise<any>) | null = null;

  constructor(params: {
    kind: ConnectorKind;
    label: string;
    description: string;
    capabilities?: ConnectorCapability[];
    settleFn?: (companyId: string, tx: unknown) => Promise<any>;
  }) {
    this.kind = params.kind;
    this.label = params.label;
    this.description = params.description;
    this.capabilities = params.capabilities ?? ["settlement"];
    this.supportedAuthMethods = ["api-key", "basic", "bearer"];
    this.settleFn = params.settleFn ?? null;
  }

  async initialize(config: ConnectorConfigRecord): Promise<void> {
    this.config = config;
  }

  async validateConfig(): Promise<{ ok: boolean; errors: string[] }> {
    return { ok: true, errors: [] };
  }

  async authenticate(_auth: ConnectorAuthConfig): Promise<{ ok: boolean; message?: string }> {
    return { ok: true };
  }

  async connect(): Promise<ConnectorHealth> {
    return { status: "GOOD", lastCheckAt: new Date().toISOString() };
  }

  async disconnect(): Promise<void> {
    this.config = null;
  }

  async healthCheck(): Promise<ConnectorHealth> {
    return { status: "GOOD", lastCheckAt: new Date().toISOString() };
  }

  async refreshAccessToken(): Promise<boolean> {
    return true;
  }

  async syncData(_options?: ConnectorSyncOptions): Promise<ConnectorSyncResult> {
    return {
      success: true,
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      errors: [],
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };
  }

  async settleTransaction(companyId: string, tx: unknown) {
    if (!this.settleFn) {
      return { success: true, externalId: `legacy-${Date.now()}` };
    }
    return this.settleFn(companyId, tx);
  }

  getConfig(): ConnectorConfigRecord {
    if (!this.config) throw new Error("Connector not initialized");
    return this.config;
  }
}
