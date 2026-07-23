import { faService } from "@/server/fixed-assets"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"

const SEVERITY_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  info: { text: "#3b82f6", bg: "#1e3a5f", border: "#3b82f6" },
  warning: { text: "#eab308", bg: "#422006", border: "#eab308" },
  critical: { text: "#ef4444", bg: "#450a0a", border: "#ef4444" },
  emergency: { text: "#dc2626", bg: "#450a0a", border: "#dc2626" },
}

const CATEGORY_COLORS: Record<string, string> = {
  depreciation: "#a855f7", maintenance: "#eab308", impairment: "#ef4444",
  disposal: "#f97316", valuation: "#06b6d4", compliance: "#22c55e",
  lifecycle: "#3b82f6", budget: "#888", utilization: "#14b8a6", insurance: "#ec4899",
}

export default function FAAlertsPage() {
  const alerts = faService.alerts.getAll()
  const unresolved = alerts.filter((a) => !a.isResolved)
  const criticalCount = alerts.filter((a) => a.severity === "critical" || a.severity === "emergency").length

  return (
    <PageContainer>
      <EnterprisePageHeader title="Alerts" description="System alerts across depreciation, maintenance, impairment, compliance, and lifecycle events" />

      <div style={{ background: "#1a1a2e", borderRadius: 12, padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Total Alerts</div>
            <div style={{ color: "#e0e0e0", fontSize: 24, fontWeight: 700 }}>{alerts.length}</div>
          </div>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Unresolved</div>
            <div style={{ color: "#eab308", fontSize: 24, fontWeight: 700 }}>{unresolved.length}</div>
          </div>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Critical / Emergency</div>
            <div style={{ color: "#ef4444", fontSize: 24, fontWeight: 700 }}>{criticalCount}</div>
          </div>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Resolved</div>
            <div style={{ color: "#22c55e", fontSize: 24, fontWeight: 700 }}>{alerts.filter((a) => a.isResolved).length}</div>
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ color: "#888", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #2a2a3e" }}>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>Title</th>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>Category</th>
              <th style={{ padding: "12px 8px", textAlign: "center" }}>Severity</th>
              <th style={{ padding: "12px 8px", textAlign: "center" }}>Read</th>
              <th style={{ padding: "12px 8px", textAlign: "center" }}>Resolved</th>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>Message</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((a) => {
              const colors = SEVERITY_COLORS[a.severity]
              return (
                <tr key={a.id} style={{ borderBottom: "1px solid #2a2a3e", color: "#e0e0e0" }}>
                  <td style={{ padding: "12px 8px", fontWeight: 500, fontSize: 13 }}>
                    <span style={{
                      display: "inline-block", width: 8, height: 8, borderRadius: "50%",
                      background: colors.border, marginRight: 8,
                    }} />
                    {a.title}
                  </td>
                  <td style={{ padding: "12px 8px" }}>
                    <span style={{ color: CATEGORY_COLORS[a.type] || "#888", fontSize: 12 }}>{a.type}</span>
                  </td>
                  <td style={{ padding: "12px 8px", textAlign: "center" }}>
                    <span style={{
                      fontSize: 11, padding: "2px 8px", borderRadius: 4,
                      color: colors.text, background: colors.bg,
                    }}>
                      {a.severity}
                    </span>
                  </td>
                  <td style={{ padding: "12px 8px", textAlign: "center" }}>
                    <span style={{ color: a.isRead ? "#22c55e" : "#eab308", fontSize: 12 }}>
                      {a.isRead ? "Read" : "Unread"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 8px", textAlign: "center" }}>
                    <span style={{ color: a.isResolved ? "#22c55e" : "#ef4444", fontSize: 12 }}>
                      {a.isResolved ? "Resolved" : "Open"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 8px", fontSize: 13, color: "#aaa", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {a.message}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </PageContainer>
  )
}
