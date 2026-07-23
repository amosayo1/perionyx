import { riskService } from "@/server/risk";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { RiskHeader } from "@/components/risk-v2/risk-header";
import { KRIDashboard } from "@/components/risk-v2/kri-dashboard";
import { RiskControlsDashboard } from "@/components/risk-v2/risk-controls-dashboard";
import { AlertsPanel } from "@/components/risk-v2/alerts-panel";
import { HeatmapChart } from "@/components/risk-v2/heatmap-chart";
import type { RiskOverviewMetrics } from "@/components/risk-v2/risk-types";

export default function RiskOverviewPage() {
  const registers = riskService.riskRegister.getAll();
  const assessments = riskService.riskAssessment.getAll();
  const controls = riskService.riskControl.getAll();
  const incidents = riskService.riskIncident.getAll();
  const indicators = riskService.riskIndicator.getAll();
  const heatmaps = riskService.riskHeatmap.getAll();
  const alerts = riskService.riskAnalytics.getAllAlerts();

  const metrics: RiskOverviewMetrics = {
    totalRisks: registers.length,
    openRisks: riskService.riskRegister.getOpenRisks().length,
    criticalRisks: riskService.riskRegister.getCriticalRisks().length,
    highRisks: riskService.riskRegister.getByLevel("high").length,
    totalControls: controls.length,
    ineffectiveControls: riskService.riskControl.getIneffective().length,
    totalIncidents: incidents.length,
    openIncidents: riskService.riskIncident.getOpen().length,
    totalAssessments: assessments.length,
    totalScenarios: riskService.riskScenario.count(),
    kriBreaches: riskService.riskIndicator.getBreaches().length,
  };

  return (
    <PageContainer>
      <EnterprisePageHeader title="Risk Overview" description="Enterprise-wide risk snapshot and key metrics" />
      <div className="mt-6 space-y-6">
        <RiskHeader metrics={metrics} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h3 className="mb-3 text-sm font-medium text-zinc-400">Risk Heatmap</h3>
            <HeatmapChart heatmaps={heatmaps} />
          </div>
          <div>
            <h3 className="mb-3 text-sm font-medium text-zinc-400">Key Risk Indicators</h3>
            <KRIDashboard indicators={indicators} max={5} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <h3 className="mb-3 text-sm font-medium text-zinc-400">Controls Summary</h3>
            <RiskControlsDashboard controls={controls} />
          </div>
          <div>
            <h3 className="mb-3 text-sm font-medium text-zinc-400">Active Alerts</h3>
            <AlertsPanel alerts={alerts} max={8} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
