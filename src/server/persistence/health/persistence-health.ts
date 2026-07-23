import { RepositoryRegistry } from "../registry/repository-registry";
import { RepositoryFactory } from "../registry/repository-factory";
import type { PersistenceProvider } from "../domain/persistence-types";

export interface RepositoryHealth {
  name: string;
  status: "healthy" | "unhealthy" | "degraded" | "unknown";
  latencyMs?: number;
  errorCount: number;
  lastAccessed?: Date;
}

export interface TransactionHealth {
  activeCount: number;
  totalCommitted: number;
  totalRolledBack: number;
  totalFailed: number;
  deadlockCount: number;
}

export interface MigrationHealth {
  totalMigrations: number;
  appliedMigrations: number;
  pendingMigrations: number;
  failedMigrations: number;
  lastApplied?: string;
}

export interface PersistenceHealthReport {
  status: "healthy" | "degraded" | "unhealthy";
  provider: PersistenceProvider;
  repositoryCount: number;
  repositories: RepositoryHealth[];
  transaction: TransactionHealth;
  migration: MigrationHealth;
  version: string;
  uptimeMs: number;
  healthScore: number;
}

export class PersistenceHealthMonitor {
  private startTime = Date.now();
  private repositoryLatencies = new Map<string, number[]>();
  private repositoryErrors = new Map<string, number>();
  private repositoryAccess = new Map<string, Date>();

  private transactionCommitted = 0;
  private transactionRolledBack = 0;
  private transactionFailed = 0;
  private deadlockCount = 0;

  recordRepositoryAccess(name: string): void {
    this.repositoryAccess.set(name, new Date());
  }

  recordRepositoryLatency(name: string, latencyMs: number): void {
    const latencies = this.repositoryLatencies.get(name) ?? [];
    latencies.push(latencyMs);
    if (latencies.length > 100) latencies.shift();
    this.repositoryLatencies.set(name, latencies);
  }

  recordRepositoryError(name: string): void {
    this.repositoryErrors.set(name, (this.repositoryErrors.get(name) ?? 0) + 1);
  }

  recordTransactionCommit(): void {
    this.transactionCommitted++;
  }

  recordTransactionRollback(): void {
    this.transactionRolledBack++;
  }

  recordTransactionFailure(): void {
    this.transactionFailed++;
  }

  recordDeadlock(): void {
    this.deadlockCount++;
  }

  async generateReport(): Promise<PersistenceHealthReport> {
    const registry = RepositoryRegistry.getInstance();
    const allRepos = registry.getAll();
    const repositoryHealth: RepositoryHealth[] = [];

    for (const [name] of allRepos) {
      const errors = this.repositoryErrors.get(name) ?? 0;
      const latencies = this.repositoryLatencies.get(name) ?? [];
      const avgLatency = latencies.length > 0
        ? latencies.reduce((a, b) => a + b, 0) / latencies.length
        : undefined;
      repositoryHealth.push({
        name,
        status: errors > 5 ? "unhealthy" : errors > 0 ? "degraded" : "healthy",
        latencyMs: avgLatency,
        errorCount: errors,
        lastAccessed: this.repositoryAccess.get(name),
      });
    }

    const totalErrors = [...this.repositoryErrors.values()].reduce((a, b) => a + b, 0);
    const totalLatencies = [...this.repositoryLatencies.values()].flat();
    const avgLatency = totalLatencies.length > 0
      ? totalLatencies.reduce((a, b) => a + b, 0) / totalLatencies.length
      : 0;
    const errorRate = totalErrors / (this.transactionCommitted + 1);
    const latencyScore = Math.max(0, 100 - avgLatency / 10);
    const errorScore = Math.max(0, 100 - errorRate * 20);
    const transactionScore = Math.max(
      0,
      100 - (this.transactionFailed / (this.transactionCommitted + 1)) * 50,
    );
    const healthScore = Math.round((latencyScore + errorScore + transactionScore) / 3);

    return {
      status: healthScore >= 90 ? "healthy" : healthScore >= 70 ? "degraded" : "unhealthy",
      provider: RepositoryFactory.getProvider(),
      repositoryCount: registry.count(),
      repositories: repositoryHealth,
      transaction: {
        activeCount: 0,
        totalCommitted: this.transactionCommitted,
        totalRolledBack: this.transactionRolledBack,
        totalFailed: this.transactionFailed,
        deadlockCount: this.deadlockCount,
      },
      migration: {
        totalMigrations: 0,
        appliedMigrations: 0,
        pendingMigrations: 0,
        failedMigrations: 0,
      },
      version: "1.0.0",
      uptimeMs: Date.now() - this.startTime,
      healthScore,
    };
  }
}

export const persistenceHealth = new PersistenceHealthMonitor();
