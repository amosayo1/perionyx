import type { ConnectorSyncResult } from "../types";

export type SyncDirection = "import" | "export" | "bidirectional";

export interface SyncConfig {
  direction: SyncDirection;
  schedule?: string;
  batchSize: number;
  retryCount: number;
  retryDelayMs: number;
}

export interface SyncJob {
  connectorId: string;
  companyId: string;
  direction: SyncDirection;
  fullSync?: boolean;
  since?: string;
}

export interface ISyncExecutor {
  execute(job: SyncJob, syncFn: (opts: { fullSync?: boolean; since?: string; limit?: number }) => Promise<ConnectorSyncResult>): Promise<ConnectorSyncResult>;
}
