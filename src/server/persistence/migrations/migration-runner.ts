import type { MigrationDefinition, MigrationVersion } from "./migration";
import { Migration } from "./migration";
import type { MigrationRecord } from "./migration-history";
import { MigrationStatus } from "./migration-history";
import { MigrationHistory } from "./migration-history";
import { MigrationEngine } from "./migration-engine";
import { MigrationError } from "../domain/persistence-errors";

export interface MigrationRunnerConfig {
  engine: MigrationEngine;
}

export interface MigrationResult {
  records: MigrationRecord[];
  success: boolean;
  errors: string[];
}

export class MigrationRunner {
  private readonly engine: MigrationEngine;
  private readonly history = new MigrationHistory();

  constructor(config?: MigrationRunnerConfig) {
    this.engine = config?.engine ?? new MigrationEngine({ history: this.history });
  }

  getEngine(): MigrationEngine {
    return this.engine;
  }

  getHistory(): MigrationHistory {
    return this.history;
  }

  register(migration: MigrationDefinition): void {
    this.engine.register(migration);
  }

  registerMany(migrations: MigrationDefinition[]): void {
    this.engine.registerMany(migrations);
  }

  async runAll(): Promise<MigrationResult> {
    return this.execute(() => this.engine.runAll());
  }

  async runUpTo(version: MigrationVersion): Promise<MigrationResult> {
    return this.execute(() => this.engine.runUpTo(version));
  }

  async runByName(name: string): Promise<MigrationResult> {
    return this.execute(async () => {
      const record = await this.engine.runByName(name);
      return [record];
    });
  }

  async rollback(name: string): Promise<MigrationResult> {
    return this.execute(async () => {
      const record = await this.engine.rollback(name);
      return [record];
    });
  }

  async rollbackAll(): Promise<MigrationResult> {
    return this.execute(() => this.engine.rollbackAll());
  }

  async rollbackTo(version: MigrationVersion): Promise<MigrationResult> {
    return this.execute(() => this.engine.rollbackTo(version));
  }

  async validate(): Promise<boolean> {
    try {
      return await this.engine.validatePending();
    } catch {
      return false;
    }
  }

  async status(): Promise<{
    total: number;
    applied: number;
    pending: number;
    failed: number;
    records: MigrationRecord[];
  }> {
    const allRecords = await this.history.getAll();
    const applied = allRecords.filter(
      (r) => r.status === MigrationStatus.Completed,
    );
    const failed = allRecords.filter(
      (r) => r.status === MigrationStatus.Failed,
    );
    const totalMigrations = this.engine.getRegisteredMigrations().length;
    const pending = totalMigrations - applied.length;
    return {
      total: totalMigrations,
      applied: applied.length,
      pending,
      failed: failed.length,
      records: allRecords,
    };
  }

  private async execute(
    fn: () => Promise<MigrationRecord[]>,
  ): Promise<MigrationResult> {
    const errors: string[] = [];
    try {
      const records = await fn();
      return { records, success: true, errors };
    } catch (error) {
      errors.push((error as Error).message);
      return { records: [], success: false, errors };
    }
  }
}
