"use client"
import { motion } from "framer-motion"
import type { ARCreditDashboardProps } from "./ar-types"

const riskColors: Record<string, string> = { low: "#22c55e", medium: "#eab308", high: "#f97316", critical: "#ef4444" }

export function ARCreditDashboard({ creditLimits }: ARCreditDashboardProps) {
  const highRisk = creditLimits.filter(c => c.riskRating === "high" || c.riskRating === "critical")
  const totalExposure = creditLimits.reduce((s, c) => s + c.creditUsed, 0)
  const totalLimit = creditLimits.reduce((s, c) => s + c.creditLimit, 0)

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      <div style={{ background: "#1a1a2e", borderRadius: 8, padding: 20 }}>
        <div style={{ color: "#e0e0e0", fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Credit Utilization</div>
        {creditLimits.map((c, i) => {
          const pct = c.creditLimit > 0 ? (c.creditUsed / c.creditLimit) * 100 : 0
          return (
            <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: "#e0e0e0" }}>{c.customerName}</span>
                <span style={{ color: pct > 80 ? "#ef4444" : "#d4a843", fontFamily: "ui-monospace, monospace" }}>{pct.toFixed(0)}%</span>
              </div>
              <div style={{ background: "#2a2a4a", height: 6, borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: Math.min(pct, 100) + "%", height: "100%", background: pct > 80 ? "#ef4444" : pct > 60 ? "#eab308" : "#22c55e", borderRadius: 3 }} />
              </div>
            </motion.div>
          )
        })}
        <div style={{ marginTop: 16, padding: "12px 0", borderTop: "1px solid #2a2a4a", display: "flex", justifyContent: "space-between", fontSize: 13 }}>
          <span style={{ color: "#94a3b8" }}>Total Exposure</span>
          <span style={{ color: "#d4a843", fontFamily: "ui-monospace, monospace" }}>${totalExposure.toLocaleString()} / ${totalLimit.toLocaleString()}</span>
        </div>
      </div>
      <div style={{ background: "#1a1a2e", borderRadius: 8, padding: 20 }}>
        <div style={{ color: "#e0e0e0", fontWeight: 600, fontSize: 14, marginBottom: 16 }}>High Risk Customers</div>
        {highRisk.length > 0 ? highRisk.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
            style={{ padding: "12px 0", borderBottom: "1px solid #2a2a4a" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "#e0e0e0" }}>{c.customerName}</div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>Limit: ${c.creditLimit.toLocaleString()} | Used: ${c.creditUsed.toLocaleString()}</div>
              </div>
              <span style={{ background: riskColors[c.riskRating] + "22", color: riskColors[c.riskRating], fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10, textTransform: "uppercase" }}>
                {c.riskRating}
              </span>
            </div>
          </motion.div>
        )) : <div style={{ color: "#94a3b8", fontSize: 13, textAlign: "center", padding: 20 }}>No high-risk customers</div>}
      </div>
    </div>
  )
}
