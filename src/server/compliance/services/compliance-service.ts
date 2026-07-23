import { FrameworkService } from "../domain/frameworks/framework-service";
import { ObligationService } from "../domain/obligations/obligation-service";
import { PolicyService } from "../domain/policies/policy-service";
import { ControlService, ControlTestService } from "../domain/controls/control-service";
import { AuditService } from "../domain/audits/audit-service";
import { RemediationService } from "../domain/remediation/remediation-service";
import { ComplianceReportService } from "../domain/reporting/reporting-service";
import { TrainingService } from "../domain/training/training-service";
import { ComplianceAnalyticsService } from "../domain/analytics/analytics-service";
import type { ComplianceAggregateMetrics } from "../types";

export class ComplianceService {
  frameworks: FrameworkService;
  obligations: ObligationService;
  policies: PolicyService;
  controls: ControlService;
  controlTests: ControlTestService;
  audits: AuditService;
  remediations: RemediationService;
  reports: ComplianceReportService;
  trainings: TrainingService;
  analytics: ComplianceAnalyticsService;

  constructor() {
    this.frameworks = new FrameworkService();
    this.obligations = new ObligationService();
    this.policies = new PolicyService();
    this.controls = new ControlService();
    this.controlTests = new ControlTestService();
    this.audits = new AuditService();
    this.remediations = new RemediationService();
    this.reports = new ComplianceReportService();
    this.trainings = new TrainingService();
    this.analytics = new ComplianceAnalyticsService();
  }

  getAggregateMetrics(): ComplianceAggregateMetrics {
    const allObligations = this.obligations.getAll();
    const allPolicies = this.policies.getAll();
    const allControls = this.controls.getAll();
    const allAudits = this.audits.getAll();
    const allRemediations = this.remediations.getAll();
    const allTrainings = this.trainings.getAll();

    return {
      totalFrameworks: this.frameworks.count(),
      totalObligations: allObligations.length,
      compliantObligations: this.obligations.getCompliant().length,
      nonCompliantObligations: this.obligations.getNonCompliant().length,
      totalPolicies: allPolicies.length,
      activePolicies: this.policies.getActive().length,
      totalControls: allControls.length,
      failedControls: this.controls.getFailed().length,
      totalAudits: allAudits.length,
      openAudits: this.audits.getOpen().length,
      openRemediations: this.remediations.getOpen().length,
      criticalRemediations: this.remediations.getCritical().length,
      totalTrainings: allTrainings.length,
      overdueTrainings: this.trainings.getOverdue().length,
    };
  }
}

export const complianceService = new ComplianceService();
