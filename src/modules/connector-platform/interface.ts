import type {
  ConnectorKind,
  ConnectorAuthMethod,
  ConnectorCapability,
  ConnectorConfigRecord,
  ConnectorHealth,
  ConnectorSyncResult,
} from "./types";

export interface ConnectorAuthConfig {
  method: ConnectorAuthMethod;
  credentials: Record<string, string>;
}

export interface ConnectorSyncOptions {
  fullSync?: boolean;
  since?: string;
  limit?: number;
}

export interface IConnector {
  readonly kind: ConnectorKind;
  readonly label: string;
  readonly description: string;
  readonly capabilities: ConnectorCapability[];
  readonly supportedAuthMethods: ConnectorAuthMethod[];

  initialize(config: ConnectorConfigRecord): Promise<void>;

  validateConfig(): Promise<{ ok: boolean; errors: string[] }>;

  authenticate(auth: ConnectorAuthConfig): Promise<{ ok: boolean; message?: string }>;

  connect(): Promise<ConnectorHealth>;

  disconnect(): Promise<void>;

  healthCheck(): Promise<ConnectorHealth>;

  syncData?(options?: ConnectorSyncOptions): Promise<ConnectorSyncResult>;

  refreshAccessToken?(): Promise<boolean>;

  getConfig(): ConnectorConfigRecord;
}
