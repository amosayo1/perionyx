import { consService } from "@/server/consolidation"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"
import ConsOwnershipTree from "@/components/consolidation/cons-ownership-tree"

export default function OwnershipPage() {
  const ownerships = consService.ownership.getAll()
  const nodes = consService.groupStructure.getAll()

  return (
    <PageContainer>
      <EnterprisePageHeader title="Ownership" description="Ownership structures, percentages, and consolidation scope" />
      <ConsOwnershipTree ownerships={ownerships} nodes={nodes} />
    </PageContainer>
  )
}
