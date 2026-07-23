import { InvestmentService } from "../../../../server/investments";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { ValuationDashboard } from "../../../../components/investments/valuation-dashboard";

export default async function ValuationPage() {
  const svc = new InvestmentService();
  const portfolioIds = svc.portfolios.getAll().map((p) => p.id);
  const valuations = portfolioIds
    .map((id) => svc.valuation.getLatest(id))
    .filter((v): v is NonNullable<typeof v> => v != null);

  return (
    <PageContainer>
      <EnterprisePageHeader title="Valuation" description="Portfolio valuation snapshots and NAV" />
      <ValuationDashboard valuations={valuations} />
    </PageContainer>
  );
}
