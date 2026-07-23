export type ReportType =
  | "balance-sheet"
  | "profit-loss"
  | "cash-flow"
  | "trial-balance"
  | "general-ledger"
  | "journal-report"
  | "chart-of-accounts"
  | "aged-receivables"
  | "aged-payables"
  | "fixed-assets"
  | "equity-statement"
  | "budget-vs-actual"
  | "department-pl"
  | "cost-center"
  | "consolidated-group"
  | "multi-company"
  | "treasury-report"
  | "fx-exposure"
  | "cash-position";

export type ReportAudience =
  | "ceo"
  | "cfo"
  | "treasurer"
  | "controller"
  | "finance-manager"
  | "board"
  | "auditor"
  | "investor"
  | "department-manager";

export type ExecutionStatus = "pending" | "running" | "completed" | "failed" | "cancelled";

export type ScheduleFrequency = "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "custom";

export type ExportFormat = "pdf" | "excel" | "csv" | "powerpoint";

export type ComparisonType = "none" | "prior-period" | "prior-year" | "budget";

export type BoardPackStatus = "draft" | "generating" | "completed" | "distributed" | "failed";

export type RowType = "header" | "section-header" | "account" | "total" | "subtotal" | "note" | "currency-conversion";

export interface DateRange {
  start: string;
  end: string;
  period?: string;
  fiscalYear?: string;
}

export interface ReportConfig {
  dateRange: DateRange;
  companyIds: string[];
  entityIds: string[];
  currency: string;
  departmentIds: string[];
  costCenterIds: string[];
  projectIds: string[];
  customColumns: string[];
  groupBy: string[];
  comparison: ComparisonType;
  includeAiCommentary: boolean;
  includeDrillDown: boolean;
  showZeroBalances: boolean;
  rounding: number;
  compact: boolean;
}

export interface SourceReference {
  id: string;
  type: "transaction" | "journal" | "journal-entry" | "ledger-entry" | "invoice" | "payment";
  number: string;
  date: string;
  amount: number;
  description: string;
  url?: string;
}

export interface ReportRow {
  id: string;
  label: string;
  depth: number;
  type: RowType;
  values: Record<string, number | string>;
  priorValues?: Record<string, number>;
  variance?: Record<string, number>;
  variancePercent?: Record<string, number>;
  sourceReferences?: SourceReference[];
  children?: ReportRow[];
}

export interface ReportSection {
  id: string;
  title: string;
  subtitle?: string;
  type: "header" | "summary" | "table" | "chart" | "text";
  rows: ReportRow[];
  columns?: string[];
  totals?: Record<string, number>;
  subtotals?: Record<string, Record<string, number>>;
  notes?: string[];
}

export interface AICommentarySegment {
  type: "insight" | "risk" | "recommendation" | "observation" | "trend";
  label: string;
  content: string;
  metric?: string;
  value?: number;
  change?: number;
  severity?: "positive" | "negative" | "neutral" | "warning";
}

export interface AICommentary {
  summary: string;
  segments: AICommentarySegment[];
  keyMetrics: Array<{ label: string; value: string; change: string; trend: "up" | "down" | "neutral" }>;
  risks: string[];
  recommendations: string[];
  generatedAt: string;
  model: string;
}

export interface ReportDefinition {
  id: string;
  companyId: string;
  name: string;
  description: string;
  reportType: ReportType;
  audience?: ReportAudience;
  config: ReportConfig;
  isActive: boolean;
  isTemplate: boolean;
  version: number;
  createdBy: string;
  lastRunAt?: string;
  lastRunById?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportExecution {
  id: string;
  definitionId: string;
  companyId: string;
  status: ExecutionStatus;
  reportType: ReportType;
  config: ReportConfig;
  sections: ReportSection[];
  summary?: AICommentary;
  totalRows: number;
  executionTimeMs: number;
  error?: string;
  requestedBy: string;
  completedAt?: string;
  createdAt: string;
}

export interface ReportSchedule {
  id: string;
  definitionId: string;
  companyId: string;
  name: string;
  frequency: ScheduleFrequency;
  cronExpression?: string;
  recipients: string[];
  format: ExportFormat;
  config: ReportConfig;
  isActive: boolean;
  lastRunAt?: string;
  lastRunStatus?: string;
  nextRunAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedViewFilters {
  dateRange?: DateRange;
  companyIds?: string[];
  entityIds?: string[];
  currency?: string;
  departmentIds?: string[];
  costCenterIds?: string[];
  projectIds?: string[];
  customColumns?: string[];
  groupBy?: string[];
  comparison?: ComparisonType;
}

export interface SavedView {
  id: string;
  companyId: string;
  definitionId?: string;
  name: string;
  reportType: ReportType;
  filters: SavedViewFilters;
  userId: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BoardPackSlide {
  id: string;
  title: string;
  type: "kpi" | "financial-statement" | "treasury" | "risk" | "commentary" | "recommendations" | "appendix";
  content: Record<string, unknown>;
  order: number;
}

export interface BoardPack {
  id: string;
  companyId: string;
  title: string;
  description?: string;
  period: string;
  fiscalYear: string;
  status: BoardPackStatus;
  slides: BoardPackSlide[];
  executiveSummary?: Record<string, unknown>;
  aiCommentary?: AICommentary;
  generatedBy: string;
  generatedAt?: string;
  distributedAt?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface BoardPackDistribution {
  id: string;
  boardPackId: string;
  companyId: string;
  recipientId: string;
  recipientEmail: string;
  format: ExportFormat;
  status: "pending" | "delivered" | "failed";
  deliveredAt?: string;
  error?: string;
  createdAt: string;
}

export interface AudiencePreset {
  audience: ReportAudience;
  label: string;
  description: string;
  reportTypes: ReportType[];
  configOverrides: Partial<ReportConfig>;
  defaultSections: string[];
}

export interface ReportBuilderState {
  step: "dataset" | "filters" | "columns" | "grouping" | "sorting" | "audience" | "preview";
  reportType: ReportType;
  audience?: ReportAudience;
  config: ReportConfig;
  definitionId?: string;
  executionId?: string;
  isDirty: boolean;
}

export interface ReportError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ReportMetric {
  id: string;
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  insight?: string;
}
