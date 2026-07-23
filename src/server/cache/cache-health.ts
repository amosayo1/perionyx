import { cacheManager } from "./cache-manager";
import { cacheMetrics } from "./cache-metrics";
import { getCacheConfig } from "./cache-config";

export interface CacheHealthReport {
  status: "healthy" | "degraded" | "unhealthy";
  provider: string;
  connected: boolean;
  ping: boolean;
  metrics: ReturnType<typeof cacheMetrics.getAggregate>;
  config: ReturnType<typeof getCacheConfig>;
  size: number;
  uptimeMs: number;
}

let startTime = Date.now();

export class CacheHealthMonitor {
  async generateReport(): Promise<CacheHealthReport> {
    const provider = getCacheConfig().provider;
    const ping = await cacheManager.ping();
    const size = await (cacheManager as any).getProvider().size().catch(() => 0);
    const metrics = cacheMetrics.getAggregate();
    const errors = metrics.errors;
    const hitRate = metrics.hitRate;
    let status: "healthy" | "degraded" | "unhealthy" = "healthy";
    if (errors > 50 || hitRate < 0.3) status = "unhealthy";
    else if (errors > 10 || hitRate < 0.7) status = "degraded";
    return {
      status,
      provider: provider.type,
      connected: ping,
      ping,
      metrics,
      config: getCacheConfig(),
      size,
      uptimeMs: Date.now() - startTime,
    };
  }
}

export const cacheHealth = new CacheHealthMonitor();
