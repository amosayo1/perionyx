import { logIntegrationEvent } from "@/server/integrations/observability";

export function logProviderInfo(
  providerId: string,
  message: string,
  data?: Record<string, unknown>,
): void {
  logIntegrationEvent("info", `[Provider:${providerId}] ${message}`, { providerId, ...data });
}

export function logProviderWarn(
  providerId: string,
  message: string,
  data?: Record<string, unknown>,
): void {
  logIntegrationEvent("warn", `[Provider:${providerId}] ${message}`, { providerId, ...data });
}

export function logProviderError(
  providerId: string,
  message: string,
  data?: Record<string, unknown>,
): void {
  logIntegrationEvent("error", `[Provider:${providerId}] ${message}`, { providerId, ...data });
}

export function logOperationStart(
  providerId: string,
  connectionId: string,
  operation: string,
): void {
  logProviderInfo(providerId, `Starting ${operation}`, { connectionId, operation });
}

export function logOperationEnd(
  providerId: string,
  connectionId: string,
  operation: string,
  durationMs: number,
  success: boolean,
): void {
  const level = success ? "info" : "warn";
  const message = success ? `Completed ${operation}` : `Failed ${operation}`;
  logIntegrationEvent(level, `[Provider:${providerId}] ${message}`, {
    providerId,
    connectionId,
    operation,
    durationMs,
    success,
  });
}
