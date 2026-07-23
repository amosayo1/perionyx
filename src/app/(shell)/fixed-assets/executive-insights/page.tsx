import { faService } from "@/server/fixed-assets"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"

export default function FAExecutiveInsightsPage() {
  const assets = faService.registry.getAll()
  const alerts = faService.alerts.getAll()
  const recommendations = faService.recommendations.getActive()
  const insights = faService.executiveInsights.generateInsights(assets, alerts, recommendations)
  const summary = faService.getExecutiveSummary()

  return (
    <PageContainer>
      <EnterprisePageHeader title="Executive Insights" description="AI-powered strategic insights, risk analysis, and actionable recommendations for fixed asset management" />

      <div style={{ background: "#1a1a2e", borderRadius: 12, padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Portfolio Value</div>
            <div style={{ color: "#e0e0e0", fontSize: 24, fontWeight: 700 }}>${summary.totalNetBookValue.toLocaleString()}</div>
            <div style={{ color: "#666", fontSize: 12, marginTop: 4 }}>NBV</div>
          </div>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Depreciation Run Rate</div>
            <div style={{ color: "#e0e0e0", fontSize: 24, fontWeight: 700 }}>${summary.depreciationForPeriod.toLocaleString()}</div>
            <div style={{ color: "#666", fontSize: 12, marginTop: 4 }}>/month</div>
          </div>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Critical Alerts</div>
            <div style={{ color: "#ef4444", fontSize: 24, fontWeight: 700 }}>{summary.criticalAlerts}</div>
            <div style={{ color: "#666", fontSize: 12, marginTop: 4 }}>Require immediate attention</div>
          </div>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Active Recommendations</div>
            <div style={{ color: "#3b82f6", fontSize: 24, fontWeight: 700 }}>{recommendations.length}</div>
            <div style={{ color: "#666", fontSize: 12, marginTop: 4 }}>Review and prioritize</div>
          </div>
        </div>

        <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 20 }}>
          <h3 style={{ color: "#e0e0e0", fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Portfolio Summary</h3>
          <p style={{ color: "#ccc", fontSize: 14, lineHeight: 1.7 }}>{insights.summary}</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 20 }}>
            <h3 style={{ color: "#22c55e", fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
              <span style={{ marginRight: 8 }}>✦</span>Highlights
            </h3>
            {insights.highlights.length === 0 ? (
              <div style={{ color: "#666", fontSize: 13 }}>No highlights generated</div>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {insights.highlights.map((h, i) => (
                  <li key={i} style={{
                    color: "#bbb", fontSize: 13, lineHeight: 1.6, paddingLeft: 14,
                    borderLeft: "2px solid #22c55e",
                  }}>{h}</li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 20 }}>
            <h3 style={{ color: "#ef4444", fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
              <span style={{ marginRight: 8 }}>▲</span>Risks
            </h3>
            {insights.risks.length === 0 ? (
              <div style={{ color: "#666", fontSize: 13 }}>No risks identified</div>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {insights.risks.map((r, i) => (
                  <li key={i} style={{
                    color: "#bbb", fontSize: 13, lineHeight: 1.6, paddingLeft: 14,
                    borderLeft: "2px solid #ef4444",
                  }}>{r}</li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 20 }}>
            <h3 style={{ color: "#3b82f6", fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
              <span style={{ marginRight: 8 }}>▶</span>Recommended Actions
            </h3>
            {insights.actions.length === 0 ? (
              <div style={{ color: "#666", fontSize: 13 }}>No actions recommended</div>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {insights.actions.map((a, i) => (
                  <li key={i} style={{
                    color: "#bbb", fontSize: 13, lineHeight: 1.6, paddingLeft: 14,
                    borderLeft: "2px solid #3b82f6",
                  }}>{a}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
