import type { SyncSchedule, SyncMode, SyncDirection, SyncOptions } from "./types";

const schedules = new Map<string, SyncSchedule>();
const companySchedules = new Map<string, Set<string>>();
const timers = new Map<string, ReturnType<typeof setInterval>>();

export function createSchedule(params: {
  connectionId: string;
  companyId: string;
  mode: SyncMode;
  direction: SyncDirection;
  options: SyncOptions;
  cronExpression?: string;
  intervalMs?: number;
  priority?: number;
}): SyncSchedule {
  const schedule: SyncSchedule = {
    id: crypto.randomUUID(),
    connectionId: params.connectionId,
    companyId: params.companyId,
    mode: params.mode,
    direction: params.direction,
    cronExpression: params.cronExpression,
    intervalMs: params.intervalMs,
    priority: params.priority ?? 0,
    active: true,
    options: params.options,
    nextRunAt: calculateNextRun(params.cronExpression, params.intervalMs),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  schedules.set(schedule.id, schedule);

  if (!companySchedules.has(params.companyId)) {
    companySchedules.set(params.companyId, new Set());
  }
  companySchedules.get(params.companyId)!.add(schedule.id);

  return schedule;
}

export function getSchedule(scheduleId: string): SyncSchedule | undefined {
  return schedules.get(scheduleId);
}

export function updateSchedule(
  scheduleId: string,
  updates: Partial<SyncSchedule>,
): SyncSchedule | undefined {
  const schedule = schedules.get(scheduleId);
  if (!schedule) return undefined;

  Object.assign(schedule, updates, { updatedAt: new Date() });

  if (updates.cronExpression || updates.intervalMs) {
    schedule.nextRunAt = calculateNextRun(schedule.cronExpression, schedule.intervalMs);
  }

  return schedule;
}

export function deleteSchedule(scheduleId: string): void {
  const schedule = schedules.get(scheduleId);
  if (schedule) {
    stopTimer(scheduleId);
    schedules.delete(scheduleId);
    companySchedules.get(schedule.companyId)?.delete(scheduleId);
  }
}

export function getCompanySchedules(companyId: string): SyncSchedule[] {
  const ids = companySchedules.get(companyId);
  if (!ids) return [];
  return Array.from(ids)
    .map((id) => schedules.get(id))
    .filter((s): s is SyncSchedule => s !== undefined)
    .sort((a, b) => b.priority - a.priority);
}

export function getConnectionSchedules(connectionId: string): SyncSchedule[] {
  return Array.from(schedules.values())
    .filter((s) => s.connectionId === connectionId)
    .sort((a, b) => b.priority - a.priority);
}

export function activateSchedule(scheduleId: string): void {
  updateSchedule(scheduleId, { active: true });
}

export function deactivateSchedule(scheduleId: string): void {
  updateSchedule(scheduleId, { active: false });
  stopTimer(scheduleId);
}

export function markScheduleRun(scheduleId: string): void {
  const schedule = schedules.get(scheduleId);
  if (!schedule) return;
  schedule.lastRunAt = new Date();
  schedule.nextRunAt = calculateNextRun(schedule.cronExpression, schedule.intervalMs);
}

export function startTimer(
  scheduleId: string,
  callback: () => void | Promise<void>,
): void {
  const schedule = schedules.get(scheduleId);
  if (!schedule || !schedule.intervalMs) return;

  stopTimer(scheduleId);
  const timer = setInterval(callback, schedule.intervalMs);
  timers.set(scheduleId, timer);
}

export function stopTimer(scheduleId: string): void {
  const timer = timers.get(scheduleId);
  if (timer) {
    clearInterval(timer);
    timers.delete(scheduleId);
  }
}

export function getDueSchedules(): SyncSchedule[] {
  const now = new Date();
  return Array.from(schedules.values()).filter(
    (s) => s.active && s.nextRunAt && s.nextRunAt <= now,
  );
}

export function getOverdueSchedules(): SyncSchedule[] {
  const now = new Date();
  return Array.from(schedules.values()).filter(
    (s) => s.active && s.nextRunAt && s.nextRunAt < now,
  );
}

function calculateNextRun(
  cronExpression?: string,
  intervalMs?: number,
): Date | undefined {
  if (intervalMs) {
    return new Date(Date.now() + intervalMs);
  }
  if (cronExpression) {
    return parseCronNext(cronExpression);
  }
  return undefined;
}

function parseCronNext(_expression: string): Date {
  return new Date(Date.now() + 3600000);
}

export function clearAllSchedules(): void {
  for (const [id] of timers) {
    stopTimer(id);
  }
  schedules.clear();
  companySchedules.clear();
}
