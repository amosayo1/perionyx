type SyncMetric = {
  id: string;
  connectionId: string;
  timestamp: Date;
  duration: number;
  success: boolean;
  itemsCount: number;
};

type WebhookMetric = {
  id: string;
  webhookId: string;
  timestamp: Date;
  status: "delivered" | "failed";
  duration: number;
};

type ApiCallMetric = {
  id: string;
  providerId: string;
  method: string;
  timestamp: Date;
  duration: number;
  statusCode: number;
};

import { integrationRegistry } from "./integration-registry";

const syncMetrics = new Map<string, SyncMetric[]>();
const webhookMetrics = new Map<string, WebhookMetric[]>();
const apiCallMetrics = new Map<string, ApiCallMetric[]>();

export function recordSync(
  connectionId: string,
  duration: number,
  success: boolean,
  itemsCount: number,
): void {
  const metric: SyncMetric = {
    id: crypto.randomUUID(),
    connectionId,
    timestamp: new Date(),
    duration,
    success,
    itemsCount,
  };

  if (!syncMetrics.has(connectionId)) {
    syncMetrics.set(connectionId, []);
  }
  syncMetrics.get(connectionId)!.push(metric);
}

export function recordWebhookDelivery(
  webhookId: string,
  status: "delivered" | "failed",
  duration: number,
): void {
  const metric: WebhookMetric = {
    id: crypto.randomUUID(),
    webhookId,
    timestamp: new Date(),
    status,
    duration,
  };

  if (!webhookMetrics.has(webhookId)) {
    webhookMetrics.set(webhookId, []);
  }
  webhookMetrics.get(webhookId)!.push(metric);
}

export function recordApiCall(
  providerId: string,
  method: string,
  duration: number,
  statusCode: number,
): void {
  const metric: ApiCallMetric = {
    id: crypto.randomUUID(),
    providerId,
    method,
    timestamp: new Date(),
    duration,
    statusCode,
  };

  if (!apiCallMetrics.has(providerId)) {
    apiCallMetrics.set(providerId, []);
  }
  apiCallMetrics.get(providerId)!.push(metric);
}

export function getSyncMetrics(
  connectionId: string,
  windowMs: number,
): { total: number; successful: number; failed: number; avgDuration: number; totalItems: number } {
  const metrics = syncMetrics.get(connectionId) ?? [];
  const cutoff = Date.now() - windowMs;
  const windowed = metrics.filter((m) => m.timestamp.getTime() >= cutoff);

  const total = windowed.length;
  const successful = windowed.filter((m) => m.success).length;
  const failed = total - successful;
  const avgDuration =
    total > 0
      ? windowed.reduce((sum, m) => sum + m.duration, 0) / total
      : 0;
  const totalItems = windowed.reduce((sum, m) => sum + m.itemsCount, 0);

  return { total, successful, failed, avgDuration, totalItems };
}

export function getWebhookMetrics(
  webhookId: string,
  windowMs: number,
): { total: number; delivered: number; failed: number; avgDuration: number } {
  const metrics = webhookMetrics.get(webhookId) ?? [];
  const cutoff = Date.now() - windowMs;
  const windowed = metrics.filter((m) => m.timestamp.getTime() >= cutoff);

  const total = windowed.length;
  const delivered = windowed.filter((m) => m.status === "delivered").length;
  const failed = total - delivered;
  const avgDuration =
    total > 0
      ? windowed.reduce((sum, m) => sum + m.duration, 0) / total
      : 0;

  return { total, delivered, failed, avgDuration };
}

export function getAggregatedMetrics(
  companyId: string,
): {
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  avgSyncDuration: number;
  totalApiCalls: number;
  avgApiDuration: number;
} {
  const connections = integrationRegistry.getConnectionsByCompany(companyId);

  let totalSyncs = 0;
  let successfulSyncs = 0;
  let totalSyncDuration = 0;
  let totalApiCalls = 0;
  let totalApiDuration = 0;

  for (const conn of connections) {
    const connMetrics = syncMetrics.get(conn.id) ?? [];
    totalSyncs += connMetrics.length;
    successfulSyncs += connMetrics.filter((m) => m.success).length;
    totalSyncDuration += connMetrics.reduce((sum, m) => sum + m.duration, 0);

    const apiMetrics = apiCallMetrics.get(conn.providerId) ?? [];
    totalApiCalls += apiMetrics.length;
    totalApiDuration += apiMetrics.reduce((sum, m) => sum + m.duration, 0);
  }

  return {
    totalSyncs,
    successfulSyncs,
    failedSyncs: totalSyncs - successfulSyncs,
    avgSyncDuration: totalSyncs > 0 ? totalSyncDuration / totalSyncs : 0,
    totalApiCalls,
    avgApiDuration: totalApiCalls > 0 ? totalApiDuration / totalApiCalls : 0,
  };
}

export function resetMetrics(): void {
  syncMetrics.clear();
  webhookMetrics.clear();
  apiCallMetrics.clear();
}
