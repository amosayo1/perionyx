import { integrationRegistry } from "./integration-registry";
import { getOrCreateProvider, destroyProvider } from "./integration-factory";
import {
  storeCredentials,
  getCredentials,
  deleteCredentials,
} from "./credential-manager";
import { emitIntegrationDomainEvent } from "./observability";
import type {
  ConnectionConfig,
  ConnectionStatus,
  HealthStatus,
  AuthMethod,
  SyncType,
  SyncDirection,
  IntegrationAuditEntry,
} from "./types";
import type { IntegrationProvider } from "./integration-provider";

type ConnectionEvent = {
  id: string;
  connectionId: string;
  type: "created" | "updated" | "enabled" | "disabled" | "reconnected" | "deleted" | "error";
  timestamp: Date;
  details?: string;
};

const connectionHistory = new Map<string, ConnectionEvent[]>();
const auditLog: IntegrationAuditEntry[] = [];
const maxAuditEntries = 10000;

export async function createConnection(
  providerId: string,
  companyId: string,
  name: string,
  authMethod: AuthMethod,
  config: Record<string, unknown>,
  credentials: Record<string, string>,
  metadata?: Record<string, unknown>,
): Promise<ConnectionConfig> {
  const providerConfig = integrationRegistry.getProvider(providerId);
  if (!providerConfig) {
    throw new Error(`Provider ${providerId} not found`);
  }

  const connection: ConnectionConfig = {
    id: crypto.randomUUID(),
    providerId,
    companyId,
    name,
    status: "pending",
    authMethod,
    config,
    metadata,
    createdAt: new Date(),
    updatedAt: new Date(),
    failureCount: 0,
    enabled: true,
    version: 1,
    tags: [],
  };

  const provider = await getOrCreateProvider(providerConfig);
  const authenticated = await provider.authenticate(connection);

  if (authenticated) {
    connection.status = "connected";
    connection.lastConnectedAt = new Date();
  } else {
    connection.status = "error";
    connection.lastError = "Authentication failed";
  }

  integrationRegistry.registerConnection(connection);
  await storeCredentials(connection.id, companyId, credentials);

  addHistoryEvent(connection.id, "created", authenticated ? undefined : "Authentication failed");
  recordAudit(companyId, connection.id, "connection.created", `Connection "${name}" created`);

  emitIntegrationEvent("integration.connection.created", {
    connectionId: connection.id,
    companyId,
    providerId,
    status: connection.status,
  });

  return connection;
}

export async function updateConnection(
  connectionId: string,
  updates: Partial<Omit<ConnectionConfig, "id" | "providerId" | "companyId" | "createdAt">>,
): Promise<ConnectionConfig> {
  const connection = integrationRegistry.getConnection(connectionId);
  if (!connection) {
    throw new Error(`Connection ${connectionId} not found`);
  }

  Object.assign(connection, updates, { updatedAt: new Date(), version: connection.version + 1 });
  integrationRegistry.registerConnection(connection);
  addHistoryEvent(connectionId, "updated");
  recordAudit(connection.companyId, connectionId, "connection.updated", "Connection updated");

  emitIntegrationEvent("integration.connection.updated", {
    connectionId,
    companyId: connection.companyId,
  });

  return connection;
}

export async function enableConnection(connectionId: string): Promise<ConnectionConfig> {
  const connection = integrationRegistry.getConnection(connectionId);
  if (!connection) {
    throw new Error(`Connection ${connectionId} not found`);
  }
  connection.enabled = true;
  connection.updatedAt = new Date();
  connection.version++;
  integrationRegistry.registerConnection(connection);
  addHistoryEvent(connectionId, "enabled");
  recordAudit(connection.companyId, connectionId, "connection.enabled", "Connection enabled");
  return connection;
}

export async function disableConnection(connectionId: string): Promise<void> {
  const connection = integrationRegistry.getConnection(connectionId);
  if (connection) {
    connection.enabled = false;
    connection.updatedAt = new Date();
    connection.version++;
    integrationRegistry.registerConnection(connection);
  }
  integrationRegistry.updateConnectionStatus(connectionId, "disconnected");
  addHistoryEvent(connectionId, "disabled");
  recordAudit(connection?.companyId ?? "", connectionId, "connection.disabled", "Connection disabled");
}

export async function reconnect(connectionId: string): Promise<boolean> {
  const connection = integrationRegistry.getConnection(connectionId);
  if (!connection) {
    throw new Error(`Connection ${connectionId} not found`);
  }

  const providerConfig = integrationRegistry.getProvider(connection.providerId);
  if (!providerConfig) {
    throw new Error(`Provider ${connection.providerId} not found`);
  }

  integrationRegistry.updateConnectionStatus(connectionId, "pending");

  try {
    const provider = await getOrCreateProvider(providerConfig);
    const updated = await provider.refreshConnection(connection);

    integrationRegistry.registerConnection(updated);
    addHistoryEvent(connectionId, "reconnected");
    recordAudit(connection.companyId, connectionId, "connection.reconnected", "Connection reconnected");

    emitIntegrationEvent("integration.connection.reconnected", {
      connectionId,
      companyId: connection.companyId,
      status: updated.status,
    });

    return updated.status === "connected";
  } catch (error) {
    integrationRegistry.updateConnectionStatus(connectionId, "error");
    const errMsg = error instanceof Error ? error.message : "Reconnection failed";
    addHistoryEvent(connectionId, "error", errMsg);

    emitIntegrationEvent("integration.connection.failed", {
      connectionId,
      companyId: connection.companyId,
      error: errMsg,
    });

    return false;
  }
}

export async function validateConnection(connectionId: string): Promise<{
  valid: boolean;
  diagnostics: { authValid: boolean; reachable: boolean; apiVersionValid: boolean };
  error?: string;
}> {
  const connection = integrationRegistry.getConnection(connectionId);
  if (!connection) {
    throw new Error(`Connection ${connectionId} not found`);
  }

  const providerConfig = integrationRegistry.getProvider(connection.providerId);
  if (!providerConfig) {
    throw new Error(`Provider ${connection.providerId} not found`);
  }

  const provider = await getOrCreateProvider(providerConfig);
  const authValid = await provider.authenticate(connection);
  const health = await provider.checkHealth(connection);
  const isReachable = health.status !== "unhealthy";
  const apiVersionValid = true;

  return {
    valid: authValid && isReachable,
    diagnostics: { authValid, reachable: isReachable, apiVersionValid },
    error: !authValid ? "Authentication failed" : !isReachable ? "Provider unreachable" : undefined,
  };
}

export async function getConnectionHealth(
  connectionId: string,
): Promise<{ status: HealthStatus; latency: number; error?: string }> {
  const connection = integrationRegistry.getConnection(connectionId);
  if (!connection) {
    throw new Error(`Connection ${connectionId} not found`);
  }

  const providerConfig = integrationRegistry.getProvider(connection.providerId);
  if (!providerConfig) {
    throw new Error(`Provider ${connection.providerId} not found`);
  }

  const provider = await getOrCreateProvider(providerConfig);
  return provider.checkHealth(connection);
}

export async function deleteConnection(connectionId: string): Promise<void> {
  const connection = integrationRegistry.getConnection(connectionId);
  if (connection) {
    try {
      await destroyProvider(connection.providerId);
    } catch {
      // provider cleanup is best-effort
    }
  }

  integrationRegistry.removeConnection(connectionId);
  await deleteCredentials(connectionId);
  connectionHistory.delete(connectionId);

  if (connection) {
    recordAudit(connection.companyId, connectionId, "connection.deleted", "Connection deleted");
    emitIntegrationEvent("integration.connection.deleted", {
      connectionId,
      companyId: connection.companyId,
    });
  }
}

export function getConnectionHistory(connectionId: string, limit = 20): ConnectionEvent[] {
  const history = connectionHistory.get(connectionId) ?? [];
  return history.slice(-limit);
}

function addHistoryEvent(
  connectionId: string,
  type: ConnectionEvent["type"],
  details?: string,
): void {
  if (!connectionHistory.has(connectionId)) {
    connectionHistory.set(connectionId, []);
  }
  connectionHistory.get(connectionId)!.push({
    id: crypto.randomUUID(),
    connectionId,
    type,
    timestamp: new Date(),
    details,
  });
}

export function getConnection(connectionId: string): ConnectionConfig | undefined {
  return integrationRegistry.getConnection(connectionId);
}

export function getConnectionsByCompany(companyId: string): ConnectionConfig[] {
  return integrationRegistry.getConnectionsByCompany(companyId);
}

export function getAuditLog(companyId?: string, limit = 100): IntegrationAuditEntry[] {
  let entries = auditLog;
  if (companyId) {
    entries = entries.filter((e) => e.companyId === companyId);
  }
  return entries.slice(-limit);
}

function recordAudit(
  companyId: string,
  connectionId: string,
  action: string,
  details?: string,
): void {
  auditLog.push({
    id: crypto.randomUUID(),
    companyId,
    connectionId,
    action,
    actor: "system",
    details: details ? { message: details } : {},
    timestamp: new Date(),
  });
  if (auditLog.length > maxAuditEntries) {
    auditLog.splice(0, auditLog.length - maxAuditEntries);
  }
}

function emitIntegrationEvent(
  type: "integration.connection.created" | "integration.connection.updated" | "integration.connection.deleted" | "integration.connection.failed" | "integration.connection.reconnected",
  data: Record<string, unknown>,
): void {
  emitIntegrationDomainEvent(type, data);
}
