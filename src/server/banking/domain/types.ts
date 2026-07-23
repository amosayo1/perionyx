export type BankProviderKind =
  | "plaid"
  | "lean"
  | "tarabut"
  | "yap"
  | "truelayer"
  | "tink"
  | "salted"
  | "finicity"
  | "mx"
  | "akoya"
  | "yodlee"
  | "gocardless"
  | "direct-api"
  | "swift"
  | "iso20022"
  | "manual"
  | "csv"
  | "ofx"
  | "mt940"
  | "camt053"
  | "bai2"
  | "open-banking"
  | "custom";

export enum BankingRegion {
  NORTH_AMERICA = "NORTH_AMERICA",
  EUROPE = "EUROPE",
  UNITED_KINGDOM = "UNITED_KINGDOM",
  MIDDLE_EAST = "MIDDLE_EAST",
  UAE = "UAE",
  SAUDI_ARABIA = "SAUDI_ARABIA",
  QATAR = "QATAR",
  BAHRAIN = "BAHRAIN",
  KUWAIT = "KUWAIT",
  OMAN = "OMAN",
  EGYPT = "EGYPT",
  AFRICA = "AFRICA",
  ASIA_PACIFIC = "ASIA_PACIFIC",
  GLOBAL = "GLOBAL",
}

export enum ConnectionProtocol {
  OAUTH2 = "OAUTH2",
  OPEN_BANKING = "OPEN_BANKING",
  API_KEY = "API_KEY",
  MUTUAL_TLS = "MUTUAL_TLS",
  CERTIFICATE = "CERTIFICATE",
  BASIC_AUTH = "BASIC_AUTH",
  BEARER_TOKEN = "BEARER_TOKEN",
  MANUAL = "MANUAL",
  FILE_IMPORT = "FILE_IMPORT",
  DIRECT_API = "DIRECT_API",
  SWIFT = "SWIFT",
  ISO_20022 = "ISO_20022",
}

export enum ProviderCapability {
  BALANCES = "BALANCES",
  TRANSACTIONS = "TRANSACTIONS",
  PAYMENTS = "PAYMENTS",
  STANDING_ORDERS = "STANDING_ORDERS",
  BENEFICIARIES = "BENEFICIARIES",
  FX = "FX",
  STATEMENTS = "STATEMENTS",
  IDENTITY = "IDENTITY",
  WEBHOOKS = "WEBHOOKS",
  HISTORICAL_SYNC = "HISTORICAL_SYNC",
  REAL_TIME = "REAL_TIME",
  ACCOUNT_DISCOVERY = "ACCOUNT_DISCOVERY",
  ACCOUNT_VERIFICATION = "ACCOUNT_VERIFICATION",
  DIRECT_DEBIT = "DIRECT_DEBIT",
  SCHEDULED_PAYMENTS = "SCHEDULED_PAYMENTS",
  BULK_PAYMENTS = "BULK_PAYMENTS",
  RECONCILIATION = "RECONCILIATION",
  REPORTING = "REPORTING",
}

export enum ConnectionStatus {
  PENDING = "PENDING",
  CONNECTING = "CONNECTING",
  CONNECTED = "CONNECTED",
  DISCONNECTED = "DISCONNECTED",
  EXPIRED = "EXPIRED",
  REVOKED = "REVOKED",
  ERROR = "ERROR",
  DEGRADED = "DEGRADED",
}

export enum SyncStatus {
  IDLE = "IDLE",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  PARTIAL = "PARTIAL",
  CANCELLED = "CANCELLED",
  SCHEDULED = "SCHEDULED",
}

export enum SyncMode {
  FULL = "FULL",
  INCREMENTAL = "INCREMENTAL",
  HISTORICAL = "HISTORICAL",
  REALTIME = "REALTIME",
}

export enum AccountType {
  CHECKING = "CHECKING",
  SAVINGS = "SAVINGS",
  CREDIT_CARD = "CREDIT_CARD",
  LOAN = "LOAN",
  INVESTMENT = "INVESTMENT",
  MORTGAGE = "MORTGAGE",
  PREPAID = "PREPAID",
  OVERDRAFT = "OVERDRAFT",
  LINE_OF_CREDIT = "LINE_OF_CREDIT",
  TREASURY = "TREASURY",
  CASH_MANAGEMENT = "CASH_MANAGEMENT",
  ESCROW = "ESCROW",
  SETTLEMENT = "SETTLEMENT",
  FOREIGN_EXCHANGE = "FOREIGN_EXCHANGE",
  SWEEP = "SWEEP",
  INTERNAL = "INTERNAL",
}

export enum PaymentRail {
  ACH = "ACH",
  ACH_SAME_DAY = "ACH_SAME_DAY",
  WIRE_DOMESTIC = "WIRE_DOMESTIC",
  WIRE_INTERNATIONAL = "WIRE_INTERNATIONAL",
  SEPA = "SEPA",
  SEPA_INSTANT = "SEPA_INSTANT",
  SWIFT = "SWIFT",
  TARGET2 = "TARGET2",
  CHAPS = "CHAPS",
  BACS = "BACS",
  FASTER_PAYMENTS = "FASTER_PAYMENTS",
  RTP = "RTP",
  FEDNOW = "FEDNOW",
  UAEFTS = "UAEFTS",
  SARIE = "SARIE",
  MADA = "MADA",
  BIPS = "BIPS",
  CRYPTO = "CRYPTO",
  INTERNAL = "INTERNAL",
  CUSTOM = "CUSTOM",
}

export enum BankingEventType {
  CONNECTION_CREATED = "CONNECTION_CREATED",
  CONNECTION_UPDATED = "CONNECTION_UPDATED",
  CONNECTION_DELETED = "CONNECTION_DELETED",
  CONNECTION_EXPIRED = "CONNECTION_EXPIRED",
  CONNECTION_REVOKED = "CONNECTION_REVOKED",
  CONNECTION_ERROR = "CONNECTION_ERROR",
  ACCOUNT_DISCOVERED = "ACCOUNT_DISCOVERED",
  ACCOUNT_UPDATED = "ACCOUNT_UPDATED",
  ACCOUNT_CLOSED = "ACCOUNT_CLOSED",
  TRANSACTION_IMPORTED = "TRANSACTION_IMPORTED",
  TRANSACTION_UPDATED = "TRANSACTION_UPDATED",
  TRANSACTION_PENDING = "TRANSACTION_PENDING",
  SYNC_STARTED = "SYNC_STARTED",
  SYNC_COMPLETED = "SYNC_COMPLETED",
  SYNC_FAILED = "SYNC_FAILED",
  SYNC_PROGRESS = "SYNC_PROGRESS",
  CREDENTIAL_EXPIRING = "CREDENTIAL_EXPIRING",
  CREDENTIAL_EXPIRED = "CREDENTIAL_EXPIRED",
  CREDENTIAL_ROTATED = "CREDENTIAL_ROTATED",
  PERMISSION_CHANGED = "PERMISSION_CHANGED",
  PERMISSION_REVOKED = "PERMISSION_REVOKED",
  WEBHOOK_RECEIVED = "WEBHOOK_RECEIVED",
  WEBHOOK_FAILED = "WEBHOOK_FAILED",
  PAYMENT_SUBMITTED = "PAYMENT_SUBMITTED",
  PAYMENT_SETTLED = "PAYMENT_SETTLED",
  PAYMENT_FAILED = "PAYMENT_FAILED",
  PAYMENT_REJECTED = "PAYMENT_REJECTED",
  PAYMENT_RETURNED = "PAYMENT_RETURNED",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  PROVIDER_DEGRADED = "PROVIDER_DEGRADED",
  PROVIDER_DOWN = "PROVIDER_DOWN",
  PROVIDER_RESTORED = "PROVIDER_RESTORED",
  HEALTH_THRESHOLD_BREACHED = "HEALTH_THRESHOLD_BREACHED",
  BALANCE_THRESHOLD_BREACHED = "BALANCE_THRESHOLD_BREACHED",
  RECONCILIATION_MISMATCH = "RECONCILIATION_MISMATCH",
}

export enum HealthStatus {
  HEALTHY = "HEALTHY",
  DEGRADED = "DEGRADED",
  UNHEALTHY = "UNHEALTHY",
  DOWN = "DOWN",
  UNKNOWN = "UNKNOWN",
}

export enum CredentialVaultStrategy {
  AES_256_GCM = "AES_256_GCM",
  HASHICORP_VAULT = "HASHICORP_VAULT",
  AWS_KMS = "AWS_KMS",
  AZURE_KEY_VAULT = "AZURE_KEY_VAULT",
  GCP_CLOUD_KMS = "GCP_CLOUD_KMS",
  ENVIRONMENT = "ENVIRONMENT",
}

export interface BankProvider {
  readonly kind: BankProviderKind;
  readonly name: string;
  readonly regions: BankingRegion[];
  readonly capabilities: ProviderCapability[];
  readonly protocols: ConnectionProtocol[];
  readonly supportsHistoricalSync: boolean;
  readonly supportsRealtime: boolean;
  readonly supportsWebhooks: boolean;
  readonly maxHistoryDays: number;
  readonly rateLimit: RateLimitConfig;
  readonly version: string;
  readonly logoUrl?: string;
  readonly website?: string;
  readonly isSandboxAvailable: boolean;
}

export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  concurrentConnections: number;
}

export interface BankInstitution {
  id: string;
  provider: BankProviderKind;
  name: string;
  country: string;
  region: BankingRegion;
  logoUrl?: string;
  primaryColor?: string;
  supportsOAuth: boolean;
  supportsCredentials: boolean;
  supportsFileImport: boolean;
  supportedRails: PaymentRail[];
  routingNumbers?: string[];
  bic?: string;
  isTestBank: boolean;
}

export interface BankConnection {
  id: string;
  providerKind: BankProviderKind;
  institutionId: string;
  institutionName: string;
  companyId: string;
  legalEntityId?: string;
  label: string;
  status: ConnectionStatus;
  protocol: ConnectionProtocol;
  credentialId?: string;
  lastAuthAt: string | null;
  lastSyncAt: string | null;
  nextSyncAt: string | null;
  syncFrequencyMinutes: number;
  expiresAt: string | null;
  version: number;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface BankCredential {
  id: string;
  connectionId: string;
  vaultStrategy: CredentialVaultStrategy;
  encryptedPayload: string;
  keyRef: string;
  rotatedAt: string | null;
  expiresAt: string | null;
  rotationPolicyDays: number;
  lastVerifiedAt: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface BankAccount {
  id: string;
  connectionId: string;
  externalId: string;
  companyId: string;
  legalEntityId?: string;
  name: string;
  officialName?: string;
  type: AccountType;
  subtype: string | null;
  currency: string;
  accountNumber?: string;
  iban?: string;
  bic?: string;
  routingNumber?: string;
  mask: string | null;
  ownerName?: string;
  ownerEmail?: string;
  openedAt: string | null;
  closedAt: string | null;
  isActive: boolean;
  isLinkedToTreasury: boolean;
  treasuryAccountId?: string;
  balance: AccountBalanceSnapshot;
  metadata: Record<string, unknown>;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface AccountBalanceSnapshot {
  current: string;
  available: string | null;
  limit: string | null;
  currency: string;
  recordedAt: string;
  isStale: boolean;
}

export interface AccountOwner {
  id: string;
  accountId: string;
  name: string;
  type: AccountOwnerType;
  taxId?: string;
  email?: string;
  phone?: string;
  address?: string;
  isPrimary: boolean;
}

export enum AccountOwnerType {
  INDIVIDUAL = "INDIVIDUAL",
  COMPANY = "COMPANY",
  JOINT = "JOINT",
  TRUST = "TRUST",
  PARTNERSHIP = "PARTNERSHIP",
  GOVERNMENT = "GOVERNMENT",
  NON_PROFIT = "NON_PROFIT",
}

export interface LegalEntity {
  id: string;
  companyId: string;
  parentId?: string;
  name: string;
  legalName: string;
  taxId: string;
  country: string;
  currency: string;
  hierarchyLevel: number;
  isHeadOffice: boolean;
  accounts: string[];
  children: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AccountGroup {
  id: string;
  companyId: string;
  legalEntityId?: string;
  name: string;
  type: AccountGroupType;
  description?: string;
  accountIds: string[];
  tags: string[];
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export enum AccountGroupType {
  BANK = "BANK",
  REGION = "REGION",
  ENTITY = "ENTITY",
  CURRENCY = "CURRENCY",
  PURPOSE = "PURPOSE",
  CASH_POOL = "CASH_POOL",
  CUSTOM = "CUSTOM",
}

export interface TreasuryRelationship {
  id: string;
  connectionId: string;
  accountId: string;
  treasuryAccountId: string;
  companyId: string;
  linkedAt: string;
  linkedBy: string;
  isPrimary: boolean;
  mappingRules?: AccountMappingRule[];
  syncDirection: SyncDirection;
  version: number;
}

export enum SyncDirection {
  IMPORT = "IMPORT",
  EXPORT = "EXPORT",
  BIDIRECTIONAL = "BIDIRECTIONAL",
}

export interface AccountMappingRule {
  field: string;
  sourceValue: string;
  targetValue: string;
  transform?: string;
}

export interface BankTransaction {
  id: string;
  accountId: string;
  connectionId: string;
  companyId: string;
  externalId: string;
  amount: number;
  currency: string;
  description: string;
  merchantName?: string;
  category?: string[];
  transactionType: TransactionType;
  direction: TransactionDirection;
  status: TransactionStatus;
  transactionDate: string;
  postDate: string | null;
  valueDate: string | null;
  bookingDate: string | null;
  reference?: string;
  counterpartyName?: string;
  counterpartyIban?: string;
  counterpartyBic?: string;
  pending: boolean;
  pendingExternalId?: string;
  paymentRail?: PaymentRail;
  rawData?: Record<string, unknown>;
  reconciledTransactionId?: string;
  isReconciled: boolean;
  metadata: Record<string, unknown>;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export enum TransactionType {
  DEBIT = "DEBIT",
  CREDIT = "CREDIT",
  TRANSFER = "TRANSFER",
  PAYMENT = "PAYMENT",
  FEE = "FEE",
  INTEREST = "INTEREST",
  REFUND = "REFUND",
  REVERSAL = "REVERSAL",
  RETURN = "RETURN",
  CASH_WITHDRAWAL = "CASH_WITHDRAWAL",
  CASH_DEPOSIT = "CASH_DEPOSIT",
  ATM = "ATM",
  POS = "POS",
  ONLINE = "ONLINE",
  SCHEDULED = "SCHEDULED",
  STANDING_ORDER = "STANDING_ORDER",
  DIRECT_DEBIT = "DIRECT_DEBIT",
  FX = "FX",
  SETTLEMENT = "SETTLEMENT",
  ADJUSTMENT = "ADJUSTMENT",
  OTHER = "OTHER",
}

export enum TransactionDirection {
  INFLOW = "INFLOW",
  OUTFLOW = "OUTFLOW",
}

export enum TransactionStatus {
  PENDING = "PENDING",
  POSTED = "POSTED",
  REVERSED = "REVERSED",
  RETURNED = "RETURNED",
  CANCELLED = "CANCELLED",
  FAILED = "FAILED",
}

export interface TransactionSync {
  id: string;
  connectionId: string;
  accountId?: string;
  companyId: string;
  mode: SyncMode;
  status: SyncStatus;
  startedAt: string;
  completedAt: string | null;
  durationMs: number | null;
  recordsRequested: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsFailed: number;
  recordsSkipped: number;
  cursor?: string;
  error?: string;
  retryCount: number;
  maxRetries: number;
}

export interface SyncJob {
  id: string;
  connectionId: string;
  companyId: string;
  mode: SyncMode;
  status: SyncStatus;
  priority: number;
  scheduledAt: string;
  startedAt: string | null;
  completedAt: string | null;
  retryCount: number;
  maxRetries: number;
  deadLettered: boolean;
  errorMessage: string | null;
}

export interface ConnectionHealth {
  connectionId: string;
  providerKind: BankProviderKind;
  status: HealthStatus;
  lastSyncAt: string | null;
  lastHealthCheckAt: string;
  latencyMs: number | null;
  successRate30d: number;
  syncCount30d: number;
  failureCount30d: number;
  rateLimitRemaining: number;
  webhookStatus: WebhookSubscriptionStatus;
  credentialExpiresAt: string | null;
  credentialRotationDue: boolean;
  apiVersion: string;
  score: number;
  warnings: string[];
  errors: string[];
}

export enum WebhookSubscriptionStatus {
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  INVALID = "INVALID",
  UNSUBSCRIBED = "UNSUBSCRIBED",
  UNKNOWN = "UNKNOWN",
}

export interface ProviderCapabilityManifest {
  provider: BankProviderKind;
  capabilities: ProviderCapability[];
  regions: BankingRegion[];
  protocols: ConnectionProtocol[];
  paymentRails: PaymentRail[];
  supportedAccountTypes: AccountType[];
  maxBatchSize: number;
  webhookSupport: boolean;
  historicalSyncSupport: boolean;
  realtimeSupport: boolean;
  sandboxEnvironment: boolean;
  documentationUrl?: string;
}

export interface ConnectionAudit {
  id: string;
  connectionId: string;
  companyId: string;
  actorUserId: string;
  action: string;
  details: Record<string, unknown>;
  severity: AuditSeverity;
  recordedAt: string;
}

export enum AuditSeverity {
  INFO = "info",
  WARNING = "warning",
  CRITICAL = "critical",
}

export interface RegionProviderMap {
  region: BankingRegion;
  countryCodes: string[];
  providers: RegionalProviderConfig[];
}

export interface RegionalProviderConfig {
  kind: BankProviderKind;
  rank: number;
  isRecommended: boolean;
  isFallback: boolean;
  capabilities: ProviderCapability[];
  supportedProtocols: ConnectionProtocol[];
  minHistoryDays: number;
  maxHistoryDays: number;
}

export interface BankEvent {
  id: string;
  type: BankingEventType;
  connectionId: string;
  companyId: string;
  providerKind: BankProviderKind;
  payload: Record<string, unknown>;
  severity: AuditSeverity;
  recordedAt: string;
  deliveredAt: string | null;
  acknowledgedAt: string | null;
}