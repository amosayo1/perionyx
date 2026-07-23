import { fcService } from "@/server/financial-close"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"
import FCReconciliationWorkspace from "@/components/financial-close/fc-reconciliation-workspace"

export default function FCAccountReconciliationPage() {
  const reconciliations = fcService.reconciliation.getAll()
  const accountReconciliations = fcService.accountReconciliation.getAll()
  const intercompanyReconciliations = fcService.intercompanyReconciliation.getAll()

  return (
    <PageContainer>
      <EnterprisePageHeader title="Account Reconciliation" description="GL, subledger, and intercompany reconciliation workspace" />
      <FCReconciliationWorkspace reconciliations={reconciliations} accountRecs={accountReconciliations} icRecs={intercompanyReconciliations} />
    </PageContainer>
  )
}
