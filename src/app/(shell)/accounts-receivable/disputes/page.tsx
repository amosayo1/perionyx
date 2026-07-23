import { arService } from "../../../../server/accounts-receivable"
import { PageContainer } from "../../../../components/enterprise/page-container"
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header"
import { ARDisputeCenter } from "../../../../components/accounts-receivable/ar-dispute-center"

export default function ARDisputesPage() {
  const disputes = arService.disputes.getAll()
  return (
    <PageContainer>
      <EnterprisePageHeader title="Disputes" description="Invoice dispute management and resolution" />
      <ARDisputeCenter disputes={disputes} />
    </PageContainer>
  )
}
