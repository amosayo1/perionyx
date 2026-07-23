// ─────────────────────────────────────────────────────────────
// Enterprise Reconciliation Platform — Type Definitions
// Phase 13.2
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";

// ─── Reconciliation Types ───────────────────────────────────

export type ReconciliationType =
  | "bank"
  | "gl"
  | "subledger"
  | "intercompany"
  | "ar"
  | "ap"
  | "fixed_asset"
  | "treasury"
  | "payroll"
  | "tax"
  | "multi_company"
  | "multi_currency";

export type ReconciliationStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "MATCHED"
  | "PARTIALLY_MATCHED"
  | "EXCEPTION"
  | "CLOSED"
  | "ESCALATED";

// ─── Exception Types ────────────────────────────────────────

export type ExceptionType =
  | "timing_difference"
  | "duplicate_payment"
  | "missing_journal"
  | "missing_bank_entry"
  | "wrong_account"
  | "wrong_currency"
  | "fx_difference"
  | "bank_charges"
  | "interest"
  | "manual_adjustment"
  | "data_import_error"
  | "unknown";

export type ExceptionSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ExceptionStatus =
  | "OPEN"
  | "INVESTIGATING"
  | "RESOLVED"
  | "ESCALATED"
  | "DISMISSED";

export type SourceSystem =
  | "bank"
  | "gl"
  | "subledger"
  | "ar"
  | "ap"
  | "manual"
  | "treasury"
  | "payroll"
  | "tax";

// ─── Matching Types ─────────────────────────────────────────

export type MatchingRuleType =
  | "exact"
  | "amount"
  | "reference"
  | "date_tolerance"
  | "currency_tolerance"
  | "percentage_tolerance"
  | "many_to_one"
  | "one_to_many"
  | "many_to_many"
  | "split"
  | "merged"
  | "custom";

export type SuggestionType =
  | "match"
  | "partial_match"
  | "split"
  | "merge"
  | "reclassify";

export type SuggestionStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED";

export type ExecutionType = "auto" | "manual" | "batch";

export type ExecutionStatus =
  | "PENDING"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

// ─── Journal Types ──────────────────────────────────────────

export type JournalSuggestionType =
  | "adjustment"
  | "reclassification"
  | "accrual"
  | "write_off"
  | "correction";

export type JournalStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "POSTED"
  | "VOIDED";

// ─── Investigation Types ────────────────────────────────────

export type InvestigationAction =
  | "created"
  | "investigated"
  | "explained"
  | "escalated"
  | "resolved"
  | "comment"
  | "evidence_added"
  | "assignment_changed";

// ─── Assignment Types ───────────────────────────────────────

export type AssignmentRole =
  | "reconciler"
  | "reviewer"
  | "approver"
  | "escalation_contact";

export type AssignmentStatus =
  | "ACTIVE"
  | "COMPLETED"
  | "REASSIGNED"
  | "RELEASED";

// ─── Escalation Types ──────────────────────────────────────

export type EscalationType =
  | "exception_age"
  | "high_value"
  | "close_blocker"
  | "policy_violation"
  | "manual";

// ─── Classification Types ──────────────────────────────────

export type Classifier = "auto" | "manual" | "specialist";

// ─── Evidence Types ────────────────────────────────────────

export type EvidenceType =
  | "transaction"
  | "journal"
  | "report"
  | "document"
  | "workflow"
  | "audit"
  | "manual";

// ─── Matching Criteria ─────────────────────────────────────

export interface MatchingCriteria {
  /** Fields to match on */
  matchFields: string[];
  /** Exact match required fields */
  exactFields?: string[];
  /** Amount tolerance (absolute) */
  amountTolerance?: number;
  /** Amount tolerance (percentage) */
  percentageTolerance?: number;
  /** Date tolerance in days */
  dateToleranceDays?: number;
  /** Currency tolerance (percentage) */
  currencyTolerance?: number;
  /** Maximum confidence for auto-match */
  maxAutoMatchConfidence?: number;
  /** Custom matching logic identifier */
  customLogic?: string;
}

export interface ScoringWeights {
  /** Weight for amount similarity (0-1) */
  amountWeight: number;
  /** Weight for reference similarity (0-1) */
  referenceWeight: number;
  /** Weight for date proximity (0-1) */
  dateWeight: number;
  /** Weight for vendor/customer similarity (0-1) */
  entityWeight: number;
  /** Weight for description similarity (0-1) */
  descriptionWeight: number;
}

// ─── Match Result ──────────────────────────────────────────

export interface MatchResult {
  /** Source transaction IDs */
  sourceIds: string[];
  /** Target transaction IDs */
  targetIds: string[];
  /** Match confidence (0-1) */
  confidence: number;
  /** Match explanation */
  explanation: MatchExplanation;
  /** Variance amount */
  variance: Prisma.Decimal;
  /** Match type */
  matchType: SuggestionType;
}

export interface MatchExplanation {
  /** Why this match was made */
  reasoning: string;
  /** Which fields matched */
  matchedFields: string[];
  /** Which fields didn't match */
  unmatchedFields: string[];
  /** Similarity scores per field */
  fieldScores: Record<string, number>;
}

// ─── Exception Classification ──────────────────────────────

export interface ExceptionClassificationResult {
  /** Exception type */
  exceptionType: ExceptionType;
  /** Classification confidence */
  confidence: number;
  /** Classification reasoning */
  reasoning: string;
  /** Supporting evidence */
  evidence: ExceptionEvidence[];
}

export interface ExceptionEvidence {
  /** Evidence type */
  type: EvidenceType;
  /** Reference ID */
  referenceId: string;
  /** Description */
  description: string;
  /** Source system */
  sourceSystem: string;
}

// ─── Investigation Context ─────────────────────────────────

export interface InvestigationContext {
  /** Exception details */
  exception: {
    id: string;
    type: ExceptionType;
    amount: Prisma.Decimal;
    description: string;
  };
  /** Source transactions */
  sourceTransactions: TransactionRecord[];
  /** Target transactions */
  targetTransactions: TransactionRecord[];
  /** Related journal entries */
  journalEntries: JournalEntryRecord[];
  /** Previous exceptions (similar) */
  similarExceptions: SimilarException[];
  /** Timeline */
  timeline: TimelineEntry[];
  /** Evidence */
  evidence: ExceptionEvidence[];
}

export interface TransactionRecord {
  id: string;
  sourceSystem: string;
  transactionDate: Date;
  amount: Prisma.Decimal;
  currency: string;
  reference?: string;
  vendorName?: string;
  customerName?: string;
  description?: string;
}

export interface JournalEntryRecord {
  id: string;
  accountCode: string;
  accountName: string;
  debit: Prisma.Decimal;
  credit: Prisma.Decimal;
  description: string;
  postingDate: Date;
}

export interface SimilarException {
  id: string;
  type: ExceptionType;
  amount: Prisma.Decimal;
  resolution?: string;
  resolvedBy?: string;
  resolvedAt?: Date;
}

export interface TimelineEntry {
  action: InvestigationAction;
  actor: string;
  description: string;
  timestamp: Date;
}

// ─── Journal Draft ─────────────────────────────────────────

export interface JournalDraft {
  suggestionType: JournalSuggestionType;
  entries: JournalDraftEntry[];
  totalDebit: Prisma.Decimal;
  totalCredit: Prisma.Decimal;
  currency: string;
  explanation: string;
  businessReason: string;
  supportingEvidence: ExceptionEvidence[];
}

export interface JournalDraftEntry {
  accountCode: string;
  accountName: string;
  debit: Prisma.Decimal;
  credit: Prisma.Decimal;
  description: string;
  costCenter?: string;
  profitCenter?: string;
}

// ─── Dashboard Data ────────────────────────────────────────

export interface ReconciliationDashboardData {
  /** Active cases count */
  activeCases: number;
  /** Match rate percentage */
  overallMatchRate: Prisma.Decimal;
  /** Total exceptions */
  totalExceptions: number;
  /** Critical exceptions */
  criticalExceptions: number;
  /** Open escalations */
  openEscalations: number;
  /** Cases by status */
  casesByStatus: Record<ReconciliationStatus, number>;
  /** Cases by type */
  casesByType: Record<ReconciliationType, number>;
  /** Exceptions by severity */
  exceptionsBySeverity: Record<ExceptionSeverity, number>;
  /** Top risks */
  topRisks: ReconciliationRisk[];
  /** Trend data */
  trends: ReconciliationTrend[];
}

export interface ReconciliationRisk {
  caseId: string;
  title: string;
  riskType: string;
  severity: ExceptionSeverity;
  amount: Prisma.Decimal;
  ageDays: number;
}

export interface ReconciliationTrend {
  period: string;
  matchRate: Prisma.Decimal;
  exceptionCount: number;
  resolvedCount: number;
  averageResolutionDays: number;
}

// ─── Analytics Data ────────────────────────────────────────

export interface ReconciliationAnalytics {
  /** Match rate trend */
  matchRateTrend: TrendData[];
  /** Exception volume trend */
  exceptionVolumeTrend: TrendData[];
  /** Resolution time trend */
  resolutionTimeTrend: TrendData[];
  /** Exception type distribution */
  exceptionTypeDistribution: DistributionData[];
  /** Reconciliation type performance */
  typePerformance: TypePerformanceData[];
}

export interface TrendData {
  period: string;
  value: Prisma.Decimal;
}

export interface DistributionData {
  category: string;
  count: number;
  percentage: Prisma.Decimal;
}

export interface TypePerformanceData {
  type: ReconciliationType;
  caseCount: number;
  matchRate: Prisma.Decimal;
  averageResolutionDays: number;
}

// ─── Input Types ───────────────────────────────────────────

export interface CreateCaseInput {
  title: string;
  reconciliationType: ReconciliationType;
  period: string;
  entityName?: string;
  currency?: string;
  assignedTo?: string;
  dueDate?: Date;
}

export interface RunMatchingInput {
  caseId: string;
  ruleId?: string;
  executionType: ExecutionType;
  sourceTransactions: TransactionRecord[];
  targetTransactions: TransactionRecord[];
}

export interface CreateExceptionInput {
  caseId: string;
  exceptionType: ExceptionType;
  severity?: ExceptionSeverity;
  sourceSystem: SourceSystem;
  referenceNumber?: string;
  description: string;
  amount: number;
  currency?: string;
  expectedAmount?: number;
  transactionDate?: Date;
}

export interface UpdateExceptionInput {
  status?: ExceptionStatus;
  severity?: ExceptionSeverity;
  assignedTo?: string;
  explanation?: Record<string, unknown>;
}

export interface InvestigateExceptionInput {
  exceptionId: string;
  action: InvestigationAction;
  description: string;
  evidence?: ExceptionEvidence[];
}

export interface SuggestJournalInput {
  caseId: string;
  exceptionId?: string;
  suggestionType: JournalSuggestionType;
  entries: JournalDraftEntry[];
  explanation: string;
  businessReason: string;
}

export interface AssignCaseInput {
  caseId: string;
  assignedTo: string;
  role?: AssignmentRole;
  notes?: string;
}

export interface EscalateCaseInput {
  caseId: string;
  escalationType: EscalationType;
  severity: ExceptionSeverity;
  reason: string;
  escalatedTo?: string;
}

export interface CreateRuleInput {
  name: string;
  description?: string;
  ruleType: MatchingRuleType;
  priority?: number;
  matchingCriteria: MatchingCriteria;
  scoringWeights: ScoringWeights;
  maxConfidenceThreshold?: number;
  autoMatchEnabled?: boolean;
}

export interface UpdateRuleInput {
  name?: string;
  description?: string;
  priority?: number;
  isActive?: boolean;
  matchingCriteria?: MatchingCriteria;
  scoringWeights?: ScoringWeights;
  maxConfidenceThreshold?: number;
  autoMatchEnabled?: boolean;
}

// ─── Query Types ───────────────────────────────────────────

export interface CaseQuery {
  status?: ReconciliationStatus;
  reconciliationType?: ReconciliationType;
  period?: string;
  assignedTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ExceptionQuery {
  caseId?: string;
  exceptionType?: ExceptionType;
  severity?: ExceptionSeverity;
  status?: ExceptionStatus;
  assignedTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface MatchingHistoryQuery {
  caseId?: string;
  sourceSystem?: string;
  normalizedReference?: string;
  normalizedVendor?: string;
  page?: number;
  limit?: number;
}
