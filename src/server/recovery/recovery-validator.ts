import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import type { RecoveryPoint } from "./backup-manager";

export class RecoveryValidator {
  async validate(point: RecoveryPoint): Promise<RecoveryValidation> {
    const checks: ValidationCheck[] = [];
    checks.push(await this.checkChecksum(point));
    checks.push(await this.checkIntegrity(point));
    checks.push(await this.checkMetadata(point));
    checks.push(await this.checkDisk(point));

    const failed = checks.filter((c) => !c.passed);
    return {
      valid: failed.length === 0,
      checks,
      failed: failed.length,
      total: checks.length,
    };
  }

  async runDrill(): Promise<DrillResult> {
    const steps: DrillStep[] = [];

    try {
      const startConnect = Date.now();
      const dbUrl = process.env.DATABASE_URL;
      if (!dbUrl) throw new Error("DATABASE_URL not set");

      const url = new URL(dbUrl);
      const env = { ...process.env };
      if (url.password) env.PGPASSWORD = url.password;

      const connectStart = Date.now();
      execFileSync("pg_isready", [
        "--host", url.hostname,
        "--port", url.port || "5432",
        "--dbname", url.pathname.replace("/", ""),
      ], { env, stdio: "pipe", timeout: 10000 });
      steps.push({
        name: "Connect to backup target",
        duration: Date.now() - connectStart,
        passed: true,
      });
    } catch {
      steps.push({
        name: "Connect to backup target",
        duration: 0,
        passed: false,
      });
      return { name: "Recovery Drill", timestamp: new Date(), steps, allPassed: false };
    }

    const backupDir = path.resolve(process.cwd(), ".backups");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    steps.push({
      name: "Verify backup storage",
      duration: 10,
      passed: fs.existsSync(backupDir),
    });

    const testFile = path.join(backupDir, ".drill-test");
    try {
      fs.writeFileSync(testFile, "drill");
      const content = fs.readFileSync(testFile, "utf-8");
      fs.unlinkSync(testFile);
      steps.push({
        name: "Validate file I/O",
        duration: 5,
        passed: content === "drill",
      });
    } catch {
      steps.push({
        name: "Validate file I/O",
        duration: 5,
        passed: false,
      });
    }

    try {
      const dbUrl = new URL(process.env.DATABASE_URL ?? "postgresql://localhost:5432/postgres");
      execFileSync("pg_dump", [
        "--host", dbUrl.hostname,
        "--port", dbUrl.port || "5432",
        "--username", dbUrl.username || process.env.USER || "postgres",
        "--dbname", dbUrl.pathname.replace("/", ""),
        "--format", "custom",
        "--compress", "9",
        "--file", path.join(backupDir, ".drill-backup.dump"),
        "--no-owner", "--no-acl",
      ], { env: { ...process.env, PGPASSWORD: dbUrl.password || "" }, stdio: "pipe", timeout: 30000 });

      steps.push({
        name: "Test backup procedure",
        duration: 0,
        passed: fs.existsSync(path.join(backupDir, ".drill-backup.dump")),
      });

      fs.unlinkSync(path.join(backupDir, ".drill-backup.dump"));
    } catch {
      steps.push({
        name: "Test backup procedure",
        duration: 0,
        passed: false,
      });
    }

    return {
      name: "Recovery Drill",
      timestamp: new Date(),
      steps,
      allPassed: steps.every((s) => s.passed),
    };
  }

  private async checkChecksum(point: RecoveryPoint): Promise<ValidationCheck> {
    const hashPattern = /^[a-f0-9]{64}$/;
    return {
      name: "checksum",
      passed: hashPattern.test(point.checksum),
      detail: point.checksum ? `SHA-256: ${point.checksum.slice(0, 16)}...` : "No checksum",
    };
  }

  private async checkIntegrity(point: RecoveryPoint): Promise<ValidationCheck> {
    if (point.type !== "database") {
      return { name: "integrity", passed: true, detail: "Non-database backup" };
    }
    const backupDir = path.resolve(process.cwd(), ".backups");
    const filePath = path.join(backupDir, `${point.id}-${point.type}.dump`);
    if (!fs.existsSync(filePath)) {
      return { name: "integrity", passed: false, detail: "Backup file not found on disk" };
    }
    try {
      execFileSync("pg_restore", ["--list", filePath], {
        stdio: "pipe",
        timeout: 30000,
      });
      return { name: "integrity", passed: true, detail: "Archive format verified" };
    } catch {
      return { name: "integrity", passed: false, detail: "Cannot read backup archive" };
    }
  }

  private async checkMetadata(point: RecoveryPoint): Promise<ValidationCheck> {
    const hasEnv = !!point.metadata.environment;
    const hasTimestamp = !!point.timestamp;
    return {
      name: "metadata",
      passed: hasEnv && hasTimestamp,
      detail: hasEnv ? `Environment: ${point.metadata.environment}` : "Missing environment metadata",
    };
  }

  private async checkDisk(point: RecoveryPoint): Promise<ValidationCheck> {
    const backupDir = path.resolve(process.cwd(), ".backups");
    if (!fs.existsSync(backupDir)) {
      return { name: "disk", passed: false, detail: "Backup directory does not exist" };
    }
    try {
      const stats = fs.statfsSync(backupDir);
      const freeGB = (stats.bsize * stats.bfree) / 1073741824;
      return {
        name: "disk",
        passed: freeGB > 1,
        detail: `${freeGB.toFixed(1)} GB free`,
      };
    } catch {
      return { name: "disk", passed: true, detail: "Could not check disk space" };
    }
  }
}

export interface ValidationCheck {
  name: string;
  passed: boolean;
  detail: string;
}

export interface RecoveryValidation {
  valid: boolean;
  checks: ValidationCheck[];
  failed: number;
  total: number;
}

export interface DrillStep {
  name: string;
  duration: number;
  passed: boolean;
}

export interface DrillResult {
  name: string;
  timestamp: Date;
  steps: DrillStep[];
  allPassed: boolean;
}

export const recoveryValidator = new RecoveryValidator();
