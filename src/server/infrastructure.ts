import { lockManager } from "./locks/lock-manager";
import { cacheManager } from "./cache/cache-manager";
import { metrics } from "./observability/metrics";
import { registerCacheHealth, registerMemoryHealth, registerUptimeHealth } from "./observability/health-checks";
import { getInfrastructureConfig, loadConfigFromEnv, updateInfrastructureConfig } from "./persistence/config";
import type { InfrastructureConfig } from "./persistence/config";
import { initializeDatabase, shutdownDatabase, configureDatabaseOps, checkDatabaseHealth } from "./db/database-operations";
import { prisma } from "./db/prisma";
import { gracefulShutdown, gracefulStartup } from "./ha/graceful";
import { healthEndpoint } from "./ha/health";
import { logger } from "@/lib/logger";
import { initializeOtel } from "./observability/otel";
import { ConfigurationRuntime } from "@/runtime/configuration";
import { SecretRuntime } from "@/runtime/secrets";
import { CapabilityRuntime } from "@/runtime/capabilities";
import { autoClassifyPrismaModels } from "./foundation/classification/auto-register";
import { ClassificationRegistry } from "./foundation/classification/registry";

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

  // ── Foundation Services (Phase 24.0B) ────────────────────────────────────
  if (prisma) {
    logger.info("Initializing Runtime foundation services...");

    // Configuration Runtime
    const configRuntime = await ConfigurationRuntime.create({ prisma });
    await configRuntime.loadAll();
    logger.info("Configuration Runtime loaded");

    // Secret Runtime
    const secretRuntime = await SecretRuntime.create({ prisma });
    await secretRuntime.initialize();
    logger.info("Secret Runtime initialized");

    // Capability Runtime
    const capabilityRuntime = await CapabilityRuntime.create({ prisma });
    await capabilityRuntime.loadAll();
    logger.info("Capability Runtime loaded");

    // Data Classification auto-register (Constitutional Law 13)
    try {
      const classificationRegistry = ClassificationRegistry.getInstance();
      const result = await autoClassifyPrismaModels(prisma, classificationRegistry);
      logger.info({ entities: result.entitiesRegistered, fields: result.fieldsRegistered }, "Data Classification auto-registered");
    } catch (err) {
      logger.warn({ err }, "Data Classification auto-registration skipped");
    }

    // Register foundation health checks
    healthEndpoint.registerCheck("configuration", async () => {
      const h = await configRuntime.healthCheck();
      return { status: h.healthy ? "healthy" : "unhealthy", latencyMs: 0, message: `${h.configCount} configs, ${h.cacheSize} cached` };
    });
    healthEndpoint.registerCheck("secrets", async () => {
      const h = await secretRuntime.healthCheck();
      const healthy = Object.values(h).every(v => v.healthy);
      return { status: healthy ? "healthy" : "degraded", latencyMs: 0, message: `${Object.keys(h).length} providers` };
    });
    healthEndpoint.registerCheck("capabilities", async () => {
      const h = await capabilityRuntime.healthCheck();
      return { status: h.healthy ? 'healthy' : 'unhealthy', latencyMs: 0, message: h.summary ? `${h.summary.total} capabilities` : 'loaded' };
    });

    logger.info("Runtime foundation services initialized");
  }

  // Wire graceful shutdown to process signals
  gracefulShutdown.register("database", async () => {
    await shutdownDatabase();
  }, 10_000);
  gracefulShutdown.register("cache", async () => {
    try { await (cacheManager as any).getProvider()?.disconnect?.(); } catch {}
  }, 5_000);
  gracefulShutdown.register("runtime-secrets", async () => {
    try { const sr = SecretRuntime.getInstance(); await sr.shutdown(); } catch {}
  }, 5_000);
  gracefulShutdown.register("runtime-capabilities", async () => {
    try { const cr = CapabilityRuntime.getInstance(); cr.stopHealthPolling(); } catch {}
  }, 5_000);
  gracefulShutdown.setup(["SIGTERM", "SIGINT"]);
  logger.info("Graceful shutdown wired to SIGTERM/SIGINT");

  gracefulStartup.markReady();
  initialized = true;

  logger.info({ uptime: Math.floor((Date.now() - startTime) / 1000) }, "Infrastructure initialized successfully");
}

export async function shutdownInfrastructure(): Promise<void> {
  logger.info("Starting infrastructure shutdown...");

  // Shutdown foundation services (Phase 24.0B)
  try {
    const secretRuntime = SecretRuntime.getInstance();
    await secretRuntime.shutdown();
    logger.info("Secret Runtime shut down");
  } catch {}

  try {
    const capabilityRuntime = CapabilityRuntime.getInstance();
    capabilityRuntime.stopHealthPolling();
    logger.info("Capability Runtime stopped polling");
  } catch {}

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
    foundation: initialized ? "initialized" : "not initialized",
  } as InfrastructureHealth;
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
