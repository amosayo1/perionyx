import { consService } from "@/server/consolidation"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"
import { ConsExecutiveInsights } from "@/components/consolidation/cons-executive-insights"

export default function ConsExecutiveInsightsPage() {
  const summary = consService.getExecutiveSummary()
  const entities = consService.entityManagement.getAll()
  const runs = consService.consolidationEngine.getAll()
  const icRecords = consService.intercompanyEliminations.getAll()
  const adjustments = consService.consolidationAdjustments.getAll()
  const kpis = consService.analytics.getAllMetrics()
  const insights = consService.executiveInsights.generateInsights(summary, entities, runs, icRecords, adjustments, kpis)

  return (
    <PageContainer>
      <EnterprisePageHeader title="Executive Insights" description="AI-powered insights across all consolidation data sources" />
      <ConsExecutiveInsights summary={summary} insights={insights} />
    </PageContainer>
  )
}
