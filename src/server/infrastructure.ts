import { lockManager } from "./locks/lock-manager";
import { cacheManager } from "./cache/cache-manager";
import { metrics } from "./observability/metrics";
import { registerCacheHealth, registerMemoryHealth, registerUptimeHealth } from "./observability/health-checks";
import { getInfrastructureConfig, loadConfigFromEnv, updateInfrastructureConfig } from "./persistence/config";
import type { InfrastructureConfig } from "./persistence/config";
import { initializeDatabase, shutdownDatabase, configureDatabaseOps, checkDatabaseHealth } from "./db/database-operations";
import { gracefulShutdown, gracefulStartup } from "./ha/graceful";
import { healthEndpoint } from "./ha/health";
import { logger } from "@/lib/logger";
import { initializeOtel } from "./observability/otel";

let initialized = false;

const startTime = Date.now();

export interface InfrastructureHealth {
  status: "healthy" | "degraded" | "unhealthy";
  cache: string;
  queues: number;
  locks: number;
  uptime: string;
  database: string;
  memory: { heapUsedMB: number; heapTotalMB: number; rssMB: number };
  version: string;
}

export async function initializeInfrastructure(
  config?: Partial<InfrastructureConfig>,
): Promise<void> {
  if (initialized) return;

  const envConfig = loadConfigFromEnv();
  if (config) {
    updateInfrastructureConfig(deepMerge(envConfig, config));
  } else {
    updateInfrastructureConfig(envConfig);
  }

  logger.info({ serverVersion: process.version, nodeEnv: process.env.NODE_ENV }, "Starting infrastructure initialization...");

  configureDatabaseOps();
  initializeOtel();
  await initializeDatabase();
  await cacheManager.initialize();

  registerCacheHealth(cacheManager);
  registerMemoryHealth();
  registerUptimeHealth();

  healthEndpoint.registerCheck("database", async () => {
    const health = await checkDatabaseHealth();
    return {
      status: health.status === "healthy" ? "healthy" : health.status === "degraded" ? "degraded" : "unhealthy",
      latencyMs: health.latencyMs > 0 ? health.latencyMs : 0,
      message: health.connected ? `Pool: ${health.poolSize}, Active: ${health.activeQueries}` : "Disconnected",
    };
  });

  gracefulStartup.markReady();
  initialized = true;

  logger.info({ uptime: Math.floor((Date.now() - startTime) / 1000) }, "Infrastructure initialized successfully");
}

export async function shutdownInfrastructure(): Promise<void> {
  logger.info("Starting infrastructure shutdown...");

  await shutdownDatabase();
  logger.info("Database disconnected");

  try {
    await (cacheManager as any).getProvider()?.disconnect?.();
  } catch {}
  logger.info("Cache disconnected");

  logger.info("Infrastructure shutdown complete");
}

export async function checkInfrastructureHealth(): Promise<InfrastructureHealth> {
  const cacheReport = await cacheManager.health();
  const dbHealth = await checkDatabaseHealth();
  const mem = process.memoryUsage();

  const issues: string[] = [];
  if (cacheReport.status !== "healthy") issues.push(`cache:${cacheReport.status}`);
  if (dbHealth.status !== "healthy") issues.push(`database:${dbHealth.status}`);

  return {
    status: issues.length === 0 ? "healthy" : issues.length <= 2 ? "degraded" : "unhealthy",
    cache: cacheReport.status,
    queues: 0,
    locks: 0,
    uptime: formatUptime(process.uptime()),
    database: dbHealth.status,
    memory: {
      heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(mem.heapTotal / 1024 / 1024),
      rssMB: Math.round(mem.rss / 1024 / 1024),
    },
    version: process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0",
  };
}

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
}

function deepMerge<T>(target: T, source: Partial<T>): T {
  const result = { ...target };
  for (const key of Object.keys(source as object)) {
    const k = key as keyof T;
    if (
      source[k] !== null &&
      typeof source[k] === "object" &&
      !Array.isArray(source[k]) &&
      typeof target[k] === "object" &&
      !Array.isArray(target[k])
    ) {
      result[k] = deepMerge(target[k] as any, source[k] as any);
    } else if (source[k] !== undefined) {
      result[k] = source[k] as T[keyof T];
    }
  }
  return result;
}

export { cacheManager, lockManager, metrics, getInfrastructureConfig };
