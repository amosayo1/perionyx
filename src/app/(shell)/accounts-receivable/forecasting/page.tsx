import { arService } from "../../../../server/accounts-receivable"
import { PageContainer } from "../../../../components/enterprise/page-container"
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header"
import { ARForecastDashboard } from "../../../../components/accounts-receivable/ar-forecast-dashboard"

export default function ARForecastingPage() {
  const forecasts = arService.forecasting.getAll()
  return (
    <PageContainer>
      <EnterprisePageHeader title="Forecasting" description="Cash inflow forecasts and scenario analysis" />
      <ARForecastDashboard forecasts={forecasts} />
    </PageContainer>
  )
}
