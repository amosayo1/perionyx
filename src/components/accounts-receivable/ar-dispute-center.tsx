"use client"
import { motion } from "framer-motion"
import type { ARDisputeCenterProps } from "./ar-types"

const statusColors: Record<string, string> = { open: "#3b82f6", investigating: "#eab308", resolved: "#22c55e", rejected: "#ef4444", cancelled: "#6b7280" }

export function ARDisputeCenter({ disputes }: ARDisputeCenterProps) {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12, marginBottom: 20 }}>
        {["open", "investigating", "resolved", "rejected"].map(s => {
          const count = disputes.filter(d => d.status === s).length
          return (
            <div key={s} style={{ background: "#1a1a24", borderRadius: 8, padding: 16, textAlign: "center", borderTop: `3px solid ${statusColors[s]}` }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: statusColors[s], fontFamily: "ui-monospace, monospace" }}>{count}</div>
              <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", marginTop: 4 }}>{s}</div>
            </div>
          )
        })}
      </div>
      {disputes.map((d, i) => (
        <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
          style={{ background: "#1a1a24", borderRadius: 8, padding: 16, marginBottom: 8, borderLeft: `3px solid ${statusColors[d.status]}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#e0e0e0" }}>{d.disputeNumber} - {d.customerName}</div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>Invoice: {d.invoiceNumber} | Reason: {d.reason}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#d4af37", fontFamily: "ui-monospace, monospace" }}>${d.amount.toLocaleString()}</div>
              <span style={{ background: statusColors[d.status] + "22", color: statusColors[d.status], fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10, textTransform: "uppercase" }}>
                {d.status}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "#94a3b8" }}>
            <span>Assigned: {d.assignedTo ?? "Unassigned"} | Days open: {Math.floor((Date.now() - new Date(d.createdAt).getTime()) / 86400000)}</span>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
