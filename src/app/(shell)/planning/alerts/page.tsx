import { fpaService } from "@/server/fpa"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"
import { FPAAlertsPanel } from "@/components/fpa/fpa-alerts-panel"

export default function AlertsPage() {
  const alerts = fpaService.alerts.getAll()

  return (
    <PageContainer>
      <EnterprisePageHeader title="Alerts" description="Planning alerts, notifications, and exceptions" />
      <div className="mt-6">
        <FPAAlertsPanel alerts={alerts} />
      </div>
    </PageContainer>
  )
}
