import type { WorkloadEstimate } from "./types";

export const HANDLING_DURATIONS = {
  highPriorityReviewMinutes: 12,
  mediumPriorityReviewMinutes: 5,
  quickApprovalMinutes: 1,
  exceptionResolutionMinutes: 8,
} as const;

export function estimateWorkload(
  highPriorityCount: number,
  mediumPriorityCount: number,
  quickApprovalCount: number,
  exceptionCount: number,
): WorkloadEstimate {
  const totalTasks = highPriorityCount + mediumPriorityCount + quickApprovalCount + exceptionCount;

  const estimatedMinutes =
    highPriorityCount * HANDLING_DURATIONS.highPriorityReviewMinutes +
    mediumPriorityCount * HANDLING_DURATIONS.mediumPriorityReviewMinutes +
    quickApprovalCount * HANDLING_DURATIONS.quickApprovalMinutes +
    exceptionCount * HANDLING_DURATIONS.exceptionResolutionMinutes;

  const highPriorityPercentage = totalTasks > 0
    ? Math.round(((highPriorityCount + exceptionCount) / totalTasks) * 100)
    : 0;

  return { estimatedMinutes, highPriorityPercentage };
}

export function formatEstimatedMinutes(minutes: number): string {
  if (minutes < 1) return "<1 min";
  if (minutes < 60) return `~${Math.round(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (mins === 0) return `~${hours}h`;
  return `~${hours}h ${mins}m`;
}
