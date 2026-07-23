import type { PredictionCategory } from "./types";

interface ScheduledTask {
  companyId: string;
  category?: PredictionCategory;
  intervalMs: number;
  timer: ReturnType<typeof setInterval>;
  lastRun: number;
  handler: () => Promise<void>;
}

export class PredictionScheduler {
  private tasks = new Map<string, ScheduledTask>();

  schedule(companyId: string, handler: () => Promise<void>, label: string, intervalMs = 3_600_000): void {
    const key = `${companyId}:${label}`;
    if (this.tasks.has(key)) return;

    const timer = setInterval(async () => {
      try {
        await handler();
      } catch {
        // Errors handled by caller
      }
    }, intervalMs);

    this.tasks.set(key, { companyId, intervalMs, timer, lastRun: 0, handler });
  }

  scheduleImmediate(companyId: string, handler: () => Promise<void>, label: string): void {
    const key = `${companyId}:${label}`;
    if (this.tasks.has(key)) return;

    setTimeout(async () => {
      try {
        await handler();
      } catch {
        // Errors handled by caller
      }
    }, 5_000);

    const timer = setInterval(async () => {
      try {
        await handler();
      } catch {
        // Errors handled by caller
      }
    }, 3_600_000);

    this.tasks.set(key, { companyId, intervalMs: 3_600_000, timer, lastRun: 0, handler });
  }

  unschedule(companyId: string, label: string): void {
    const key = `${companyId}:${label}`;
    const task = this.tasks.get(key);
    if (task) {
      clearInterval(task.timer);
      this.tasks.delete(key);
    }
  }

  unscheduleAll(companyId: string): void {
    for (const [key, task] of this.tasks) {
      if (task.companyId === companyId) {
        clearInterval(task.timer);
        this.tasks.delete(key);
      }
    }
  }

  getTaskCount(): number {
    return this.tasks.size;
  }
}

export const predictionScheduler = new PredictionScheduler();
