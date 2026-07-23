import { glService } from "../../../../server/gl";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { AnalyticsDashboard } from "../../../../components/gl/analytics-dashboard";

export default async function AnalyticsPage() {
  const kpis = glService.analytics.getKPIs();
  const alerts = glService.analytics.getAllAlerts();
  const recommendations = glService.analytics.getAllRecommendations();

  const criticalCount = kpis.filter((k) => k.status === "critical").length;
  const warningCount = kpis.filter((k) => k.status === "warning").length;
  const goodCount = kpis.filter((k) => k.status === "good").length;
  const onTarget = kpis.filter((k) => k.value >= k.target).length;

  return (
    <PageContainer>
      <EnterprisePageHeader
        title="GL Analytics"
        description="Key performance indicators and trend analysis"
      />
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
          <p className="text-xs text-zinc-500">Total KPIs</p>
          <p className="text-2xl font-bold text-white">{kpis.length}</p>
        </div>
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
          <p className="text-xs text-emerald-400/70">Good</p>
          <p className="text-2xl font-bold text-emerald-400">{goodCount}</p>
        </div>
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
          <p className="text-xs text-amber-400/70">Warning</p>
          <p className="text-2xl font-bold text-amber-400">{warningCount}</p>
        </div>
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-xs text-red-400/70">Critical</p>
          <p className="text-2xl font-bold text-red-400">{criticalCount}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AnalyticsDashboard kpis={kpis} />
        </div>
        <div className="space-y-4">
          <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
            <h3 className="mb-2 text-sm font-semibold text-zinc-300">On Target</h3>
            <p className="text-3xl font-bold text-[#d4af37]">{onTarget}/{kpis.length}</p>
            <p className="mt-1 text-xs text-zinc-500">{kpis.length > 0 ? Math.round((onTarget / kpis.length) * 100) : 0}% of KPIs meeting target</p>
          </div>
          <div className="rounded-lg border border-red-800/40 bg-red-950/20 p-4">
            <h3 className="mb-2 text-sm font-semibold text-red-300">Active Alerts</h3>
            <p className="text-3xl font-bold text-red-400">{alerts.filter((a) => !a.dismissed).length}</p>
            <p className="mt-1 text-xs text-zinc-500">{recommendations.filter((r) => !r.implemented).length} pending recommendations</p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
