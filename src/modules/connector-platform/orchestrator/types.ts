import type { ConnectorKind } from "../types";

export interface OrchestrationConfig {
  healthCheckCron?: string;
  syncCron?: string;
  oauthRefreshCron?: string;
  retryPolicy?: {
    maxRetries: number;
    retryDelayMs: number;
  };
  metricsEnabled?: boolean;
  auditEnabled?: boolean;
}

export const DEFAULT_ORCHESTRATION_CONFIGS: Partial<Record<ConnectorKind, OrchestrationConfig>> = {
  plaid: {
    healthCheckCron: "*/15 * * * *",
    syncCron: "*/30 * * * *",
    oauthRefreshCron: "0 */6 * * *",
    retryPolicy: { maxRetries: 3, retryDelayMs: 60000 },
    metricsEnabled: true,
    auditEnabled: true,
  },
  quickbooks: {
    healthCheckCron: "*/15 * * * *",
    syncCron: "*/30 * * * *",
    oauthRefreshCron: "0 */4 * * *",
    retryPolicy: { maxRetries: 3, retryDelayMs: 60000 },
    metricsEnabled: true,
    auditEnabled: true,
  },
  stripe: {
    healthCheckCron: "0 */1 * * *",
    syncCron: "0 */6 * * *",
    retryPolicy: { maxRetries: 3, retryDelayMs: 60000 },
    metricsEnabled: true,
    auditEnabled: true,
  },
  dynamics365: {
    healthCheckCron: "*/15 * * * *",
    syncCron: "0 */2 * * *",
    oauthRefreshCron: "0 */6 * * *",
    retryPolicy: { maxRetries: 3, retryDelayMs: 60000 },
    metricsEnabled: true,
    auditEnabled: true,
  },
  netsuite: {
    healthCheckCron: "*/15 * * * *",
    syncCron: "0 */2 * * *",
    oauthRefreshCron: "0 */4 * * *",
    retryPolicy: { maxRetries: 3, retryDelayMs: 60000 },
    metricsEnabled: true,
    auditEnabled: true,
  },
  sap: {
    healthCheckCron: "*/15 * * * *",
    syncCron: "0 */3 * * *",
    oauthRefreshCron: "0 */8 * * *",
    retryPolicy: { maxRetries: 3, retryDelayMs: 60000 },
    metricsEnabled: true,
    auditEnabled: true,
  },
};
