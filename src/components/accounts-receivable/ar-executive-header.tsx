"use client"
import { motion } from "framer-motion"
import type { ARExecutiveMetricsProps } from "./ar-types"

function fmtCurrency(n: number): string { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) }

export function ARExecutiveHeader({ metrics }: ARExecutiveMetricsProps) {
  const items = [
    { label: "Total Outstanding", value: fmtCurrency(metrics.totalOutstanding), color: metrics.totalOutstanding > 0 ? "#d4a843" : "#22c55e" },
    { label: "Overdue", value: fmtCurrency(metrics.totalOverdue), color: metrics.totalOverdue > 0 ? "#ef4444" : "#22c55e" },
    { label: "DSO", value: metrics.dso.toFixed(1) + "d", color: metrics.dso > 45 ? "#ef4444" : "#d4a843" },
    { label: "Collection Eff.", value: metrics.cei.toFixed(0) + "%", color: metrics.cei >= 85 ? "#22c55e" : metrics.cei >= 70 ? "#d4a843" : "#ef4444" },
    { label: "Cash 30d Inflow", value: fmtCurrency(metrics.cashInflow30Days), color: "#d4a843" },
    { label: "High Risk Exposure", value: fmtCurrency(metrics.highRiskExposure), color: metrics.highRiskExposure > 0 ? "#ef4444" : "#22c55e" },
  ]
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
      {items.map((item, i) => (
        <div key={i} style={{ background: "#16213e", borderRadius: 8, padding: "16px 20px", borderLeft: `3px solid ${item.color}` }}>
          <div style={{ color: "#94a3b8", fontSize: 12, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{item.label}</div>
          <div style={{ color: item.color, fontSize: 22, fontWeight: 700, fontFamily: "ui-monospace, monospace" }}>{item.value}</div>
        </div>
      ))}
    </motion.div>
  )
}
