import { consService } from "@/server/consolidation"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"
import ConsEquityAccountingPanel from "@/components/consolidation/cons-equity-accounting-panel"

export default function EquityAccountingPage() {
  const records = consService.equityAccounting.getAll()

  return (
    <PageContainer>
      <EnterprisePageHeader title="Equity Accounting" description="Equity method investments, goodwill, and carrying amounts" />
      <ConsEquityAccountingPanel records={records} />
    </PageContainer>
  )
}
