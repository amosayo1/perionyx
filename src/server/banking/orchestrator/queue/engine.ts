import type { ExecutionContext } from "../types";
import type { QueuePriority, OrchestrationQueueItem } from "./types";
import { QueueStatus } from "./types";
import { executionPipeline } from "../pipeline/engine";

export class OrchestrationQueue {
  private items: OrchestrationQueueItem[] = [];
  private running = 0;
  private active = false;
  private maxConcurrency: number;

  constructor(concurrency = 5) {
    this.maxConcurrency = concurrency;
  }

  enqueue(
    context: ExecutionContext,
    priority: QueuePriority = "normal",
    maxRetries = 3,
  ): string {
    const item: OrchestrationQueueItem = {
      id: crypto.randomUUID(),
      correlationId: context.correlationId,
      context,
      priority,
      status: QueueStatus.PENDING,
      scheduledAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      retryCount: 0,
      maxRetries,
      error: null,
    };

    this.items.push(item);
    this.sortByPriority();

    return item.id;
  }

  async process(): Promise<void> {
    if (this.active) return;
    this.active = true;

    while (this.items.length > 0) {
      while (this.running < this.maxConcurrency && this.items.length > 0) {
        const item = this.dequeueNext();
        if (!item) break;

        this.running++;
        this.executeItem(item).finally(() => {
          this.running--;
        });
      }

      await this.sleep(100);
    }

    this.active = false;
  }

  processNext(): Promise<void> {
    const item = this.dequeueNext();
    if (!item) return Promise.resolve();

    this.running++;
    return this.executeItem(item).finally(() => {
      this.running--;
    });
  }

  private async executeItem(item: OrchestrationQueueItem): Promise<void> {
    item.status = QueueStatus.RUNNING;
    item.startedAt = new Date().toISOString();

    try {
      const result = await executionPipeline.execute(item.context);

      if (result.success) {
        item.status = QueueStatus.COMPLETED;
      } else if (item.retryCount < item.maxRetries) {
        item.retryCount++;
        item.status = QueueStatus.PENDING;
        this.items.push(item);
        this.sortByPriority();
      } else {
        item.status = QueueStatus.FAILED;
        item.error = result.error?.message ?? "Unknown error";
      }
    } catch (err) {
      if (item.retryCount < item.maxRetries) {
        item.retryCount++;
        item.status = QueueStatus.PENDING;
        this.items.push(item);
        this.sortByPriority();
      } else {
        item.status = QueueStatus.FAILED;
        item.error = err instanceof Error ? err.message : "Queue execution error";
      }
    }

    item.completedAt = new Date().toISOString();
  }

  private dequeueNext(): OrchestrationQueueItem | null {
    const idx = this.items.findIndex((i) => i.status === QueueStatus.PENDING);
    if (idx === -1) return null;
    return this.items.splice(idx, 1)[0];
  }

  cancel(id: string): boolean {
    const idx = this.items.findIndex((i) => i.id === id);
    if (idx === -1) return false;
    this.items[idx].status = QueueStatus.CANCELLED;
    return true;
  }

  getStatus(id: string): QueueStatus | null {
    return this.items.find((i) => i.id === id)?.status ?? null;
  }

  get pending(): number {
    return this.items.filter((i) => i.status === QueueStatus.PENDING).length;
  }

  get runningCount(): number {
    return this.running;
  }

  get total(): number {
    return this.items.length;
  }

  setConcurrency(n: number): void {
    this.maxConcurrency = n;
  }

  private sortByPriority(): void {
    const priorityOrder: Record<QueuePriority, number> = { high: 0, normal: 1, low: 2 };
    this.items.sort((a, b) => {
      const pa = priorityOrder[a.priority] ?? 1;
      const pb = priorityOrder[b.priority] ?? 1;
      if (pa !== pb) return pa - pb;
      return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
    });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const orchestrationQueue = new OrchestrationQueue();