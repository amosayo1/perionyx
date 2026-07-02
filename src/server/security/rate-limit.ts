import Redis from "ioredis";
import { RateLimiterRedis } from "rate-limiter-flexible";

// ---------------------------------------------------------------------------
// In-memory fallback store (used when REDIS_URL is not set)
// ---------------------------------------------------------------------------
type RateLimitEntry = { count: number; resetAt: number };
const memStore = new Map<string, RateLimitEntry>();

function memRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): { ok: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = memStore.get(key);
  if (!entry || now > entry.resetAt) {
    memStore.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }
  entry.count += 1;
  if (entry.count > maxRequests) {
    return { ok: false, remaining: 0, resetAt: entry.resetAt };
  }
  return { ok: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}

// ---------------------------------------------------------------------------
// Redis-backed rate limiter (when REDIS_URL is set)
// ---------------------------------------------------------------------------
let redis: Redis | null = null;
const limiters = new Map<string, RateLimiterRedis>();
let redisAvailable: boolean | null = null;

function getRedisUrl(): string {
  return process.env.REDIS_URL ?? "";
}

function getRedis(): Redis | null {
  if (redisAvailable === false) return null;
  if (redis) return redis;
  const url = getRedisUrl();
  if (!url) {
    redisAvailable = false;
    return null;
  }
  try {
    redis = new Redis(url, {
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 100, 3000);
      },
      lazyConnect: true,
    });
    redis.on("error", () => {
      redisAvailable = false;
    });
    redisAvailable = true;
    return redis;
  } catch {
    redisAvailable = false;
    return null;
  }
}

function getLimiter(key: string, points: number, duration: number): RateLimiterRedis | null {
  const client = getRedis();
  if (!client) return null;
  const cacheKey = `${key}:${points}:${duration}`;
  let limiter = limiters.get(cacheKey);
  if (!limiter) {
    limiter = new RateLimiterRedis({
      storeClient: client,
      points,
      duration,
      keyPrefix: `rl:${key}`,
    });
    limiters.set(cacheKey, limiter);
  }
  return limiter;
}

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number;
};

export async function rateLimit(
  key: string,
  maxRequests: number = 20,
  windowMs: number = 5 * 60 * 1000,
): Promise<RateLimitResult> {
  const limiter = getLimiter(key, maxRequests, Math.ceil(windowMs / 1000));
  if (!limiter) {
    return memRateLimit(key, maxRequests, windowMs);
  }
  try {
    const result = await limiter.consume(key);
    return {
      ok: true,
      remaining: result.remainingPoints,
      resetAt: Date.now() + result.msBeforeNext,
    };
  } catch (err: unknown) {
    if (err instanceof Error && "msBeforeNext" in err) {
      const rateLimitErr = err as { msBeforeNext: number };
      return {
        ok: false,
        remaining: 0,
        resetAt: Date.now() + rateLimitErr.msBeforeNext,
      };
    }
    return { ok: false, remaining: 0, resetAt: Date.now() + 60000 };
  }
}

export function rateLimitKey(prefix: string, identifier: string): string {
  return `${prefix}:${identifier}`;
}
