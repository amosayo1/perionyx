import { logger } from "@/lib/logger";

export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffFactor: number;
  retryableStatusCodes: number[];
}

const DEFAULT_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  backoffFactor: 2,
  retryableStatusCodes: [429, 500, 502, 503, 504],
};

function isRetryable(error: unknown, config: RetryConfig): boolean {
  if (error instanceof TypeError) return true;

  if (error instanceof Response) {
    return config.retryableStatusCodes.includes(error.status);
  }

  if (error && typeof error === "object" && "status" in error) {
    const status = (error as { status: number }).status;
    return config.retryableStatusCodes.includes(status);
  }

  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code: string }).code;
    if (code === "ECONNRESET" || code === "ETIMEDOUT" || code === "ECONNREFUSED") return true;
  }

  return false;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  config?: Partial<RetryConfig>,
  context?: string,
): Promise<T> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  let lastError: unknown;

  for (let attempt = 1; attempt <= cfg.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === cfg.maxRetries || !isRetryable(error, cfg)) {
        throw error;
      }

      const backoff = Math.min(
        cfg.baseDelayMs * Math.pow(cfg.backoffFactor, attempt - 1),
        cfg.maxDelayMs,
      );

      logger.warn(
        { attempt, maxRetries: cfg.maxRetries, backoff, context },
        `[AI Retry] Attempt ${attempt}/${cfg.maxRetries} failed, retrying in ${backoff}ms`,
      );

      await delay(backoff);
    }
  }

  throw lastError;
}
