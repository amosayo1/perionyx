import { healthRegistry } from "../observability/health";
import type { HealthStatus, HealthCheckResult } from "../observability/health";
import { checkDatabaseHealth } from "../db/database-operations";
import { cacheManager } from "../cache/cache-manager";
import { logger } from "@/lib/logger";

export interface ServiceHealth {
  service: string;
  status: HealthStatus;
  checks: Record<string, { status: HealthStatus; message?: string; latencyMs: number }>;
  metrics: {
    uptimeSeconds: number;
    memoryMB: { heapUsed: number; heapTotal: number; rss: number };
    cpuUsage: number;
    eventLoopLag: number;
  };
  timestamp: string;
}

export interface HealthReport {
  overall: HealthStatus;
  services: ServiceHealth[];
  healthyCount: number;
  degradedCount: number;
  unhealthyCount: number;
  totalCount: number;
  generatedAt: string;
  uptimeSeconds: number;
  version: string;
}

const startTime = Date.now();
let lastCpuUsage = process.cpuUsage();
let lastCpuTime = Date.now();

function getCpuUsage(): number {
  const current = process.cpuUsage();
  const elapsed = Date.now() - lastCpuTime;
  if (elapsed === 0) return 0;
  const userDelta = current.user - lastCpuUsage.user;
  const sysDelta = current.system - lastCpuUsage.system;
  const totalDelta = userDelta + sysDelta;
  lastCpuUsage = current;
  lastCpuTime = Date.now();
  return Math.round((totalDelta / 1000 / elapsed) * 100);
}

function getEventLoopLag(): number {
  return Math.round(performance.now() - Date.now() + process.uptime() * 1000);
}

export async function checkServiceHealth(service: string): Promise<{
  status: HealthStatus;
  checks: Record<string, { status: HealthStatus; message?: string; latencyMs: number }>;
}> {
  const checks: Record<string, { status: HealthStatus; message?: string; latencyMs: number }> = {};

  switch (service) {
    case "database": {
      const dbHealth = await checkDatabaseHealth();
      checks.connectivity = {
        status: dbHealth.connected ? "healthy" : "unhealthy",
        message: dbHealth.connected ? undefined : "Database unreachable",
        latencyMs: dbHealth.latencyMs,
      };
      checks.pool = {
        status: dbHealth.waitingQueries > 20 ? "degraded" : "healthy",
        message: `Active: ${dbHealth.activeQueries}, Idle: ${dbHealth.idleConnections}, Waiting: ${dbHealth.waitingQueries}`,
        latencyMs: 0,
      };
      if (dbHealth.longRunningQueries > 0) {
        checks.longRunning = {
          status: dbHealth.longRunningQueries > 5 ? "degraded" : "healthy",
          message: `${dbHealth.longRunningQueries} queries >5s`,
          latencyMs: 0,
        };
      }
      if (dbHealth.replicationLagSec !== null && dbHealth.replicationLagSec > 30) {
        checks.replication = {
          status: "degraded",
          message: `Lag: ${dbHealth.replicationLagSec}s`,
          latencyMs: 0,
        };
      }
      break;
    }

    case "cache": {
      const cacheStart = performance.now();
      const ping = await cacheManager.ping();
      const cacheLatency = Math.round(performance.now() - cacheStart);
      checks.ping = {
        status: ping ? "healthy" : "unhealthy",
        latencyMs: cacheLatency,
      };
      const cacheMetrics = await cacheManager.getMetrics().catch(() => null);
      if (cacheMetrics) {
        const hitRate = cacheMetrics.hitRate ?? 0;
        checks.hitRate = {
          status: hitRate < 0.3 ? "unhealthy" : hitRate < 0.7 ? "degraded" : "healthy",
          message: `Hit rate: ${Math.round(hitRate * 100)}%`,
          latencyMs: 0,
        };
        checks.errors = {
          status: cacheMetrics.errors > 50 ? "unhealthy" : cacheMetrics.errors > 10 ? "degraded" : "healthy",
          message: `${cacheMetrics.errors} errors`,
          latencyMs: 0,
        };
      }
      break;
    }

    case "queues": {
      const queueStart = performance.now();
      const qLatency = Math.round(performance.now() - queueStart);
      checks.availability = {
        status: "healthy",
        message: "PgBoss managed externally",
        latencyMs: qLatency,
      };
      checks.backlog = {
        status: "healthy",
        message: "PgBoss managed externally",
        latencyMs: 0,
      };
      checks.failed = {
        status: "healthy",
        message: "PgBoss managed externally",
        latencyMs: 0,
      };
      checks.deadLetter = {
        status: "healthy",
        message: "PgBoss managed externally",
        latencyMs: 0,
      };
      break;
    }

    case "system": {
      checks.memory = {
        status: "healthy",
        message: `RSS: ${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
        latencyMs: 0,
      };
      checks.uptime = {
        status: "healthy",
        message: formatUptime(process.uptime()),
        latencyMs: 0,
      };
      break;
    }
  }

  const statuses = Object.values(checks).map((c) => c.status);
  const overall: HealthStatus = statuses.some((s) => s === "unhealthy")
    ? "unhealthy"
    : statuses.some((s) => s === "degraded")
      ? "degraded"
      : "healthy";

  return { status: overall, checks };
}

export async function getFullHealthReport(): Promise<HealthReport> {
  const services = ["database", "cache", "queues", "system"];
  const results = await Promise.all(
    services.map(async (service) => {
      const { status, checks } = await checkServiceHealth(service);
      const mem = process.memoryUsage();
      return {
        service,
        status,
        checks,
        metrics: {
          uptimeSeconds: Math.floor(process.uptime()),
          memoryMB: {
            heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
            heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
            rss: Math.round(mem.rss / 1024 / 1024),
          },
          cpuUsage: getCpuUsage(),
          eventLoopLag: getEventLoopLag(),
        },
        timestamp: new Date().toISOString(),
      } satisfies ServiceHealth;
    }),
  );

  const healthyCount = results.filter((r) => r.status === "healthy").length;
  const degradedCount = results.filter((r) => r.status === "degraded").length;
  const unhealthyCount = results.filter((r) => r.status === "unhealthy").length;

  let overall: HealthStatus = "healthy";
  if (unhealthyCount > 0) overall = "unhealthy";
  else if (degradedCount > 0) overall = "degraded";

  return {
    overall,
    services: results,
    healthyCount,
    degradedCount,
    unhealthyCount,
    totalCount: results.length,
    generatedAt: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    version: process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0",
  };
}

export async function getReadinessStatus(): Promise<{
  ready: boolean;
  checks: { name: string; ready: boolean; message?: string }[];
}> {
  const db = await checkDatabaseHealth();
  const cachePing = await cacheManager.ping();

  const checks = [
    { name: "database", ready: db.connected },
    { name: "cache", ready: cachePing },
  ];

  return {
    ready: checks.every((c) => c.ready),
    checks,
  };
}

export async function getLivenessStatus(): Promise<{
  alive: boolean;
  pid: number;
  uptime: number;
  memory: { heapUsed: number; heapTotal: number; rss: number };
}> {
  return {
    alive: true,
    pid: process.pid,
    uptime: process.uptime(),
    memory: {
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
    },
  };
}

export async function generateHealthReportMarkdown(): Promise<string> {
  const report = await getFullHealthReport();
  const lines: string[] = [];

  lines.push("# Enterprise Health Report");
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push(`Overall: **${report.overall.toUpperCase()}**`);
  lines.push(`Uptime: ${formatUptime(report.uptimeSeconds)}`);
  lines.push(`Version: ${report.version}`);
  lines.push("");
  lines.push(`| Status | Count |`);
  lines.push(`|---|---|`);
  lines.push(`| Healthy | ${report.healthyCount} |`);
  lines.push(`| Degraded | ${report.degradedCount} |`);
  lines.push(`| Unhealthy | ${report.unhealthyCount} |`);
  lines.push("");
  lines.push("## Per-Service Details");
  lines.push("");

  for (const svc of report.services) {
    lines.push(`### ${svc.service}`);
    lines.push(`Status: **${svc.status}**`);
    lines.push("");
    lines.push("| Check | Status | Message | Latency (ms) |");
    lines.push("|---|---|---|---|");
    for (const [name, c] of Object.entries(svc.checks)) {
      lines.push(`| ${name} | ${c.status} | ${c.message ?? "-"} | ${c.latencyMs} |`);
    }
    lines.push("");
    lines.push(`*Uptime: ${formatUptime(svc.metrics.uptimeSeconds)}*`);
    lines.push(`*Memory: ${svc.metrics.memoryMB.heapUsed}MB / ${svc.metrics.memoryMB.heapTotal}MB / ${svc.metrics.memoryMB.rss}MB*`);
    lines.push("");
  }

  return lines.join("\n");
}

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
}

export const healthManager = {
  checkServiceHealth,
  getFullHealthReport,
  getReadinessStatus,
  getLivenessStatus,
  generateHealthReportMarkdown,
};
