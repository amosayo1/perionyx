import { Migration } from "./migration";
import type { MigrationDefinition, MigrationVersion } from "./migration";
import type { MigrationRecord } from "./migration-history";
import { MigrationStatus } from "./migration-history";
import type { IMigrationHistory } from "./migration-history";
import { MigrationHistory } from "./migration-history";
import { MigrationError } from "../domain/persistence-errors";

export interface MigrationEngineConfig {
  history: IMigrationHistory;
}

export class MigrationEngine {
  private readonly migrations: Map<string, MigrationDefinition> = new Map();
  private readonly history: IMigrationHistory;

  constructor(config: MigrationEngineConfig) {
    this.history = config.history;
  }

  register(migration: MigrationDefinition): void {
    if (this.migrations.has(migration.name)) {
      throw new MigrationError(
        `Migration already registered: ${migration.name}`,
        migration.name,
      );
    }
    this.migrations.set(migration.name, migration);
  }

  registerMany(migrations: MigrationDefinition[]): void {
    const sorted = MigrationEngine.topologicalSort(migrations);
    for (const migration of sorted) {
      this.register(migration);
    }
  }

  async runAll(batchId?: string): Promise<MigrationRecord[]> {
    const sorted = this.getSortedMigrations();
    const applied: MigrationRecord[] = [];
    for (const migration of sorted) {
      const hasBeenApplied = await this.history.hasBeenApplied(migration.name);
      if (!hasBeenApplied) {
        const record = await this.runMigration(migration, batchId);
        applied.push(record);
      }
    }
    return applied;
  }

  async runUpTo(
    version: MigrationVersion,
    batchId?: string,
  ): Promise<MigrationRecord[]> {
    const sorted = this.getSortedMigrations();
    const applied: MigrationRecord[] = [];
    for (const migration of sorted) {
      if (Migration.compareVersions(migration.version, version) > 0) break;
      const hasBeenApplied = await this.history.hasBeenApplied(migration.name);
      if (!hasBeenApplied) {
        const record = await this.runMigration(migration, batchId);
        applied.push(record);
      }
    }
    return applied;
  }

  async runByName(
    name: string,
    batchId?: string,
  ): Promise<MigrationRecord> {
    const migration = this.migrations.get(name);
    if (!migration) {
      throw new MigrationError(`Migration not found: ${name}`, name);
    }
    return this.runMigration(migration, batchId);
  }

  async rollback(name: string): Promise<MigrationRecord> {
    const migration = this.migrations.get(name);
    if (!migration) {
      throw new MigrationError(`Migration not found: ${name}`, name);
    }
    const record = await this.history.getByName(name);
    if (!record) {
      throw new MigrationError(
        `Migration has not been applied: ${name}`,
        name,
      );
    }
    const startTime = Date.now();
    try {
      await migration.down();
      await this.history.remove(name);
      return {
        ...record,
        status: MigrationStatus.RolledBack,
        completedAt: new Date(),
        durationMs: Date.now() - startTime,
      };
    } catch (error) {
      const failedRecord: MigrationRecord = {
        ...record,
        status: MigrationStatus.Failed,
        error: (error as Error).message,
        completedAt: new Date(),
        durationMs: Date.now() - startTime,
      };
      await this.history.update(name, failedRecord);
      throw error;
    }
  }

  async rollbackAll(): Promise<MigrationRecord[]> {
    const sorted = this.getSortedMigrations().reverse();
    const rolledBack: MigrationRecord[] = [];
    for (const migration of sorted) {
      const hasBeenApplied = await this.history.hasBeenApplied(migration.name);
      if (hasBeenApplied) {
        const record = await this.rollback(migration.name);
        rolledBack.push(record);
      }
    }
    return rolledBack;
  }

  async rollbackTo(
    version: MigrationVersion,
  ): Promise<MigrationRecord[]> {
    const sorted = this.getSortedMigrations().reverse();
    const rolledBack: MigrationRecord[] = [];
    for (const migration of sorted) {
      if (Migration.compareVersions(migration.version, version) <= 0) break;
      const hasBeenApplied = await this.history.hasBeenApplied(migration.name);
      if (hasBeenApplied) {
        const record = await this.rollback(migration.name);
        rolledBack.push(record);
      }
    }
    return rolledBack;
  }

  async validatePending(): Promise<boolean> {
    const sorted = this.getSortedMigrations();
    for (const migration of sorted) {
      const hasBeenApplied = await this.history.hasBeenApplied(migration.name);
      if (!hasBeenApplied) {
        const valid = await migration.validate();
        if (!valid) return false;
      }
    }
    return true;
  }

  async validateAll(): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();
    for (const [name, migration] of this.migrations) {
      results.set(name, await migration.validate());
    }
    return results;
  }

  getRegisteredMigrations(): MigrationDefinition[] {
    return [...this.migrations.values()];
  }

  getPendingMigrations(): Promise<MigrationDefinition[]> {
    return this.getFilteredMigrations(async (m) => {
      return !(await this.history.hasBeenApplied(m.name));
    });
  }

  private async runMigration(
    migration: MigrationDefinition,
    batchId?: string,
  ): Promise<MigrationRecord> {
    const startTime = Date.now();
    const record: MigrationRecord = {
      name: migration.name,
      version: migration.version,
      description: migration.description,
      checksum: migration.checksum,
      status: MigrationStatus.Running,
      appliedAt: new Date(),
      batchId: batchId ?? `batch_${Date.now()}`,
    };
    try {
      await this.history.add(record);
      await migration.up();
      if (migration.seed) {
        await migration.seed();
      }
      const completed: MigrationRecord = {
        ...record,
        status: MigrationStatus.Completed,
        completedAt: new Date(),
        durationMs: Date.now() - startTime,
      };
      await this.history.update(migration.name, completed);
      return completed;
    } catch (error) {
      const failed: MigrationRecord = {
        ...record,
        status: MigrationStatus.Failed,
        error: (error as Error).message,
        completedAt: new Date(),
        durationMs: Date.now() - startTime,
      };
      await this.history.update(migration.name, failed);
      throw error;
    }
  }

  private getSortedMigrations(): MigrationDefinition[] {
    return [...this.migrations.values()].sort((a, b) =>
      Migration.compareVersions(a.version, b.version),
    );
  }

  private async getFilteredMigrations(
    predicate: (m: MigrationDefinition) => Promise<boolean>,
  ): Promise<MigrationDefinition[]> {
    const results: MigrationDefinition[] = [];
    for (const migration of this.getSortedMigrations()) {
      if (await predicate(migration)) {
        results.push(migration);
      }
    }
    return results;
  }

  static topologicalSort(
    migrations: MigrationDefinition[],
  ): MigrationDefinition[] {
    const visited = new Set<string>();
    const sorted: MigrationDefinition[] = [];
    const visiting = new Set<string>();

    function visit(m: MigrationDefinition): void {
      if (visiting.has(m.name)) {
        throw new MigrationError(
          `Circular dependency detected: ${m.name}`,
          m.name,
        );
      }
      if (visited.has(m.name)) return;
      visiting.add(m.name);
      for (const dep of m.dependencies) {
        const depMigration = migrations.find((mm) => mm.name === dep.name);
        if (depMigration) visit(depMigration);
      }
      visiting.delete(m.name);
      visited.add(m.name);
      sorted.push(m);
    }

    for (const migration of migrations) {
      if (!visited.has(migration.name)) visit(migration);
    }

    return sorted;
  }
}
