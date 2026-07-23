import { arService } from "../../../../server/accounts-receivable"
import { PageContainer } from "../../../../components/enterprise/page-container"
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header"
import { ARCustomerRegistry } from "../../../../components/accounts-receivable/ar-customer-registry"

export default function ARCustomersPage() {
  const customers = arService.customers.getAll()
  return (
    <PageContainer>
      <EnterprisePageHeader title="Customers" description="Customer registry and risk profiles" />
      <ARCustomerRegistry customers={customers} />
    </PageContainer>
  )
}
