import { CronExpressionParser } from "cron-parser";
import {
  enqueue,
  scheduleCron,
  unscheduleCron,
  registerHandler,
} from "@/modules/queue/queue.service";
import type { SendOptions } from "pg-boss";
import { logger } from "@/lib/logger";
import type {
  AutomationSchedule,
  CreateScheduleInput,
  UpdateScheduleInput,
  ScheduleTriggerType,
} from "./types";

const SCHEDULER_QUEUE_PREFIX = "automation-schedule:";

function toQueueName(schedule: AutomationSchedule): string {
  return `${SCHEDULER_QUEUE_PREFIX}${schedule.id}`;
}

export interface ScheduledExecutionPayload {
  scheduleId: string;
  templateId: string | null;
  blueprintId: string | null;
  input: Record<string, unknown> | null;
  companyId: string;
  triggeredBy: ScheduleTriggerType;
}

export type ScheduleEventHandler = (
  payload: ScheduledExecutionPayload,
) => Promise<void>;

export class AutomationScheduler {
  private schedules = new Map<string, AutomationSchedule>();
  private eventHandlers = new Map<string, ScheduleEventHandler>();
  private cronRegistrations = new Map<string, string>();
  private defaultHandler: ScheduleEventHandler | null = null;

  setDefaultHandler(handler: ScheduleEventHandler): void {
    this.defaultHandler = handler;
  }

  registerEventHandler(eventType: string, handler: ScheduleEventHandler): void {
    this.eventHandlers.set(eventType, handler);
  }

  unregisterEventHandler(eventType: string): boolean {
    return this.eventHandlers.delete(eventType);
  }

  // ── Schedule CRUD ─────────────────────────────────────────────────────

  createSchedule(data: CreateScheduleInput): AutomationSchedule {
    const now = new Date().toISOString();
    const schedule: AutomationSchedule = {
      id: crypto.randomUUID(),
      companyId: "",
      templateId: data.templateId ?? null,
      blueprintId: data.blueprintId ?? null,
      name: data.name,
      triggerType: data.triggerType,
      cronExpression: data.cronExpression ?? null,
      startAt: data.startAt ?? null,
      eventSource: data.eventSource ?? null,
      eventType: data.eventType ?? null,
      input: data.input ?? null,
      enabled: data.enabled ?? true,
      lastRunAt: null,
      nextRunAt: null,
      createdBy: "",
      createdAt: now,
      updatedAt: now,
    };
    this.schedules.set(schedule.id, schedule);
    return schedule;
  }

  registerSchedule(schedule: AutomationSchedule): void {
    this.schedules.set(schedule.id, schedule);
    this.syncCronRegistration(schedule);
  }

  getSchedule(id: string): AutomationSchedule | undefined {
    return this.schedules.get(id);
  }

  listSchedules(companyId: string, templateId?: string): AutomationSchedule[] {
    return Array.from(this.schedules.values()).filter(
      (s) =>
        s.companyId === companyId &&
        (!templateId || s.templateId === templateId),
    );
  }

  updateSchedule(id: string, data: UpdateScheduleInput): AutomationSchedule | null {
    const existing = this.schedules.get(id);
    if (!existing) return null;

    const updated: AutomationSchedule = {
      ...existing,
      triggerType: data.triggerType ?? existing.triggerType,
      cronExpression: data.cronExpression ?? existing.cronExpression,
      startAt: data.startAt ?? existing.startAt,
      eventSource: data.eventSource ?? existing.eventSource,
      eventType: data.eventType ?? existing.eventType,
      input: data.input ?? existing.input,
      enabled: data.enabled ?? existing.enabled,
      updatedAt: new Date().toISOString(),
    };
    this.schedules.set(id, updated);
    this.syncCronRegistration(updated);
    return updated;
  }

  deleteSchedule(id: string): boolean {
    const existing = this.schedules.get(id);
    if (existing) {
      this.removeCronRegistration(existing);
    }
    return this.schedules.delete(id);
  }

  setCompanyId(id: string, companyId: string): void {
    const existing = this.schedules.get(id);
    if (existing) {
      existing.companyId = companyId;
    }
  }

  // ── Trigger Execution ─────────────────────────────────────────────────

  async triggerImmediate(schedule: AutomationSchedule): Promise<string | null> {
    const payload: ScheduledExecutionPayload = {
      scheduleId: schedule.id,
      templateId: schedule.templateId,
      blueprintId: schedule.blueprintId,
      input: schedule.input,
      companyId: schedule.companyId,
      triggeredBy: "immediate",
    };

    schedule.lastRunAt = new Date().toISOString();
    return enqueue(toQueueName(schedule), payload);
  }

  async triggerScheduled(
    schedule: AutomationSchedule,
    scheduledFor: Date,
  ): Promise<string | null> {
    const payload: ScheduledExecutionPayload = {
      scheduleId: schedule.id,
      templateId: schedule.templateId,
      blueprintId: schedule.blueprintId,
      input: schedule.input,
      companyId: schedule.companyId,
      triggeredBy: "scheduled",
    };

    const options: SendOptions = { startAfter: scheduledFor };
    return enqueue(toQueueName(schedule), payload, options);
  }

  async triggerDelayed(
    schedule: AutomationSchedule,
    delayMinutes: number,
  ): Promise<string | null> {
    const scheduledFor = new Date(Date.now() + delayMinutes * 60 * 1000);
    return this.triggerScheduled(schedule, scheduledFor);
  }

  async triggerEvent(
    eventType: string,
    context: Record<string, unknown>,
    companyId: string,
  ): Promise<void> {
    const matching = Array.from(this.schedules.values()).filter(
      (s) =>
        s.enabled &&
        s.triggerType.endsWith("_event") &&
        (s.eventType === eventType || s.eventType === null) &&
        (s.companyId === companyId || !s.companyId),
    );

    for (const schedule of matching) {
      const payload: ScheduledExecutionPayload = {
        scheduleId: schedule.id,
        templateId: schedule.templateId,
        blueprintId: schedule.blueprintId,
        input: { ...(schedule.input ?? {}), ...context },
        companyId: schedule.companyId,
        triggeredBy: schedule.triggerType as ScheduleTriggerType,
      };

      const handler = this.eventHandlers.get(eventType) ?? this.defaultHandler;
      if (handler) {
        await handler(payload).catch((err) => {
          logger.error(err, "[AutomationScheduler] Event handler failed for %s", eventType);
        });
      } else {
        await enqueue(toQueueName(schedule), payload);
      }

      schedule.lastRunAt = new Date().toISOString();
    }
  }

  // ── Cron Registration ─────────────────────────────────────────────────

  private async syncCronRegistration(schedule: AutomationSchedule): Promise<void> {
    this.removeCronRegistration(schedule);

    if (!schedule.enabled) return;
    if (schedule.triggerType !== "cron" || !schedule.cronExpression) return;

    const name = toQueueName(schedule);

    try {
      await scheduleCron(name, schedule.cronExpression, {
        scheduleId: schedule.id,
        templateId: schedule.templateId,
        blueprintId: schedule.blueprintId,
        input: schedule.input,
        companyId: schedule.companyId,
        triggeredBy: "cron",
      } as ScheduledExecutionPayload);

      this.cronRegistrations.set(schedule.id, name);

      this.rescheduleListener(name, schedule);
    } catch (err) {
      logger.error(err, "[AutomationScheduler] Failed to register cron for %s", schedule.name);
    }
  }

  private removeCronRegistration(schedule: AutomationSchedule): void {
    const existing = this.cronRegistrations.get(schedule.id);
    if (existing) {
      unscheduleCron(existing).catch((err) => {
        logger.warn(err, "[AutomationScheduler] Failed to unschedule %s", existing);
      });
      this.cronRegistrations.delete(schedule.id);
    }
  }

  private rescheduleListener(
    queueName: string,
    schedule: AutomationSchedule,
  ): void {
    const handler = this.defaultHandler;
    if (!handler) return;

    const cronExpression = schedule.cronExpression;
    if (!cronExpression) return;

    registerHandler(queueName, async (job) => {
      const data = job.data as ScheduledExecutionPayload;
      schedule.lastRunAt = new Date().toISOString();
      schedule.nextRunAt = this.getNextCronRun(cronExpression).toISOString();
      await handler(data).catch((err: Error) => {
        logger.error(err, "[AutomationScheduler] Cron handler failed for %s", queueName);
      });
    });
  }

  // ── Bulk Sync ─────────────────────────────────────────────────────────

  async syncAllSchedules(): Promise<void> {
    for (const schedule of this.schedules.values()) {
      await this.syncCronRegistration(schedule);
    }
  }

  disableSchedule(id: string): AutomationSchedule | null {
    const existing = this.schedules.get(id);
    if (!existing) return null;
    existing.enabled = false;
    this.removeCronRegistration(existing);
    return existing;
  }

  enableSchedule(id: string): AutomationSchedule | null {
    const existing = this.schedules.get(id);
    if (!existing) return null;
    existing.enabled = true;
    this.syncCronRegistration(existing);
    return existing;
  }

  // ── Helpers ───────────────────────────────────────────────────────────

  private getNextCronRun(cronExpression: string): Date {
    try {
      const interval = CronExpressionParser.parse(cronExpression);
      return interval.next().toDate();
    } catch {
      return new Date(Date.now() + 60 * 1000);
    }
  }

  getActiveScheduleCount(): number {
    return Array.from(this.schedules.values()).filter((s) => s.enabled).length;
  }

  getStats(): { total: number; enabled: number; cron: number; event: number } {
    const all = Array.from(this.schedules.values());
    return {
      total: all.length,
      enabled: all.filter((s) => s.enabled).length,
      cron: all.filter((s) => s.triggerType === "cron").length,
      event: all.filter((s) => s.triggerType.endsWith("_event")).length,
    };
  }
}

export const automationScheduler = new AutomationScheduler();
