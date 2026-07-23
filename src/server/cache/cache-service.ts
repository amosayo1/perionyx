import { getRedisClient, isRedisAvailable } from "./redis";
import { logger } from "@/lib/logger";

// ---------------------------------------------------------------------------
// Cache tiers (in seconds)
// ---------------------------------------------------------------------------
export const CacheTier = {
  SHORT: 30, // 5-60s — dashboard metrics, KPIs
  MEDIUM: 300, // 1-15m — analytics, charts
  LONG: 3600, // 30-120m — metadata, tax definitions
  PERMANENT: 0, // manual invalidation only
  NEVER: -1, // skip cache
} as const;

export type CacheTierValue = (typeof CacheTier)[keyof typeof CacheTier];

// ---------------------------------------------------------------------------
// Statistics
// ---------------------------------------------------------------------------
let hits = 0;
let misses = 0;
const latencyBuckets = new Map<string, number[]>();

function recordLatency(operation: string, ms: number): void {
  const bucket = latencyBuckets.get(operation) ?? [];
  bucket.push(ms);
  if (bucket.length > 1000) bucket.shift();
  latencyBuckets.set(operation, bucket);
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRatio: number;
  redisAvailable: boolean;
  latency: Record<string, { avg: number; p95: number; count: number }>;
}

export function getCacheStats(): CacheStats {
  const latency: Record<string, { avg: number; p95: number; count: number }> = {};
  for (const [op, times] of latencyBuckets) {
    if (times.length === 0) continue;
    const sorted = [...times].sort((a, b) => a - b);
    const avg = times.reduce((s, v) => s + v, 0) / times.length;
    const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? 0;
    latency[op] = { avg: Math.round(avg * 100) / 100, p95, count: times.length };
  }
  return {
    hits,
    misses,
    hitRatio: hits + misses > 0 ? hits / (hits + misses) : 0,
    redisAvailable: isRedisAvailable(),
    latency,
  };
}

export function resetCacheStats(): void {
  hits = 0;
  misses = 0;
  latencyBuckets.clear();
}

// ---------------------------------------------------------------------------
// Cache wrapper — functional style
// ---------------------------------------------------------------------------
export async function getCached<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: CacheTierValue = CacheTier.MEDIUM,
): Promise<T> {
  if (ttl === CacheTier.NEVER) {
    return fetchFn();
  }

  if (ttl === CacheTier.PERMANENT) {
    const client = getRedisClient();
    if (client) {
      try {
        const start = Date.now();
        const raw = await client.get(key);
        recordLatency("get", Date.now() - start);
        if (raw) {
          hits++;
          return JSON.parse(raw) as T;
        }
      } catch (err) {
        logger.warn({ err, key, ttl: "PERMANENT" }, "[Cache] get error");
      }
    }

    const result = await fetchFn();
    if (client) {
      try {
        const start = Date.now();
        await client.set(key, JSON.stringify(result));
        recordLatency("set", Date.now() - start);
      } catch (err) {
        logger.warn({ err, key, ttl: "PERMANENT" }, "[Cache] set error");
      }
    }
    return result;
  }

  // TTL-based caching (SHORT, MEDIUM, LONG)
  if (ttl > 0) {
    const attempts = await tryCache<T>(key, fetchFn, ttl);
    return attempts;
  }

  return fetchFn();
}

async function tryCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number,
): Promise<T> {
  const now = Date.now();

  // Attempt Redis get
  const result = await redisGet<T>(key);
  if (result !== null) {
    hits++;
    return result;
  }
  misses++;

  // Fetch from source
  const startFetch = Date.now();
  const value = await fetchFn();
  recordLatency("fetch", Date.now() - startFetch);

  // Populate cache (fire-and-forget — never block on cache write)
  void redisSet(key, value, ttl);

  return value;
}

async function redisGet<T>(key: string): Promise<T | null> {
  const client = getRedisClient();
  if (!client) return null;
  try {
    const start = Date.now();
    const raw = await client.get(key);
    recordLatency("get", Date.now() - start);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function redisSet<T>(key: string, value: T, ttl: number): Promise<void> {
  const client = getRedisClient();
  if (!client) return;
  try {
    const start = Date.now();
    await client.setex(key, ttl, JSON.stringify(value));
    recordLatency("set", Date.now() - start);
  } catch (err) {
    logger.warn({ err, key, ttl }, "[Cache] setex error");
  }
}

// ---------------------------------------------------------------------------
// Manual operations
// ---------------------------------------------------------------------------
export async function invalidateKey(key: string): Promise<void> {
  const client = getRedisClient();
  if (!client) return;
  try {
    await client.del(key);
  } catch (err) {
    logger.warn({ err, key }, "[Cache] invalidation error");
  }
}

export async function invalidatePattern(pattern: string): Promise<void> {
  const client = getRedisClient();
  if (!client) return;
  try {
    let cursor = "0";
    do {
      const result = await client.scan(cursor, "MATCH", pattern, "COUNT", 100);
      cursor = result[0];
      const keys = result[1];
      if (keys.length > 0) {
        await client.del(...keys);
      }
    } while (cursor !== "0");
  } catch (err) {
    logger.warn({ err, pattern }, "[Cache] pattern invalidation error");
  }
}

export async function get<T>(key: string): Promise<T | null> {
  return redisGet<T>(key);
}

export async function set<T>(
  key: string,
  value: T,
  ttl: CacheTierValue,
): Promise<void> {
  if (ttl === CacheTier.PERMANENT) {
    const client = getRedisClient();
    if (!client) return;
    try {
      await client.set(key, JSON.stringify(value));
    } catch (err) {
      logger.warn({ err, key }, "[Cache] set error");
    }
    return;
  }
  if (ttl > 0) {
    return redisSet(key, value, ttl);
  }
}

// ---------------------------------------------------------------------------
// Distributed lock (for future use)
// ---------------------------------------------------------------------------
export async function acquireLock(
  lockKey: string,
  ttlMs = 10_000,
): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;
  try {
    const result = await client.set(
      lockKey,
      "1",
      "PX",
      ttlMs,
      "NX",
    );
    return result === "OK";
  } catch {
    return false;
  }
}

export async function releaseLock(lockKey: string): Promise<void> {
  const client = getRedisClient();
  if (!client) return;
  try {
    await client.del(lockKey);
  } catch {
    // best-effort release
  }
}
