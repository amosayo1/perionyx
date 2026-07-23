import { fcService } from "@/server/financial-close"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"
import { FCApprovalQueue } from "@/components/financial-close/fc-approval-queue"

export default function FCApprovalsPage() {
  const approvals = fcService.approvals.getAll()

  return (
    <PageContainer>
      <EnterprisePageHeader title="Approvals" description="Pending and completed approval requests" />
      <FCApprovalQueue approvals={approvals} />
    </PageContainer>
  )
}
