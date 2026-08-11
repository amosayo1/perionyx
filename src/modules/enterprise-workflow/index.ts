/**
 * Phase 23 — Enterprise Workflow Engine
 *
 * The canonical human-work orchestration layer. Deterministic, audited,
 * generic (never AP-specific). Consumes Decision Intelligence outputs and
 * drives 11-state lifecycle transitions through assignment, delegation,
 * escalation, SLAs, queues, routing and approvals.
 *
 * NOTE: `enterprise-workflow` is the Phase 23 canonical module. The legacy
 * Phase 7 `workflow` module (Automation Studio step executor) is a
 * separate, older capability and is untouched by this phase.
 */

export * from "./types";
export {
  LEGAL_TRANSITIONS,
  isKnownState,
  canTransition,
  assertLegalTransition,
  legalTransitionPairs,
  STATE_RANK,
} from "./state-machine";
export {
  buildConditionContext,
  resolveField,
  evaluateCondition,
} from "./condition";
export {
  businessSecondsBetween,
  computeTargetAt,
  workingSecondsElapsed,
  evaluateSla,
  initStepSla,
  refreshStepSla,
  pauseStepSla,
  resumeStepSla,
  buildBusinessHours,
  stepDueAt,
  isWorkingDayAt,
} from "./sla";
export {
  AssignmentEngine,
  DirectStrategy,
  RoleStrategy,
  QueueStrategy,
  RoundRobinStrategy,
  LoadBalanceStrategy,
  SkillStrategy,
  RuleStrategy,
  strategyIdOf,
} from "./assignment";
export { DelegationEngine } from "./delegation";
export { EscalationEngine } from "./escalation";
export { QueueEngine } from "./queue";
export { RoutingEngine } from "./routing";
export { validateTransition } from "./transition";
export { OwnershipEngine } from "./ownership";
export { NotificationDispatcher } from "./notification";
export { AuditTrail } from "./audit";
export { WorkflowRegistry } from "./registry";
export { WorkflowService } from "./workflow";
export type { WorkflowServiceOptions, CreateInstanceInput, CompleteStepInput } from "./workflow";
export { EnterpriseWorkflowEngine } from "./engine";
export type { EnterpriseWorkflowEngineOptions } from "./engine";
export * from "./adapters";
export * from "./providers";
