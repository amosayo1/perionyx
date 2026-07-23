import { recordIntegrationMetric, recordIntegrationHistogram } from "@/server/integrations/observability";

export function trackProviderMetric(
  providerId: string,
  metricName: string,
  value: number,
  tags?: Record<string, string>,
): void {
  recordIntegrationMetric(`provider.${metricName}`, value, { providerId, ...tags });
}

export function trackProviderHistogram(
  providerId: string,
  metricName: string,
  value: number,
  tags?: Record<string, string>,
): void {
  recordIntegrationHistogram(`provider.${metricName}`, value, { providerId, ...tags });
}

export function trackSyncDuration(
  providerId: string,
  connectionId: string,
  durationMs: number,
  success: boolean,
): void {
  trackProviderHistogram(providerId, "sync.duration", durationMs, {
    connectionId,
    status: success ? "success" : "failure",
  });
}

export function trackApiCall(
  providerId: string,
  method: string,
  endpoint: string,
  durationMs: number,
  statusCode: number,
): void {
  trackProviderHistogram(providerId, "api.call.duration", durationMs, {
    method,
    endpoint,
    status: String(statusCode),
  });
}

export function trackAuthResult(
  providerId: string,
  connectionId: string,
  success: boolean,
): void {
  trackProviderMetric(providerId, "auth.result", 1, {
    connectionId,
    status: success ? "success" : "failure",
  });
}

export function trackItemProcessed(
  providerId: string,
  connectionId: string,
  count: number,
): void {
  trackProviderMetric(providerId, "items.processed", count, { connectionId });
}
