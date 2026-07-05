export { AutomationStudioService } from "./automation-studio.service";
export { TemplateLibrary } from "./template-library";
export { AutomationRegistry } from "./automation-registry";
export { BUILTIN_TEMPLATES } from "./templates";
export { BusinessRulesBuilder, businessRulesBuilder } from "./business-rules-builder";
export { ApprovalMatrixEvaluator, approvalMatrixEvaluator } from "./approval-matrix-evaluator";
export { AutomationScheduler, automationScheduler } from "./automation-scheduler";
export { WorkflowAnalyticsService } from "./workflow-analytics.service";

export type { AutomationTemplate } from "./templates";
export type { WorkflowTemplate } from "./templates";
export type {
  AutomationCategory,
  AutomationKind,
  TemplateStatus,
  TemplateMetadata,
  TemplateVersionInfo,
  DuplicateTemplateOptions,
  WorkflowBlueprint,
  CreateBlueprintInput,
  UpdateBlueprintInput,
  BlueprintStatus,
  ConditionOperator,
  RuleCondition,
  ConditionGroup,
  RuleActionType,
  RuleAction,
  BusinessRuleDefinition,
  CreateBusinessRuleDefinitionInput,
  VariableSource,
  ApprovalMode,
  ApprovalCondition,
  ApprovalHistoryEntry,
  ApprovalMatrixRule,
  CreateApprovalMatrixRuleInput,
  UpdateApprovalMatrixRuleInput,
  ApprovalConfig,
  BusinessRule,
  BusinessRuleType,
  CreateBusinessRuleInput,
  UpdateBusinessRuleInput,
  ScheduleTriggerType,
  AutomationSchedule,
  CreateScheduleInput,
  UpdateScheduleInput,
  AutomationAnalytics,
  TopPerformingTemplate,
  ExecutionTrend,
  CategoryBreakdown,
  AutomationExecutionResult,
  ExecuteTemplateInput,
  ExecuteBlueprintInput,
  ListExecutionsOptions,
  RegistryState,
  WorkflowAnalytics,
  StepDurationSummary,
  ApprovalBottleneck,
  StepFailureRate,
  MostUsedWorkflow,
  QueueMetricSummary,
} from "./types";
export type { ScheduledExecutionPayload } from "./automation-scheduler";
