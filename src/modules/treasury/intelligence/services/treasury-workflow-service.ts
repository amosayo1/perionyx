/**
 * Program 1 — Treasury Intelligence Platform: Treasury Workflow Service
 *
 * Drives treasury decisions through the canonical Enterprise Workflow Engine
 * (Phase 23): creates decision instances for treasury entities, attaches the
 * Decision Intelligence result, and exposes the treasury decision queue as a
 * projection over instances. This service never reasons and never writes free
 * text — it orchestrates.
 */

import { EnterpriseWorkflowEngine } from "@/modules/enterprise-workflow/engine";
import { toWorkflowDecisionContext } from "@/modules/enterprise-workflow/adapters/decision";
import type { WorkflowInstance, WorkQueue, WorkQueueItem } from "@/modules/enterprise-workflow/types";
import type { Decision } from "@/modules/decision-engine/types";
import { TREASURY_QUEUES, TREASURY_WORKFLOW_IDS } from "../constants";

export interface TreasuryWorkflowInput {
  workflowId: (typeof TREASURY_WORKFLOW_IDS)[keyof typeof TREASURY_WORKFLOW_IDS];
  tenantId: string;
  initiatorId: string;
  entityRef: { type: string; id: string };
}

export class TreasuryWorkflowService {
  private readonly engine: EnterpriseWorkflowEngine;

  constructor(engine: EnterpriseWorkflowEngine = EnterpriseWorkflowEngine.getInstance()) {
    this.engine = engine;
  }

  get registry() {
    return this.engine.registry;
  }

  get service() {
    return this.engine.service;
  }

  /** Create (and auto-start) a decision instance for a treasury entity. */
  createDecisionInstance(input: TreasuryWorkflowInput): WorkflowInstance {
    return this.service.createInstance({
      workflowId: input.workflowId,
      tenantId: input.tenantId,
      initiatorId: input.initiatorId,
      entityRef: input.entityRef,
    });
  }

  /** Attach the Decision Intelligence result to an instance. */
  attachDecision(instanceId: string, decision: Decision, actor = "engine"): WorkflowInstance {
    return this.service.attachDecision(instanceId, toWorkflowDecisionContext(decision), actor);
  }

  /** The treasury decision queue — approval/decision steps on treasury workflows. */
  getDecisionQueue(tenantId: string): WorkQueueItem[] {
    const queue: WorkQueue = {
      id: TREASURY_QUEUES.decision,
      tenantId,
      kind: "decision",
      name: "Treasury Decisions",
      filter: {
        workflowIds: [
          TREASURY_WORKFLOW_IDS.paymentApproval,
          TREASURY_WORKFLOW_IDS.transferApproval,
          TREASURY_WORKFLOW_IDS.fundingApproval,
        ],
        stepKinds: ["approval", "decision"],
        decisionRequired: true,
      },
      sortBy: "priority",
      sortDir: "desc",
    };
    return this.service.getQueue(queue, tenantId);
  }
}
