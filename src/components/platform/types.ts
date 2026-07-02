export type ServiceStatus = "healthy" | "warning" | "offline";

export type JobStatus = "running" | "queued" | "completed" | "failed";

export type QueueHealth = "healthy" | "warning" | "critical";

export type ConnectionStatus = "connected" | "disconnected" | "warning" | "retrying";

export type EventSeverity = "info" | "warning" | "error" | "success";

export interface PlatformHealthMetric {
  id: string;
  title: string;
  value: string;
  status: ServiceStatus;
  trend: "up" | "down" | "neutral";
  trendLabel: string;
  insight: string;
  sparklineData: number[];
}

export interface PlatformService {
  id: string;
  name: string;
  status: ServiceStatus;
  description: string;
  latency: string;
  lastChecked: string;
  uptime: string;
}

export interface BackgroundJob {
  id: string;
  name: string;
  status: JobStatus;
  avgDuration: string;
  lastExecution: string;
  description: string;
}

export interface QueueData {
  id: string;
  name: string;
  waiting: number;
  processing: number;
  avgProcessingTime: string;
  oldestItem: string;
  health: QueueHealth;
}

export interface Integration {
  id: string;
  name: string;
  status: ConnectionStatus;
  lastSync: string;
  description: string;
}

export interface WebhookEndpoint {
  id: string;
  name: string;
  successRate: number;
  retries: number;
  failures: number;
  avgLatency: string;
  lastDelivery: string;
  status: ConnectionStatus;
}

export interface ScheduledTask {
  id: string;
  name: string;
  status: JobStatus;
  nextRun: string;
  lastRun: string;
  duration: string;
  owner: string;
}

export interface PlatformEvent {
  id: string;
  type: string;
  severity: EventSeverity;
  title: string;
  description: string;
  service: string;
  timestamp: string;
}
