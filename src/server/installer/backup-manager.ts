import { execFileSync } from "child_process";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { type BackupManifest, type BackupType } from "./types";

export class BackupManager {
  private backups: BackupManifest[] = [];
  private readonly maxBackups = 50;
  private readonly storageDir: string;

  constructor(storageDir?: string) {
    this.storageDir = storageDir ?? path.resolve(process.cwd(), ".backups");
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  async createBackup(
    type: BackupType,
    version: string,
    includes: string[],
  ): Promise<BackupManifest> {
    const id = `bkp_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const timestamp = new Date();

    const manifest: BackupManifest = {
      id,
      type,
      version,
      timestamp,
      includes,
      size: 0,
      checksum: "",
      location: `${this.storageDir}/${id}`,
      status: "running",
    };

    try {
      await this.performBackup(manifest);
      manifest.status = "completed";
      manifest.checksum = this.computeChecksum(manifest.location);
      if (fs.existsSync(manifest.location)) {
        const stats = fs.statSync(manifest.location);
        manifest.size = stats.size;
      }
    } catch (error) {
      manifest.status = "failed";
    }

    this.backups.push(manifest);
    if (this.backups.length > this.maxBackups) {
      this.backups.shift();
    }

    return manifest;
  }

  async restoreBackup(id: string): Promise<boolean> {
    const backup = this.backups.find((b) => b.id === id);
    if (!backup || backup.status !== "completed") return false;
    return this.performRestore(backup);
  }

  async listBackups(type?: BackupType): Promise<BackupManifest[]> {
    if (type) return this.backups.filter((b) => b.type === type);
    return [...this.backups];
  }

  async getBackup(id: string): Promise<BackupManifest | null> {
    return this.backups.find((b) => b.id === id) ?? null;
  }

  async deleteBackup(id: string): Promise<boolean> {
    const idx = this.backups.findIndex((b) => b.id === id);
    if (idx < 0) return false;
    const backup = this.backups[idx];
    if (fs.existsSync(backup.location)) {
      fs.unlinkSync(backup.location);
    }
    this.backups.splice(idx, 1);
    return true;
  }

  async preUpgradeBackup(version: string): Promise<BackupManifest> {
    return this.createBackup("pre-upgrade", version, [
      "database", "config",
    ]);
  }

  async manualBackup(version: string): Promise<BackupManifest> {
    return this.createBackup("manual", version, [
      "database", "config",
    ]);
  }

  validateBackup(id: string): { valid: boolean; errors: string[] } {
    const backup = this.backups.find((b) => b.id === id);
    if (!backup) {
      return { valid: false, errors: ["Backup not found"] };
    }
    const errors: string[] = [];
    if (backup.status !== "completed") {
      errors.push(`Backup status is ${backup.status}, expected completed`);
    }
    if (!backup.checksum) {
      errors.push("Backup checksum is missing");
    }
    if (backup.includes.length === 0) {
      errors.push("Backup includes no components");
    }
    if (!fs.existsSync(backup.location)) {
      errors.push("Backup file not found on disk");
    } else {
      const actualChecksum = this.computeChecksum(backup.location);
      if (actualChecksum !== backup.checksum) {
        errors.push("Checksum mismatch — file may be corrupted");
      }
    }
    return { valid: errors.length === 0, errors };
  }

  async getLatestBackup(type?: BackupType): Promise<BackupManifest | null> {
    const backups = type
      ? this.backups.filter((b) => b.type === type)
      : this.backups;
    if (backups.length === 0) return null;
    return backups.reduce((latest, b) =>
      b.timestamp > latest.timestamp ? b : latest,
    );
  }

  getBackupCount(): number {
    return this.backups.length;
  }

  clearBackups(): void {
    this.backups = [];
  }

  private async performBackup(manifest: BackupManifest): Promise<void> {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error("DATABASE_URL not set");

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
      "--file", manifest.location,
      "--no-owner",
      "--no-acl",
    ], { env, stdio: "pipe", timeout: 300000 });
  }

  private async performRestore(backup: BackupManifest): Promise<boolean> {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error("DATABASE_URL not set");

    if (!fs.existsSync(backup.location)) return false;

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
      backup.location,
    ], { env, stdio: "pipe", timeout: 600000 });

    return true;
  }

  private computeChecksum(filePath: string): string {
    try {
      const content = fs.readFileSync(filePath);
      return crypto.createHash("sha256").update(content).digest("hex");
    } catch {
      return "";
    }
  }
}

export const backupManager = new BackupManager();
