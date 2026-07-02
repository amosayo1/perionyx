import { prisma } from "@/server/db/prisma";
import { connectorPlatformRegistry } from "../registry";
import { connectorEventBus } from "../event-hooks";

export async function handlePlaidSync(job: { id: string; data: any }): Promise<void> {
  const { connectorId, companyId, syncType } = job.data;
  if (!connectorId || !companyId) return;

  const connector = connectorPlatformRegistry.getInstance(connectorId);
  if (!connector) {
    console.error(`[PlaidSync] No instance found for ${connectorId}`);
    return;
  }

  const config = await prisma.connectorConfig.findFirst({
    where: { id: connectorId, companyId },
  });
  if (!config) return;

  await connector.initialize({
    id: config.id,
    companyId: config.companyId,
    name: config.name,
    kind: "plaid",
    status: "active",
    authMethod: "none",
    capabilities: [],
    config: config.config as Record<string, unknown>,
    active: config.active,
    createdAt: config.createdAt.toISOString(),
    updatedAt: config.updatedAt.toISOString(),
  } as any);

  connectorPlatformRegistry.registerInstance(connectorId, connector);

  const syncTypeLabel = syncType ?? "full";
  let result: any;

  try {
    switch (syncTypeLabel) {
      case "balances":
        result = await (connector as any).syncBalances();
        break;
      case "transactions":
        result = await (connector as any).syncTransactions();
        break;
      default:
        result = await connector.syncData!({ fullSync: syncTypeLabel === "full" });
        break;
    }

    const syncStatus = result.success ? "completed" : "failed";

    await prisma.syncLog.create({
      data: {
        companyId,
        connectorId,
        source: "plaid",
        syncType: syncTypeLabel,
        status: syncStatus,
        recordsProcessed: result.recordsProcessed,
        recordsCreated: result.recordsCreated,
        recordsUpdated: result.recordsUpdated,
        recordsFailed: result.recordsFailed,
        errorMessage: result.errors?.length ? result.errors.join("; ") : null,
        startedAt: new Date(result.startedAt),
        completedAt: new Date(result.completedAt),
      },
    });

    await connectorEventBus.publish({
      eventType: result.success ? "connector:sync-completed" : "connector:sync-failed",
      connectorId,
      companyId,
      timestamp: new Date().toISOString(),
      metadata: {
        syncType: syncTypeLabel,
        recordsProcessed: result.recordsProcessed,
        recordsCreated: result.recordsCreated,
        recordsUpdated: result.recordsUpdated,
        recordsFailed: result.recordsFailed,
        errors: result.errors,
      },
    });

    if (!result.success) {
      const { notificationService } = await import("@/modules/notifications");
      await notificationService.broadcast({
        companyId,
        eventType: "PLAID_SYNC_FAILED",
        title: "Plaid sync failed",
        message: result.errors?.join("; ") ?? "Unknown error during sync",
        metadata: {
          connectorId,
          syncType: syncTypeLabel,
          errors: result.errors,
        },
      });
    }
  } catch (err: any) {
    console.error(`[PlaidSync] Sync failed for ${connectorId}:`, err);

    await prisma.syncLog.create({
      data: {
        companyId,
        connectorId,
        source: "plaid",
        syncType: syncTypeLabel,
        status: "failed",
        recordsProcessed: 0,
        recordsCreated: 0,
        recordsUpdated: 0,
        recordsFailed: 0,
        errorMessage: String(err?.message ?? err),
        startedAt: new Date(),
        completedAt: new Date(),
      },
    });

    const { notificationService } = await import("@/modules/notifications");
    await notificationService.broadcast({
      companyId,
      eventType: "PLAID_SYNC_FAILED",
      title: "Plaid sync failed",
      message: String(err?.message ?? err),
      metadata: { connectorId, syncType: syncTypeLabel },
    });
  }
}
