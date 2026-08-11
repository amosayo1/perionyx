/**
 * Phase 23 — Enterprise Workflow Engine: Transition Validation
 *
 * Every transition is validated before it is applied. Validation covers:
 * 1. state legality (the 11-state machine),
 * 2. actor authority (assignee / owner / initiator / delegated),
 * 3. required evidence (a decision must be attached where required),
 * 4. decision state (cannot decide → cannot be acted on without a reason),
 * 5. policy / segregation-of-duties (initiator never approves own work),
 * 6. permissions (pluggable permission check).
 * Invalid transitions are rejected with reasons and still audited.
 */

import type {
  AuditEntryType,
  StepKind,
  TransitionValidation,
  WorkflowInstance,
  WorkflowState,
} from "./types";
import { canTransition } from "./state-machine";

export interface TransitionValidationInput {
  instance: WorkflowInstance;
  stepId: string | null;
  from: WorkflowState;
  to: WorkflowState;
  actor: string;
  /** For approval/decision steps: completing requires a DI decision. */
  requiresDecision?: boolean;
  /** Whether the actor must be the current assignee (or authority). */
  requireAssignee?: boolean;
  /** Pluggable permission gate. Absent = allowed. */
  permissionCheck?: (actor: string, action: string) => boolean;
  /** Skip SoD initiator/approver check (e.g. system transitions). */
  allowSelfApproval?: boolean;
  /** The step kind — segregation of duties only constrains decision steps. */
  stepKind?: StepKind;
}

export interface TransitionValidationResult extends TransitionValidation {
  reasons: { code: string; message: string }[];
  auditType: AuditEntryType | null;
}

export function validateTransition(input: TransitionValidationInput): TransitionValidationResult {
  const errors: string[] = [];
  const reasons: { code: string; message: string }[] = [];

  if (!canTransition(input.from, input.to)) {
    errors.push(`Illegal transition ${input.from} → ${input.to}`);
    reasons.push({
      code: "illegal-state",
      message: `Cannot move from ${input.from} to ${input.to}`,
    });
  }

  if (input.to === "completed" && input.requiresDecision && !input.instance.decision) {
    errors.push("Required decision evidence is missing");
    reasons.push({
      code: "missing-evidence",
      message: "A Decision Intelligence result must be attached before this step can complete",
    });
  }

  if (
    input.to === "completed" &&
    input.instance.decision?.recommendation === "cannot-decide" &&
    !input.allowSelfApproval
  ) {
    errors.push("Cannot act on an undecidable recommendation without a reason");
    reasons.push({
      code: "undecidable",
      message: "The attached decision is cannot-decide; a human override with reason is required",
    });
  }

  if (input.requireAssignee) {
    const step = input.stepId ? input.instance.steps[input.stepId] : null;
    const assignee = step?.assigneeId ?? null;
    const isOwner = input.instance.ownerId === input.actor;
    const isInitiator = input.instance.initiatorId === input.actor;
    if (assignee !== null && assignee !== input.actor && !isOwner && !isInitiator) {
      errors.push(`Actor ${input.actor} is not the assignee of this step`);
      reasons.push({
        code: "not-assignee",
        message: `Step is assigned to ${assignee}; ${input.actor} lacks authority`,
      });
    }
  }

  // Segregation of duties: the initiator of a decision workflow never
  // approves it. Only applies to decision/approval steps — completing a
  // task the initiator is legitimately assigned is not constrained.
  const isDecisionStep = input.stepKind === "approval" || input.stepKind === "decision";
  if (
    input.to === "completed" &&
    !input.allowSelfApproval &&
    isDecisionStep &&
    input.instance.initiatorId !== null &&
    input.instance.initiatorId === input.actor
  ) {
    errors.push("Initiator cannot approve their own work (segregation of duties)");
    reasons.push({
      code: "segregation-of-duties",
      message: "The workflow initiator must not be the deciding operator",
    });
  }

  if (input.permissionCheck) {
    const action = `${input.from}→${input.to}`;
    if (!input.permissionCheck(input.actor, action)) {
      errors.push(`Actor ${input.actor} lacks permission for ${action}`);
      reasons.push({
        code: "permission-denied",
        message: `No permission granted for ${action}`,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    reasons,
    auditType: errors.length === 0 ? null : "transition.rejected",
  };
}
