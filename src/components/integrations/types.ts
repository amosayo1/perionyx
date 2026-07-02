export type ConnectionStatus = "connected" | "warning" | "retrying" | "disconnected" | "healthy" | "critical" | "inactive" | "available" | "error";

export interface IntegrationKpi {
  id: string;
  title: string;
  value: string | number;
  trend: string;
  status: string;
  insight?: string;
}

export interface IntegrationCategory {
  id: string;
  label: string;
  description: string;
  providerCount: number;
  connectedCount: number;
  health: string;
}

export interface ConnectedIntegration {
  id: string;
  name: string;
  category: string;
  kind: string;
  description: string;
  status: string;
  version: string;
  lastSync: string | null;
  lastRunStatus: string | null;
  latency: string | null;
  config: Record<string, unknown>;
}

export interface ConnectionHealthGroup {
  id: string;
  label: string;
  count: number;
  color: string;
  recentChange: string;
}

export interface SyncEvent {
  id: string;
  eventType: string;
  integrationName: string;
  category: string;
  description: string;
  status: "success" | "failed" | "in-progress";
  timestamp: string;
}
