"use client"
import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { ARAlertsPanelProps } from "./ar-types"

const severityColors: Record<string, string> = { info: "#3b82f6", warning: "#eab308", critical: "#f97316", emergency: "#ef4444" }
const severityOrder = ["emergency", "critical", "warning", "info"]
const typeColors: Record<string, string> = { payment: "#22c55e", credit: "#eab308", collection: "#f97316", dispute: "#ef4444", aging: "#3b82f6", forecast: "#8b5cf6", compliance: "#06b6d4", system: "#64748b" }

export function ARAlertsPanel({ alerts }: ARAlertsPanelProps) {
  const [filter, setFilter] = useState<string>("all")
  const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    let result = alerts.filter(a => !acknowledged.has(a.id))
    if (filter !== "all") result = result.filter(a => a.severity === filter)
    return result.sort((a, b) => severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity))
  }, [alerts, filter, acknowledged])

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["all", "emergency", "critical", "warning", "info"].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ background: filter === s ? (severityColors[s] ?? "#3b82f6") + "33" : "#16213e", color: filter === s ? (severityColors[s] ?? "#3b82f6") : "#94a3b8", border: `1px solid ${filter === s ? (severityColors[s] ?? "#3b82f6") : "#2a2a4a"}`, borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer", textTransform: "capitalize" }}>
            {s === "all" ? "All" : s}
          </button>
        ))}
      </div>
      <AnimatePresence>
        {filtered.map((alert, i) => (
          <motion.div key={alert.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ delay: i * 0.02 }}
            style={{ background: "#1a1a2e", borderRadius: 8, padding: 16, marginBottom: 8, borderLeft: `3px solid ${severityColors[alert.severity]}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ background: typeColors[alert.type] + "22", color: typeColors[alert.type], fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10, textTransform: "uppercase" }}>
                    {alert.type}
                  </span>
                  <span style={{ background: severityColors[alert.severity] + "22", color: severityColors[alert.severity], fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10, textTransform: "uppercase" }}>
                    {alert.severity}
                  </span>
                  <span style={{ fontSize: 11, color: "#64748b" }}>{new Date(alert.createdAt).toLocaleString()}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#e0e0e0", marginTop: 6 }}>{alert.title}</div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{alert.message}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button onClick={() => setAcknowledged(prev => new Set(prev).add(alert.id))}
                style={{ background: "#3b82f6", color: "#fff", border: "none", borderRadius: 4, padding: "4px 12px", fontSize: 11, fontWeight: 500, cursor: "pointer" }}>
                Acknowledge
              </button>
              <button style={{ background: "transparent", color: "#94a3b8", border: "1px solid #2a2a4a", borderRadius: 4, padding: "4px 12px", fontSize: 11, cursor: "pointer" }}>
                View Details
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
