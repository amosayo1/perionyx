import type { CommandKind, ExecutionContext } from "../types";

export type RetryBreakerState = "CLOSED" | "OPEN" | "HALF_OPEN";

export interface RetryBreakerStatus {
  provider: string;
  state: RetryBreakerState;
  failureCount: number;
  successCount: number;
  failureThreshold: number;
  halfOpenMaxRequests: number;
  lastFailureAt: string | null;
  openedAt: string | null;
  nextAttemptAt: string | null;
}

export interface RetryStrategy {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffFactor: number;
  retryableErrorCodes: string[];
}

export const DEFAULT_RETRY_POLICY: RetryStrategy = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  backoffFactor: 2,
  retryableErrorCodes: [
    "EXECUTION_ERROR",
    "TIMEOUT",
    "RATE_LIMIT_EXCEEDED",
    "NETWORK_ERROR",
    "PROVIDER_UNAVAILABLE",
  ],
};

export interface DeadLetterEntry {
  id: string;
  correlationId: string;
  commandKind: CommandKind;
  tenantId: string;
  provider: string;
  error: string;
  context: ExecutionContext;
  failedAt: string;
  retryCount: number;
  lastAttemptAt: string;
}