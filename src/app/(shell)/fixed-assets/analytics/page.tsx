import { faService } from "@/server/fixed-assets"
import { PageContainer } from "@/components/enterprise/page-container"
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header"

export default function FAAnalyticsPage() {
  const metrics = faService.analytics.getAllMetrics()
  const aggregate = faService.getAggregateMetrics()
  const assets = faService.registry.getAll()
  const deptCount = new Set(assets.map((a) => a.department).filter(Boolean)).size
  const categoryCount = new Set(assets.map((a) => a.category)).size
  const statusReport = assets.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <PageContainer>
      <EnterprisePageHeader title="Analytics" description="Fixed asset analytics — metrics, KPIs, and portfolio breakdowns" />

      <div style={{ background: "#1a1a2e", borderRadius: 12, padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Total Assets</div>
            <div style={{ color: "#e0e0e0", fontSize: 26, fontWeight: 700 }}>{aggregate.totalAssets}</div>
          </div>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Active Assets</div>
            <div style={{ color: "#22c55e", fontSize: 26, fontWeight: 700 }}>{aggregate.activeAssets}</div>
          </div>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Net Book Value</div>
            <div style={{ color: "#e0e0e0", fontSize: 26, fontWeight: 700 }}>${aggregate.totalNetBookValue.toLocaleString()}</div>
          </div>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#888", fontSize: 13 }}>Depreciation Ratio</div>
            <div style={{ color: "#eab308", fontSize: 26, fontWeight: 700 }}>{(aggregate.depreciationRatio * 100).toFixed(1)}%</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 20 }}>
            <h3 style={{ color: "#e0e0e0", fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Portfolio Health</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#aaa", fontSize: 13 }}>
                <span>Fully Depreciated</span>
                <span style={{ color: "#eab308" }}>{aggregate.fullyDepreciated} / {aggregate.totalAssets}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#aaa", fontSize: 13 }}>
                <span>Under Maintenance</span>
                <span style={{ color: "#eab308" }}>{aggregate.underMaintenance}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#aaa", fontSize: 13 }}>
                <span>Impaired</span>
                <span style={{ color: "#ef4444" }}>{aggregate.impaired}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#aaa", fontSize: 13 }}>
                <span>Utilization Rate</span>
                <span style={{ color: "#22c55e" }}>{(aggregate.assetUtilizationRate * 100).toFixed(0)}%</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#aaa", fontSize: 13 }}>
                <span>Maintenance Ratio</span>
                <span style={{ color: "#aaa" }}>{(aggregate.maintenanceRatio * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 20 }}>
            <h3 style={{ color: "#e0e0e0", fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Lifecycle</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#aaa", fontSize: 13 }}>
                <span>Avg Useful Life</span>
                <span style={{ color: "#e0e0e0" }}>{aggregate.averageUsefulLife.toFixed(1)} yrs</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#aaa", fontSize: 13 }}>
                <span>Avg Remaining Life</span>
                <span style={{ color: "#e0e0e0" }}>{aggregate.averageRemainingLife.toFixed(1)} yrs</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#aaa", fontSize: 13 }}>
                <span>Pending Acquisitions</span>
                <span style={{ color: "#3b82f6" }}>{aggregate.pendingAcquisition}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#aaa", fontSize: 13 }}>
                <span>Pending Capitalization</span>
                <span style={{ color: "#eab308" }}>{aggregate.pendingCapitalization}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#aaa", fontSize: 13 }}>
                <span>Departments / Categories</span>
                <span style={{ color: "#e0e0e0" }}>{deptCount} / {categoryCount}</span>
              </div>
            </div>
          </div>

          <div style={{ background: "#2a2a3e", borderRadius: 8, padding: 20 }}>
            <h3 style={{ color: "#e0e0e0", fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Financial</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#aaa", fontSize: 13 }}>
                <span>Total Cost</span>
                <span style={{ color: "#e0e0e0" }}>${aggregate.totalCost.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#aaa", fontSize: 13 }}>
                <span>Accumulated Depreciation</span>
                <span style={{ color: "#eab308" }}>${aggregate.totalAccumulatedDepreciation.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#aaa", fontSize: 13 }}>
                <span>Maintenance Cost</span>
                <span style={{ color: "#e0e0e0" }}>${aggregate.totalMaintenanceCost.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#aaa", fontSize: 13 }}>
                <span>Impairment Loss</span>
                <span style={{ color: "#ef4444" }}>${aggregate.totalImpairmentLoss.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#aaa", fontSize: 13 }}>
                <span>Revaluation Surplus</span>
                <span style={{ color: "#22c55e" }}>${aggregate.revaluationSurplus.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 style={{ color: "#e0e0e0", fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Status Distribution</h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {Object.entries(statusReport).map(([status, count]) => (
              <div key={status} style={{
                background: "#2a2a3e", borderRadius: 8, padding: "12px 16px",
                display: "flex", alignItems: "center", gap: 12, minWidth: 130,
              }}>
                <span style={{ color: "#aaa", fontSize: 13, textTransform: "capitalize" }}>{status}</span>
                <span style={{ color: "#e0e0e0", fontSize: 18, fontWeight: 700, marginLeft: "auto" }}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 style={{ color: "#e0e0e0", fontSize: 14, fontWeight: 600, marginBottom: 12 }}>KPIs</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {metrics.map((kpi) => (
              <div key={kpi.id} style={{ background: "#2a2a3e", borderRadius: 8, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#888", fontSize: 12 }}>{kpi.name}</span>
                  <span style={{
                    fontSize: 10, padding: "2px 6px", borderRadius: 4,
                    color: kpi.status === "onTrack" ? "#22c55e" : kpi.status === "atRisk" ? "#eab308" : "#ef4444",
                    background: kpi.status === "onTrack" ? "#052e16" : kpi.status === "atRisk" ? "#422006" : "#450a0a",
                  }}>{kpi.status}</span>
                </div>
                <div style={{ color: "#e0e0e0", fontSize: 18, fontWeight: 700, marginTop: 6 }}>
                  {kpi.value}{kpi.unit}
                </div>
                <div style={{ color: "#666", fontSize: 11, marginTop: 2 }}>
                  Target: {kpi.target}{kpi.unit}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
