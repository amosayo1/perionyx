import type { SyncState, SyncTrigger, SyncMode, SyncStatistics } from "../types";

export interface MonitorConfig {
  alertThresholdSuccessRate: number;
  alertThresholdDurationMinutes: number;
  alertThresholdConsecutiveFailures: number;
  freshnessThresholdMinutes: number;
}

export interface HealthSnapshot {
  overall: "HEALTHY" | "DEGRADED" | "UNHEALTHY";
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  successRate: number;
  averageDurationMs: number;
  totalTransactionsImported: number;
  averageTransactionsPerSync: number;
  accountsWithStaleCheckpoints: number;
  activeRetries: number;
  deadLetteredJobs: number;
  dataFreshness: Record<string, number>;
  alerts: SyncAlert[];
  timestamp: string;
}

export interface SyncAlert {
  id: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  category: string;
  message: string;
  connectionId?: string;
  accountId?: string;
  timestamp: string;
  acknowledged: boolean;
}

const DEFAULT_CONFIG: MonitorConfig = {
  alertThresholdSuccessRate: 80,
  alertThresholdDurationMinutes: 30,
  alertThresholdConsecutiveFailures: 3,
  freshnessThresholdMinutes: 120,
};

export class SyncMonitor {
  private config: MonitorConfig;
  private alerts: SyncAlert[] = [];
  private connectionMetrics = new Map<string, ConnectionSyncMetrics>();
  private accountFreshness = new Map<string, number>();

  constructor(config?: Partial<MonitorConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  recordSyncCompletion(
    connectionId: string,
    statistics: SyncStatistics,
    durationMs: number,
    success: boolean,
    errorCount: number,
  ): void {
    const metrics = this.connectionMetrics.get(connectionId) ?? {
      totalSyncs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      totalTransactionsImported: 0,
      totalDurationMs: 0,
      consecutiveFailures: 0,
      lastSyncAt: null,
    };

    metrics.totalSyncs++;
    metrics.totalDurationMs += durationMs;
    metrics.totalTransactionsImported += statistics.imported;
    metrics.lastSyncAt = new Date().toISOString();

    if (success) {
      metrics.successfulSyncs++;
      metrics.consecutiveFailures = 0;
    } else {
      metrics.failedSyncs++;
      metrics.consecutiveFailures++;
    }

    this.connectionMetrics.set(connectionId, metrics);
    this.evaluateAlerts(connectionId, metrics);
  }

  updateAccountFreshness(accountId: string, lastSyncAt: string): void {
    const minutesSinceSync =
      (Date.now() - new Date(lastSyncAt).getTime()) / 60000;
    this.accountFreshness.set(accountId, minutesSinceSync);
  }

  getConnectionMetrics(connectionId: string): ConnectionSyncMetrics | null {
    return this.connectionMetrics.get(connectionId) ?? null;
  }

  getHealthSnapshot(): HealthSnapshot {
    const allMetrics = Array.from(this.connectionMetrics.values());
    const totalSyncs = allMetrics.reduce((s, m) => s + m.totalSyncs, 0);
    const successfulSyncs = allMetrics.reduce((s, m) => s + m.successfulSyncs, 0);
    const failedSyncs = allMetrics.reduce((s, m) => s + m.failedSyncs, 0);
    const totalTransactionsImported = allMetrics.reduce(
      (s, m) => s + m.totalTransactionsImported,
      0,
    );
    const totalDurationMs = allMetrics.reduce((s, m) => s + m.totalDurationMs, 0);
    const successRate = totalSyncs > 0 ? (successfulSyncs / totalSyncs) * 100 : 100;
    const averageDurationMs = successfulSyncs > 0 ? totalDurationMs / successfulSyncs : 0;
    const averageTransactionsPerSync = successfulSyncs > 0
      ? Math.round(totalTransactionsImported / successfulSyncs)
      : 0;

    const staleAccounts = Array.from(this.accountFreshness.entries()).filter(
      ([, minutes]) => minutes > this.config.freshnessThresholdMinutes,
    ).length;

    const recentAlerts = this.alerts.filter(
      (a) => Date.now() - new Date(a.timestamp).getTime() < 86400000,
    );

    let overall: HealthSnapshot["overall"] = "HEALTHY";
    if (successRate < this.config.alertThresholdSuccessRate || staleAccounts > 0) {
      overall = "DEGRADED";
    }
    if (successRate < 50 || failedSyncs > 10 || staleAccounts > 10) {
      overall = "UNHEALTHY";
    }

    return {
      overall,
      totalSyncs,
      successfulSyncs,
      failedSyncs,
      successRate: Math.round(successRate * 100) / 100,
      averageDurationMs: Math.round(averageDurationMs),
      totalTransactionsImported,
      averageTransactionsPerSync,
      accountsWithStaleCheckpoints: staleAccounts,
      activeRetries: 0,
      deadLetteredJobs: 0,
      dataFreshness: Object.fromEntries(this.accountFreshness),
      alerts: recentAlerts,
      timestamp: new Date().toISOString(),
    };
  }

  getAlerts(severity?: "INFO" | "WARNING" | "CRITICAL"): SyncAlert[] {
    if (severity) {
      return this.alerts.filter((a) => a.severity === severity);
    }
    return this.alerts;
  }

  acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
    }
  }

  clearAlerts(): void {
    this.alerts = [];
  }

  private evaluateAlerts(
    connectionId: string,
    metrics: ConnectionSyncMetrics,
  ): void {
    if (metrics.consecutiveFailures >= this.config.alertThresholdConsecutiveFailures) {
      this.addAlert({
        id: `alert-${connectionId}-${Date.now()}`,
        severity: "CRITICAL",
        category: "SYNC_FAILURE",
        message: `Connection ${connectionId} has ${metrics.consecutiveFailures} consecutive failures`,
        connectionId,
        timestamp: new Date().toISOString(),
        acknowledged: false,
      });
    }

    const successRate = metrics.totalSyncs > 0
      ? (metrics.successfulSyncs / metrics.totalSyncs) * 100
      : 100;

    if (successRate < this.config.alertThresholdSuccessRate) {
      this.addAlert({
        id: `alert-rate-${connectionId}-${Date.now()}`,
        severity: "WARNING",
        category: "LOW_SUCCESS_RATE",
        message: `Connection ${connectionId} success rate is ${Math.round(successRate)}%`,
        connectionId,
        timestamp: new Date().toISOString(),
        acknowledged: false,
      });
    }
  }

  private addAlert(alert: SyncAlert): void {
    this.alerts.push(alert);
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
  }
}

interface ConnectionSyncMetrics {
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  totalTransactionsImported: number;
  totalDurationMs: number;
  consecutiveFailures: number;
  lastSyncAt: string | null;
}

export const syncMonitor = new SyncMonitor();