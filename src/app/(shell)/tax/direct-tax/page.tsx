import { taxService } from "../../../../server/tax";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { CorporateTaxDashboard } from "../../../../components/tax/corporate-tax-dashboard";

export default async function DirectTaxPage() {
  const provisions = taxService.directTax.getAllProvisions();

  return (
    <PageContainer>
      <EnterprisePageHeader title="Direct Tax" description="Corporate Income Tax" />
      <CorporateTaxDashboard provisions={provisions} />
    </PageContainer>
  );
}
