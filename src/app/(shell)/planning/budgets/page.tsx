import { fpaService } from "@/server/fpa"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"
import FPABudgetBoard from "@/components/fpa/fpa-budget-board"

export default function BudgetsPage() {
  const plans = fpaService.budgeting.getAllPlans()

  return (
    <PageContainer>
      <EnterprisePageHeader title="Budgets" description="Enterprise budget management and planning" />
      <div className="mt-6">
        <FPABudgetBoard plans={plans} />
      </div>
    </PageContainer>
  )
}
