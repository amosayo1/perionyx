/**
 * Enterprise Provider Runtime — Rate Limiter
 *
 * Phase 24.0
 *
 * Token bucket rate limiter per provider.
 */

export class RateLimiter {
  private tokens: number;
  private lastRefillAt: number;
  private readonly maxTokens: number;
  private readonly refillRateMs: number;

  constructor(
    rpm: number,
    burstSize: number,
  ) {
    this.maxTokens = burstSize;
    this.tokens = burstSize;
    this.refillRateMs = 60_000 / rpm; // ms per token
    this.lastRefillAt = Date.now();
  }

  /**
   * Try to consume a token. Returns true if allowed.
   */
  tryAcquire(): boolean {
    this.refill();
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }
    return false;
  }

  /**
   * Get time until next token is available (ms).
   */
  waitTimeMs(): number {
    if (this.tokens >= 1) return 0;
    return Math.ceil(this.refillRateMs - (Date.now() - this.lastRefillAt));
  }

  /**
   * Get current token count.
   */
  getTokens(): number {
    this.refill();
    return this.tokens;
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefillAt;
    const tokensToAdd = Math.floor(elapsed / this.refillRateMs);
    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
      this.lastRefillAt = now;
    }
  }
}
