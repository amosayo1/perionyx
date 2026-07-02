export type ConnectorKind =
  | "plaid"
  | "stripe"
  | "wise"
  | "xero"
  | "quickbooks"
  | "ach"
  | "http"
  | "mock"
  | "custom"
  | "identity"
  | "entra-id"
  | "email"
  | "slack"
  | "teams"
  | "storage"
  | "fx"
  | "compliance"
  | "dynamics365"
  | "netsuite"
  | "sap"
  | "jpmorgan"
  | "citi"
  | "bofa"
  | "hsbc";

export type ConnectorStatus =
  | "configuring"
  | "active"
  | "error"
  | "disabled"
  | "expired";

export type ConnectorAuthMethod =
  | "none"
  | "api-key"
  | "oauth2"
  | "basic"
  | "bearer"
  | "mutual-tls";

export type ConnectorCapability =
  | "import-data"
  | "export-data"
  | "webhooks"
  | "scheduled-sync"
  | "manual-sync"
  | "oauth"
  | "api-key-auth"
  | "file-import"
  | "streaming"
  | "real-time-events"
  | "settlement"
  | "health-check"
  | "audit-log"
  | "user-provisioning"
  | "journal-export"
  | "payment-export"
  | "gl-sync";

export type ConnectorCategory =
  | "banking"
  | "erp"
  | "accounting"
  | "identity"
  | "communication"
  | "ai"
  | "storage"
  | "analytics"
  | "payments"
  | "compliance"
  | "developer"
  | "other";

export type ConnectorEventType =
  | "connector:installed"
  | "connector:configured"
  | "connector:authenticated"
  | "connector:connected"
  | "connector:disconnected"
  | "connector:validated"
  | "connector:health-check"
  | "connector:sync-started"
  | "connector:sync-completed"
  | "connector:sync-failed"
  | "connector:error"
  | "connector:deleted";

export type ConnectorLifecyclePhase =
  | "installed"
  | "configured"
  | "authenticated"
  | "validated"
  | "connected"
  | "disconnected"
  | "error";

export interface ConnectorConfigRecord {
  id: string;
  companyId: string;
  name: string;
  kind: ConnectorKind;
  status: ConnectorStatus;
  authMethod: ConnectorAuthMethod;
  capabilities: ConnectorCapability[];
  config: Record<string, unknown>;
  active: boolean;
  healthStatus?: string;
  lastHealthCheckAt?: string;
  lastSyncAt?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConnectorHealth {
  status: "GOOD" | "WARNING" | "CRITICAL" | "UNKNOWN";
  lastCheckAt: string | null;
  message?: string;
  latencyMs?: number;
}

export interface ConnectorSyncResult {
  success: boolean;
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsFailed: number;
  errors: string[];
  startedAt: string;
  completedAt: string;
}
