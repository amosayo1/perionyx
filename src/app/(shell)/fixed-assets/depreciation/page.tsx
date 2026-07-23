import { faService } from "@/server/fixed-assets"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"

export default function FADepreciationPage() {
  const assets = faService.registry.getAll()
  const schedule = faService.analytics.generateDepreciationScheduleReport(assets)
  const totalMonthlyDep = assets.reduce((s, a) => s + a.depreciationDetails.monthlyDepreciation, 0)
  const totalAccumulated = assets.reduce((s, a) => s + a.depreciationDetails.accumulatedDepreciation, 0)
  const totalNBV = assets.reduce((s, a) => s + a.depreciationDetails.netBookValue, 0)

  return (
    <PageContainer>
      <EnterprisePageHeader title="Depreciation Schedule" description="Depreciation calculations, accumulated depreciation, and remaining useful life across all assets" />

      <div style={{ background: "#1a1a2e", borderRadius: 12, padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Monthly Depreciation</div>
            <div style={{ color: "#e0e0e0", fontSize: 24, fontWeight: 700 }}>${totalMonthlyDep.toLocaleString()}</div>
          </div>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Annual Run Rate</div>
            <div style={{ color: "#e0e0e0", fontSize: 24, fontWeight: 700 }}>${(totalMonthlyDep * 12).toLocaleString()}</div>
          </div>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Accumulated Depreciation</div>
            <div style={{ color: "#eab308", fontSize: 24, fontWeight: 700 }}>${totalAccumulated.toLocaleString()}</div>
          </div>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Net Book Value</div>
            <div style={{ color: "#e0e0e0", fontSize: 24, fontWeight: 700 }}>${totalNBV.toLocaleString()}</div>
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ color: "#888", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #2a2a3e" }}>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>Asset</th>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>Tag</th>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>Method</th>
              <th style={{ padding: "12px 8px", textAlign: "right" }}>Cost</th>
              <th style={{ padding: "12px 8px", textAlign: "right" }}>Accumulated</th>
              <th style={{ padding: "12px 8px", textAlign: "right" }}>NBV</th>
              <th style={{ padding: "12px 8px", textAlign: "right" }}>Monthly</th>
              <th style={{ padding: "12px 8px", textAlign: "right" }}>YTD</th>
              <th style={{ padding: "12px 8px", textAlign: "right" }}>Remaining</th>
              <th style={{ padding: "12px 8px", textAlign: "right" }}>Entries</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((s) => (
              <tr key={s.assetId} style={{ borderBottom: "1px solid #2a2a3e", color: "#e0e0e0" }}>
                <td style={{ padding: "12px 8px", fontWeight: 500 }}>{s.assetName}</td>
                <td style={{ padding: "12px 8px", fontFamily: "monospace", fontSize: 13, color: "#888" }}>{s.assetTag}</td>
                <td style={{ padding: "12px 8px", fontSize: 13 }}>{s.method}</td>
                <td style={{ padding: "12px 8px", textAlign: "right", fontFamily: "monospace", fontSize: 13 }}>${s.cost.toLocaleString()}</td>
                <td style={{ padding: "12px 8px", textAlign: "right", fontFamily: "monospace", fontSize: 13, color: "#eab308" }}>
                  ${s.accumulatedDepreciation.toLocaleString()}
                </td>
                <td style={{ padding: "12px 8px", textAlign: "right", fontFamily: "monospace", fontSize: 13 }}>
                  ${s.netBookValue.toLocaleString()}
                </td>
                <td style={{ padding: "12px 8px", textAlign: "right", fontFamily: "monospace", fontSize: 13 }}>
                  ${s.currentPeriodDepreciation.toLocaleString()}
                </td>
                <td style={{ padding: "12px 8px", textAlign: "right", fontFamily: "monospace", fontSize: 13 }}>
                  ${s.yearToDateDepreciation.toLocaleString()}
                </td>
                <td style={{ padding: "12px 8px", textAlign: "right", fontSize: 13 }}>{s.remainingLifeMonths}m</td>
                <td style={{ padding: "12px 8px", textAlign: "right", fontSize: 13, color: "#888" }}>{s.entries.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageContainer>
  )
}
