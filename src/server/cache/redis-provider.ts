import Redis from "ioredis";
import type { CacheProviderConfig } from "./cache-config";
import type { SerializedValue } from "./cache-utils";
import { serialize, deserialize } from "./cache-utils";
import { cacheEventBus } from "./cache-events";
import { cacheMetrics } from "./cache-metrics";
import { getCacheConfig } from "./cache-config";

export interface ICacheProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlMs?: number): Promise<void>;
  del(key: string): Promise<boolean>;
  delPattern(pattern: string): Promise<number>;
  exists(key: string): Promise<boolean>;
  ttl(key: string): Promise<number>;
  clear(): Promise<void>;
  mget<T>(keys: string[]): Promise<(T | null)[]>;
  mset<T>(entries: Map<string, T>, ttlMs?: number): Promise<void>;
  ping(): Promise<boolean>;
  size(): Promise<number>;
}

export class RedisCacheProvider implements ICacheProvider {
  private client: Redis | null = null;
  private connected = false;

  async initialize(config: CacheProviderConfig): Promise<void> {
    if (!config.redis) throw new Error("Redis configuration required");
    this.client = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      db: config.redis.db ?? 0,
      keyPrefix: config.redis.keyPrefix ?? "perionyx:",
      enableReadyCheck: config.redis.enableReadyCheck ?? true,
      maxRetriesPerRequest: config.redis.maxRetriesPerRequest ?? 3,
      retryStrategy: config.redis.retryStrategy ?? ((times) => {
        if (times > 3) return null;
        return Math.min(times * 200, 2000);
      }),
      lazyConnect: true,
    });
    try {
      await this.client.connect();
      this.connected = true;
    } catch {
      this.connected = false;
      if (getCacheConfig().gracefulDegradation) {
        console.warn("Redis unavailable — operating without cache");
      } else {
        throw new Error("Redis connection failed and graceful degradation is disabled");
      }
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.connected || !this.client) return null;
    const start = Date.now();
    try {
      const raw = await this.client.get(key);
      if (!raw) {
        cacheMetrics.recordMiss(key, Date.now() - start);
        return null;
      }
      const serialized: SerializedValue = JSON.parse(raw);
      const value = deserialize<T>(serialized);
      cacheMetrics.recordHit(key, Date.now() - start);
      cacheEventBus.emit({ type: "hit", key, latencyMs: Date.now() - start, timestamp: new Date(), namespace: "" });
      return value;
    } catch {
      cacheMetrics.recordError(key);
      cacheEventBus.emit({ type: "error", key, timestamp: new Date(), namespace: "" });
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    if (!this.connected || !this.client) return;
    const start = Date.now();
    try {
      const config = getCacheConfig();
      const serialized = serialize(value, config);
      if (ttlMs) serialized.ttlMs = ttlMs;
      const data = JSON.stringify(serialized);
      if (ttlMs) {
        await this.client.setex(key, Math.ceil(ttlMs / 1000), data);
      } else {
        await this.client.set(key, data);
      }
      cacheMetrics.recordSet(key, Date.now() - start);
      cacheEventBus.emit({ type: "set", key, latencyMs: Date.now() - start, size: data.length, timestamp: new Date(), namespace: "" });
    } catch {
      cacheMetrics.recordError(key);
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.connected || !this.client) return false;
    try {
      const result = await this.client.del(key);
      cacheMetrics.recordInvalidation(key);
      cacheEventBus.emit({ type: "invalidation", key, timestamp: new Date(), namespace: "" });
      return result > 0;
    } catch {
      return false;
    }
  }

  async delPattern(pattern: string): Promise<number> {
    if (!this.connected || !this.client) return 0;
    try {
      let cursor = "0";
      let deleted = 0;
      do {
        const [nextCursor, keys] = await this.client.scan(cursor, "MATCH", pattern, "COUNT", 100);
        cursor = nextCursor;
        if (keys.length > 0) {
          await this.client.del(...keys);
          deleted += keys.length;
        }
      } while (cursor !== "0");
      cacheEventBus.emit({ type: "invalidate_pattern", pattern, timestamp: new Date(), namespace: "" });
      return deleted;
    } catch {
      return 0;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.connected || !this.client) return false;
    try {
      const result = await this.client.exists(key);
      return result > 0;
    } catch {
      return false;
    }
  }

  async ttl(key: string): Promise<number> {
    if (!this.connected || !this.client) return -2;
    try {
      return await this.client.ttl(key);
    } catch {
      return -2;
    }
  }

  async clear(): Promise<void> {
    if (!this.connected || !this.client) return;
    try {
      await this.client.flushdb();
      cacheEventBus.emit({ type: "clear", timestamp: new Date(), namespace: "" });
    } catch {
      // ignore
    }
  }

  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    if (!this.connected || !this.client) return keys.map(() => null);
    try {
      const raw = await this.client.mget(keys);
      return raw.map((r) => {
        if (!r) return null;
        const serialized: SerializedValue = JSON.parse(r);
        return deserialize<T>(serialized);
      });
    } catch {
      return keys.map(() => null);
    }
  }

  async mset<T>(entries: Map<string, T>, ttlMs?: number): Promise<void> {
    if (!this.connected || !this.client) return;
    try {
      const pipeline = this.client.pipeline();
      const config = getCacheConfig();
      for (const [key, value] of entries) {
        const serialized = serialize(value, config);
        if (ttlMs) serialized.ttlMs = ttlMs;
        const data = JSON.stringify(serialized);
        if (ttlMs) {
          pipeline.setex(key, Math.ceil(ttlMs / 1000), data);
        } else {
          pipeline.set(key, data);
        }
      }
      await pipeline.exec();
    } catch {
      // ignore
    }
  }

  async ping(): Promise<boolean> {
    if (!this.client) return false;
    try {
      await this.client.ping();
      return true;
    } catch {
      return false;
    }
  }

  async size(): Promise<number> {
    if (!this.connected || !this.client) return 0;
    try {
      const info = await this.client.info("keyspace");
      const match = info.match(/keys=(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    } catch {
      return 0;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.connected = false;
    }
  }
}
