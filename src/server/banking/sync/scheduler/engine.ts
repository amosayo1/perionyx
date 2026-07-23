import type { SyncScheduleConfig, SyncScheduleFrequency, SyncTrigger, SyncMode, SyncScope, SyncRetryPolicy, HistoricalRange } from "../types";

export interface ScheduledSync {
  scheduleId: string;
  connectionId: string;
  companyId: string;
  legalEntityId?: string;
  frequency: SyncScheduleFrequency;
  cronExpression?: string;
  mode: SyncMode;
  trigger: SyncTrigger;
  scope: SyncScope;
  accountIds: string[];
  historicalRange?: HistoricalRange;
  retryPolicy: SyncRetryPolicy;
  nextRunAt: Date;
  lastRunAt: Date | null;
  enabled: boolean;
}

export class SyncScheduler {
  private schedules = new Map<string, ScheduledSync>();
  private timers = new Map<string, ReturnType<typeof setInterval>>();

  register(config: SyncScheduleConfig): ScheduledSync {
    const existing = this.schedules.get(config.connectionId);
    if (existing) {
      this.remove(config.connectionId);
    }

    const nextRun = this.calculateNextRun(config.frequency, config.cronExpression);

    const schedule: ScheduledSync = {
      scheduleId: config.connectionId,
      connectionId: config.connectionId,
      companyId: config.companyId,
      legalEntityId: config.legalEntityId,
      frequency: config.frequency,
      cronExpression: config.cronExpression,
      mode: config.mode,
      trigger: config.trigger,
      scope: config.scope,
      accountIds: config.accountIds,
      historicalRange: config.historicalRange,
      retryPolicy: config.retryPolicy,
      nextRunAt: nextRun,
      lastRunAt: null,
      enabled: config.enabled,
    };

    this.schedules.set(config.connectionId, schedule);

    if (schedule.enabled && schedule.frequency !== "MANUAL") {
      this.scheduleTimer(schedule);
    }

    return schedule;
  }

  private scheduleTimer(schedule: ScheduledSync): void {
    const intervalMs = this.getIntervalMs(schedule.frequency);
    if (intervalMs <= 0) return;

    const timer = setInterval(() => {
      const current = this.schedules.get(schedule.connectionId);
      if (!current || !current.enabled) {
        this.removeTimer(schedule.connectionId);
        return;
      }
      current.lastRunAt = current.nextRunAt;
      current.nextRunAt = this.calculateNextRun(current.frequency, current.cronExpression);
      this.schedules.set(schedule.connectionId, { ...current });
    }, intervalMs);

    this.timers.set(schedule.connectionId, timer);
  }

  private removeTimer(connectionId: string): void {
    const timer = this.timers.get(connectionId);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(connectionId);
    }
  }

  private getIntervalMs(frequency: SyncScheduleFrequency): number {
    switch (frequency) {
      case "EVERY_15_MINUTES": return 15 * 60 * 1000;
      case "HOURLY": return 60 * 60 * 1000;
      case "EVERY_6_HOURS": return 6 * 60 * 60 * 1000;
      case "DAILY": return 24 * 60 * 60 * 1000;
      case "WEEKLY": return 7 * 24 * 60 * 60 * 1000;
      case "CUSTOM_CRON": return 0;
      default: return 0;
    }
  }

  private calculateNextRun(frequency: SyncScheduleFrequency, cronExpression?: string): Date {
    if (frequency === "MANUAL") return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    if (frequency === "CUSTOM_CRON" && cronExpression) {
      return new Date(Date.now() + 60 * 60 * 1000);
    }
    const intervalMs = this.getIntervalMs(frequency);
    return new Date(Date.now() + intervalMs);
  }

  enable(connectionId: string): ScheduledSync | null {
    const schedule = this.schedules.get(connectionId);
    if (!schedule) return null;

    schedule.enabled = true;
    this.schedules.set(connectionId, { ...schedule });
    this.scheduleTimer(schedule);
    return schedule;
  }

  disable(connectionId: string): ScheduledSync | null {
    const schedule = this.schedules.get(connectionId);
    if (!schedule) return null;

    schedule.enabled = false;
    this.schedules.set(connectionId, { ...schedule });
    this.removeTimer(connectionId);
    return schedule;
  }

  remove(connectionId: string): void {
    this.removeTimer(connectionId);
    this.schedules.delete(connectionId);
  }

  getSchedule(connectionId: string): ScheduledSync | null {
    return this.schedules.get(connectionId) ?? null;
  }

  getDueSchedules(): ScheduledSync[] {
    const now = Date.now();
    return Array.from(this.schedules.values()).filter(
      (s) => s.enabled && s.nextRunAt.getTime() <= now,
    );
  }

  getAllSchedules(): ScheduledSync[] {
    return Array.from(this.schedules.values());
  }

  getSchedulesByCompany(companyId: string): ScheduledSync[] {
    return this.getAllSchedules().filter((s) => s.companyId === companyId);
  }

  getSchedulesByEntity(legalEntityId: string): ScheduledSync[] {
    return this.getAllSchedules().filter((s) => s.legalEntityId === legalEntityId);
  }

  updateLastRun(connectionId: string): void {
    const schedule = this.schedules.get(connectionId);
    if (!schedule) return;

    schedule.lastRunAt = new Date();
    schedule.nextRunAt = this.calculateNextRun(schedule.frequency, schedule.cronExpression);
    this.schedules.set(connectionId, { ...schedule });
  }

  getScheduledCount(): number {
    return this.schedules.size;
  }
}

export const syncScheduler = new SyncScheduler();