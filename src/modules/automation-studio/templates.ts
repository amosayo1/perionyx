import type { AutomationTemplate } from "./types";

export type { AutomationTemplate } from "./types";

import type { StepDefinition } from "@/modules/workflow/types";
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  steps: StepDefinition[];
  estimatedDuration: string;
  popularity: "high" | "medium" | "low";
  triggerType: "manual" | "scheduled" | "event";
}

export const BUILTIN_TEMPLATES: AutomationTemplate[] = [
  // ── 1. Invoice Approval ──────────────────────────────────────────────
  {
    id: "invoice-approval",
    name: "Invoice Approval",
    description: "Multi-step invoice approval chain with policy validation, managerial review, finance sign-off, and ledger posting",
    category: "approval",
    icon: "FileText",
    kind: "semi_automated",
    steps: [
      { id: "validate", type: "policy_evaluation", label: "Validate Invoice", config: { scope: "invoice" }, dependsOn: [] },
      { id: "manager-approval", type: "approval", label: "Manager Approval", config: { requiredRole: "MANAGER", threshold: 10000 }, dependsOn: ["validate"] },
      { id: "finance-approval", type: "approval", label: "Finance Approval", config: { requiredRole: "TREASURER", threshold: 50000 }, dependsOn: ["manager-approval"] },
      { id: "notify-approver", type: "notification", label: "Notify Approver", config: { channel: "email", template: "approval_granted" }, dependsOn: ["finance-approval"] },
      { id: "post-ledger", type: "connector_execution", label: "Post to Ledger", config: { connectorType: "ledger", action: "post" }, dependsOn: ["notify-approver"] },
    ],
    inputSchema: { invoiceId: "string", amount: "number", vendorId: "string", dueDate: "string" },
    outputSchema: { ledgerEntryId: "string", status: "string" },
    metadata: {
      author: "system",
      version: "2.0.0",
      tags: ["invoice", "approval", "accounts-payable", "procurement"],
      riskLevel: "medium",
      estimatedDuration: "~2 hours",
      requiresApproval: true,
      defaultSchedule: null,
    },
    triggerType: "manual",
    popularity: "high",
    status: "active",
  },

  // ── 2. Purchase Approval ─────────────────────────────────────────────
  {
    id: "purchase-approval",
    name: "Purchase Approval",
    description: "Procurement purchase order approval with budget checking, manager approval, and PO generation",
    category: "procurement",
    icon: "ShoppingCart",
    kind: "semi_automated",
    steps: [
      { id: "budget-check", type: "policy_evaluation", label: "Budget Check", config: { scope: "budget" }, dependsOn: [] },
      { id: "manager-approval", type: "approval", label: "Manager Approval", config: { requiredRole: "MANAGER", threshold: 5000 }, dependsOn: ["budget-check"] },
      { id: "procurement-approval", type: "approval", label: "Procurement Approval", config: { requiredRole: "ADMIN", threshold: 25000 }, dependsOn: ["manager-approval"] },
      { id: "generate-po", type: "connector_execution", label: "Generate PO", config: { connectorType: "reporting", action: "generate_document" }, dependsOn: ["procurement-approval"] },
      { id: "notify-vendor", type: "notification", label: "Notify Vendor", config: { channel: "email", template: "po_issued" }, dependsOn: ["generate-po"] },
    ],
    inputSchema: { amount: "number", department: "string", vendorId: "string", costCenter: "string" },
    outputSchema: { poNumber: "string", status: "string" },
    metadata: {
      author: "system",
      version: "1.0.0",
      tags: ["purchase-order", "procurement", "budget", "approval"],
      riskLevel: "medium",
      estimatedDuration: "~3 hours",
      requiresApproval: true,
      defaultSchedule: null,
    },
    triggerType: "manual",
    popularity: "high",
    status: "active",
  },

  // ── 3. Treasury Transfer ─────────────────────────────────────────────
  {
    id: "treasury-transfer",
    name: "Treasury Transfer",
    description: "Internal treasury transfer between accounts with policy checks, dual approval, and execution",
    category: "treasury",
    icon: "ArrowRightLeft",
    kind: "semi_automated",
    steps: [
      { id: "validate-transfer", type: "policy_evaluation", label: "Validate Transfer", config: { scope: "transaction" }, dependsOn: [] },
      { id: "ai-risk-review", type: "ai_recommendation", label: "AI Risk Review", config: { prompt: "review_transfer_risk" }, dependsOn: ["validate-transfer"] },
      { id: "treasury-approval", type: "approval", label: "Treasury Approval", config: { requiredRole: "TREASURER" }, dependsOn: ["ai-risk-review"] },
      { id: "execute-transfer", type: "connector_execution", label: "Execute Transfer", config: { connectorType: "treasury", action: "transfer" }, dependsOn: ["treasury-approval"] },
    ],
    inputSchema: { sourceAccountId: "string", destAccountId: "string", amount: "number", currency: "string" },
    outputSchema: { transferId: "string", status: "string", newSourceBalance: "number" },
    metadata: {
      author: "system",
      version: "1.0.0",
      tags: ["treasury", "transfer", "internal", "cash-management"],
      riskLevel: "high",
      estimatedDuration: "~30 minutes",
      requiresApproval: true,
      defaultSchedule: null,
    },
    triggerType: "manual",
    popularity: "high",
    status: "active",
  },

  // ── 4. High Value Payment ────────────────────────────────────────────
  {
    id: "high-value-payment",
    name: "High Value Payment",
    description: "Enhanced approval for payments exceeding configurable thresholds with AI risk assessment and dual sign-off",
    category: "payment",
    icon: "Banknote",
    kind: "semi_automated",
    steps: [
      { id: "risk-check", type: "policy_evaluation", label: "Risk Assessment", config: { scope: "payment" }, dependsOn: [] },
      { id: "ai-review", type: "ai_recommendation", label: "AI Recommendation", config: { prompt: "review_payment_risk" }, dependsOn: ["risk-check"] },
      { id: "dual-approval", type: "approval", label: "Dual Approval", config: { requiredRole: "TREASURER", parallelApprovers: 2 }, dependsOn: ["ai-review"] },
      { id: "executive-signoff", type: "approval", label: "Executive Sign-Off", config: { requiredRole: "ADMIN" }, dependsOn: ["dual-approval"] },
      { id: "execute-payment", type: "connector_execution", label: "Execute Payment", config: { connectorType: "payment", action: "send" }, dependsOn: ["executive-signoff"] },
      { id: "send-receipt", type: "notification", label: "Send Receipt", config: { channel: "email" }, dependsOn: ["execute-payment"] },
    ],
    inputSchema: { payeeId: "string", amount: "number", currency: "string", paymentMethod: "string", effectiveDate: "string" },
    outputSchema: { paymentId: "string", status: "string", settledAt: "string" },
    metadata: {
      author: "system",
      version: "2.0.0",
      tags: ["payment", "high-value", "approval", "risk", "compliance"],
      riskLevel: "critical",
      estimatedDuration: "~4 hours",
      requiresApproval: true,
      defaultSchedule: null,
    },
    triggerType: "manual",
    popularity: "high",
    status: "active",
  },

  // ── 5. Vendor Onboarding ─────────────────────────────────────────────
  {
    id: "vendor-onboarding",
    name: "Vendor Onboarding",
    description: "Complete vendor setup workflow with compliance screening, risk scoring, procurement approval, and finance activation",
    category: "procurement",
    icon: "UserPlus",
    kind: "semi_automated",
    steps: [
      { id: "compliance-check", type: "policy_evaluation", label: "Compliance Screening", config: { scope: "vendor" }, dependsOn: [] },
      { id: "ai-risk-score", type: "ai_recommendation", label: "AI Risk Scoring", config: { prompt: "vendor_risk" }, dependsOn: ["compliance-check"] },
      { id: "procurement-approval", type: "approval", label: "Procurement Approval", config: { requiredRole: "MANAGER" }, dependsOn: ["ai-risk-score"] },
      { id: "finance-setup", type: "human_task", label: "Finance Setup", config: { taskType: "setup", role: "TREASURER" }, dependsOn: ["procurement-approval"] },
      { id: "notify-onboarded", type: "notification", label: "Notify Onboarding Complete", config: { channel: "email" }, dependsOn: ["finance-setup"] },
    ],
    inputSchema: { vendorName: "string", taxId: "string", region: "string", category: "string" },
    outputSchema: { vendorId: "string", riskScore: "number", status: "string" },
    metadata: {
      author: "system",
      version: "2.0.0",
      tags: ["vendor", "onboarding", "compliance", "procurement", "kyc"],
      riskLevel: "medium",
      estimatedDuration: "~3 hours",
      requiresApproval: true,
      defaultSchedule: null,
    },
    triggerType: "manual",
    popularity: "medium",
    status: "active",
  },

  // ── 6. Employee Expense ──────────────────────────────────────────────
  {
    id: "employee-expense",
    name: "Employee Expense",
    description: "Employee expense report approval with policy validation, manager review, finance audit, and reimbursement",
    category: "expense",
    icon: "Receipt",
    kind: "semi_automated",
    steps: [
      { id: "policy-check", type: "policy_evaluation", label: "Policy Check", config: { scope: "expense" }, dependsOn: [] },
      { id: "ai-audit", type: "ai_recommendation", label: "AI Audit Flag", config: { prompt: "expense_audit" }, dependsOn: ["policy-check"] },
      { id: "manager-approval", type: "approval", label: "Manager Approval", config: { requiredRole: "MANAGER" }, dependsOn: ["ai-audit"] },
      { id: "finance-review", type: "approval", label: "Finance Review", config: { requiredRole: "TREASURER", threshold: 5000 }, dependsOn: ["manager-approval"] },
      { id: "trigger-reimbursement", type: "connector_execution", label: "Trigger Reimbursement", config: { connectorType: "payment", action: "send" }, dependsOn: ["finance-review"] },
    ],
    inputSchema: { employeeId: "string", amount: "number", category: "string", receiptUrls: "string[]", projectCode: "string" },
    outputSchema: { reportId: "string", approvedAmount: "number", reimbursementId: "string" },
    metadata: {
      author: "system",
      version: "1.0.0",
      tags: ["expense", "reimbursement", "employee", "approval"],
      riskLevel: "low",
      estimatedDuration: "~1 hour",
      requiresApproval: true,
      defaultSchedule: null,
    },
    triggerType: "manual",
    popularity: "high",
    status: "active",
  },

  // ── 7. Budget Approval ───────────────────────────────────────────────
  {
    id: "budget-approval",
    name: "Budget Approval",
    description: "Annual budget approval workflow with departmental review, finance consolidation, and executive sign-off",
    category: "budget",
    icon: "BarChart3",
    kind: "semi_automated",
    steps: [
      { id: "department-review", type: "human_task", label: "Department Review", config: { taskType: "review", role: "MANAGER" }, dependsOn: [] },
      { id: "finance-consolidation", type: "policy_evaluation", label: "Finance Consolidation", config: { scope: "budget" }, dependsOn: ["department-review"] },
      { id: "ai-forecast", type: "ai_recommendation", label: "AI Forecast Comparison", config: { prompt: "budget_forecast" }, dependsOn: ["finance-consolidation"] },
      { id: "executive-approval", type: "approval", label: "Executive Approval", config: { requiredRole: "ADMIN" }, dependsOn: ["ai-forecast"] },
      { id: "notify-approval", type: "notification", label: "Notify Budget Approval", config: { channel: "email", template: "budget_approved" }, dependsOn: ["executive-approval"] },
    ],
    inputSchema: { fiscalYear: "string", departmentBudgets: "Record<string,number>", notes: "string" },
    outputSchema: { approvalId: "string", totalBudget: "number", status: "string" },
    metadata: {
      author: "system",
      version: "1.0.0",
      tags: ["budget", "planning", "approval", "forecast", "annual"],
      riskLevel: "high",
      estimatedDuration: "~1 week",
      requiresApproval: true,
      defaultSchedule: null,
    },
    triggerType: "manual",
    popularity: "medium",
    status: "active",
  },

  // ── 8. Cash Sweep ────────────────────────────────────────────────────
  {
    id: "cash-sweep",
    name: "Cash Sweep",
    description: "Automated end-of-day cash sweep across accounts with threshold monitoring and balance optimization",
    category: "treasury",
    icon: "Radar",
    kind: "automated",
    steps: [
      { id: "check-balances", type: "connector_execution", label: "Check Account Balances", config: { connectorType: "treasury", action: "fetch_positions" }, dependsOn: [] },
      { id: "ai-sweep-analysis", type: "ai_recommendation", label: "AI Sweep Analysis", config: { prompt: "sweep_optimization" }, dependsOn: ["check-balances"] },
      { id: "execute-sweep", type: "connector_execution", label: "Execute Sweep Transfers", config: { connectorType: "treasury", action: "transfer" }, dependsOn: ["ai-sweep-analysis"] },
      { id: "notify-result", type: "notification", label: "Notify Sweep Result", config: { channel: "in_app", template: "sweep_complete" }, dependsOn: ["execute-sweep"] },
    ],
    inputSchema: { targetBalance: "number", threshold: "number", excludedAccounts: "string[]" },
    outputSchema: { sweepId: "string", transfers: "number", totalMoved: "number" },
    metadata: {
      author: "system",
      version: "1.0.0",
      tags: ["cash-sweep", "treasury", "automation", "end-of-day", "liquidity"],
      riskLevel: "high",
      estimatedDuration: "~10 minutes",
      requiresApproval: false,
      defaultSchedule: "0 18 * * *",
    },
    triggerType: "scheduled",
    popularity: "medium",
    status: "active",
  },

  // ── 9. FX Exposure Review ────────────────────────────────────────────
  {
    id: "fx-exposure-review",
    name: "FX Exposure Review",
    description: "Daily foreign exchange exposure review with AI risk analysis, hedging recommendations, and treasury sign-off",
    category: "treasury",
    icon: "Globe",
    kind: "semi_automated",
    steps: [
      { id: "fetch-positions", type: "connector_execution", label: "Fetch FX Positions", config: { connectorType: "treasury", action: "fetch_fx_positions" }, dependsOn: [] },
      { id: "ai-exposure-analysis", type: "ai_recommendation", label: "AI Exposure Analysis", config: { prompt: "fx_exposure" }, dependsOn: ["fetch-positions"] },
      { id: "treasury-review", type: "approval", label: "Treasury Review", config: { requiredRole: "TREASURER" }, dependsOn: ["ai-exposure-analysis"] },
      { id: "generate-report", type: "connector_execution", label: "Generate FX Report", config: { connectorType: "reporting", action: "generate" }, dependsOn: ["treasury-review"] },
    ],
    inputSchema: { baseCurrency: "string", counterparties: "string[]", threshold: "number" },
    outputSchema: { reportId: "string", netExposure: "number", recommendations: "string[]" },
    metadata: {
      author: "system",
      version: "1.0.0",
      tags: ["fx", "forex", "exposure", "treasury", "hedging", "risk"],
      riskLevel: "high",
      estimatedDuration: "~20 minutes",
      requiresApproval: true,
      defaultSchedule: "0 7 * * 1-5",
    },
    triggerType: "scheduled",
    popularity: "medium",
    status: "active",
  },

  // ── 10. Bank Reconciliation ──────────────────────────────────────────
  {
    id: "bank-reconciliation",
    name: "Bank Reconciliation",
    description: "Automated bank reconciliation with Plaid sync, transaction matching, exception handling, and report generation",
    category: "reconciliation",
    icon: "RefreshCw",
    kind: "semi_automated",
    steps: [
      { id: "fetch-bank-data", type: "connector_execution", label: "Fetch Bank Statements", config: { connectorType: "plaid", action: "sync" }, dependsOn: [] },
      { id: "fetch-ledger", type: "connector_execution", label: "Fetch Ledger Entries", config: { connectorType: "ledger", action: "fetch_unreconciled" }, dependsOn: [] },
      { id: "auto-match", type: "policy_evaluation", label: "Auto-Match Transactions", config: { scope: "reconciliation" }, dependsOn: ["fetch-bank-data", "fetch-ledger"] },
      { id: "decision-check", type: "decision", label: "Exception Decision", config: { condition: "exceptions_found" }, dependsOn: ["auto-match"] },
      { id: "notify-exceptions", type: "notification", label: "Notify Exceptions", config: { channel: "in_app", template: "reconciliation_exception" }, dependsOn: ["decision-check"] },
      { id: "generate-report", type: "connector_execution", label: "Generate Report", config: { connectorType: "reporting", action: "generate" }, dependsOn: ["auto-match"] },
    ],
    inputSchema: { accountIds: "string[]", dateRange: "string", autoApproveThreshold: "number" },
    outputSchema: { reconciliationId: "string", matchedCount: "number", exceptionCount: "number", reportUrl: "string" },
    metadata: {
      author: "system",
      version: "2.0.0",
      tags: ["reconciliation", "bank", "plaid", "matching", "exceptions"],
      riskLevel: "medium",
      estimatedDuration: "~1 hour",
      requiresApproval: false,
      defaultSchedule: "0 6 * * *",
    },
    triggerType: "scheduled",
    popularity: "high",
    status: "active",
  },

  // ── 11. Month-End Close ──────────────────────────────────────────────
  {
    id: "month-end-close",
    name: "Month-End Close",
    description: "Comprehensive month-end close process with reconciliation, accruals, financial review, and reporting",
    category: "close",
    icon: "CalendarCheck",
    kind: "semi_automated",
    steps: [
      { id: "run-reconciliation", type: "connector_execution", label: "Run Reconciliation", config: { connectorType: "plaid", action: "sync" }, dependsOn: [] },
      { id: "post-accruals", type: "policy_evaluation", label: "Post Accruals", config: { scope: "transaction" }, dependsOn: ["run-reconciliation"] },
      { id: "ai-close-review", type: "ai_recommendation", label: "AI Close Review", config: { prompt: "close_anomalies" }, dependsOn: ["post-accruals"] },
      { id: "controller-review", type: "approval", label: "Controller Review", config: { requiredRole: "ADMIN" }, dependsOn: ["ai-close-review"] },
      { id: "finalize-ledger", type: "connector_execution", label: "Finalize Ledger", config: { connectorType: "ledger", action: "close_period" }, dependsOn: ["controller-review"] },
      { id: "generate-statements", type: "connector_execution", label: "Generate Statements", config: { connectorType: "reporting", action: "generate" }, dependsOn: ["finalize-ledger"] },
      { id: "distribute-reports", type: "notification", label: "Distribute Reports", config: { channel: "email", template: "month_end_complete" }, dependsOn: ["generate-statements"] },
    ],
    inputSchema: { closeDate: "string", fiscalPeriod: "string", notifyStakeholders: "boolean" },
    outputSchema: { closeId: "string", status: "string", reportUrls: "string[]", periodStatus: "string" },
    metadata: {
      author: "system",
      version: "1.0.0",
      tags: ["month-end", "close", "financials", "reconciliation", "reporting", "accruals"],
      riskLevel: "critical",
      estimatedDuration: "~1 day",
      requiresApproval: true,
      defaultSchedule: "0 8 1 * *",
    },
    triggerType: "scheduled",
    popularity: "high",
    status: "active",
  },

  // ── 12. Financial Reporting ──────────────────────────────────────────
  {
    id: "financial-reporting",
    name: "Financial Reporting",
    description: "Scheduled financial report generation with data aggregation, AI commentary, compliance review, and distribution",
    category: "reporting",
    icon: "FileBarChart",
    kind: "automated",
    steps: [
      { id: "aggregate-data", type: "connector_execution", label: "Aggregate Financial Data", config: { connectorType: "ledger", action: "aggregate" }, dependsOn: [] },
      { id: "ai-commentary", type: "ai_recommendation", label: "Generate AI Commentary", config: { prompt: "financial_commentary" }, dependsOn: ["aggregate-data"] },
      { id: "generate-report", type: "connector_execution", label: "Generate Report", config: { connectorType: "reporting", action: "generate" }, dependsOn: ["ai-commentary"] },
      { id: "distribute-report", type: "notification", label: "Distribute Report", config: { channel: "email", template: "financial_report" }, dependsOn: ["generate-report"] },
    ],
    inputSchema: { reportType: "string", period: "string", format: "string", recipients: "string[]" },
    outputSchema: { reportId: "string", reportUrl: "string", generatedAt: "string", pages: "number" },
    metadata: {
      author: "system",
      version: "1.0.0",
      tags: ["reporting", "financials", "automation", "distribution", "analytics"],
      riskLevel: "low",
      estimatedDuration: "~15 minutes",
      requiresApproval: false,
      defaultSchedule: "0 7 1 * *",
    },
    triggerType: "scheduled",
    popularity: "medium",
    status: "active",
  },
];
