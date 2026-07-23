import { fpaService } from "@/server/fpa"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"
import FPAForecastDashboard from "@/components/fpa/fpa-forecast-dashboard"

export default function ForecastsPage() {
  const forecasts = fpaService.rollingForecast.getAllForecasts()

  return (
    <PageContainer>
      <EnterprisePageHeader title="Forecasts" description="Financial forecasting and projections" />
      <div className="mt-6">
        <FPAForecastDashboard forecasts={forecasts} />
      </div>
    </PageContainer>
  )
}
