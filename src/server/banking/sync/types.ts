import type { BankProviderKind, BankConnection, BankAccount, BankTransaction, SyncMode } from "../domain/types";

export type { SyncMode };

export type SyncTrigger =
  | "MANUAL"
  | "SCHEDULED"
  | "INCREMENTAL"
  | "HISTORICAL_IMPORT"
  | "REALTIME_WEBHOOK"
  | "RECOVERY"
  | "RETRY"
  | "EMERGENCY";

export type SyncScheduleFrequency =
  | "MANUAL"
  | "EVERY_15_MINUTES"
  | "HOURLY"
  | "EVERY_6_HOURS"
  | "DAILY"
  | "WEEKLY"
  | "CUSTOM_CRON";

export type SyncScope =
  | "ACCOUNT"
  | "BANK"
  | "LEGAL_ENTITY";

export type HistoricalRange =
  | "LAST_30_DAYS"
  | "LAST_90_DAYS"
  | "LAST_180_DAYS"
  | "LAST_YEAR"
  | "ALL_AVAILABLE"
  | "CUSTOM_RANGE";

export type RecurrencePattern = "CONTINUOUS" | "SINGLE";

export type SyncState =
  | "QUEUED"
  | "PREPARING"
  | "AUTHENTICATING"
  | "DOWNLOADING"
  | "PROCESSING"
  | "RECONCILING"
  | "COMPLETED"
  | "PARTIAL_SUCCESS"
  | "RETRYING"
  | "FAILED"
  | "CANCELLED";

export type DedupMatchField =
  | "provider_transaction_id"
  | "normalized_hash"
  | "booking_date_amount_currency"
  | "reference_account";

export interface SyncJobDefinition {
  id: string;
  connectionId: string;
  companyId: string;
  legalEntityId?: string;
  trigger: SyncTrigger;
  mode: SyncMode;
  scope: SyncScope;
  scheduleFrequency: SyncScheduleFrequency;
  recurrence: RecurrencePattern;
  accountIds: string[];
  priority: number;
  maxRetries: number;
  historicalRange?: HistoricalRange;
  customStartDate?: string;
  customEndDate?: string;
  cronExpression?: string;
  createdAt: string;
}

export interface SyncJobInstance {
  id: string;
  definitionId: string;
  state: SyncState;
  connectionId: string;
  companyId: string;
  trigger: SyncTrigger;
  mode: SyncMode;
  scope: SyncScope;
  accountIds: string[];
  priority: number;
  retryCount: number;
  maxRetries: number;
  startedAt: string | null;
  completedAt: string | null;
  durationMs: number | null;
  correlationId: string;
  errorMessage: string | null;
  errorDetails: Record<string, unknown> | null;
  cancelledBy: string | null;
  progress: SyncProgress;
  checkpointId: string | null;
  stateHistory: SyncStateTransition[];
}

export interface SyncStateTransition {
  from: SyncState | null;
  to: SyncState;
  timestamp: string;
  reason: string;
  triggeredBy: string;
}

export interface SyncProgress {
  totalAccounts: number;
  completedAccounts: number;
  failedAccounts: number;
  totalTransactions: number;
  processedTransactions: number;
  importedTransactions: number;
  updatedTransactions: number;
  failedTransactions: number;
  skippedTransactions: number;
  percentComplete: number;
}

export interface SyncPlan {
  jobId: string;
  connectionId: string;
  companyId: string;
  mode: SyncMode;
  accounts: SyncAccountPlan[];
  startDate?: string;
  endDate?: string;
  priority: number;
}

export interface SyncAccountPlan {
  accountId: string;
  externalId: string;
  name: string;
  currency: string;
  cursor?: string;
  checkpointToken?: string;
}

export interface SyncStatistics {
  totalAccounts: number;
  totalTransactions: number;
  imported: number;
  updated: number;
  failed: number;
  skipped: number;
  duplicatesFound: number;
  reconciliationsRun: number;
  reconciliationIssues: number;
  durationMs: number;
  bytesTransferred: number;
  providerLatencyMs: number;
}

export interface SyncError {
  code: string;
  message: string;
  accountId?: string;
  transactionId?: string;
  retryable: boolean;
  timestamp: string;
}

export interface SyncResult {
  jobId: string;
  success: boolean;
  state: SyncState;
  statistics: SyncStatistics;
  errors: SyncError[];
  hasMore: boolean;
  cursor?: string;
  checkpointId?: string;
  reconciliationId?: string;
  completedAt: string;
}

export interface SyncCommand {
  kind: string;
  jobId: string;
  connection: BankConnection;
  accounts: BankAccount[];
  mode: SyncMode;
  trigger: SyncTrigger;
  startDate?: string;
  endDate?: string;
  correlationId: string;
}

export interface SyncScheduleConfig {
  connectionId: string;
  companyId: string;
  legalEntityId?: string;
  scope: SyncScope;
  frequency: SyncScheduleFrequency;
  cronExpression?: string;
  mode: SyncMode;
  trigger: SyncTrigger;
  accountIds: string[];
  historicalRange?: HistoricalRange;
  retryPolicy: SyncRetryPolicy;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SyncRetryPolicy {
  maxRetries: number;
  backoffMinutes: number;
  exponentialBackoff: boolean;
  deadLetterAfterRetries: boolean;
}

export interface SyncFilterCriteria {
  accountIds?: string[];
  currencies?: string[];
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  transactionTypes?: string[];
  statuses?: string[];
  referenceMatch?: string;
}

export interface SyncDedupConfig {
  enabled: boolean;
  matchFields: DedupMatchField[];
  ttlDays: number;
  strictMode: boolean;
}