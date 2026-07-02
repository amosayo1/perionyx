import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { recordAudit } from "@/modules/audit";
import { connectorPlatformRegistry } from "./registry";
import { connectorEventBus } from "./event-hooks";
import type { IConnector } from "./interface";
import type {
  ConnectorConfigRecord,
  ConnectorKind,
  ConnectorStatus,
  ConnectorAuthMethod,
  ConnectorCapability,
} from "./types";

export async function createConnectorConfig(
  ctx: TenantContext,
  params: {
    name: string;
    kind: ConnectorKind;
    authMethod: ConnectorAuthMethod;
    capabilities: ConnectorCapability[];
    config?: Record<string, unknown>;
  },
): Promise<ConnectorConfigRecord> {
  const record = await prisma.connectorConfig.create({
    data: {
      companyId: ctx.companyId,
      name: params.name,
      type: params.kind,
      config: (params.config ?? {}) as any,
      active: false,
    },
  });

  await recordAudit(prisma, {
    companyId: ctx.companyId,
    actorUserId: ctx.userId,
    action: "CONNECTOR_CREATED",
    resourceType: "ConnectorConfig",
    resourceId: record.id,
    metadata: { kind: params.kind, name: params.name },
  });

  return recordToConfig(record);
}

export async function getConnectorConfig(
  ctx: TenantContext,
  id: string,
): Promise<ConnectorConfigRecord | null> {
  const record = await prisma.connectorConfig.findFirst({
    where: { id, companyId: ctx.companyId },
  });
  if (!record) return null;
  return recordToConfig(record);
}

export async function listConnectorConfigs(
  ctx: TenantContext,
): Promise<ConnectorConfigRecord[]> {
  const records = await prisma.connectorConfig.findMany({
    where: { companyId: ctx.companyId },
    orderBy: { name: "asc" },
  });
  return records.map(recordToConfig);
}

export async function updateConnectorConfig(
  ctx: TenantContext,
  id: string,
  params: Partial<{
    name: string;
    config: Record<string, unknown>;
    active: boolean;
  }>,
): Promise<ConnectorConfigRecord | null> {
  const data: any = {};
  if (params.name !== undefined) data.name = params.name;
  if (params.config !== undefined) data.config = params.config as any;
  if (params.active !== undefined) data.active = params.active;

  const record = await prisma.connectorConfig.updateMany({
    where: { id, companyId: ctx.companyId },
    data,
  });
  if (!record.count) return null;

  return getConnectorConfig(ctx, id);
}

export async function deleteConnectorConfig(
  ctx: TenantContext,
  id: string,
): Promise<boolean> {
  const config = await prisma.connectorConfig.findFirst({
    where: { id, companyId: ctx.companyId },
  });

  const result = await prisma.connectorConfig.deleteMany({
    where: { id, companyId: ctx.companyId },
  });
  if (result.count) {
    connectorPlatformRegistry.unregisterInstance(id);

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "CONNECTOR_DELETED",
      resourceType: "ConnectorConfig",
      resourceId: id,
      metadata: { kind: config?.type, name: config?.name },
    });

    await connectorEventBus.publish({
      eventType: "connector:deleted",
      connectorId: id,
      companyId: ctx.companyId,
      timestamp: new Date().toISOString(),
      actorUserId: ctx.userId,
      metadata: { kind: config?.type, name: config?.name },
    });
  }
  return result.count > 0;
}

export async function updateConnectorStatus(
  ctx: TenantContext,
  id: string,
  status: ConnectorStatus,
  errorMessage?: string,
): Promise<void> {
  const data: any = { status };
  if (errorMessage !== undefined) data.errorMessage = errorMessage;
  if (status === "active") data.lastHealthCheckAt = new Date().toISOString();

  const existing = await prisma.connectorConfig.findFirst({
    where: { id, companyId: ctx.companyId },
    select: { config: true },
  });
  if (!existing) return;
  const cfg = existing.config as Record<string, any>;
  cfg.status = status;
  if (errorMessage) cfg.errorMessage = errorMessage;
  if (status === "active") cfg.lastHealthCheckAt = new Date().toISOString();

  await prisma.connectorConfig.update({
    where: { id },
    data: { config: cfg as any },
  });
}

export function initializeConnectorInstance(config: ConnectorConfigRecord): IConnector {
  const connector = connectorPlatformRegistry.createInstance(config.kind);
  connector.initialize(config);
  connectorPlatformRegistry.registerInstance(config.id, connector);
  return connector;
}

function recordToConfig(
  record: {
    id: string;
    companyId: string;
    name: string;
    type: string;
    config: unknown;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
  },
): ConnectorConfigRecord {
  const cfg = record.config as Record<string, any> | null;
  return {
    id: record.id,
    companyId: record.companyId,
    name: record.name,
    kind: record.type as ConnectorKind,
    status: (cfg?.status as ConnectorStatus) ?? "configuring",
    authMethod: (cfg?.authMethod as ConnectorAuthMethod) ?? "none",
    capabilities: (cfg?.capabilities as ConnectorCapability[]) ?? [],
    config: cfg ?? {},
    active: record.active,
    healthStatus: cfg?.healthStatus as string | undefined,
    lastHealthCheckAt: cfg?.lastHealthCheckAt as string | undefined,
    lastSyncAt: cfg?.lastSyncAt as string | undefined,
    errorMessage: cfg?.errorMessage as string | undefined,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}
