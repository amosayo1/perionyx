import type { SyncJob, SyncMode } from "../domain/types";

export interface SyncSchedule {
  connectionId: string;
  companyId: string;
  frequencyMinutes: number;
  mode: SyncMode;
  retryPolicy: RetryPolicy;
}

export interface RetryPolicy {
  maxRetries: number;
  backoffMinutes: number;
  exponentialBackoff: boolean;
  deadLetterAfterRetries: boolean;
}

export interface SyncQueueEntry {
  connectionId: string;
  companyId: string;
  mode: SyncMode;
  priority: number;
  scheduledAt: Date;
  retryCount: number;
}

export class SyncOrchestrator {
  private queue: SyncQueueEntry[] = [];
  private retrying = new Set<string>();
  private deadLetterQueue: SyncQueueEntry[] = [];

  enqueue(entry: SyncQueueEntry): void {
    this.queue.push(entry);
    this.queue.sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority;
      return a.scheduledAt.getTime() - b.scheduledAt.getTime();
    });
  }

  dequeue(): SyncQueueEntry | null {
    return this.queue.shift() ?? null;
  }

  markCompleted(connectionId: string): void {
    this.retrying.delete(connectionId);
  }

  markFailed(connectionId: string, entry: SyncQueueEntry, policy: RetryPolicy): void {
    if (entry.retryCount >= policy.maxRetries) {
      if (policy.deadLetterAfterRetries) {
        this.deadLetterQueue.push(entry);
      }
      this.retrying.delete(connectionId);
      return;
    }

    const backoffMinutes = policy.exponentialBackoff
      ? policy.backoffMinutes * Math.pow(2, entry.retryCount)
      : policy.backoffMinutes;

    this.enqueue({
      ...entry,
      retryCount: entry.retryCount + 1,
      scheduledAt: new Date(Date.now() + backoffMinutes * 60 * 1000),
      priority: Math.max(0, entry.priority - 1),
    });
  }

  isRetrying(connectionId: string): boolean {
    return this.retrying.has(connectionId);
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  getDeadLetterCount(): number {
    return this.deadLetterQueue.length;
  }
}

export interface SyncJobEntry {
  connectionId: string;
  companyId: string;
  mode: SyncMode;
  priority: number;
  scheduledAt: string;
  retryCount: number;
}