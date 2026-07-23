import { consService } from "@/server/consolidation"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"
import ConsConsolidationWorkspace from "@/components/consolidation/cons-consolidation-workspace"

export default function ConsolidationRunPage() {
  const runs = consService.consolidationEngine.getAll()

  return (
    <PageContainer>
      <EnterprisePageHeader title="Consolidation Runs" description="Execute and monitor consolidation runs across periods" />
      <ConsConsolidationWorkspace runs={runs} />
    </PageContainer>
  )
}
