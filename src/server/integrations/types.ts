export type ProviderCategory =
  | "banking"
  | "erp"
  | "accounting"
  | "crm"
  | "payroll"
  | "hr"
  | "email"
  | "storage"
  | "ai"
  | "payment"
  | "tax"
  | "identity"
  | "messaging"
  | "document";

export type AuthMethod =
  | "oauth2"
  | "oidc"
  | "api_key"
  | "bearer_token"
  | "basic_auth"
  | "client_credentials"
  | "jwt"
  | "mutual_tls";

export type SyncType = "full" | "incremental" | "scheduled" | "manual";

export type SyncDirection = "import" | "export" | "bidirectional";

export type ConnectionStatus = "connected" | "disconnected" | "error" | "pending" | "expired";

export type HealthStatus = "healthy" | "degraded" | "unhealthy" | "unknown";

export type CapabilityFlag =
  | "supports_oauth"
  | "supports_webhooks"
  | "supports_incremental_sync"
  | "supports_batch"
  | "supports_events"
  | "supports_attachments"
  | "supports_multi_company"
  | "supports_multi_currency"
  | "supports_pagination"
  | "supports_filtering"
  | "supports_search"
  | "supports_webhooks_outbound"
  | "supports_realtime";

export type BusinessCapability =
  | "read_accounts"
  | "write_accounts"
  | "read_transactions"
  | "write_transactions"
  | "read_invoices"
  | "write_invoices"
  | "read_vendors"
  | "write_vendors"
  | "read_customers"
  | "write_customers"
  | "read_balance"
  | "read_statements"
  | "initiate_payment"
  | "read_contacts"
  | "write_contacts"
  | "read_employees"
  | "write_employees"
  | "read_files"
  | "write_files"
  | "read_journals"
  | "write_journals"
  | "read_tax"
  | "write_tax"
  | "read_reports"
  | "generate_reports"
  | "read_products"
  | "write_products"
  | "read_orders"
  | "write_orders"
  | "read_inventory"
  | "write_inventory"
  | "read_budgets"
  | "write_budgets";

export type Capability = CapabilityFlag | BusinessCapability;

export type EventType =
  | "payment.created"
  | "payment.updated"
  | "invoice.posted"
  | "invoice.paid"
  | "vendor.created"
  | "vendor.updated"
  | "customer.created"
  | "customer.updated"
  | "bank.statement.imported"
  | "journal.posted"
  | "asset.created"
  | "asset.depreciated"
  | "tax.filed"
  | "tax.payment"
  | "reconciliation.completed"
  | "sync.completed"
  | "sync.failed"
  | "connection.changed"
  | "credential.expiring"
  | "webhook.received";

export type IntegrationEventType =
  | "integration.connection.created"
  | "integration.connection.updated"
  | "integration.connection.deleted"
  | "integration.connection.failed"
  | "integration.connection.reconnected"
  | "integration.sync.started"
  | "integration.sync.completed"
  | "integration.sync.failed"
  | "integration.webhook.received"
  | "integration.webhook.delivered"
  | "integration.webhook.failed"
  | "integration.provider.unavailable"
  | "integration.provider.healthy"
  | "integration.credential.expiring"
  | "integration.credential.expired"
  | "integration.credential.rotated"
  | "integration.retry.scheduled"
  | "integration.retry.exhausted"
  | "integration.health.degraded"
  | "integration.health.restored";

export interface IntegrationEvent {
  id: string;
  type: EventType;
  providerId: string;
  connectionId: string;
  companyId: string;
  timestamp: Date;
  data: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface IntegrationDomainEvent {
  id: string;
  type: IntegrationEventType;
  providerId: string;
  connectionId: string;
  companyId: string;
  timestamp: Date;
  data: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  correlationId?: string;
}

export interface ProviderCapabilities {
  category: ProviderCategory;
  methods: string[];
  syncTypes: SyncType[];
  syncDirections: SyncDirection[];
  capabilities: Capability[];
  capabilityFlags: CapabilityFlag[];
  businessCapabilities: BusinessCapability[];
  authMethods: AuthMethod[];
  maxBatchSize?: number;
  rateLimit?: number;
  rateLimitWindow?: number;
  maxConnections?: number;
  supportedApiVersions?: string[];
}

export interface ProviderConfig {
  id: string;
  name: string;
  version: string;
  category: ProviderCategory;
  description: string;
  vendor: string;
  website?: string;
  docsUrl?: string;
  capabilities: ProviderCapabilities;
  configSchema: Record<string, unknown>;
  credentialsSchema: Record<string, unknown>;
  icon?: string;
  isBeta?: boolean;
  isDeprecated?: boolean;
  deprecationMessage?: string;
  minVersion?: string;
}

export interface ConnectionConfig {
  id: string;
  providerId: string;
  companyId: string;
  name: string;
  status: ConnectionStatus;
  authMethod: AuthMethod;
  config: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  lastConnectedAt?: Date;
  lastSyncAt?: Date;
  failureCount: number;
  lastError?: string;
  enabled: boolean;
  version: number;
}

export interface SyncJob {
  id: string;
  connectionId: string;
  companyId: string;
  type: SyncType;
  direction: SyncDirection;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  startedAt?: Date;
  completedAt?: Date;
  itemsProcessed?: number;
  itemsFailed?: number;
  error?: string;
  metadata?: Record<string, unknown>;
  correlationId?: string;
}

export interface WebhookConfig {
  id: string;
  companyId: string;
  url: string;
  secret: string;
  events: EventType[];
  active: boolean;
  version: number;
  retryPolicy?: WebhookRetryPolicy;
  headers?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebhookRetryPolicy {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  eventId: string;
  url: string;
  status: "pending" | "delivered" | "failed" | "retrying";
  statusCode?: number;
  attempt: number;
  maxAttempts: number;
  payload: string;
  response?: string;
  error?: string;
  deliveredAt?: Date;
  createdAt: Date;
}

export interface CredentialStore {
  id: string;
  connectionId: string;
  companyId: string;
  encryptedData: string;
  keyId: string;
  expiresAt?: Date;
  rotatedAt?: Date;
  lastValidatedAt?: Date;
  validationStatus?: "valid" | "invalid" | "unknown";
  version: number;
  secretRef?: string;
  createdAt: Date;
}

export interface IntegrationHealthReport {
  providerId: string;
  connectionId: string;
  status: HealthStatus;
  lastCheck: Date;
  latency: number;
  errorRate: number;
  syncLag: number;
  healthScore: number;
  availability: number;
  uptime: number;
  lastFailureAt?: Date;
  consecutiveFailures: number;
  details?: Record<string, unknown>;
}

export interface HealthDiagnostics {
  connectionId: string;
  timestamp: Date;
  latency: number;
  isReachable: boolean;
  authValid: boolean;
  apiVersionValid: boolean;
  rateLimitRemaining?: number;
  lastError?: string;
  suggestions?: string[];
}

export interface SyncResult {
  success: boolean;
  itemsSynced: number;
  itemsFailed: number;
  errors: string[];
  duration: number;
  cursor?: string;
  hasMore: boolean;
  warnings?: string[];
}

export interface SyncState {
  lastSyncAt: Date | null;
  lastCursor: string | null;
  lastFullSyncAt: Date | null;
  version: number;
  changeTracking: Record<string, string>;
  lastSequenceId?: string;
}

export interface ConflictRecord {
  id: string;
  connectionId: string;
  resourceType: string;
  resourceId: string;
  localVersion: string;
  remoteVersion: string;
  localData: Record<string, unknown>;
  remoteData: Record<string, unknown>;
  resolution: "local" | "remote" | "manual" | "merged" | null;
  resolvedAt?: Date;
  createdAt: Date;
}

export interface DiscoveryResult {
  providerId: string;
  available: boolean;
  version?: string;
  capabilities?: Partial<ProviderCapabilities>;
  error?: string;
  apiVersion?: string;
  endpoints?: string[];
}

export interface Integration {
  id: string;
  companyId: string;
  providerId: string;
  connectionId: string;
  name: string;
  category: ProviderCategory;
  status: ConnectionStatus;
  health: HealthStatus;
  config: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProviderVersion {
  providerId: string;
  version: string;
  minVersion: string;
  changelog?: string;
  isCompatible: boolean;
  releasedAt: Date;
  deprecatedAt?: Date;
  sunsetAt?: Date;
}

export interface IntegrationAuditEntry {
  id: string;
  companyId: string;
  connectionId: string;
  action: string;
  actor: string;
  details: Record<string, unknown>;
  timestamp: Date;
  ip?: string;
  userAgent?: string;
}

export interface CapabilityDeclaration {
  providerId: string;
  providerName: string;
  category: ProviderCategory;
  version: string;
  capabilities: Capability[];
  capabilityFlags: CapabilityFlag[];
  businessCapabilities: BusinessCapability[];
  supportedAuthMethods: AuthMethod[];
  supportedSyncTypes: SyncType[];
  supportedSyncDirections: SyncDirection[];
  rateLimit: number;
  rateLimitWindow: number;
  maxBatchSize: number;
}

export interface KMSProvider {
  encrypt(plaintext: string, context: Record<string, string>): Promise<string>;
  decrypt(ciphertext: string, context: Record<string, string>): Promise<string>;
  generateKey(): Promise<{ keyId: string; publicKey?: string }>;
  rotateKey(keyId: string): Promise<string>;
}

export interface SecretReference {
  type: "env" | "file" | "kms" | "vault" | "aws_secretsmanager" | "gcp_secretmanager";
  path: string;
  key: string;
  version?: string;
}
