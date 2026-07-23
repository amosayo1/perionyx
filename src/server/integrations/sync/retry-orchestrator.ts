import { recordRetry } from "./metrics";
import type { RetryBudget } from "./types";

export interface RetryPolicy {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitter: boolean;
  exponentialBase: number;
  retryableErrors: string[];
}

export const syncRetryPolicy: RetryPolicy = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  jitter: true,
  exponentialBase: 2,
  retryableErrors: ["ConnectionError", "RateLimitError", "TimeoutError", "SyncError"],
};

const retryBudgets = new Map<string, RetryBudget>();

export function calculateBackoff(attempt: number, policy: RetryPolicy = syncRetryPolicy): number {
  const delay = policy.baseDelayMs * Math.pow(policy.exponentialBase, attempt);
  const clamped = Math.min(delay, policy.maxDelayMs);

  if (!policy.jitter) return clamped;

  const jitterRange = clamped * 0.25;
  return clamped - jitterRange + Math.random() * jitterRange * 2;
}

export function shouldRetry(attempt: number, policy: RetryPolicy = syncRetryPolicy): boolean {
  return attempt < policy.maxRetries;
}

export function isRetryableError(error: Error, policy: RetryPolicy = syncRetryPolicy): boolean {
  return policy.retryableErrors.includes(error.name) || (error as { retryable?: boolean }).retryable === true;
}

export function createRetryBudget(total: number, windowMs: number): RetryBudget {
  const budget: RetryBudget = {
    total,
    remaining: total,
    resetAt: new Date(Date.now() + windowMs),
    windowMs,
  };
  return budget;
}

export function consumeRetryBudget(budgetKey: string): boolean {
  let budget = retryBudgets.get(budgetKey);
  if (!budget) return false;

  if (Date.now() >= budget.resetAt.getTime()) {
    budget.remaining = budget.total;
    budget.resetAt = new Date(Date.now() + budget.windowMs);
  }

  if (budget.remaining <= 0) return false;

  budget.remaining--;
  retryBudgets.set(budgetKey, budget);
  return true;
}

export function getRetryBudget(budgetKey: string): RetryBudget | undefined {
  return retryBudgets.get(budgetKey);
}

export function setRetryBudget(budgetKey: string, budget: RetryBudget): void {
  retryBudgets.set(budgetKey, budget);
}

export function resetRetryBudget(budgetKey: string): void {
  retryBudgets.delete(budgetKey);
}

export async function executeWithRetry(
  sessionId: string,
  budgetKey: string,
  operation: () => Promise<void>,
  policy: RetryPolicy = syncRetryPolicy,
  onRetry?: (error: Error, attempt: number) => void,
  deadLetter?: (error: Error, lastAttempt: number) => void,
): Promise<void> {
  let lastError: Error = new Error("Max retries exceeded");

  for (let attempt = 0; attempt <= policy.maxRetries; attempt++) {
    try {
      if (!consumeRetryBudget(budgetKey)) {
        throw new Error("Retry budget exhausted");
      }
      await operation();
      return;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (!isRetryableError(lastError, policy)) {
        throw lastError;
      }

      recordRetry(sessionId);

      if (onRetry) {
        onRetry(lastError, attempt);
      }

      if (!shouldRetry(attempt + 1, policy)) {
        if (deadLetter) {
          deadLetter(lastError, attempt);
        }
        throw lastError;
      }

      const delay = calculateBackoff(attempt, policy);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
