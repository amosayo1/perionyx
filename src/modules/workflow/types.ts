import type { TenantContext } from "@/server/context/tenant-context";

// ── Workflow Status ────────────────────────────────────────────────────

export type WorkflowStatus =
  | "PENDING"
  | "VALIDATED"
  | "RUNNING"
  | "WAITING"
  | "PAUSED"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED"
  | "ARCHIVED";

export type StepStatus =
  | "PENDING"
  | "READY"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "SKIPPED"
  | "WAITING_APPROVAL"
  | "WAITING_INPUT";

export type StepType =
  | "approval"
  | "decision"
  | "policy_evaluation"
  | "notification"
  | "delay"
  | "conditional"
  | "parallel"
  | "connector_execution"
  | "report_generation"
  | "human_task"
  | "ai_recommendation"
  | "webhook"
  | "custom";

export type WorkflowEventType =
  | "CREATED" | "STARTED"
  | "STEP_STARTED" | "STEP_COMPLETED" | "STEP_FAILED" | "STEP_SKIPPED"
  | "APPROVAL_REQUESTED" | "APPROVAL_GRANTED" | "APPROVAL_REJECTED"
  | "NOTIFICATION_SENT" | "RETRY_TRIGGERED"
  | "COMPLETED" | "CANCELLED" | "FAILED" | "TIMEOUT" | "ESCALATED"
  | "PAUSED" | "RESUMED" | "ARCHIVED";

// ── Step Definition (stored in WorkflowDefinition.steps JSON) ──────────

export interface StepDefinition {
  id: string;
  type: StepType;
  label: string;
  config?: Record<string, unknown>;
  dependsOn?: string[];
  timeoutMinutes?: number;
  retryCount?: number;
  retryDelayMs?: number;
  condition?: string;
}

// ── Workflow Execution Context ─────────────────────────────────────────

export interface WorkflowExecutionContext {
  tenant: TenantContext;
  instanceId: string;
  definitionId: string;
  companyId: string;
  userId: string;
  variables: Record<string, unknown>;
  currentStep: StepDefinition | null;
  metadata: Record<string, unknown>;
}

// ── Step Execution Contract ────────────────────────────────────────────

export interface StepResult {
  success: boolean;
  output?: Record<string, unknown>;
  error?: string;
  transitionTo?: string;
  waitFor?: "approval" | "input";
  skipRemaining?: boolean;
}

export interface StepExecutor {
  readonly type: StepType;
  execute(ctx: WorkflowExecutionContext, step: StepDefinition): Promise<StepResult>;
}

// ── Workflow State Transitions ─────────────────────────────────────────

export type WorkflowTransition = {
  from: WorkflowStatus;
  to: WorkflowStatus;
  reason?: string;
};

// ── Metrics & Summary ──────────────────────────────────────────────────

export interface WorkflowMetricsSummary {
  totalDefinitions: number;
  activeDefinitions: number;
  totalInstances: number;
  runningInstances: number;
  waitingInstances: number;
  failedInstances: number;
  completedInstances: number;
  cancelledInstances: number;
  averageDurationMs: number;
  successRate: number;
}

export interface WorkflowInstanceSummary {
  id: string;
  definitionId: string;
  definitionName: string;
  status: WorkflowStatus;
  currentStep?: string;
  initiatedBy?: string;
  startedAt?: string;
  completedAt?: string;
  lastError?: string;
  createdAt: string;
}

export interface WorkflowDefinitionSummary {
  id: string;
  name: string;
  description: string | null;
  category: string;
  status: string;
  version: number;
  stepCount: number;
  isSystem: boolean;
}
