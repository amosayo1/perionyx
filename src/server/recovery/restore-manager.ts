import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import type { RecoveryPoint } from "./backup-manager";

export class RestoreManager {
  private restoreLog: RestoreOperation[] = [];
  private backupDir: string;

  constructor(backupDir?: string) {
    this.backupDir = backupDir ?? path.resolve(process.cwd(), ".backups");
  }

  async restoreDatabaseFromFile(filePath: string): Promise<RestoreResult> {
    const id = `rst_${Date.now()}`;
    const operation: RestoreOperation = {
      id,
      pointId: filePath,
      type: "database",
      startedAt: new Date(),
      status: "in_progress",
    };

    try {
      const dbUrl = process.env.DATABASE_URL;
      if (!dbUrl) throw new Error("DATABASE_URL not set");
      if (!fs.existsSync(filePath)) throw new Error("Backup file not found");

      const url = new URL(dbUrl);
      const env = { ...process.env };
      if (url.password) env.PGPASSWORD = url.password;

      execFileSync("pg_restore", [
        "--host", url.hostname,
        "--port", url.port || "5432",
        "--username", url.username || process.env.USER || "postgres",
        "--dbname", url.pathname.replace("/", ""),
        "--clean", "--if-exists", "--no-owner", "--no-acl",
        filePath,
      ], { env, stdio: "pipe", timeout: 600000 });

      operation.status = "completed";
      operation.completedAt = new Date();
      this.restoreLog.push(operation);
      return { success: true, operationId: operation.id };
    } catch (err) {
      operation.status = "failed";
      operation.error = err instanceof Error ? err.message : "Unknown error";
      operation.completedAt = new Date();
      this.restoreLog.push(operation);
      return { success: false, operationId: operation.id, error: operation.error };
    }
  }

  async restore(point: RecoveryPoint): Promise<RestoreResult> {
    const filePath = path.join(this.backupDir, this.getFileName(point.id, point.type));
    return this.restoreDatabaseFromFile(filePath);
  }

  getRecentOperations(limit = 10): RestoreOperation[] {
    return this.restoreLog.slice(-limit);
  }

  private getFileName(id: string, type: string): string {
    const ext = type === "database" ? ".dump" : ".json";
    return `${id}-${type}${ext}`;
  }
}

export interface RestoreOperation {
  id: string;
  pointId: string;
  type: string;
  startedAt: Date;
  completedAt?: Date;
  status: "in_progress" | "completed" | "failed";
  error?: string;
}

export interface RestoreResult {
  success: boolean;
  operationId: string;
  error?: string;
}

export const restoreManager = new RestoreManager();
