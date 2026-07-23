import { arService } from "../../../../server/accounts-receivable"
import { PageContainer } from "../../../../components/enterprise/page-container"
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header"
import { ARExecutiveInsights } from "../../../../components/accounts-receivable/ar-executive-insights"
import { ARKPIDashboard } from "../../../../components/accounts-receivable/ar-kpi-dashboard"

export default function AROverviewPage() {
  const execSummary = arService.getExecutiveSummary()
  const kpis = arService.analytics.getAllKPIs()
  return (
    <PageContainer>
      <EnterprisePageHeader title="AR Overview" description="Executive summary and KPIs" />
      <ARExecutiveInsights metrics={execSummary} />
      <div style={{ marginTop: 24 }}>
        <ARKPIDashboard kpis={kpis} />
      </div>
    </PageContainer>
  )
}
