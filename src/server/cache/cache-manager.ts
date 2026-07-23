import type { ICacheProvider } from "./redis-provider";
import { RedisCacheProvider } from "./redis-provider";
import { CacheKeyBuilder } from "./cache-keys";
import { cacheMetrics } from "./cache-metrics";
import { cacheEventBus } from "./cache-events";
import { getCacheConfig, configureCache, type CacheConfig } from "./cache-config";
import { createCacheHash } from "./cache-utils";

class MemoryCacheProvider implements ICacheProvider {
  private store = new Map<string, { data: string; expiresAt: number }>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt > 0 && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return JSON.parse(entry.data) as T;
  }

  async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    this.store.set(key, {
      data: JSON.stringify(value),
      expiresAt: ttlMs ? Date.now() + ttlMs : 0,
    });
  }

  async del(key: string): Promise<boolean> {
    return this.store.delete(key);
  }

  async delPattern(pattern: string): Promise<number> {
    const regex = new RegExp(pattern.replace(/\*/g, ".*"));
    let count = 0;
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
        count++;
      }
    }
    return count;
  }

  async exists(key: string): Promise<boolean> {
    return this.store.has(key);
  }

  async ttl(key: string): Promise<number> {
    const entry = this.store.get(key);
    if (!entry) return -2;
    if (entry.expiresAt === 0) return -1;
    return Math.max(0, Math.floor((entry.expiresAt - Date.now()) / 1000));
  }

  async clear(): Promise<void> {
    this.store.clear();
  }

  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    return Promise.all(keys.map((k) => this.get<T>(k)));
  }

  async mset<T>(entries: Map<string, T>, ttlMs?: number): Promise<void> {
    for (const [key, value] of entries) {
      await this.set(key, value, ttlMs);
    }
  }

  async ping(): Promise<boolean> {
    return true;
  }

  async size(): Promise<number> {
    return this.store.size;
  }
}

export class CacheManager {
  private provider: ICacheProvider;
  private initialized = false;

  constructor() {
    this.provider = new MemoryCacheProvider();
  }

  async initialize(config?: Partial<CacheConfig>): Promise<void> {
    if (this.initialized) return;
    if (config) configureCache(config);
    const activeConfig = getCacheConfig();

    if (activeConfig.provider.type === "redis") {
      const redisProvider = new RedisCacheProvider();
      try {
        await redisProvider.initialize(activeConfig.provider);
        this.provider = redisProvider;
      } catch {
        if (!activeConfig.gracefulDegradation) throw new Error("Redis unavailable and graceful degradation disabled");
        this.provider = new MemoryCacheProvider();
      }
    }
    this.initialized = true;
  }

  async getEntity<T>(entityType: string, id: string): Promise<T | null> {
    const config = getCacheConfig();
    if (!config.tiers.entity.enabled) return null;
    const key = CacheKeyBuilder.entity(entityType, id);
    const start = Date.now();
    const value = await this.provider.get<T>(key);
    if (value) cacheMetrics.recordHit("entity", Date.now() - start);
    else cacheMetrics.recordMiss("entity", Date.now() - start);
    return value;
  }

  async setEntity<T>(entityType: string, id: string, value: T): Promise<void> {
    const config = getCacheConfig();
    if (!config.tiers.entity.enabled) return;
    const key = CacheKeyBuilder.entity(entityType, id);
    await this.provider.set(key, value, config.tiers.entity.ttlMs);
  }

  async getQuery<T>(repository: string, query: string): Promise<T | null> {
    const config = getCacheConfig();
    if (!config.tiers.query.enabled) return null;
    const hash = createCacheHash(query);
    const key = CacheKeyBuilder.query(repository, hash);
    return this.provider.get<T>(key);
  }

  async setQuery<T>(repository: string, query: string, value: T): Promise<void> {
    const config = getCacheConfig();
    if (!config.tiers.query.enabled) return;
    const hash = createCacheHash(query);
    const key = CacheKeyBuilder.query(repository, hash);
    await this.provider.set(key, value, config.tiers.query.ttlMs);
  }

  async getAggregation<T>(name: string, params: string): Promise<T | null> {
    const config = getCacheConfig();
    if (!config.tiers.aggregation.enabled) return null;
    const key = CacheKeyBuilder.aggregation(name, params);
    return this.provider.get<T>(key);
  }

  async setAggregation<T>(name: string, params: string, value: T): Promise<void> {
    const config = getCacheConfig();
    if (!config.tiers.aggregation.enabled) return;
    const key = CacheKeyBuilder.aggregation(name, params);
    await this.provider.set(key, value, config.tiers.aggregation.ttlMs);
  }

  async getDashboard<T>(name: string, companyId: string): Promise<T | null> {
    const config = getCacheConfig();
    if (!config.tiers.dashboard.enabled) return null;
    const key = CacheKeyBuilder.dashboard(name, companyId);
    return this.provider.get<T>(key);
  }

  async setDashboard<T>(name: string, companyId: string, value: T): Promise<void> {
    const config = getCacheConfig();
    if (!config.tiers.dashboard.enabled) return;
    const key = CacheKeyBuilder.dashboard(name, companyId);
    await this.provider.set(key, value, config.tiers.dashboard.ttlMs);
  }

  async invalidateEntity(entityType: string, id: string): Promise<boolean> {
    const key = CacheKeyBuilder.entity(entityType, id);
    return this.provider.del(key);
  }

  async invalidatePattern(pattern: string): Promise<number> {
    return this.provider.delPattern(CacheKeyBuilder.pattern(pattern));
  }

  async invalidateByTag(tag: string): Promise<number> {
    return this.provider.delPattern(CacheKeyBuilder.tagPattern(tag));
  }

  async clear(): Promise<void> {
    await this.provider.clear();
  }

  async getMetrics(): Promise<ReturnType<typeof cacheMetrics.getAggregate>> {
    return cacheMetrics.getAggregate();
  }

  async ping(): Promise<boolean> {
    return this.provider.ping();
  }

  getProvider(): ICacheProvider {
    return this.provider;
  }

  async health(): Promise<{ status: string; message: string }> {
    const ping = await this.ping();
    const metrics = await this.getMetrics();
    if (!ping) return { status: "unhealthy", message: "Cache provider unreachable" };
    if (metrics.errors > 50) return { status: "unhealthy", message: "High cache error rate" };
    if (metrics.errors > 10) return { status: "degraded", message: "Elevated cache error rate" };
    return { status: "healthy", message: "Cache operational" };
  }
}

export const cacheManager = new CacheManager();
