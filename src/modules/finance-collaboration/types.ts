// ─────────────────────────────────────────────────────────────
// Enterprise Finance Collaboration Platform — Type Definitions
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import type { WorkQueuePriority } from "@/modules/work-queue";

// ─── Case Types ──────────────────────────────────────────────

export type CaseType =
  | "month_end_close"
  | "bank_reconciliation"
  | "liquidity_risk"
  | "journal_investigation"
  | "fraud_investigation"
  | "treasury_exception"
  | "audit_finding"
  | "compliance_issue"
  | "cash_forecast"
  | "policy_violation"
  | "general";

export type CaseStatus =
  | "open"
  | "in_progress"
  | "awaiting_input"
  | "escalated"
  | "resolved"
  | "closed";

export type CasePriority = WorkQueuePriority;

// ─── Participant Types ───────────────────────────────────────

export type ParticipantType = "specialist" | "human";
export type ParticipantRole =
  | "owner"
  | "contributor"
  | "observer"
  | "approver"
  | "escalated";

// ─── Assignment Types ────────────────────────────────────────

export type AssignmentType =
  | "investigation"
  | "analysis"
  | "review"
  | "approval"
  | "escalation";

export type AssignmentStatus =
  | "pending"
  | "accepted"
  | "in_progress"
  | "completed"
  | "rejected"
  | "cancelled";

// ─── Comment Types ───────────────────────────────────────────

export type CommentType =
  | "update"
  | "question"
  | "answer"
  | "escalation"
  | "approval"
  | "rejection";

// ─── Evidence Types ──────────────────────────────────────────

export type EvidenceType =
  | "ledger"
  | "transaction"
  | "report"
  | "policy"
  | "document"
  | "workflow"
  | "audit"
  | "bank_data"
  | "treasury_data"
  | "financial_statement";

export type VerificationStatus = "verified" | "unverified" | "disputed";

// ─── Decision Types ──────────────────────────────────────────

export type DecisionType =
  | "resolution"
  | "approval"
  | "rejection"
  | "escalation"
  | "policy_exception"
  | "resource_allocation";

export type DecisionResult =
  | "approved"
  | "rejected"
  | "escalated"
  | "deferred";

export type RegistryDecisionType =
  | "strategic"
  | "operational"
  | "policy"
  | "resource"
  | "risk"
  | "compliance";

export type RegistryDecisionStatus =
  | "proposed"
  | "reviewing"
  | "approved"
  | "rejected"
  | "implemented"
  | "overturned";

// ─── Recommendation Types ────────────────────────────────────

export type RecommendationCategory =
  | "cash"
  | "liquidity"
  | "fx"
  | "debt"
  | "investment"
  | "risk"
  | "policy"
  | "operations"
  | "compliance"
  | "audit"
  | "accounting";

export type SharedRecommendationStatus =
  | "proposed"
  | "approved"
  | "rejected"
  | "implementing"
  | "completed"
  | "expired";

export type RiskLevel = "low" | "medium" | "high" | "critical";

// ─── Task Types ──────────────────────────────────────────────

export type TaskType =
  | "investigation"
  | "analysis"
  | "review"
  | "approval"
  | "monitoring"
  | "reconciliation"
  | "reporting";

export type TaskStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "blocked"
  | "overdue"
  | "cancelled";

export type DependencyType = "blocks" | "requires" | "informs";

export type HistoryEventType =
  | "created"
  | "assigned"
  | "status_change"
  | "comment"
  | "escalation"
  | "completion";

// ─── Timeline Types ──────────────────────────────────────────

export type TimelineEventType =
  | "assignment"
  | "recommendation"
  | "evidence"
  | "approval"
  | "comment"
  | "investigation"
  | "workflow_event"
  | "system_event"
  | "financial_event"
  | "human_action"
  | "ai_action"
  | "escalation"
  | "decision";

export type EventSourceType = "specialist" | "human" | "system";

// ─── Workload Types ──────────────────────────────────────────

export type QueueType =
  | "specialist"
  | "cross_specialist"
  | "human_review"
  | "approval";

export type MemoryType =
  | "case_context"
  | "decision_history"
  | "risk_context"
  | "policy_context"
  | "investigation_context"
  | "relationship_context";

// ─── Dashboard Interfaces ────────────────────────────────────

export interface CollaborationDashboardData {
  cases: CasesSummary;
  tasks: TasksSummary;
  recommendations: CollaborationRecommendationSummary;
  alerts: CollaborationAlertSummary;
  timeline: TimelineEvent[];
  healthScore: Prisma.Decimal;
}

export interface CasesSummary {
  totalOpen: number;
  totalInProgress: number;
  totalEscalated: number;
  totalResolved: number;
  totalClosed: number;
  byType: Record<CaseType, number>;
  byPriority: Record<CasePriority, number>;
  recentCases: CaseRecord[];
}

export interface TasksSummary {
  totalPending: number;
  totalInProgress: number;
  totalCompleted: number;
  totalOverdue: number;
  totalBlocked: number;
  byType: Record<TaskType, number>;
  overdueTasks: TaskRecord[];
}

export interface CollaborationRecommendationSummary {
  totalProposed: number;
  totalApproved: number;
  totalImplementing: number;
  totalCompleted: number;
  byCategory: Record<RecommendationCategory, number>;
}

export interface CollaborationAlertSummary {
  totalActive: number;
  bySeverity: Record<RiskLevel, number>;
  criticalAlerts: CollaborationAlertRecord[];
}

export interface CollaborationAlertRecord {
  id: string;
  title: string;
  description: string;
  severity: RiskLevel;
  caseType?: CaseType;
}

export interface CaseRecord {
  id: string;
  caseNumber: number;
  title: string;
  caseType: CaseType;
  status: CaseStatus;
  priority: CasePriority;
  createdAt: Date;
}

export interface TaskRecord {
  id: string;
  title: string;
  taskType: TaskType;
  status: TaskStatus;
  assignedTo: string;
  dueDate?: Date | null;
  caseId?: string | null;
}

export interface TimelineEvent {
  id: string;
  caseId?: string | null;
  specialist?: string | null;
  eventType: TimelineEventType;
  sourceType: EventSourceType;
  title: string;
  description: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface ParticipantRecord {
  id: string;
  caseId: string;
  participantType: ParticipantType;
  participantId: string;
  participantName: string;
  role: ParticipantRole;
  joinedAt: Date;
}

export interface CommentRecord {
  id: string;
  caseId: string;
  authorId: string;
  authorName: string;
  commentType: CommentType;
  content: string;
  createdAt: Date;
}

export interface EvidenceRecord {
  id: string;
  caseId?: string;
  title: string;
  description: string;
  evidenceType: EvidenceType;
  referenceId?: string;
  referenceType?: string;
  sourceSpecialist?: string;
  verificationStatus: VerificationStatus;
  verifiedBy?: string;
  createdAt: Date;
}

export interface CaseDecisionRecord {
  id: string;
  caseId: string;
  decisionType: DecisionType;
  result: DecisionResult;
  decidedBy: string;
  reason: string;
  createdAt: Date;
}

export interface AssignmentRecord {
  id: string;
  caseId: string;
  title: string;
  assignmentType: AssignmentType;
  status: AssignmentStatus;
  assignedTo: string;
  assignedBy: string;
  dueDate?: Date;
  createdAt: Date;
}

export interface WorkloadRecord {
  specialist: string;
  activeAssignments: number;
  totalCapacity: number;
  utilizationRate: Prisma.Decimal;
  overdueCount: number;
  byType: Partial<Record<AssignmentType, number>>;
}

export interface SpecialistQueueItem {
  id: string;
  title: string;
  queueType: QueueType;
  priority: CasePriority;
  assignedTo?: string;
  caseId?: string;
  assignmentId?: string;
  createdAt: Date;
}

export interface SharedEvidenceItem {
  id: string;
  title: string;
  description: string;
  evidenceType: EvidenceType;
  verificationStatus: VerificationStatus;
  sourceSpecialist?: string;
  referenceId?: string;
  referenceType?: string;
  usedInCases: string[];
  createdAt: Date;
}

export interface MemoryEntry {
  id: string;
  companyId: string;
  memoryType: MemoryType;
  specialist?: string;
  caseId?: string;
  entityKey: string;
  content: Record<string, unknown>;
  confidence: Prisma.Decimal;
  expiresAt?: Date;
  createdAt: Date;
}

export interface DecisionRegistryEntry {
  id: string;
  decisionNumber: number;
  decisionType: RegistryDecisionType;
  status: RegistryDecisionStatus;
  title: string;
  description: string;
  decidedBy: string;
  approvals: string[];
  rejections: Array<{ rejector: string; reason: string }>;
  createdAt: Date;
  resolvedAt: Date;
}

export interface AnalyticsData {
  totalCases: number;
  totalAssignments: number;
  totalRecommendations: number;
  totalDecisions: number;
  averageResolutionTimeHours: Prisma.Decimal;
  onTimeCompletionRate: Prisma.Decimal;
  escalationRate: Prisma.Decimal;
  collaborationScore: Prisma.Decimal;
}

export interface CrossSpecialistMetric {
  specialistA: string;
  specialistB: string;
  collaborationCount: number;
  sharedCases: number;
  sharedEvidence: number;
}

export interface CaseMetric {
  caseType: CaseType;
  totalCount: number;
  averageDurationHours: Prisma.Decimal;
  resolutionRate: Prisma.Decimal;
  escalationRate: Prisma.Decimal;
}

export interface TaskMetric {
  taskType: TaskType;
  totalCount: number;
  completionRate: Prisma.Decimal;
  overdueRate: Prisma.Decimal;
  averageDurationHours: Prisma.Decimal;
}

export interface RecommendationMetric {
  category: RecommendationCategory;
  totalCount: number;
  adoptionRate: Prisma.Decimal;
  averageTimeToDecisionHours: Prisma.Decimal;
}

export interface EscalationMetric {
  totalEscalations: number;
  escalationRate: Prisma.Decimal;
  averageResolutionHours: Prisma.Decimal;
  byCaseType: Record<CaseType, number>;
}

export interface WorkloadMetric {
  specialist: string;
  currentLoad: number;
  maxCapacity: number;
  utilizationRate: Prisma.Decimal;
  overdueCount: number;
  averageTaskDurationHours: Prisma.Decimal;
}

// ─── Input Types ─────────────────────────────────────────────

export interface GetCasesInput {
  status?: CaseStatus;
  caseType?: CaseType;
  priority?: CasePriority;
  specialist?: string;
  limit?: number;
  offset?: number;
}

export interface CreateCaseInput {
  title: string;
  description: string;
  caseType: CaseType;
  priority: CasePriority;
  assignee?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateCaseInput {
  title?: string;
  description?: string;
  status?: CaseStatus;
  priority?: CasePriority;
  metadata?: Record<string, unknown>;
}

export interface GetAssignmentsInput {
  status?: AssignmentStatus;
  assignmentType?: AssignmentType;
  specialist?: string;
  caseId?: string;
  limit?: number;
  offset?: number;
}

export interface CreateAssignmentInput {
  caseId: string;
  title: string;
  description?: string;
  assignmentType: AssignmentType;
  assignedTo: string;
  assignedBy: string;
  dueDate?: Date;
  metadata?: Record<string, unknown>;
}

export interface GetTimelineInput {
  caseId?: string;
  specialist?: string;
  eventType?: TimelineEventType;
  sourceType?: EventSourceType;
  from?: Date;
  to?: Date;
  limit?: number;
  offset?: number;
}

export interface AddTimelineEventInput {
  caseId?: string;
  specialist?: string;
  eventType: TimelineEventType;
  sourceType: EventSourceType;
  title: string;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface GetRecommendationsInput {
  category?: RecommendationCategory;
  status?: SharedRecommendationStatus;
  riskLevel?: RiskLevel;
  specialist?: string;
  limit?: number;
  offset?: number;
}

export interface CreateSharedRecommendationInput {
  title: string;
  description: string;
  category: RecommendationCategory;
  riskLevel: RiskLevel;
  businessReason: string;
  proposedBy: string;
  supportingEvidence?: string[];
  affectedModules?: string[];
}

export interface GetWorkQueueInput {
  queueType?: QueueType;
  specialist?: string;
  priority?: CasePriority;
  limit?: number;
  offset?: number;
}

export interface GetAnalyticsInput {
  from?: Date;
  to?: Date;
  caseType?: CaseType;
  specialist?: string;
}

export interface GetMemoryInput {
  memoryType?: MemoryType;
  specialist?: string;
  entityKey?: string;
  caseId?: string;
  limit?: number;
  offset?: number;
}

export interface StoreMemoryInput {
  memoryType: MemoryType;
  specialist?: string;
  caseId?: string;
  entityKey: string;
  content: Record<string, unknown>;
  confidence?: Prisma.Decimal;
  expiresAt?: Date;
}

export interface GetDecisionsInput {
  status?: RegistryDecisionStatus;
  decisionType?: RegistryDecisionType;
  decidedBy?: string;
  limit?: number;
  offset?: number;
}

export interface CreateDecisionInput {
  title: string;
  description: string;
  decisionType: RegistryDecisionType;
  decidedBy: string;
  context?: Record<string, unknown>;
}

export interface GetWorkloadsInput {
  specialist?: string;
}
