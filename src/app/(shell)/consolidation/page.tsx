import { consService } from "@/server/consolidation"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"
import ConsExecutiveHeader from "@/components/consolidation/cons-executive-header"
import ConsKPIDashboard from "@/components/consolidation/cons-kpi-dashboard"
import { ConsAlertsPanel } from "@/components/consolidation/cons-alerts-panel"
import { ConsRecommendationsPanel } from "@/components/consolidation/cons-recommendations-panel"

export default function ConsolidationPage() {
  const summary = consService.getExecutiveSummary()
  const metrics = consService.analytics.getAllMetrics()
  const alerts = consService.alerts.getUnresolved()
  const recommendations = consService.recommendations.getActive()

  return (
    <PageContainer>
      <EnterprisePageHeader title="Consolidation" description="Monitor and manage the group consolidation process" />
      <ConsExecutiveHeader summary={summary} />
      <ConsKPIDashboard metrics={metrics} />
      <ConsAlertsPanel alerts={alerts} />
      <ConsRecommendationsPanel recommendations={recommendations} />
    </PageContainer>
  )
}
