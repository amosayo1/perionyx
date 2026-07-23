export type TimelineSource =
  | "treasury" | "payments" | "invoices" | "receivables" | "payables"
  | "approvals" | "workflow_engine" | "automation_studio"
  | "compliance" | "risk" | "policies" | "audit" | "analytics"
  | "notifications" | "business_graph" | "executive_intelligence"
  | "ai_recommendations" | "customer_discovery";

export type TimelineEventType =
  | "PAYMENT_APPROVED" | "PAYMENT_REJECTED" | "PAYMENT_FAILED" | "PAYMENT_COMPLETED"
  | "WORKFLOW_STARTED" | "WORKFLOW_COMPLETED" | "WORKFLOW_FAILED" | "WORKFLOW_PAUSED"
  | "POLICY_CREATED" | "POLICY_UPDATED" | "POLICY_ENABLED" | "POLICY_DISABLED"
  | "APPROVAL_ESCALATED" | "APPROVAL_COMPLETED" | "APPROVAL_DELEGATED"
  | "TREASURY_THRESHOLD_REACHED" | "TREASURY_BALANCE_CHANGED"
  | "CASH_FORECAST_UPDATED" | "FORECAST_UPDATED"
  | "RISK_DETECTED" | "RISK_ESCALATED" | "RISK_RESOLVED"
  | "COMPLIANCE_ALERT" | "COMPLIANCE_RESOLVED"
  | "MONTH_END_MILESTONE" | "BANK_RECONCILIATION_COMPLETED"
  | "NEW_VENDOR" | "VENDOR_RISK_IDENTIFIED"
  | "BUDGET_EXCEEDED" | "INVOICE_OVERDUE" | "INVOICE_PAID"
  | "BUSINESS_RECOMMENDATION" | "AI_INSIGHT_GENERATED"
  | "EXECUTIVE_BRIEFING_PUBLISHED"
  | "RECONCILIATION_ISSUE" | "CONNECTOR_FAILURE"
  | "AUTOMATION_TRIGGERED" | "AUTOMATION_FAILED"
  | "SCHEDULE_CHANGED";

export type TimelineSeverity = "critical" | "high" | "medium" | "low" | "informational";

export type TimelineView = "today" | "yesterday" | "last_7_days" | "last_30_days" | "month_end" | "quarter" | "custom";

export interface TimelineEntity {
  type: string;
  id: string;
  label: string;
  url?: string;
}

export interface TimelineQuickAction {
  id: string;
  label: string;
  action: "open_workflow" | "view_report" | "approve" | "review_policy" | "view_analytics" | "assign_task" | "dismiss" | "investigate" | "navigate";
  url?: string;
  entityType?: string;
  entityId?: string;
}

export interface TimelineEvidence {
  source: string;
  snippet: string;
  url?: string;
}

export interface TimelineNarrativeGroup {
  id: string;
  title: string;
  summary: string;
  eventIds: string[];
  period: { start: string; end: string };
  eventCount: number;
  severity: TimelineSeverity;
  source: TimelineSource;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  type: TimelineEventType;
  title: string;
  summary: string;
  businessImpact: string;
  severity: TimelineSeverity;
  source: TimelineSource;
  module: string;
  entities: TimelineEntity[];
  recommendedAction?: string;
  quickActions: TimelineQuickAction[];
  evidence: TimelineEvidence[];
  metadata: Record<string, unknown>;
  companyId: string;
  tags: string[];
  isRead: boolean;
  isDismissed: boolean;
  narrativeGroupId?: string;
  priorityScore: number;
}

export interface TimelineFilter {
  modules?: TimelineSource[];
  severities?: TimelineSeverity[];
  types?: TimelineEventType[];
  dateRange?: { start: string; end: string };
  tags?: string[];
  searchQuery?: string;
  isDismissed?: boolean;
  minPriority?: number;
}

export interface TimelineQuery {
  companyId: string;
  view: TimelineView;
  filter?: TimelineFilter;
  limit: number;
  offset: number;
  includeNarratives?: boolean;
}

export interface TimelineResponse {
  events: TimelineEvent[];
  narrativeGroups: TimelineNarrativeGroup[];
  totalCount: number;
  hasMore: boolean;
  view: TimelineView;
  generatedAt: string;
  summary?: string;
}

export const TIMELINE_SOURCE_LABELS: Record<TimelineSource, string> = {
  treasury: "Treasury",
  payments: "Payments",
  invoices: "Invoices",
  receivables: "Receivables",
  payables: "Payables",
  approvals: "Approvals",
  workflow_engine: "Workflow Engine",
  automation_studio: "Automation Studio",
  compliance: "Compliance",
  risk: "Risk Management",
  policies: "Policies",
  audit: "Audit",
  analytics: "Analytics",
  notifications: "Notifications",
  business_graph: "Business Graph",
  executive_intelligence: "Executive Intelligence",
  ai_recommendations: "AI Recommendations",
  customer_discovery: "Customer Discovery",
};

export const TIMELINE_SEVERITY_ORDER: TimelineSeverity[] = [
  "critical", "high", "medium", "low", "informational",
];

export const TIMELINE_SOURCE_ORDER: Record<TimelineSource, number> = {
  treasury: 1, payments: 2, invoices: 3, receivables: 4, payables: 5,
  approvals: 6, workflow_engine: 7, automation_studio: 8,
  compliance: 9, risk: 10, policies: 11, audit: 12, analytics: 13,
  notifications: 14, business_graph: 15, executive_intelligence: 16,
  ai_recommendations: 17, customer_discovery: 18,
};
