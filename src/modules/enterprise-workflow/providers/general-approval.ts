/**
 * Phase 23 — Enterprise Workflow Engine: General Approval (reference)
 *
 * A generic, domain-neutral workflow that any module (AP, Treasury,
 * Procurement, Reconciliation, Audit, Compliance) can adopt: a request is
 * created, a human makes a decision informed by Decision Intelligence,
 * the requester is notified, and the workflow completes. No AP-specific
 * assumptions — this is the canonical shape every workflow extends.
 */

import type { WorkflowDefinition } from "../types";
import { buildBusinessHours } from "../sla";
import { WorkflowRegistry } from "../registry";

export const GENERAL_APPROVAL_WORKFLOW_ID = "workflow.general-approval";
export const GENERAL_APPROVAL_ESCALATION_ID = "escalation.general-approval";

const BUSINESS_HOURS = buildBusinessHours(
  0,
  [1, 2, 3, 4, 5],
  "09:00",
  "17:00",
);

export function generalApprovalDefinition(): WorkflowDefinition {
  return {
    id: GENERAL_APPROVAL_WORKFLOW_ID,
    name: "General Approval",
    description:
      "A request awaits a human decision informed by Decision Intelligence; the requester is notified of the outcome.",
    category: "general",
    version: 1,
    autoStart: true,
    requiresDecision: true,
    defaultPriority: "medium",
    entryStepId: "start",
    steps: {
      start: {
        id: "start",
        kind: "routing",
        name: "Start",
        routing: { mode: "sequential", targetStepIds: ["approval"] },
      },
      approval: {
        id: "approval",
        kind: "approval",
        name: "Approval Decision",
        description: "The operator renders the decision, guided by the attached DI result.",
        assignment: { strategy: "role", role: "approver" },
        sla: {
          metric: "decision",
          target: 8 * 60 * 60,
          useBusinessHours: true,
          businessHours: BUSINESS_HOURS,
        },
        escalationPolicyId: GENERAL_APPROVAL_ESCALATION_ID,
        requiresDecision: true,
        routing: {
          mode: "conditional",
          cases: [
            {
              condition: {
                op: "in",
                field: "decision.recommendation",
                values: ["approve", "approve-with-warning"],
              },
              targetStepId: "notify-approve",
            },
          ],
          defaultTarget: "notify-review",
        },
      },
      "notify-approve": {
        id: "notify-approve",
        kind: "notification",
        name: "Notify Approver",
        autoComplete: true,
        next: "complete",
      },
      "notify-review": {
        id: "notify-review",
        kind: "notification",
        name: "Notify Reviewer",
        autoComplete: true,
        next: "complete",
      },
      complete: {
        id: "complete",
        kind: "gate",
        name: "Complete",
        completesInstance: true,
      },
    },
  };
}

export function registerGeneralApprovalWorkflow(registry: WorkflowRegistry): void {
  registry.registerDefinition(generalApprovalDefinition());
  registry.registerEscalationPolicy({
    id: GENERAL_APPROVAL_ESCALATION_ID,
    name: "General Approval Escalation",
    triggers: [
      { kind: "time", afterSeconds: 2 * 60 * 60, fromStepState: "assigned" },
      { kind: "sla-breach" },
    ],
    steps: [
      { level: 0, action: "notify", target: { kind: "manager" } },
      { level: 1, action: "reassign-and-notify", target: { kind: "role", value: "manager" } },
    ],
  });
}
