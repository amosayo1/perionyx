import { InvestmentService } from "../../../../server/investments";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { InvestmentFilters } from "../../../../components/investments/investment-filters";
import { HoldingsTable } from "../../../../components/investments/holdings-table";

export default async function HoldingsPage() {
  const svc = new InvestmentService();
  const holdings = svc.holdings.getAll();
  const securities = svc.securities.getAllSecurities();
  const portfolios = svc.portfolios.getAll();

  return (
    <PageContainer>
      <EnterprisePageHeader title="Holdings" description="Security holdings across all portfolios" />
      <InvestmentFilters portfolios={portfolios} />
      <HoldingsTable holdings={holdings} securities={securities} portfolios={portfolios} />
    </PageContainer>
  );
}
