import { arService } from "../../../../server/accounts-receivable"
import { PageContainer } from "../../../../components/enterprise/page-container"
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header"
import { ARCollectionsQueue } from "../../../../components/accounts-receivable/ar-collections-queue"

export default function ARCollectionsPage() {
  const collections = arService.collections.getAll()
  return (
    <PageContainer>
      <EnterprisePageHeader title="Collections" description="Collection queue and collector workspace" />
      <ARCollectionsQueue collections={collections} />
    </PageContainer>
  )
}
