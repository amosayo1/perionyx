export type PersonalizationScope = "user" | "role" | "department" | "business_unit" | "organization";
export type ThemeMode = "dark" | "light" | "system";
export type DensityMode = "compact" | "comfortable" | "spacious";
export type DateFormat = "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
export type DashboardLayout = "single" | "two_column" | "three_column" | "grid" | "freeform";

export interface UserPreferences {
  theme: ThemeMode;
  density: DensityMode;
  language: string;
  dateFormat: DateFormat;
  currency: string;
  timezone: string;
  landingPage: string;
  dashboardLayout: DashboardLayout;
  pinnedWidgets: string[];
  hiddenWidgets: string[];
  pinnedNavItems: string[];
  recentReports: string[];
  favoriteReports: string[];
  notificationPreferences: Record<string, boolean>;
  layoutOverrides: Record<string, unknown>;
}

export interface UserBehaviorProfile {
  userId: string;
  companyId: string;
  roles: string[];
  recentlyVisited: PageVisit[];
  frequentModules: ModuleFrequency[];
  searchPatterns: SearchPattern[];
  approvalPatterns: ApprovalPattern[];
  activeTimes: ActiveTime[];
  lastActiveAt: string;
  onboardingComplete: boolean;
  featureAdoption: Record<string, boolean>;
}

export interface PageVisit {
  page: string;
  module: string;
  visitedAt: string;
  durationMs?: number;
}

export interface ModuleFrequency {
  module: string;
  visits: number;
  lastVisited: string;
}

export interface SearchPattern {
  query: string;
  count: number;
  lastSearched: string;
}

export interface ApprovalPattern {
  action: "approved" | "rejected" | "delegated" | "escalated";
  count: number;
  avgResponseTimeMs: number;
}

export interface ActiveTime {
  dayOfWeek: number;
  hour: number;
  frequency: number;
}

export interface WidgetRecommendation {
  widgetId: string;
  title: string;
  reason: string;
  score: number;
  source: "role_default" | "behavior" | "frequent" | "recent" | "business_priority";
  module: string;
}

export interface NavigationSuggestion {
  module: string;
  label: string;
  score: number;
  reason: string;
  icon?: string;
  url: string;
}

export interface ShortcutSuggestion {
  id: string;
  label: string;
  action: string;
  url?: string;
  module: string;
  score: number;
  context: string;
}

export interface PersonalizedDashboard {
  layout: DashboardLayout;
  widgets: WidgetRecommendation[];
  pinnedItems: string[];
  quickActions: ShortcutSuggestion[];
  generatedAt: string;
}

export interface PersonalizationAuditEntry {
  action: "PREFERENCE_UPDATED" | "PREFERENCE_RESET" | "DASHBOARD_ADAPTED" | "NAVIGATION_ADAPTED" | "WIDGET_RECOMMENDED" | "SHORTCUT_CREATED" | "BEHAVIOR_TRACKED" | "LEARNING_APPLIED";
  userId: string;
  companyId: string;
  details: string;
  timestamp: string;
}

export const ROLE_DEFAULT_WIDGETS: Record<string, string[]> = {
  CFO: ["cash-position", "forecast-summary", "executive-briefing", "board-kpis", "strategic-risks", "approval-summary"],
  TREASURER: ["liquidity-overview", "bank-positions", "cash-forecast", "payment-queue", "fx-exposure"],
  CONTROLLER: ["reconciliation-status", "month-end-progress", "journal-review", "financial-statements", "compliance-status"],
  FINANCE_MANAGER: ["team-activity", "approval-queue", "workflow-status", "report-list", "invoice-summary"],
  AUDITOR: ["audit-trail", "policy-changes", "risk-events", "compliance-reports", "exception-tracker"],
  ADMINISTRATOR: ["system-health", "user-activity", "connector-status", "security-alerts", "config-summary"],
  OPERATIONS: ["workflow-health", "automation-status", "connector-health", "queue-metrics", "incident-log"],
};

export const ROLE_NAVIGATION_PRIORITY: Record<string, string[]> = {
  CFO: ["analytics", "treasury", "approvals", "reports", "risk", "compliance"],
  TREASURER: ["treasury", "payments", "approvals", "analytics", "reports"],
  CONTROLLER: ["reconciliation", "compliance", "audit", "reports", "approvals"],
  FINANCE_MANAGER: ["approvals", "payments", "workflows", "reports", "invoices"],
  AUDITOR: ["audit", "compliance", "risk", "policies", "reports"],
  ADMINISTRATOR: ["settings", "users", "audit", "connectors", "automation"],
  OPERATIONS: ["workflows", "automation", "monitoring", "connectors", "notifications"],
};

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: "dark",
  density: "comfortable",
  language: "en",
  dateFormat: "YYYY-MM-DD",
  currency: "USD",
  timezone: "UTC",
  landingPage: "/analytics",
  dashboardLayout: "two_column",
  pinnedWidgets: [],
  hiddenWidgets: [],
  pinnedNavItems: [],
  recentReports: [],
  favoriteReports: [],
  notificationPreferences: {},
  layoutOverrides: {},
};
