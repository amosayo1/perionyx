import { fpaService } from "@/server/fpa"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"
import FPADriverPlanning from "@/components/fpa/fpa-driver-planning"

export default function DriverPlanningPage() {
  const drivers = fpaService.driverBasedPlanning.getAllDrivers()

  return (
    <PageContainer>
      <EnterprisePageHeader title="Driver Planning" description="Driver-based planning and impact analysis" />
      <div className="mt-6">
        <FPADriverPlanning drivers={drivers} />
      </div>
    </PageContainer>
  )
}
