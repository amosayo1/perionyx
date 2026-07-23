import { fcService } from "@/server/financial-close"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"
import { FCAlertsPanel } from "@/components/financial-close/fc-alerts-panel"

export default function FCAlertsPage() {
  const alerts = fcService.alerts.getAll()

  return (
    <PageContainer>
      <EnterprisePageHeader title="Alerts" description="All close process alerts and notifications" />
      <FCAlertsPanel alerts={alerts} />
    </PageContainer>
  )
}
