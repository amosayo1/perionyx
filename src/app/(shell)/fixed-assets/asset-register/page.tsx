import { faService } from "@/server/fixed-assets"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"

const STATUS_COLORS: Record<string, string> = {
  requested: "#3b82f6", approved: "#22c55e", acquired: "#a855f7",
  capitalized: "#06b6d4", inService: "#22c55e", underMaintenance: "#eab308",
  impaired: "#ef4444", revalued: "#f97316", disposed: "#888", retired: "#888", archived: "#666",
}

export default function FAAssetRegisterPage() {
  const assets = faService.registry.getAll()
  const activeCount = assets.filter((a) => a.isActive).length
  const totalValue = assets.reduce((s, a) => s + a.acquisition.totalCost, 0)

  return (
    <PageContainer>
      <EnterprisePageHeader title="Asset Register" description="Complete fixed asset inventory with status and valuation" />

      <div style={{ background: "#1a1a2e", borderRadius: 12, padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Total Assets</div>
            <div style={{ color: "#e0e0e0", fontSize: 24, fontWeight: 700 }}>{assets.length}</div>
          </div>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Active</div>
            <div style={{ color: "#22c55e", fontSize: 24, fontWeight: 700 }}>{activeCount}</div>
          </div>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Total Cost</div>
            <div style={{ color: "#e0e0e0", fontSize: 24, fontWeight: 700 }}>${totalValue.toLocaleString()}</div>
          </div>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Net Book Value</div>
            <div style={{ color: "#e0e0e0", fontSize: 24, fontWeight: 700 }}>
              ${assets.reduce((s, a) => s + a.depreciationDetails.netBookValue, 0).toLocaleString()}
            </div>
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ color: "#888", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #2a2a3e" }}>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>Tag</th>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>Name</th>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>Category</th>
              <th style={{ padding: "12px 8px", textAlign: "center" }}>Status</th>
              <th style={{ padding: "12px 8px", textAlign: "right" }}>Cost</th>
              <th style={{ padding: "12px 8px", textAlign: "right" }}>NBV</th>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>Department</th>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>Custodian</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((a) => (
              <tr key={a.id} style={{ borderBottom: "1px solid #2a2a3e", color: "#e0e0e0" }}>
                <td style={{ padding: "12px 8px", fontFamily: "monospace", fontSize: 13, color: "#888" }}>{a.assetTag}</td>
                <td style={{ padding: "12px 8px", fontWeight: 500 }}>{a.name}</td>
                <td style={{ padding: "12px 8px", color: "#aaa", fontSize: 13 }}>{a.category}</td>
                <td style={{ padding: "12px 8px", textAlign: "center" }}>
                  <span style={{
                    fontSize: 11, padding: "2px 8px", borderRadius: 4,
                    color: STATUS_COLORS[a.status] || "#888",
                    background: `${STATUS_COLORS[a.status] || "#888"}15`,
                  }}>
                    {a.status}
                  </span>
                </td>
                <td style={{ padding: "12px 8px", textAlign: "right", fontFamily: "monospace", fontSize: 13 }}>
                  ${a.acquisition.totalCost.toLocaleString()}
                </td>
                <td style={{ padding: "12px 8px", textAlign: "right", fontFamily: "monospace", fontSize: 13 }}>
                  ${a.depreciationDetails.netBookValue.toLocaleString()}
                </td>
                <td style={{ padding: "12px 8px", color: "#aaa", fontSize: 13 }}>{a.department ?? "—"}</td>
                <td style={{ padding: "12px 8px", color: "#aaa", fontSize: 13 }}>{a.custodian ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageContainer>
  )
}
