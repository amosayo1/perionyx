// ─────────────────────────────────────────────────────────────
// Enterprise Finance Collaboration Platform — Barrel Export
// ─────────────────────────────────────────────────────────────

export { FinanceCollaborationService } from "./finance-collaboration";
export { CaseManagementService } from "./case-management";
export { AssignmentEngine } from "./assignment-engine";
export { TimelineService } from "./timeline";
export { EvidenceCenter } from "./evidence-center";
export { EnterpriseMemory } from "./enterprise-memory";
export { DecisionRegistry } from "./decision-registry";
export { WorkloadManager } from "./workload-manager";
export { CollaborationAnalytics } from "./collaboration-analytics";

export type {
  // Case Types
  CaseType,
  CaseStatus,
  CasePriority,

  // Participant Types
  ParticipantType,
  ParticipantRole,

  // Assignment Types
  AssignmentType,
  AssignmentStatus,

  // Comment Types
  CommentType,

  // Evidence Types
  EvidenceType,
  VerificationStatus,

  // Decision Types
  DecisionType,
  DecisionResult,
  RegistryDecisionType,
  RegistryDecisionStatus,

  // Recommendation Types
  RecommendationCategory,
  SharedRecommendationStatus,
  RiskLevel,

  // Task Types
  TaskType,
  TaskStatus,
  DependencyType,
  HistoryEventType,

  // Timeline Types
  TimelineEventType,
  EventSourceType,

  // Workload Types
  QueueType,
  MemoryType,

  // Dashboard Interfaces
  CollaborationDashboardData,
  CasesSummary,
  TasksSummary,
  CollaborationRecommendationSummary,
  CollaborationAlertSummary,
  CollaborationAlertRecord,
  CaseRecord,
  TaskRecord,
  TimelineEvent,
  ParticipantRecord,
  CommentRecord,
  EvidenceRecord,
  CaseDecisionRecord,
  AssignmentRecord,
  WorkloadRecord,
  WorkQueueItem,
  SharedEvidenceItem,
  MemoryEntry,
  DecisionRegistryEntry,

  // Analytics Interfaces
  AnalyticsData,
  CrossSpecialistMetric,
  CaseMetric,
  TaskMetric,
  RecommendationMetric,
  EscalationMetric,
  WorkloadMetric,

  // Input Types
  GetCasesInput,
  CreateCaseInput,
  UpdateCaseInput,
  GetAssignmentsInput,
  CreateAssignmentInput,
  GetTimelineInput,
  AddTimelineEventInput,
  GetRecommendationsInput,
  CreateSharedRecommendationInput,
  GetWorkQueueInput,
  GetAnalyticsInput,
  GetMemoryInput,
  StoreMemoryInput,
  GetDecisionsInput,
  CreateDecisionInput,
  GetWorkloadsInput,
} from "./types";
