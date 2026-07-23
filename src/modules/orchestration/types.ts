import type { TenantContext } from "@/server/context/tenant-context";

// ── Enums ──
export type WorkflowStatus = "pending" | "running" | "completed" | "failed" | "rolled_back" | "cancelled";
export type StepType = "module_action" | "condition" | "notification" | "delay" | "sub_workflow";
export type StepStatus = "pending" | "running" | "completed" | "failed" | "skipped" | "rolled_back";
export type TriggerType = "manual" | "event" | "schedule" | "automation";
export type LogLevel = "info" | "warn" | "error" | "debug";
export type NotificationTrigger = "complete" | "failure" | "approval_required" | "threshold";
export type NotificationChannel = "in-app" | "email" | "slack" | "all";
export type AutomationActionType = "start_workflow" | "send_notification" | "update_status" | "escalate" | "log_audit";
export type WorkflowCategory = "month-end" | "treasury" | "reporting" | "reconciliation" | "budget" | "board" | "audit" | "custom";
export type ModuleName = "treasury" | "ledger" | "reporting" | "integration" | "intelligence" | "approval" | "notification";

export interface WorkflowStep {
  index: number;
  type: StepType;
  module?: ModuleName;
  action?: string;
  label: string;
  config?: Record<string, unknown>;
  timeoutMs?: number;
  retryCount?: number;
  dependsOn?: number[];
}

export interface WorkflowExecutionData {
  id: string;
  companyId: string;
  workflowId: string;
  workflowName?: string;
  status: WorkflowStatus;
  trigger: TriggerType;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  retryCount: number;
  maxRetries: number;
  steps: WorkflowStepExecutionData[];
  createdAt: string;
}

export interface WorkflowStepExecutionData {
  id: string;
  executionId: string;
  workflowId: string;
  stepIndex: number;
  stepType: StepType;
  module?: string;
  action?: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  status: StepStatus;
  error?: string;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  retryCount: number;
}

export interface WorkflowTemplateData {
  id: string;
  companyId: string;
  slug: string;
  name: string;
  description?: string;
  category: WorkflowCategory;
  steps: WorkflowStep[];
  estimatedDuration?: string;
  requiredModules?: string[];
  isBuiltIn: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationRuleData {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  eventType: string;
  condition?: Record<string, unknown>;
  actions: AutomationAction[];
  priority: number;
  isActive: boolean;
  cooldownSec?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationAction {
  type: AutomationActionType;
  target?: string;
  params?: Record<string, unknown>;
}

export interface WorkflowTriggerData {
  id: string;
  companyId: string;
  workflowId: string;
  eventType: string;
  condition?: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
}

export interface WorkflowScheduleData {
  id: string;
  companyId: string;
  workflowId: string;
  cron: string;
  timezone: string;
  isActive: boolean;
  lastRunAt?: string;
  nextRunAt?: string;
  createdAt: string;
}

export interface WorkflowLogData {
  id: string;
  companyId: string;
  executionId: string;
  workflowId: string;
  level: LogLevel;
  message: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface WorkflowMetricData {
  id: string;
  companyId: string;
  workflowId: string;
  periodStart: string;
  periodEnd: string;
  totalExecutions: number;
  completed: number;
  failed: number;
  avgDurationMs?: number;
  p95DurationMs?: number;
  createdAt: string;
}

export interface WorkflowNotificationData {
  id: string;
  companyId: string;
  workflowId: string;
  triggerOn: NotificationTrigger;
  roleTarget?: string;
  channel: NotificationChannel;
  template?: string;
  isActive: boolean;
  createdAt: string;
}

export interface WorkflowConfig {
  retryPolicy?: { maxRetries: number; backoffMs: number };
  timeout?: number;
  rollbackSteps?: number[];
  notifications?: WorkflowNotificationData[];
}

export interface WorkflowDefinitionData {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  category: string;
  steps: WorkflowStep[];
  version: number;
  status: string;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExecutionResult {
  executionId: string;
  status: WorkflowStatus;
  output?: Record<string, unknown>;
  error?: string;
  durationMs: number;
}

export interface MonitoringSummary {
  totalWorkflows: number;
  activeWorkflows: number;
  runningExecutions: number;
  pendingExecutions: number;
  failedToday: number;
  completedToday: number;
  avgDurationMs: number;
  p95DurationMs: number;
  retryRate: number;
}

export interface WorkflowAnalyticsData {
  periodStart: string;
  periodEnd: string;
  totalExecutions: number;
  completed: number;
  failed: number;
  avgDurationMs: number;
  p95DurationMs: number;
  byWorkflow: Array<{
    workflowId: string;
    workflowName: string;
    count: number;
    avgDurationMs: number;
  }>;
  byTrigger: Record<string, number>;
  hourlyDistribution: number[];
}
