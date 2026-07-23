import type {
  BankProviderKind,
  BankingRegion,
  ProviderCapability,
  ConnectionProtocol,
} from "../domain/types";

export type CommandKind =
  | "ConnectBank"
  | "DisconnectBank"
  | "SyncAccounts"
  | "SyncTransactions"
  | "RefreshBalances"
  | "ImportStatements"
  | "VerifyConnection"
  | "RotateCredentials"
  | "FetchCapabilities"
  | "HealthCheck";

export interface ExecutionContext {
  correlationId: string;
  commandKind: CommandKind;
  tenantId: string;
  legalEntityId?: string;
  region: BankingRegion;
  countryCode?: string;
  requestedCapabilities: ProviderCapability[];
  currentProvider?: BankProviderKind;
  preferredProtocol?: ConnectionProtocol;
  currency?: string;
  userId: string;
  sessionId?: string;
  auditId?: string;
  connectionId?: string;
  accountId?: string;
  metadata: Record<string, unknown>;
  startedAt: string;
}

export enum PipelineStage {
  VALIDATION = "VALIDATION",
  CAPABILITY_CHECK = "CAPABILITY_CHECK",
  PROVIDER_SELECTION = "PROVIDER_SELECTION",
  EXECUTION = "EXECUTION",
  RETRY = "RETRY",
  FALLBACK = "FALLBACK",
  AUDIT = "AUDIT",
  RESPONSE = "RESPONSE",
}

export interface PipelineState {
  currentStage: PipelineStage;
  context: ExecutionContext;
  result: ExecutionResult | null;
  errors: PipelineError[];
  fallbackAttempted: boolean;
  retryCount: number;
  startedAt: string;
}

export interface PipelineError {
  stage: PipelineStage;
  message: string;
  code: string;
  provider?: BankProviderKind;
  retryable: boolean;
  timestamp: string;
}

export interface ExecutionResult {
  success: boolean;
  data?: unknown;
  error?: PipelineError;
  providerUsed: BankProviderKind;
  durationMs: number;
  retryCount: number;
  fallbackCount: number;
}

export interface CommandInput {
  tenantId: string;
  legalEntityId?: string;
  region: BankingRegion;
  countryCode?: string;
  currency?: string;
  userId: string;
  sessionId?: string;
  connectionId?: string;
  accountId?: string;
  metadata?: Record<string, unknown>;
}
