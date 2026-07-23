import type { HealthStatus } from "../../domain/types";
import type { SystemStatus } from "../types";
import { connectionHealthMonitor } from "../connections/engine";
import { providerMonitor } from "../providers/engine";

export interface StatusTrackerConfig {
  healthCheckIntervalMs: number;
}

const DEFAULT_CONFIG: StatusTrackerConfig = {
  healthCheckIntervalMs: 60000,
};

export class StatusTracker {
  private config: StatusTrackerConfig;
  private lastStatus: SystemStatus | null = null;
  private lastUpdateAt: number = 0;

  constructor(config?: Partial<StatusTrackerConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  generateStatus(): SystemStatus {
    const now = Date.now();
    if (this.lastStatus && now - this.lastUpdateAt < this.config.healthCheckIntervalMs) {
      return this.lastStatus;
    }

    const connections = connectionHealthMonitor.getAll();
    const providerStates = providerMonitor.getAllProviderStates();

    const providersHealthy = providerStates.filter(
      (p) => p.available && p.authStatus === "HEALTHY",
    ).length;
    const providersDegraded = providerStates.filter(
      (p) => p.available && p.authStatus === "DEGRADED",
    ).length;
    const providersDown = providerStates.filter(
      (p) => !p.available || p.authStatus === "FAILED",
    ).length;

    const uniqueProviders = new Set(providerStates.map((p) => p.providerKind)).size;

    const connectionsHealthy = connections.filter((c) => c.healthScore >= 80).length;
    const connectionsDegraded = connections.filter(
      (c) => c.healthScore >= 50 && c.healthScore < 80,
    ).length;
    const connectionsFailed = connections.filter((c) => c.healthScore < 50).length;

    const accountsActive = 0;
    const accountsDormant = 0;

    let overall: HealthStatus = "HEALTHY" as HealthStatus;
    if (providersDown > 0 || connectionsFailed > 0) {
      overall = "UNHEALTHY" as HealthStatus;
    } else if (providersDegraded > 0 || connectionsDegraded > 0) {
      overall = "DEGRADED" as HealthStatus;
    }

    const status: SystemStatus = {
      overall,
      providers: uniqueProviders,
      providersHealthy,
      providersDegraded,
      providersDown,
      connections: connections.length,
      connectionsHealthy,
      connectionsDegraded,
      connectionsFailed,
      accounts: accountsActive + accountsDormant,
      accountsActive,
      accountsDormant,
      lastUpdated: new Date().toISOString(),
      components: {
        provider: providersDown > 0 ? "DOWN" as HealthStatus : providersDegraded > 0 ? "DEGRADED" as HealthStatus : "HEALTHY" as HealthStatus,
        connection: connectionsFailed > 0 ? "DOWN" as HealthStatus : connectionsDegraded > 0 ? "DEGRADED" as HealthStatus : "HEALTHY" as HealthStatus,
        account: "HEALTHY" as HealthStatus,
        sync: "HEALTHY" as HealthStatus,
      },
    };

    this.lastStatus = status;
    this.lastUpdateAt = now;
    return status;
  }

  getStatus(): SystemStatus | null {
    return this.lastStatus;
  }

  isHealthy(): boolean {
    const status = this.generateStatus();
    return status.overall === "HEALTHY";
  }

  refresh(): void {
    this.lastUpdateAt = 0;
  }
}

export const statusTracker = new StatusTracker();