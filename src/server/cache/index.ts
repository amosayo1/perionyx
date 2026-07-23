export type { ICacheProvider } from "./redis-provider";
export { RedisCacheProvider } from "./redis-provider";
export { CacheManager, cacheManager } from "./cache-manager";
export { CacheKeyBuilder } from "./cache-keys";
export { cacheMetrics } from "./cache-metrics";
export { cacheEventBus, type CacheEvent, type CacheEventType, type CacheEventHandler } from "./cache-events";
export { CacheHealthMonitor, cacheHealth } from "./cache-health";
export { getCacheConfig, configureCache, defaultCacheConfig } from "./cache-config";
export type { CacheConfig, CacheProviderConfig, EntityCacheConfig, QueryCacheConfig, CacheTierConfig } from "./cache-config";

// Legacy exports for backward compatibility
export { CacheTier, getCached } from "./cache-service";
export type { CacheTierValue } from "./cache-service";
export { tenantKey, globalKey, CacheDomains } from "./keys";
