import { executiveAIService } from "../../../server/executive-ai";
import { PageContainer } from "../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../components/enterprise/enterprise-page-header";
import { AIHeader } from "../../../components/executive-ai/ai-header";
import { ExecutiveSummaryComponent } from "../../../components/executive-ai/executive-summary";
import { IntelligenceDashboard } from "../../../components/executive-ai/intelligence-dashboard";
import { AnomalyDashboard } from "../../../components/executive-ai/anomaly-dashboard";
import { ExecutiveInsights } from "../../../components/executive-ai/executive-insights";
import { CrossDomainInsights } from "../../../components/executive-ai/cross-domain-insights";
import { AIAlertsPanel } from "../../../components/executive-ai/alerts-panel";
import type { AIOverviewMetrics } from "../../../components/executive-ai/ai-types";

export default async function ExecutiveAIPage() {
  const insights = executiveAIService.intelligence.getAll();
  const anomalies = executiveAIService.anomalies.getAll();
  const recommendations = executiveAIService.recommendations.getAll();
  const forecasts = executiveAIService.forecasts.getAll();
  const crossDomain = executiveAIService.reasoning.getAllCrossDomainInsights();
  const alerts = executiveAIService.analytics.getAllAlerts();
  const models = executiveAIService.modelMetrics.getAll();
  const summaries = executiveAIService.analytics.getAllSummaries();
  const metrics = executiveAIService.getAggregateMetrics();

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

  const latestSummary = summaries.length > 0 ? summaries[summaries.length - 1] : undefined;

  return (
    <PageContainer>
      <EnterprisePageHeader title="Executive AI" description="AI-powered intelligence, anomaly detection, forecasting, and recommendations" />
      <AIHeader metrics={overviewMetrics} />
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-4">
          {latestSummary && <ExecutiveSummaryComponent summary={latestSummary} />}
          <IntelligenceDashboard insights={insights.slice(0, 6)} />
          <AnomalyDashboard anomalies={anomalies.slice(0, 3)} />
        </div>
        <div className="space-y-4">
          <ExecutiveInsights recommendations={recommendations} />
          <AIAlertsPanel alerts={alerts} />
          <CrossDomainInsights insights={crossDomain} />
        </div>
      </div>
    </PageContainer>
  );
}
