/**
 * Program 1 — Treasury Intelligence Platform: Treasury Workflow Definitions
 *
 * Treasury workflows registered on the canonical Enterprise Workflow Engine
 * (Phase 23). They adopt the general-approval shape — a request is created, a
 * human renders a decision informed by Decision Intelligence, the requester is
 * notified, and the workflow completes. Registration-only: no treasury-specific
 * workflow logic, no engine modification (Law 3 — capability contracts).
 */

import type { WorkflowDefinition } from "@/modules/enterprise-workflow/types";
import { buildBusinessHours } from "@/modules/enterprise-workflow/sla";
import { WorkflowRegistry } from "@/modules/enterprise-workflow/registry";
import { TREASURY_ESCALATION_IDS, TREASURY_ROLES, TREASURY_WORKFLOW_IDS } from "../constants";

const BUSINESS_HOURS = buildBusinessHours(
  0,
  [1, 2, 3, 4, 5],
  "09:00",
  "17:00",
);

function treasuryApprovalDefinition(
  id: string,
  name: string,
  description: string,
  escalationPolicyId: string,
): WorkflowDefinition {
  return {
    id,
    name,
    description,
    category: "treasury",
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
        description: "The treasury operator renders the decision, guided by the attached Decision Intelligence result.",
        assignment: { strategy: "role", role: TREASURY_ROLES.approver },
        sla: {
          metric: "decision",
          target: 8 * 60 * 60,
          useBusinessHours: true,
          businessHours: BUSINESS_HOURS,
        },
        escalationPolicyId,
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

export function treasuryPaymentApprovalDefinition(): WorkflowDefinition {
  return treasuryApprovalDefinition(
    TREASURY_WORKFLOW_IDS.paymentApproval,
    "Treasury Payment Approval",
    "A treasury payment release awaits a human decision informed by Decision Intelligence; the requester is notified of the outcome.",
    TREASURY_ESCALATION_IDS.payment,
  );
}

export function treasuryTransferApprovalDefinition(): WorkflowDefinition {
  return treasuryApprovalDefinition(
    TREASURY_WORKFLOW_IDS.transferApproval,
    "Treasury Transfer Approval",
    "An intra-entity treasury transfer awaits a human decision informed by Decision Intelligence; the requester is notified of the outcome.",
    TREASURY_ESCALATION_IDS.transfer,
  );
}

export function treasuryFundingApprovalDefinition(): WorkflowDefinition {
  return treasuryApprovalDefinition(
    TREASURY_WORKFLOW_IDS.fundingApproval,
    "Intercompany Funding Approval",
    "An intercompany funding request awaits a human decision informed by Decision Intelligence; the requester is notified of the outcome.",
    TREASURY_ESCALATION_IDS.funding,
  );
}

export function registerTreasuryWorkflows(registry: WorkflowRegistry): void {
  registry.registerDefinition(treasuryPaymentApprovalDefinition());
  registry.registerDefinition(treasuryTransferApprovalDefinition());
  registry.registerDefinition(treasuryFundingApprovalDefinition());

  const escalations = [
    {
      id: TREASURY_ESCALATION_IDS.payment,
      name: "Treasury Payment Escalation",
    },
    {
      id: TREASURY_ESCALATION_IDS.transfer,
      name: "Treasury Transfer Escalation",
    },
    {
      id: TREASURY_ESCALATION_IDS.funding,
      name: "Treasury Funding Escalation",
    },
  ];

  for (const policy of escalations) {
    registry.registerEscalationPolicy({
      id: policy.id,
      name: policy.name,
      triggers: [
        { kind: "time", afterSeconds: 2 * 60 * 60, fromStepState: "assigned" },
        { kind: "sla-breach" },
      ],
      steps: [
        { level: 0, action: "notify", target: { kind: "manager" } },
        { level: 1, action: "reassign-and-notify", target: { kind: "role", value: TREASURY_ROLES.manager } },
      ],
    });
  }
}
