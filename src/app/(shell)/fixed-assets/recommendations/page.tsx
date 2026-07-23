import { faService } from "@/server/fixed-assets"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"

const PRIORITY_COLORS: Record<string, string> = {
  low: "#888", medium: "#3b82f6", high: "#eab308", critical: "#ef4444",
}

export default function FARecommendationsPage() {
  const recommendations = faService.recommendations.getAll()
  const active = recommendations.filter((r) => r.status === "active")
  const implemented = recommendations.filter((r) => r.status === "implemented")
  const dismissed = recommendations.filter((r) => r.status === "dismissed")
  const totalSavings = recommendations.reduce((s, r) => s + (r.estimatedSavings || 0), 0)

  return (
    <PageContainer>
      <EnterprisePageHeader title="Recommendations" description="AI-generated and manual asset lifecycle recommendations" />

      <div style={{ background: "#1a1a2e", borderRadius: 12, padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Total</div>
            <div style={{ color: "#e0e0e0", fontSize: 24, fontWeight: 700 }}>{recommendations.length}</div>
          </div>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Active</div>
            <div style={{ color: "#3b82f6", fontSize: 24, fontWeight: 700 }}>{active.length}</div>
          </div>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Implemented</div>
            <div style={{ color: "#22c55e", fontSize: 24, fontWeight: 700 }}>{implemented.length}</div>
          </div>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Est. Savings</div>
            <div style={{ color: "#eab308", fontSize: 24, fontWeight: 700 }}>${totalSavings.toLocaleString()}</div>
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ color: "#888", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #2a2a3e" }}>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>Title</th>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>Type</th>
              <th style={{ padding: "12px 8px", textAlign: "center" }}>Priority</th>
              <th style={{ padding: "12px 8px", textAlign: "center" }}>Status</th>
              <th style={{ padding: "12px 8px", textAlign: "right" }}>Est. Savings</th>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>Impact</th>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>Effort</th>
            </tr>
          </thead>
          <tbody>
            {recommendations.map((r) => (
              <tr key={r.id} style={{ borderBottom: "1px solid #2a2a3e", color: "#e0e0e0" }}>
                <td style={{ padding: "12px 8px", fontWeight: 500 }}>{r.title}</td>
                <td style={{ padding: "12px 8px", fontSize: 13, color: "#aaa" }}>{r.type}</td>
                <td style={{ padding: "12px 8px", textAlign: "center" }}>
                  <span style={{ color: PRIORITY_COLORS[r.priority], fontSize: 12, fontWeight: 600 }}>{r.priority}</span>
                </td>
                <td style={{ padding: "12px 8px", textAlign: "center" }}>
                  <span style={{
                    fontSize: 11, padding: "2px 8px", borderRadius: 4,
                    color: r.status === "active" ? "#3b82f6" : r.status === "implemented" ? "#22c55e" : "#888",
                    background: r.status === "active" ? "#1e3a5f" : r.status === "implemented" ? "#052e16" : "#2a2a3e",
                  }}>
                    {r.status}
                  </span>
                </td>
                <td style={{ padding: "12px 8px", textAlign: "right", fontFamily: "monospace", fontSize: 13, color: "#22c55e" }}>
                  {r.estimatedSavings ? `$${r.estimatedSavings.toLocaleString()}` : "—"}
                </td>
                <td style={{ padding: "12px 8px", fontSize: 13, color: "#aaa", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {r.impact}
                </td>
                <td style={{ padding: "12px 8px", fontSize: 13, color: "#aaa" }}>{r.effort}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageContainer>
  )
}
