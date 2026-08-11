/**
 * Phase 23 — Enterprise Workflow Engine: Canonical Types
 *
 * The human-work orchestration layer. Consumes Decision Intelligence
 * outputs and drives deterministic, audited state transitions. Generic —
 * never AP-specific. A Workflow is a "state machine with an operator"
 * (PP-094): explicit named states, legal transitions with preconditions,
 * a visible current position, and an append-only audit trail.
 */

// ──────────────────────────────────────────────────────────────────────────────
// Canonical Lifecycle (11 states)
// ──────────────────────────────────────────────────────────────────────────────

export type WorkflowState =
  | "created" // instance or step exists, not yet worked
  | "assigned" // an operator or queue owns the step
  | "accepted" // operator acknowledged ownership
  | "in-progress" // active work is being performed
  | "waiting" // paused awaiting an external condition / resume date
  | "blocked" // cannot proceed; requires unblocking
  | "escalated" // authority or visibility raised
  | "delegated" // work reassigned to a delegate
  | "completed" // work finished successfully
  | "cancelled" // work terminated without completion
  | "closed"; // terminal; no further transitions

export const WORKFLOW_STATES: readonly WorkflowState[] = [
  "created",
  "assigned",
  "accepted",
  "in-progress",
  "waiting",
  "blocked",
  "escalated",
  "delegated",
  "completed",
  "cancelled",
  "closed",
];

export const WORKFLOW_STATE_LABELS: Record<WorkflowState, string> = {
  created: "Created",
  assigned: "Assigned",
  accepted: "Accepted",
  "in-progress": "In Progress",
  waiting: "Waiting",
  blocked: "Blocked",
  escalated: "Escalated",
  delegated: "Delegated",
  completed: "Completed",
  cancelled: "Cancelled",
  closed: "Closed",
};

// ──────────────────────────────────────────────────────────────────────────────
// Facts, Priority, Risk
// ──────────────────────────────────────────────────────────────────────────────

export type FactValue =
  | string
  | number
  | boolean
  | null
  | string[]
  | Record<string, unknown>;

export type WorkflowPriority = "low" | "medium" | "high" | "critical";

export const PRIORITY_ORDER: Record<WorkflowPriority, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

export type RiskLevel = "low" | "medium" | "high" | "critical";

export const RISK_ORDER: Record<RiskLevel, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

export type SlaStatus = "on-track" | "at-risk" | "breached" | "completed" | "paused";

export const SLA_STATUS_LABELS: Record<SlaStatus, string> = {
  "on-track": "On Track",
  "at-risk": "At Risk",
  breached: "Breached",
  completed: "Completed",
  paused: "Paused",
};

// ──────────────────────────────────────────────────────────────────────────────
// Conditions
// ──────────────────────────────────────────────────────────────────────────────

export type Condition =
  | { op: "equals"; field: string; value: FactValue }
  | { op: "not-equals"; field: string; value: FactValue }
  | { op: "gt"; field: string; value: number }
  | { op: "gte"; field: string; value: number }
  | { op: "lt"; field: string; value: number }
  | { op: "lte"; field: string; value: number }
  | { op: "in"; field: string; values: FactValue[] }
  | { op: "contains"; field: string; value: string }
  | { op: "startsWith"; field: string; value: string }
  | { op: "exists"; field: string }
  | { op: "and"; conditions: Condition[] }
  | { op: "or"; conditions: Condition[] }
  | { op: "not"; condition: Condition };

// ──────────────────────────────────────────────────────────────────────────────
// SLA
// ──────────────────────────────────────────────────────────────────────────────

export type SlaMetric =
  | "assigned" // time from assignment to first action
  | "accepted" // time from assignment to acceptance
  | "first-response" // time from assignment to first operator response
  | "decision" // time from assignment to a decision/outcome
  | "completion"; // time from start to completion

export interface BusinessHoursConfig {
  /** Offset in minutes east of UTC applied to wall-clock schedule. */
  utcOffsetMinutes: number;
  /** 0 = Sunday … 6 = Saturday. null = not a working day. */
  weekSchedule: Record<number, { startMinutes: number; endMinutes: number } | null>;
  /** ISO "YYYY-MM-DD" dates treated as non-working holidays. */
  holidays?: string[];
}

export interface SlaSpec {
  metric: SlaMetric;
  /** Target duration in business seconds. */
  target: number;
  businessHours?: BusinessHoursConfig;
  /** When set, the target is only measured on working days/hours. */
  useBusinessHours?: boolean;
}

export interface PausedWindow {
  from: string;
  to: string;
}

export interface StepSlaState {
  startsAt: string;
  metric: SlaMetric;
  targetBusinessSeconds: number;
  businessHours?: BusinessHoursConfig;
  pausedWindows: PausedWindow[];
  currentPauseStart?: string;
  status: SlaStatus;
  progress: number;
}

// ──────────────────────────────────────────────────────────────────────────────
// Assignment
// ──────────────────────────────────────────────────────────────────────────────

export type AssignmentSpec =
  | { strategy: "direct"; userId: string }
  | { strategy: "role"; role: string }
  | { strategy: "queue"; queueId: string }
  | { strategy: "round-robin"; scope: { role?: string; queueId?: string } }
  | { strategy: "load-balance"; scope: { role?: string; queueId?: string } }
  | { strategy: "skill"; skills: string[]; role?: string }
  | { strategy: "rule"; ruleId: string }
  | { strategy: "custom"; strategyId: string };

export interface AssignmentResult {
  assigneeId: string | null;
  queueId: string | null;
  role: string | null;
  strategyId: string;
}

export interface AssignmentContext {
  tenantId: string;
  resolveRoleMembers(role: string): string[];
  memberSkills(userId: string): string[];
  activeWorkload(userId: string): number;
  now(): string;
}

export interface AssignmentStrategy {
  readonly id: string;
  assign(spec: AssignmentSpec, ctx: AssignmentContext): AssignmentResult;
}

// ──────────────────────────────────────────────────────────────────────────────
// Delegation
// ──────────────────────────────────────────────────────────────────────────────

export type DelegationType =
  | "temporary"
  | "permanent"
  | "vacation"
  | "out-of-office"
  | "department"
  | "approval"
  | "time-bound";

export interface DelegationScope {
  workflowId?: string;
  stepKind?: StepKind;
  role?: string;
  queueId?: string;
  priority?: WorkflowPriority;
  risk?: RiskLevel;
}

export interface DelegationRule {
  id: string;
  tenantId: string;
  ownerId: string;
  delegateId: string;
  type: DelegationType;
  scope: DelegationScope;
  effectiveFrom: string;
  effectiveUntil: string | null;
  active: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

// ──────────────────────────────────────────────────────────────────────────────
// Escalation
// ──────────────────────────────────────────────────────────────────────────────

export type EscalationTriggerKind = "time" | "sla-breach" | "risk" | "priority";

export interface EscalationTrigger {
  kind: EscalationTriggerKind;
  /** For "time": idle seconds since the step entered its trigger state. */
  afterSeconds?: number;
  /** For "time": the step state the clock runs from. */
  fromStepState?: WorkflowState;
  /** For "risk": escalate when instance risk is at or above this level. */
  riskAt?: RiskLevel;
  /** For "priority": escalate when instance priority is at or above this. */
  priorityAt?: WorkflowPriority;
}

export interface EscalationStep {
  level: number;
  action: "notify" | "reassign" | "reassign-and-notify";
  target: { kind: "manager" | "role" | "queue" | "user" | "next-level"; value?: string };
}

export interface EscalationPolicy {
  id: string;
  name: string;
  triggers: EscalationTrigger[];
  steps: EscalationStep[];
}

// ──────────────────────────────────────────────────────────────────────────────
// Routing
// ──────────────────────────────────────────────────────────────────────────────

export type RoutingSpec =
  | {
      mode: "conditional";
      cases: Array<{ condition: Condition; targetStepId: string }>;
      defaultTarget?: string;
    }
  | { mode: "parallel"; targetStepIds: string[]; join: "all" | "any" }
  | { mode: "sequential"; targetStepIds: string[] }
  | { mode: "loop"; targetStepId: string; until: Condition; maxIterations?: number }
  | { mode: "subflow"; workflowId: string }
  | { mode: "dynamic"; resolver: string };

// ──────────────────────────────────────────────────────────────────────────────
// Steps
// ──────────────────────────────────────────────────────────────────────────────

export type StepKind =
  | "task" // human work with an outcome
  | "approval" // requires a decision; consumes DI
  | "decision" // consumes DI; surfaces recommendation to a human
  | "routing" // routes to next step(s), no operator
  | "subflow" // runs a nested workflow instance
  | "notification" // dispatches an abstract notification
  | "gate"; // synchronization / join barrier

export interface StepDefinition {
  id: string;
  kind: StepKind;
  name: string;
  description?: string;
  assignment?: AssignmentSpec;
  sla?: SlaSpec;
  escalationPolicyId?: string;
  routing?: RoutingSpec;
  next?: string;
  subflowWorkflowId?: string;
  autoComplete?: boolean;
  /** For approval/decision steps: which DI entity type this consumes. */
  decisionEntityType?: string;
  /** Completing this step completes the workflow instance. */
  completesInstance?: boolean;
  /** Rules that must hold to complete (fields checked by transition engine). */
  requiresDecision?: boolean;
  notificationTemplateIds?: string[];
}

export interface StepState {
  stepId: string;
  state: WorkflowState;
  assigneeId: string | null;
  queueId: string | null;
  role: string | null;
  delegatedFrom: string | null;
  delegationId: string | null;
  escalationLevel: number;
  result: { outcome: string; by: string; at: string; reason?: string } | null;
  startedAt: string | null;
  acceptedAt: string | null;
  completedAt: string | null;
  sla: StepSlaState | null;
}

// ──────────────────────────────────────────────────────────────────────────────
// Decision Consumption (from Decision Intelligence — duck-typed)
// ──────────────────────────────────────────────────────────────────────────────

export type RecommendationCategory =
  | "approve"
  | "approve-with-warning"
  | "needs-review"
  | "escalate"
  | "reject"
  | "cannot-decide";

export type DecisionConfidence = "high" | "moderate" | "low" | "insufficient-evidence";

export interface WorkflowDecisionContext {
  decisionId: string;
  recommendation: RecommendationCategory;
  recommendationLabel: string;
  confidence: DecisionConfidence;
  risk: RiskLevel;
  requiredHumanActions: string[];
  supportingEvidence: string[];
  missingEvidence: string[];
  decidedAt: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Workflow Definition & Instance
// ──────────────────────────────────────────────────────────────────────────────

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  version: number;
  entryStepId: string;
  steps: Record<string, StepDefinition>;
  autoStart: boolean;
  requiresDecision: boolean;
  defaultPriority: WorkflowPriority;
  metadata?: Record<string, unknown>;
}

export interface ParallelSet {
  targets: string[];
  remaining: string[];
  next: string | null;
  join: "all" | "any";
}

export interface WorkflowInstance {
  id: string;
  tenantId: string;
  workflowId: string;
  workflowVersion: number;
  state: WorkflowState;
  currentStepId: string | null;
  steps: Record<string, StepState>;
  parallelSets: Record<string, ParallelSet>;
  /** Ordered step ids awaiting activation after a sequential routing. */
  pendingSequence: string[];
  /** Active loop controller (router step id + bounded target). */
  activeLoop: {
    routerStepId: string;
    targetStepId: string;
    maxIterations: number;
  } | null;
  ownerId: string | null;
  initiatorId: string | null;
  priority: WorkflowPriority;
  risk: RiskLevel;
  variables: Record<string, FactValue>;
  decision: WorkflowDecisionContext | null;
  entityRef: { type: string; id: string } | null;
  loopCounts: Record<string, number>;
  escalationLevel: number;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  closedAt: string | null;
}

export interface WorkflowInstanceSummary {
  id: string;
  workflowId: string;
  workflowName: string;
  state: WorkflowState;
  currentStepId: string | null;
  ownerId: string | null;
  priority: WorkflowPriority;
  risk: RiskLevel;
  recommendation: RecommendationCategory | null;
  createdAt: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Queues (projection over all workflows — never a fork)
// ──────────────────────────────────────────────────────────────────────────────

export type WorkQueueKind =
  | "personal"
  | "role"
  | "shared"
  | "priority"
  | "risk"
  | "decision"
  | "exception"
  | "saved"
  | "dynamic";

export interface QueueFilter {
  workflowIds?: string[];
  stepKinds?: StepKind[];
  states?: WorkflowState[];
  priorities?: WorkflowPriority[];
  risk?: RiskLevel[];
  recommendations?: RecommendationCategory[];
  confidence?: DecisionConfidence[];
  slaStatus?: SlaStatus[];
  entityTypes?: string[];
  assigneeId?: string;
  unassigned?: boolean;
  decisionRequired?: boolean;
}

export interface WorkQueue {
  id: string;
  tenantId: string;
  kind: WorkQueueKind;
  name: string;
  ownerId?: string;
  role?: string;
  filter: QueueFilter;
  sortBy?: "createdAt" | "priority" | "risk" | "state" | "dueAt";
  sortDir?: "asc" | "desc";
}

export interface WorkQueueItem {
  instanceId: string;
  workflowId: string;
  stepId: string;
  stepKind: StepKind;
  state: WorkflowState;
  assigneeId: string | null;
  queueId: string | null;
  priority: WorkflowPriority;
  risk: RiskLevel;
  recommendation: RecommendationCategory | null;
  confidence: DecisionConfidence | null;
  slaStatus: SlaStatus;
  dueAt: string | null;
  entityRef: { type: string; id: string } | null;
  createdAt: string;
}

/** Structural snapshot of an instance's active step — used to scan queues
 *  without materializing the whole instance graph. */
export interface WorkInstanceRef {
  tenantId: string;
  instanceId: string;
  workflowId: string;
  stepId: string;
  stepKind: StepKind;
  state: WorkflowState;
  assigneeId: string | null;
  queueId: string | null;
  role: string | null;
  priority: WorkflowPriority;
  risk: RiskLevel;
  recommendation: RecommendationCategory | null;
  confidence: DecisionConfidence | null;
  entityRef: { type: string; id: string } | null;
  createdAt: string;
  slaStatus: SlaStatus | null;
}

// ──────────────────────────────────────────────────────────────────────────────
// Notifications (abstract — never bound to a delivery mechanism)
// ──────────────────────────────────────────────────────────────────────────────

export type WorkflowNotificationKind =
  | "assigned"
  | "reminder"
  | "escalation"
  | "completion"
  | "delegation"
  | "approval-requested"
  | "approval-result"
  | "workflow-changed"
  | "mention"
  | "comment"
  | "sla-breach";

export interface WorkflowNotification {
  id: string;
  kind: WorkflowNotificationKind;
  workflowId: string;
  instanceId: string | null;
  stepId: string | null;
  recipient: { kind: "user" | "role" | "queue"; id: string };
  title: string;
  body: string;
  severity: "info" | "warning" | "critical";
  at: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationChannel {
  readonly id: string;
  deliver(notification: WorkflowNotification): Promise<void> | void;
}

// ──────────────────────────────────────────────────────────────────────────────
// Audit (append-only)
// ──────────────────────────────────────────────────────────────────────────────

export type AuditEntryType =
  | "workflow.created"
  | "workflow.started"
  | "workflow.completed"
  | "workflow.cancelled"
  | "workflow.closed"
  | "workflow.advanced"
  | "step.assigned"
  | "step.accepted"
  | "step.started"
  | "step.completed"
  | "step.cancelled"
  | "step.waiting"
  | "step.blocked"
  | "step.unblocked"
  | "step.delegated"
  | "step.escalated"
  | "decision.attached"
  | "delegation.created"
  | "delegation.cancelled"
  | "delegation.resolved"
  | "escalation.applied"
  | "ownership.transferred"
  | "sla.status-changed"
  | "notification.sent"
  | "transition.rejected";

export interface AuditEntry {
  id: string;
  seq: number;
  type: AuditEntryType;
  tenantId: string;
  workflowId: string;
  instanceId: string | null;
  stepId: string | null;
  actor: string;
  at: string;
  previousState: WorkflowState | SlaStatus | string | null;
  newState: WorkflowState | SlaStatus | string | null;
  reason: string;
  evidenceIds: string[];
  decisionId: string | null;
  metadata?: Record<string, unknown>;
}

// ──────────────────────────────────────────────────────────────────────────────
// Transition validation
// ──────────────────────────────────────────────────────────────────────────────

export interface TransitionValidation {
  valid: boolean;
  errors: string[];
}

export type WorkflowTransitionResult =
  | { kind: "applied"; instanceId: string; state: WorkflowState; auditId: string }
  | { kind: "rejected"; instanceId: string; errors: string[]; auditId: string };
