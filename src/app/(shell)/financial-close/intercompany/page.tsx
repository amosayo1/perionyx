import { fcService } from "@/server/financial-close"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"
import { FCIntercompanyGrid } from "@/components/financial-close/fc-intercompany-grid"

export default function FCIntercompanyPage() {
  const icRecs = fcService.intercompanyReconciliation.getAll()

  return (
    <PageContainer>
      <EnterprisePageHeader title="Intercompany Reconciliation" description="Cross-entity reconciliation and matching" />
      <FCIntercompanyGrid icRecs={icRecs} />
    </PageContainer>
  )
}
