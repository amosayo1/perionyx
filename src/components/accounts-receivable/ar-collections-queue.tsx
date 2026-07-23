"use client"
import { useMemo } from "react"
import { motion } from "framer-motion"
import type { ARCollectionsQueueProps, CollectionRecord } from "./ar-types"

const priorityOrder = ["urgent", "high", "medium", "low"]
const priorityColors: Record<string, string> = { urgent: "#ef4444", high: "#f97316", medium: "#eab308", low: "#6b7280" }

export function ARCollectionsQueue({ collections }: ARCollectionsQueueProps) {
  const groups = useMemo(() => {
    const g: Record<string, CollectionRecord[]> = {}
    for (const p of priorityOrder) g[p] = collections.filter(c => c.priority === p)
    return g
  }, [collections])

  return (
    <div>
      {priorityOrder.map(priority => {
        const items = groups[priority] ?? []
        if (items.length === 0) return null
        return (
          <div key={priority} style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: priorityColors[priority] }} />
              <span style={{ color: "#e0e0e0", fontWeight: 600, fontSize: 14, textTransform: "uppercase" }}>{priority}</span>
              <span style={{ color: "#94a3b8", fontSize: 12 }}>({items.length})</span>
            </div>
            {items.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                style={{ background: "#1a1a2e", borderRadius: 8, padding: 16, marginBottom: 8, borderLeft: `3px solid ${priorityColors[c.priority]}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#e0e0e0" }}>{c.customerName}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>{c.invoiceNumber} - {c.daysOverdue} days overdue</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#d4a843", fontFamily: "ui-monospace, monospace" }}>${c.amountDue.toLocaleString()}</div>
                    <span style={{ background: priorityColors[c.priority] + "22", color: priorityColors[c.priority], fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10, textTransform: "uppercase" }}>
                      {c.priority}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "#94a3b8" }}>
                  <span>Collector: {c.collector}</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ background: "#3b82f6", color: "#fff", border: "none", borderRadius: 4, padding: "4px 10px", fontSize: 11, fontWeight: 500, cursor: "pointer" }}>Email</button>
                    <button style={{ background: "#f97316", color: "#fff", border: "none", borderRadius: 4, padding: "4px 10px", fontSize: 11, fontWeight: 500, cursor: "pointer" }}>Call</button>
                    {c.priority === "high" || c.priority === "urgent" ? <button style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 4, padding: "4px 10px", fontSize: 11, fontWeight: 500, cursor: "pointer" }}>Escalate</button> : null}
                  </div>
                </div>
                {c.promiseToPay && <div style={{ marginTop: 8, fontSize: 12, color: "#eab308" }}>PTP: {new Date(c.promiseToPay).toLocaleDateString()} - ${c.promiseAmount?.toLocaleString()}</div>}
              </motion.div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
