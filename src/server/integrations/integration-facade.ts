import { integrationRegistry } from "./integration-registry";
import * as connectionManager from "./connection-manager";
import * as credentialManager from "./credential-manager";
import * as syncManager from "./sync-manager";
import * as healthMonitor from "./health-monitor";
import * as metrics from "./metrics";
import * as webhookManager from "./webhook-manager";
import * as providerDiscovery from "./provider-discovery";
import * as retryManager from "./retry-manager";
import * as jobScheduler from "./job-scheduler";
import * as versionManager from "./version-manager";
import type { ScheduledJob } from "./job-scheduler";
import type { VersionChange } from "./version-manager";
import { getOrCreateProvider, destroyProvider } from "./integration-factory";
import type {
  ProviderConfig,
  ConnectionConfig,
  SyncJob,
  SyncType,
  SyncDirection,
  AuthMethod,
  IntegrationEvent,
  EventType,
  IntegrationHealthReport,
  WebhookConfig,
  WebhookDelivery,
  ConflictRecord,
  DiscoveryResult,
  ProviderCategory,
  SyncState,
} from "./types";
import type { IntegrationProvider } from "./integration-provider";

export class IntegrationFacade {
  private initialized = false;
  private providerInstances: Map<string, IntegrationProvider> = new Map();

  async initialize(providers?: ProviderConfig[]): Promise<void> {
    if (this.initialized) return;

    if (providers) {
      for (const config of providers) {
        try {
          const instance = await getOrCreateProvider(config);
          this.providerInstances.set(config.id, instance);
        } catch (error) {
          console.error(`Failed to initialize provider ${config.id}:`, error);
        }
      }
    }

    this.initialized = true;
  }

  async destroy(): Promise<void> {
    for (const [id, instance] of this.providerInstances) {
      try {
        await instance.destroy();
      } catch (error) {
        console.error(`Failed to destroy provider ${id}:`, error);
      }
    }
    this.providerInstances.clear();
    this.initialized = false;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getConnections(companyId: string): ConnectionConfig[] {
    return connectionManager.getConnectionsByCompany(companyId);
  }

  getConnection(connectionId: string): ConnectionConfig | undefined {
    return connectionManager.getConnection(connectionId);
  }

  async createConnection(
    companyId: string,
    providerId: string,
    config: Record<string, unknown>,
    credentials: Record<string, string>,
    authMethod: AuthMethod,
    name: string,
  ): Promise<ConnectionConfig> {
    return connectionManager.createConnection(
      providerId,
      companyId,
      name,
      authMethod,
      config,
      credentials,
    );
  }

  async updateConnection(
    connectionId: string,
    updates: Partial<Omit<ConnectionConfig, "id" | "providerId" | "companyId" | "createdAt">>,
  ): Promise<ConnectionConfig> {
    const result = await connectionManager.updateConnection(connectionId, updates);
    versionManager.bumpConnectionVersion(connectionId, "Configuration updated");
    return result;
  }

  async disableConnection(connectionId: string): Promise<void> {
    return connectionManager.disableConnection(connectionId);
  }

  async reconnect(connectionId: string): Promise<boolean> {
    return connectionManager.reconnect(connectionId);
  }

  async deleteConnection(connectionId: string): Promise<void> {
    return connectionManager.deleteConnection(connectionId);
  }

  async sync(
    connectionId: string,
    type: SyncType,
    direction: SyncDirection = "import",
  ): Promise<SyncJob> {
    const startTime = Date.now();
    try {
      const job = await syncManager.startSync(connectionId, type, direction);
      const duration = Date.now() - startTime;
      metrics.recordSync(
        connectionId,
        duration,
        job.status === "completed",
        job.itemsProcessed ?? 0,
      );

      // No-op: Integrations EventBus removed in Phase 18.1A (zero subscribers)

      return job;
    } catch (error) {
      const duration = Date.now() - startTime;
      metrics.recordSync(connectionId, duration, false, 0);
      throw error;
    }
  }

  async getSyncHistory(connectionId: string): Promise<SyncJob[]> {
    return syncManager.listSyncJobs(connectionId);
  }

  async cancelSync(jobId: string): Promise<SyncJob | undefined> {
    return syncManager.cancelSync(jobId);
  }

  async getSyncState(connectionId: string): Promise<SyncState> {
    return syncManager.getSyncState(connectionId);
  }

  async resetSyncState(connectionId: string): Promise<void> {
    return syncManager.resetSyncState(connectionId);
  }

  async detectConflicts(connectionId: string): Promise<ConflictRecord[]> {
    return syncManager.detectConflicts(connectionId);
  }

  async resolveConflict(
    conflictId: string,
    resolution: "local" | "remote" | "manual" | "merged",
  ): Promise<ConflictRecord | undefined> {
    return syncManager.resolveConflict(conflictId, resolution);
  }

  async getHealth(connectionId: string): Promise<IntegrationHealthReport> {
    return healthMonitor.checkConnectionHealth(connectionId);
  }

  async getHealthReport(connectionId: string): Promise<IntegrationHealthReport | undefined> {
    return healthMonitor.getHealthReport(connectionId);
  }

  async getAggregatedHealth(
    companyId: string,
  ): Promise<{ healthy: number; degraded: number; unhealthy: number; unknown: number; total: number }> {
    return healthMonitor.getAggregatedHealth(companyId);
  }

  async getUnhealthyConnections(companyId: string): Promise<ConnectionConfig[]> {
    return healthMonitor.getUnhealthyConnections(companyId);
  }

  async getMetrics(
    companyId: string,
  ): Promise<{
    totalSyncs: number;
    successfulSyncs: number;
    failedSyncs: number;
    avgSyncDuration: number;
    totalApiCalls: number;
    avgApiDuration: number;
  }> {
    return metrics.getAggregatedMetrics(companyId);
  }

  async getSyncMetrics(
    connectionId: string,
    windowMs: number,
  ): Promise<{
    total: number;
    successful: number;
    failed: number;
    avgDuration: number;
    totalItems: number;
  }> {
    return metrics.getSyncMetrics(connectionId, windowMs);
  }

  async registerWebhook(
    companyId: string,
    url: string,
    events: EventType[],
    secret: string,
  ): Promise<WebhookConfig> {
    return webhookManager.registerWebhook(companyId, url, events, secret);
  }

  async updateWebhook(
    webhookId: string,
    updates: Partial<Omit<WebhookConfig, "id" | "companyId" | "createdAt">>,
  ): Promise<WebhookConfig> {
    return webhookManager.updateWebhook(webhookId, updates);
  }

  async deleteWebhook(webhookId: string): Promise<void> {
    return webhookManager.deleteWebhook(webhookId);
  }

  async deliverEvent(event: IntegrationEvent): Promise<WebhookDelivery[]> {
    return webhookManager.deliverEvent(event);
  }

  async getWebhookDeliveries(webhookId: string): Promise<WebhookDelivery[]> {
    return webhookManager.getDeliveryHistory(webhookId);
  }

  async getWebhookStatus(webhookId: string): Promise<{
    webhook: WebhookConfig;
    totalDeliveries: number;
    successRate: number;
    lastDeliveryAt: Date | null;
  }> {
    return webhookManager.getWebhookStatus(webhookId);
  }

  async verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string,
  ): Promise<boolean> {
    return webhookManager.verifySignature(payload, signature, secret);
  }

  async replayWebhookDelivery(deliveryId: string): Promise<WebhookDelivery | null> {
    return webhookManager.replayEvent(deliveryId);
  }

  async discoverProviders(): Promise<DiscoveryResult[]> {
    return providerDiscovery.discoverAll();
  }

  async discoverProvidersByCategory(
    category: ProviderCategory,
  ): Promise<DiscoveryResult[]> {
    return providerDiscovery.discoverByCategory(category);
  }

  invalidateDiscoveryCache(): void {
    providerDiscovery.invalidateCache();
  }

  emitEvent(_event: IntegrationEvent): void {
    // No-op: Integrations EventBus removed in Phase 18.1A (zero subscribers)
  }

  onEvent(_eventType: EventType, _handler: (event: IntegrationEvent) => void | Promise<void>): void {
    // No-op: Integrations EventBus removed in Phase 18.1A (zero subscribers)
  }

  offEvent(_eventType: EventType, _handler: (event: IntegrationEvent) => void | Promise<void>): void {
    // No-op: Integrations EventBus removed in Phase 18.1A (zero subscribers)
  }

  async getEventHistory(_connectionId: string): Promise<IntegrationEvent[]> {
    // No-op: Integrations EventBus removed in Phase 18.1A (zero subscribers)
    return [];
  }

  async getRetryState(operationId: string): Promise<{
    operationId: string;
    attempt: number;
    maxAttempts: number;
    lastError: Error | null;
    nextRetryAt: Date | null;
    startedAt: Date;
  } | undefined> {
    return retryManager.getRetryState(operationId);
  }

  async resetRetryState(operationId: string): Promise<void> {
    retryManager.resetRetryState(operationId);
  }

  async withRetry<T>(
    operation: () => Promise<T>,
    options?: { maxAttempts?: number; baseDelay?: number; maxDelay?: number },
  ): Promise<T> {
    return retryManager.withRetry(operation, options);
  }

  async getProvider(providerId: string): Promise<IntegrationProvider | undefined> {
    const config = integrationRegistry.getProvider(providerId);
    if (!config) return undefined;
    return getOrCreateProvider(config);
  }

  async getProvidersByCategory(category: ProviderCategory): Promise<ProviderConfig[]> {
    return integrationRegistry.getProvidersByCategory(category);
  }

  async getAllProviders(): Promise<ProviderConfig[]> {
    return integrationRegistry.getAllProviders();
  }

  async getCredentials(connectionId: string): Promise<Record<string, string> | null> {
    return credentialManager.getCredentials(connectionId);
  }

  async storeCredentials(
    connectionId: string,
    companyId: string,
    credentials: Record<string, string>,
  ): Promise<void> {
    await credentialManager.storeCredentials(connectionId, companyId, credentials);
  }

  async rotateCredentials(connectionId: string): Promise<void> {
    await credentialManager.rotateCredentials(connectionId);
  }

  async validateCredentials(connectionId: string): Promise<boolean> {
    return credentialManager.validateCredentials(connectionId);
  }

  async scheduleSync(
    connectionId: string,
    cronExpression: string,
    syncType: SyncType,
    syncDirection: SyncDirection = "import",
  ): Promise<{ id: string }> {
    return jobScheduler.schedule(connectionId, cronExpression, syncType, syncDirection);
  }

  async unscheduleSync(jobId: string): Promise<void> {
    jobScheduler.unschedule(jobId);
  }

  async listScheduledSyncs(companyId: string): Promise<ScheduledJob[]> {
    return jobScheduler.listScheduledJobs(companyId);
  }

  registerProviderVersion(providerId: string, version: string): void {
    versionManager.registerProviderVersion(providerId, version);
  }

  getProviderVersion(providerId: string): string | undefined {
    return versionManager.getProviderVersion(providerId);
  }

  getConnectionVersion(connectionId: string): number {
    return versionManager.getConnectionVersion(connectionId);
  }

  getVersionHistory(connectionId: string): VersionChange[] {
    return versionManager.getVersionHistory(connectionId);
  }

  async recordApiCall(
    providerId: string,
    method: string,
    duration: number,
    statusCode: number,
  ): Promise<void> {
    metrics.recordApiCall(providerId, method, duration, statusCode);
  }
}

export const integrationFacade = new IntegrationFacade();
