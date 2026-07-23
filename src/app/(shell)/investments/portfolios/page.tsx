import { InvestmentService } from "../../../../server/investments";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { PortfolioTree } from "../../../../components/investments/portfolio-tree";
import { PortfolioOverview } from "../../../../components/investments/portfolio-overview";

export default async function PortfolioTreePage() {
  const svc = new InvestmentService();
  const portfolios = svc.portfolios.getAll();
  const holdings = svc.holdings.getAll();
  const securities = svc.securities.getAllSecurities();
  const rootTree = svc.portfolios.getTree("port_001");

  return (
    <PageContainer>
      <EnterprisePageHeader title="Portfolios" description="Portfolio hierarchy and details" />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="mb-3 text-sm font-semibold text-white">Portfolio Tree</h3>
          <PortfolioTree tree={rootTree} />
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold text-white">All Portfolios</h3>
          <PortfolioOverview portfolios={portfolios} holdings={holdings} securities={securities} />
        </div>
      </div>
    </PageContainer>
  );
}
