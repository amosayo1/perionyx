import type { BankingRegion, BankProviderKind, HealthStatus } from "../../domain/types";
import type { DashboardData, AlertSeverity, Alert } from "../types";
import { connectionHealthMonitor } from "../connections/engine";
import { providerMonitor } from "../providers/engine";
import { alertEngine } from "../alerts/engine";
import { healthScorer } from "../health/engine";

export interface DashboardConfig {
  maxRecentAlerts: number;
  enableRegionalBreakdown: boolean;
  enableProviderComparison: boolean;
}

const DEFAULT_CONFIG: DashboardConfig = {
  maxRecentAlerts: 10,
  enableRegionalBreakdown: true,
  enableProviderComparison: true,
};

export class DashboardEngine {
  private config: DashboardConfig;
  private cachedData: DashboardData | null = null;
  private lastRefreshAt: number = 0;
  private refreshIntervalMs = 30000;

  constructor(config?: Partial<DashboardConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  generate(): DashboardData {
    const now = Date.now();
    if (this.cachedData && now - this.lastRefreshAt < this.refreshIntervalMs) {
      return this.cachedData;
    }

    const score = healthScorer.getScores();
    const connections = connectionHealthMonitor.getAll();
    const providerStates = providerMonitor.getAllProviderStates();
    const alerts = alertEngine.getActive();
    const recentAlerts = alerts.slice(0, this.config.maxRecentAlerts);

    const connectedProviders = new Set(connections.map((c) => c.providerKind))
      .size;
    const connectedBanks = new Set(
      connections.map((c) => c.institutionName),
    ).size;
    const activeAccounts = 0;
    const failedConnections = connections.filter((c) => c.healthScore < 50)
      .length;
    const pendingSyncs = 0;

    const alertSummary = {
      critical: alerts.filter(
        (a) => a.severity === "CRITICAL" as AlertSeverity && !a.resolved,
      ).length,
      warning: alerts.filter(
        (a) => a.severity === "WARNING" as AlertSeverity && !a.resolved,
      ).length,
      info: alerts.filter(
        (a) => a.severity === "INFO" as AlertSeverity && !a.resolved,
      ).length,
      emergency: alerts.filter(
        (a) => a.severity === "EMERGENCY" as AlertSeverity && !a.resolved,
      ).length,
    };

    let overallHealth: HealthStatus = "HEALTHY" as HealthStatus;
    if (alertSummary.emergency > 0 || alertSummary.critical > 3) {
      overallHealth = "UNHEALTHY" as HealthStatus;
    } else if (alertSummary.critical > 0 || alertSummary.warning > 5) {
      overallHealth = "DEGRADED" as HealthStatus;
    }

    const regionalStatus = this.buildRegionalStatus(connections);
    const providerComparison = this.buildProviderComparison(providerStates);

    const data: DashboardData = {
      overallHealth,
      overallScore: score.overall,
      connectedProviders,
      connectedBanks,
      activeAccounts,
      failedConnections,
      pendingSyncs,
      alertSummary,
      regionalStatus,
      providerComparison,
      recentAlerts,
      generatedAt: new Date().toISOString(),
    };

    this.cachedData = data;
    this.lastRefreshAt = now;
    return data;
  }

  refresh(): void {
    this.cachedData = null;
    this.lastRefreshAt = 0;
  }

  private buildRegionalStatus(
    connections: Array<{ providerKind: BankProviderKind; healthScore: number }>,
  ): DashboardData["regionalStatus"] {
    const regionMap = new Map<
      string,
      { scores: number[]; count: number }
    >();

    for (const conn of connections) {
      const region = "GLOBAL";
      const entry = regionMap.get(region) ?? { scores: [], count: 0 };
      entry.scores.push(conn.healthScore);
      entry.count++;
      regionMap.set(region, entry);
    }

    return Array.from(regionMap.entries()).map(([region, data]) => {
      const avgScore =
        data.scores.length > 0
          ? Math.round(
              data.scores.reduce((a, b) => a + b, 0) / data.scores.length,
            )
          : 0;
      let status: HealthStatus = "HEALTHY" as HealthStatus;
      if (avgScore < 50) status = "UNHEALTHY" as HealthStatus;
      else if (avgScore < 70) status = "DEGRADED" as HealthStatus;

      return {
        region: region as BankingRegion,
        status,
        score: avgScore,
        connectionCount: data.count,
      };
    });
  }

  private buildProviderComparison(
    providerStates: Array<{
      providerKind: BankProviderKind;
      latencyMs: number | null;
      available: boolean;
      authStatus: string;
    }>,
  ): DashboardData["providerComparison"] {
    const providerMap = new Map<
      string,
      { latencies: number[]; count: number; available: boolean[] }
    >();

    for (const p of providerStates) {
      const entry = providerMap.get(p.providerKind) ?? {
        latencies: [],
        count: 0,
        available: [],
      };
      if (p.latencyMs !== null) entry.latencies.push(p.latencyMs);
      entry.count++;
      entry.available.push(p.available);
      providerMap.set(p.providerKind, entry);
    }

    return Array.from(providerMap.entries()).map(([kind, data]) => {
      const avgLatency =
        data.latencies.length > 0
          ? Math.round(
              data.latencies.reduce((a, b) => a + b, 0) / data.latencies.length,
            )
          : null;

      const allAvailable = data.available.every((a) => a);
      let status: HealthStatus = "HEALTHY" as HealthStatus;
      if (!allAvailable) status = "DOWN" as HealthStatus;
      else if (
        avgLatency !== null && avgLatency > 3000
      )
        status = "DEGRADED" as HealthStatus;

      return {
        providerKind: kind as BankProviderKind,
        status,
        score: allAvailable
          ? avgLatency !== null
            ? avgLatency < 1000
              ? 95
              : avgLatency < 3000
                ? 75
                : 50
            : 50
          : 20,
        latencyMs: avgLatency,
        connectionCount: data.count,
      };
    });
  }
}

export const dashboardEngine = new DashboardEngine();