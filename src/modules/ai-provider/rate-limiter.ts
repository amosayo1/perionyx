export interface RateLimitConfig {
  requestsPerMinute: number;
  tokensPerMinute: number;
}

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

class RateLimiter {
  private requestBuckets = new Map<string, TokenBucket>();
  private tokenBuckets = new Map<string, TokenBucket>();

  private getBucket(
    buckets: Map<string, TokenBucket>,
    key: string,
    maxTokens: number,
    refillRate: number,
  ): TokenBucket {
    let bucket = buckets.get(key);
    const now = Date.now();

    if (!bucket) {
      bucket = { tokens: maxTokens, lastRefill: now };
      buckets.set(key, bucket);
    }

    const elapsed = (now - bucket.lastRefill) / 1000;
    bucket.tokens = Math.min(maxTokens, bucket.tokens + elapsed * refillRate);
    bucket.lastRefill = now;

    return bucket;
  }

  tryAcquire(key: string, config: RateLimitConfig): { allowed: boolean; retryAfterMs: number } {
    const now = Date.now();

    const reqBucket = this.getBucket(
      this.requestBuckets,
      `req:${key}`,
      config.requestsPerMinute,
      config.requestsPerMinute / 60,
    );

    if (reqBucket.tokens < 1) {
      const waitTime = (1 - reqBucket.tokens) * 60000 / config.requestsPerMinute;
      return { allowed: false, retryAfterMs: Math.ceil(waitTime) };
    }

    reqBucket.tokens -= 1;
    return { allowed: true, retryAfterMs: 0 };
  }

  tryAcquireTokens(key: string, tokens: number, config: RateLimitConfig): { allowed: boolean; retryAfterMs: number } {
    const tokenBucket = this.getBucket(
      this.tokenBuckets,
      `tokens:${key}`,
      config.tokensPerMinute,
      config.tokensPerMinute / 60,
    );

    if (tokenBucket.tokens < tokens) {
      const waitTime = (tokens - tokenBucket.tokens) * 60000 / config.tokensPerMinute;
      return { allowed: false, retryAfterMs: Math.ceil(waitTime) };
    }

    tokenBucket.tokens -= tokens;
    return { allowed: true, retryAfterMs: 0 };
  }

  reset(): void {
    this.requestBuckets.clear();
    this.tokenBuckets.clear();
  }
}

export const rateLimiter = new RateLimiter();
