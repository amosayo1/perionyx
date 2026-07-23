"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { ARStatementViewProps } from "./ar-types"

const statusColors: Record<string, string> = { generated: "#3b82f6", sent: "#eab308", paid: "#22c55e", partial: "#f97316" }

export function ARCustomerStatements({ statements }: ARStatementViewProps) {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div>
      {statements.length > 0 ? statements.map((s, i) => (
        <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
          style={{ background: "#1a1a2e", borderRadius: 8, marginBottom: 8, overflow: "hidden" }}>
          <div onClick={() => setExpanded(expanded === s.id ? null : s.id)}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16, cursor: "pointer" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#e0e0e0" }}>{s.customerName}</div>
              <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "ui-monospace, monospace" }}>{s.statementNumber}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#d4a843", fontFamily: "ui-monospace, monospace" }}>${s.endingBalance.toLocaleString()}</div>
              <span style={{ background: statusColors[s.status] + "22", color: statusColors[s.status], fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10, textTransform: "uppercase" }}>
                {s.status}
              </span>
            </div>
          </div>
          <AnimatePresence>
            {expanded === s.id && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                style={{ borderTop: "1px solid #2a2a4a", padding: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
                  <div><div style={{ color: "#94a3b8", fontSize: 11 }}>Beginning</div><div style={{ color: "#e0e0e0", fontFamily: "ui-monospace, monospace", fontSize: 13 }}>${s.beginningBalance.toLocaleString()}</div></div>
                  <div><div style={{ color: "#94a3b8", fontSize: 11 }}>Invoiced</div><div style={{ color: "#3b82f6", fontFamily: "ui-monospace, monospace", fontSize: 13 }}>+${s.invoiceTotal.toLocaleString()}</div></div>
                  <div><div style={{ color: "#94a3b8", fontSize: 11 }}>Payments</div><div style={{ color: "#22c55e", fontFamily: "ui-monospace, monospace", fontSize: 13 }}>-${s.paymentTotal.toLocaleString()}</div></div>
                  <div><div style={{ color: "#94a3b8", fontSize: 11 }}>Adjustments</div><div style={{ color: "#eab308", fontFamily: "ui-monospace, monospace", fontSize: 13 }}>${s.adjustmentTotal.toLocaleString()}</div></div>
                </div>
                <div>
                  <div style={{ color: "#94a3b8", fontSize: 11, marginBottom: 8, textTransform: "uppercase" }}>Line Items</div>
                  {s.lines.map((line, li) => (
                    <div key={li} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #2a2a4a", fontSize: 12 }}>
                      <span style={{ color: "#e0e0e0" }}>{line.invoiceNumber} - {new Date(line.invoiceDate).toLocaleDateString()}</span>
                      <span style={{ color: "#d4a843", fontFamily: "ui-monospace, monospace" }}>${line.outstanding.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )) : <div style={{ color: "#94a3b8", textAlign: "center", padding: 40 }}>No statements available</div>}
    </div>
  )
}
