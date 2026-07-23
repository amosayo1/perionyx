import { faService } from "@/server/fixed-assets"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"

export default function FADisposalsPage() {
  const assets = faService.registry.getAll()
  const disposals = assets.filter((a) => a.disposal).map((a) => ({
    ...a.disposal!,
    assetName: a.name,
    assetTag: a.assetTag,
    category: a.category,
  }))
  const totalProceeds = disposals.reduce((s, d) => s + d.netDisposalProceeds, 0)
  const totalGain = disposals.filter((d) => d.gainLoss > 0).reduce((s, d) => s + d.gainLoss, 0)
  const totalLoss = disposals.filter((d) => d.gainLoss < 0).reduce((s, d) => s + Math.abs(d.gainLoss), 0)
  const pendingApproval = disposals.filter((d) => !d.approvedBy).length

  return (
    <PageContainer>
      <EnterprisePageHeader title="Disposals" description="Asset disposals — sales, scrapping, donations, trade-ins, and abandonments" />

      <div style={{ background: "#1a1a2e", borderRadius: 12, padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Total Disposals</div>
            <div style={{ color: "#e0e0e0", fontSize: 24, fontWeight: 700 }}>{disposals.length}</div>
          </div>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Net Proceeds</div>
            <div style={{ color: "#e0e0e0", fontSize: 24, fontWeight: 700 }}>${totalProceeds.toLocaleString()}</div>
          </div>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Total Gain</div>
            <div style={{ color: "#22c55e", fontSize: 24, fontWeight: 700 }}>${totalGain.toLocaleString()}</div>
          </div>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Pending Approval</div>
            <div style={{ color: "#eab308", fontSize: 24, fontWeight: 700 }}>{pendingApproval}</div>
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ color: "#888", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #2a2a3e" }}>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>Asset</th>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>Type</th>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>Category</th>
              <th style={{ padding: "12px 8px", textAlign: "right" }}>Gross Proceeds</th>
              <th style={{ padding: "12px 8px", textAlign: "right" }}>NBV at Disposal</th>
              <th style={{ padding: "12px 8px", textAlign: "right" }}>Gain/Loss</th>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>Counterparty</th>
              <th style={{ padding: "12px 8px", textAlign: "center" }}>Approved</th>
            </tr>
          </thead>
          <tbody>
            {disposals.map((d) => (
              <tr key={d.id} style={{ borderBottom: "1px solid #2a2a3e", color: "#e0e0e0" }}>
                <td style={{ padding: "12px 8px", fontWeight: 500, fontSize: 13 }}>{d.assetName}</td>
                <td style={{ padding: "12px 8px", fontSize: 13 }}>{d.disposalType}</td>
                <td style={{ padding: "12px 8px", color: "#aaa", fontSize: 13 }}>{d.category}</td>
                <td style={{ padding: "12px 8px", textAlign: "right", fontFamily: "monospace", fontSize: 13 }}>
                  ${d.grossDisposalProceeds.toLocaleString()}
                </td>
                <td style={{ padding: "12px 8px", textAlign: "right", fontFamily: "monospace", fontSize: 13 }}>
                  ${d.netBookValueAtDisposal.toLocaleString()}
                </td>
                <td style={{
                  padding: "12px 8px", textAlign: "right", fontFamily: "monospace", fontSize: 13,
                  color: d.gainLoss >= 0 ? "#22c55e" : "#ef4444",
                }}>
                  {d.gainLoss >= 0 ? "+" : ""}${d.gainLoss.toLocaleString()}
                </td>
                <td style={{ padding: "12px 8px", color: "#aaa", fontSize: 13 }}>{d.counterparty ?? "—"}</td>
                <td style={{ padding: "12px 8px", textAlign: "center" }}>
                  <span style={{ color: d.approvedBy ? "#22c55e" : "#eab308", fontSize: 12 }}>
                    {d.approvedBy ? "✓" : "○"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageContainer>
  )
}
