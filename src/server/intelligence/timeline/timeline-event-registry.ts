import type { TimelineEventType, TimelineSource, TimelineSeverity } from "./types";

export interface EventTypeMeta {
  type: TimelineEventType;
  label: string;
  source: TimelineSource;
  defaultSeverity: TimelineSeverity;
  icon: string;
  description: string;
  supportsQuickActions: boolean;
}

export class TimelineEventRegistry {
  private definitions = new Map<TimelineEventType, EventTypeMeta>();

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults(): void {
    const defs: EventTypeMeta[] = [
      { type: "PAYMENT_APPROVED", label: "Payment Approved", source: "payments", defaultSeverity: "medium", icon: "check-circle", description: "A payment was approved", supportsQuickActions: true },
      { type: "PAYMENT_REJECTED", label: "Payment Rejected", source: "payments", defaultSeverity: "high", icon: "x-circle", description: "A payment was rejected", supportsQuickActions: true },
      { type: "PAYMENT_FAILED", label: "Payment Failed", source: "payments", defaultSeverity: "high", icon: "alert-circle", description: "A payment failed to process", supportsQuickActions: true },
      { type: "PAYMENT_COMPLETED", label: "Payment Completed", source: "payments", defaultSeverity: "low", icon: "check", description: "A payment was completed successfully", supportsQuickActions: false },
      { type: "WORKFLOW_STARTED", label: "Workflow Started", source: "workflow_engine", defaultSeverity: "low", icon: "play", description: "A workflow instance was started", supportsQuickActions: true },
      { type: "WORKFLOW_COMPLETED", label: "Workflow Completed", source: "workflow_engine", defaultSeverity: "low", icon: "check", description: "A workflow instance completed", supportsQuickActions: false },
      { type: "WORKFLOW_FAILED", label: "Workflow Failed", source: "workflow_engine", defaultSeverity: "high", icon: "alert-triangle", description: "A workflow instance failed", supportsQuickActions: true },
      { type: "WORKFLOW_PAUSED", label: "Workflow Paused", source: "workflow_engine", defaultSeverity: "medium", icon: "pause", description: "A workflow instance was paused", supportsQuickActions: true },
      { type: "POLICY_CREATED", label: "Policy Created", source: "policies", defaultSeverity: "medium", icon: "file-plus", description: "A new policy was created", supportsQuickActions: true },
      { type: "POLICY_UPDATED", label: "Policy Updated", source: "policies", defaultSeverity: "medium", icon: "edit", description: "A policy was updated", supportsQuickActions: true },
      { type: "POLICY_ENABLED", label: "Policy Enabled", source: "policies", defaultSeverity: "low", icon: "toggle-right", description: "A policy was enabled", supportsQuickActions: false },
      { type: "POLICY_DISABLED", label: "Policy Disabled", source: "policies", defaultSeverity: "high", icon: "toggle-left", description: "A policy was disabled", supportsQuickActions: true },
      { type: "APPROVAL_ESCALATED", label: "Approval Escalated", source: "approvals", defaultSeverity: "high", icon: "arrow-up-circle", description: "An approval was escalated to a higher authority", supportsQuickActions: true },
      { type: "APPROVAL_COMPLETED", label: "Approval Completed", source: "approvals", defaultSeverity: "low", icon: "check-circle", description: "An approval was completed", supportsQuickActions: false },
      { type: "APPROVAL_DELEGATED", label: "Approval Delegated", source: "approvals", defaultSeverity: "medium", icon: "user-check", description: "An approval was delegated", supportsQuickActions: true },
      { type: "TREASURY_THRESHOLD_REACHED", label: "Treasury Threshold Reached", source: "treasury", defaultSeverity: "high", icon: "trending-up", description: "A treasury account reached a configured threshold", supportsQuickActions: true },
      { type: "TREASURY_BALANCE_CHANGED", label: "Treasury Balance Changed", source: "treasury", defaultSeverity: "medium", icon: "dollar-sign", description: "A treasury account balance changed significantly", supportsQuickActions: false },
      { type: "CASH_FORECAST_UPDATED", label: "Cash Forecast Updated", source: "treasury", defaultSeverity: "medium", icon: "bar-chart", description: "The cash forecast was updated", supportsQuickActions: true },
      { type: "FORECAST_UPDATED", label: "Forecast Updated", source: "analytics", defaultSeverity: "medium", icon: "trending-up", description: "A financial forecast was updated", supportsQuickActions: true },
      { type: "RISK_DETECTED", label: "Risk Detected", source: "risk", defaultSeverity: "critical", icon: "alert-triangle", description: "A new risk was detected", supportsQuickActions: true },
      { type: "RISK_ESCALATED", label: "Risk Escalated", source: "risk", defaultSeverity: "critical", icon: "arrow-up-circle", description: "A risk was escalated", supportsQuickActions: true },
      { type: "RISK_RESOLVED", label: "Risk Resolved", source: "risk", defaultSeverity: "low", icon: "check", description: "A risk was resolved", supportsQuickActions: false },
      { type: "COMPLIANCE_ALERT", label: "Compliance Alert", source: "compliance", defaultSeverity: "high", icon: "shield-alert", description: "A compliance alert was triggered", supportsQuickActions: true },
      { type: "COMPLIANCE_RESOLVED", label: "Compliance Issue Resolved", source: "compliance", defaultSeverity: "low", icon: "shield-check", description: "A compliance issue was resolved", supportsQuickActions: false },
      { type: "MONTH_END_MILESTONE", label: "Month-End Milestone", source: "analytics", defaultSeverity: "medium", icon: "calendar", description: "A month-end close milestone was reached", supportsQuickActions: true },
      { type: "BANK_RECONCILIATION_COMPLETED", label: "Bank Reconciliation Completed", source: "treasury", defaultSeverity: "low", icon: "check", description: "A bank reconciliation was completed", supportsQuickActions: true },
      { type: "NEW_VENDOR", label: "New Vendor Added", source: "payables", defaultSeverity: "low", icon: "user-plus", description: "A new vendor was added", supportsQuickActions: false },
      { type: "VENDOR_RISK_IDENTIFIED", label: "Vendor Risk Identified", source: "risk", defaultSeverity: "high", icon: "alert-triangle", description: "A risk was identified for a vendor", supportsQuickActions: true },
      { type: "BUDGET_EXCEEDED", label: "Budget Exceeded", source: "analytics", defaultSeverity: "high", icon: "trending-up", description: "A budget threshold was exceeded", supportsQuickActions: true },
      { type: "INVOICE_OVERDUE", label: "Invoice Overdue", source: "invoices", defaultSeverity: "high", icon: "clock", description: "An invoice is overdue", supportsQuickActions: true },
      { type: "INVOICE_PAID", label: "Invoice Paid", source: "invoices", defaultSeverity: "low", icon: "check", description: "An invoice was paid", supportsQuickActions: false },
      { type: "BUSINESS_RECOMMENDATION", label: "Business Recommendation", source: "executive_intelligence", defaultSeverity: "medium", icon: "lightbulb", description: "A business recommendation was generated", supportsQuickActions: true },
      { type: "AI_INSIGHT_GENERATED", label: "AI Insight Generated", source: "ai_recommendations", defaultSeverity: "medium", icon: "brain", description: "An AI-generated insight is available", supportsQuickActions: true },
      { type: "EXECUTIVE_BRIEFING_PUBLISHED", label: "Executive Briefing Published", source: "executive_intelligence", defaultSeverity: "low", icon: "file-text", description: "An executive briefing was published", supportsQuickActions: true },
      { type: "RECONCILIATION_ISSUE", label: "Reconciliation Issue", source: "treasury", defaultSeverity: "high", icon: "alert-circle", description: "A reconciliation issue was detected", supportsQuickActions: true },
      { type: "CONNECTOR_FAILURE", label: "Connector Failure", source: "automation_studio", defaultSeverity: "high", icon: "link", description: "A connector failed", supportsQuickActions: true },
      { type: "AUTOMATION_TRIGGERED", label: "Automation Triggered", source: "automation_studio", defaultSeverity: "low", icon: "zap", description: "An automation was triggered", supportsQuickActions: false },
      { type: "AUTOMATION_FAILED", label: "Automation Failed", source: "automation_studio", defaultSeverity: "high", icon: "alert-triangle", description: "An automation run failed", supportsQuickActions: true },
      { type: "SCHEDULE_CHANGED", label: "Schedule Changed", source: "automation_studio", defaultSeverity: "medium", icon: "clock", description: "An automation schedule was changed", supportsQuickActions: true },
    ];

    for (const def of defs) {
      this.definitions.set(def.type, def);
    }
  }

  get(type: TimelineEventType): EventTypeMeta | undefined {
    return this.definitions.get(type);
  }

  getAll(): EventTypeMeta[] {
    return Array.from(this.definitions.values());
  }

  getBySource(source: TimelineSource): EventTypeMeta[] {
    return Array.from(this.definitions.values()).filter((d) => d.source === source);
  }

  getTypeLabel(type: TimelineEventType): string {
    return this.definitions.get(type)?.label ?? type;
  }
}

export const timelineEventRegistry = new TimelineEventRegistry();
