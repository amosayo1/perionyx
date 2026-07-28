"use client"
import { useMemo } from "react"
import { motion } from "framer-motion"
import type { IntercompanyReconciliation } from "./fc-types"

export interface FCIntercompanyGridProps {
  icRecs: IntercompanyReconciliation[]
}

const matchStatusColors: Record<string, string> = { matched: "#22c55e", unmatched: "#ef4444", inProgress: "#eab308", pending: "#3b82f6", adjusted: "#8b5cf6", approved: "#22c55e", failed: "#ef4444" }

export function FCIntercompanyGrid({ icRecs }: FCIntercompanyGridProps) {
  const maxBalance = useMemo(() => Math.max(...icRecs.map(r => Math.max(Math.abs(r.fromBalance), Math.abs(r.toBalance))), 1), [icRecs])

  return (
    <div>
      {icRecs.length === 0 ? (
        <div style={{ color: "#64748b", fontSize: 13, textAlign: "center", padding: 40 }}>No intercompany reconciliations</div>
      ) : (
        icRecs.map((rec, i) => (
          <motion.div key={rec.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            style={{ background: "#1a1a24", borderRadius: 8, padding: 16, marginBottom: 12, border: "1px solid #2a2a4a" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#e0e0e0" }}>
                  {rec.fromEntity} <span style={{ color: "#64748b" }}>&rarr;</span> {rec.toEntity}
                </div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{rec.currency} {rec.fxRate !== 1 && `@ ${rec.fxRate}`}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ background: matchStatusColors[rec.status] + "22", color: matchStatusColors[rec.status], fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10, textTransform: "capitalize" }}>
                  {rec.status}
                </span>
                <span style={{ color: rec.difference === 0 ? "#22c55e" : "#ef4444", fontSize: 13, fontWeight: 700, fontFamily: "ui-monospace, monospace" }}>
                  {rec.difference === 0 ? "Balanced" : `${rec.difference > 0 ? "+" : ""}$${rec.difference.toLocaleString()}`}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>
                <span>{rec.fromEntity}</span>
                <span>{rec.toEntity}</span>
              </div>
              <div style={{ position: "relative", height: 24, background: "#16213e", borderRadius: 4, overflow: "hidden", marginBottom: 2 }}>
                <div style={{ height: "100%", width: `${Math.abs(rec.fromBalance) / maxBalance * 100}%`, background: "#d4af3755", borderRadius: 4, transition: "width 0.3s", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 4 }}>
                  <span style={{ fontSize: 10, color: "#e0e0e0", fontWeight: 600, fontFamily: "ui-monospace, monospace" }}>${rec.fromBalance.toLocaleString()}</span>
                </div>
              </div>
              <div style={{ position: "relative", height: 24, background: "#16213e", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.abs(rec.toBalance) / maxBalance * 100}%`, background: "#3b82f655", borderRadius: 4, transition: "width 0.3s", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 4 }}>
                  <span style={{ fontSize: 10, color: "#e0e0e0", fontWeight: 600, fontFamily: "ui-monospace, monospace" }}>${rec.toBalance.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {rec.items.length > 0 && (
              <div>
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Matching Items</div>
                {rec.items.map(item => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", background: "#16213e", borderRadius: 4, marginBottom: 4, fontSize: 12 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ color: item.cleared ? "#22c55e" : "#eab308", fontSize: 10 }}>{item.cleared ? "\u25CF" : "\u25CB"}</span>
                      <div>
                        <span style={{ color: "#e0e0e0" }}>{item.description}</span>
                        {item.matchKey && <span style={{ color: "#64748b", marginLeft: 6 }}>#{item.matchKey}</span>}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 12, fontFamily: "ui-monospace, monospace" }}>
                      <span style={{ color: "#d4af37" }}>${item.fromAmount.toLocaleString()}</span>
                      <span style={{ color: "#3b82f6" }}>${item.toAmount.toLocaleString()}</span>
                      <span style={{ color: item.difference === 0 ? "#22c55e" : "#ef4444" }}>{item.difference === 0 ? "\u2713" : `$${item.difference.toLocaleString()}`}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))
      )}
    </div>
  )
}
