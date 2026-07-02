import type {
  ReportKpi,
  Report,
  BuilderStep,
  ScheduledReport,
  ExportOption,
  SavedReport,
  ReportTemplate,
} from "./types";

export const reportKpis: ReportKpi[] = [
  {
    id: "reports-generated",
    title: "Reports Generated",
    value: "847",
    trend: "up",
    trendLabel: "+12.4% this month",
    insight: "Report generation up 12% month-over-month. Treasury reports most requested.",
    sparklineData: [520, 580, 620, 680, 720, 780, 847],
  },
  {
    id: "scheduled-reports",
    title: "Scheduled Reports",
    value: "24",
    trend: "up",
    trendLabel: "+3 new schedules",
    insight: "24 active schedules. 2 paused, 1 in error state requiring attention.",
    sparklineData: [14, 16, 18, 19, 21, 22, 24],
  },
  {
    id: "exports-month",
    title: "Exports This Month",
    value: "342",
    trend: "up",
    trendLabel: "+18.3% vs last month",
    insight: "CSV exports lead at 48%, followed by PDF (32%) and Excel (20%).",
    sparklineData: [180, 210, 240, 260, 290, 320, 342],
  },
  {
    id: "shared-reports",
    title: "Shared Reports",
    value: "56",
    trend: "up",
    trendLabel: "+8 this week",
    insight: "Treasury summary report shared most frequently across the organization.",
    sparklineData: [32, 36, 40, 44, 48, 52, 56],
  },
  {
    id: "favorite-reports",
    title: "Favorite Reports",
    value: "18",
    trend: "neutral",
    trendLabel: "Stable",
    insight: "Executive KPIs and Treasury Summary remain top-favorited reports.",
    sparklineData: [15, 16, 16, 17, 17, 18, 18],
  },
  {
    id: "storage-used",
    title: "Storage Used",
    value: "2.4 GB",
    trend: "up",
    trendLabel: "+180 MB this week",
    insight: "Report storage at 48% of 5 GB allocation. Archive policy recommended.",
    sparklineData: [1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.4],
  },
];

export const reportLibrary: Report[] = [
  { id: "rpt-treasury-summary", title: "Treasury Summary", category: "Treasury", description: "Consolidated treasury position across all accounts and currencies", lastUpdated: "2h ago" },
  { id: "rpt-payments", title: "Payment Activity", category: "Payments", description: "Transaction volume, success rates, and settlement status", lastUpdated: "1h ago" },
  { id: "rpt-approvals", title: "Approval Performance", category: "Approvals", description: "Approval SLA metrics, bottlenecks, and escalation trends", lastUpdated: "3h ago" },
  { id: "rpt-policy", title: "Policy Violations", category: "Policy", description: "Policy exceptions, enforcement actions, and compliance gaps", lastUpdated: "6h ago" },
  { id: "rpt-risk", title: "Risk Overview", category: "Risk", description: "Enterprise risk score, incident summary, and exposure analysis", lastUpdated: "4h ago" },
  { id: "rpt-audit", title: "Audit Activity", category: "Audit", description: "Immutable event trail summary with compliance dashboard", lastUpdated: "1d ago" },
  { id: "rpt-ledger", title: "Ledger Summary", category: "Ledger", description: "Journal entries, posting activity, and reconciliation status", lastUpdated: "2h ago" },
  { id: "rpt-settlement", title: "Settlement Report", category: "Settlement", description: "Settlement success rates, delays, and aging analysis", lastUpdated: "30m ago" },
  { id: "rpt-executive", title: "Executive KPIs", category: "Executive", description: "Executive-level financial and operational performance metrics", lastUpdated: "1d ago" },
  { id: "rpt-operations", title: "Operations Report", category: "Operations", description: "Operational queue depths, processing times, and health metrics", lastUpdated: "1h ago" },
  { id: "rpt-incidents", title: "Incident Report", category: "Incidents", description: "Incident frequency, resolution times, and SLA compliance", lastUpdated: "1d ago" },
  { id: "rpt-platform", title: "Platform Health Report", category: "Platform", description: "Service availability, latency trends, and platform stability", lastUpdated: "2h ago" },
];

export const builderSteps: BuilderStep[] = [
  { id: "step-dataset", label: "Choose Dataset", description: "Select the data source for your report", icon: "database" },
  { id: "step-filters", label: "Filters", description: "Filter data by date, category, status, and more", icon: "filter" },
  { id: "step-columns", label: "Columns", description: "Choose which columns to include in your report", icon: "columns" },
  { id: "step-grouping", label: "Grouping", description: "Group and aggregate data by dimensions", icon: "group" },
  { id: "step-sorting", label: "Sorting", description: "Sort results by one or more columns", icon: "sort" },
  { id: "step-preview", label: "Preview", description: "Review your report before generating", icon: "eye" },
  { id: "step-export", label: "Export", description: "Download or schedule your report", icon: "download" },
];

export const scheduledReports: ScheduledReport[] = [
  { id: "sch-treasury", name: "Treasury Summary", frequency: "daily", recipients: "treasury@company.com", nextRun: "Today 23:00", status: "active", format: "PDF" },
  { id: "sch-payments", name: "Payment Activity", frequency: "daily", recipients: "ops@company.com", nextRun: "Today 22:00", status: "active", format: "CSV" },
  { id: "sch-approvals", name: "Approval Performance", frequency: "weekly", recipients: "compliance@company.com", nextRun: "Mon 08:00", status: "active", format: "PDF" },
  { id: "sch-executive", name: "Executive KPIs", frequency: "monthly", recipients: "execs@company.com", nextRun: "1st 09:00", status: "active", format: "PDF" },
  { id: "sch-risk", name: "Risk Overview", frequency: "weekly", recipients: "risk@company.com", nextRun: "Fri 07:00", status: "paused", format: "Excel" },
  { id: "sch-incidents", name: "Incident Report", frequency: "monthly", recipients: "ops@company.com", nextRun: "1st 06:00", status: "active", format: "PDF" },
  { id: "sch-settlement", name: "Settlement Report", frequency: "daily", recipients: "treasury@company.com", nextRun: "Today 21:00", status: "error", format: "CSV" },
  { id: "sch-platform", name: "Platform Health", frequency: "weekly", recipients: "infra@company.com", nextRun: "Sun 22:00", status: "active", format: "PDF" },
];

export const exportOptions: ExportOption[] = [
  { id: "exp-pdf", format: "pdf", label: "PDF", lastExport: "2h ago", fileSize: "2.4 MB", status: "ready" },
  { id: "exp-excel", format: "excel", label: "Excel", lastExport: "1h ago", fileSize: "1.8 MB", status: "ready" },
  { id: "exp-csv", format: "csv", label: "CSV", lastExport: "30m ago", fileSize: "840 KB", status: "ready" },
  { id: "exp-json", format: "json", label: "JSON", lastExport: "4h ago", fileSize: "1.2 MB", status: "ready" },
  { id: "exp-pptx", format: "powerpoint", label: "PowerPoint", lastExport: "—", fileSize: "—", status: "unavailable" },
];

export const savedReportsData: SavedReport[] = [
  { id: "sav-pinned-1", title: "Treasury Summary", type: "pinned", lastAccessed: "10m ago" },
  { id: "sav-pinned-2", title: "Executive KPIs", type: "pinned", lastAccessed: "1h ago" },
  { id: "sav-shared-1", title: "Q4 Settlement Analysis", type: "shared", lastAccessed: "3h ago" },
  { id: "sav-shared-2", title: "Approval SLAs by Team", type: "shared", lastAccessed: "6h ago" },
  { id: "sav-private-1", title: "My Risk Assessment", type: "private", lastAccessed: "2d ago" },
  { id: "sav-recent-1", title: "Payment Activity Dec 2024", type: "recent", lastAccessed: "5m ago" },
  { id: "sav-recent-2", title: "Platform Health Weekly", type: "recent", lastAccessed: "15m ago" },
  { id: "sav-fav-1", title: "Incident Summary", type: "favorite", lastAccessed: "2h ago" },
];

export const reportTemplates: ReportTemplate[] = [
  { id: "tmpl-executive", title: "Executive Summary", category: "Executive", description: "High-level KPIs for C-suite and board reporting" },
  { id: "tmpl-finance", title: "Finance Overview", category: "Finance", description: "Cash position, working capital, and financial health" },
  { id: "tmpl-treasury", title: "Treasury Report", category: "Treasury", description: "Account balances, settlement status, and liquidity" },
  { id: "tmpl-operations", title: "Operations Summary", category: "Operations", description: "Queue health, processing times, and incident metrics" },
  { id: "tmpl-audit", title: "Audit Trail", category: "Audit", description: "Complete event log for compliance and investigations" },
  { id: "tmpl-compliance", title: "Compliance Report", category: "Compliance", description: "Policy adherence, risk exposure, and open exceptions" },
  { id: "tmpl-risk", title: "Risk Overview", category: "Risk", description: "Risk scores, alert summary, and mitigation status" },
  { id: "tmpl-platform", title: "Platform Health", category: "Platform", description: "Service availability, latency, and job success rates" },
  { id: "tmpl-developer", title: "Developer Activity", category: "Developer", description: "API usage, webhook delivery, and SDK adoption" },
];
