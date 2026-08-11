/**
 * Phase 23 — Enterprise Workflow Engine: SLA Engine
 *
 * Deterministic SLA accounting. Targets are expressed in business seconds
 * and measured only across configured working hours/holidays. Status is one
 * of five deterministic values: on-track, at-risk, breached, completed,
 * paused. The engine supports pause/resume and never mutates time itself —
 * it computes from injected wall-clock timestamps.
 */

import type {
  BusinessHoursConfig,
  PausedWindow,
  SlaMetric,
  SlaSpec,
  SlaStatus,
  StepSlaState,
} from "./types";

const MINUTE_MS = 60_000;
const SECOND_MS = 1_000;
const DAY_MS = 86_400_000;

export function dayOfWeekUtc(iso: string): number {
  return new Date(iso).getUTCDay();
}

export function isoDateOnly(iso: string): string {
  return iso.slice(0, 10);
}

export function isHoliday(iso: string, holidays: string[]): boolean {
  return holidays.includes(isoDateOnly(iso));
}

function minutesOfDayLocal(iso: string, utcOffsetMinutes: number): number {
  const ms = new Date(iso).getTime() + utcOffsetMinutes * MINUTE_MS;
  const d = new Date(ms);
  return d.getUTCHours() * 60 + d.getUTCMinutes();
}

interface WorkingWindow {
  day: string;
  startMinutes: number;
  endMinutes: number;
}

function isWorkingMinute(iso: string, cfg: BusinessHoursConfig): boolean {
  const schedule = cfg.weekSchedule[dayOfWeekUtc(iso)];
  if (!schedule) return false;
  if (cfg.holidays && isHoliday(iso, cfg.holidays)) return false;
  const minutes = minutesOfDayLocal(iso, cfg.utcOffsetMinutes);
  return minutes >= schedule.startMinutes && minutes < schedule.endMinutes;
}

/**
 * Business seconds that elapse between two instants under the given hours
 * config. Deterministic: iterates day-by-day, minute-sliced, never rounding.
 */
export function businessSecondsBetween(
  fromIso: string,
  toIso: string,
  cfg: BusinessHoursConfig,
): number {
  if (toIso <= fromIso) return 0;
  let seconds = 0;
  let cursor = new Date(fromIso).getTime();
  const end = new Date(toIso).getTime();

  while (cursor < end) {
    if (isWorkingMinute(new Date(cursor).toISOString(), cfg)) {
      seconds += 1;
    }
    cursor += SECOND_MS;
  }
  return seconds;
}

export function isWorkingMinuteAt(iso: string, cfg: BusinessHoursConfig): boolean {
  return isWorkingMinute(iso, cfg);
}

/**
 * Returns the instant exactly `targetBusinessSeconds` working seconds after
 * `fromIso`. Used to compute the deterministic due timestamp.
 */
export function computeTargetAt(
  fromIso: string,
  targetBusinessSeconds: number,
  cfg: BusinessHoursConfig,
): string {
  if (targetBusinessSeconds <= 0) return fromIso;
  let seconds = 0;
  let cursor = new Date(fromIso).getTime();
  while (seconds < targetBusinessSeconds) {
    cursor += SECOND_MS;
    if (isWorkingMinute(new Date(cursor).toISOString(), cfg)) {
      seconds += 1;
    }
  }
  return new Date(cursor).toISOString();
}

/** Working seconds elapsed from a start, excluding paused windows. */
export function workingSecondsElapsed(
  startsAt: string,
  nowIso: string,
  cfg: BusinessHoursConfig,
  pausedWindows: PausedWindow[],
): number {
  let total = businessSecondsBetween(startsAt, nowIso, cfg);
  for (const w of pausedWindows) {
    total -= businessSecondsBetween(
      w.from,
      w.to > nowIso ? nowIso : w.to,
      cfg,
    );
  }
  return total < 0 ? 0 : total;
}

const AT_RISK_THRESHOLD = 0.8;

export interface SlaEvaluationInput {
  startsAt: string;
  metric: SlaMetric;
  targetBusinessSeconds: number;
  businessHours?: BusinessHoursConfig;
  pausedWindows: PausedWindow[];
  completedAt: string | null;
  nowIso: string;
}

export interface SlaEvaluation {
  status: SlaStatus;
  progress: number;
  dueAt: string | null;
}

/**
 * Deterministic SLA status. Completed wins; an in-progress pause wins over
 * risk; otherwise elapsed/target yields on-track, at-risk (>= 80%), breached.
 */
export function evaluateSla(input: SlaEvaluationInput): SlaEvaluation {
  const { startsAt, metric, targetBusinessSeconds, businessHours, pausedWindows, completedAt, nowIso } =
    input;

  if (completedAt) {
    return { status: "completed", progress: 1, dueAt: null };
  }

  const currentlyPaused =
    pausedWindows.length > 0 && pausedWindows[pausedWindows.length - 1].to === "";

  const seconds = businessHours
    ? workingSecondsElapsed(startsAt, nowIso, businessHours, pausedWindows)
    : rawSecondsElapsed(startsAt, nowIso, pausedWindows);

  if (targetBusinessSeconds <= 0) {
    return { status: currentlyPaused ? "paused" : "on-track", progress: 0, dueAt: null };
  }

  const progress = seconds / targetBusinessSeconds;
  const dueAt = businessHours
    ? computeTargetAt(startsAt, targetBusinessSeconds, businessHours)
    : new Date(new Date(startsAt).getTime() + targetBusinessSeconds * SECOND_MS).toISOString();

  if (currentlyPaused) return { status: "paused", progress, dueAt };
  if (progress >= 1) return { status: "breached", progress, dueAt };
  if (progress >= AT_RISK_THRESHOLD) return { status: "at-risk", progress, dueAt };
  return { status: "on-track", progress, dueAt };
}

function rawSecondsElapsed(
  startsAt: string,
  nowIso: string,
  pausedWindows: PausedWindow[],
): number {
  let total = Math.max(0, (new Date(nowIso).getTime() - new Date(startsAt).getTime()) / SECOND_MS);
  for (const w of pausedWindows) {
    if (w.to === "") {
      total -= Math.max(0, (new Date(nowIso).getTime() - new Date(w.from).getTime()) / SECOND_MS);
    } else {
      total -= Math.max(0, (new Date(w.to).getTime() - new Date(w.from).getTime()) / SECOND_MS);
    }
  }
  return Math.max(0, total);
}

export function initStepSla(spec: SlaSpec, startsAt: string, nowIso: string): StepSlaState {
  const evaluation = evaluateSla({
    startsAt,
    metric: spec.metric,
    targetBusinessSeconds: spec.target,
    businessHours: spec.useBusinessHours ? spec.businessHours : undefined,
    pausedWindows: [],
    completedAt: null,
    nowIso,
  });
  return {
    startsAt,
    metric: spec.metric,
    targetBusinessSeconds: spec.target,
    businessHours: spec.useBusinessHours ? spec.businessHours : undefined,
    pausedWindows: [],
    status: evaluation.status,
    progress: evaluation.progress,
  };
}

export function refreshStepSla(state: StepSlaState, completedAt: string | null, nowIso: string): StepSlaState {
  const evaluation = evaluateSla({
    startsAt: state.startsAt,
    metric: state.metric,
    targetBusinessSeconds: state.targetBusinessSeconds,
    businessHours: state.businessHours,
    pausedWindows: state.pausedWindows,
    completedAt,
    nowIso,
  });
  return { ...state, status: evaluation.status, progress: evaluation.progress };
}

export function pauseStepSla(state: StepSlaState, atIso: string): StepSlaState {
  if (state.currentPauseStart) return state;
  return {
    ...state,
    currentPauseStart: atIso,
    pausedWindows: [...state.pausedWindows, { from: atIso, to: "" }],
    status: "paused",
  };
}

export function resumeStepSla(state: StepSlaState, atIso: string): StepSlaState {
  if (!state.currentPauseStart) return state;
  const windows = state.pausedWindows.map((w) =>
    w.to === "" ? { ...w, to: atIso } : w,
  );
  return {
    ...state,
    currentPauseStart: undefined,
    pausedWindows: windows,
  };
}

export function buildBusinessHours(
  utcOffsetMinutes: number,
  workdays: number[],
  start: string,
  end: string,
  holidays: string[] = [],
): BusinessHoursConfig {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const weekSchedule: Record<number, { startMinutes: number; endMinutes: number } | null> = {
    0: null,
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
    6: null,
  };
  for (const day of workdays) {
    weekSchedule[day] = { startMinutes: sh * 60 + sm, endMinutes: eh * 60 + em };
  }
  return { utcOffsetMinutes, weekSchedule, holidays };
}

export function isWorkingDayAt(iso: string, cfg: BusinessHoursConfig): boolean {
  return isWorkingMinute(iso, cfg);
}

export function isPausedNow(state: StepSlaState): boolean {
  return state.currentPauseStart !== undefined;
}

/** Due timestamp for a step's SLA, or null when completed/undefined. */
export function stepDueAt(state: StepSlaState, nowIso: string): string | null {
  if (state.status === "completed") return null;
  const evaluation = evaluateSla({
    startsAt: state.startsAt,
    metric: state.metric,
    targetBusinessSeconds: state.targetBusinessSeconds,
    businessHours: state.businessHours,
    pausedWindows: state.pausedWindows,
    completedAt: null,
    nowIso,
  });
  return evaluation.dueAt;
}
