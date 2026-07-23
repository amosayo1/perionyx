import { executiveAIService } from "../../../../server/executive-ai";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { ModelHealthDashboard } from "../../../../components/executive-ai/model-health-dashboard";
import { AIAlertsPanel } from "../../../../components/executive-ai/alerts-panel";
import { CrossDomainInsights } from "../../../../components/executive-ai/cross-domain-insights";
import { IntelligenceDashboard } from "../../../../components/executive-ai/intelligence-dashboard";

export default async function AnalyticsPage() {
  const models = executiveAIService.modelMetrics.getAll();
  const alerts = executiveAIService.analytics.getAllAlerts();
  const crossDomain = executiveAIService.reasoning.getAllCrossDomainInsights();
  const insights = executiveAIService.intelligence.getAll();
  const kpis = executiveAIService.analytics.getAllKPIs();

  return (
    <PageContainer>
      <EnterprisePageHeader title="AI Analytics" description="Model metrics, KPIs, and system monitoring" />

      <div className="grid grid-cols-4 gap-3">
        {kpis.map(kpi => (
          <div key={kpi.name} className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500">{kpi.name}</p>
            <div className="mt-1 flex items-baseline gap-2">
              <p className="text-2xl font-bold text-white">{kpi.value.toLocaleString()}</p>
              <span className="text-xs text-zinc-500">{kpi.unit}</span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className={kpi.status === "good" ? "text-xs text-emerald-400" : kpi.status === "warning" ? "text-xs text-amber-400" : "text-xs text-red-400"}>
                {kpi.status}
              </span>
              <span className="text-xs text-zinc-600">target: {kpi.target}</span>
            </div>
          </div>
        ))}
      </div>

      <ModelHealthDashboard models={models} />

      <div className="grid grid-cols-2 gap-4">
        <CrossDomainInsights insights={crossDomain} />
        <AIAlertsPanel alerts={alerts} />
      </div>

      <IntelligenceDashboard insights={insights.slice(0, 5)} />
    </PageContainer>
  );
}
