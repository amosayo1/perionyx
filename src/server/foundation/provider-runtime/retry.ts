/**
 * Enterprise Provider Runtime — Retry Helper
 *
 * Phase 24.0
 *
 * Exponential backoff with jitter for transient failures.
 */

export interface RetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  /** Backoff multiplier. Default: 2 */
  multiplier?: number;
  /** Jitter factor (0-1). Default: 0.2 */
  jitter?: number;
}

export interface RetryResult<T> {
  success: boolean;
  data: T | null;
  error: Error | null;
  attempts: number;
  totalDelayMs: number;
}

/**
 * Execute a function with exponential backoff retry.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig,
  isRetryable?: (error: Error) => boolean,
): Promise<RetryResult<T>> {
  const { maxAttempts, initialDelayMs, maxDelayMs, multiplier = 2, jitter = 0.2 } = config;
  let lastError: Error | null = null;
  let totalDelayMs = 0;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const data = await fn();
      return { success: true, data, error: null, attempts: attempt, totalDelayMs };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if error is retryable
      if (isRetryable && !isRetryable(lastError)) {
        return { success: false, data: null, error: lastError, attempts: attempt, totalDelayMs };
      }

      // Don't retry on last attempt
      if (attempt === maxAttempts) break;

      // Calculate delay with exponential backoff + jitter
      const baseDelay = Math.min(initialDelayMs * Math.pow(multiplier, attempt - 1), maxDelayMs);
      const jitterAmount = baseDelay * jitter * Math.random();
      const delay = Math.round(baseDelay + jitterAmount);

      totalDelayMs += delay;
      await sleep(delay);
    }
  }

  return { success: false, data: null, error: lastError, attempts: maxAttempts, totalDelayMs };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
