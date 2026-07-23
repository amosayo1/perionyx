import { InvestmentService } from "../../../../server/investments";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { AnalyticsDashboard } from "../../../../components/investments/analytics-dashboard";

export default async function AnalyticsPage() {
  const svc = new InvestmentService();
  const portfolioIds = svc.portfolios.getAll().map((p) => p.id);
  const kpis = portfolioIds.map((id) => svc.analytics.getKPIs(id));

  return (
    <PageContainer>
      <EnterprisePageHeader title="Analytics" description="Investment KPI dashboard and analytics" />
      <AnalyticsDashboard kpis={kpis} />
    </PageContainer>
  );
}
