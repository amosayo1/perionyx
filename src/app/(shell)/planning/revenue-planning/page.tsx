import { fpaService } from "@/server/fpa"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"
import FPARevenuePlanning from "@/components/fpa/fpa-revenue-planning"

export default function RevenuePlanningPage() {
  const revenues = fpaService.revenuePlanning.getAll()

  return (
    <PageContainer>
      <EnterprisePageHeader title="Revenue Planning" description="Revenue forecasting and product-line planning" />
      <div className="mt-6">
        <FPARevenuePlanning revenues={revenues} />
      </div>
    </PageContainer>
  )
}
