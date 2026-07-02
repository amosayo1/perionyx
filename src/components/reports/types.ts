export type ReportCategory =
  | "Treasury" | "Payments" | "Approvals" | "Policy" | "Risk" | "Audit"
  | "Ledger" | "Settlement" | "Executive" | "Operations" | "Incidents" | "Platform";

export type ScheduleFrequency = "daily" | "weekly" | "monthly" | "quarterly";

export type ExportFormat = "pdf" | "excel" | "csv" | "json" | "powerpoint";

export interface ReportKpi {
  id: string;
  title: string;
  value: string;
  trend: "up" | "down" | "neutral";
  trendLabel: string;
  insight: string;
  sparklineData: number[];
}

export interface Report {
  id: string;
  title: string;
  category: ReportCategory;
  description: string;
  lastUpdated: string;
}

export interface BuilderStep {
  id: string;
  label: string;
  description: string;
  icon: string;
}

export interface ScheduledReport {
  id: string;
  name: string;
  frequency: ScheduleFrequency;
  recipients: string;
  nextRun: string;
  status: "active" | "paused" | "error";
  format: string;
}

export interface ExportOption {
  id: string;
  format: ExportFormat;
  label: string;
  lastExport: string;
  fileSize: string;
  status: "ready" | "generating" | "unavailable";
}

export interface SavedReport {
  id: string;
  title: string;
  type: "pinned" | "shared" | "private" | "recent" | "favorite";
  lastAccessed: string;
}

export interface ReportTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
}
