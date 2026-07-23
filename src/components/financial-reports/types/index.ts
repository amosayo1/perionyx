export type {
  ReportType, ReportAudience, ReportConfig, ReportSection, ReportRow,
  ReportExecution, ReportDefinition, ReportSchedule, SavedView,
  SavedViewFilters, AICommentary, AICommentarySegment, BoardPack,
  BoardPackSlide, AudiencePreset, DateRange, ComparisonType,
  ExportFormat, ReportMetric, BoardPackStatus, ExecutionStatus,
  SourceReference
} from "@/modules/financial-reporting/types";

export interface ReportViewerTab {
  id: string;
  label: string;
}
