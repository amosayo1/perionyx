import { faService } from "@/server/fixed-assets"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"

export default function FAAcquisitionsPage() {
  const acquisitions = faService.acquisition.getAll()
  const assets = faService.registry.getAll()
  const assetMap = new Map(assets.map((a) => [a.id, a]))
  const totalCost = acquisitions.reduce((s, a) => s + a.totalCost, 0)
  const pending = acquisitions.filter((a) => !a.approvedBy).length

  return (
    <PageContainer>
      <EnterprisePageHeader title="Acquisitions" description="Asset acquisition records including purchases, leases, and construction" />

      <div style={{ background: "#1a1a2e", borderRadius: 12, padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Total Acquisitions</div>
            <div style={{ color: "#e0e0e0", fontSize: 24, fontWeight: 700 }}>{acquisitions.length}</div>
          </div>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Total Cost</div>
            <div style={{ color: "#e0e0e0", fontSize: 24, fontWeight: 700 }}>${totalCost.toLocaleString()}</div>
          </div>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Purchases</div>
            <div style={{ color: "#e0e0e0", fontSize: 24, fontWeight: 700 }}>{acquisitions.filter((a) => a.acquisitionType === "purchase").length}</div>
          </div>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Pending Approval</div>
            <div style={{ color: "#eab308", fontSize: 24, fontWeight: 700 }}>{pending}</div>
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ color: "#888", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #2a2a3e" }}>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>Asset</th>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>Vendor</th>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>Type</th>
              <th style={{ padding: "12px 8px", textAlign: "right" }}>Purchase Price</th>
              <th style={{ padding: "12px 8px", textAlign: "right" }}>Total Cost</th>
              <th style={{ padding: "12px 8px", textAlign: "center" }}>Approved</th>
            </tr>
          </thead>
          <tbody>
            {acquisitions.map((a) => {
              const asset = assetMap.get(a.assetId)
              return (
                <tr key={a.id} style={{ borderBottom: "1px solid #2a2a3e", color: "#e0e0e0" }}>
                  <td style={{ padding: "12px 8px", fontWeight: 500 }}>{asset?.name ?? a.assetId}</td>
                  <td style={{ padding: "12px 8px", color: "#aaa" }}>{a.vendorName}</td>
                  <td style={{ padding: "12px 8px", fontSize: 13 }}>{a.acquisitionType}</td>
                  <td style={{ padding: "12px 8px", textAlign: "right", fontFamily: "monospace", fontSize: 13 }}>
                    ${a.purchasePrice.toLocaleString()}
                  </td>
                  <td style={{ padding: "12px 8px", textAlign: "right", fontFamily: "monospace", fontSize: 13 }}>
                    ${a.totalCost.toLocaleString()}
                  </td>
                  <td style={{ padding: "12px 8px", textAlign: "center" }}>
                    <span style={{ color: a.approvedBy ? "#22c55e" : "#eab308", fontSize: 12 }}>
                      {a.approvedBy ? "✓ Approved" : "○ Pending"}
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
