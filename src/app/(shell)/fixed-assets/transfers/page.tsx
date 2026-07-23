import { faService } from "@/server/fixed-assets"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"

export default function FATransfersPage() {
  const assets = faService.registry.getAll()
  const transfers = assets.flatMap((a) => a.transfers.map((t) => ({ ...t, assetName: a.name, assetTag: a.assetTag })))
  const pendingTransfers = transfers.filter((t) => !t.approvedBy).length

  return (
    <PageContainer>
      <EnterprisePageHeader title="Transfers" description="Asset transfers between departments, cost centers, and locations" />

      <div style={{ background: "#1a1a2e", borderRadius: 12, padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Total Transfers</div>
            <div style={{ color: "#e0e0e0", fontSize: 24, fontWeight: 700 }}>{transfers.length}</div>
          </div>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Pending Approval</div>
            <div style={{ color: "#eab308", fontSize: 24, fontWeight: 700 }}>{pendingTransfers}</div>
          </div>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Relocations</div>
            <div style={{ color: "#e0e0e0", fontSize: 24, fontWeight: 700 }}>
              {transfers.filter((t) => t.reason === "relocation").length}
            </div>
          </div>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Reorganizations</div>
            <div style={{ color: "#e0e0e0", fontSize: 24, fontWeight: 700 }}>
              {transfers.filter((t) => t.reason === "reorganization").length}
            </div>
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ color: "#888", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #2a2a3e" }}>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>Asset</th>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>Reason</th>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>From Dept</th>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>To Dept</th>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>From Custodian</th>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>To Custodian</th>
              <th style={{ padding: "12px 8px", textAlign: "center" }}>Approved</th>
            </tr>
          </thead>
          <tbody>
            {transfers.map((t) => (
              <tr key={t.id} style={{ borderBottom: "1px solid #2a2a3e", color: "#e0e0e0" }}>
                <td style={{ padding: "12px 8px", fontWeight: 500 }}>{t.assetName}</td>
                <td style={{ padding: "12px 8px", fontSize: 13 }}>{t.reason}</td>
                <td style={{ padding: "12px 8px", color: "#aaa", fontSize: 13 }}>{t.fromDepartment ?? "—"}</td>
                <td style={{ padding: "12px 8px", color: "#aaa", fontSize: 13 }}>{t.toDepartment ?? "—"}</td>
                <td style={{ padding: "12px 8px", color: "#aaa", fontSize: 13 }}>{t.fromCustodian ?? "—"}</td>
                <td style={{ padding: "12px 8px", color: "#aaa", fontSize: 13 }}>{t.toCustodian ?? "—"}</td>
                <td style={{ padding: "12px 8px", textAlign: "center" }}>
                  <span style={{ color: t.approvedBy ? "#22c55e" : "#eab308", fontSize: 12 }}>
                    {t.approvedBy ? "✓" : "○"}
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
