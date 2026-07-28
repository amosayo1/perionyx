"use client"
import { motion } from "framer-motion"
import type { ARTrendWidgetProps } from "./ar-types"

function formatValue(value: number, format?: string): string {
  switch (format) {
    case "currency": return "$" + value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    case "percentage": return value.toFixed(1) + "%"
    case "days": return value.toFixed(0) + "d"
    default: return value.toLocaleString()
  }
}

export function ARTrendWidget({ label, value, previousValue, format, trend, icon }: ARTrendWidgetProps) {
  const change = previousValue > 0 ? ((value - previousValue) / previousValue) * 100 : 0
  const isPositive = trend === "up"
  const isNegative = trend === "down"

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: "#1a1a24", borderRadius: 8, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", minWidth: 180 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
          <span style={{ color: "#94a3b8", fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</span>
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#e0e0e0", fontFamily: "ui-monospace, monospace" }}>{formatValue(value, format)}</div>
        <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>Previous: {formatValue(previousValue, format)}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <span style={{ fontSize: 20, color: isPositive ? "#22c55e" : isNegative ? "#ef4444" : "#94a3b8" }}>
          {isPositive ? "\u2191" : isNegative ? "\u2193" : "\u2192"}
        </span>
        <span style={{ fontSize: 11, color: isPositive ? "#22c55e" : isNegative ? "#ef4444" : "#94a3b8", fontWeight: 600 }}>
          {change > 0 ? "+" : ""}{change.toFixed(1)}%
        </span>
      </div>
    </motion.div>
  )
}
