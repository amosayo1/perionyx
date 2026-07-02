import { prisma } from "@/server/db/prisma";
import { connectorPlatformRegistry } from "../registry";
import { connectorEventBus } from "../event-hooks";

export async function handleQboSync(job: { id: string; data: any }): Promise<void> {
  const { connectorId, companyId } = job.data;
  if (!connectorId || !companyId) return;

  const connector = connectorPlatformRegistry.getInstance(connectorId);
  if (!connector) {
    console.error(`[QboSync] No instance found for ${connectorId}`);
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
    kind: "quickbooks",
    status: "active",
    authMethod: "none",
    capabilities: [],
    config: config.config as Record<string, unknown>,
    active: config.active,
    createdAt: config.createdAt.toISOString(),
    updatedAt: config.updatedAt.toISOString(),
  } as any);

  connectorPlatformRegistry.registerInstance(connectorId, connector);

  if (!connector.syncData) {
    console.warn(`[QboSync] Connector ${connectorId} does not support sync`);
    return;
  }

  try {
    const result = await connector.syncData({ fullSync: true });

    if (result.errors?.some((e: string) => e.includes("Not configured"))) {
      console.warn(`[QboSync] Connector ${connectorId} not configured, skipping`);
      return;
    }

    const syncStatus = result.success ? "completed" : "failed";

    await prisma.syncLog.create({
      data: {
        companyId,
        connectorId,
        source: "quickbooks",
        syncType: "accounting",
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
        source: "quickbooks",
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
        eventType: "CONNECTOR_FAILURE",
        title: "QuickBooks sync failed",
        message: result.errors?.join("; ") ?? "Unknown error during sync",
        metadata: {
          connectorId,
          source: "quickbooks",
          errors: result.errors,
        },
      });
    }
  } catch (err: any) {
    console.error(`[QboSync] Sync failed for ${connectorId}:`, err);

    await prisma.syncLog.create({
      data: {
        companyId,
        connectorId,
        source: "quickbooks",
        syncType: "accounting",
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
      eventType: "CONNECTOR_FAILURE",
      title: "QuickBooks sync failed",
      message: String(err?.message ?? err),
      metadata: { connectorId, source: "quickbooks" },
    });
  }
}
