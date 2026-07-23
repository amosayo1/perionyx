import { consService } from "@/server/consolidation"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"
import { ConsAlertsPanel } from "@/components/consolidation/cons-alerts-panel"

export default function AlertsPage() {
  const alerts = consService.alerts.getAll()

  return (
    <PageContainer>
      <EnterprisePageHeader title="Alerts" description="All consolidation alerts and notifications across entities and runs" />
      <ConsAlertsPanel alerts={alerts} />
    </PageContainer>
  )
}
