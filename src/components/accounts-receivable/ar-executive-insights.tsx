"use client"
import { motion } from "framer-motion"
import type { ARExecutiveMetricsProps } from "./ar-types"

export function ARExecutiveInsights({ metrics }: ARExecutiveMetricsProps) {
  const insights = [
    { title: "DSO Trending Up", message: `DSO at ${metrics.dso.toFixed(1)} days is above target. Focus on reducing overdue invoices over 60 days.`, severity: metrics.dso > 45 ? "warning" : "info" },
    { title: "Collection Efficiency", message: `CEI at ${metrics.cei.toFixed(1)}%. ${metrics.cei < 80 ? "Consider reviewing collection processes for improvement opportunities." : "Collection performance is within acceptable range."}`, severity: metrics.cei < 80 ? "warning" : "info" },
    { title: "Cash Inflow Outlook", message: `Expected cash inflow of $${metrics.cashInflow30Days.toLocaleString()} in next 30 days, $${metrics.cashInflow60Days.toLocaleString()} in 60 days.`, severity: "info" },
    {
      title: "Risk Exposure", message: `High risk exposure at $${metrics.highRiskExposure.toLocaleString()}. ${metrics.highRiskExposure > 0 ? "Monitor closely and review credit limits." : "No high-risk exposure detected."}`,
      severity: metrics.highRiskExposure > 500000 ? "critical" : metrics.highRiskExposure > 0 ? "warning" : "info",
    },
  ]

  const severityIcons: Record<string, string> = { info: "\u2139\uFE0F", warning: "\u26A0\uFE0F", critical: "\uD83D\uDEA8" }

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 20 }}>
        {[
          { label: "Total Outstanding", value: "$" + metrics.totalOutstanding.toLocaleString(), color: "#d4af37" },
          { label: "Total Overdue", value: "$" + metrics.totalOverdue.toLocaleString(), color: metrics.totalOverdue > 0 ? "#ef4444" : "#22c55e" },
          { label: "Active Collections", value: metrics.activeCollections.toString(), color: metrics.activeCollections > 0 ? "#f97316" : "#22c55e" },
          { label: "Disputed Amount", value: "$" + metrics.totalDisputed.toLocaleString(), color: metrics.totalDisputed > 0 ? "#eab308" : "#22c55e" },
        ].map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
            style={{ background: "#1a1a24", borderRadius: 8, padding: 20, textAlign: "center" }}>
            <div style={{ color: "#94a3b8", fontSize: 12, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{item.label}</div>
            <div style={{ color: item.color, fontSize: 28, fontWeight: 700, fontFamily: "ui-monospace, monospace" }}>{item.value}</div>
          </motion.div>
        ))}
      </div>
      <div style={{ background: "#1a1a24", borderRadius: 8, padding: 20 }}>
        <div style={{ color: "#e0e0e0", fontWeight: 600, fontSize: 14, marginBottom: 16 }}>AI Insights</div>
        {insights.map((insight, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
            style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: i < insights.length - 1 ? "1px solid #2a2a4a" : "none" }}>
            <div style={{ fontSize: 18 }}>{severityIcons[insight.severity] ?? "\u2139\uFE0F"}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#e0e0e0", marginBottom: 4 }}>{insight.title}</div>
              <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>{insight.message}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
