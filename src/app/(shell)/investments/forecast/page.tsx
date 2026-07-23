import { InvestmentService } from "../../../../server/investments";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { ForecastDashboard } from "../../../../components/investments/forecast-dashboard";

export default async function ForecastPage() {
  const svc = new InvestmentService();
  const portfolioIds = svc.portfolios.getAll().map((p) => p.id);
  const forecasts = portfolioIds.flatMap((id) => svc.forecast.getByPortfolio(id));

  return (
    <PageContainer>
      <EnterprisePageHeader title="Forecast" description="Investment income and growth projections" />
      <ForecastDashboard forecasts={forecasts} />
    </PageContainer>
  );
}
