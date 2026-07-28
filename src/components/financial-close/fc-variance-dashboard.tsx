"use client"
import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import type { FCVarianceDashboardProps } from "./fc-types"

const dirColors: Record<string, string> = { favorable: "#22c55e", unfavorable: "#ef4444", neutral: "#94a3b8" }
const dirIcons: Record<string, string> = { favorable: "\u25B2", unfavorable: "\u25BC", neutral: "\u25C6" }

export function FCVarianceDashboard({ variances }: FCVarianceDashboardProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const stats = useMemo(() => ({
    total: variances.length,
    significant: variances.filter(v => v.isSignificant).length,
    favorable: variances.filter(v => v.direction === "favorable").length,
    unfavorable: variances.filter(v => v.direction === "unfavorable").length,
  }), [variances])

  const sorted = useMemo(() => [...variances].sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance)), [variances])

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Variances", value: stats.total, color: "#94a3b8" },
          { label: "Significant", value: stats.significant, color: "#ef4444" },
          { label: "Favorable", value: stats.favorable, color: "#22c55e" },
          { label: "Unfavorable", value: stats.unfavorable, color: "#f97316" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            style={{ background: "#1a1a24", borderRadius: 8, padding: 16, textAlign: "center" }}>
            <div style={{ color: "#94a3b8", fontSize: 11, textTransform: "uppercase", marginBottom: 6 }}>{s.label}</div>
            <div style={{ color: s.color, fontSize: 28, fontWeight: 700, fontFamily: "ui-monospace, monospace" }}>{s.value}</div>
          </motion.div>
        ))}
      </div>
      {sorted.map((v, i) => (
        <motion.div key={v.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
          style={{
            background: "#1a1a24", borderRadius: 8, padding: 16, marginBottom: 8,
            borderLeft: `3px solid ${v.isSignificant ? "#ef4444" : dirColors[v.direction]}`,
            borderColor: v.isSignificant ? "#ef4444" : dirColors[v.direction],
            borderStyle: "solid", borderTop: "1px solid #2a2a4a", borderRight: "1px solid #2a2a4a", borderBottom: "1px solid #2a2a4a",
          }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, cursor: "pointer" }} onClick={() => setExpanded(prev => { const n = new Set(prev); n.has(v.id) ? n.delete(v.id) : n.add(v.id); return n })}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ color: dirColors[v.direction], fontSize: 16, fontWeight: 700 }}>{dirIcons[v.direction]}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#e0e0e0" }}>{v.accountName}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>{v.accountCode}</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, color: v.direction === "favorable" ? "#22c55e" : v.direction === "unfavorable" ? "#ef4444" : "#94a3b8", fontWeight: v.isSignificant ? 800 : 600 }}>
                {v.direction === "favorable" ? "+" : ""}${Math.abs(v.variance).toLocaleString()} ({v.variancePercent.toFixed(1)}%)
              </div>
              {v.isSignificant && <span style={{ background: "#ef444422", color: "#ef4444", fontSize: 9, fontWeight: 600, padding: "1px 6px", borderRadius: 8, textTransform: "uppercase", marginTop: 2, display: "inline-block" }}>Significant</span>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 24, fontSize: 12, color: "#94a3b8" }}>
            <span>Current: <strong style={{ color: "#d4af37" }}>${v.currentPeriodAmount.toLocaleString()}</strong></span>
            <span>Prior: <strong style={{ color: "#94a3b8" }}>${v.priorPeriodAmount.toLocaleString()}</strong></span>
          </div>
          {expanded.has(v.id) && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} style={{ marginTop: 8 }}>
              <textarea defaultValue={v.explanation ?? ""} placeholder="Add explanation..."
                style={{ width: "100%", background: "#16213e", color: "#e0e0e0", border: "1px solid #2a2a4a", borderRadius: 4, padding: 8, fontSize: 12, minHeight: 60, resize: "vertical" }} />
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  )
}
