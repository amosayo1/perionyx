import { integrationRegistry } from "./integration-registry";
import { startSync } from "./sync-manager";
import type { SyncType, SyncDirection } from "./types";

export type ScheduledJob = {
  id: string;
  connectionId: string;
  companyId: string;
  cronExpression: string;
  syncType: SyncType;
  syncDirection: SyncDirection;
  active: boolean;
  lastRunAt: Date | null;
  nextRunAt: Date;
  createdAt: Date;
};

const scheduledJobs = new Map<string, ScheduledJob>();
const companyJobs = new Map<string, Set<string>>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();

function parseCronExpression(cron: string): number[] {
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) {
    throw new Error(`Invalid cron expression: "${cron}". Expected 5 fields.`);
  }

  const minute = parseCronField(parts[0], 0, 59);
  const hour = parseCronField(parts[1], 0, 23);
  const dayOfMonth = parseCronField(parts[2], 1, 31);
  const month = parseCronField(parts[3], 1, 12);
  const dayOfWeek = parseCronField(parts[4], 0, 7);

  return [minute[0] ?? 0, hour[0] ?? 0, dayOfMonth[0] ?? 1, month[0] ?? 1, dayOfWeek[0] ?? 0];
}

function parseCronField(field: string, min: number, max: number): number[] {
  if (field === "*") {
    return Array.from({ length: max - min + 1 }, (_, i) => i + min);
  }

  const values: number[] = [];

  const parts = field.split(",");
  for (const part of parts) {
    if (part.includes("/")) {
      const [range, stepStr] = part.split("/");
      const step = parseInt(stepStr, 10);
      let start = min;
      let end = max;
      if (range !== "*") {
        const [s, e] = range.split("-");
        start = parseInt(s, 10);
        end = e ? parseInt(e, 10) : max;
      }
      for (let i = start; i <= end; i += step) {
        values.push(i);
      }
    } else if (part.includes("-")) {
      const [s, e] = part.split("-");
      const start = parseInt(s, 10);
      const end = parseInt(e, 10);
      for (let i = start; i <= end; i++) {
        values.push(i);
      }
    } else {
      values.push(parseInt(part, 10));
    }
  }

  return values;
}

function calculateNextRun(cronExpression: string): Date {
  const [minute, hour, dayOfMonth, month, dayOfWeek] = parseCronExpression(cronExpression);
  const now = new Date();
  const next = new Date(now);

  if (next.getMinutes() < minute) {
    next.setMinutes(minute, 0, 0);
  } else {
    next.setHours(next.getHours() + 1, minute, 0, 0);
  }

  if (next.getHours() !== hour) {
    next.setHours(hour, minute, 0, 0);
    next.setDate(next.getDate() + (dayOfMonth > next.getDate() ? 0 : 1));
  }

  return next;
}

export function schedule(
  connectionId: string,
  cronExpression: string,
  syncType: SyncType,
  syncDirection: SyncDirection = "import",
): ScheduledJob {
  const connection = integrationRegistry.getConnection(connectionId);
  if (!connection) {
    throw new Error(`Connection ${connectionId} not found`);
  }

  const nextRun = calculateNextRun(cronExpression);
  const job: ScheduledJob = {
    id: crypto.randomUUID(),
    connectionId,
    companyId: connection.companyId,
    cronExpression,
    syncType,
    syncDirection,
    active: true,
    lastRunAt: null,
    nextRunAt: nextRun,
    createdAt: new Date(),
  };

  scheduledJobs.set(job.id, job);

  if (!companyJobs.has(connection.companyId)) {
    companyJobs.set(connection.companyId, new Set());
  }
  companyJobs.get(connection.companyId)!.add(job.id);

  scheduleTimer(job);
  return job;
}

export function unschedule(jobId: string): void {
  const job = scheduledJobs.get(jobId);
  if (job) {
    scheduledJobs.delete(jobId);
    companyJobs.get(job.companyId)?.delete(jobId);
    const timer = timers.get(jobId);
    if (timer) {
      clearTimeout(timer);
      timers.delete(jobId);
    }
  }
}

export function listScheduledJobs(companyId: string): ScheduledJob[] {
  const ids = companyJobs.get(companyId) ?? new Set();
  return Array.from(ids)
    .map((id) => scheduledJobs.get(id))
    .filter((j): j is ScheduledJob => j !== undefined);
}

export function getDueJobs(): ScheduledJob[] {
  const now = Date.now();
  return Array.from(scheduledJobs.values()).filter(
    (job) => job.active && job.nextRunAt.getTime() <= now,
  );
}

function scheduleTimer(job: ScheduledJob): void {
  const existing = timers.get(job.id);
  if (existing) clearTimeout(existing);

  const delay = Math.max(0, job.nextRunAt.getTime() - Date.now());

  const timer = setTimeout(async () => {
    try {
      if (job.active) {
        await startSync(job.connectionId, job.syncType, job.syncDirection);
        job.lastRunAt = new Date();
        job.nextRunAt = calculateNextRun(job.cronExpression);
        scheduledJobs.set(job.id, job);
        scheduleTimer(job);
      }
    } catch {
      job.nextRunAt = new Date(Date.now() + 60000);
      scheduledJobs.set(job.id, job);
      scheduleTimer(job);
    }
  }, delay);

  timers.set(job.id, timer);
}

export function getScheduledJob(jobId: string): ScheduledJob | undefined {
  return scheduledJobs.get(jobId);
}

export function pauseJob(jobId: string): void {
  const job = scheduledJobs.get(jobId);
  if (job) {
    job.active = false;
    const timer = timers.get(jobId);
    if (timer) clearTimeout(timer);
    scheduledJobs.set(jobId, job);
  }
}

export function resumeJob(jobId: string): void {
  const job = scheduledJobs.get(jobId);
  if (job) {
    job.active = true;
    job.nextRunAt = calculateNextRun(job.cronExpression);
    scheduledJobs.set(jobId, job);
    scheduleTimer(job);
  }
}

export function getAllScheduledJobs(): ScheduledJob[] {
  return Array.from(scheduledJobs.values());
}

export function clearAllJobs(): void {
  for (const timer of timers.values()) {
    clearTimeout(timer);
  }
  timers.clear();
  scheduledJobs.clear();
  companyJobs.clear();
}
