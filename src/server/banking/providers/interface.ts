import type {
  BankProviderKind,
  BankInstitution,
  BankConnection,
  BankAccount,
  BankTransaction,
  ConnectionStatus,
  SyncStatus,
  ConnectionProtocol,
  RateLimitConfig,
  BankingEventType,
  HealthStatus,
  WebhookSubscriptionStatus,
  ProviderCapability,
  BankingRegion,
  PaymentRail,
  AccountType,
} from "../domain/types";
import { SyncMode } from "../domain/types";

export interface ConnectionLinkParams {
  companyId: string;
  userId: string;
  institutionId?: string;
  country?: string;
  redirectUri?: string;
  credentials?: Record<string, unknown>;
}

export interface ProviderCapabilityManifest {
  provider: BankProviderKind;
  name: string;
  version: string;
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

export interface IBankProvider {
  readonly kind: BankProviderKind;

  initialize(config: ProviderInitConfig): Promise<void>;

  getManifest(): ProviderCapabilityManifest;

  searchInstitutions(query: string, country?: string): Promise<BankInstitution[]>;

  getInstitution(institutionId: string): Promise<BankInstitution | null>;

  createConnectionLink(params: ConnectionLinkParams): Promise<ConnectionLinkResult>;

  authenticateConnection(auth: AuthenticateConnectionParams): Promise<AuthenticationResult>;

  getConnectionStatus(connection: BankConnection): Promise<ConnectionHealth>;

  refreshConnection?(connection: BankConnection): Promise<void>;

  revokeConnection(connection: BankConnection): Promise<void>;

  listAccounts(connection: BankConnection): Promise<BankAccount[]>;

  getAccount(connection: BankConnection, accountId: string): Promise<BankAccount | null>;

  syncTransactions(
    connection: BankConnection,
    accounts: BankAccount[],
    options: SyncOptions,
    onProgress: (progress: SyncProgress) => void,
  ): Promise<SyncResult>;

  syncBalances(
    connection: BankConnection,
    accounts: BankAccount[],
  ): Promise<BalanceSyncResult>;

  getStatement(
    connection: BankConnection,
    account: BankAccount,
    fromDate: string,
    toDate: string,
  ): Promise<StatementResult>;

  initiatePayment(
    connection: BankConnection,
    payment: PaymentInitiationRequest,
  ): Promise<PaymentInitiationResult>;

  getPaymentStatus(
    connection: BankConnection,
    paymentId: string,
  ): Promise<PaymentStatusResult>;

  subscribeToWebhooks?(webhookUrl: string, events: BankingEventType[]): Promise<WebhookSubscriptionResult>;

  unsubscribeFromWebhooks?(subscriptionId: string): Promise<void>;

  handleWebhook?(payload: unknown): Promise<WebhookEvent[]>;

  getRateLimits(): RateLimitConfig;

  isHealthy(): Promise<boolean>;
}

export interface ProviderInitConfig {
  clientId?: string;
  clientSecret?: string;
  apiKey?: string;
  environment: SandboxEnvironment;
  baseUrl?: string;
  customConfig?: Record<string, unknown>;
}

export type SandboxEnvironment = "sandbox" | "development" | "production";

export interface ConnectionLinkResult {
  linkToken: string;
  expiration: string;
  url?: string;
  metadata?: Record<string, unknown>;
}

export interface AuthenticateConnectionParams {
  linkToken?: string;
  publicToken?: string;
  authorizationCode?: string;
  companyId?: string;
  userId?: string;
  institutionId?: string;
  country?: string;
  redirectUri?: string;
  credentials?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface AuthenticationResult {
  success: boolean;
  connectionId?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  accounts: BankAccount[];
  message?: string;
}

export interface SyncOptions {
  mode: SyncMode;
  startDate?: string;
  endDate?: string;
  cursor?: string;
  batchSize?: number;
  signal?: AbortSignal;
}

export interface SyncProgress {
  accountId: string;
  status: SyncStatus;
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsFailed: number;
  cursor?: string;
  error?: string;
}

export interface SyncResult {
  success: boolean;
  transactions: TransactionImportResult[];
  errors: string[];
  cursor?: string;
  hasMore: boolean;
}

export interface TransactionImportResult {
  externalId: string;
  accountId: string;
  status: "created" | "updated" | "skipped" | "failed";
  error?: string;
}

export interface BalanceSyncResult {
  success: boolean;
  balances: BalanceImportResult[];
  errors: string[];
}

export interface BalanceImportResult {
  accountId: string;
  current: number;
  available: number | null;
  limit: number | null;
  currency: string;
  status: "created" | "updated" | "failed";
  error?: string;
}

export interface StatementResult {
  accountId: string;
  startDate: string;
  endDate: string;
  transactions: unknown[];
  openingBalance: string;
  closingBalance: string;
  currency: string;
  format: "json" | "pdf" | "csv" | "mt940" | "camt053";
}

export interface PaymentInitiationRequest {
  accountId: string;
  amount: number;
  currency: string;
  counterpartyName: string;
  counterpartyIban?: string;
  counterpartyBic?: string;
  counterpartyAccountNumber?: string;
  counterpartyRoutingNumber?: string;
  reference: string;
  paymentRail: string;
  scheduledDate?: string;
  priority: "normal" | "high" | "urgent";
  metadata?: Record<string, unknown>;
}

export interface PaymentInitiationResult {
  success: boolean;
  paymentId?: string;
  status: string;
  estimatedSettlementDate?: string;
  message?: string;
  errors?: string[];
}

export interface PaymentStatusResult {
  paymentId: string;
  status: string;
  settlementDate?: string;
  failureReason?: string;
  metadata?: Record<string, unknown>;
}

export interface WebhookSubscriptionResult {
  success: boolean;
  subscriptionId?: string;
  webhookUrl?: string;
  events: BankingEventType[];
  expiresAt?: string;
}

export interface WebhookEvent {
  type: string;
  payload: Record<string, unknown>;
  providerEventId: string;
  providerKind: BankProviderKind;
  companyId?: string;
  connectionId?: string;
  timestamp: string;
}
