import { executiveAIService } from "../../../../server/executive-ai";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { ForecastDashboard } from "../../../../components/executive-ai/forecast-dashboard";

export default async function ForecastPage() {
  const forecasts = executiveAIService.forecasts.getAll();

  return (
    <PageContainer>
      <EnterprisePageHeader title="AI Forecasts" description="AI-powered forecasting across enterprise domains with confidence bands" />
      <ForecastDashboard forecasts={forecasts} />
    </PageContainer>
  );
}
