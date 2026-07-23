import type { BankProviderKind } from "../../domain/types";
import { PROVIDER_DEFINITION_MAP } from "../definitions/provider-definitions";
import type { ProviderHealthStatus, DiagnosticsReport } from "./types";

export class ProviderDiagnosticsService {
  private healthCache = new Map<BankProviderKind, ProviderHealthStatus>();
  private lastCheckTime = new Map<BankProviderKind, number>();

  updateHealth(kind: BankProviderKind, status: Partial<ProviderHealthStatus>): void {
    const existing = this.healthCache.get(kind) ?? this.buildDefault(kind);
    this.healthCache.set(kind, {
      ...existing,
      ...status,
      lastCheckedAt: new Date().toISOString(),
    });
    this.lastCheckTime.set(kind, Date.now());
  }

  getHealth(kind: BankProviderKind): ProviderHealthStatus {
    const cached = this.healthCache.get(kind);
    if (cached) return cached;
    return this.buildDefault(kind);
  }

  private buildDefault(kind: BankProviderKind): ProviderHealthStatus {
    const def = PROVIDER_DEFINITION_MAP.get(kind);
    return {
      providerKind: kind,
      name: def?.name ?? kind,
      status: "unknown",
      latencyMs: null,
      lastCheckedAt: new Date().toISOString(),
      successRate: def ? 100 : 0,
      errorRate: 0,
      score: def ? 50 : 0,
    };
  }

  generateReport(): DiagnosticsReport {
    const providers: ProviderHealthStatus[] = [];
    const recommendations: string[] = [];

    for (const [kind, cache] of this.healthCache.entries()) {
      providers.push(cache);

      if (cache.status === "unavailable") {
        const def = PROVIDER_DEFINITION_MAP.get(kind);
        recommendations.push(
          `${def?.name ?? kind} is unavailable. Check credentials and API status.`,
        );
      }
      if (cache.status === "degraded") {
        recommendations.push(
          `${cache.name} is degraded (latency: ${cache.latencyMs}ms, success: ${cache.successRate}%). Consider failover.`,
        );
      }
      if (cache.score < 50) {
        recommendations.push(
          `${cache.name} health score is ${cache.score}/100. Investigate connectivity issues.`,
        );
      }
    }

    const defs = PROVIDER_DEFINITION_MAP;
    for (const kind of defs.keys()) {
      if (!this.healthCache.has(kind as BankProviderKind)) {
        const def = defs.get(kind);
        if (def && def.healthEndpoint) {
          recommendations.push(
            `${def.name} has not been checked. Configure health monitoring for ${def.healthEndpoint}.`,
          );
        }
      }
    }

    const total = providers.length;
    const healthy = providers.filter((p) => p.status === "healthy").length;
    const degraded = providers.filter((p) => p.status === "degraded").length;
    const unavailable = providers.filter((p) => p.status === "unavailable").length;
    const unknown = providers.filter((p) => p.status === "unknown").length;

    return {
      generatedAt: new Date().toISOString(),
      summary: { total, healthy, degraded, unavailable, unknown },
      providers,
      recommendations,
    };
  }

  reset(): void {
    this.healthCache.clear();
    this.lastCheckTime.clear();
  }
}

export const providerDiagnostics = new ProviderDiagnosticsService();
