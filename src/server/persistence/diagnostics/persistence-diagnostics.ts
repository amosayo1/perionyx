import { RepositoryRegistry } from "../registry/repository-registry";
import { RepositoryFactory } from "../registry/repository-factory";
import type { PersistenceProvider } from "../domain/persistence-types";

export interface RepositoryStatistics {
  name: string;
  operationCount: number;
  errorCount: number;
  averageLatencyMs: number;
  status: string;
}

export interface PerformanceSummary {
  totalOperations: number;
  totalErrors: number;
  averageLatencyMs: number;
  p99LatencyMs: number;
  operationsByType: Record<string, number>;
  errorsByRepository: Record<string, number>;
}

export interface MigrationSummary {
  totalMigrations: number;
  appliedMigrations: number;
  pendingMigrations: number;
  failedMigrations: number;
  lastAppliedDate?: Date;
}

export interface HealthSummary {
  status: string;
  healthScore: number;
  repositoryCount: number;
  activeTransactions: number;
  uptimeMs: number;
  provider: PersistenceProvider;
}

export interface PersistenceDiagnosticsReport {
  generatedAt: Date;
  provider: PersistenceProvider;
  repositoryStats: RepositoryStatistics[];
  performance: PerformanceSummary;
  migration: MigrationSummary;
  health: HealthSummary;
  warnings: string[];
  recommendations: string[];
}

export interface DiagnosticsCollectorOptions {
  maxLatencySamples?: number;
}

export class PersistenceDiagnostics {
  private operationCounts = new Map<string, number>();
  private errorCounts = new Map<string, number>();
  private latencies = new Map<string, number[]>();
  private operationsByType = new Map<string, number>();
  private startTime = Date.now();
  private options: DiagnosticsCollectorOptions;

  constructor(options?: DiagnosticsCollectorOptions) {
    this.options = {
      maxLatencySamples: 100,
      ...options,
    };
  }

  recordOperation(repositoryName: string, operationType: string, latencyMs: number): void {
    this.operationCounts.set(
      repositoryName,
      (this.operationCounts.get(repositoryName) ?? 0) + 1,
    );
    this.operationsByType.set(
      operationType,
      (this.operationsByType.get(operationType) ?? 0) + 1,
    );
    const latencies = this.latencies.get(repositoryName) ?? [];
    latencies.push(latencyMs);
    if (latencies.length > (this.options.maxLatencySamples ?? 100)) {
      latencies.shift();
    }
    this.latencies.set(repositoryName, latencies);
  }

  recordError(repositoryName: string): void {
    this.errorCounts.set(
      repositoryName,
      (this.errorCounts.get(repositoryName) ?? 0) + 1,
    );
  }

  async generateFullReport(): Promise<PersistenceDiagnosticsReport> {
    const registry = RepositoryRegistry.getInstance();
    const repositoryStats = this.collectRepositoryStats(registry);
    const performance = this.buildPerformanceSummary(repositoryStats);
    const migration = this.buildMigrationSummary();
    const health = this.buildHealthSummary(repositoryStats);
    const warnings = this.generateWarnings(repositoryStats, performance);
    const recommendations = this.generateRecommendations(
      warnings,
      performance,
    );

    return {
      generatedAt: new Date(),
      provider: RepositoryFactory.getProvider(),
      repositoryStats,
      performance,
      migration,
      health,
      warnings,
      recommendations,
    };
  }

  async generateRepositoryStatistics(): Promise<RepositoryStatistics[]> {
    const registry = RepositoryRegistry.getInstance();
    return this.collectRepositoryStats(registry);
  }

  async generatePerformanceSummary(): Promise<PerformanceSummary> {
    const registry = RepositoryRegistry.getInstance();
    const stats = this.collectRepositoryStats(registry);
    return this.buildPerformanceSummary(stats);
  }

  async generateMigrationSummary(): Promise<MigrationSummary> {
    return this.buildMigrationSummary();
  }

  async generateHealthSummary(): Promise<HealthSummary> {
    const registry = RepositoryRegistry.getInstance();
    const stats = this.collectRepositoryStats(registry);
    return this.buildHealthSummary(stats);
  }

  private collectRepositoryStats(
    registry: RepositoryRegistry,
  ): RepositoryStatistics[] {
    const names = registry.getNames();
    return names.map((name) => ({
      name,
      operationCount: this.operationCounts.get(name) ?? 0,
      errorCount: this.errorCounts.get(name) ?? 0,
      averageLatencyMs: this.calculateAverageLatency(name),
      status: (this.errorCounts.get(name) ?? 0) > 5 ? "unhealthy" : "healthy",
    }));
  }

  private calculateAverageLatency(name: string): number {
    const latencies = this.latencies.get(name);
    if (!latencies || latencies.length === 0) return 0;
    return latencies.reduce((a, b) => a + b, 0) / latencies.length;
  }

  private calculateP99Latency(): number {
    const allLatencies = [...this.latencies.values()].flat();
    if (allLatencies.length === 0) return 0;
    const sorted = [...allLatencies].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * 0.99) - 1;
    return sorted[index] ?? sorted[sorted.length - 1] ?? 0;
  }

  private buildPerformanceSummary(
    stats: RepositoryStatistics[],
  ): PerformanceSummary {
    const totalOperations = stats.reduce((a, s) => a + s.operationCount, 0);
    const totalErrors = stats.reduce((a, s) => a + s.errorCount, 0);
    const avgLatency =
      stats.length > 0
        ? stats.reduce((a, s) => a + s.averageLatencyMs, 0) / stats.length
        : 0;
    const errorsByRepository: Record<string, number> = {};
    for (const stat of stats) {
      if (stat.errorCount > 0) errorsByRepository[stat.name] = stat.errorCount;
    }
    return {
      totalOperations,
      totalErrors,
      averageLatencyMs: Math.round(avgLatency * 100) / 100,
      p99LatencyMs: Math.round(this.calculateP99Latency() * 100) / 100,
      operationsByType: Object.fromEntries(this.operationsByType),
      errorsByRepository,
    };
  }

  private buildMigrationSummary(): MigrationSummary {
    return {
      totalMigrations: 0,
      appliedMigrations: 0,
      pendingMigrations: 0,
      failedMigrations: 0,
    };
  }

  private buildHealthSummary(
    stats: RepositoryStatistics[],
  ): HealthSummary {
    const totalErrors = stats.reduce((a, s) => a + s.errorCount, 0);
    const totalOps = stats.reduce((a, s) => a + s.operationCount, 0);
    const errorRate = totalOps > 0 ? totalErrors / totalOps : 0;
    const healthScore = Math.max(0, Math.min(100, Math.round(100 - errorRate * 100)));

    return {
      status: healthScore >= 90 ? "healthy" : healthScore >= 70 ? "degraded" : "unhealthy",
      healthScore,
      repositoryCount: stats.length,
      activeTransactions: 0,
      uptimeMs: Date.now() - this.startTime,
      provider: RepositoryFactory.getProvider(),
    };
  }

  private generateWarnings(
    stats: RepositoryStatistics[],
    performance: PerformanceSummary,
  ): string[] {
    const warnings: string[] = [];
    for (const stat of stats) {
      if (stat.errorCount > 10) {
        warnings.push(
          `Repository "${stat.name}" has ${stat.errorCount} errors`,
        );
      }
      if (stat.averageLatencyMs > 500) {
        warnings.push(
          `Repository "${stat.name}" average latency is ${stat.averageLatencyMs}ms`,
        );
      }
    }
    if (performance.p99LatencyMs > 2000) {
      warnings.push(`P99 latency is ${performance.p99LatencyMs}ms`);
    }
    if (performance.totalErrors > performance.totalOperations * 0.1) {
      warnings.push("Error rate exceeds 10%");
    }
    return warnings;
  }

  private generateRecommendations(
    warnings: string[],
    performance: PerformanceSummary,
  ): string[] {
    const recommendations: string[] = [];
    if (
      warnings.some((w) => w.includes("latency") || w.includes("P99"))
    ) {
      recommendations.push("Consider adding connection pooling or read replicas");
    }
    if (warnings.some((w) => w.includes("errors"))) {
      recommendations.push("Review error logs and add retry logic");
    }
    if (performance.totalErrors > 0) {
      recommendations.push("Implement circuit breaker for failing repositories");
    }
    if (performance.averageLatencyMs > 200) {
      recommendations.push("Add query optimization and proper indexing");
    }
    return recommendations;
  }
}
