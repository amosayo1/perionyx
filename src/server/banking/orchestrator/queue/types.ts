import type { ExecutionContext } from "../types";

export type QueuePriority = "high" | "normal" | "low";

export enum QueueStatus {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  DEAD_LETTERED = "DEAD_LETTERED",
}

export interface OrchestrationQueueItem {
  id: string;
  correlationId: string;
  context: ExecutionContext;
  priority: QueuePriority;
  status: QueueStatus;
  scheduledAt: string;
  startedAt: string | null;
  completedAt: string | null;
  retryCount: number;
  maxRetries: number;
  error: string | null;
}