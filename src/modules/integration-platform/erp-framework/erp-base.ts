import type { ConnectorProvider, AuthMethod, HealthStatus, SyncType, SyncResult } from "../types";

export interface ErpAuthConfig {
  baseUrl: string;
  authMethod: AuthMethod;
  credentials: Record<string, string>;
  additionalHeaders?: Record<string, string>;
}

export interface ErpSyncConfig {
  instanceId: string;
  companyId: string;
  syncType: SyncType;
  modules?: string[];
  dateFrom?: string;
  dateTo?: string;
  pageSize?: number;
}

export abstract class ErpConnectorBase {
  abstract readonly provider: ConnectorProvider;
  abstract validateConnection(auth: ErpAuthConfig): Promise<{ valid: boolean; error?: string }>;
  abstract discoverSchema(auth: ErpAuthConfig): Promise<{ modules: string[]; entities: string[]; fields: Record<string, string[]> }>;
  abstract sync(auth: ErpAuthConfig, config: ErpSyncConfig): Promise<SyncResult>;
  abstract healthCheck(auth: ErpAuthConfig): Promise<{ status: HealthStatus; responseTimeMs: number; error?: string }>;

  protected async withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (e) {
        if (i === maxRetries - 1) throw e;
        await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
      }
    }
    throw new Error("Retry exhausted");
  }

  protected async withRateLimit<T>(fn: () => Promise<T>, requestsPerMinute = 60): Promise<T> {
    const minInterval = 60000 / requestsPerMinute;
    await new Promise(r => setTimeout(r, minInterval));
    return fn();
  }

  protected async withPagination<T>(
    fetcher: (page: number) => Promise<{ data: T[]; hasMore: boolean }>,
    pageSize = 100,
  ): Promise<T[]> {
    const results: T[] = [];
    let page = 1;
    let hasMore = true;
    while (hasMore) {
      const result = await fetcher(page);
      results.push(...result.data);
      hasMore = result.hasMore;
      page++;
    }
    return results;
  }

  protected buildHeaders(auth: ErpAuthConfig): Record<string, string> {
    const headers: Record<string, string> = { "Content-Type": "application/json", ...auth.additionalHeaders };
    if (auth.authMethod === "bearer" && auth.credentials.token) {
      headers["Authorization"] = `Bearer ${auth.credentials.token}`;
    } else if (auth.authMethod === "basic" && auth.credentials.username && auth.credentials.password) {
      headers["Authorization"] = `Basic ${Buffer.from(`${auth.credentials.username}:${auth.credentials.password}`).toString("base64")}`;
    } else if (auth.authMethod === "api-key" && auth.credentials.apiKey) {
      headers["X-API-Key"] = auth.credentials.apiKey;
    }
    return headers;
  }
}
