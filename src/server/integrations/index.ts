export { IntegrationFacade, integrationFacade } from "./integration-facade";
export { IntegrationRegistry, integrationRegistry } from "./integration-registry";

export type { IntegrationProvider } from "./integration-provider";

export * from "./types";

export {
  createProvider,
  getOrCreateProvider,
  destroyProvider,
  getCachedProvider,
} from "./integration-factory";

export {
  createConnection,
  updateConnection,
  disableConnection,
  reconnect,
  getConnectionHealth,
  deleteConnection,
  getConnectionHistory,
  getConnection,
  getConnectionsByCompany,
} from "./connection-manager";

export {
  storeCredentials,
  getCredentials,
  rotateCredentials,
  deleteCredentials,
  validateCredentials,
} from "./credential-manager";

export {
  startSync,
  getSyncStatus,
  listSyncJobs,
  cancelSync,
  getSyncState,
  resetSyncState,
  detectConflicts,
  resolveConflict,
  addConflict,
} from "./sync-manager";

export { withRetry, getRetryState, resetRetryState } from "./retry-manager";

export {
  checkConnectionHealth,
  getHealthReport,
  getAllHealthReports,
  getUnhealthyConnections,
  getAggregatedHealth,
} from "./health-monitor";

export {
  recordSync,
  recordWebhookDelivery,
  recordApiCall,
  getSyncMetrics,
  getWebhookMetrics,
  getAggregatedMetrics,
  resetMetrics,
} from "./metrics";

export {
  registerWebhook,
  updateWebhook,
  deleteWebhook,
  deliverEvent,
  getDeliveryHistory,
  getWebhookStatus,
  verifySignature,
  replayEvent,
  getWebhook,
  getWebhooksByCompany,
} from "./webhook-manager";

export {
  schedule,
  unschedule,
  listScheduledJobs,
  getDueJobs,
  getScheduledJob,
  pauseJob,
  resumeJob,
} from "./job-scheduler";

export {
  discoverAll,
  discoverByCategory,
  getDiscoveredProviders,
  invalidateCache,
} from "./provider-discovery";

export {
  registerProviderVersion,
  getProviderVersion,
  getConnectionVersion,
  bumpConnectionVersion,
  getVersionHistory,
} from "./version-manager";
