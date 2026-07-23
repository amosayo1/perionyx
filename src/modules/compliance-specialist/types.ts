// ─────────────────────────────────────────────────────────────
// Enterprise Compliance Specialist — Type Definitions
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";

// ─── Framework Types ───────────────────────────────────────

export type FrameworkType =
  | "sox"
  | "gaap"
  | "ifrs"
  | "basel_iii"
  | "mifid_ii"
  | "gdpr"
  | "ccpa"
  | "aml_kyc"
  | "pci_dss"
  | "iso_27001"
  | "soc_2"
  | "coso"
  | "nist"
  | "hipaa"
  | "fedramp"
  | "dORA"
  | "custom";

export type RequirementType =
  | "control"
  | "procedure"
  | "disclosure"
  | "reporting"
  | "data_protection"
  | "operational"
  | "governance"
  | "financial"
  | "technical"
  | "organizational";

// ─── Obligation Types ──────────────────────────────────────

export type ObligationType =
  | "regulatory"
  | "contractual"
  | "internal_policy"
  | "industry_standard"
  | "legal"
  | "tax"
  | "disclosure"
  | "reporting";

export type ObligationStatus =
  | "active"
  | "pending"
  | "overdue"
  | "completed"
  | "suspended"
  | "expired"
  | "waived";

// ─── Policy Types ──────────────────────────────────────────

export type PolicyCategory =
  | "information_security"
  | "data_privacy"
  | "anti_fraud"
  | "aml"
  | "kyc"
  | "conflict_of_interest"
  | "whistleblower"
  | "code_of_conduct"
  | "vendor_management"
  | "business_continuity"
  | "incident_response"
  | "access_control"
  | "change_management"
  | "retention"
  | "ethics"
  | "operational_risk";

export type PolicyStatus =
  | "draft"
  | "under_review"
  | "approved"
  | "active"
  | "superseded"
  | "retired"
  | "archived";

// ─── Violation Types ───────────────────────────────────────

export type ViolationType =
  | "regulatory_breach"
  | "policy_violation"
  | "control_failure"
  | "reporting_failure"
  | "disclosure_failure"
  | "data_breach"
  | "unauthorized_access"
  | "conflict_of_interest"
  | "aml_suspicious_activity"
  | "fiduciary_breach";

export type ViolationSeverity =
  | "low"
  | "medium"
  | "high"
  | "critical"
  | "systemic";

export type ViolationStatus =
  | "detected"
  | "under_investigation"
  | "confirmed"
  | "remediation_required"
  | "remediation_in_progress"
  | "resolved"
  | "escalated"
  | "closed"
  | "false_positive";

// ─── Assessment Types ──────────────────────────────────────

export type AssessmentType =
  | "gap_analysis"
  | "risk_assessment"
  | "maturity_assessment"
  | "impact_assessment"
  | "compliance_review"
  | "control_effectiveness"
  | "vendor_assessment"
  | "incident_assessment"
  | "annual_review"
  | "regulatory_impact";

// ─── Filing Types ──────────────────────────────────────────

export type FilingType =
  | "regulatory_return"
  | "tax_filing"
  | "statutory_return"
  | "disclosure"
  | "notification"
  | "annual_report"
  | "quarterly_report"
  | "sar"
  | "ctr"
  | "suspicious_activity_report"
  | "breach_notification"
  | "board_report";

export type FilingFrequency =
  | "one_time"
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "semi_annual"
  | "annual"
  | "on_event";

export type FilingStatus =
  | "not_started"
  | "in_preparation"
  | "under_review"
  | "pending_approval"
  | "approved"
  | "submitted"
  | "accepted"
  | "rejected"
  | "overdue"
  | "amended";

// ─── Deadline Types ────────────────────────────────────────

export type DeadlineType =
  | "filing"
  | "reporting"
  | "assessment"
  | "policy_review"
  | "training"
  | "audit"
  | "board_presentation"
  | "regulatory_response"
  | "remediation"
  | "disclosure";

export type DeadlineStatus =
  | "upcoming"
  | "in_progress"
  | "completed"
  | "overdue"
  | "extended"
  | "cancelled";

// ─── Regulatory Update Types ───────────────────────────────

export type RegulatoryUpdateType =
  | "new_regulation"
  | "amendment"
  | "guidance"
  | "enforcement_action"
  | "interpretation"
  | "exemption"
  | "consultation"
  | "standard_update"
  | "case_law";

// ─── Remediation Types ─────────────────────────────────────

export type RemediationStatus =
  | "not_started"
  | "in_progress"
  | "on_track"
  | "behind_schedule"
  | "completed"
  | "verified"
  | "overdue"
  | "cancelled";

// ─── Briefing Types ────────────────────────────────────────

export type BriefingType =
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "ad_hoc"
  | "regulatory_change"
  | "violation_alert"
  | "filing_reminder"
  | "board_summary";

// ─── Workspace Types ───────────────────────────────────────

export type WorkspaceDefaultView =
  | "dashboard"
  | "frameworks"
  | "policies"
  | "obligations"
  | "violations"
  | "filings"
  | "intelligence"
  | "remediation"
  | "analytics"
  | "briefings";

// ─── Dashboard Interfaces ──────────────────────────────────

export interface ComplianceDashboardData {
  overallScore: Prisma.Decimal;
  activeFrameworks: number;
  totalObligations: number;
  overdueObligations: number;
  openViolations: number;
  criticalViolations: number;
  upcomingFilings: ComplianceFilingRecord[];
  recentViolations: ComplianceViolationRecord[];
  obligationsByStatus: Record<ObligationStatus, number>;
  violationsBySeverity: Record<ViolationSeverity, number>;
  policyComplianceRate: Prisma.Decimal;
  upcomingDeadlines: ComplianceDeadlineRecord[];
}

export interface ComplianceFilingRecord {
  id: string;
  filingType: FilingType;
  title: string;
  dueDate: Date;
  status: FilingStatus;
  jurisdiction?: string;
}

export interface ComplianceViolationRecord {
  id: string;
  violationType: ViolationType;
  severity: ViolationSeverity;
  title: string;
  description: string;
  status: ViolationStatus;
  policyId?: string;
  frameworkId?: string;
}

export interface ComplianceDeadlineRecord {
  id: string;
  deadlineType: DeadlineType;
  title: string;
  dueDate: Date;
  status: DeadlineStatus;
  daysUntilDue: number;
  assignee?: string;
}

export interface ComplianceAnalytics {
  complianceScore: Prisma.Decimal;
  violationsTrend: TrendDataPoint[];
  filingTimelinessRate: Prisma.Decimal;
  policyAdherenceRate: Prisma.Decimal;
  riskHeatmap: RiskHeatmapEntry[];
  remediationVelocity: RemediationVelocityData;
  regulatoryChangeImpact: RegulatoryChangeImpact;
}

export interface TrendDataPoint {
  date: string;
  value: Prisma.Decimal;
  label?: string;
}

export interface RiskHeatmapEntry {
  domain: string;
  likelihood: number;
  impact: number;
  score: Prisma.Decimal;
  violationCount: number;
}

export interface RemediationVelocityData {
  totalRemediations: number;
  onTrack: number;
  behindSchedule: number;
  overdue: number;
  averageDaysToRemediate: number;
}

export interface RegulatoryChangeImpact {
  totalUpdates: number;
  pendingAssessment: number;
  highImpact: number;
  mediumImpact: number;
  lowImpact: number;
  recentChanges: RegulatoryUpdateRecord[];
}

export interface RegulatoryUpdateRecord {
  id: string;
  updateType: RegulatoryUpdateType;
  title: string;
  jurisdiction: string;
  summary: string;
  impactLevel?: string;
  publishedDate: Date;
}

export interface ComplianceExecutiveSummary {
  period: string;
  overallComplianceScore: Prisma.Decimal;
  totalFrameworks: number;
  activePolicies: number;
  totalObligations: number;
  overdueObligations: number;
  openViolations: number;
  criticalViolations: number;
  upcomingFilings: number;
  lateFilings: number;
  remediationProgress: Prisma.Decimal;
  riskTrend: "improving" | "stable" | "deteriorating";
}

export interface ComplianceBriefing {
  briefingType: BriefingType;
  generatedAt: Date;
  period: string;
  summary: string;
  keyMetrics: BriefingMetric[];
  criticalItems: BriefingItem[];
  upcomingDeadlines: ComplianceDeadlineRecord[];
  recentViolations: ComplianceViolationRecord[];
  regulatoryChanges: RegulatoryUpdateRecord[];
  recommendations: string[];
}

export interface BriefingMetric {
  label: string;
  value: Prisma.Decimal;
  change?: Prisma.Decimal;
  trend?: "up" | "down" | "flat";
}

export interface BriefingItem {
  id: string;
  type: "violation" | "filing" | "deadline" | "regulatory_change" | "policy";
  title: string;
  description: string;
  severity: ViolationSeverity;
  actionRequired: boolean;
}

export interface ComplianceHealthSnapshot {
  id: string;
  snapshotDate: Date;
  overallScore: Prisma.Decimal;
  domainScores: Record<string, Prisma.Decimal>;
  activeViolations: number;
  overdueObligations: number;
  upcomingDeadlines: number;
  policyComplianceRate: Prisma.Decimal;
  riskLevel: ViolationSeverity;
  notes?: string;
}

export interface RiskAssessmentRecord {
  id: string;
  assessmentType: AssessmentType;
  title: string;
  overallRiskScore: Prisma.Decimal;
  risksByCategory: Record<string, number>;
  highRiskAreas: string[];
  assessedDate: Date;
  assessedBy?: string;
  notes?: string;
}

// ─── Input Types ───────────────────────────────────────────

export interface GetFrameworksInput {
  frameworkType?: FrameworkType;
  status?: PolicyStatus;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CreateFrameworkInput {
  frameworkType: FrameworkType;
  name: string;
  description: string;
  version?: string;
  jurisdiction?: string;
  effectiveDate?: Date;
  regulatoryBody?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateFrameworkInput {
  name?: string;
  description?: string;
  version?: string;
  status?: PolicyStatus;
  jurisdiction?: string;
  effectiveDate?: Date;
  regulatoryBody?: string;
  metadata?: Record<string, unknown>;
}

export interface GetRequirementsInput {
  frameworkId?: string;
  requirementType?: RequirementType;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CreateRequirementInput {
  frameworkId: string;
  requirementType: RequirementType;
  title: string;
  description: string;
  controlObjective?: string;
  implementationGuidance?: string;
  metadata?: Record<string, unknown>;
}

export interface GetPoliciesInput {
  category?: PolicyCategory;
  status?: PolicyStatus;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CreatePolicyInput {
  category: PolicyCategory;
  title: string;
  description: string;
  content?: string;
  effectiveDate?: Date;
  reviewDate?: Date;
  owner?: string;
  frameworkIds?: string[];
  metadata?: Record<string, unknown>;
}

export interface UpdatePolicyInput {
  category?: PolicyCategory;
  title?: string;
  description?: string;
  content?: string;
  status?: PolicyStatus;
  effectiveDate?: Date;
  reviewDate?: Date;
  owner?: string;
  frameworkIds?: string[];
  metadata?: Record<string, unknown>;
}

export interface GetObligationsInput {
  obligationType?: ObligationType;
  status?: ObligationStatus;
  frameworkId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CreateObligationInput {
  obligationType: ObligationType;
  title: string;
  description: string;
  frameworkId?: string;
  policyId?: string;
  dueDate?: Date;
  assignee?: string;
  frequency?: FilingFrequency;
  jurisdiction?: string;
  metadata?: Record<string, unknown>;
}

export interface GetViolationsInput {
  violationType?: ViolationType;
  severity?: ViolationSeverity;
  status?: ViolationStatus;
  frameworkId?: string;
  policyId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CreateViolationInput {
  violationType: ViolationType;
  severity: ViolationSeverity;
  title: string;
  description: string;
  frameworkId?: string;
  policyId?: string;
  obligationId?: string;
  detectedDate?: Date;
  reportedBy?: string;
  jurisdiction?: string;
  metadata?: Record<string, unknown>;
}

export interface GetFilingsInput {
  filingType?: FilingType;
  status?: FilingStatus;
  frequency?: FilingFrequency;
  jurisdiction?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CreateFilingInput {
  filingType: FilingType;
  title: string;
  description: string;
  frequency: FilingFrequency;
  dueDate: Date;
  jurisdiction?: string;
  regulatoryBody?: string;
  frameworkId?: string;
  assignee?: string;
  metadata?: Record<string, unknown>;
}

export interface GetAssessmentsInput {
  assessmentType?: AssessmentType;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CreateAssessmentInput {
  assessmentType: AssessmentType;
  title: string;
  description: string;
  scope?: string;
  assessedBy?: string;
  overallRiskScore?: number;
  risksByCategory?: Record<string, number>;
  highRiskAreas?: string[];
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface GetRegulatoryUpdatesInput {
  updateType?: RegulatoryUpdateType;
  jurisdiction?: string;
  impactLevel?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CreateRegulatoryUpdateInput {
  updateType: RegulatoryUpdateType;
  title: string;
  summary: string;
  fullText?: string;
  jurisdiction: string;
  regulatoryBody?: string;
  publishedDate?: Date;
  effectiveDate?: Date;
  impactLevel?: string;
  sourceUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface AssessRegulatoryUpdateInput {
  impactLevel: string;
  affectedFrameworks: string[];
  affectedPolicies: string[];
  assessmentNotes: string;
  actionRequired: boolean;
  deadline?: Date;
}

export interface GetRemediationsInput {
  status?: RemediationStatus;
  violationId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CreateRemediationInput {
  violationId: string;
  title: string;
  description: string;
  actionPlan?: string;
  targetDate: Date;
  owner?: string;
  priority?: ViolationSeverity;
  estimatedCost?: number;
  metadata?: Record<string, unknown>;
}

export interface GetHealthSnapshotsInput {
  limit?: number;
  offset?: number;
}

export interface CreateHealthSnapshotInput {
  domainScores?: Record<string, number>;
  notes?: string;
}

export interface GetRiskAssessmentsInput {
  assessmentType?: AssessmentType;
  limit?: number;
  offset?: number;
}

export interface CreateRiskAssessmentInput {
  assessmentType: AssessmentType;
  title: string;
  description: string;
  overallRiskScore?: number;
  risksByCategory?: Record<string, number>;
  highRiskAreas?: string[];
  assessedBy?: string;
  notes?: string;
}

export interface GetBriefingsInput {
  briefingType?: BriefingType;
  limit?: number;
  offset?: number;
}

export interface CreateBriefingInput {
  briefingType: BriefingType;
  period?: string;
  customNotes?: string;
}
