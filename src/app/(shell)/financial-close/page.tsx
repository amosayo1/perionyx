import { fcService } from "@/server/financial-close"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"
import FCExecutiveHeader from "@/components/financial-close/fc-executive-header"
import FCCloseDashboard from "@/components/financial-close/fc-close-dashboard"
import FCKPIDashboard from "@/components/financial-close/fc-kpi-dashboard"
import { FCAlertsPanel } from "@/components/financial-close/fc-alerts-panel"
import { FCRecommendationsPanel } from "@/components/financial-close/fc-recommendations-panel"

export default function FinancialClosePage() {
  const summary = fcService.getExecutiveSummary()
  const periods = fcService.closeManagement.getAll()
  const activePeriod = periods.find((p) => p.status === "inProgress" || p.status === "review")!
  const tasks = fcService.taskEngine.getByPeriod(activePeriod.id)
  const progress = fcService.closeDashboard.calculateProgress(activePeriod, tasks)
  const metrics = fcService.analytics.getAllMetrics()
  const alerts = fcService.alerts.getUnresolved()
  const recommendations = fcService.recommendations.getActive()

  return (
    <PageContainer>
      <EnterprisePageHeader title="Financial Close" description="Monitor and manage the financial close process" />
      <FCExecutiveHeader summary={summary} />
      <FCCloseDashboard progress={progress} periods={periods} metrics={metrics} />
      <FCKPIDashboard metrics={metrics} />
      <FCAlertsPanel alerts={alerts} />
      <FCRecommendationsPanel recommendations={recommendations} />
    </PageContainer>
  )
}
