import { riskService } from "@/server/risk";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { KPIChart } from "@/components/risk-v2/kpi-chart";
import { HeatmapChart } from "@/components/risk-v2/heatmap-chart";
import { ScenarioDashboard } from "@/components/risk-v2/scenario-dashboard";

export default function RiskAnalyticsPage() {
  const kpis = riskService.riskAnalytics.getAllKPIs();
  const heatmaps = riskService.riskHeatmap.getAll();
  const scenarios = riskService.riskScenario.getAll();
  const aggregateMetrics = riskService.getAggregateMetrics();

  return (
    <PageContainer>
      <EnterprisePageHeader title="Risk Analytics" description="KPIs, heatmaps, scenarios, and aggregate metrics" />
      <div className="mt-6 space-y-6">
        <div className="grid grid-cols-4 gap-3">
          <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500">Total Risks</p>
            <p className="text-2xl font-bold text-white">{aggregateMetrics.totalRisks}</p>
          </div>
          <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500">Open</p>
            <p className="text-2xl font-bold text-amber-400">{aggregateMetrics.openRisks}</p>
          </div>
          <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500">Critical</p>
            <p className="text-2xl font-bold text-red-400">{aggregateMetrics.criticalRisks}</p>
          </div>
          <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500">KRI Breaches</p>
            <p className="text-2xl font-bold text-red-400">{aggregateMetrics.kriBreaches}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h3 className="mb-3 text-sm font-medium text-zinc-400">Risk Heatmap</h3>
            <HeatmapChart heatmaps={heatmaps} />
          </div>
          <div>
            <h3 className="mb-3 text-sm font-medium text-zinc-400">Key Performance Indicators</h3>
            <KPIChart kpis={kpis} />
          </div>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-medium text-zinc-400">Scenario Analysis</h3>
          <ScenarioDashboard scenarios={scenarios} />
        </div>
      </div>
    </PageContainer>
  );
}
