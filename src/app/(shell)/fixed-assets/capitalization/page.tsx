import { faService } from "@/server/fixed-assets"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"

export default function FACapitalizationPage() {
  const capitalizations = faService.capitalization.getAll()
  const assets = faService.registry.getAll()
  const assetMap = new Map(assets.map((a) => [a.id, a]))
  const totalCapitalized = capitalizations.reduce((s, c) => s + c.totalCapitalizedCost, 0)
  const pendingApproval = capitalizations.filter((c) => !c.approvedBy).length

  return (
    <PageContainer>
      <EnterprisePageHeader title="Capitalization" description="Asset capitalization records — tracking capitalized costs and in-service dates" />

      <div style={{ background: "#1a1a2e", borderRadius: 12, padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Total Capitalizations</div>
            <div style={{ color: "#e0e0e0", fontSize: 24, fontWeight: 700 }}>{capitalizations.length}</div>
          </div>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Total Capitalized Cost</div>
            <div style={{ color: "#e0e0e0", fontSize: 24, fontWeight: 700 }}>${totalCapitalized.toLocaleString()}</div>
          </div>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Pending Approval</div>
            <div style={{ color: "#eab308", fontSize: 24, fontWeight: 700 }}>{pendingApproval}</div>
          </div>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Depreciation Methods</div>
            <div style={{ color: "#e0e0e0", fontSize: 24, fontWeight: 700 }}>
              {new Set(capitalizations.map((c) => c.method)).size}
            </div>
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ color: "#888", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #2a2a3e" }}>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>Asset</th>
              <th style={{ padding: "12px 8px", textAlign: "right" }}>Capitalized Cost</th>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>Method</th>
              <th style={{ padding: "12px 8px", textAlign: "right" }}>Useful Life</th>
              <th style={{ padding: "12px 8px", textAlign: "right" }}>Salvage Value</th>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>Capitalized By</th>
              <th style={{ padding: "12px 8px", textAlign: "center" }}>Approved</th>
            </tr>
          </thead>
          <tbody>
            {capitalizations.map((c) => {
              const asset = assetMap.get(c.assetId)
              return (
                <tr key={c.id} style={{ borderBottom: "1px solid #2a2a3e", color: "#e0e0e0" }}>
                  <td style={{ padding: "12px 8px", fontWeight: 500 }}>{asset?.name ?? c.assetId}</td>
                  <td style={{ padding: "12px 8px", textAlign: "right", fontFamily: "monospace", fontSize: 13 }}>
                    ${c.totalCapitalizedCost.toLocaleString()}
                  </td>
                  <td style={{ padding: "12px 8px", fontSize: 13 }}>{c.method}</td>
                  <td style={{ padding: "12px 8px", textAlign: "right" }}>{c.usefulLifeYears} yrs</td>
                  <td style={{ padding: "12px 8px", textAlign: "right", fontFamily: "monospace", fontSize: 13 }}>
                    ${c.salvageValue.toLocaleString()}
                  </td>
                  <td style={{ padding: "12px 8px", color: "#aaa", fontSize: 13 }}>{c.capitalizedBy}</td>
                  <td style={{ padding: "12px 8px", textAlign: "center" }}>
                    <span style={{ color: c.approvedBy ? "#22c55e" : "#eab308", fontSize: 12 }}>
                      {c.approvedBy ? "✓" : "○"}
                    </span>
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
