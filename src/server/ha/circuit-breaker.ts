export class CircuitBreaker {
  private state: "closed" | "open" | "half-open" = "closed";
  private failureCount = 0;
  private lastFailureTime = 0;
  private readonly threshold: number;
  private readonly recoveryTimeout: number;

  constructor(threshold = 5, recoveryTimeoutMs = 30000) {
    this.threshold = threshold;
    this.recoveryTimeout = recoveryTimeoutMs;
  }

  async call<T>(fn: () => Promise<T>, fallback?: () => Promise<T>): Promise<T> {
    if (this.state === "open") {
      if (Date.now() - this.lastFailureTime >= this.recoveryTimeout) {
        this.state = "half-open";
      } else if (fallback) {
        return fallback();
      } else {
        throw new Error("Circuit breaker is open");
      }
    }

    try {
      const result = await fn();
      if (this.state === "half-open") {
        this.state = "closed";
        this.failureCount = 0;
      }
      return result;
    } catch (err) {
      this.failureCount++;
      this.lastFailureTime = Date.now();
      if (this.failureCount >= this.threshold) {
        this.state = "open";
      }
      if (fallback) return fallback();
      throw err;
    }
  }

  getState(): string {
    return this.state;
  }

  reset(): void {
    this.state = "closed";
    this.failureCount = 0;
  }
}

export class AutoReconnect {
  private attempts = 0;
  private readonly maxAttempts: number;
  private readonly baseDelay: number;

  constructor(maxAttempts = 5, baseDelayMs = 1000) {
    this.maxAttempts = maxAttempts;
    this.baseDelay = baseDelayMs;
  }

  async connect<T>(connectFn: () => Promise<T>): Promise<T | null> {
    while (this.attempts < this.maxAttempts) {
      try {
        const result = await connectFn();
        this.attempts = 0;
        return result;
      } catch {
        this.attempts++;
        if (this.attempts >= this.maxAttempts) return null;
        await this.delay(this.baseDelay * Math.pow(2, this.attempts - 1));
      }
    }
    return null;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getAttempts(): number {
    return this.attempts;
  }

  reset(): void {
    this.attempts = 0;
  }
}
