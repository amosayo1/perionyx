import { InvestmentService } from "../../../../server/investments";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { PerformanceCharts } from "../../../../components/investments/performance-charts";

export default async function PerformancePage() {
  const svc = new InvestmentService();
  const portfolioIds = svc.portfolios.getAll().map((p) => p.id);
  const performances = portfolioIds.flatMap((id) => svc.performance.getByPortfolio(id));

  return (
    <PageContainer>
      <EnterprisePageHeader title="Performance" description="Investment performance metrics and trends" />
      <PerformanceCharts performances={performances} />
    </PageContainer>
  );
}
