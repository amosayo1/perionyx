import type { TenantContext } from "@/server/context/tenant-context";
import { recordAudit } from "@/modules/audit";
import { prisma } from "@/server/db/prisma";
import { connectorPlatformRegistry } from "./registry";
import { initializeConnectorInstance } from "./config";
import { connectorEventBus } from "./event-hooks";
import { connectorOrchestrator } from "./orchestrator";
import type { IConnector } from "./interface";
import type { ConnectorConfigRecord, ConnectorHealth } from "./types";

export class ConnectorLifecycle {
  static async install(
    ctx: TenantContext,
    config: ConnectorConfigRecord,
  ): Promise<{ ok: boolean; connector: IConnector; errors: string[] }> {
    try {
      const connector = connectorPlatformRegistry.createInstance(config.kind);
      await connector.initialize(config);
      connectorPlatformRegistry.registerInstance(config.id, connector);

      await recordAudit(prisma, {
        companyId: ctx.companyId,
        actorUserId: ctx.userId,
        action: "CONNECTOR_INSTALLED",
        resourceType: "ConnectorConfig",
        resourceId: config.id,
        metadata: { kind: config.kind, name: config.name },
      });

      await connectorEventBus.publish({
        eventType: "connector:installed",
        connectorId: config.id,
        companyId: ctx.companyId,
        timestamp: new Date().toISOString(),
        actorUserId: ctx.userId,
        metadata: { kind: config.kind, name: config.name },
      });

      return { ok: true, connector, errors: [] };
    } catch (err: any) {
      await connectorEventBus.publish({
        eventType: "connector:error",
        connectorId: config?.id ?? "unknown",
        companyId: ctx.companyId,
        timestamp: new Date().toISOString(),
        actorUserId: ctx.userId,
        metadata: { kind: config?.kind, error: String(err?.message ?? err) },
      });
      return { ok: false, connector: null as any, errors: [String(err?.message ?? err)] };
    }
  }

  static async validate(ctx: TenantContext, configId: string): Promise<{ ok: boolean; errors: string[] }> {
    const connector = connectorPlatformRegistry.getInstance(configId);
    if (!connector) return { ok: false, errors: ["Connector not initialized"] };

    const config = await this.getConfig(ctx, configId);
    if (!config) return { ok: false, errors: ["Config not found"] };

    await connector.initialize(config);
    const result = await connector.validateConfig();

    if (result.ok) {
      await connectorEventBus.publish({
        eventType: "connector:validated",
        connectorId: configId,
        companyId: ctx.companyId,
        timestamp: new Date().toISOString(),
        actorUserId: ctx.userId,
      });
    }

    return result;
  }

  static async authenticate(
    ctx: TenantContext,
    configId: string,
    credentials: Record<string, string>,
  ): Promise<{ ok: boolean; message?: string }> {
    const connector = connectorPlatformRegistry.getInstance(configId);
    if (!connector) return { ok: false, message: "Connector not initialized" };

    const { getAuthHandler } = await import("./auth/handler");
    const config = await this.getConfig(ctx, configId);
    if (!config) return { ok: false, message: "Config not found" };

    const authMethod = config.authMethod;
    if (authMethod === "none") return { ok: true };

    const handler = getAuthHandler(authMethod);
    const validationErrors = await handler.validate(credentials);
    if (validationErrors.length > 0) {
      return { ok: false, message: validationErrors.join("; ") };
    }

    const result = await handler.authenticate(credentials);
    if (result.ok) {
      await recordAudit(prisma, {
        companyId: ctx.companyId,
        actorUserId: ctx.userId,
        action: "CONNECTOR_AUTHENTICATED",
        resourceType: "ConnectorConfig",
        resourceId: configId,
        metadata: { authMethod },
      });

      await connectorEventBus.publish({
        eventType: "connector:authenticated",
        connectorId: configId,
        companyId: ctx.companyId,
        timestamp: new Date().toISOString(),
        actorUserId: ctx.userId,
        metadata: { authMethod },
      });
    }

    return result;
  }

  static async healthCheck(ctx: TenantContext, configId: string): Promise<ConnectorHealth> {
    const connector = connectorPlatformRegistry.getInstance(configId);
    if (!connector) {
      return { status: "UNKNOWN", lastCheckAt: null, message: "Connector not initialized" };
    }

    const health = await connector.healthCheck();

    await prisma.connectorConfig.updateMany({
      where: { id: configId, companyId: ctx.companyId },
      data: {
        config: {
          healthStatus: health.status,
          lastHealthCheckAt: new Date().toISOString(),
        } as any,
      },
    });

    await connectorEventBus.publish({
      eventType: "connector:health-check",
      connectorId: configId,
      companyId: ctx.companyId,
      timestamp: new Date().toISOString(),
      actorUserId: ctx.userId,
      metadata: { status: health.status, message: health.message, latencyMs: health.latencyMs },
    });

    return health;
  }

  static async connect(ctx: TenantContext, configId: string): Promise<ConnectorHealth> {
    const connector = connectorPlatformRegistry.getInstance(configId);
    if (!connector) {
      return { status: "UNKNOWN", lastCheckAt: null, message: "Connector not initialized" };
    }

    const health = await connector.connect();

    if (health.status === "GOOD" || health.status === "WARNING") {
      await prisma.connectorConfig.updateMany({
        where: { id: configId, companyId: ctx.companyId },
        data: { active: true },
      });

      await recordAudit(prisma, {
        companyId: ctx.companyId,
        actorUserId: ctx.userId,
        action: "CONNECTOR_CONNECTED",
        resourceType: "ConnectorConfig",
        resourceId: configId,
      });

      await connectorEventBus.publish({
        eventType: "connector:connected",
        connectorId: configId,
        companyId: ctx.companyId,
        timestamp: new Date().toISOString(),
        actorUserId: ctx.userId,
        metadata: { status: health.status },
      });
    }

    return health;
  }

  static async disconnect(ctx: TenantContext, configId: string): Promise<void> {
    const connector = connectorPlatformRegistry.getInstance(configId);
    if (connector) {
      await connector.disconnect();
    }

    await prisma.connectorConfig.updateMany({
      where: { id: configId, companyId: ctx.companyId },
      data: { active: false },
    });

    connectorPlatformRegistry.unregisterInstance(configId);

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "CONNECTOR_DISCONNECTED",
      resourceType: "ConnectorConfig",
      resourceId: configId,
    });

    await connectorEventBus.publish({
      eventType: "connector:disconnected",
      connectorId: configId,
      companyId: ctx.companyId,
      timestamp: new Date().toISOString(),
      actorUserId: ctx.userId,
    });
  }

  private static async getConfig(ctx: TenantContext, configId: string): Promise<ConnectorConfigRecord | null> {
    const { getConnectorConfig } = await import("./config");
    return getConnectorConfig(ctx, configId);
  }
}
