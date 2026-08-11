/**
 * Phase 23 — Enterprise Workflow Engine: State Machine
 *
 * Deterministic 11-state lifecycle. Every transition must be legal,
 * explicitly named, and audited. A transition is a pure function:
 * the same (from, to, actor, context) always yields the same verdict.
 */

import type { WorkflowState } from "./types";
import { WORKFLOW_STATES } from "./types";

export const LEGAL_TRANSITIONS: Record<WorkflowState, readonly WorkflowState[]> = {
  created: ["assigned", "cancelled"],
  assigned: ["accepted", "in-progress", "escalated", "delegated", "blocked", "cancelled"],
  accepted: ["in-progress", "assigned", "escalated", "delegated", "blocked", "cancelled"],
  "in-progress": ["completed", "waiting", "blocked", "escalated", "delegated", "assigned", "cancelled"],
  waiting: ["in-progress", "blocked", "cancelled"],
  blocked: ["in-progress", "assigned", "escalated", "delegated", "cancelled"],
  escalated: ["in-progress", "assigned", "delegated", "blocked", "cancelled"],
  delegated: ["accepted", "in-progress", "escalated", "blocked", "assigned", "cancelled"],
  completed: ["closed"],
  cancelled: ["closed"],
  closed: [],
};

export function isKnownState(state: string): state is WorkflowState {
  return (WORKFLOW_STATES as readonly string[]).includes(state);
}

export function canTransition(from: WorkflowState, to: WorkflowState): boolean {
  return LEGAL_TRANSITIONS[from].includes(to);
}

export interface TransitionAttempt {
  from: WorkflowState;
  to: WorkflowState;
}

export function assertLegalTransition(from: WorkflowState, to: WorkflowState): void {
  if (!isKnownState(from) || !isKnownState(to)) {
    throw new Error(`Unknown workflow state in transition: ${String(from)} → ${String(to)}`);
  }
  if (from === to) {
    throw new Error(`Reflexive transition is not allowed: ${from} → ${to}`);
  }
  if (!canTransition(from, to)) {
    throw new Error(`Illegal workflow transition: ${from} → ${to}`);
  }
}

/** Exhaustive list of every legal (from, to) pair — used by tests/docs. */
export function legalTransitionPairs(): TransitionAttempt[] {
  const pairs: TransitionAttempt[] = [];
  for (const from of WORKFLOW_STATES) {
    for (const to of LEGAL_TRANSITIONS[from]) {
      pairs.push({ from, to });
    }
  }
  return pairs;
}

/** Deterministic dominant-state ranking for multi-step instances. */
export const STATE_RANK: Record<WorkflowState, number> = {
  blocked: 0,
  escalated: 1,
  "in-progress": 2,
  accepted: 3,
  assigned: 4,
  delegated: 5,
  waiting: 6,
  created: 7,
  completed: 8,
  cancelled: 9,
  closed: 10,
};
