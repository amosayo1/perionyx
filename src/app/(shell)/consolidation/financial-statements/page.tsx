import { consService } from "@/server/consolidation"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"
import ConsFinancialStatementViewer from "@/components/consolidation/cons-financial-statement-viewer"

export default function FinancialStatementsPage() {
  const statements = consService.financialStatements.getAll()

  return (
    <PageContainer>
      <EnterprisePageHeader title="Financial Statements" description="Consolidated balance sheet, income statement, cash flow, and equity changes" />
      <ConsFinancialStatementViewer statements={statements} />
    </PageContainer>
  )
}
