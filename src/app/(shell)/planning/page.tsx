import { fpaService } from "@/server/fpa"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"
import FPAExecutiveHeader from "@/components/fpa/fpa-executive-header"
import FPAKPIDashboard from "@/components/fpa/fpa-kpi-dashboard"
import { FPAAlertsPanel } from "@/components/fpa/fpa-alerts-panel"
import { FPARecommendationsPanel } from "@/components/fpa/fpa-recommendations-panel"

export default function PlanningPage() {
  const summary = fpaService.getExecutiveSummary()
  const metrics = fpaService.getAllKPIs()
  const alerts = fpaService.alerts.getAll()
  const unresolved = alerts.filter((a: { isResolved: boolean }) => !a.isResolved)
  const recommendations = fpaService.recommendations.getAll()
  const active = recommendations.filter((r: { status: string }) => r.status === "active")

  return (
    <PageContainer>
      <EnterprisePageHeader title="FP&A Planning" description="Enterprise financial planning and analysis" />
      <div className="mt-6 space-y-6">
        <FPAExecutiveHeader summary={summary} />
        <FPAKPIDashboard metrics={metrics} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <FPAAlertsPanel alerts={unresolved} />
          <FPARecommendationsPanel recommendations={active} />
        </div>
      </div>
    </PageContainer>
  )
}
