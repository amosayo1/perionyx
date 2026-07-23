import type {
  OnboardingSession,
  OnboardingSessionStatus,
  OnboardingStepId,
  OnboardingStepRecord,
  OnboardingStepStatus,
  StepExecutionResult,
} from "./types";

export type StateTransition =
  | { type: "START_SESSION" }
  | { type: "ADVANCE_STEP"; stepId: OnboardingStepId }
  | { type: "COMPLETE_STEP"; stepId: OnboardingStepId }
  | { type: "FAIL_STEP"; stepId: OnboardingStepId }
  | { type: "SKIP_STEP"; stepId: OnboardingStepId }
  | { type: "COMPLETE_SESSION" }
  | { type: "ABANDON_SESSION" };

type AllowedTransition = {
  from: OnboardingSessionStatus[];
  to: OnboardingSessionStatus;
};

const SESSION_TRANSITIONS: AllowedTransition[] = [
  { from: ["NOT_STARTED"], to: "IN_PROGRESS" },
  { from: ["IN_PROGRESS"], to: "COMPLETED" },
  { from: ["IN_PROGRESS"], to: "ABANDONED" },
];

const STEP_TRANSITIONS: Record<OnboardingStepStatus, OnboardingStepStatus[]> = {
  PENDING: ["IN_PROGRESS"],
  IN_PROGRESS: ["COMPLETED", "FAILED", "SKIPPED"],
  COMPLETED: [],
  SKIPPED: [],
  FAILED: ["IN_PROGRESS"],
};

export class OnboardingStateMachine {
  canTransitionSession(current: OnboardingSessionStatus, target: OnboardingSessionStatus): boolean {
    return SESSION_TRANSITIONS.some((t) => t.from.includes(current) && t.to === target);
  }

  canTransitionStep(current: OnboardingStepStatus, target: OnboardingStepStatus): boolean {
    const allowed = STEP_TRANSITIONS[current];
    return allowed?.includes(target) ?? false;
  }

  transitionSession(session: OnboardingSession, target: OnboardingSessionStatus): OnboardingSession {
    if (!this.canTransitionSession(session.status, target)) {
      throw new Error(
        `Cannot transition session from ${session.status} to ${target}`,
      );
    }
    return { ...session, status: target, updatedAt: new Date().toISOString() };
  }

  transitionStep(
    record: OnboardingStepRecord,
    target: OnboardingStepStatus,
    result?: StepExecutionResult,
  ): OnboardingStepRecord {
    if (!this.canTransitionStep(record.status, target)) {
      throw new Error(
        `Cannot transition step ${record.stepId} from ${record.status} to ${target}`,
      );
    }

    const now = new Date().toISOString();
    return {
      ...record,
      status: target,
      startedAt: target === "IN_PROGRESS" ? (record.startedAt ?? now) : record.startedAt,
      completedAt: target === "COMPLETED" ? now : record.completedAt,
      skippedAt: target === "SKIPPED" ? now : record.skippedAt,
      error: target === "FAILED" ? (result?.error ?? record.error) : record.error,
      metadata: result?.metadata ?? record.metadata,
    };
  }

  isComplete(session: OnboardingSession, requiredStepIds: OnboardingStepId[]): boolean {
    return requiredStepIds.every((stepId) => {
      const record = session.steps.find((s) => s.stepId === stepId);
      return record?.status === "COMPLETED";
    });
  }
}
