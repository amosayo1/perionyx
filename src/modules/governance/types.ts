export type GovernanceSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type ViolationStatus = "OPEN" | "ACKNOWLEDGED" | "INVESTIGATING" | "RESOLVED" | "DISMISSED";
export type SourceModule = "policy_engine" | "approval_rule" | "risk" | "compliance";
export type ExceptionStatus = "ACTIVE" | "EXPIRED" | "REVOKED";
export type FrameworkCategory = "regulatory" | "internal" | "compliance";
export type FrameworkStatus = "ACTIVE" | "DRAFT" | "ARCHIVED";
export type PolicyMappingType = "MANDATORY" | "OPTIONAL" | "RECOMMENDED";

export interface GovernanceHealthScore {
  overall: number;
  categories: {
    policyCompliance: number;
    violationTrend: number;
    exceptionHealth: number;
    auditHealth: number;
    approvalHealth: number;
  };
  level: "healthy" | "attention" | "critical";
}

export interface ViolationSummary {
  total: number;
  open: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  bySource: Record<string, number>;
  trend: { date: string; count: number }[];
}

export interface GovernanceMetrics {
  healthScore: GovernanceHealthScore;
  violations: ViolationSummary;
  activePolicies: number;
  activeFrameworks: number;
  activeExceptions: number;
  evaluationsToday: number;
}

export interface PolicyRegistryEntry {
  id: string;
  name: string;
  type: string;
  source: "builtin" | "organization";
  enabled: boolean;
  priority: number;
  framework?: string;
}
