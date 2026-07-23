export interface RetryPolicy {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitter: boolean;
  exponentialBase: number;
}

export const defaultRetryPolicy: RetryPolicy = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  jitter: true,
  exponentialBase: 2,
};

export function calculateBackoff(
  attempt: number,
  policy: RetryPolicy = defaultRetryPolicy,
): number {
  const delay = policy.baseDelayMs * Math.pow(policy.exponentialBase, attempt);
  const clamped = Math.min(delay, policy.maxDelayMs);

  if (!policy.jitter) return clamped;

  const jitterRange = clamped * 0.25;
  return clamped - jitterRange + Math.random() * jitterRange * 2;
}

export function shouldRetry(
  attempt: number,
  policy: RetryPolicy = defaultRetryPolicy,
): boolean {
  return attempt < policy.maxRetries;
}

export function isRetryableError(error: Error): boolean {
  return (
    error.name === "ConnectionError" ||
    error.name === "RateLimitError" ||
    error.name === "SyncError" ||
    error.name === "WebhookError" ||
    error.name === "TimeoutError" ||
    (error as { retryable?: boolean }).retryable === true
  );
}

export type RetryHandler<T> = () => Promise<T>;

export type RetryErrorHandler = (error: Error, attempt: number) => void | Promise<void>;

export class RetryCircuitBreaker {
  private failures = 0;
  private lastFailureAt = 0;
  private open = false;

  constructor(
    private readonly threshold = 5,
    private readonly cooldownMs = 60000,
  ) {}

  recordSuccess(): void {
    this.failures = 0;
    this.open = false;
  }

  recordFailure(): void {
    this.failures++;
    this.lastFailureAt = Date.now();
    if (this.failures >= this.threshold) {
      this.open = true;
    }
  }

  isOpen(): boolean {
    if (!this.open) return false;
    if (Date.now() - this.lastFailureAt >= this.cooldownMs) {
      this.open = false;
      return false;
    }
    return true;
  }

  getState(): "closed" | "open" | "half-open" {
    if (!this.open) return "closed";
    if (Date.now() - this.lastFailureAt >= this.cooldownMs) return "half-open";
    return "open";
  }

  reset(): void {
    this.failures = 0;
    this.lastFailureAt = 0;
    this.open = false;
  }
}

export async function withRetry<T>(
  handler: RetryHandler<T>,
  options?: {
    policy?: RetryPolicy;
    circuitBreaker?: RetryCircuitBreaker;
    onRetry?: RetryErrorHandler;
    deadLetter?: (error: Error, lastAttempt: number) => void | Promise<void>;
  },
): Promise<T> {
  const policy = options?.policy ?? defaultRetryPolicy;
  const circuitBreaker = options?.circuitBreaker;

  if (circuitBreaker?.isOpen()) {
    throw new Error("Circuit breaker is open");
  }

  let lastError: Error = new Error("Max retries exceeded");

  for (let attempt = 0; attempt <= policy.maxRetries; attempt++) {
    try {
      const result = await handler();
      circuitBreaker?.recordSuccess();
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (!isRetryableError(lastError)) {
        throw lastError;
      }

      circuitBreaker?.recordFailure();

      if (options?.onRetry) {
        await options.onRetry(lastError, attempt);
      }

      if (!shouldRetry(attempt + 1, policy)) {
        if (options?.deadLetter) {
          await options.deadLetter(lastError, attempt);
        }
        throw lastError;
      }

      const delay = calculateBackoff(attempt, policy);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
