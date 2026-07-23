import type { MigrationVersion } from "./migration";

export enum MigrationStatus {
  Pending = "pending",
  Running = "running",
  Completed = "completed",
  Failed = "failed",
  RolledBack = "rolledBack",
}

export interface MigrationRecord {
  name: string;
  version: MigrationVersion;
  description: string;
  checksum: string;
  status: MigrationStatus;
  appliedAt: Date;
  completedAt?: Date;
  durationMs?: number;
  error?: string;
  batchId: string;
}

export interface MigrationHistoryEntry {
  id: string;
  record: MigrationRecord;
}

export interface IMigrationHistory {
  getAll(): Promise<MigrationRecord[]>;
  getByName(name: string): Promise<MigrationRecord | null>;
  getPending(): Promise<MigrationRecord[]>;
  getCompleted(): Promise<MigrationRecord[]>;
  getFailed(): Promise<MigrationRecord[]>;
  add(record: MigrationRecord): Promise<void>;
  update(name: string, updates: Partial<MigrationRecord>): Promise<void>;
  remove(name: string): Promise<void>;
  getLastApplied(): Promise<MigrationRecord | null>;
  getBatch(batchId: string): Promise<MigrationRecord[]>;
  hasBeenApplied(name: string): Promise<boolean>;
  count(): Promise<number>;
}

export class MigrationHistory implements IMigrationHistory {
  private readonly store = new Map<string, MigrationRecord>();
  private idCounter = 0;

  async getAll(): Promise<MigrationRecord[]> {
    return [...this.store.values()].sort(
      (a, b) => MigrationHistory.compareVersions(a.version, b.version),
    );
  }

  async getByName(name: string): Promise<MigrationRecord | null> {
    return this.store.get(name) ?? null;
  }

  async getPending(): Promise<MigrationRecord[]> {
    return (await this.getAll()).filter(
      (r) => r.status === MigrationStatus.Pending,
    );
  }

  async getCompleted(): Promise<MigrationRecord[]> {
    return (await this.getAll()).filter(
      (r) => r.status === MigrationStatus.Completed,
    );
  }

  async getFailed(): Promise<MigrationRecord[]> {
    return (await this.getAll()).filter(
      (r) => r.status === MigrationStatus.Failed,
    );
  }

  async add(record: MigrationRecord): Promise<void> {
    this.store.set(record.name, { ...record });
  }

  async update(
    name: string,
    updates: Partial<MigrationRecord>,
  ): Promise<void> {
    const existing = this.store.get(name);
    if (existing) {
      this.store.set(name, { ...existing, ...updates });
    }
  }

  async remove(name: string): Promise<void> {
    this.store.delete(name);
  }

  async getLastApplied(): Promise<MigrationRecord | null> {
    const completed = await this.getCompleted();
    if (completed.length === 0) return null;
    return completed.reduce((latest, record) =>
      MigrationHistory.compareVersions(record.version, latest.version) > 0
        ? record
        : latest,
    );
  }

  async getBatch(batchId: string): Promise<MigrationRecord[]> {
    return (await this.getAll()).filter((r) => r.batchId === batchId);
  }

  async hasBeenApplied(name: string): Promise<boolean> {
    const record = await this.getByName(name);
    return record?.status === MigrationStatus.Completed;
  }

  async count(): Promise<number> {
    return this.store.size;
  }

  generateId(): string {
    this.idCounter++;
    return `mh_${this.idCounter}_${Date.now()}`;
  }

  static compareVersions(a: MigrationVersion, b: MigrationVersion): number {
    if (a.major !== b.major) return a.major - b.major;
    if (a.minor !== b.minor) return a.minor - b.minor;
    return a.patch - b.patch;
  }
}
