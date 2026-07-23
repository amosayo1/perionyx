import type { CommandKind, ExecutionContext } from "../types";

export interface DeadLetterRecord {
  id: string;
  correlationId: string;
  commandKind: CommandKind;
  tenantId: string;
  provider: string;
  error: string;
  errorCode: string;
  context: ExecutionContext;
  failedAt: string;
  retryCount: number;
  lastAttemptAt: string;
}

export class DeadLetterQueue {
  private queue: DeadLetterRecord[] = [];
  private readonly maxEntries = 10_000;

  enqueue(record: Omit<DeadLetterRecord, "id" | "failedAt">): DeadLetterRecord {
    const entry: DeadLetterRecord = {
      ...record,
      id: crypto.randomUUID(),
      failedAt: new Date().toISOString(),
    };

    this.queue.push(entry);

    if (this.queue.length > this.maxEntries) {
      this.queue.shift();
    }

    return entry;
  }

  getByCorrelationId(correlationId: string): DeadLetterRecord[] {
    return this.queue.filter((e) => e.correlationId === correlationId);
  }

  getByProvider(provider: string): DeadLetterRecord[] {
    return this.queue.filter((e) => e.provider === provider);
  }

  getByTenant(tenantId: string): DeadLetterRecord[] {
    return this.queue.filter((e) => e.tenantId === tenantId);
  }

  requeue(id: string): DeadLetterRecord | null {
    const index = this.queue.findIndex((e) => e.id === id);
    if (index === -1) return null;
    const entry = this.queue[index];
    this.queue.splice(index, 1);
    return entry;
  }

  clear(): void {
    this.queue = [];
  }

  get total(): number {
    return this.queue.length;
  }

  get recent(): DeadLetterRecord[] {
    return this.queue.slice(-50);
  }
}

export const deadLetterQueue = new DeadLetterQueue();