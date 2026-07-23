import type { CommandKind } from "../types";

export interface OrchestrationAuditEntry {
  correlationId: string;
  commandKind: CommandKind;
  tenantId: string;
  userId: string;
  region: string;
  providerUsed: string;
  success: boolean;
  durationMs: number;
  retryCount: number;
  fallbackCount: number;
  errors: Array<{ message: string; code: string; stage: string }>;
  timestamp: string;
}

export class OrchestrationAudit {
  private entries: OrchestrationAuditEntry[] = [];
  private readonly maxEntries = 50_000;

  record(entry: OrchestrationAuditEntry): void {
    this.entries.push(entry);
    if (this.entries.length > this.maxEntries) {
      this.entries.shift();
    }
  }

  getByCorrelationId(correlationId: string): OrchestrationAuditEntry[] {
    return this.entries.filter((e) => e.correlationId === correlationId);
  }

  getByTenant(tenantId: string, limit = 100): OrchestrationAuditEntry[] {
    return this.entries.filter((e) => e.tenantId === tenantId).slice(-limit);
  }

  getByProvider(provider: string, limit = 100): OrchestrationAuditEntry[] {
    return this.entries.filter((e) => e.providerUsed === provider).slice(-limit);
  }

  getRecent(limit = 100): OrchestrationAuditEntry[] {
    return this.entries.slice(-limit);
  }

  getSummary(tenantId?: string): {
    total: number;
    successful: number;
    failed: number;
    avgDurationMs: number;
    totalRetries: number;
    totalFallbacks: number;
  } {
    const subset = tenantId
      ? this.entries.filter((e) => e.tenantId === tenantId)
      : this.entries;

    const successful = subset.filter((e) => e.success).length;
    const failed = subset.filter((e) => !e.success).length;
    const totalDuration = subset.reduce((sum, e) => sum + e.durationMs, 0);
    const totalRetries = subset.reduce((sum, e) => sum + e.retryCount, 0);
    const totalFallbacks = subset.reduce((sum, e) => sum + e.fallbackCount, 0);

    return {
      total: subset.length,
      successful,
      failed,
      avgDurationMs: subset.length > 0 ? Math.round(totalDuration / subset.length) : 0,
      totalRetries,
      totalFallbacks,
    };
  }

  clear(): void {
    this.entries = [];
  }
}

export const orchestrationAudit = new OrchestrationAudit();