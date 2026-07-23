import { InvestmentService } from "../../../../server/investments";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { MaturityLadder } from "../../../../components/investments/maturity-ladder";

export default async function MaturityPage() {
  const svc = new InvestmentService();
  const holdings = svc.holdings.getAll();
  const securitiesMap = new Map(svc.securities.getAllSecurities().map((s) => [s.id, s]));
  const ladder = svc.maturity.getMaturityLadder(holdings, securitiesMap);

  return (
    <PageContainer>
      <EnterprisePageHeader title="Maturity" description="Maturity ladder and schedule" />
      <MaturityLadder ladder={ladder} />
    </PageContainer>
  );
}
