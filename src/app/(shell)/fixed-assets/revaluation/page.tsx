import { faService } from "@/server/fixed-assets"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"

export default function FARevaluationPage() {
  const assets = faService.registry.getAll()
  const revaluations = assets.flatMap((a) => a.revaluations.map((r) => ({ ...r, assetName: a.name, assetTag: a.assetTag })))
  const totalSurplus = revaluations.reduce((s, r) => s + (r.revaluationSurplus || 0), 0)
  const totalLoss = revaluations.reduce((s, r) => s + (r.revaluationLoss || 0), 0)
  const upwardCount = revaluations.filter((r) => r.revaluationType === "upward").length
  const downwardCount = revaluations.filter((r) => r.revaluationType === "downward").length

  return (
    <PageContainer>
      <EnterprisePageHeader title="Revaluation" description="Asset revaluation history — fair value adjustments, upward/downward revaluations" />

      <div style={{ background: "#1a1a2e", borderRadius: 12, padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Total Revaluations</div>
            <div style={{ color: "#e0e0e0", fontSize: 24, fontWeight: 700 }}>{revaluations.length}</div>
          </div>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Upward</div>
            <div style={{ color: "#22c55e", fontSize: 24, fontWeight: 700 }}>{upwardCount}</div>
          </div>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Downward</div>
            <div style={{ color: "#ef4444", fontSize: 24, fontWeight: 700 }}>{downwardCount}</div>
          </div>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Net Surplus</div>
            <div style={{ color: totalSurplus - totalLoss >= 0 ? "#22c55e" : "#ef4444", fontSize: 24, fontWeight: 700 }}>
              ${(totalSurplus - totalLoss).toLocaleString()}
            </div>
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ color: "#888", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #2a2a3e" }}>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>Asset</th>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>Type</th>
              <th style={{ padding: "12px 8px", textAlign: "right" }}>Previous Carrying</th>
              <th style={{ padding: "12px 8px", textAlign: "right" }}>Fair Value</th>
              <th style={{ padding: "12px 8px", textAlign: "right" }}>Surplus</th>
              <th style={{ padding: "12px 8px", textAlign: "right" }}>Loss</th>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>Appraised By</th>
            </tr>
          </thead>
          <tbody>
            {revaluations.map((r) => (
              <tr key={r.id} style={{ borderBottom: "1px solid #2a2a3e", color: "#e0e0e0" }}>
                <td style={{ padding: "12px 8px", fontWeight: 500, fontSize: 13 }}>{r.assetName}</td>
                <td style={{ padding: "12px 8px", fontSize: 13, color: "#aaa" }}>
                  <span style={{ color: r.revaluationType === "upward" ? "#22c55e" : "#ef4444" }}>
                    {r.revaluationType}
                  </span>
                </td>
                <td style={{ padding: "12px 8px", textAlign: "right", fontFamily: "monospace", fontSize: 13 }}>
                  ${r.previousCarryingAmount.toLocaleString()}
                </td>
                <td style={{ padding: "12px 8px", textAlign: "right", fontFamily: "monospace", fontSize: 13 }}>
                  ${r.fairValue.toLocaleString()}
                </td>
                <td style={{ padding: "12px 8px", textAlign: "right", fontFamily: "monospace", fontSize: 13, color: "#22c55e" }}>
                  {r.revaluationSurplus ? `$${r.revaluationSurplus.toLocaleString()}` : "—"}
                </td>
                <td style={{ padding: "12px 8px", textAlign: "right", fontFamily: "monospace", fontSize: 13, color: "#ef4444" }}>
                  {r.revaluationLoss ? `$${r.revaluationLoss.toLocaleString()}` : "—"}
                </td>
                <td style={{ padding: "12px 8px", color: "#aaa", fontSize: 13 }}>{r.appraisedBy ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageContainer>
  )
}
