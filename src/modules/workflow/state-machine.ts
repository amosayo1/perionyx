import type { WorkflowStatus } from "./types";

export type StateTransitionResult = {
  valid: boolean;
  message: string;
};

export class WorkflowStateMachine {
  private static readonly VALID_TRANSITIONS: Record<WorkflowStatus, WorkflowStatus[]> = {
    PENDING: ["VALIDATED", "CANCELLED", "FAILED"],
    VALIDATED: ["RUNNING", "CANCELLED", "FAILED"],
    RUNNING: ["COMPLETED", "FAILED", "WAITING", "PAUSED", "CANCELLED"],
    WAITING: ["RUNNING", "CANCELLED", "FAILED"],
    PAUSED: ["RUNNING", "CANCELLED"],
    COMPLETED: ["ARCHIVED"],
    FAILED: ["PENDING", "ARCHIVED"],
    CANCELLED: ["ARCHIVED"],
    ARCHIVED: [],
  };

  private static readonly TERMINAL_STATES: Set<WorkflowStatus> = new Set(["COMPLETED", "CANCELLED", "ARCHIVED"]);

  static isValidTransition(from: WorkflowStatus, to: WorkflowStatus): boolean {
    const allowed = this.VALID_TRANSITIONS[from] ?? [];
    return allowed.includes(to);
  }

  static transition(from: WorkflowStatus, to: WorkflowStatus): StateTransitionResult {
    if (from === to) {
      return { valid: false, message: `Workflow is already in ${from} state` };
    }
    if (!this.isValidTransition(from, to)) {
      return {
        valid: false,
        message: `Cannot transition from ${from} to ${to}. Allowed transitions: ${(this.VALID_TRANSITIONS[from] ?? []).join(", ") || "none"}`,
      };
    }
    return { valid: true, message: `Transition ${from} → ${to} allowed` };
  }

  static getAllowedTransitions(from: WorkflowStatus): WorkflowStatus[] {
    return [...(this.VALID_TRANSITIONS[from] ?? [])];
  }

  static isTerminal(status: WorkflowStatus): boolean {
    return this.TERMINAL_STATES.has(status);
  }

  static isActive(status: WorkflowStatus): boolean {
    return !this.TERMINAL_STATES.has(status) && status !== "PENDING";
  }

  static canTransition(from: WorkflowStatus): boolean {
    return (this.VALID_TRANSITIONS[from]?.length ?? 0) > 0;
  }
}
