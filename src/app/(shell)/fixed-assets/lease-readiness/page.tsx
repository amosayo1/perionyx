import { faService } from "@/server/fixed-assets"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"

export default function FALeaseReadinessPage() {
  const assets = faService.registry.getAll()
  const leasedAssets = assets.filter((a) => a.leaseInfo?.isLeased)
  const asc842Compliant = leasedAssets.filter((a) => a.leaseInfo?.asc842Compliant).length
  const ifrs16Compliant = leasedAssets.filter((a) => a.leaseInfo?.ifrs16Compliant).length
  const withROU = leasedAssets.filter((a) => a.leaseInfo?.rightOfUseAsset).length
  const totalLeaseLiability = leasedAssets.reduce((s, a) => s + (a.leaseInfo?.leaseLiability || 0), 0)
  const totalPayment = leasedAssets.reduce((s, a) => s + (a.leaseInfo?.leasePaymentAmount || 0), 0)

  return (
    <PageContainer>
      <EnterprisePageHeader title="Lease Readiness" description="ASC 842 / IFRS 16 lease accounting compliance status for leased assets" />

      <div style={{ background: "#1a1a2e", borderRadius: 12, padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Leased Assets</div>
            <div style={{ color: "#e0e0e0", fontSize: 24, fontWeight: 700 }}>{leasedAssets.length}</div>
          </div>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>ASC 842 Compliant</div>
            <div style={{ color: "#22c55e", fontSize: 24, fontWeight: 700 }}>{asc842Compliant}</div>
          </div>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>IFRS 16 Compliant</div>
            <div style={{ color: "#22c55e", fontSize: 24, fontWeight: 700 }}>{ifrs16Compliant}</div>
          </div>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>ROU Assets</div>
            <div style={{ color: "#06b6d4", fontSize: 24, fontWeight: 700 }}>{withROU}</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Total Lease Liability</div>
            <div style={{ color: "#e0e0e0", fontSize: 22, fontWeight: 700 }}>${totalLeaseLiability.toLocaleString()}</div>
          </div>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Total Payment Amount</div>
            <div style={{ color: "#e0e0e0", fontSize: 22, fontWeight: 700 }}>${totalPayment.toLocaleString()}</div>
          </div>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Finance Leases</div>
            <div style={{ color: "#e0e0e0", fontSize: 22, fontWeight: 700 }}>
              {leasedAssets.filter((a) => a.leaseInfo?.leaseType === "finance").length}
            </div>
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ color: "#888", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #2a2a3e" }}>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>Asset</th>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>Lessor</th>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>Type</th>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>Frequency</th>
              <th style={{ padding: "12px 8px", textAlign: "right" }}>Payment</th>
              <th style={{ padding: "12px 8px", textAlign: "right" }}>Liability</th>
              <th style={{ padding: "12px 8px", textAlign: "center" }}>ASC 842</th>
              <th style={{ padding: "12px 8px", textAlign: "center" }}>IFRS 16</th>
            </tr>
          </thead>
          <tbody>
            {leasedAssets.map((a) => {
              const l = a.leaseInfo!
              return (
                <tr key={a.id} style={{ borderBottom: "1px solid #2a2a3e", color: "#e0e0e0" }}>
                  <td style={{ padding: "12px 8px", fontWeight: 500 }}>{a.name}</td>
                  <td style={{ padding: "12px 8px", color: "#aaa", fontSize: 13 }}>{l.lessorName ?? "—"}</td>
                  <td style={{ padding: "12px 8px", fontSize: 13 }}>{l.leaseType ?? "—"}</td>
                  <td style={{ padding: "12px 8px", fontSize: 13, color: "#aaa" }}>{l.leasePaymentFrequency ?? "—"}</td>
                  <td style={{ padding: "12px 8px", textAlign: "right", fontFamily: "monospace", fontSize: 13 }}>
                    ${(l.leasePaymentAmount ?? 0).toLocaleString()}
                  </td>
                  <td style={{ padding: "12px 8px", textAlign: "right", fontFamily: "monospace", fontSize: 13 }}>
                    ${(l.leaseLiability ?? 0).toLocaleString()}
                  </td>
                  <td style={{ padding: "12px 8px", textAlign: "center" }}>
                    <span style={{ color: l.asc842Compliant ? "#22c55e" : "#ef4444", fontSize: 12 }}>
                      {l.asc842Compliant ? "✓" : "✗"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 8px", textAlign: "center" }}>
                    <span style={{ color: l.ifrs16Compliant ? "#22c55e" : "#ef4444", fontSize: 12 }}>
                      {l.ifrs16Compliant ? "✓" : "✗"}
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
