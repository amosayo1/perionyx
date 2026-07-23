import { faService } from "@/server/fixed-assets"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"

export default function FAImpairmentPage() {
  const assets = faService.registry.getAll()
  const report = faService.analytics.generateDisposalReport(assets)
  const impairments = assets.flatMap((a) => a.impairments.map((i) => ({ ...i, assetName: a.name, assetTag: a.assetTag })))
  const totalLoss = impairments.reduce((s, i) => s + i.impairmentLoss, 0)
  const unreversed = impairments.filter((i) => !i.reversed)

  return (
    <PageContainer>
      <EnterprisePageHeader title="Impairment Review" description="Asset impairment indicators, losses, reversals, and carrying value analysis" />

      <div style={{ background: "#1a1a2e", borderRadius: 12, padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Total Impairments</div>
            <div style={{ color: "#e0e0e0", fontSize: 24, fontWeight: 700 }}>{impairments.length}</div>
          </div>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Total Loss</div>
            <div style={{ color: "#ef4444", fontSize: 24, fontWeight: 700 }}>${totalLoss.toLocaleString()}</div>
          </div>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Unreversed</div>
            <div style={{ color: "#eab308", fontSize: 24, fontWeight: 700 }}>{unreversed.length}</div>
          </div>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Reversals</div>
            <div style={{ color: "#22c55e", fontSize: 24, fontWeight: 700 }}>
              {impairments.filter((i) => i.reversed).length}
            </div>
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ color: "#888", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #2a2a3e" }}>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>Asset</th>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>Indicator</th>
              <th style={{ padding: "12px 8px", textAlign: "right" }}>Carrying Amount</th>
              <th style={{ padding: "12px 8px", textAlign: "right" }}>Recoverable</th>
              <th style={{ padding: "12px 8px", textAlign: "right" }}>Loss</th>
              <th style={{ padding: "12px 8px", textAlign: "center" }}>Reversed</th>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>Approved</th>
            </tr>
          </thead>
          <tbody>
            {impairments.map((i) => (
              <tr key={i.id} style={{ borderBottom: "1px solid #2a2a3e", color: "#e0e0e0" }}>
                <td style={{ padding: "12px 8px", fontWeight: 500, fontSize: 13 }}>{i.assetName}</td>
                <td style={{ padding: "12px 8px", fontSize: 13, color: "#aaa" }}>{i.indicator}</td>
                <td style={{ padding: "12px 8px", textAlign: "right", fontFamily: "monospace", fontSize: 13 }}>
                  ${i.carryingAmount.toLocaleString()}
                </td>
                <td style={{ padding: "12px 8px", textAlign: "right", fontFamily: "monospace", fontSize: 13 }}>
                  ${i.recoverableAmount.toLocaleString()}
                </td>
                <td style={{ padding: "12px 8px", textAlign: "right", fontFamily: "monospace", fontSize: 13, color: "#ef4444" }}>
                  ${i.impairmentLoss.toLocaleString()}
                </td>
                <td style={{ padding: "12px 8px", textAlign: "center" }}>
                  <span style={{ color: i.reversed ? "#22c55e" : "#888", fontSize: 12 }}>
                    {i.reversed ? "✓" : "—"}
                  </span>
                </td>
                <td style={{ padding: "12px 8px", fontSize: 13, color: "#aaa" }}>{i.approvedBy ?? "Pending"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageContainer>
  )
}
