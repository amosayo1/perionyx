import { arService } from "../../../../server/accounts-receivable"
import { PageContainer } from "../../../../components/enterprise/page-container"
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header"
import { ARCreditDashboard } from "../../../../components/accounts-receivable/ar-credit-dashboard"

export default function ARCreditPage() {
  const creditLimits = arService.credit.getAll()
  return (
    <PageContainer>
      <EnterprisePageHeader title="Credit Management" description="Credit limits, risk monitoring, and reviews" />
      <ARCreditDashboard creditLimits={creditLimits} />
    </PageContainer>
  )
}
