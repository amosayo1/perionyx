import { NextResponse } from "next/server";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { requirePermission } from "@/server/security/require-permission";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requirePermission(request, "admin.settings");

    const results: Record<string, { status: "ok" | "error" | "skipped"; detail: string }> = {};

    // 1. Check backup infrastructure exists
    try {
      const { RecoveryValidator } = await import("@/server/recovery/recovery-validator");
      const validator = new RecoveryValidator();
      const drillResult = await validator.runDrill();
      results.recoveryDrill = {
        status: drillResult.allPassed ? "ok" : "error",
        detail: drillResult.allPassed
          ? `All ${drillResult.steps.length} drill steps passed`
          : drillResult.steps.filter((s: { passed: boolean }) => !s.passed).map((s: { name: string }) => s.name).join(", ") + " failed",
      };
    } catch (err) {
      results.recoveryDrill = {
        status: "error",
        detail: String(err),
      };
    }

    // 2. DB connectivity
    try {
      const { checkDatabaseHealth } = await import("@/server/db/database-operations");
      const dbHealth = await checkDatabaseHealth();
      results.databaseConnectivity = {
        status: dbHealth.connected ? "ok" : "error",
        detail: dbHealth.connected ? `Server: ${dbHealth.serverVersion}, Pool: ${dbHealth.poolSize}` : "Disconnected",
      };
    } catch (err) {
      results.databaseConnectivity = {
        status: "error",
        detail: String(err),
      };
    }

    // 3. Restore capability
    try {
      const { RestoreManager } = await import("@/server/recovery/restore-manager");
      const restore = new RestoreManager();
      const operations = restore.getRecentOperations(10);
      results.restoreCapability = {
        status: "ok",
        detail: `${operations.length} restore operations tracked`,
      };
    } catch (err) {
      results.restoreCapability = {
        status: "error",
        detail: String(err),
      };
    }

    // 4. Backup integrity
    try {
      const { BackupManager } = await import("@/server/recovery/backup-manager");
      const backupManager = new BackupManager();
      const backups = await backupManager.listBackups();
      results.backupIntegrity = {
        status: "ok",
        detail: `${backups.length} backups available`,
      };
    } catch (err) {
      results.backupIntegrity = {
        status: "error",
        detail: String(err),
      };
    }

    const allOk = Object.values(results).every((r) => r.status === "ok");

    return NextResponse.json(
      {
        status: allOk ? "ok" : "degraded",
        checks: results,
        timestamp: new Date().toISOString(),
      },
      { headers: { ...cacheHeaders(60) } },
    );
  } catch (err) {
    return handleRouteError(err, request);
  }
}
