import { execSync, execFileSync } from "child_process";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import { prisma } from "@/server/db/prisma";
import { type MigrationRecord, type MigrationBatch, type InstallStatus, type InstallMode } from "./types";

export interface MigrationFile {
  id: string;
  name: string;
  version: string;
  checksum: string;
  script: string;
  rollbackScript?: string;
}

export interface MigrationReport {
  batches: MigrationBatch[];
  totalMigrations: number;
  successfulMigrations: number;
  failedMigrations: number;
  totalDuration: number;
  status: InstallStatus;
}

export class MigrationRunner {
  private migrationFiles: MigrationFile[] = [];
  private batches: MigrationBatch[] = [];
  private currentBatch = 0;
  private schemaPath: string;

  constructor(schemaPath?: string) {
    this.schemaPath = schemaPath ?? path.resolve(process.cwd(), "prisma/schema.prisma");
  }

  registerMigration(file: MigrationFile): void {
    if (this.migrationFiles.some((m) => m.id === file.id)) {
      throw new Error(`Migration already registered: ${file.id}`);
    }
    this.migrationFiles.push(file);
  }

  registerMigrations(files: MigrationFile[]): void {
    for (const file of files) {
      this.registerMigration(file);
    }
  }

  async getPendingMigrations(): Promise<MigrationFile[]> {
    return this.migrationFiles.filter((m) => !this.executedMigrations.has(m.id));
  }

  async getExecutedMigrations(): Promise<MigrationRecord[]> {
    const rows = await this.loadMigrationHistory();
    return rows.map((r) => ({
      id: r.id,
      name: r.migration_name,
      version: r.migration_name,
      batch: 1,
      executedAt: r.executed_at ?? new Date(),
      duration: r.duration_ms,
      checksum: r.checksum,
      success: r.success,
      rollbackScript: undefined,
    }));
  }

  async runPending(version: string, mode?: InstallMode): Promise<MigrationReport> {
    const pending = await this.getPendingMigrations();
    const batches: MigrationBatch[] = [];
    let successful = 0;
    let failed = 0;
    const startTime = Date.now();

    const skip = mode === "validate-only";

    if (!skip && pending.length > 0) {
      try {
        await this.runPrismaMigrate();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Prisma migration failed";
        const batch: MigrationBatch = {
          id: `batch_1_${Date.now()}`,
          batch: 1,
          startedAt: new Date(),
          migrations: pending.map((m) => ({
            id: m.id,
            name: m.name,
            version: m.version,
            batch: 1,
            executedAt: new Date(),
            duration: 0,
            checksum: m.checksum,
            success: false,
            rollbackScript: m.rollbackScript,
          })),
          success: false,
          error: message,
          completedAt: new Date(),
        };
        batches.push(batch);
        failed = pending.length;
        return {
          batches,
          totalMigrations: pending.length,
          successfulMigrations: 0,
          failedMigrations: failed,
          totalDuration: Date.now() - startTime,
          status: "failed",
        };
      }
    }

    const migrated = await this.loadMigrationHistory();

    for (const m of pending) {
      const record = migrated.find((r) => r.migration_name === m.name);
      const success = record?.success ?? false;
      if (success) successful++;
      else failed++;
    }

    const batch: MigrationBatch = {
      id: `batch_1_${Date.now()}`,
      batch: 1,
      startedAt: new Date(),
      migrations: pending.map((m) => {
        const record = migrated.find((r) => r.migration_name === m.name);
        return {
          id: m.id,
          name: m.name,
          version: m.version,
          batch: 1,
          executedAt: record?.executed_at ?? new Date(),
          duration: record?.duration_ms ?? 0,
          checksum: m.checksum,
          success: record?.success ?? false,
          rollbackScript: m.rollbackScript,
        };
      }),
      success: failed === 0,
      completedAt: new Date(),
    };
    batches.push(batch);
    this.batches.push(batch);

    const status: InstallStatus = failed === 0 ? "completed" : successful > 0 ? "completed" : "failed";

    return {
      batches,
      totalMigrations: pending.length,
      successfulMigrations: successful,
      failedMigrations: failed,
      totalDuration: Date.now() - startTime,
      status,
    };
  }

  async runBatch(migrations: MigrationFile[], _version: string): Promise<MigrationBatch> {
    this.currentBatch++;
    const batch: MigrationBatch = {
      id: `batch_${this.currentBatch}_${Date.now()}`,
      batch: this.currentBatch,
      startedAt: new Date(),
      migrations: [],
      success: true,
    };

    try {
      await this.runPrismaMigrate();
      batch.success = true;
    } catch (err) {
      batch.success = false;
      batch.error = err instanceof Error ? err.message : "Migration failed";
    }

    for (const migration of migrations) {
      const record: MigrationRecord = {
        id: migration.id,
        name: migration.name,
        version: migration.version,
        batch: this.currentBatch,
        executedAt: new Date(),
        duration: 0,
        checksum: migration.checksum,
        success: batch.success,
        rollbackScript: batch.success ? undefined : migration.rollbackScript,
      };
      batch.migrations.push(record);
    }

    batch.completedAt = new Date();
    this.batches.push(batch);
    return batch;
  }

  async rollbackTarget(version: string): Promise<boolean> {
    try {
      execSync(`npx prisma migrate resolve --applied "${version}"`, {
        cwd: process.cwd(),
        stdio: "pipe",
      });
      return true;
    } catch {
      return false;
    }
  }

  async rollbackBatch(_batchNumber: number): Promise<boolean> {
    try {
      const history = await this.loadMigrationHistory();
      const toRollback = history.filter((r) => r.success);
      for (const migration of toRollback.reverse()) {
        try {
          execSync(`npx prisma migrate resolve --rolled-back "${migration.migration_name}"`, {
            cwd: process.cwd(),
            stdio: "pipe",
          });
        } catch {
          return false;
        }
      }
      return true;
    } catch {
      return false;
    }
  }

  async getMigrationCount(): Promise<{ total: number; executed: number; pending: number }> {
    const history = await this.loadMigrationHistory();
    return {
      total: this.migrationFiles.length,
      executed: history.length,
      pending: this.migrationFiles.length - history.length,
    };
  }

  isMigrationExecuted(id: string): boolean {
    return this.migrationFiles.some((m) => m.id === id);
  }

  async verifyMigrations(): Promise<{ verified: boolean; inconsistencies: string[] }> {
    const inconsistencies: string[] = [];
    const history = await this.loadMigrationHistory();

    for (const record of history) {
      const file = this.migrationFiles.find((m) => m.name === record.migration_name);
      if (file) {
        if (file.checksum !== record.checksum) {
          inconsistencies.push(
            `Migration ${record.migration_name} checksum mismatch: file=${file.checksum}, db=${record.checksum}`,
          );
        }
      }
    }

    return { verified: inconsistencies.length === 0, inconsistencies };
  }

  clear(): void {
    this.migrationFiles = [];
    this.batches = [];
    this.currentBatch = 0;
  }

  private async runPrismaMigrate(): Promise<void> {
    execFileSync("npx", ["prisma", "migrate", "deploy", "--schema", this.schemaPath], {
      cwd: process.cwd(),
      stdio: "pipe",
      env: { ...process.env },
    });
  }

  private executedMigrations = new Map<string, MigrationRecord>();

  private async loadMigrationHistory(): Promise<PrismaMigrationRecord[]> {
    try {
      const schemaName = this.getSchemaFromUrl();
      const query = schemaName
        ? `SELECT id, migration_name, checksum, finished_at AS executed_at, started_at, applied_steps_count::int FROM "${schemaName}"."_prisma_migrations" ORDER BY finished_at ASC`
        : `SELECT id, migration_name, checksum, finished_at AS executed_at, started_at, applied_steps_count::int FROM "_prisma_migrations" ORDER BY finished_at ASC`;
      const rows = await prisma.$queryRawUnsafe<PrismaMigrationRecord[]>(query);
      return rows.map((r) => ({
        ...r,
        duration_ms: r.started_at && r.executed_at
          ? new Date(r.executed_at).getTime() - new Date(r.started_at).getTime()
          : 0,
        success: r.applied_steps_count > 0,
      }));
    } catch {
      return [];
    }
  }

  private getSchemaFromUrl(): string | null {
    const url = process.env.DATABASE_URL ?? "";
    const match = url.match(/schema=([^&]+)/);
    return match ? match[1] : "public";
  }
}

interface PrismaMigrationRecord {
  id: string;
  migration_name: string;
  checksum: string;
  executed_at: Date | null;
  started_at: Date | null;
  applied_steps_count: number;
  duration_ms: number;
  success: boolean;
}

export const migrationRunner = new MigrationRunner();
