type RetryOptions = {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
};

type RetryState = {
  operationId: string;
  attempt: number;
  maxAttempts: number;
  lastError: Error | null;
  nextRetryAt: Date | null;
  startedAt: Date;
};

const retryStates = new Map<string, RetryState>();

function calculateDelay(
  attempt: number,
  baseDelay: number,
  maxDelay: number,
): number {
  const exponential = baseDelay * Math.pow(2, attempt - 1);
  const capped = Math.min(exponential, maxDelay);
  const jitter = capped * (0.5 + Math.random() * 0.5);
  return Math.floor(jitter);
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  const baseDelay = options.baseDelay ?? 1000;
  const maxDelay = options.maxDelay ?? 30000;

  const operationId = crypto.randomUUID();

  const state: RetryState = {
    operationId,
    attempt: 0,
    maxAttempts,
    lastError: null,
    nextRetryAt: null,
    startedAt: new Date(),
  };
  retryStates.set(operationId, state);

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    state.attempt = attempt;
    try {
      const result = await operation();
      retryStates.delete(operationId);
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      state.lastError = lastError;

      if (attempt < maxAttempts) {
        const delay = calculateDelay(attempt, baseDelay, maxDelay);
        state.nextRetryAt = new Date(Date.now() + delay);
        retryStates.set(operationId, state);
        await sleep(delay);
      }
    }
  }

  retryStates.delete(operationId);
  throw lastError ?? new Error("Retry failed");
}

export function getRetryState(operationId: string): RetryState | undefined {
  return retryStates.get(operationId);
}

export function resetRetryState(operationId: string): void {
  retryStates.delete(operationId);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
