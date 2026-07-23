import { fpaService } from "@/server/fpa"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"
import FPACapitalPlanning from "@/components/fpa/fpa-capital-planning"

export default function CapitalPlanningPage() {
  const capitals = fpaService.capitalPlanning.getAll()

  return (
    <PageContainer>
      <EnterprisePageHeader title="Capital Planning" description="Capital expenditure planning and ROI tracking" />
      <div className="mt-6">
        <FPACapitalPlanning capitals={capitals} />
      </div>
    </PageContainer>
  )
}
