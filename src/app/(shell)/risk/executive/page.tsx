import { riskService } from "@/server/risk";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { RiskHeader } from "@/components/risk-v2/risk-header";
import { KPIChart } from "@/components/risk-v2/kpi-chart";
import { HeatmapChart } from "@/components/risk-v2/heatmap-chart";
import { ExecutiveInsights } from "@/components/risk-v2/executive-insights";
import { ScenarioDashboard } from "@/components/risk-v2/scenario-dashboard";
import type { RiskOverviewMetrics } from "@/components/risk-v2/risk-types";

export default function ExecutiveRiskPage() {
  const registers = riskService.riskRegister.getAll();
  const assessments = riskService.riskAssessment.getAll();
  const controls = riskService.riskControl.getAll();
  const incidents = riskService.riskIncident.getAll();
  const indicators = riskService.riskIndicator.getAll();
  const heatmaps = riskService.riskHeatmap.getAll();
  const kpis = riskService.riskAnalytics.getAllKPIs();
  const recommendations = riskService.riskAnalytics.getAllRecommendations();
  const scenarios = riskService.riskScenario.getAll();

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
    totalScenarios: scenarios.length,
    kriBreaches: riskService.riskIndicator.getBreaches().length,
  };

  return (
    <PageContainer>
      <EnterprisePageHeader title="Executive Risk Summary" description="Board-level enterprise risk intelligence and analytics" />
      <div className="mt-6 space-y-6">
        <RiskHeader metrics={metrics} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h3 className="mb-3 text-sm font-medium text-zinc-400">Risk Heatmap</h3>
            <HeatmapChart heatmaps={heatmaps} />
          </div>
          <div>
            <h3 className="mb-3 text-sm font-medium text-zinc-400">Executive Recommendations</h3>
            <ExecutiveInsights recommendations={recommendations} max={6} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div>
            <h3 className="mb-3 text-sm font-medium text-zinc-400">Performance Indicators</h3>
            <KPIChart kpis={kpis} />
          </div>
          <div className="lg:col-span-2">
            <h3 className="mb-3 text-sm font-medium text-zinc-400">Scenario Analysis</h3>
            <ScenarioDashboard scenarios={scenarios} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
