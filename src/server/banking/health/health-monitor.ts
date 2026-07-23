import type { IBankProvider } from "../providers/interface";
import type { BankConnection, ConnectionHealth, BankProviderKind } from "../domain/types";
import { HealthStatus, WebhookSubscriptionStatus } from "../domain/types";
import { bankProviderRegistry } from "../providers/registry/engine";

export interface HealthCheckConfig {
  intervalMinutes: number;
  warningThresholdMs: number;
  criticalThresholdMs: number;
  failureThresholdCount: number;
}

export interface HealthSnapshot {
  connectionId: string;
  provider: BankProviderKind;
  status: HealthStatus;
  latencyMs: number | null;
  error: string | null;
  timestamp: string;
}

export class BankingHealthMonitor {
  private history = new Map<string, HealthSnapshot[]>();
  private readonly maxHistoryPerConnection = 100;
  private readonly defaultConfig: HealthCheckConfig = {
    intervalMinutes: 15,
    warningThresholdMs: 2000,
    criticalThresholdMs: 5000,
    failureThresholdCount: 3,
  };

  async checkConnection(
    provider: IBankProvider,
    connection: BankConnection,
    config?: Partial<HealthCheckConfig>,
  ): Promise<ConnectionHealth> {
    const cfg = { ...this.defaultConfig, ...config };
    const startTime = Date.now();
    let status: HealthStatus = HealthStatus.HEALTHY;
    let latencyMs: number | null = null;
    let error: string | null = null;

    try {
      const healthy = await provider.isHealthy();
      latencyMs = Date.now() - startTime;

      if (!healthy) {
        status = HealthStatus.UNHEALTHY;
        error = "Provider health check returned unhealthy";
      } else if (latencyMs > cfg.criticalThresholdMs) {
        status = HealthStatus.DEGRADED;
        error = `High latency: ${latencyMs}ms`;
      } else if (latencyMs > cfg.warningThresholdMs) {
        status = HealthStatus.DEGRADED;
      }
    } catch (err) {
      status = HealthStatus.UNHEALTHY;
      error = err instanceof Error ? err.message : String(err);
      latencyMs = Date.now() - startTime;
    }

    this.recordSnapshot({
      connectionId: connection.id,
      provider: provider.kind,
      status,
      latencyMs,
      error,
      timestamp: new Date().toISOString(),
    });

    const recentSnapshots = this.history.get(connection.id) ?? [];
    const recentFailures = recentSnapshots.filter(
      (s) => s.status === "UNHEALTHY" || s.status === "DOWN",
    ).length;

    if (recentFailures >= cfg.failureThresholdCount) {
      status = HealthStatus.DOWN;
    }

    let score = 100;
    if (status === "DEGRADED") score -= 20;
    if (status === "UNHEALTHY") score -= 40;
    if (status === "DOWN") score -= 60;
    if (error) score -= 10;

    const warnings: string[] = [];
    if (latencyMs && latencyMs > cfg.warningThresholdMs) warnings.push("High latency");
    if (recentFailures > 0) warnings.push(`${recentFailures} recent failure(s)`);

    return {
      connectionId: connection.id,
      providerKind: provider.kind,
      status,
      lastSyncAt: connection.lastSyncAt,
      lastHealthCheckAt: new Date().toISOString(),
      latencyMs,
      successRate30d: this.computeSuccessRate(connection.id),
      syncCount30d: recentSnapshots.length,
      failureCount30d: recentFailures,
      rateLimitRemaining: provider.getRateLimits().requestsPerMinute,
      webhookStatus: WebhookSubscriptionStatus.UNKNOWN,
      credentialExpiresAt: connection.expiresAt,
      credentialRotationDue: false,
      apiVersion: provider.getManifest().version,
      score: Math.max(0, score),
      warnings,
      errors: error ? [error] : [],
    };
  }

  private computeSuccessRate(connectionId: string): number {
    const snapshots = this.history.get(connectionId) ?? [];
    if (snapshots.length === 0) return 100;
    const healthy = snapshots.filter((s) => s.status === HealthStatus.HEALTHY).length;
    return Math.round((healthy / snapshots.length) * 100);
  }

  private recordSnapshot(snapshot: HealthSnapshot): void {
    if (!this.history.has(snapshot.connectionId)) {
      this.history.set(snapshot.connectionId, []);
    }
    const snapshots = this.history.get(snapshot.connectionId)!;
    snapshots.push(snapshot);
    if (snapshots.length > this.maxHistoryPerConnection) {
      snapshots.shift();
    }
  }

  getConnectionHistory(connectionId: string, limit = 20): HealthSnapshot[] {
    return (this.history.get(connectionId) ?? []).slice(-limit);
  }

  clearHistory(connectionId?: string): void {
    if (connectionId) {
      this.history.delete(connectionId);
    } else {
      this.history.clear();
    }
  }
}

export const bankingHealthMonitor = new BankingHealthMonitor();