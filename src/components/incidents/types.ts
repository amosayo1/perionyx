export type IncidentSeverity = "critical" | "high" | "medium" | "low";

export type IncidentStatus =
  | "open"
  | "investigating"
  | "awaiting_info"
  | "fix_in_progress"
  | "resolved"
  | "closed";

export type IncidentCategory =
  | "treasury"
  | "approvals"
  | "ledger"
  | "policy"
  | "risk"
  | "reconciliation"
  | "notifications"
  | "api";

export interface Incident {
  id: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  category: IncidentCategory;
  title: string;
  description: string;
  owner: string;
  ownerAvatar?: string;
  team: string;
  watchers: string[];
  escalationContact?: string;
  linkedTransactionId?: string;
  linkedWorkflowId?: string;
  linkedApprovalId?: string;
  linkedLedgerEntryId?: string;
  linkedPolicyId?: string;
  linkedRiskAssessmentId?: string;
  created: string;
  updated: string;
  slaResponseDeadline: string;
  slaResolutionDeadline: string;
  slaRespondedAt?: string;
  slaResolvedAt?: string;
  escalationLevel: number;
  businessImpact: string;
  rootCause?: string;
  resolutionSummary?: string;
  lessonsLearned?: string;
  rootCauseClassification?: string;
  priority: "P1" | "P2" | "P3" | "P4";
}

export interface IncidentEvent {
  id: string;
  incidentId: string;
  type:
    | "created"
    | "assigned"
    | "comment"
    | "escalated"
    | "sla_warning"
    | "workflow_updated"
    | "resolved"
    | "closed"
    | "reopened"
    | "transferred";
  actor: string;
  timestamp: string;
  description: string;
}

export interface IncidentLink {
  id: string;
  type: "transaction" | "approval" | "workflow" | "ledger" | "audit" | "policy" | "risk";
  label: string;
  href: string;
}

export interface IncidentMetrics {
  criticalCount: number;
  openCount: number;
  breachedSlaCount: number;
  resolvedCount: number;
  avgResolutionTime: string;
}
