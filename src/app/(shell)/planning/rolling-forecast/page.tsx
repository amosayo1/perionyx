import { fpaService } from "@/server/fpa"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"
import FPARollingForecast from "@/components/fpa/fpa-rolling-forecast"

export default function RollingForecastPage() {
  const rollingForecasts = fpaService.rollingForecast.getAllForecasts()
  const latestForecast = rollingForecasts.length > 0 ? rollingForecasts[0] : null
  const latestItems = latestForecast ? fpaService.rollingForecast.getLineItemsByForecast(latestForecast.id) : []

  return (
    <PageContainer>
      <EnterprisePageHeader title="Rolling Forecast" description="Continuous rolling financial forecasts" />
      <div className="mt-6">
        {latestForecast ? (
          <FPARollingForecast forecast={latestForecast} lineItems={latestItems} />
        ) : (
          <div style={{ color: "#94a3b8", padding: 20 }}>No rolling forecasts available.</div>
        )}
      </div>
    </PageContainer>
  )
}
