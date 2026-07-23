import type { BriefingType, BriefingFrequency, ExecutiveRole } from "./types";
import { BRIEFING_TYPES } from "./types";

interface ScheduledTask {
  companyId: string;
  role: ExecutiveRole;
  type: BriefingType;
  timer: ReturnType<typeof setInterval>;
  lastRun: number;
}

export class BriefingScheduler {
  private tasks = new Map<string, ScheduledTask>();
  private generationHandler: ((companyId: string, role: ExecutiveRole, type: BriefingType) => Promise<void>) | null = null;

  onGeneration(handler: (companyId: string, role: ExecutiveRole, type: BriefingType) => Promise<void>): void {
    this.generationHandler = handler;
  }

  schedule(companyId: string, role: ExecutiveRole, type: BriefingType): void {
    const key = `${companyId}:${role}:${type}`;
    if (this.tasks.has(key)) return;

    const briefingConfig = BRIEFING_TYPES.find((b) => b.type === type);
    if (!briefingConfig) return;

    const now = new Date();
    const nextRun = this.calculateNextRun(briefingConfig.hour, briefingConfig.minute,
      briefingConfig.dayOfWeek, briefingConfig.dayOfMonth);

    const delay = Math.max(0, nextRun.getTime() - now.getTime());

    const timer = setInterval(async () => {
      try {
        await this.generationHandler?.(companyId, role, type);
      } catch {
        // Logged by handler
      }
    }, 86_400_000);

    setTimeout(() => {
      this.generationHandler?.(companyId, role, type);
    }, delay);

    this.tasks.set(key, { companyId, role, type, timer, lastRun: 0 });
  }

  unschedule(companyId: string, role: ExecutiveRole, type: BriefingType): void {
    const key = `${companyId}:${role}:${type}`;
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

  getScheduledCount(): number {
    return this.tasks.size;
  }

  getDueBriefings(): { companyId: string; role: ExecutiveRole; type: BriefingType }[] {
    const now = Date.now();
    const due: { companyId: string; role: ExecutiveRole; type: BriefingType }[] = [];

    for (const task of this.tasks.values()) {
      const briefingConfig = BRIEFING_TYPES.find((b) => b.type === task.type);
      if (!briefingConfig) continue;

      const nextRun = this.calculateNextRun(briefingConfig.hour, briefingConfig.minute,
        briefingConfig.dayOfWeek, briefingConfig.dayOfMonth);

      if (nextRun.getTime() <= now && task.lastRun < nextRun.getTime()) {
        due.push({ companyId: task.companyId, role: task.role, type: task.type });
      }
    }

    return due;
  }

  markRun(companyId: string, role: ExecutiveRole, type: BriefingType): void {
    const key = `${companyId}:${role}:${type}`;
    const task = this.tasks.get(key);
    if (task) {
      task.lastRun = Date.now();
    }
  }

  private calculateNextRun(hour: number, minute: number, dayOfWeek?: number, dayOfMonth?: number): Date {
    const now = new Date();
    const next = new Date(now);
    next.setHours(hour, minute, 0, 0);

    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }

    if (dayOfWeek !== undefined) {
      while (next.getDay() !== dayOfWeek) {
        next.setDate(next.getDate() + 1);
      }
    }

    if (dayOfMonth !== undefined) {
      if (next.getDate() !== dayOfMonth) {
        next.setDate(dayOfMonth);
        if (next <= now) {
          next.setMonth(next.getMonth() + 1);
        }
      }
    }

    return next;
  }
}

export const briefingScheduler = new BriefingScheduler();
