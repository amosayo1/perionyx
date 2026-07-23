export interface CacheProviderConfig {
  type: "memory" | "redis";
  redis?: {
    host: string;
    port: number;
    password?: string;
    db?: number;
    keyPrefix?: string;
    enableReadyCheck?: boolean;
    maxRetriesPerRequest?: number;
    retryStrategy?: (times: number) => number | null;
  };
}

export interface EntityCacheConfig {
  ttlMs: number;
  slidingExpirationMs?: number;
  absoluteExpiration?: Date;
  enabled: boolean;
  tags: string[];
}

export interface QueryCacheConfig {
  ttlMs: number;
  enabled: boolean;
  maxEntries: number;
}

export interface CacheTierConfig {
  entity: EntityCacheConfig;
  query: QueryCacheConfig;
  aggregation: QueryCacheConfig;
  dashboard: EntityCacheConfig;
  metrics: EntityCacheConfig;
  forecast: EntityCacheConfig;
  permission: EntityCacheConfig;
  configuration: EntityCacheConfig;
  session: EntityCacheConfig;
}

export interface CacheConfig {
  provider: CacheProviderConfig;
  tiers: CacheTierConfig;
  compression: boolean;
  serialization: "json" | "msgpack";
  namespace: string;
  defaultTtlMs: number;
  maxKeyLength: number;
  gracefulDegradation: boolean;
}

export const defaultCacheConfig: CacheConfig = {
  provider: {
    type: "memory",
  },
  tiers: {
    entity: { ttlMs: 300000, enabled: true, tags: ["entity"] },
    query: { ttlMs: 60000, enabled: true, maxEntries: 5000 },
    aggregation: { ttlMs: 120000, enabled: true, maxEntries: 1000 },
    dashboard: { ttlMs: 15000, enabled: true, tags: ["dashboard"] },
    metrics: { ttlMs: 10000, enabled: true, tags: ["metrics"] },
    forecast: { ttlMs: 300000, enabled: true, tags: ["forecast"] },
    permission: { ttlMs: 600000, enabled: true, tags: ["permission"] },
    configuration: { ttlMs: 900000, enabled: true, tags: ["config"] },
    session: { ttlMs: 1800000, enabled: true, tags: ["session"] },
  },
  compression: false,
  serialization: "json",
  namespace: "perionyx",
  defaultTtlMs: 300000,
  maxKeyLength: 256,
  gracefulDegradation: true,
};

let activeConfig: CacheConfig = { ...defaultCacheConfig };

export function configureCache(config: Partial<CacheConfig>): void {
  activeConfig = { ...activeConfig, ...config };
}

export function getCacheConfig(): CacheConfig {
  return activeConfig;
}
