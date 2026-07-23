import { fpaService } from "@/server/fpa"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"
import FPAnalyticsDashboard from "@/components/fpa/fpa-analytics-dashboard"

export default function AnalyticsPage() {
  const metrics = fpaService.getAllKPIs()
  const aggregates = fpaService.getAggregateMetrics()

  return (
    <PageContainer>
      <EnterprisePageHeader title="FP&A Analytics" description="Financial performance analytics and trends" />
      <div className="mt-6">
        <FPAnalyticsDashboard metrics={metrics} aggregates={aggregates} />
      </div>
    </PageContainer>
  )
}
