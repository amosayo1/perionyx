"use client"
import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import type { ARRecommendationsPanelProps } from "./ar-types"

const priorityColors: Record<string, string> = { critical: "#ef4444", high: "#f97316", medium: "#eab308", low: "#6b7280" }
const typeIcons: Record<string, string> = { collection: "$", credit: "C", dispute: "D", writeOff: "W", discount: "%", paymentPlan: "P", riskAlert: "!", process: "~", customer: "@" }

export function RecommendationsPanel({ recommendations }: ARRecommendationsPanelProps) {
  const [filter, setFilter] = useState<string>("all")
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    let result = recommendations.filter(r => !dismissed.has(r.id) && r.status === "active")
    if (filter !== "all") result = result.filter(r => r.type === filter)
    return result.sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3 }
      return (order[a.priority] ?? 4) - (order[b.priority] ?? 4)
    })
  }, [recommendations, filter, dismissed])

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {["all", "collection", "credit", "dispute", "writeOff", "riskAlert"].map(t => (
          <button key={t} onClick={() => setFilter(t)}
            style={{ background: filter === t ? "#3b82f6" : "#16213e", color: filter === t ? "#fff" : "#94a3b8", border: "1px solid #2a2a4a", borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer", textTransform: "capitalize" }}>
            {t === "all" ? "All" : t.replace(/([A-Z])/g, " $1")}
          </button>
        ))}
      </div>
      {filtered.map((rec, i) => (
        <motion.div key={rec.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
          style={{ background: "#1a1a2e", borderRadius: 8, padding: 16, marginBottom: 8, borderLeft: `3px solid ${priorityColors[rec.priority]}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: priorityColors[rec.priority] + "22", display: "flex", alignItems: "center", justifyContent: "center", color: priorityColors[rec.priority], fontSize: 14, fontWeight: 700 }}>
                {typeIcons[rec.type] ?? "?"}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#e0e0e0" }}>{rec.title}</div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4, maxWidth: 500 }}>{rec.description}</div>
              </div>
            </div>
            <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
              <span style={{ background: priorityColors[rec.priority] + "22", color: priorityColors[rec.priority], fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10, textTransform: "uppercase" }}>
                {rec.priority}
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#d4a843", fontFamily: "ui-monospace, monospace" }}>
                ${rec.impact.toLocaleString()}
              </span>
              <span style={{ fontSize: 11, color: "#64748b", textTransform: "capitalize" }}>{rec.effort} effort</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={() => setDismissed(prev => new Set(prev).add(rec.id))}
              style={{ background: "#22c55e", color: "#fff", border: "none", borderRadius: 4, padding: "4px 12px", fontSize: 11, fontWeight: 500, cursor: "pointer" }}>
              Implement
            </button>
            <button onClick={() => setDismissed(prev => new Set(prev).add(rec.id))}
              style={{ background: "transparent", color: "#94a3b8", border: "1px solid #2a2a4a", borderRadius: 4, padding: "4px 12px", fontSize: 11, cursor: "pointer" }}>
              Dismiss
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
