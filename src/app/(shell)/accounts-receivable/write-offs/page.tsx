import { arService } from "../../../../server/accounts-receivable"
import { PageContainer } from "../../../../components/enterprise/page-container"
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header"
import { ARWriteOffCenter } from "../../../../components/accounts-receivable/ar-write-off-center"

export default function ARWriteOffsPage() {
  const writeOffs = arService.writeOffs.getAll()
  return (
    <PageContainer>
      <EnterprisePageHeader title="Write-offs" description="Bad debt write-off management" />
      <ARWriteOffCenter writeOffs={writeOffs} />
    </PageContainer>
  )
}
