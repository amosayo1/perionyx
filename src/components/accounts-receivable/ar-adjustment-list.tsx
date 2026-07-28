"use client"
import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import type { ARAdjustmentListProps } from "./ar-types"

const statusColors: Record<string, string> = { draft: "#64748b", pending: "#eab308", approved: "#22c55e", applied: "#3b82f6", rejected: "#ef4444", cancelled: "#6b7280" }
const typeLabels: Record<string, string> = { creditNote: "Credit Note", debitNote: "Debit Note", discount: "Discount", rebate: "Rebate", correction: "Correction", writeOff: "Write-off", promotional: "Promotional" }

export function ARAdjustmentList({ adjustments }: ARAdjustmentListProps) {
  const [typeFilter, setTypeFilter] = useState<string>("all")

  const filtered = useMemo(() => {
    let result = adjustments
    if (typeFilter !== "all") result = result.filter(a => a.type === typeFilter)
    return result
  }, [adjustments, typeFilter])

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {["all", ...new Set(adjustments.map(a => a.type))].map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            style={{ background: typeFilter === t ? "#3b82f6" : "#16213e", color: typeFilter === t ? "#fff" : "#94a3b8", border: "1px solid #2a2a4a", borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer", textTransform: "capitalize" }}>
            {t === "all" ? "All" : typeLabels[t] ?? t}
          </button>
        ))}
      </div>
      {filtered.map((adj, i) => (
        <motion.div key={adj.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
          style={{ background: "#1a1a24", borderRadius: 8, padding: 16, marginBottom: 8, borderLeft: `3px solid ${statusColors[adj.status]}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#e0e0e0" }}>{adj.adjustmentNumber}</span>
                <span style={{ background: statusColors[adj.status] + "22", color: statusColors[adj.status], fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10, textTransform: "uppercase" }}>
                  {adj.status}
                </span>
                <span style={{ color: "#94a3b8", fontSize: 11, fontFamily: "ui-monospace, monospace" }}>{typeLabels[adj.type] ?? adj.type}</span>
              </div>
              <div style={{ fontSize: 13, color: "#e0e0e0", marginTop: 4 }}>{adj.customerName}</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{adj.description}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: adj.type === "creditNote" || adj.type === "discount" ? "#22c55e" : "#d4af37", fontFamily: "ui-monospace, monospace" }}>
                {adj.type === "creditNote" || adj.type === "discount" ? "-" : "+"}${adj.amount.toLocaleString()}
              </div>
              <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                {adj.status === "pending" && <button style={{ background: "#22c55e", color: "#fff", border: "none", borderRadius: 4, padding: "2px 8px", fontSize: 10, cursor: "pointer" }}>Approve</button>}
                {adj.status === "pending" && <button style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 4, padding: "2px 8px", fontSize: 10, cursor: "pointer" }}>Reject</button>}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
