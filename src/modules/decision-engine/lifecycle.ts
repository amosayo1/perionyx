/**
 * Phase 22.5 — Decision Intelligence: Decision Lifecycle
 *
 * Deterministic lifecycle with audited transitions (06 §10, 11 — Workflows:
 * state machine with operator, explicit states, legal transitions, audit).
 *
 * The in-memory transition chain is append-only for the current evaluation;
 * persistence is owned by consumers (the workspace service) so the core
 * engine stays stateless and replaceable.
 */

import type { DecisionLifecycleState, LifecycleTransition } from "./types";

export const LEGAL_TRANSITIONS: Record<DecisionLifecycleState, DecisionLifecycleState[]> = {
  created: ["evaluated", "closed"],
  evaluated: ["recommended", "reopened", "closed"],
  recommended: ["human-reviewed", "escalated", "reopened", "closed"],
  "human-reviewed": ["approved", "rejected", "escalated", "reopened", "closed"],
  approved: ["closed"],
  rejected: ["closed", "reopened"],
  escalated: ["human-reviewed", "reopened", "closed"],
  reopened: ["evaluated"],
  closed: [],
};

export function transitionTo(
  current: DecisionLifecycleState,
  to: DecisionLifecycleState,
  actor: string,
  at: string,
  reason: string | null = null,
): { state: DecisionLifecycleState; transition: LifecycleTransition } {
  if (!LEGAL_TRANSITIONS[current].includes(to)) {
    throw new Error(`Illegal decision transition: ${current} → ${to}`);
  }
  return {
    state: to,
    transition: { from: current, to, at, actor, reason },
  };
}
