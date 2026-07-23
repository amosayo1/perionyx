import { arService } from "../../../../server/accounts-receivable"
import { PageContainer } from "../../../../components/enterprise/page-container"
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header"
import { ARAdjustmentList } from "../../../../components/accounts-receivable/ar-adjustment-list"

export default function ARAdjustmentsPage() {
  const adjustments = arService.adjustments.getAll()
  return (
    <PageContainer>
      <EnterprisePageHeader title="Adjustments" description="Credit notes, debit notes, and adjustments" />
      <ARAdjustmentList adjustments={adjustments} />
    </PageContainer>
  )
}
