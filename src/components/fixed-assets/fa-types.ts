import type {
  FixedAsset as ServerFixedAsset, AssetAlert as ServerAlert, AssetRecommendation as ServerRecommendation,
  AssetKPI as ServerKPI, AggregateAssetMetrics as ServerAggregateMetrics,
  ExecutiveAssetSummary as ServerExecutiveSummary, ExecutiveBoardPack as ServerBoardPack,
  DisposalRecord as ServerDisposalRecord, RevaluationRecord as ServerRevaluationRecord,
  AssetUtilizationReport as ServerUtilizationReport,
  DepreciationScheduleReport as ServerDepreciationScheduleReport,
  AssetFilter as ServerAssetFilter, AssetSort as ServerAssetSort,
  PaginatedResult as ServerPaginatedResult,
} from '../../server/fixed-assets/types';

export type FixedAsset = ServerFixedAsset;
export type AssetAlert = ServerAlert;
export type AssetRecommendation = ServerRecommendation;
export type AssetKPI = ServerKPI;
export type AggregateAssetMetrics = ServerAggregateMetrics;
export type ExecutiveAssetSummary = ServerExecutiveSummary;
export type ExecutiveBoardPack = ServerBoardPack;
export type DisposalRecord = ServerDisposalRecord;
export type RevaluationRecord = ServerRevaluationRecord;
export type AssetUtilizationReport = ServerUtilizationReport;
export type DepreciationScheduleReport = ServerDepreciationScheduleReport;
export type AssetFilter = ServerAssetFilter;
export type AssetSort = ServerAssetSort;
export type PaginatedResult<T> = ServerPaginatedResult<T>;

export interface FAExecutiveHeaderProps { summary: ExecutiveAssetSummary; }
export interface FAKPIDashboardProps { metrics: AssetKPI[]; }
export interface FARegistryGridProps { assets: FixedAsset[]; }
export interface FADepreciationDashboardProps { schedules: DepreciationScheduleReport[]; }
export interface FATransferCenterProps { assets: FixedAsset[]; }
export interface FAMaintenanceBoardProps { assets: FixedAsset[]; }
export interface FAImpairmentReviewProps { assets: FixedAsset[]; }
export interface FADisposalWorkspaceProps { disposals: DisposalRecord[]; }
export interface FARevaluationDashboardProps { revaluations: RevaluationRecord[]; }
export interface FALeaseReadinessProps { assets: FixedAsset[]; }
export interface FAAssetAnalyticsProps { kpis: AssetKPI[]; aggregates: AggregateAssetMetrics; categoryBreakdown?: { category: string; count: number; value: number }[]; }
export interface FARecommendationsPanelProps { recommendations: AssetRecommendation[]; }
export interface FAAlertsPanelProps { alerts: AssetAlert[]; }
export interface FAExecutiveInsightsProps { summary: ExecutiveAssetSummary; pack?: ExecutiveBoardPack; }
export interface FATrendWidgetProps { label: string; value: number; target: number; unit: string; trend: 'improving' | 'worsening' | 'stable'; }
export interface FALifecycleTimelineProps { currentStatus: string; statusHistory?: { status: string; date: Date }[]; }
export interface FAUtilizationDashboardProps { reports: AssetUtilizationReport[]; }
