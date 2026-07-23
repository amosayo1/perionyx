import { execFileSync } from "child_process";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { prisma } from "@/server/db/prisma";

export interface RecoveryPoint {
  id: string;
  timestamp: Date;
  type: "database" | "redis" | "config" | "storage";
  label: string;
  sizeBytes: number;
  checksum: string;
  status: "completed" | "failed" | "in_progress";
  metadata: Record<string, string>;
}

export interface BackupConfig {
  enabled: boolean;
  schedule: string;
  retention: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  };
  compression: boolean;
  encryption: boolean;
  storage: "local" | "s3" | "gcs" | "azure";
}

export class BackupManager {
  private backups: RecoveryPoint[] = [];
  private readonly maxBackups = 100;
  private backupDir: string;

  constructor(backupDir?: string) {
    this.backupDir = backupDir ?? path.resolve(process.cwd(), ".backups");
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  async createBackup(type: RecoveryPoint["type"], label: string): Promise<RecoveryPoint> {
    const id = `bkp_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
    const timestamp = new Date();
    const point: RecoveryPoint = {
      id,
      timestamp,
      type,
      label,
      sizeBytes: 0,
      checksum: "",
      status: "in_progress",
      metadata: { environment: process.env.NODE_ENV ?? "unknown" },
    };

    try {
      switch (type) {
        case "database":
          await this.backupDatabase(id, point);
          break;
        case "config":
          await this.backupConfig(id, point);
          break;
        default:
          break;
      }
      point.status = "completed";
    } catch (err) {
      point.status = "failed";
      point.metadata.error = err instanceof Error ? err.message : "Unknown error";
    }

    const filePath = path.join(this.backupDir, this.getFileName(id, type));
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      point.sizeBytes = stats.size;
      point.checksum = this.computeChecksum(filePath);
    }

    this.backups.push(point);
    if (this.backups.length > this.maxBackups) this.backups.shift();
    return point;
  }

  async listBackups(type?: RecoveryPoint["type"]): Promise<RecoveryPoint[]> {
    if (type) return this.backups.filter((b) => b.type === type);
    return [...this.backups];
  }

  async getBackup(id: string): Promise<RecoveryPoint | null> {
    return this.backups.find((b) => b.id === id) ?? null;
  }

  async deleteBackup(id: string): Promise<boolean> {
    const idx = this.backups.findIndex((b) => b.id === id);
    if (idx < 0) return false;
    const backup = this.backups[idx];
    const filePath = path.join(this.backupDir, this.getFileName(id, backup.type));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    this.backups.splice(idx, 1);
    return true;
  }

  async verifyBackup(id: string): Promise<{ valid: boolean; error?: string }> {
    const backup = this.backups.find((b) => b.id === id);
    if (!backup) return { valid: false, error: "Backup not found" };

    const filePath = path.join(this.backupDir, this.getFileName(id, backup.type));
    if (!fs.existsSync(filePath)) {
      return { valid: false, error: "Backup file not found on disk" };
    }

    const currentChecksum = this.computeChecksum(filePath);
    if (currentChecksum !== backup.checksum) {
      return { valid: false, error: "Checksum mismatch — file may be corrupted" };
    }

    if (backup.type === "database") {
      try {
        const dbUrl = new URL(process.env.DATABASE_URL ?? "postgresql://localhost:5432/postgres");
        const dbName = dbUrl.pathname.replace("/", "");
        execFileSync("pg_restore", ["--list", filePath], {
          stdio: "pipe",
          timeout: 30000,
        });
      } catch {
        return { valid: false, error: "Cannot read database backup archive" };
      }
    }

    return { valid: true };
  }

  async applyRetention(): Promise<number> {
    const policy = this.getRetentionPolicy();
    let deleted = 0;

    const byType = this.groupByRetentionCategory();
    for (const [category, cutoff] of Object.entries(byType)) {
      const maxKeep = policy[category as keyof typeof policy] ?? 0;
      const backups = this.backups
        .filter((b) => this.getRetentionCategory(b) === category)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      const toDelete = backups.slice(maxKeep);
      for (const b of toDelete) {
        await this.deleteBackup(b.id);
        deleted++;
      }
    }

    return deleted;
  }

  getRetentionPolicy(): BackupConfig["retention"] {
    return { daily: 7, weekly: 4, monthly: 3, yearly: 1 };
  }

  getLatestBackup(type?: string): RecoveryPoint | null {
    const candidates = type
      ? this.backups.filter((b) => b.type === type && b.status === "completed")
      : this.backups.filter((b) => b.status === "completed");
    if (candidates.length === 0) return null;
    return candidates.reduce((latest, b) =>
      b.timestamp > latest.timestamp ? b : latest,
    );
  }

  async preUpgradeBackup(version: string): Promise<RecoveryPoint> {
    return this.createBackup("database", `pre-upgrade-${version}`);
  }

  async restoreBackup(backupId: string): Promise<boolean> {
    const backup = this.backups.find((b) => b.id === backupId);
    if (!backup) return false;

    try {
      if (backup.type === "database") {
        await this.restoreDatabase(backup);
      } else if (backup.type === "config") {
        await this.restoreConfig(backup);
      }
      return true;
    } catch {
      return false;
    }
  }

  private async backupDatabase(id: string, _point: RecoveryPoint): Promise<void> {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error("DATABASE_URL not set");

    const filePath = path.join(this.backupDir, this.getFileName(id, "database"));
    const url = new URL(dbUrl);
    const host = url.hostname;
    const port = url.port || "5432";
    const dbName = url.pathname.replace("/", "");
    const username = url.username || process.env.USER || "postgres";

    const env = { ...process.env };
    if (url.password) env.PGPASSWORD = url.password;

    execFileSync("pg_dump", [
      "--host", host,
      "--port", port,
      "--username", username,
      "--dbname", dbName,
      "--format", "custom",
      "--compress", "9",
      "--file", filePath,
      "--no-owner",
      "--no-acl",
    ], { env, stdio: "pipe", timeout: 300000 });
  }

  private async backupConfig(id: string, _point: RecoveryPoint): Promise<void> {
    const filePath = path.join(this.backupDir, this.getFileName(id, "config"));
    const config: Record<string, string | undefined> = {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      ENCRYPTION_KEY_ID: process.env.ENCRYPTION_KEY_ID,
      LICENSE_COMPANY_ID: process.env.LICENSE_COMPANY_ID,
      PLAID_ENV: process.env.PLAID_ENV,
      QB_ENV: process.env.QB_ENV,
    };
    fs.writeFileSync(filePath, JSON.stringify(config, null, 2));
  }

  private async restoreDatabase(backup: RecoveryPoint): Promise<void> {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error("DATABASE_URL not set");

    const filePath = path.join(this.backupDir, this.getFileName(backup.id, "database"));
    if (!fs.existsSync(filePath)) throw new Error("Backup file not found");

    const url = new URL(dbUrl);
    const host = url.hostname;
    const port = url.port || "5432";
    const dbName = url.pathname.replace("/", "");
    const username = url.username || process.env.USER || "postgres";

    const env = { ...process.env };
    if (url.password) env.PGPASSWORD = url.password;

    execFileSync("pg_restore", [
      "--host", host,
      "--port", port,
      "--username", username,
      "--dbname", dbName,
      "--clean",
      "--if-exists",
      "--no-owner",
      "--no-acl",
      filePath,
    ], { env, stdio: "pipe", timeout: 600000 });
  }

  private async restoreConfig(backup: RecoveryPoint): Promise<void> {
    const filePath = path.join(this.backupDir, this.getFileName(backup.id, "config"));
    if (!fs.existsSync(filePath)) throw new Error("Config backup file not found");
    const config = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    for (const [key, value] of Object.entries(config)) {
      if (typeof value === "string") {
        process.env[key] = value;
      }
    }
  }

  private getFileName(id: string, type: string): string {
    const ext = type === "database" ? ".dump" : ".json";
    return `${id}-${type}${ext}`;
  }

  private computeChecksum(filePath: string): string {
    const content = fs.readFileSync(filePath);
    return crypto.createHash("sha256").update(content).digest("hex");
  }

  private getRetentionCategory(backup: RecoveryPoint): string {
    const age = Date.now() - backup.timestamp.getTime();
    const days = age / 86400000;
    if (days < 1) return "daily";
    if (days < 7) return "weekly";
    if (days < 30) return "monthly";
    return "yearly";
  }

  private groupByRetentionCategory(): Record<string, number> {
    const now = new Date();
    const result: Record<string, number> = {};
    for (const backup of this.backups) {
      const days = (now.getTime() - backup.timestamp.getTime()) / 86400000;
      if (days < 1) result.daily = (result.daily ?? 0) + 1;
      else if (days < 7) result.weekly = (result.weekly ?? 0) + 1;
      else if (days < 30) result.monthly = (result.monthly ?? 0) + 1;
      else result.yearly = (result.yearly ?? 0) + 1;
    }
    return result;
  }
}

export const backupManager = new BackupManager();
