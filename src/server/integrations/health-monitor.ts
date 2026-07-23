import { integrationRegistry } from "./integration-registry";
import { getOrCreateProvider } from "./integration-factory";
import { emitIntegrationDomainEvent } from "./observability";
import type { IntegrationHealthReport, HealthStatus, ConnectionConfig, HealthDiagnostics } from "./types";

const healthReports = new Map<string, IntegrationHealthReport[]>();
const diagnosticsCache = new Map<string, HealthDiagnostics>();

export async function checkConnectionHealth(
  connectionId: string,
): Promise<IntegrationHealthReport> {
  const connection = integrationRegistry.getConnection(connectionId);
  if (!connection) {
    throw new Error(`Connection ${connectionId} not found`);
  }

  const providerConfig = integrationRegistry.getProvider(connection.providerId);
  if (!providerConfig) {
    throw new Error(`Provider ${connection.providerId} not found`);
  }

  const provider = await getOrCreateProvider(providerConfig);
  const health = await provider.checkHealth(connection);

  const previousReport = getHealthReport(connectionId);
  const consecutiveFailures = health.status === "unhealthy"
    ? (previousReport?.consecutiveFailures ?? 0) + 1
    : 0;

  const availability = calculateAvailability(connectionId);
  const healthScore = calculateHealthScore(health.status, health.latency, consecutiveFailures, availability);

  const report: IntegrationHealthReport = {
    providerId: connection.providerId,
    connectionId,
    status: health.status,
    lastCheck: new Date(),
    latency: health.latency,
    errorRate: health.status === "unhealthy" ? 1 : health.status === "degraded" ? 0.5 : 0,
    syncLag: 0,
    healthScore,
    availability,
    uptime: availability,
    consecutiveFailures,
    lastFailureAt: health.status === "unhealthy" ? new Date() : previousReport?.lastFailureAt,
    details: health.error ? { error: health.error } : undefined,
  };

  if (!healthReports.has(connectionId)) {
    healthReports.set(connectionId, []);
  }
  healthReports.get(connectionId)!.push(report);

  const maxHistory = 100;
  const history = healthReports.get(connectionId)!;
  if (history.length > maxHistory) {
    healthReports.set(connectionId, history.slice(-maxHistory));
  }

  if (report.status === "degraded" || report.status === "unhealthy") {
    emitIntegrationDomainEvent("integration.health.degraded", {
      connectionId,
      companyId: connection.companyId,
      status: report.status,
      healthScore: report.healthScore,
      error: health.error,
    });
  } else if (previousReport && (previousReport.status === "degraded" || previousReport.status === "unhealthy")) {
    emitIntegrationDomainEvent("integration.health.restored", {
      connectionId,
      companyId: connection.companyId,
      status: report.status,
      healthScore: report.healthScore,
    });
  }

  return report;
}

export async function diagnoseConnection(connectionId: string): Promise<HealthDiagnostics> {
  const connection = integrationRegistry.getConnection(connectionId);
  if (!connection) {
    throw new Error(`Connection ${connectionId} not found`);
  }

  const providerConfig = integrationRegistry.getProvider(connection.providerId);
  if (!providerConfig) {
    throw new Error(`Provider ${connection.providerId} not found`);
  }

  const provider = await getOrCreateProvider(providerConfig);

  const isReachable = true;
  let authValid = false;
  let latency = 0;

  try {
    const health = await provider.checkHealth(connection);
    latency = health.latency;
    authValid = health.status !== "unhealthy";
  } catch {
    // unreachable
  }

  const suggestions: string[] = [];
  if (!authValid) suggestions.push("Check authentication credentials");
  if (!isReachable) suggestions.push("Verify provider endpoint is accessible");
  if (latency > 5000) suggestions.push("High latency detected, consider network optimization");

  const diagnostic: HealthDiagnostics = {
    connectionId,
    timestamp: new Date(),
    latency,
    isReachable,
    authValid,
    apiVersionValid: true,
    suggestions: suggestions.length > 0 ? suggestions : undefined,
  };

  diagnosticsCache.set(connectionId, diagnostic);
  return diagnostic;
}

export function getHealthReport(connectionId: string): IntegrationHealthReport | undefined {
  const reports = healthReports.get(connectionId);
  if (!reports || reports.length === 0) return undefined;
  return reports[reports.length - 1];
}

export function getHealthTrend(connectionId: string, windowCount = 10): IntegrationHealthReport[] {
  const reports = healthReports.get(connectionId);
  if (!reports) return [];
  return reports.slice(-windowCount);
}

export function getAllHealthReports(companyId: string): IntegrationHealthReport[] {
  const connections = integrationRegistry.getConnectionsByCompany(companyId);
  const reports: IntegrationHealthReport[] = [];

  for (const conn of connections) {
    const connReports = healthReports.get(conn.id);
    if (connReports && connReports.length > 0) {
      reports.push(connReports[connReports.length - 1]);
    }
  }

  return reports;
}

export function getUnhealthyConnections(companyId: string): ConnectionConfig[] {
  const connections = integrationRegistry.getConnectionsByCompany(companyId);
  return connections.filter((conn) => {
    const reports = healthReports.get(conn.id);
    if (!reports || reports.length === 0) return false;
    const latest = reports[reports.length - 1];
    return latest.status === "degraded" || latest.status === "unhealthy";
  });
}

export function getAggregatedHealth(
  companyId: string,
): { healthy: number; degraded: number; unhealthy: number; unknown: number; total: number; avgHealthScore: number } {
  const connections = integrationRegistry.getConnectionsByCompany(companyId);
  const counts = { healthy: 0, degraded: 0, unhealthy: 0, unknown: 0, total: connections.length };
  let totalScore = 0;
  let scoredCount = 0;

  for (const conn of connections) {
    const reports = healthReports.get(conn.id);
    if (!reports || reports.length === 0) {
      counts.unknown++;
      continue;
    }
    const latest = reports[reports.length - 1];
    totalScore += latest.healthScore;
    scoredCount++;
    switch (latest.status) {
      case "healthy":
        counts.healthy++;
        break;
      case "degraded":
        counts.degraded++;
        break;
      case "unhealthy":
        counts.unhealthy++;
        break;
      default:
        counts.unknown++;
    }
  }

  return {
    ...counts,
    avgHealthScore: scoredCount > 0 ? Math.round(totalScore / scoredCount) : 0,
  };
}

export function clearHealthHistory(connectionId: string): void {
  healthReports.delete(connectionId);
  diagnosticsCache.delete(connectionId);
}

export function clearAllHealthHistory(): void {
  healthReports.clear();
  diagnosticsCache.clear();
}

function calculateHealthScore(
  status: HealthStatus,
  latency: number,
  consecutiveFailures: number,
  availability: number,
): number {
  let score = 100;

  if (status === "degraded") score -= 25;
  if (status === "unhealthy") score -= 75;
  if (status === "unknown") score -= 50;

  if (latency > 5000) score -= 15;
  else if (latency > 2000) score -= 10;
  else if (latency > 1000) score -= 5;

  score -= consecutiveFailures * 5;

  score = Math.round(score * (availability / 100));

  return Math.max(0, Math.min(100, score));
}

function calculateAvailability(connectionId: string): number {
  const reports = healthReports.get(connectionId);
  if (!reports || reports.length < 2) return 100;

  const window = reports.slice(-20);
  const healthyCount = window.filter((r) => r.status === "healthy").length;
  return Math.round((healthyCount / window.length) * 100);
}
