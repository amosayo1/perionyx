import { consService } from "@/server/consolidation"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"
import ConsAdjustmentWorkspace from "@/components/consolidation/cons-adjustment-workspace"

export default function AdjustmentsPage() {
  const adjustments = consService.consolidationAdjustments.getAll()

  return (
    <PageContainer>
      <EnterprisePageHeader title="Consolidation Adjustments" description="Fair value, goodwill, PPA, and other consolidation adjustments" />
      <ConsAdjustmentWorkspace adjustments={adjustments} />
    </PageContainer>
  )
}
