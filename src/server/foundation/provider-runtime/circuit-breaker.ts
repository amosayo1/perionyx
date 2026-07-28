/**
 * Enterprise Provider Runtime — Circuit Breaker
 *
 * Phase 24.0
 *
 * Prevents cascading failures by stopping requests to a failing provider.
 */

export enum CircuitState {
  CLOSED = "CLOSED",
  OPEN = "OPEN",
  HALF_OPEN = "HALF_OPEN",
}

export class CircuitBreaker {
  private state = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureAt: Date | null = null;
  private lastSuccessAt: Date | null = null;
  private halfOpenAttempts = 0;

  constructor(
    private threshold: number,
    private resetMs: number,
  ) {}

  getState(): CircuitState {
    if (this.state === CircuitState.OPEN) {
      // Check if reset timeout has elapsed
      if (this.lastFailureAt && Date.now() - this.lastFailureAt.getTime() >= this.resetMs) {
        this.state = CircuitState.HALF_OPEN;
        this.halfOpenAttempts = 0;
      }
    }
    return this.state;
  }

  /**
   * Record a successful request.
   */
  recordSuccess(): void {
    this.lastSuccessAt = new Date();
    if (this.state === CircuitState.HALF_OPEN) {
      // Success in half-open → close the circuit
      this.state = CircuitState.CLOSED;
      this.failureCount = 0;
      this.halfOpenAttempts = 0;
    } else if (this.state === CircuitState.CLOSED) {
      this.failureCount = 0;
    }
  }

  /**
   * Record a failed request.
   */
  recordFailure(): void {
    this.failureCount++;
    this.lastFailureAt = new Date();

    if (this.state === CircuitState.HALF_OPEN) {
      // Failure in half-open → re-open circuit
      this.state = CircuitState.OPEN;
      this.halfOpenAttempts = 0;
    } else if (this.failureCount >= this.threshold) {
      this.state = CircuitState.OPEN;
    }
  }

  /**
   * Check if a request should be allowed.
   */
  allowRequest(): boolean {
    const state = this.getState();
    if (state === CircuitState.CLOSED) return true;
    if (state === CircuitState.HALF_OPEN) {
      return this.halfOpenAttempts++ < 3; // Allow limited probes
    }
    return false; // OPEN
  }

  /**
   * Force reset the circuit breaker.
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.lastFailureAt = null;
    this.halfOpenAttempts = 0;
  }

  /**
   * Get circuit breaker metrics.
   */
  getMetrics(): {
    state: CircuitState;
    failureCount: number;
    lastFailureAt: Date | null;
    lastSuccessAt: Date | null;
  } {
    return {
      state: this.getState(),
      failureCount: this.failureCount,
      lastFailureAt: this.lastFailureAt,
      lastSuccessAt: this.lastSuccessAt,
    };
  }
}
