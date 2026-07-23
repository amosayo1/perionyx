import { faService } from "@/server/fixed-assets"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"

const PRIORITY_COLORS: Record<string, string> = {
  low: "#888", medium: "#3b82f6", high: "#eab308", critical: "#ef4444",
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: "#3b82f6", inProgress: "#eab308", completed: "#22c55e", cancelled: "#888",
}

export default function FAMaintenancePage() {
  const assets = faService.registry.getAll()
  const records = assets.flatMap((a) => a.maintenance.map((m) => ({ ...m, assetName: a.name, assetTag: a.assetTag })))
  const totalCost = records.reduce((s, m) => s + m.cost, 0)
  const overdue = records.filter((m) => m.status === "scheduled" && new Date(m.scheduledDate) < new Date()).length

  return (
    <PageContainer>
      <EnterprisePageHeader title="Maintenance" description="Preventive and corrective maintenance records for all fixed assets" />

      <div style={{ background: "#1a1a2e", borderRadius: 12, padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Total Records</div>
            <div style={{ color: "#e0e0e0", fontSize: 24, fontWeight: 700 }}>{records.length}</div>
          </div>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Total Cost</div>
            <div style={{ color: "#e0e0e0", fontSize: 24, fontWeight: 700 }}>${totalCost.toLocaleString()}</div>
          </div>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Overdue</div>
            <div style={{ color: "#ef4444", fontSize: 24, fontWeight: 700 }}>{overdue}</div>
          </div>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Completed</div>
            <div style={{ color: "#22c55e", fontSize: 24, fontWeight: 700 }}>
              {records.filter((m) => m.status === "completed").length}
            </div>
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ color: "#888", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #2a2a3e" }}>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>Asset</th>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>Title</th>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>Type</th>
              <th style={{ padding: "12px 8px", textAlign: "center" }}>Priority</th>
              <th style={{ padding: "12px 8px", textAlign: "center" }}>Status</th>
              <th style={{ padding: "12px 8px", textAlign: "right" }}>Cost</th>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>Assigned To</th>
              <th style={{ padding: "12px 8px", textAlign: "right" }}>Downtime</th>
            </tr>
          </thead>
          <tbody>
            {records.map((m) => (
              <tr key={m.id} style={{ borderBottom: "1px solid #2a2a3e", color: "#e0e0e0" }}>
                <td style={{ padding: "12px 8px", fontWeight: 500, fontSize: 13 }}>{m.assetName}</td>
                <td style={{ padding: "12px 8px" }}>{m.title}</td>
                <td style={{ padding: "12px 8px", fontSize: 13, color: "#aaa" }}>{m.type}</td>
                <td style={{ padding: "12px 8px", textAlign: "center" }}>
                  <span style={{ color: PRIORITY_COLORS[m.priority], fontSize: 12, fontWeight: 600 }}>{m.priority}</span>
                </td>
                <td style={{ padding: "12px 8px", textAlign: "center" }}>
                  <span style={{
                    fontSize: 11, padding: "2px 8px", borderRadius: 4,
                    color: STATUS_COLORS[m.status], background: `${STATUS_COLORS[m.status]}15`,
                  }}>
                    {m.status}
                  </span>
                </td>
                <td style={{ padding: "12px 8px", textAlign: "right", fontFamily: "monospace", fontSize: 13 }}>
                  ${m.cost.toLocaleString()}
                </td>
                <td style={{ padding: "12px 8px", color: "#aaa", fontSize: 13 }}>{m.assignedTo ?? "—"}</td>
                <td style={{ padding: "12px 8px", textAlign: "right", fontSize: 13 }}>{m.downtimeHours ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageContainer>
  )
}
