import { faService } from "@/server/fixed-assets"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"

export default function FixedAssetsPage() {
  const summary = faService.getExecutiveSummary()
  const metrics = faService.analytics.getAllMetrics()
  const assets = faService.registry.getAll()
  const alerts = faService.alerts.getUnresolved()
  const recommendations = faService.recommendations.getActive()

  return (
    <PageContainer>
      <EnterprisePageHeader title="Fixed Assets" description="Manage and monitor fixed asset lifecycle across the enterprise" />

      <div style={{ background: "#1a1a2e", borderRadius: 12, padding: 28, display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Total Assets</div>
            <div style={{ color: "#e0e0e0", fontSize: 28, fontWeight: 700 }}>{summary.totalAssets}</div>
            <div style={{ color: "#666", fontSize: 12, marginTop: 4 }}>${summary.totalCost.toLocaleString()} total cost</div>
          </div>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Net Book Value</div>
            <div style={{ color: "#e0e0e0", fontSize: 28, fontWeight: 700 }}>${summary.totalNetBookValue.toLocaleString()}</div>
            <div style={{ color: "#666", fontSize: 12, marginTop: 4 }}>Accum. depr: ${summary.totalAccumulatedDepreciation.toLocaleString()}</div>
          </div>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Depreciation Run Rate</div>
            <div style={{ color: "#e0e0e0", fontSize: 28, fontWeight: 700 }}>${summary.depreciationForPeriod.toLocaleString()}</div>
            <div style={{ color: "#666", fontSize: 12, marginTop: 4 }}>/month</div>
          </div>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Fully Depreciated</div>
            <div style={{ color: "#eab308", fontSize: 28, fontWeight: 700 }}>{summary.fullyDepreciatedCount}</div>
            <div style={{ color: "#666", fontSize: 12, marginTop: 4 }}>${summary.fullyDepreciatedValue.toLocaleString()} value</div>
          </div>
        </div>
      </div>

      <div style={{ background: "#1a1a2e", borderRadius: 12, padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
        <h2 style={{ color: "#e0e0e0", fontSize: 18, fontWeight: 600 }}>Key Performance Indicators</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {metrics.map((kpi) => (
            <div key={kpi.id} style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#888", fontSize: 13 }}>{kpi.name}</span>
                <span style={{
                  fontSize: 11, padding: "2px 8px", borderRadius: 4,
                  color: kpi.status === "onTrack" ? "#22c55e" : kpi.status === "atRisk" ? "#eab308" : kpi.status === "critical" ? "#ef4444" : "#22c55e",
                  background: kpi.status === "onTrack" ? "#052e16" : kpi.status === "atRisk" ? "#422006" : kpi.status === "critical" ? "#450a0a" : "#052e16",
                }}>
                  {kpi.status}
                </span>
              </div>
              <div style={{ color: "#e0e0e0", fontSize: 22, fontWeight: 700, marginTop: 8 }}>
                {kpi.value}{kpi.unit}
              </div>
              <div style={{ color: "#666", fontSize: 12, marginTop: 4 }}>
                Target: {kpi.target}{kpi.unit}
                <span style={{ marginLeft: 8, color: kpi.trend === "improving" ? "#22c55e" : kpi.trend === "worsening" ? "#ef4444" : "#888" }}>
                  {kpi.trend === "improving" ? "↑" : kpi.trend === "worsening" ? "↓" : "→"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ background: "#1a1a2e", borderRadius: 12, padding: 24 }}>
          <h2 style={{ color: "#e0e0e0", fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Unresolved Alerts ({alerts.length})</h2>
          {alerts.length === 0 ? (
            <div style={{ color: "#666", fontSize: 14, padding: "16px 0" }}>No unresolved alerts</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {alerts.slice(0, 5).map((a) => (
                <div key={a.id} style={{
                  padding: 12, borderRadius: 8, background: "#2a2a3e",
                  borderLeft: `3px solid ${a.severity === "critical" || a.severity === "emergency" ? "#ef4444" : a.severity === "warning" ? "#eab308" : "#3b82f6"}`,
                }}>
                  <div style={{ color: "#e0e0e0", fontSize: 14, fontWeight: 500 }}>{a.title}</div>
                  <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>{a.message}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ background: "#1a1a2e", borderRadius: 12, padding: 24 }}>
          <h2 style={{ color: "#e0e0e0", fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
            Active Recommendations ({recommendations.length})
          </h2>
          {recommendations.length === 0 ? (
            <div style={{ color: "#666", fontSize: 14, padding: "16px 0" }}>No active recommendations</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {recommendations.slice(0, 5).map((r) => (
                <div key={r.id} style={{
                  padding: 12, borderRadius: 8, background: "#2a2a3e",
                  borderLeft: `3px solid ${r.priority === "critical" ? "#ef4444" : r.priority === "high" ? "#eab308" : r.priority === "medium" ? "#3b82f6" : "#888"}`,
                }}>
                  <div style={{ color: "#e0e0e0", fontSize: 14, fontWeight: 500 }}>{r.title}</div>
                  <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>{r.description}</div>
                  {r.estimatedSavings && (
                    <div style={{ color: "#22c55e", fontSize: 12, marginTop: 4 }}>
                      Est. savings: ${r.estimatedSavings.toLocaleString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  )
}
