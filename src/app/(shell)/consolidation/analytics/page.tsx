import { consService } from "@/server/consolidation"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"
import ConsAnalyticsDashboard from "@/components/consolidation/cons-analytics-dashboard"
import ConsEntityPerformance from "@/components/consolidation/cons-entity-performance"

export default function AnalyticsPage() {
  const metrics = consService.analytics.getAllMetrics()
  const aggregates = consService.getAggregateMetrics()
  const entities = consService.entityManagement.getAll()
  const managementEntries = consService.managementReporting.getAll()
  const performances = consService.analytics.generateEntityPerformanceReport(entities, managementEntries)

  return (
    <PageContainer>
      <EnterprisePageHeader title="Analytics" description="Consolidation performance metrics, KPIs, and entity-level analysis" />
      <ConsAnalyticsDashboard metrics={metrics} aggregates={aggregates} />
      <ConsEntityPerformance performances={performances} />
    </PageContainer>
  )
}
