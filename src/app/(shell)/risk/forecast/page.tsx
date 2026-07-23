import { riskService } from "../../../../server/risk";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { RiskTrendChart } from "../../../../components/risk/risk-trend-chart";

export default function RiskForecastPage() {
  const forecasts = riskService.analytics.getAllForecasts();

  return (
    <PageContainer>
      <EnterprisePageHeader title="Risk Forecasting" description="Risk trend forecasts and exposure projections" />
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RiskTrendChart forecasts={forecasts} title="Risk Score Forecast" />
        <RiskTrendChart
          forecasts={forecasts.filter((f) => f.metric === "exposure")}
          title="Exposure Trend Forecast"
        />
      </div>
    </PageContainer>
  );
}