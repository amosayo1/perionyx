import { faService } from "@/server/fixed-assets"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"

export default function FAExecutivePage() {
  const summary = faService.getExecutiveSummary()
  const assets = faService.registry.getAll()
  const alerts = faService.alerts.getAll()
  const recommendations = faService.recommendations.getActive()
  const insights = faService.executiveInsights.generateInsights(assets, alerts, recommendations)

  return (
    <PageContainer>
      <EnterprisePageHeader title="Executive Overview" description="High-level fixed asset portfolio status and strategic insights" />

      <div style={{ background: "#1a1a2e", borderRadius: 12, padding: 28, display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Total Assets</div>
            <div style={{ color: "#e0e0e0", fontSize: 28, fontWeight: 700 }}>{summary.totalAssets}</div>
            <div style={{ color: "#666", fontSize: 12, marginTop: 4 }}>${summary.totalCost.toLocaleString()} cost</div>
          </div>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Net Book Value</div>
            <div style={{ color: "#e0e0e0", fontSize: 28, fontWeight: 700 }}>${summary.totalNetBookValue.toLocaleString()}</div>
            <div style={{ color: "#666", fontSize: 12, marginTop: 4 }}>{summary.totalAccumulatedDepreciation.toLocaleString()} accumulated depreciation</div>
          </div>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Capitalized This Period</div>
            <div style={{ color: "#22c55e", fontSize: 28, fontWeight: 700 }}>{summary.capitalizedThisPeriod}</div>
            <div style={{ color: "#666", fontSize: 12, marginTop: 4 }}>Disposed: {summary.disposedThisPeriod}</div>
          </div>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Pending Approvals</div>
            <div style={{ color: "#eab308", fontSize: 28, fontWeight: 700 }}>{summary.pendingApprovals}</div>
            <div style={{ color: "#666", fontSize: 12, marginTop: 4 }}>Critical alerts: {summary.criticalAlerts}</div>
          </div>
        </div>
      </div>

      <div style={{ background: "#1a1a2e", borderRadius: 12, padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
        <h2 style={{ color: "#e0e0e0", fontSize: 18, fontWeight: 600 }}>Executive Insights</h2>
        <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
          <p style={{ color: "#aaa", fontSize: 14, lineHeight: 1.6 }}>{insights.summary}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          <div>
            <h3 style={{ color: "#22c55e", fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Highlights</h3>
            {insights.highlights.length === 0 ? (
              <div style={{ color: "#666", fontSize: 13 }}>No highlights</div>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {insights.highlights.map((h, i) => (
                  <li key={i} style={{ color: "#ccc", fontSize: 13, lineHeight: 1.5, paddingLeft: 16, borderLeft: "2px solid #22c55e" }}>{h}</li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h3 style={{ color: "#ef4444", fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Risks</h3>
            {insights.risks.length === 0 ? (
              <div style={{ color: "#666", fontSize: 13 }}>No risks identified</div>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {insights.risks.map((r, i) => (
                  <li key={i} style={{ color: "#ccc", fontSize: 13, lineHeight: 1.5, paddingLeft: 16, borderLeft: "2px solid #ef4444" }}>{r}</li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h3 style={{ color: "#3b82f6", fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Recommended Actions</h3>
            {insights.actions.length === 0 ? (
              <div style={{ color: "#666", fontSize: 13 }}>No actions recommended</div>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {insights.actions.map((a, i) => (
                  <li key={i} style={{ color: "#ccc", fontSize: 13, lineHeight: 1.5, paddingLeft: 16, borderLeft: "2px solid #3b82f6" }}>{a}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
