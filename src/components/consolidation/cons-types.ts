import type {
  LegalEntity, ConsolidationKPI, ConsolidationAlert, ConsolidationRecommendation,
  ExecutiveConsolidationSummary, AggregateConsolidationMetrics, OwnershipRecord,
  ConsolidationRun, IntercompanyRecord, ConsolidationAdjustment, CurrencyTranslationRun,
  GroupNode, FinancialStatementSet, BoardReport, MinorityInterestRecord,
  EquityAccountRecord, EntityPerformanceReport, FXExposureReport,
} from "@/server/consolidation";

export interface ConsExecutiveHeaderProps { summary: ExecutiveConsolidationSummary; }
export interface ConsKPIDashboardProps { metrics: ConsolidationKPI[]; }
export interface ConsEntityRegistryProps { entities: LegalEntity[]; }
export interface ConsOwnershipTreeProps { ownerships: OwnershipRecord[]; nodes: GroupNode[]; }
export interface ConsConsolidationWorkspaceProps { runs: ConsolidationRun[]; }
export interface ConsCurrencyTranslationProps { translations: CurrencyTranslationRun[]; }
export interface ConsICEliminationCenterProps { records: IntercompanyRecord[]; }
export interface ConsMinorityInterestPanelProps { records: MinorityInterestRecord[]; }
export interface ConsEquityAccountingPanelProps { records: EquityAccountRecord[]; }
export interface ConsAdjustmentWorkspaceProps { adjustments: ConsolidationAdjustment[]; }
export interface ConsFinancialStatementViewerProps { statements: FinancialStatementSet[]; }
export interface ConsBoardPackGeneratorProps { reports: BoardReport[]; }
export interface ConsAnalyticsDashboardProps { metrics: ConsolidationKPI[]; aggregates: AggregateConsolidationMetrics; }
export interface ConsRecommendationsPanelProps { recommendations: ConsolidationRecommendation[]; }
export interface ConsAlertsPanelProps { alerts: ConsolidationAlert[]; }
export interface ConsExecutiveInsightsProps { summary: ExecutiveConsolidationSummary; insights: { summary: string; highlights: string[]; risks: string[]; actions: string[] }; }
export interface ConsFXExposureProps { exposures: FXExposureReport[]; }
export interface ConsEntityPerformanceProps { performances: EntityPerformanceReport[]; }
