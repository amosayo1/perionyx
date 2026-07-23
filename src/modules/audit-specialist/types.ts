// ─────────────────────────────────────────────────────────────
// Enterprise Audit Specialist — Type Definitions
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";

// ─── Audit Plan Types ──────────────────────────────────────

export type AuditPlanType =
  | "annual"
  | "quarterly"
  | "ad-hoc"
  | "regulatory"
  | "internal"
  | "external"
  | "follow-up";

export type AuditEngagementType =
  | "financial"
  | "operational"
  | "compliance"
  | "it"
  | "fraud"
  | "combined"
  | "forensic";

export type AuditEngagementStatus =
  | "planning"
  | "in_progress"
  | "fieldwork"
  | "review"
  | "reporting"
  | "closed"
  | "on_hold";

// ─── Control Types ─────────────────────────────────────────

export type ControlType =
  | "preventive"
  | "detective"
  | "corrective"
  | "compensating"
  | "directive";

export type ControlCategory =
  | "authorization"
  | "segregation_of_duties"
  | "reconciliation"
  | "review"
  | "physical"
  | "it_general"
  | "it_application"
  | "disclosure"
  | "reporting"
  | "compliance";

export type ControlFrequency =
  | "real_time"
  | "daily"
  | "weekly"
  | "bi_weekly"
  | "monthly"
  | "quarterly"
  | "semi_annual"
  | "annual"
  | "adhoc";

export type ControlStatus =
  | "designed"
  | "implemented"
  | "effective"
  | "ineffective"
  | "needs_improvement"
  | "retired";

// ─── Test Types ────────────────────────────────────────────

export type TestType =
  | "design_effectiveness"
  | "operating_effectiveness"
  | "walkthrough"
  | "substantive"
  | "reperformance"
  | "inquiry"
  | "observation"
  | "inspection";

export type TestMethod =
  | "sampling"
  | "full_population"
  | "automated"
  | "hybrid"
  | "manual";

export type TestResult =
  | "pass"
  | "fail"
  | "partial"
  | "exception_noted"
  | "not_tested"
  | "deferred";

// ─── Finding Types ─────────────────────────────────────────

export type FindingType =
  | "control_deficiency"
  | "significant_deficiency"
  | "material_weakness"
  | "observation"
  | "best_practice"
  | "exception";

export type FindingSeverity =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type FindingStatus =
  | "open"
  | "in_remediation"
  | "resolved"
  | "accepted"
  | "overridden";

// ─── Remediation Types ─────────────────────────────────────

export type RemediationType =
  | "immediate"
  | "short_term"
  | "long_term"
  | "strategic"
  | "workaround";

export type RemediationStatus =
  | "not_started"
  | "in_progress"
  | "on_track"
  | "behind_schedule"
  | "completed"
  | "verified"
  | "cancelled";

// ─── Evidence Types ────────────────────────────────────────

export type EvidenceType =
  | "document"
  | "screenshot"
  | "email"
  | "report"
  | "spreadsheet"
  | "system_output"
  | "policy"
  | "procedure"
  | "log"
  | "confirmation";

export type EvidenceVerificationStatus =
  | "unverified"
  | "verified"
  | "rejected"
  | "expired"
  | "pending_review";

// ─── Package Types ─────────────────────────────────────────

export type PackageType =
  | "audit_workpapers"
  | "regulatory_filing"
  | "management_letter"
  | "board_presentation"
  | "compliance_submission"
  | "evidence_collection"
  | "executive_summary";

export type PackageStatus =
  | "draft"
  | "assembling"
  | "review"
  | "approved"
  | "submitted"
  | "archived";

// ─── Readiness Types ───────────────────────────────────────

export type ReadinessAssessmentType =
  | "annual_audit"
  | "regulatory_exam"
  | "sox_compliance"
  | "iso_certification"
  | "internal_review"
  | "board_assessment"
  | "due_diligence";

export type RiskAssessmentType =
  | "enterprise"
  | "financial"
  | "operational"
  | "compliance"
  | "it"
  | "fraud"
  | "strategic"
  | "vendor";

// ─── Calendar Types ────────────────────────────────────────

export type CalendarEventType =
  | "audit_start"
  | "audit_end"
  | "fieldwork"
  | "review"
  | "reporting"
  | "deadline"
  | "meeting"
  | "training"
  | "follow_up"
  | "regulatory_filing";

export type CalendarEventStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "overdue";

// ─── Report Types ──────────────────────────────────────────

export type ReportType =
  | "audit_report"
  | "executive_summary"
  | "control_assessment"
  | "finding_report"
  | "remediation_status"
  | "compliance_status"
  | "risk_report"
  | "readiness_report"
  | "calendar_report";

export type ReportStatus =
  | "draft"
  | "generating"
  | "review"
  | "final"
  | "distributed"
  | "archived";

// ─── Workspace Types ───────────────────────────────────────

export type WorkspaceDefaultView =
  | "dashboard"
  | "controls"
  | "findings"
  | "evidence"
  | "remediation"
  | "calendar"
  | "reports";

// ─── Dashboard Interfaces ──────────────────────────────────

export interface AuditDashboardData {
  overallScore: Prisma.Decimal;
  controlEffectiveness: Prisma.Decimal;
  openFindings: number;
  criticalFindings: number;
  overdueRemediations: number;
  upcomingDeadlines: CalendarEventRecord[];
  recentFindings: FindingRecord[];
  controlsByStatus: Record<ControlStatus, number>;
  findingsBySeverity: Record<FindingSeverity, number>;
  remediationVelocity: RemediationVelocitySummary;
  readinessScore: Prisma.Decimal;
}

export interface FindingRecord {
  id: string;
  findingType: FindingType;
  severity: FindingSeverity;
  title: string;
  description: string;
  status: FindingStatus;
  controlId?: string;
}

export interface CalendarEventRecord {
  id: string;
  eventType: CalendarEventType;
  title: string;
  eventDate: Date;
  status: CalendarEventStatus;
  description?: string;
}

export interface RemediationVelocitySummary {
  totalPlans: number;
  onTrack: number;
  behindSchedule: number;
  completed: number;
  averageDaysToRemediate: number;
}

export interface ControlEffectivenessSummary {
  total: number;
  effective: number;
  ineffective: number;
  needsImprovement: number;
  notTested: number;
  effectivenessRate: Prisma.Decimal;
}

export interface FindingSummary {
  total: number;
  byType: Record<FindingType, number>;
  bySeverity: Record<FindingSeverity, number>;
  byStatus: Record<FindingStatus, number>;
}

export interface EvidencePackageSummary {
  totalPackages: number;
  byStatus: Record<PackageStatus, number>;
  totalEvidenceItems: number;
  pendingVerification: number;
}

export interface RemediationPlanSummary {
  total: number;
  byStatus: Record<RemediationStatus, number>;
  overdueCount: number;
  averageCompletionDays: number;
}

export interface AuditReadinessSummary {
  overallScore: Prisma.Decimal;
  domainScores: Record<string, Prisma.Decimal>;
  gaps: ReadinessGap[];
  lastAssessmentDate?: Date;
}

export interface ReadinessGap {
  domain: string;
  description: string;
  severity: FindingSeverity;
  recommendation: string;
}

export interface AuditRiskSummary {
  overallRiskScore: Prisma.Decimal;
  risksByCategory: Record<string, number>;
  highRiskAreas: HighRiskArea[];
  riskTrend: "improving" | "stable" | "deteriorating";
}

export interface HighRiskArea {
  area: string;
  score: Prisma.Decimal;
  findingCount: number;
  controlGapCount: number;
}

export interface ContinuousAuditResult {
  runDate: Date;
  controlFailures: ControlFailureRecord[];
  missingApprovals: MissingApprovalRecord[];
  lateReconciliations: LateReconciliationRecord[];
  highRiskEvents: HighRiskEventRecord[];
  unusualBehavior: UnusualBehaviorRecord[];
  overallScore: Prisma.Decimal;
}

export interface ControlFailureRecord {
  controlId: string;
  controlName: string;
  failureCount: number;
  lastFailure: Date;
  severity: FindingSeverity;
}

export interface MissingApprovalRecord {
  transactionId: string;
  amount: Prisma.Decimal;
  type: string;
  expectedApprover: string;
  daysOverdue: number;
}

export interface LateReconciliationRecord {
  reconciliationId: string;
  accountName: string;
  dueDate: Date;
  daysLate: number;
  amount: Prisma.Decimal;
}

export interface HighRiskEventRecord {
  eventId: string;
  eventType: string;
  description: string;
  amount: Prisma.Decimal;
  riskScore: Prisma.Decimal;
  timestamp: Date;
}

export interface UnusualBehaviorRecord {
  userId: string;
  userName: string;
  behaviorType: string;
  description: string;
  riskScore: Prisma.Decimal;
  detectedAt: Date;
}

export interface AuditCalendarEntry {
  id: string;
  eventType: CalendarEventType;
  title: string;
  description?: string;
  eventDate: Date;
  endDate?: Date;
  status: CalendarEventStatus;
  engagementId?: string;
  planId?: string;
  assignee?: string;
}

export interface AuditExecutiveSummary {
  period: string;
  overallAuditScore: Prisma.Decimal;
  totalControls: number;
  effectiveControls: number;
  totalFindings: number;
  openFindings: number;
  criticalFindings: number;
  remediationProgress: Prisma.Decimal;
  upcomingDeadlines: CalendarEventRecord[];
  riskAssessment: AuditRiskSummary;
  readinessStatus: AuditReadinessSummary;
}

// ─── Input Types ───────────────────────────────────────────

export interface GetAuditPlansInput {
  planType?: AuditPlanType;
  status?: string;
  year?: number;
  limit?: number;
  offset?: number;
}

export interface CreateAuditPlanInput {
  planType: AuditPlanType;
  title: string;
  description: string;
  year: number;
  scope?: string;
  objectives?: string[];
  estimatedBudget?: Prisma.Decimal;
  leadAuditor?: string;
}

export interface UpdateAuditPlanInput {
  title?: string;
  description?: string;
  scope?: string;
  objectives?: string[];
  status?: string;
  estimatedBudget?: Prisma.Decimal;
  leadAuditor?: string;
}

export interface GetEngagementsInput {
  engagementType?: AuditEngagementType;
  status?: AuditEngagementStatus;
  planId?: string;
  limit?: number;
  offset?: number;
}

export interface CreateEngagementInput {
  planId?: string;
  engagementType: AuditEngagementType;
  title: string;
  description: string;
  scope?: string;
  objectives?: string[];
  startDate?: Date;
  endDate?: Date;
  leadAuditor?: string;
  teamMembers?: string[];
}

export interface UpdateEngagementInput {
  title?: string;
  description?: string;
  scope?: string;
  objectives?: string[];
  status?: AuditEngagementStatus;
  startDate?: Date;
  endDate?: Date;
  leadAuditor?: string;
  teamMembers?: string[];
}

export interface GetControlsInput {
  controlType?: ControlType;
  controlCategory?: ControlCategory;
  frequency?: ControlFrequency;
  status?: ControlStatus;
  limit?: number;
  offset?: number;
}

export interface CreateControlInput {
  controlName: string;
  controlDescription: string;
  controlType: ControlType;
  controlCategory: ControlCategory;
  frequency: ControlFrequency;
  owner?: string;
  processArea?: string;
  objective?: string;
  controlOwner?: string;
  riskRating?: FindingSeverity;
}

export interface UpdateControlInput {
  controlName?: string;
  controlDescription?: string;
  controlType?: ControlType;
  controlCategory?: ControlCategory;
  frequency?: ControlFrequency;
  status?: ControlStatus;
  owner?: string;
  processArea?: string;
  objective?: string;
  controlOwner?: string;
  riskRating?: FindingSeverity;
}

export interface GetControlTestsInput {
  controlId?: string;
  testType?: TestType;
  result?: TestResult;
  from?: Date;
  to?: Date;
  limit?: number;
  offset?: number;
}

export interface CreateControlTestInput {
  controlId: string;
  testType: TestType;
  testMethod: TestMethod;
  description: string;
  sampleSize?: number;
  periodStart?: Date;
  periodEnd?: Date;
  tester?: string;
}

export interface GetControlResultsInput {
  controlId?: string;
  testType?: TestType;
  result?: TestResult;
  from?: Date;
  to?: Date;
}

export interface GetFindingsInput {
  findingType?: FindingType;
  severity?: FindingSeverity;
  status?: FindingStatus;
  controlId?: string;
  engagementId?: string;
  limit?: number;
  offset?: number;
}

export interface CreateFindingInput {
  findingType: FindingType;
  severity: FindingSeverity;
  title: string;
  description: string;
  condition?: string;
  criteria?: string;
  cause?: string;
  effect?: string;
  controlId?: string;
  engagementId?: string;
  owner?: string;
  recommendation?: string;
}

export interface UpdateFindingInput {
  findingType?: FindingType;
  severity?: FindingSeverity;
  status?: FindingStatus;
  title?: string;
  description?: string;
  condition?: string;
  criteria?: string;
  cause?: string;
  effect?: string;
  owner?: string;
  recommendation?: string;
  remediationPlanId?: string;
}

export interface GetEvidencePackagesInput {
  packageType?: PackageType;
  status?: PackageStatus;
  engagementId?: string;
  limit?: number;
  offset?: number;
}

export interface CreateEvidencePackageInput {
  packageType: PackageType;
  title: string;
  description?: string;
  engagementId?: string;
  preparedBy?: string;
}

export interface AddFindingEvidenceInput {
  evidenceType: EvidenceType;
  title: string;
  description?: string;
  documentUrl?: string;
  content?: string;
  tags?: string[];
}

export interface GetRemediationPlansInput {
  status?: RemediationStatus;
  findingId?: string;
  limit?: number;
  offset?: number;
}

export interface CreateRemediationPlanInput {
  findingId: string;
  title: string;
  description: string;
  remediationType: RemediationType;
  targetDate: Date;
  owner?: string;
  responsibleParty?: string;
  estimatedCost?: Prisma.Decimal;
  actionItems?: string[];
}

export interface CreateRemediationTaskInput {
  planId: string;
  title: string;
  description?: string;
  assignee?: string;
  dueDate?: Date;
  priority?: FindingSeverity;
}

export interface GetReadinessSnapshotsInput {
  assessmentType?: ReadinessAssessmentType;
  limit?: number;
  offset?: number;
}

export interface CreateReadinessSnapshotInput {
  assessmentType: ReadinessAssessmentType;
  title?: string;
  domainScores?: Record<string, number>;
  notes?: string;
  assessedBy?: string;
}

export interface GetRiskAssessmentsInput {
  riskType?: RiskAssessmentType;
  limit?: number;
  offset?: number;
}

export interface CreateRiskAssessmentInput {
  assessmentType: RiskAssessmentType;
  title: string;
  description: string;
  riskFactors?: Array<{
    factor: string;
    score: number;
    description?: string;
  }>;
  assessedBy?: string;
}

export interface GetAuditCalendarInput {
  from?: Date;
  to?: Date;
  eventType?: CalendarEventType;
  status?: CalendarEventStatus;
  engagementId?: string;
}

export interface AddCalendarEventInput {
  eventType: CalendarEventType;
  title: string;
  description?: string;
  eventDate: Date;
  endDate?: Date;
  engagementId?: string;
  planId?: string;
  assignee?: string;
}

export interface GetAuditReportsInput {
  reportType?: ReportType;
  status?: ReportStatus;
  limit?: number;
  offset?: number;
}

export interface CreateAuditReportInput {
  reportType: ReportType;
  title: string;
  description?: string;
  engagementId?: string;
  preparedBy?: string;
}
