import { registerHealthCheck } from "./health";
import type { CacheManager } from "../cache/cache-manager";
import { cacheHealth } from "../cache/cache-health";

export function registerCacheHealth(cacheManager: CacheManager): void {
  registerHealthCheck("cache", async () => {
    const start = performance.now();
    try {
      const report = await cacheHealth.generateReport();
      const latencyMs = Math.round(performance.now() - start);
      return {
        status: report.status === "healthy" ? "healthy" : "degraded",
        component: "cache",
        message: report.status === "healthy" ? undefined : `Cache ${report.status}`,
        latencyMs,
        lastChecked: new Date(),
        metadata: { ...report, metrics: { ...report.metrics }, config: { ...report.config } },
      };
    } catch (err) {
      return {
        status: "unhealthy",
        component: "cache",
        message: err instanceof Error ? err.message : "Cache health check failed",
        latencyMs: Math.round(performance.now() - start),
        lastChecked: new Date(),
      };
    }
  });
}

export function registerMemoryHealth(): void {
  registerHealthCheck("memory", async () => {
    const start = performance.now();
    const usage = process.memoryUsage();
    const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024);
    const rssMB = Math.round(usage.rss / 1024 / 1024);
    const ratio = usage.heapUsed / usage.heapTotal;
    const status = ratio > 0.9 ? "degraded" : ratio > 0.95 ? "unhealthy" : "healthy";
    return {
      status,
      component: "memory",
      message: status === "healthy" ? undefined : `Heap usage critical: ${Math.round(ratio * 100)}%`,
      latencyMs: Math.round(performance.now() - start),
      lastChecked: new Date(),
      metadata: { heapUsedMB, heapTotalMB, rssMB, heapUsageRatio: Math.round(ratio * 100) / 100 },
    };
  });
}

export function registerUptimeHealth(): void {
  const startedAt = Date.now();
  registerHealthCheck("uptime", async () => {
    const uptimeMs = Date.now() - startedAt;
    const uptimeHours = Math.floor(uptimeMs / 3600000);
    const uptimeMinutes = Math.floor((uptimeMs % 3600000) / 60000);
    return {
      status: "healthy",
      component: "uptime",
      message: `${uptimeHours}h ${uptimeMinutes}m`,
      latencyMs: 0,
      lastChecked: new Date(),
      metadata: { uptimeMs, startedAt: new Date(startedAt).toISOString() },
    };
  });
}

export function registerPersistenceHealth(persistenceHealth: {
  checkHealth: () => Promise<{ status: string; message: string; checks: unknown[] }>;
}): void {
  registerHealthCheck("persistence", async () => {
    const start = performance.now();
    try {
      const report = await persistenceHealth.checkHealth();
      return {
        status: report.status === "healthy" ? "healthy" : report.status === "degraded" ? "degraded" : "unhealthy",
        component: "persistence",
        message: report.message,
        latencyMs: Math.round(performance.now() - start),
        lastChecked: new Date(),
        metadata: report,
      };
    } catch (err) {
      return {
        status: "unhealthy",
        component: "persistence",
        message: err instanceof Error ? err.message : "Persistence health check failed",
        latencyMs: Math.round(performance.now() - start),
        lastChecked: new Date(),
      };
    }
  });
}
