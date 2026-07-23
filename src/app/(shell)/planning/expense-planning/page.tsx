import { fpaService } from "@/server/fpa"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"
import FPAExpensePlanning from "@/components/fpa/fpa-expense-planning"

export default function ExpensePlanningPage() {
  const expenses = fpaService.expensePlanning.getAll()

  return (
    <PageContainer>
      <EnterprisePageHeader title="Expense Planning" description="Expense budgeting and cost center planning" />
      <div className="mt-6">
        <FPAExpensePlanning expenses={expenses} />
      </div>
    </PageContainer>
  )
}
