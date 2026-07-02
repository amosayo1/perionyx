import { prisma } from "@/server/db/prisma";
import { recordAudit } from "@/modules/audit";
import { incConnectorSync, incConnectorHealthCheck, incConnectorOAuthRefresh } from "@/modules/metrics/metrics";
import { enqueue, scheduleCron, unscheduleCron } from "@/modules/queue/queue.service";
import { connectorPlatformRegistry } from "../registry";
import { connectorEventBus } from "../event-hooks";
import { SyncExecutor } from "../sync/executor";
import { getAuthHandler } from "../auth/handler";
import type { IConnector } from "../interface";
import type { ConnectorConfigRecord, ConnectorHealth, ConnectorSyncResult } from "../types";
import type { OrchestrationConfig } from "./types";
import { DEFAULT_ORCHESTRATION_CONFIGS } from "./types";

export class ConnectorOrchestrator {
  private configCache = new Map<string, OrchestrationConfig>();

  getConfig(kind: string): OrchestrationConfig {
    const cached = this.configCache.get(kind);
    if (cached) return cached;

    const defaults: OrchestrationConfig = {
      healthCheckCron: "*/15 * * * *",
      syncCron: "0 */1 * * *",
      retryPolicy: { maxRetries: 3, retryDelayMs: 60000 },
      metricsEnabled: true,
      auditEnabled: true,
    };

    const kindConfig = DEFAULT_ORCHESTRATION_CONFIGS[kind as keyof typeof DEFAULT_ORCHESTRATION_CONFIGS];
    const merged = { ...defaults, ...kindConfig };
    this.configCache.set(kind, merged);
    return merged;
  }

  async acquireConnector(connectorId: string, companyId: string): Promise<IConnector | null> {
    let connector = connectorPlatformRegistry.getInstance(connectorId);
    if (connector) return connector;

    const config = await prisma.connectorConfig.findFirst({
      where: { id: connectorId, companyId },
    });
    if (!config) return null;

    connector = connectorPlatformRegistry.createInstance(config.type as any);
    await connector.initialize(configToRecord(config));
    connectorPlatformRegistry.registerInstance(connectorId, connector);
    return connector;
  }

  async executeSync(
    connectorId: string,
    companyId: string,
    options?: { direction?: string; fullSync?: boolean; syncType?: string },
    syncFn?: (opts: { fullSync?: boolean; since?: string; limit?: number }) => Promise<ConnectorSyncResult>,
  ): Promise<ConnectorSyncResult> {
    const connector = await this.acquireConnector(connectorId, companyId);
    if (!connector) {
      return {
        success: false, recordsProcessed: 0, recordsCreated: 0, recordsUpdated: 0,
        recordsFailed: 0, errors: ["Connector not found"], startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };
    }

    if (!connector.syncData && !syncFn) {
      return {
        success: false, recordsProcessed: 0, recordsCreated: 0, recordsUpdated: 0,
        recordsFailed: 0, errors: ["Connector does not support sync"], startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };
    }

    await connectorEventBus.publish({
      eventType: "connector:sync-started",
      connectorId, companyId,
      timestamp: new Date().toISOString(),
      metadata: { direction: options?.direction, fullSync: options?.fullSync, syncType: options?.syncType },
    });

    if (options?.syncType === "balances" || options?.syncType === "transactions") {
      if (!syncFn) {
        return {
          success: false, recordsProcessed: 0, recordsCreated: 0, recordsUpdated: 0,
          recordsFailed: 0, errors: ["Custom sync required for this sync type"],
          startedAt: new Date().toISOString(), completedAt: new Date().toISOString(),
        };
      }
    }

    const executor = new SyncExecutor();
    const result = await executor.execute(
      { connectorId, companyId, direction: (options?.direction ?? "import") as any, fullSync: options?.fullSync ?? false },
      syncFn ?? (async (opts) => connector.syncData!(opts)),
    );

    await connectorEventBus.publish({
      eventType: result.success ? "connector:sync-completed" : "connector:sync-failed",
      connectorId, companyId,
      timestamp: new Date().toISOString(),
      metadata: {
        direction: options?.direction,
        recordsProcessed: result.recordsProcessed,
        recordsCreated: result.recordsCreated,
        recordsUpdated: result.recordsUpdated,
        recordsFailed: result.recordsFailed,
        errors: result.errors,
        syncType: options?.syncType,
      },
    });

    try { incConnectorSync(connector.kind, result.success ? "completed" : "failed"); } catch { /* best-effort */ }

    if (result.success) {
      await prisma.connectorConfig.updateMany({
        where: { id: connectorId, companyId },
        data: { config: { lastSyncAt: new Date().toISOString() } as any },
      });
    } else {
      await this.broadcastNotification(companyId, {
        eventType: "CONNECTOR_FAILURE",
        title: `${connector.label} sync failed`,
        message: result.errors.join("; ") || "Unknown sync error",
        metadata: { connectorId, errors: result.errors, syncType: options?.syncType },
      });
    }

    return result;
  }

  async executeHealthCheck(connectorId: string, companyId: string): Promise<ConnectorHealth> {
    const connector = await this.acquireConnector(connectorId, companyId);
    if (!connector) {
      return { status: "UNKNOWN", lastCheckAt: null, message: "Connector not found" };
    }

    const health = await connector.healthCheck();

    await prisma.connectorConfig.updateMany({
      where: { id: connectorId, companyId },
      data: {
        config: {
          healthStatus: health.status,
          lastHealthCheckAt: new Date().toISOString(),
          ...(health.status === "CRITICAL" ? { healthMessage: health.message } : {}),
        } as any,
      },
    });

    await connectorEventBus.publish({
      eventType: "connector:health-check",
      connectorId, companyId,
      timestamp: new Date().toISOString(),
      metadata: { status: health.status, message: health.message, latencyMs: health.latencyMs },
    });

    try { incConnectorHealthCheck(connector.kind, health.status); } catch { /* best-effort */ }

    if (health.status === "CRITICAL") {
      await this.broadcastNotification(companyId, {
        eventType: "RISK_ALERT_CREATED",
        title: `Connector health critical: ${connector.label}`,
        message: health.message ?? "Health check returned CRITICAL status",
        metadata: { connectorId, healthStatus: health.status, latencyMs: health.latencyMs },
      });
    }

    return health;
  }

  async refreshOAuthToken(connectorId: string, companyId: string): Promise<boolean> {
    const connector = await this.acquireConnector(connectorId, companyId);
    if (!connector) return false;

    try {
      if (connector.refreshAccessToken) {
        const ok = await connector.refreshAccessToken();
        try { incConnectorOAuthRefresh(connector.kind, ok ? "success" : "failed"); } catch { /* best-effort */ }
        return ok;
      }
    } catch {
      // fall through to generic handler
    }

    const config = await prisma.connectorConfig.findFirst({
      where: { id: connectorId, companyId },
    });
    if (!config) return false;

    const cfg = config.config as Record<string, any>;
    const credentials = {
      clientId: cfg.clientId ?? process.env[`${connector.kind.toUpperCase()}_CLIENT_ID`] ?? "",
      clientSecret: cfg.clientSecret ?? process.env[`${connector.kind.toUpperCase()}_CLIENT_SECRET`] ?? "",
      refreshToken: cfg.refreshToken ?? "",
      tokenUrl: cfg.tokenUrl ?? "",
    };

    if (!credentials.clientId || !credentials.clientSecret || !credentials.refreshToken) {
      return false;
    }

    try {
      const handler = getAuthHandler("oauth2");
      const result = await handler.refresh(credentials);

      try { incConnectorOAuthRefresh(connector.kind, result.ok ? "success" : "failed"); } catch { /* best-effort */ }

      if (result.ok) {
        await prisma.connectorConfig.updateMany({
          where: { id: connectorId, companyId },
          data: {
            config: {
              ...cfg,
              lastTokenRefreshAt: new Date().toISOString(),
              tokenExpiresAt: result.expiresAt,
            } as any,
          },
        });
      }

      return result.ok;
    } catch {
      return false;
    }
  }

  async dispatchWebhookSync(
    connectorId: string,
    companyId: string,
    syncType?: string,
  ): Promise<void> {
    const config = await prisma.connectorConfig.findFirst({
      where: { id: connectorId, companyId },
    });
    if (!config) return;

    const orchestrationConfig = this.getConfig(config.type);
    const retryPolicy = orchestrationConfig.retryPolicy ?? { maxRetries: 3, retryDelayMs: 60000 };

    await enqueue("connector-sync", {
      connectorId, companyId, syncType,
    }, {
      retryLimit: retryPolicy.maxRetries,
      retryDelay: Math.round(retryPolicy.retryDelayMs / 1000),
      retryBackoff: true,
      expireInSeconds: 600,
    });
  }

  async scheduleSync(connectorId: string, companyId: string, cron?: string): Promise<void> {
    const config = await prisma.connectorConfig.findFirst({
      where: { id: connectorId, companyId },
    });
    if (!config) return;

    const orchestrationConfig = this.getConfig(config.type);
    const schedule = cron ?? orchestrationConfig.syncCron;
    if (!schedule) return;

    await scheduleCron(`connector-sync:${connectorId}`, schedule, {
      connectorId, companyId, direction: "import", fullSync: false,
    });
  }

  async unscheduleSync(connectorId: string): Promise<void> {
    await unscheduleCron(`connector-sync:${connectorId}`);
  }

  async scheduleHealthCheck(connectorId: string, companyId: string, cron?: string): Promise<void> {
    const config = await prisma.connectorConfig.findFirst({
      where: { id: connectorId, companyId },
    });
    if (!config) return;

    const orchestrationConfig = this.getConfig(config.type);
    const schedule = cron ?? orchestrationConfig.healthCheckCron;
    if (!schedule) return;

    await scheduleCron(`connector-health:${connectorId}`, schedule, {
      connectorId, companyId,
    });
  }

  async unscheduleHealthCheck(connectorId: string): Promise<void> {
    await unscheduleCron(`connector-health:${connectorId}`);
  }

  async scheduleOAuthRefresh(connectorId: string, companyId: string, cron?: string): Promise<void> {
    const config = await prisma.connectorConfig.findFirst({
      where: { id: connectorId, companyId },
    });
    if (!config) return;

    const orchestrationConfig = this.getConfig(config.type);
    const schedule = cron ?? orchestrationConfig.oauthRefreshCron;
    if (!schedule) return;

    await scheduleCron(`connector-oauth-refresh:${connectorId}`, schedule, {
      connectorId, companyId,
    });
  }

  async unscheduleOAuthRefresh(connectorId: string): Promise<void> {
    await unscheduleCron(`connector-oauth-refresh:${connectorId}`);
  }

  async recordAuditEvent(params: {
    companyId: string;
    actorUserId?: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    await recordAudit(prisma, {
      companyId: params.companyId,
      actorUserId: params.actorUserId ?? null,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId ?? null,
      metadata: (params.metadata ?? {}) as any,
    });
  }

  async broadcastNotification(
    companyId: string,
    params: {
      eventType: string;
      title: string;
      message: string;
      metadata?: Record<string, unknown>;
    },
  ): Promise<void> {
    try {
      const { notificationService } = await import("@/modules/notifications");
      await notificationService.broadcast({
        companyId,
        eventType: params.eventType as any,
        title: params.title,
        message: params.message,
        metadata: params.metadata,
      });
    } catch {
      // notifications are best-effort
    }
  }

}

function configToRecord(record: {
  id: string; companyId: string; name: string; type: string;
  config: unknown; active: boolean; createdAt: Date; updatedAt: Date;
}): ConnectorConfigRecord {
  const cfg = record.config as Record<string, any> | null;
  return {
    id: record.id, companyId: record.companyId, name: record.name,
    kind: record.type as any, status: cfg?.status ?? "configuring",
    authMethod: cfg?.authMethod ?? "none", capabilities: cfg?.capabilities ?? [],
    config: cfg ?? {}, active: record.active,
    createdAt: record.createdAt.toISOString(), updatedAt: record.updatedAt.toISOString(),
  };
}

export const connectorOrchestrator = new ConnectorOrchestrator();
