import { complianceService } from "@/server/compliance";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { ComplianceHeader } from "@/components/compliance/compliance-header";
import { ComplianceDashboard } from "@/components/compliance/compliance-dashboard";
import { AlertsPanel } from "@/components/compliance/alerts-panel";
import { ExecutiveInsights } from "@/components/compliance/executive-insights";
import type { ComplianceOverviewMetrics } from "@/components/compliance/compliance-types";

export default async function CompliancePage() {
  const metrics = complianceService.getAggregateMetrics();
  const frameworks = complianceService.frameworks.getAll();
  const obligations = complianceService.obligations.getAll();
  const controls = complianceService.controls.getAll();
  const audits = complianceService.audits.getAll();
  const alerts = complianceService.analytics.getAllAlerts();
  const recommendations = complianceService.analytics.getAllRecommendations();
  const kpis = complianceService.analytics.getAllKPIs();

  const overviewMetrics: ComplianceOverviewMetrics = metrics;
  const complianceRate = metrics.totalObligations > 0 ? Math.round((metrics.compliantObligations / metrics.totalObligations) * 100) : 0;
  const controlPassRate = metrics.totalControls > 0 ? Math.round(((metrics.totalControls - metrics.failedControls) / metrics.totalControls) * 100) : 0;
  const criticalAlerts = alerts.filter(a => a.severity === "critical" && !a.dismissed);
  const topRecommendations = recommendations.filter(r => !r.implemented).slice(0, 5);
  const topKPIs = kpis.slice(0, 4);

  return (
    <PageContainer>
      <EnterprisePageHeader title="Compliance" description="Enterprise compliance management and oversight" />
      <ComplianceHeader metrics={overviewMetrics} />
      <ExecutiveInsights
        complianceRate={complianceRate}
        controlPassRate={controlPassRate}
        openRemediations={metrics.openRemediations}
        overdueTrainings={metrics.overdueTrainings}
        topRecommendations={topRecommendations}
        criticalAlerts={criticalAlerts}
        topKPIs={topKPIs}
      />
      <ComplianceDashboard metrics={overviewMetrics} />
      <AlertsPanel alerts={alerts} />
    </PageContainer>
  );
}
