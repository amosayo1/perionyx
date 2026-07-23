import { arService } from "../../../../server/accounts-receivable"
import { PageContainer } from "../../../../components/enterprise/page-container"
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header"
import { ARCustomerStatements } from "../../../../components/accounts-receivable/ar-customer-statements"

export default function ARStatementsPage() {
  const statements = arService.statements.getAll()
  return (
    <PageContainer>
      <EnterprisePageHeader title="Statements" description="Customer account statements" />
      <ARCustomerStatements statements={statements} />
    </PageContainer>
  )
}
