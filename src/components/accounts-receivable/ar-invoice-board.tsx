"use client"
import { useMemo } from "react"
import { motion } from "framer-motion"
import type { ARInvoiceBoardProps, Invoice } from "./ar-types"

const statusBorderColors: Record<string, string> = { draft: "#64748b", pending: "#94a3b8", approved: "#3b82f6", sent: "#3b82f6", partial: "#eab308", paid: "#22c55e", overdue: "#ef4444", disputed: "#f97316", writeOff: "#6b7280", cancelled: "#6b7280", void: "#6b7280" }
const statusLabels: Record<string, string> = { sent: "Sent", overdue: "Overdue", disputed: "Disputed", partial: "Partial", draft: "Draft" }

export function ARInvoiceBoard({ invoices, onSelect }: ARInvoiceBoardProps) {
  const groups = useMemo(() => {
    const g: Record<string, Invoice[]> = {}
    for (const s of ["draft", "sent", "overdue", "disputed", "partial"]) {
      g[s] = invoices.filter(i => i.status === s)
    }
    return g
  }, [invoices])

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
      {Object.entries(groups).map(([status, items]) => (
        <div key={status} style={{ background: "#1a1a2e", borderRadius: 8, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingBottom: 8, borderBottom: `2px solid ${statusBorderColors[status]}` }}>
            <span style={{ color: statusBorderColors[status], fontWeight: 600, fontSize: 14, textTransform: "uppercase" }}>{statusLabels[status] ?? status}</span>
            <span style={{ background: statusBorderColors[status] + "22", color: statusBorderColors[status], fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 12 }}>{items.length}</span>
          </div>
          {items.map((inv, i) => (
            <motion.div key={inv.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              onClick={() => onSelect?.(inv)}
              style={{ background: "#16213e", borderRadius: 6, padding: 12, marginBottom: 8, cursor: onSelect ? "pointer" : "default", borderLeft: `3px solid ${statusBorderColors[inv.status]}` }}>
              <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "ui-monospace, monospace", marginBottom: 4 }}>{inv.invoiceNumber}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#e0e0e0", marginBottom: 4 }}>{inv.customerName}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#d4a843", fontFamily: "ui-monospace, monospace", marginBottom: 6 }}>${inv.amountDue.toLocaleString()}</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8" }}>
                <span>Due: {new Date(inv.dueDate).toLocaleDateString()}</span>
                {inv.daysOverdue > 0 && <span style={{ color: "#ef4444" }}>{inv.daysOverdue}d overdue</span>}
              </div>
            </motion.div>
          ))}
          {items.length === 0 && <div style={{ color: "#64748b", fontSize: 12, textAlign: "center", padding: 20 }}>No invoices</div>}
        </div>
      ))}
    </div>
  )
}
