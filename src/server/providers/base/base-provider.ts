import type {
  ProviderConfig,
  ConnectionConfig,
  SyncJob,
  SyncResult,
  SyncState,
  HealthStatus,
  IntegrationEvent,
  IntegrationDomainEvent,
  ProviderCapabilities,
  DiscoveryResult,
  HealthDiagnostics,
} from "@/server/integrations/types";
import type { IntegrationProvider } from "@/server/integrations/integration-provider";
import { authenticate, refreshAuth, validateAuth, clearAuth } from "../auth/auth-framework";
import { buildCapabilities } from "../capabilities/capability-registry";
import { RetryCircuitBreaker, withRetry, type RetryPolicy } from "../retry/retry-framework";
import { emitIntegrationDomainEvent } from "@/server/integrations/observability";
import { recordIntegrationMetric, recordIntegrationHistogram, createIntegrationSpan } from "@/server/integrations/observability";
import { logIntegrationEvent } from "@/server/integrations/observability";

const defaultRetryPolicy: RetryPolicy = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  jitter: true,
  exponentialBase: 2,
};

export abstract class BaseProvider implements IntegrationProvider {
  readonly config!: ProviderConfig;
  protected initialized = false;
  protected destroyed = false;
  protected circuitBreaker = new RetryCircuitBreaker(5, 60000);

  abstract getCapabilities(): Promise<ProviderCapabilities>;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
    this.recordMetric("provider.initialized", 1);
    logIntegrationEvent("info", `Provider initialized: ${this.config.id}`, { providerId: this.config.id });
  }

  async destroy(): Promise<void> {
    this.destroyed = true;
    this.circuitBreaker.reset();
    this.recordMetric("provider.destroyed", 1);
    logIntegrationEvent("info", `Provider destroyed: ${this.config.id}`, { providerId: this.config.id });
  }

  async authenticate(connection: ConnectionConfig): Promise<boolean> {
    const span = createIntegrationSpan("provider.authenticate", { providerId: this.config.id, connectionId: connection.id });
    try {
      await authenticate(connection);
      this.recordMetric("auth.success", 1, { connectionId: connection.id });
      return true;
    } catch (error) {
      this.recordMetric("auth.failure", 1, { connectionId: connection.id });
      logIntegrationEvent("warn", `Authentication failed for ${connection.id}`, {
        providerId: this.config.id,
        connectionId: connection.id,
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    } finally {
      span?.finish();
    }
  }

  async validateConnection(connection: ConnectionConfig): Promise<boolean> {
    return validateAuth(connection);
  }

  async refreshConnection(connection: ConnectionConfig): Promise<ConnectionConfig> {
    const span = createIntegrationSpan("provider.refreshConnection", { providerId: this.config.id, connectionId: connection.id });
    try {
      const headers = await refreshAuth(connection);
      const updated: ConnectionConfig = {
        ...connection,
        lastConnectedAt: new Date(),
        failureCount: 0,
      };
      this.recordMetric("connection.refreshed", 1, { connectionId: connection.id });
      return updated;
    } catch (error) {
      this.recordMetric("connection.refresh_failed", 1, { connectionId: connection.id });
      throw error;
    } finally {
      span?.finish();
    }
  }

  async checkHealth(connection: ConnectionConfig): Promise<{ status: HealthStatus; latency: number; error?: string }> {
    const span = createIntegrationSpan("provider.checkHealth", { providerId: this.config.id, connectionId: connection.id });
    const start = Date.now();
    try {
      const valid = await this.authenticate(connection);
      const latency = Date.now() - start;
      if (valid) {
        this.recordHistogram("health.latency", latency, { connectionId: connection.id });
        return { status: "healthy", latency };
      }
      return { status: "unhealthy", latency, error: "Authentication failed" };
    } catch (error) {
      const latency = Date.now() - start;
      return {
        status: "unhealthy",
        latency,
        error: error instanceof Error ? error.message : String(error),
      };
    } finally {
      span?.finish();
    }
  }

  async diagnose(connection: ConnectionConfig): Promise<HealthDiagnostics> {
    const start = Date.now();
    const authValid = await this.authenticate(connection);
    return {
      connectionId: connection.id,
      timestamp: new Date(),
      latency: Date.now() - start,
      isReachable: authValid,
      authValid,
      apiVersionValid: true,
      suggestions: authValid ? undefined : ["Check authentication credentials"],
    };
  }

  async discover(connection: ConnectionConfig): Promise<DiscoveryResult> {
    return {
      providerId: this.config.id,
      available: true,
      version: this.config.version,
      capabilities: this.config.capabilities,
    };
  }

  async sync(job: SyncJob, state: SyncState): Promise<SyncResult> {
    return job.type === "incremental"
      ? this.syncIncremental(job, state)
      : this.syncFull(job, state);
  }

  async syncFull(job: SyncJob, state: SyncState): Promise<SyncResult> {
    const span = createIntegrationSpan("provider.syncFull", {
      providerId: this.config.id,
      connectionId: job.connectionId ?? "",
    });
    const start = Date.now();
    try {
      emitIntegrationDomainEvent("integration.sync.started", {
        providerId: this.config.id,
        connectionId: job.connectionId,
        companyId: job.companyId,
        syncType: "full",
      });

      const result = await this.performFullSync(job, state);

      this.recordMetric("sync.items_processed", result.itemsSynced, { connectionId: job.connectionId });
      this.recordHistogram("sync.duration", Date.now() - start, { connectionId: job.connectionId });

      emitIntegrationDomainEvent("integration.sync.completed", {
        providerId: this.config.id,
        connectionId: job.connectionId,
        companyId: job.companyId,
        itemsSynced: result.itemsSynced,
        duration: Date.now() - start,
      });

      return result;
    } catch (error) {
      this.recordMetric("sync.failure", 1, { connectionId: job.connectionId });
      emitIntegrationDomainEvent("integration.sync.failed", {
        providerId: this.config.id,
        connectionId: job.connectionId,
        companyId: job.companyId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    } finally {
      span?.finish();
    }
  }

  async syncIncremental(job: SyncJob, state: SyncState): Promise<SyncResult> {
    const span = createIntegrationSpan("provider.syncIncremental", {
      providerId: this.config.id,
      connectionId: job.connectionId ?? "",
    });
    const start = Date.now();
    try {
      emitIntegrationDomainEvent("integration.sync.started", {
        providerId: this.config.id,
        connectionId: job.connectionId,
        companyId: job.companyId,
        syncType: "incremental",
      });

      const result = await this.performIncrementalSync(job, state);

      this.recordMetric("sync.items_processed", result.itemsSynced, { connectionId: job.connectionId });
      this.recordHistogram("sync.duration", Date.now() - start, { connectionId: job.connectionId });

      emitIntegrationDomainEvent("integration.sync.completed", {
        providerId: this.config.id,
        connectionId: job.connectionId,
        companyId: job.companyId,
        itemsSynced: result.itemsSynced,
        duration: Date.now() - start,
      });

      return result;
    } catch (error) {
      this.recordMetric("sync.failure", 1, { connectionId: job.connectionId });
      emitIntegrationDomainEvent("integration.sync.failed", {
        providerId: this.config.id,
        connectionId: job.connectionId,
        companyId: job.companyId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    } finally {
      span?.finish();
    }
  }

  protected abstract performFullSync(job: SyncJob, state: SyncState): Promise<SyncResult>;
  protected abstract performIncrementalSync(job: SyncJob, state: SyncState): Promise<SyncResult>;

  async handleEvent(event: IntegrationEvent | IntegrationDomainEvent): Promise<void> {
    logIntegrationEvent("info", `Event received: ${event.type}`, {
      providerId: this.config.id,
      connectionId: event.connectionId,
      eventType: event.type,
    });
  }

  async getSyncState(connectionId: string): Promise<SyncState> {
    return {
      lastSyncAt: null,
      lastCursor: null,
      lastFullSyncAt: null,
      version: 1,
      changeTracking: {},
    };
  }

  async resetSyncState(connectionId: string): Promise<void> {
    logIntegrationEvent("info", `Sync state reset for ${connectionId}`, {
      providerId: this.config.id,
      connectionId,
    });
  }

  async test(config: Record<string, unknown>): Promise<{ success: boolean; error?: string }> {
    const span = createIntegrationSpan("provider.test", { providerId: this.config.id });
    try {
      const capabilities = await this.getCapabilities();
      return {
        success: true,
        error: capabilities ? undefined : "Failed to retrieve capabilities",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    } finally {
      span?.finish();
    }
  }

  async withRetry<T>(
    operation: string,
    handler: () => Promise<T>,
    connectionId?: string,
    options?: { policy?: RetryPolicy; deadLetter?: (error: Error, lastAttempt: number) => void | Promise<void> },
  ): Promise<T> {
    const span = createIntegrationSpan(`provider.retry.${operation}`, {
      providerId: this.config.id,
      connectionId: connectionId ?? "",
    });
    try {
      return await withRetry(handler, {
        policy: options?.policy ?? defaultRetryPolicy,
        circuitBreaker: this.circuitBreaker,
        onRetry: (error, attempt) => {
          logIntegrationEvent("warn", `Retry ${attempt + 1}/${defaultRetryPolicy.maxRetries} for ${operation}`, {
            providerId: this.config.id,
      connectionId: connectionId ?? "",
            error: error.message,
            attempt: attempt + 1,
          });
        },
        deadLetter: async (error, lastAttempt) => {
          emitIntegrationDomainEvent("integration.retry.exhausted", {
            providerId: this.config.id,
            connectionId: connectionId ?? "",
            operation,
            error: error.message,
            lastAttempt,
          });
          if (options?.deadLetter) {
            await options.deadLetter(error, lastAttempt);
          }
        },
      });
    } finally {
      span?.finish();
    }
  }

  protected buildCapabilities(config: {
    authMethods: string[];
    syncTypes: string[];
    syncDirections: string[];
    capabilities: string[];
    maxBatchSize?: number;
    rateLimit?: number;
    rateLimitWindow?: number;
  }): ProviderCapabilities {
    return buildCapabilities({
      category: this.config.category,
      authMethods: config.authMethods as never,
      syncTypes: config.syncTypes as never,
      syncDirections: config.syncDirections as never,
      capabilities: config.capabilities as never,
      capabilityFlags: [],
      businessCapabilities: [],
    });
  }

  protected recordMetric(name: string, value: number, tags?: Record<string, string>): void {
    recordIntegrationMetric(name, value, { providerId: this.config.id, ...tags });
  }

  protected recordHistogram(name: string, value: number, tags?: Record<string, string>): void {
    recordIntegrationHistogram(name, value, { providerId: this.config.id, ...tags });
  }

  protected log(level: "info" | "warn" | "error", message: string, data?: Record<string, unknown>): void {
    logIntegrationEvent(level, message, { providerId: this.config.id, ...data });
  }

  protected emitEvent(type: "integration.connection.created" | "integration.connection.updated" | "integration.connection.deleted" | "integration.connection.failed" | "integration.connection.reconnected" | "integration.sync.started" | "integration.sync.completed" | "integration.sync.failed", data: Record<string, unknown>): void {
    emitIntegrationDomainEvent(type, { providerId: this.config.id, ...data });
  }

  protected createSpan(operationName: string, tags?: Record<string, string>): { finish: () => void } | null {
    return createIntegrationSpan(`provider.${operationName}`, { providerId: this.config.id, ...tags });
  }

  protected clearAuth(connectionId: string): void {
    clearAuth(connectionId);
  }
}
