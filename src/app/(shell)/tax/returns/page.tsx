import { taxService } from "../../../../server/tax";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { TaxReturnBoard } from "../../../../components/tax/tax-return-board";

export default async function TaxReturnsPage() {
  const returns = taxService.returns.getAllReturns();

  return (
    <PageContainer>
      <EnterprisePageHeader title="Tax Returns" description="Filing, status tracking, and amendment management" />
      <TaxReturnBoard returns={returns} />
    </PageContainer>
  );
}
