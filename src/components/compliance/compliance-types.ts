import type {
  RegulatoryFramework as ServerRegulatoryFramework,
  Obligation as ServerObligation,
  CompliancePolicy as ServerCompliancePolicy,
  Control as ServerControl,
  ControlTest as ServerControlTest,
  ComplianceAudit as ServerComplianceAudit,
  Remediation as ServerRemediation,
  ComplianceReport as ServerComplianceReport,
  Training as ServerTraining,
  ComplianceKPI as ServerComplianceKPI,
  ComplianceAlert as ServerComplianceAlert,
  ComplianceRecommendation as ServerComplianceRecommendation,
} from "../../server/compliance/types";

export type RegulatoryFramework = ServerRegulatoryFramework;
export type Obligation = ServerObligation;
export type CompliancePolicy = ServerCompliancePolicy;
export type Control = ServerControl;
export type ControlTest = ServerControlTest;
export type ComplianceAudit = ServerComplianceAudit;
export type Remediation = ServerRemediation;
export type ComplianceReport = ServerComplianceReport;
export type Training = ServerTraining;
export type ComplianceKPI = ServerComplianceKPI;
export type ComplianceAlert = ServerComplianceAlert;
export type ComplianceRecommendation = ServerComplianceRecommendation;

export interface ComplianceOverviewMetrics {
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
