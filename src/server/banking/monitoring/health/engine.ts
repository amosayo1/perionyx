import type {
  BankProviderKind,
  BankingRegion,
  HealthStatus,
} from "../../domain/types";
import type {
  ProviderHealth,
  AccountHealthStatus,
  SyncHealthStatus,
  HealthScore,
} from "../types";
import { connectionHealthMonitor } from "../connections/engine";
import { providerMonitor } from "../providers/engine";

export class HealthScorer {
  generateScores(): HealthScore {
    const connections = connectionHealthMonitor.getAll();
    const providerStates = providerMonitor.getAllProviderStates();
    const now = new Date().toISOString();

    const providerScores: Record<string, number> = {};
    const connectionScores: Record<string, number> = {};
    const institutionAccum: Record<string, { total: number; count: number }> = {};
    for (const conn of connections) {
      connectionScores[conn.connectionId] = conn.healthScore;
      const entry = institutionAccum[conn.institutionName] ?? { total: 0, count: 0 };
      entry.total += conn.healthScore;
      entry.count++;
      institutionAccum[conn.institutionName] = entry;
    }

    const institutionScores: Record<string, number> = {};
    for (const [name, acc] of Object.entries(institutionAccum)) {
      institutionScores[name] = Math.round(acc.total / acc.count);
    }

    const accountScores: Record<string, number> = {};
    const regionScores: Record<string, number> = {};

    for (const p of providerStates) {
      const key = `${p.providerKind}::${p.region}`;
      let score = 100;
      if (!p.available) score -= 40;
      if (p.authStatus === "DEGRADED") score -= 20;
      if (p.authStatus === "FAILED") score -= 40;
      if (!p.webhookHealthy) score -= 10;
      if (p.latencyMs !== null) {
        if (p.latencyMs > 5000) score -= 30;
        else if (p.latencyMs > 3000) score -= 20;
        else if (p.latencyMs > 1000) score -= 10;
      }
      if (p.capabilitiesMissing.length > 0) score -= 10;
      providerScores[key] = Math.max(0, score);
    }

    for (const [key, connScore] of Object.entries(connectionScores)) {
      const conn = connections.find((c) => c.connectionId === key);
      if (conn) {
        const regionKey = "GLOBAL";
        const existing = regionScores[regionKey]
          ? {
              total: regionScores[regionKey] *
                Object.keys(regionScores).length,
              count: Object.keys(regionScores).length,
            }
          : { total: 0, count: 0 };
        existing.total += connScore;
        existing.count++;
        regionScores[regionKey] = Math.round(existing.total / existing.count);
      }
    }

    const allScores = [
      ...Object.values(providerScores),
      ...Object.values(connectionScores),
    ];
    const overall =
      allScores.length > 0
        ? Math.round(
            allScores.reduce((a, b) => a + b, 0) / allScores.length,
          )
        : 100;

    return {
      overall,
      providers: providerScores,
      connections: connectionScores,
      institutions: institutionScores,
      accounts: accountScores,
      regions: regionScores,
      generatedAt: now,
    };
  }

  getScores(): HealthScore {
    return this.generateScores();
  }

  categorizeScore(score: number): HealthStatus {
    if (score >= 80) return "HEALTHY" as HealthStatus;
    if (score >= 50) return "DEGRADED" as HealthStatus;
    if (score >= 20) return "UNHEALTHY" as HealthStatus;
    return "DOWN" as HealthStatus;
  }
}

export const healthScorer = new HealthScorer();