export interface Snapshot {
  id: string;
  timestamp: Date;
  label: string;
  type: "full" | "incremental" | "differential";
  sizeBytes: number;
  components: string[];
  checksum: string;
  retention: string;
}

export class SnapshotManager {
  private snapshots: Snapshot[] = [];

  async create(type: Snapshot["type"], label: string, components: string[]): Promise<Snapshot> {
    const snapshot: Snapshot = {
      id: `snap_${Date.now()}`,
      timestamp: new Date(),
      label,
      type,
      sizeBytes: 0,
      components,
      checksum: `sha256_${Math.random().toString(36).slice(2, 10)}`,
      retention: "daily",
    };
    this.snapshots.push(snapshot);
    return snapshot;
  }

  async list(type?: Snapshot["type"]): Promise<Snapshot[]> {
    if (type) return this.snapshots.filter((s) => s.type === type);
    return [...this.snapshots];
  }

  async get(id: string): Promise<Snapshot | null> {
    return this.snapshots.find((s) => s.id === id) ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const idx = this.snapshots.findIndex((s) => s.id === id);
    if (idx < 0) return false;
    this.snapshots.splice(idx, 1);
    return true;
  }

  async prune(retentionDays: number): Promise<number> {
    const cutoff = Date.now() - retentionDays * 86400000;
    const before = this.snapshots.length;
    this.snapshots = this.snapshots.filter((s) => s.timestamp.getTime() >= cutoff);
    return before - this.snapshots.length;
  }
}

export const snapshotManager = new SnapshotManager();
