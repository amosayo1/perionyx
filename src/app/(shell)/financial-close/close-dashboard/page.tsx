import { fcService } from "@/server/financial-close"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"
import FCCloseDashboard from "@/components/financial-close/fc-close-dashboard"
import FCPeriodStatusCards from "@/components/financial-close/fc-period-status-cards"
import FCKPIDashboard from "@/components/financial-close/fc-kpi-dashboard"
import { FCCloseTimeline } from "@/components/financial-close/fc-close-timeline"

export default function FCCloseDashboardPage() {
  const periods = fcService.closeManagement.getAll()
  const activePeriod = periods.find((p) => p.status === "inProgress" || p.status === "review")!
  const tasks = fcService.taskEngine.getByPeriod(activePeriod.id)
  const progress = fcService.closeDashboard.calculateProgress(activePeriod, tasks)
  const metrics = fcService.analytics.getAllMetrics()
  const entries = fcService.closeCalendar.getAll()

  return (
    <PageContainer>
      <EnterprisePageHeader title="Close Dashboard" description="Period progress, status, and timeline" />
      <FCCloseDashboard progress={progress} periods={periods} metrics={metrics} />
      <FCPeriodStatusCards periods={periods} />
      <FCKPIDashboard metrics={metrics} />
      <FCCloseTimeline entries={entries} />
    </PageContainer>
  )
}
