import { prisma } from "./prisma";
import { logger } from "@/lib/logger";
import { metrics } from "@/server/observability/metrics";

export interface DatabasePoolConfig {
  min: number;
  max: number;
  idleTimeoutMs: number;
  maxUses: number;
  connectionTimeoutMs: number;
}

export interface DatabaseRetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitter: boolean;
}

export interface DatabaseTimeoutConfig {
  statementTimeoutMs: number;
  transactionTimeoutMs: number;
  lockTimeoutMs: number;
  idleInTransactionSessionTimeoutMs: number;
}

export interface DatabaseHealth {
  status: "healthy" | "degraded" | "unhealthy";
  connected: boolean;
  poolSize: number;
  activeQueries: number;
  idleConnections: number;
  waitingQueries: number;
  latencyMs: number;
  replicationLagSec: number | null;
  uptimeSeconds: number;
  serverVersion: string;
  longRunningQueries: number;
}

const DEFAULT_POOL_CONFIG: DatabasePoolConfig = {
  min: 2,
  max: 10,
  idleTimeoutMs: 30000,
  maxUses: 1000,
  connectionTimeoutMs: 5000,
};

const DEFAULT_RETRY_CONFIG: DatabaseRetryConfig = {
  maxAttempts: 3,
  baseDelayMs: 50,
  maxDelayMs: 2000,
  jitter: true,
};

const DEFAULT_TIMEOUT_CONFIG: DatabaseTimeoutConfig = {
  statementTimeoutMs: 30000,
  transactionTimeoutMs: 60000,
  lockTimeoutMs: 5000,
  idleInTransactionSessionTimeoutMs: 60000,
};

let poolConfig = { ...DEFAULT_POOL_CONFIG };
let retryConfig = { ...DEFAULT_RETRY_CONFIG };
let timeoutConfig = { ...DEFAULT_TIMEOUT_CONFIG };
let connected = false;
let connectTime = 0;
let serverVersion = "";

export function configureDatabaseOps(
  overrides?: {
    pool?: Partial<DatabasePoolConfig>;
    retry?: Partial<DatabaseRetryConfig>;
    timeout?: Partial<DatabaseTimeoutConfig>;
  },
): void {
  if (overrides?.pool) Object.assign(poolConfig, overrides.pool);
  if (overrides?.retry) Object.assign(retryConfig, overrides.retry);
  if (overrides?.timeout) Object.assign(timeoutConfig, overrides.timeout);
}

export function getPoolConfig(): Readonly<DatabasePoolConfig> {
  return { ...poolConfig };
}

export function getRetryConfig(): Readonly<DatabaseRetryConfig> {
  return { ...retryConfig };
}

export function getTimeoutConfig(): Readonly<DatabaseTimeoutConfig> {
  return { ...timeoutConfig };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function computeDelay(attempt: number): number {
  const delay = Math.min(retryConfig.baseDelayMs * Math.pow(2, attempt - 1), retryConfig.maxDelayMs);
  if (!retryConfig.jitter) return delay;
  return delay * (0.5 + Math.random() * 0.5);
}

export async function queryWithRetry<T>(
  queryFn: () => Promise<T>,
  options?: { maxAttempts?: number; label?: string },
): Promise<T> {
  const maxAttempts = options?.maxAttempts ?? retryConfig.maxAttempts;
  const label = options?.label ?? "db.query";
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const start = performance.now();
      const result = await queryFn();
      const duration = performance.now() - start;
      metrics.histogram("db.query.duration").observe(duration);
      metrics.counter("db.query.success").inc({ label });
      return result;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      metrics.counter("db.query.retry").inc({ label, attempt: String(attempt) });
      logger.warn({ label, attempt, maxAttempts, error: lastError.message }, "Database query failed, retrying");
      if (attempt < maxAttempts) {
        const delay = computeDelay(attempt);
        await sleep(delay);
      }
    }
  }
  metrics.counter("db.query.failed").inc({ label });
  throw lastError;
}

export async function withTransactionTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs?: number,
): Promise<T> {
  const timeout = timeoutMs ?? timeoutConfig.transactionTimeoutMs;
  try {
    await prisma.$executeRawUnsafe(`SET LOCAL statement_timeout = '${timeout}ms'`);
    return await fn();
  } finally {
    await prisma.$executeRawUnsafe("RESET statement_timeout").catch(() => {});
  }
}

export async function detectLongRunningQueries(): Promise<
  { pid: number; duration: number; query: string; state: string }[]
> {
  try {
    const rows: { pid: number; duration: number; query: string; state: string }[] =
      await prisma.$queryRawUnsafe(`
        SELECT pid, EXTRACT(EPOCH FROM now() - query_start)::integer AS duration,
               query, state
        FROM pg_stat_activity
        WHERE state = 'active'
          AND query NOT LIKE '%pg_stat_activity%'
          AND query_start < now() - interval '5 seconds'
        ORDER BY duration DESC
      `) as any;
    return rows;
  } catch {
    return [];
  }
}

export async function getReplicationLag(): Promise<number | null> {
  try {
    const rows: { lag: number | null }[] = await prisma.$queryRawUnsafe(`
      SELECT CASE
        WHEN pg_is_in_recovery() THEN
          (SELECT EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp()))::integer)
        ELSE 0
      END AS lag
    `) as any;
    return rows[0]?.lag ?? null;
  } catch {
    return null;
  }
}

export async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  const start = performance.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Math.round(performance.now() - start);

    let poolInfo = { poolSize: 0, activeQueries: 0, idleConnections: 0, waitingQueries: 0 };
    try {
      const rows: {
        numbackends: number; active: number; idle: number; waiting: number;
      }[] = await prisma.$queryRawUnsafe(`
        SELECT numbackends,
          (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') AS active,
          (SELECT count(*) FROM pg_stat_activity WHERE state = 'idle') AS idle,
          (SELECT count(*) FROM pg_stat_activity WHERE wait_event_type IS NOT NULL AND state = 'active') AS waiting
        FROM pg_stat_database WHERE datname = current_database()
      `) as any;
      if (rows.length > 0) {
        poolInfo = {
          poolSize: Number(rows[0].numbackends) || 0,
          activeQueries: Number(rows[0].active) || 0,
          idleConnections: Number(rows[0].idle) || 0,
          waitingQueries: Number(rows[0].waiting) || 0,
        };
      }
    } catch {}

    const replicationLag = await getReplicationLag();
    const longRunning = await detectLongRunningQueries();
    const uptimeSeconds = connected ? Math.floor((Date.now() - connectTime) / 1000) : 0;

    let status: DatabaseHealth["status"] = "healthy";
    if (latencyMs > 1000) status = "degraded";
    if (poolInfo.waitingQueries > 20) status = "degraded";
    if (latencyMs > 5000 || !connected) status = "unhealthy";

    return {
      status,
      connected,
      poolSize: poolInfo.poolSize,
      activeQueries: poolInfo.activeQueries,
      idleConnections: poolInfo.idleConnections,
      waitingQueries: poolInfo.waitingQueries,
      latencyMs,
      replicationLagSec: replicationLag,
      uptimeSeconds,
      serverVersion,
      longRunningQueries: longRunning.length,
    };
  } catch {
    return {
      status: "unhealthy",
      connected: false,
      poolSize: 0,
      activeQueries: 0,
      idleConnections: 0,
      waitingQueries: 0,
      latencyMs: -1,
      replicationLagSec: null,
      uptimeSeconds: 0,
      serverVersion: "",
      longRunningQueries: 0,
    };
  }
}

export async function initializeDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    connected = true;
    connectTime = Date.now();

    const version: { version: string }[] = await prisma.$queryRawUnsafe(`SELECT version()`) as any;
    serverVersion = version[0]?.version ?? "";

    logger.info({ serverVersion, poolConfig: { min: poolConfig.min, max: poolConfig.max } }, "Database connected");
  } catch (err) {
    logger.error({ error: String(err) }, "Database connection failed");
    throw err;
  }
}

export async function shutdownDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    connected = false;
    logger.info("Database disconnected");
  } catch (err) {
    logger.error({ error: String(err) }, "Database disconnect failed");
  }
}
