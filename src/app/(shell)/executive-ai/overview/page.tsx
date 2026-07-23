import { executiveAIService } from "../../../../server/executive-ai";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { AIHeader } from "../../../../components/executive-ai/ai-header";
import { HealthScoreChart } from "../../../../components/executive-ai/health-score-chart";
import { CrossDomainInsights } from "../../../../components/executive-ai/cross-domain-insights";
import { ModelHealthDashboard } from "../../../../components/executive-ai/model-health-dashboard";
import type { AIOverviewMetrics } from "../../../../components/executive-ai/ai-types";

export default async function ExecutiveAIOverviewPage() {
  const insights = executiveAIService.intelligence.getAll();
  const anomalies = executiveAIService.anomalies.getAll();
  const recommendations = executiveAIService.recommendations.getAll();
  const forecasts = executiveAIService.forecasts.getAll();
  const crossDomain = executiveAIService.reasoning.getAllCrossDomainInsights();
  const alerts = executiveAIService.analytics.getAllAlerts();
  const models = executiveAIService.modelMetrics.getAll();
  const kpis = executiveAIService.analytics.getAllKPIs();
  const metrics = executiveAIService.getAggregateMetrics();
  const summaries = executiveAIService.analytics.getAllSummaries();

  const overviewMetrics: AIOverviewMetrics = {
    totalInsights: metrics.totalInsights,
    activeInsights: metrics.activeInsights,
    criticalAnomalies: metrics.criticalAnomalies,
    totalRecommendations: metrics.totalRecommendations,
    implementedRecommendations: recommendations.filter(r => r.status === "implemented").length,
    pendingRecommendations: metrics.pendingRecommendations,
    totalForecasts: metrics.totalForecasts,
    modelCount: metrics.modelCount,
    activeModels: metrics.activeModels,
    avgConfidence: metrics.avgConfidence,
    healthScore: metrics.healthScore,
    totalAlerts: alerts.length,
    activeAlerts: alerts.filter(a => !a.dismissed).length,
    recentInsights: insights.filter(i => i.detectedAt > new Date(Date.now() - 7 * 86400000)).length,
    crossDomainInsights: crossDomain.length,
  };

  const latestSummary = summaries[summaries.length - 1];

  return (
    <PageContainer>
      <EnterprisePageHeader title="AI Overview" description="Complete health score and system status" />

      <AIHeader metrics={overviewMetrics} />

      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-1 flex flex-col items-center justify-center rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-8">
          <HealthScoreChart score={metrics.healthScore} size={200} label="System Health" />
          {latestSummary && (
            <p className="mt-3 text-center text-xs text-zinc-500">{latestSummary.overallHealth === "good" ? "All systems operating normally" : latestSummary.overallHealth === "warning" ? "Some metrics require attention" : "Critical issues need immediate action"}</p>
          )}
        </div>
        <div className="col-span-3 space-y-4">
          <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
            <h3 className="mb-3 text-xs font-semibold text-zinc-400">AI KPIs</h3>
            <div className="grid grid-cols-2 gap-3">
              {kpis.map(kpi => (
                <div key={kpi.name} className="flex items-center justify-between rounded-lg border border-zinc-800/40 bg-zinc-900/30 px-3 py-2">
                  <div>
                    <p className="text-xs text-zinc-500">{kpi.name}</p>
                    <p className="text-sm font-medium text-white">{kpi.value.toLocaleString()} {kpi.unit}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-zinc-500">Target: {kpi.target}</p>
                    <p className={kpi.trend === "up" ? "text-[11px] text-emerald-400" : kpi.trend === "down" ? "text-[11px] text-red-400" : "text-[11px] text-zinc-500"}>
                      {kpi.trend === "up" ? "↑" : kpi.trend === "down" ? "↓" : "→"} {kpi.previousValue}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <CrossDomainInsights insights={crossDomain} />
        </div>
      </div>

      <ModelHealthDashboard models={models} />
    </PageContainer>
  );
}
