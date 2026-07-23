import { arService } from "../../../../server/accounts-receivable"
import { PageContainer } from "../../../../components/enterprise/page-container"
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header"
import { ARInvoiceBoard } from "../../../../components/accounts-receivable/ar-invoice-board"

export default function ARInvoicesPage() {
  const invoices = arService.invoices.getAll()
  return (
    <PageContainer>
      <EnterprisePageHeader title="Invoices" description="Invoice management and tracking" />
      <ARInvoiceBoard invoices={invoices} />
    </PageContainer>
  )
}
