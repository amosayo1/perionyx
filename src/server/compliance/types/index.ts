export type RegulatoryFrameworkCode = "sox" | "gdpr" | "pci-dss" | "iso-27001" | "hipaa" | "ccpa" | "fincen" | "mi fid" | "basel-iii" | "ifrs" | "gaap" | "esg" | "custom";
export type ObligationType = "statutory" | "regulatory" | "contractual" | "internal" | "fiduciary";
export type ObligationFrequency = "one-time" | "daily" | "weekly" | "monthly" | "quarterly" | "semi-annual" | "annual" | "ad-hoc";
export type ComplianceStatus = "compliant" | "non-compliant" | "partially-compliant" | "not-assessed" | "under-review" | "remediated";
export type ControlTestResult = "pass" | "fail" | "warning" | "not-tested";
export type RemediationPriority = "critical" | "high" | "medium" | "low";
export type PolicyStatus = "draft" | "approved" | "active" | "archived";

export interface RegulatoryFramework {
  id: string; code: RegulatoryFrameworkCode; name: string; description: string;
  jurisdiction: string; effectiveFrom: Date; effectiveTo?: Date; version: string;
  isActive: boolean; companyId: string; createdAt: Date; updatedAt: Date;
}

export interface Obligation {
  id: string; frameworkId: string; code: string; name: string; description: string;
  type: ObligationType; frequency: ObligationFrequency; owner: string; department: string;
  dueDate?: Date; status: ComplianceStatus; evidence?: string; notes?: string;
  companyId: string; createdAt: Date; updatedAt: Date;
}

export interface CompliancePolicy {
  id: string; code: string; name: string; description: string; category: string;
  status: PolicyStatus; version: string; owner: string; approvedBy?: string;
  approvedDate?: Date; effectiveDate: Date; reviewDate?: Date; content?: string;
  companyId: string; createdAt: Date; updatedAt: Date;
}

export interface Control {
  id: string; policyId: string; name: string; description: string;
  type: "preventive" | "detective" | "corrective" | "compensating";
  owner: string; frequency: string; automation?: string; lastResult?: ControlTestResult;
  companyId: string; createdAt: Date; updatedAt: Date;
}

export interface ControlTest {
  id: string; controlId: string; tester: string; testDate: Date;
  result: ControlTestResult; evidence?: string; findings?: string; remediation?: string;
  companyId: string; createdAt: Date; updatedAt: Date;
}

export interface ComplianceAudit {
  id: string; title: string; type: "internal" | "external" | "regulatory" | "third-party";
  frameworkId?: string; scope: string; auditor: string; auditDate: Date;
  status: "planned" | "in-progress" | "completed" | "remediated";
  findings: string; rating: string; companyId: string; createdAt: Date; updatedAt: Date;
}

export interface Remediation {
  id: string; auditId?: string; testId?: string; issue: string;
  priority: RemediationPriority; owner: string; targetDate: Date;
  status: "open" | "in-progress" | "resolved" | "verified";
  resolution?: string; resolvedDate?: Date; verifiedBy?: string;
  companyId: string; createdAt: Date; updatedAt: Date;
}

export interface ComplianceReport {
  id: string; title: string; period: string; generatedAt: Date;
  type: "summary" | "detailed" | "regulatory"; sections: Record<string, unknown>;
  companyId: string; createdAt: Date; updatedAt: Date;
}

export interface Training {
  id: string; title: string; description: string; frameworkId?: string;
  requiredFor: string; dueDate: Date; status: "required" | "completed" | "overdue";
  completedAt?: Date; companyId: string; createdAt: Date; updatedAt: Date;
}

export interface ComplianceKPI {
  name: string; value: number; previousValue: number; target: number;
  unit: string; category: string; trend: "up" | "down" | "stable";
  status: "good" | "warning" | "critical";
}

export interface ComplianceAlert {
  id: string; severity: "critical" | "warning" | "info"; type: string;
  title: string; message: string; actionRequired: boolean; dismissed: boolean;
  companyId: string; createdAt: Date;
}

export interface ComplianceRecommendation {
  id: string; type: string; title: string; description: string;
  impact: string; confidence: number; companyId: string; implemented: boolean; createdAt: Date;
}

export interface ComplianceAggregateMetrics {
  totalFrameworks: number;
  totalObligations: number;
  compliantObligations: number;
  nonCompliantObligations: number;
  totalPolicies: number;
  activePolicies: number;
  totalControls: number;
  failedControls: number;
  totalAudits: number;
  openAudits: number;
  openRemediations: number;
  criticalRemediations: number;
  totalTrainings: number;
  overdueTrainings: number;
}
