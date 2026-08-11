/**
 * Phase 23 — Enterprise Workflow Engine: Queues
 *
 * Work queues are a projection over all workflows — never a fork. Nine
 * kinds: personal, role, shared, priority, risk, decision, exception,
 * saved, dynamic. Decision/exception/risk queues consume Decision
 * Intelligence (recommendation, confidence, risk) so operators see what
 * needs a human judgment, not merely what is pending.
 */

import type {
  QueueFilter,
  RiskLevel,
  SlaStatus,
  WorkflowPriority,
  WorkflowState,
  WorkInstanceRef,
  WorkQueue,
  WorkQueueItem,
} from "./types";

export interface QueueScanInput {
  tenantId: string;
  instances: WorkInstanceRef[];
  queue: WorkQueue;
  slaStatusOf(instanceId: string, stepId: string): SlaStatus | null;
  dueAtOf(instanceId: string, stepId: string): string | null;
}

function matchesFilter(filter: QueueFilter, item: WorkInstanceRef): boolean {
  if (filter.workflowIds && !filter.workflowIds.includes(item.workflowId)) return false;
  if (filter.stepKinds && !filter.stepKinds.includes(item.stepKind)) return false;
  if (filter.states && !filter.states.includes(item.state)) return false;
  if (filter.priorities && !filter.priorities.includes(item.priority)) return false;
  if (filter.risk && !filter.risk.includes(item.risk)) return false;
  if (
    filter.recommendations &&
    (item.recommendation === null || !filter.recommendations.includes(item.recommendation))
  ) {
    return false;
  }
  if (filter.confidence && (item.confidence === null || !filter.confidence.includes(item.confidence))) {
    return false;
  }
  if (filter.slaStatus && item.slaStatus !== null && !filter.slaStatus.includes(item.slaStatus)) {
    return false;
  }
  if (filter.entityTypes && (!item.entityRef || !filter.entityTypes.includes(item.entityRef.type))) {
    return false;
  }
  if (filter.assigneeId && item.assigneeId !== filter.assigneeId) return false;
  if (filter.unassigned && item.assigneeId !== null) return false;
  if (filter.decisionRequired && item.recommendation === null) return false;
  return true;
}

function kindEnforces(queue: WorkQueue, item: WorkInstanceRef): boolean {
  switch (queue.kind) {
    case "personal":
      return item.assigneeId === queue.ownerId;
    case "role":
      return item.role === queue.role;
    case "priority":
      return item.priority === "high" || item.priority === "critical";
    case "risk":
      return item.risk === "high" || item.risk === "critical";
    case "decision":
      return item.recommendation !== null && item.recommendation !== "approve";
    case "exception":
      return item.state === "blocked" || item.state === "escalated" || item.slaStatus === "breached";
    default:
      return true;
  }
}

const PRIORITY_LOW = ["low", "medium", "high", "critical"];
const RISK_LOW = ["low", "medium", "high", "critical"];

function sortValue(
  item: { priority: WorkflowPriority; risk: RiskLevel; state: WorkflowState; createdAt: string },
  by: WorkQueue["sortBy"],
  dueAt: string | null,
): number | string {
  switch (by) {
    case "priority":
      return PRIORITY_LOW.indexOf(item.priority);
    case "risk":
      return RISK_LOW.indexOf(item.risk);
    case "state":
      return item.state;
    case "dueAt":
      return dueAt ?? "9999";
    case "createdAt":
    default:
      return item.createdAt;
  }
}

export class QueueEngine {
  /**
   * Evaluate a queue against the current set of workflow instances.
   * Deterministic ordering: sortBy ascending/descending, ties broken by
   * creation timestamp for stability.
   */
  query(input: QueueScanInput): WorkQueueItem[] {
    const items: WorkQueueItem[] = [];
    const sortBy = input.queue.sortBy ?? "createdAt";
    const dir = input.queue.sortDir ?? "asc";
    for (const instance of input.instances) {
      if (instance.tenantId !== input.tenantId) continue;
      const slaStatus = input.slaStatusOf(instance.instanceId, instance.stepId) ?? null;
      const dueAt = input.dueAtOf(instance.instanceId, instance.stepId) ?? null;
      const ref: WorkInstanceRef = {
        ...instance,
        slaStatus,
      };
      if (!matchesFilter(input.queue.filter, ref)) continue;
      if (!kindEnforces(input.queue, ref)) continue;

      items.push({
        instanceId: ref.instanceId,
        workflowId: ref.workflowId,
        stepId: ref.stepId,
        stepKind: ref.stepKind,
        state: ref.state,
        assigneeId: ref.assigneeId,
        queueId: ref.queueId,
        priority: ref.priority,
        risk: ref.risk,
        recommendation: ref.recommendation,
        confidence: ref.confidence,
        slaStatus: slaStatus ?? "on-track",
        dueAt,
        entityRef: ref.entityRef,
        createdAt: ref.createdAt,
      });
    }

    items.sort((a, b) => {
      const av = sortValue(a, sortBy, a.dueAt);
      const bv = sortValue(b, sortBy, b.dueAt);
      let cmp: number;
      if (typeof av === "string" && typeof bv === "string") {
        cmp = av.localeCompare(bv);
      } else {
        cmp = Number(av) - Number(bv);
      }
      if (cmp !== 0) return dir === "desc" ? -cmp : cmp;
      return a.createdAt.localeCompare(b.createdAt);
    });

    return items;
  }

  /** Convenience: build a decision queue — everything a human must judge. */
  static decisionQueue(tenantId: string): WorkQueue {
    return {
      id: "queue.decision",
      tenantId,
      kind: "decision",
      name: "Needs Decision",
      filter: { decisionRequired: true },
      sortBy: "priority",
      sortDir: "desc",
    };
  }
}
