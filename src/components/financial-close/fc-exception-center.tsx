"use client"
import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import type { FCExceptionCenterProps } from "./fc-types"

const severityColors: Record<string, string> = { info: "#3b82f6", warning: "#eab308", critical: "#f97316", blocker: "#ef4444" }
const severityOrder = ["blocker", "critical", "warning", "info"]
const statusColors: Record<string, string> = { open: "#3b82f6", inProgress: "#eab308", resolved: "#22c55e", wontFix: "#64748b" }

export function FCExceptionCenter({ exceptions }: FCExceptionCenterProps) {
  const [filter, setFilter] = useState<string>("all")

  const filtered = useMemo(() => {
    let result = [...exceptions]
    if (filter !== "all") result = result.filter(e => e.severity === filter)
    return result.sort((a, b) => severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity))
  }, [exceptions, filter])

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {["all", ...severityOrder].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ background: filter === s ? (severityColors[s] ?? "#3b82f6") + "33" : "#16213e", color: filter === s ? (severityColors[s] ?? "#3b82f6") : "#94a3b8", border: `1px solid ${filter === s ? (severityColors[s] ?? "#3b82f6") : "#2a2a4a"}`, borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer", textTransform: "capitalize" }}>
            {s === "all" ? "All" : s}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div style={{ color: "#64748b", fontSize: 13, textAlign: "center", padding: 40 }}>No exceptions found</div>
      ) : (
        filtered.map((e, i) => (
          <motion.div key={e.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            style={{ background: "#1a1a2e", borderRadius: 8, padding: 16, marginBottom: 8, borderLeft: `3px solid ${severityColors[e.severity]}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ background: severityColors[e.severity] + "22", color: severityColors[e.severity], fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10, textTransform: "uppercase" }}>
                  {e.severity}
                </span>
                <span style={{ background: statusColors[e.status] + "22", color: statusColors[e.status], fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10, textTransform: "capitalize" }}>
                  {e.status === "inProgress" ? "In Progress" : e.status}
                </span>
              </div>
              <span style={{ fontSize: 11, color: "#64748b" }}>{new Date(e.createdAt).toLocaleDateString()}</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#e0e0e0", marginBottom: 4 }}>{e.title}</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>{e.description}</div>
            <div style={{ display: "flex", gap: 16, fontSize: 11, color: "#64748b" }}>
              <span>Category: <strong style={{ color: "#94a3b8", textTransform: "capitalize" }}>{e.category}</strong></span>
              {e.assignedTo && <span>Assigned to: <strong style={{ color: "#94a3b8" }}>{e.assignedTo}</strong></span>}
            </div>
          </motion.div>
        ))
      )}
    </div>
  )
}
