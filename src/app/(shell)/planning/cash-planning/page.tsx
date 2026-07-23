import { fpaService } from "@/server/fpa"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"
import FPACashPlanning from "@/components/fpa/fpa-cash-planning"

export default function CashPlanningPage() {
  const cashPlans = fpaService.cashPlanning.getAll()

  return (
    <PageContainer>
      <EnterprisePageHeader title="Cash Planning" description="Cash flow forecasting and liquidity planning" />
      <div className="mt-6">
        <FPACashPlanning plans={cashPlans} />
      </div>
    </PageContainer>
  )
}
