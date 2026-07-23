import { arService } from "../../../../server/accounts-receivable"
import { PageContainer } from "../../../../components/enterprise/page-container"
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header"
import { ARAlertsPanel } from "../../../../components/accounts-receivable/ar-alerts-panel"

export default function ARAlertsPage() {
  const alerts = arService.alerts.getAll()
  return (
    <PageContainer>
      <EnterprisePageHeader title="Alerts" description="System alerts and notifications" />
      <ARAlertsPanel alerts={alerts} />
    </PageContainer>
  )
}
