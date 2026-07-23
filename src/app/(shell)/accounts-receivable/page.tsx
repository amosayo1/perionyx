import { arService } from "../../../server/accounts-receivable"
import { PageContainer } from "../../../components/enterprise/page-container"
import { EnterprisePageHeader } from "../../../components/enterprise/enterprise-page-header"
import { ARExecutiveHeader } from "../../../components/accounts-receivable/ar-executive-header"
import { ARKPIDashboard } from "../../../components/accounts-receivable/ar-kpi-dashboard"
import { ARAlertsPanel } from "../../../components/accounts-receivable/ar-alerts-panel"
import { RecommendationsPanel } from "../../../components/accounts-receivable/ar-recommendations-panel"

export default function ARPage() {
  const execSummary = arService.getExecutiveSummary()
  const kpis = arService.analytics.getAllKPIs()
  const alerts = arService.alerts.getAll()
  const recommendations = arService.recommendations.getAll()
  return (
    <PageContainer>
      <EnterprisePageHeader
        title="Accounts Receivable"
        description="Manage customer receivables, collections, credit, and cash application"
      />
      <ARExecutiveHeader metrics={execSummary} />
      <div style={{ marginTop: 24 }}>
        <h2 style={{ color: "#e0e0e0", fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Key Performance Indicators</h2>
        <ARKPIDashboard kpis={kpis} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 24 }}>
        <div>
          <h2 style={{ color: "#e0e0e0", fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Active Alerts</h2>
          <ARAlertsPanel alerts={alerts} />
        </div>
        <div>
          <h2 style={{ color: "#e0e0e0", fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Recommendations</h2>
          <RecommendationsPanel recommendations={recommendations} />
        </div>
      </div>
    </PageContainer>
  )
}
