import { arService } from "../../../../server/accounts-receivable"
import { PageContainer } from "../../../../components/enterprise/page-container"
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header"
import { ARKPIDashboard } from "../../../../components/accounts-receivable/ar-kpi-dashboard"
import { ARExecutiveInsights } from "../../../../components/accounts-receivable/ar-executive-insights"

export default function ARAnalyticsPage() {
  const execSummary = arService.getExecutiveSummary()
  const kpis = arService.analytics.getAllKPIs()
  return (
    <PageContainer>
      <EnterprisePageHeader title="Analytics" description="AR performance analytics and insights" />
      <ARExecutiveInsights metrics={execSummary} />
      <div style={{ marginTop: 24 }}>
        <ARKPIDashboard kpis={kpis} />
      </div>
    </PageContainer>
  )
}
