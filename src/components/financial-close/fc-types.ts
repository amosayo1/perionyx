import type {
  ClosePeriod as ServerClosePeriod, CloseTask as ServerCloseTask,
  CloseChecklist as ServerCloseChecklist, CloseCalendarEntry as ServerCloseCalendarEntry,
  ReconciliationRecord as ServerReconciliationRecord, AccountReconciliation as ServerAccountReconciliation,
  IntercompanyReconciliation as ServerIntercompanyReconciliation, JournalReviewRecord as ServerJournalReviewRecord,
  ApprovalRecord as ServerApprovalRecord, VarianceAnalysisRecord as ServerVarianceAnalysisRecord,
  ExceptionRecord as ServerExceptionRecord, CloseMetric as ServerCloseMetric,
  CloseRecommendation as ServerCloseRecommendation, CloseAlert as ServerCloseAlert,
  CloseProgress as ServerCloseProgress, CloseReadinessScore as ServerCloseReadinessScore,
  AggregateCloseMetrics as ServerAggregateCloseMetrics, ExecutiveCloseSummary as ServerExecutiveCloseSummary,
} from "../../server/financial-close/types";

export type ClosePeriod = ServerClosePeriod;
export type CloseTask = ServerCloseTask;
export type CloseChecklist = ServerCloseChecklist;
export type CloseCalendarEntry = ServerCloseCalendarEntry;
export type ReconciliationRecord = ServerReconciliationRecord;
export type AccountReconciliation = ServerAccountReconciliation;
export type IntercompanyReconciliation = ServerIntercompanyReconciliation;
export type JournalReviewRecord = ServerJournalReviewRecord;
export type ApprovalRecord = ServerApprovalRecord;
export type VarianceAnalysisRecord = ServerVarianceAnalysisRecord;
export type ExceptionRecord = ServerExceptionRecord;
export type CloseMetric = ServerCloseMetric;
export type CloseRecommendation = ServerCloseRecommendation;
export type CloseAlert = ServerCloseAlert;
export type CloseProgress = ServerCloseProgress;
export type CloseReadinessScore = ServerCloseReadinessScore;
export type AggregateCloseMetrics = ServerAggregateCloseMetrics;
export type ExecutiveCloseSummary = ServerExecutiveCloseSummary;

export interface FCExecutiveHeaderProps { summary: ExecutiveCloseSummary; }
export interface FCCloseDashboardProps { progress: CloseProgress; periods: ClosePeriod[]; metrics: CloseMetric[]; }
export interface FCCalendarProps { entries: CloseCalendarEntry[]; }
export interface FCTaskBoardProps { tasks: CloseTask[]; }
export interface FCReconciliationWorkspaceProps { reconciliations: ReconciliationRecord[]; accountRecs: AccountReconciliation[]; icRecs: IntercompanyReconciliation[]; }
export interface FCJournalReviewBoardProps { journals: JournalReviewRecord[]; }
export interface FCVarianceDashboardProps { variances: VarianceAnalysisRecord[]; }
export interface FCApprovalQueueProps { approvals: ApprovalRecord[]; }
export interface FCExceptionCenterProps { exceptions: ExceptionRecord[]; }
export interface FCKPIDashboardProps { metrics: CloseMetric[]; }
export interface FCRecommendationsPanelProps { recommendations: CloseRecommendation[]; }
export interface FCAlertsPanelProps { alerts: CloseAlert[]; }
export interface FCExecutiveInsightsProps { summary: ExecutiveCloseSummary; periods: ClosePeriod[]; tasks: CloseTask[]; approvals: ApprovalRecord[]; exceptions: ExceptionRecord[]; reconciliations: ReconciliationRecord[]; }
export interface FCPeriodStatusCardsProps { periods: ClosePeriod[]; }
