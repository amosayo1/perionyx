"use client"
import { motion } from "framer-motion"
import type { ARKPIDashboardProps, ARKPI } from "./ar-types"

const statusColors: Record<string, string> = { onTrack: "#22c55e", atRisk: "#eab308", critical: "#ef4444", exceeding: "#22c55e" }
const trendIcons: Record<string, string> = { up: "\u2191", down: "\u2193", stable: "\u2192" }

export function ARKPIDashboard({ kpis }: ARKPIDashboardProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
      {kpis.map((kpi, i) => (
        <motion.div key={kpi.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
          style={{ background: "#1a1a24", borderRadius: 8, padding: 20, borderTop: `3px solid ${statusColors[kpi.status]}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div style={{ color: "#94a3b8", fontSize: 13, fontWeight: 500 }}>{kpi.name}</div>
            <span style={{ background: statusColors[kpi.status] + "22", color: statusColors[kpi.status], fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10, textTransform: "uppercase" }}>
              {kpi.status}
            </span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#ffffff", fontFamily: "ui-monospace, monospace", marginBottom: 8 }}>
            {kpi.unit === "USD" || kpi.unit === "%" ? kpi.unit === "USD" ? "$" + kpi.value.toLocaleString() : kpi.value.toFixed(1) + "%" : kpi.value.toFixed(1) + " " + kpi.unit}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#64748b", fontSize: 12 }}>Target: {kpi.unit === "USD" ? "$" + kpi.target.toLocaleString() : kpi.target + (kpi.unit === "%" ? "%" : " " + kpi.unit)}</span>
            <span style={{ color: kpi.trend === "up" ? (kpi.category === "efficiency" ? "#22c55e" : "#ef4444") : kpi.trend === "down" ? (kpi.category === "efficiency" ? "#ef4444" : "#22c55e") : "#94a3b8", fontSize: 14, fontWeight: 600 }}>
              {trendIcons[kpi.trend]} {kpi.changePercent > 0 ? "+" : ""}{kpi.changePercent.toFixed(1)}%
            </span>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
