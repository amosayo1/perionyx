import type { StepType, WorkflowStatus } from "@/modules/workflow/types";

export interface WorkflowDesignerState {
  name: string;
  description: string;
  category: string;
  triggerType: "manual" | "scheduled" | "webhook" | "treasury_event" | "connector_event" | "approval_event" | "ai_event" | "policy_violation";
  cronExpression: string;
  steps: DesignerStep[];
  selectedStepId: string | null;
  isDirty: boolean;
}

export interface DesignerStep {
  id: string;
  type: StepType;
  label: string;
  config: Record<string, unknown>;
  dependsOn: string[];
  position: { x: number; y: number };
}

export interface StepPaletteItem {
  type: StepType;
  label: string;
  description: string;
  icon: string;
  category: "approval" | "automation" | "intelligence" | "integration";
  color: string;
}

export const STEP_PALETTE: StepPaletteItem[] = [
  { type: "approval", label: "Approval", description: "Require approval from a specific role", icon: "ShieldCheck", category: "approval", color: "#d4af37" },
  { type: "human_task", label: "Human Task", description: "Manual input or review by a user", icon: "UserCheck", category: "approval", color: "#f59e0b" },
  { type: "decision", label: "Decision", description: "Branch workflow based on conditions", icon: "GitBranch", category: "automation", color: "#8b5cf6" },
  { type: "policy_evaluation", label: "Policy Check", description: "Evaluate against defined policies", icon: "FileSearch", category: "automation", color: "#06b6d4" },
  { type: "notification", label: "Notification", description: "Send alerts via email or in-app", icon: "Bell", category: "automation", color: "#3b82f6" },
  { type: "delay", label: "Delay / Wait", description: "Pause execution for a duration", icon: "Clock", category: "automation", color: "#64748b" },
  { type: "conditional", label: "Conditional Branch", description: "Route based on variable values", icon: "SplitSquareHorizontal", category: "automation", color: "#a855f7" },
  { type: "ai_recommendation", label: "AI Recommendation", description: "Get AI analysis and suggestions", icon: "Brain", category: "intelligence", color: "#10b981" },
  { type: "connector_execution", label: "Connector Action", description: "Run a connector (Plaid, ledger, etc.)", icon: "Cable", category: "integration", color: "#ec4899" },
  { type: "report_generation", label: "Report Generation", description: "Generate a financial report", icon: "FileBarChart", category: "integration", color: "#f97316" },
  { type: "webhook", label: "Webhook", description: "Send data to an external endpoint", icon: "Webhook", category: "integration", color: "#14b8a6" },
];

export const TRIGGER_OPTIONS = [
  { value: "manual", label: "Manual", description: "Triggered manually by a user", icon: "Hand" },
  { value: "scheduled", label: "Scheduled", description: "Run on a cron schedule", icon: "CalendarClock" },
  { value: "webhook", label: "Webhook", description: "Triggered by an incoming webhook", icon: "Webhook" },
  { value: "treasury_event", label: "Treasury Event", description: "Balance change, transaction posted, etc.", icon: "Wallet" },
  { value: "connector_event", label: "Connector Event", description: "Connector run completed or failed", icon: "Cable" },
  { value: "approval_event", label: "Approval Event", description: "Approval granted or rejected", icon: "ShieldCheck" },
  { value: "ai_event", label: "AI Event", description: "AI insight or recommendation generated", icon: "Brain" },
  { value: "policy_violation", label: "Policy Violation", description: "Policy rule triggered", icon: "ShieldAlert" },
];

export const CATEGORY_OPTIONS = [
  { value: "general", label: "General" },
  { value: "approval", label: "Approval" },
  { value: "financial", label: "Financial" },
  { value: "compliance", label: "Compliance" },
  { value: "integration", label: "Integration" },
  { value: "notification", label: "Notification" },
  { value: "report", label: "Report" },
  { value: "custom", label: "Custom" },
];

export const STATUS_CONFIG: Record<WorkflowStatus, { label: string; color: string; bg: string; dot: string }> = {
  PENDING: { label: "Pending", color: "text-zinc-400", bg: "bg-zinc-900/60", dot: "bg-zinc-400" },
  VALIDATED: { label: "Validated", color: "text-blue-400", bg: "bg-blue-950/30", dot: "bg-blue-400" },
  RUNNING: { label: "Running", color: "text-emerald-400", bg: "bg-emerald-950/30", dot: "bg-emerald-400" },
  WAITING: { label: "Waiting", color: "text-amber-400", bg: "bg-amber-950/30", dot: "bg-amber-400" },
  PAUSED: { label: "Paused", color: "text-zinc-400", bg: "bg-zinc-900/60", dot: "bg-zinc-400" },
  COMPLETED: { label: "Completed", color: "text-emerald-400", bg: "bg-emerald-950/30", dot: "bg-emerald-400" },
  FAILED: { label: "Failed", color: "text-red-400", bg: "bg-red-950/30", dot: "bg-red-400" },
  CANCELLED: { label: "Cancelled", color: "text-zinc-500", bg: "bg-zinc-900/40", dot: "bg-zinc-500" },
  ARCHIVED: { label: "Archived", color: "text-zinc-600", bg: "bg-zinc-900/30", dot: "bg-zinc-600" },
};

export const STEP_TYPE_LABELS: Record<string, string> = {
  approval: "Approval",
  human_task: "Human Task",
  decision: "Decision",
  policy_evaluation: "Policy Check",
  notification: "Notification",
  delay: "Delay",
  conditional: "Conditional Branch",
  parallel: "Parallel",
  connector_execution: "Connector Action",
  report_generation: "Report Generation",
  ai_recommendation: "AI Recommendation",
  webhook: "Webhook",
  custom: "Custom",
};
