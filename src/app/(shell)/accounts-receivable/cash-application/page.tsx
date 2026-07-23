import { arService } from "../../../../server/accounts-receivable"
import { PageContainer } from "../../../../components/enterprise/page-container"
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header"
import { ARCashApplicationCenter } from "../../../../components/accounts-receivable/ar-cash-application-center"

export default function ARCashApplicationPage() {
  const applications = arService.cashApplication.getAll()
  const receipts = arService.receipts.getAll()
  const invoices = arService.invoices.getAll()
  return (
    <PageContainer>
      <EnterprisePageHeader title="Cash Application" description="Receipt matching and allocation" />
      <ARCashApplicationCenter applications={applications} receipts={receipts} invoices={invoices} />
    </PageContainer>
  )
}
