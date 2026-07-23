import { InvestmentService } from "../../../../server/investments";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { YieldDashboard } from "../../../../components/investments/yield-dashboard";

export default async function YieldPage() {
  const svc = new InvestmentService();
  const holdings = svc.holdings.getAll();
  const holdingYields = holdings.flatMap((h) => svc.yield_.getByHolding(h.id));
  const portfolioYields = svc.portfolios.getAll().flatMap((p) => svc.yield_.getByPortfolio(p.id));
  const allYields = [...holdingYields, ...portfolioYields];

  return (
    <PageContainer>
      <EnterprisePageHeader title="Yield" description="Yield metrics across all holdings and portfolios" />
      <YieldDashboard yields={allYields} />
    </PageContainer>
  );
}
