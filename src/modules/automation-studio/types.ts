import type { StepDefinition, WorkflowStatus, WorkflowInstanceSummary, WorkflowMetricsSummary } from "@/modules/workflow/types";
import type { TenantContext } from "@/server/context/tenant-context";

export type AutomationCategory =
  | "treasury"
  | "compliance"
  | "approval"
  | "reconciliation"
  | "notification"
  | "connector"
  | "reporting"
  | "governance"
  | "expense"
  | "budget"
  | "close"
  | "payment"
  | "procurement";

export type AutomationKind =
  | "automated"
  | "semi_automated"
  | "manual";

// ── Template ───────────────────────────────────────────────────────────

export type TemplateStatus = "active" | "draft" | "archived";

export interface TemplateMetadata {
  author: string;
  version: string;
  tags: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
  estimatedDuration: string;
  requiresApproval: boolean;
  defaultSchedule: string | null;
}

export interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  category: AutomationCategory;
  icon: string;
  kind: AutomationKind;
  steps: StepDefinition[];
  inputSchema: Record<string, unknown> | null;
  outputSchema: Record<string, unknown> | null;
  metadata: TemplateMetadata;
  triggerType: "manual" | "scheduled" | "event";
  popularity: "high" | "medium" | "low";
  status: TemplateStatus;
}

export interface TemplateVersionInfo {
  version: string;
  createdAt: string;
  changelog: string;
  templateId: string;
}

export interface DuplicateTemplateOptions {
  name?: string;
  category?: AutomationCategory;
  mergeTags?: string[];
}

// ── Blueprint (Designer Draft) ─────────────────────────────────────────

export type BlueprintStatus = "draft" | "published" | "archived";

export interface WorkflowBlueprint {
  id: string;
  companyId: string;
  name: string;
  description: string;
  steps: StepDefinition[];
  category: AutomationCategory;
  inputSchema: Record<string, unknown> | null;
  outputSchema: Record<string, unknown> | null;
  status: BlueprintStatus;
  version: number;
  isSystem: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlueprintInput {
  name: string;
  description?: string;
  steps: StepDefinition[];
  category: AutomationCategory;
  inputSchema?: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
}

export interface UpdateBlueprintInput {
  name?: string;
  description?: string;
  steps?: StepDefinition[];
  category?: AutomationCategory;
  inputSchema?: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
}

// ── Condition Evaluator / Business Rules Builder ───────────────────────

export type ConditionOperator = "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "contains" | "matches";

export interface RuleCondition {
  variable: string;
  operator: ConditionOperator;
  value: unknown;
}

export interface ConditionGroup {
  logic: "AND" | "OR";
  conditions: Array<ConditionGroup | RuleCondition>;
}

export type RuleActionType =
  | "require_approval"
  | "notify"
  | "block"
  | "retry"
  | "escalate"
  | "set_variable"
  | "route";

export interface RuleAction {
  type: RuleActionType;
  config: Record<string, unknown>;
}

export interface BusinessRuleDefinition {
  id: string;
  companyId: string;
  name: string;
  description: string;
  category: string;
  priority: number;
  when: ConditionGroup;
  then: RuleAction[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBusinessRuleDefinitionInput {
  name: string;
  description?: string;
  category: string;
  priority: number;
  when: ConditionGroup;
  then: RuleAction[];
  isActive?: boolean;
}

export type VariableSource = "workflow" | "connector" | "decision" | "policy" | "governance";

// ── Approval Matrix ────────────────────────────────────────────────────

export type ApprovalMode = "sequential" | "parallel";

export interface ApprovalCondition {
  field: string;
  operator: ConditionOperator;
  value: unknown;
}

export interface ApprovalHistoryEntry {
  id: string;
  ruleId: string;
  instanceId: string;
  stepId: string;
  approverId: string;
  approverRole: string;
  action: "approved" | "rejected" | "delegated" | "escalated" | "timed_out";
  comment: string | null;
  delegatedTo: string | null;
  actedAt: string;
}

export interface ApprovalMatrixRule {
  id: string;
  companyId: string;
  name: string;
  description: string;
  priority: number;
  conditions: ApprovalCondition[];
  requiredApprovers: number;
  approverRoles: string[];
  approvalMode: ApprovalMode;
  timeoutMinutes: number;
  escalationEnabled: boolean;
  escalationDelayMinutes: number | null;
  escalationRoles: string[] | null;
  delegationEnabled: boolean;
  delegationRoles: string[] | null;
  departmentScope: string | null;
  thresholdField: string | null;
  thresholdOperator: ConditionOperator | null;
  thresholdValue: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApprovalMatrixRuleInput {
  name: string;
  description?: string;
  priority: number;
  conditions: ApprovalCondition[];
  requiredApprovers: number;
  approverRoles: string[];
  approvalMode?: ApprovalMode;
  timeoutMinutes: number;
  escalationEnabled?: boolean;
  escalationDelayMinutes?: number;
  escalationRoles?: string[];
  delegationEnabled?: boolean;
  delegationRoles?: string[];
  departmentScope?: string;
  thresholdField?: string;
  thresholdOperator?: ConditionOperator;
  thresholdValue?: number;
  isActive?: boolean;
}

export interface UpdateApprovalMatrixRuleInput extends Partial<CreateApprovalMatrixRuleInput> {
  id: string;
}

export interface ApprovalConfig {
  ruleId: string;
  ruleName: string;
  requiredApprovers: number;
  approverRoles: string[];
  approvalMode: ApprovalMode;
  timeoutMinutes: number;
  escalationEnabled: boolean;
  escalationDelayMinutes: number | null;
  escalationRoles: string[] | null;
  delegationEnabled: boolean;
  delegationRoles: string[] | null;
}

// ── Business Rules ─────────────────────────────────────────────────────

export type BusinessRuleType = "policy" | "threshold" | "validation" | "routing";

export interface BusinessRule {
  id: string;
  companyId: string;
  name: string;
  description: string;
  category: string;
  ruleType: BusinessRuleType;
  config: Record<string, unknown>;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBusinessRuleInput {
  name: string;
  description?: string;
  category: string;
  ruleType: BusinessRuleType;
  config: Record<string, unknown>;
  priority: number;
  isActive?: boolean;
}

export interface UpdateBusinessRuleInput extends Partial<CreateBusinessRuleInput> {
  id: string;
}

// ── Schedule ───────────────────────────────────────────────────────────

export type ScheduleTriggerType =
  | "immediate"
  | "scheduled"
  | "recurring"
  | "cron"
  | "webhook"
  | "manual"
  | "connector_event"
  | "bank_event"
  | "erp_event"
  | "approval_event"
  | "governance_event"
  | "decision_event";

export interface AutomationSchedule {
  id: string;
  companyId: string;
  templateId: string | null;
  blueprintId: string | null;
  name: string;
  triggerType: ScheduleTriggerType;
  cronExpression: string | null;
  startAt: string | null;
  eventSource: string | null;
  eventType: string | null;
  input: Record<string, unknown> | null;
  enabled: boolean;
  lastRunAt: string | null;
  nextRunAt: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScheduleInput {
  templateId?: string;
  blueprintId?: string;
  name: string;
  triggerType: ScheduleTriggerType;
  cronExpression?: string;
  startAt?: string;
  eventSource?: string;
  eventType?: string;
  input?: Record<string, unknown>;
  enabled?: boolean;
}

export interface UpdateScheduleInput {
  id: string;
  triggerType?: ScheduleTriggerType;
  cronExpression?: string;
  startAt?: string;
  eventSource?: string;
  eventType?: string;
  input?: Record<string, unknown>;
  enabled?: boolean;
}

// ── Analytics ──────────────────────────────────────────────────────────

export interface TopPerformingTemplate {
  templateId: string;
  name: string;
  executionCount: number;
  successRate: number;
  averageDurationMs: number;
}

export interface ExecutionTrend {
  date: string;
  count: number;
  failures: number;
}

export interface CategoryBreakdown {
  category: string;
  count: number;
  successRate: number;
}

export interface AutomationAnalytics {
  totalTemplates: number;
  activeBlueprints: number;
  activeSchedules: number;
  executionsToday: number;
  executionsThisWeek: number;
  executionsThisMonth: number;
  successRate: number;
  failureRate: number;
  averageDurationMs: number;
  topPerformingTemplates: TopPerformingTemplate[];
  executionTrend: ExecutionTrend[];
  categoryBreakdown: CategoryBreakdown[];
  workflowMetrics: WorkflowMetricsSummary;
}

// ── Execution ──────────────────────────────────────────────────────────

export interface ExecuteTemplateInput {
  templateId: string;
  input?: Record<string, unknown>;
  scheduledFor?: string;
  assignedToId?: string;
}

export interface ExecuteBlueprintInput {
  blueprintId: string;
  input?: Record<string, unknown>;
  scheduledFor?: string;
  assignedToId?: string;
}

export interface AutomationExecutionResult {
  instanceId: string;
  status: WorkflowStatus;
  definitionId: string;
}

// ── List Options ───────────────────────────────────────────────────────

export interface ListExecutionsOptions {
  status?: WorkflowStatus;
  definitionId?: string;
  limit?: number;
}

// ── Workflow Analytics ──────────────────────────────────────────────────

export interface StepDurationSummary {
  stepType: string;
  averageDurationMs: number;
  minDurationMs: number;
  maxDurationMs: number;
  executionCount: number;
}

export interface ApprovalBottleneck {
  stepType: string;
  definitionName: string | null;
  instanceId: string;
  stepLabel: string;
  waitingSince: string;
  waitTimeMs: number;
  waitTimeMinutes: number;
}

export interface StepFailureRate {
  stepType: string;
  totalExecutions: number;
  failedCount: number;
  completedCount: number;
  failureRate: number;
}

export interface MostUsedWorkflow {
  definitionId: string;
  name: string;
  executionCount: number;
  lastExecutedAt: string | null;
}

export interface QueueMetricSummary {
  queueName: string;
  queued: number;
  active: number;
  failed: number;
  scheduled: number;
}

export interface WorkflowAnalytics {
  running: number;
  completed: number;
  failed: number;
  waiting: number;
  paused: number;
  cancelled: number;
  totalInstances: number;
  averageExecutionTimeMs: number;
  successRate: number;
  failureRate: number;
  stepDuration: StepDurationSummary[];
  approvalBottlenecks: ApprovalBottleneck[];
  stepFailureRate: StepFailureRate[];
  topTemplates: TopPerformingTemplate[];
  mostUsedWorkflows: MostUsedWorkflow[];
  queueMetrics: QueueMetricSummary[];
  computedAt: string;
}

// ── Analytics Query Options ────────────────────────────────────────────

export interface AnalyticsQueryOptions {
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}

// ── Registry State ─────────────────────────────────────────────────────

export interface RegistryState {
  templateCount: number;
  activeRuleCount: number;
  activeScheduleCount: number;
  publishedBlueprintCount: number;
  draftBlueprintCount: number;
  engineConnected: boolean;
}
