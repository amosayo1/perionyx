"use client"
import { motion } from "framer-motion"
import type { ARCashApplicationProps } from "./ar-types"

export function ARCashApplicationCenter({ applications, receipts, invoices }: ARCashApplicationProps) {
  const unappliedReceipts = receipts.filter(r => r.status === "unapplied" || r.status === "onAccount")
  const totalUnapplied = unappliedReceipts.reduce((s, r) => s + r.amount, 0)
  const matchingRate = receipts.length > 0 ? (receipts.filter(r => r.status === "applied").length / receipts.length) * 100 : 0

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
        {[
          { label: "Total Unapplied", value: "$" + totalUnapplied.toLocaleString(), color: totalUnapplied > 0 ? "#eab308" : "#22c55e" },
          { label: "Matching Rate", value: matchingRate.toFixed(0) + "%", color: matchingRate >= 90 ? "#22c55e" : matchingRate >= 70 ? "#eab308" : "#ef4444" },
          { label: "Pending Receipts", value: unappliedReceipts.length.toString(), color: unappliedReceipts.length > 0 ? "#d4af37" : "#22c55e" },
        ].map((item, i) => (
          <div key={i} style={{ background: "#1a1a24", borderRadius: 8, padding: 16, borderLeft: `3px solid ${item.color}` }}>
            <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 6 }}>{item.label}</div>
            <div style={{ color: item.color, fontSize: 24, fontWeight: 700, fontFamily: "ui-monospace, monospace" }}>{item.value}</div>
          </div>
        ))}
      </div>
      <div style={{ background: "#1a1a24", borderRadius: 8, padding: 16 }}>
        <div style={{ color: "#e0e0e0", fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Unapplied Receipts</div>
        {unappliedReceipts.length > 0 ? unappliedReceipts.map((r, i) => (
          <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #2a2a4a" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: "#e0e0e0" }}>{r.receiptNumber}</div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>{r.customerName} - {new Date(r.receiptDate).toLocaleDateString()}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#d4af37", fontFamily: "ui-monospace, monospace" }}>${r.amount.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>{r.paymentMethod}</div>
            </div>
          </motion.div>
        )) : <div style={{ color: "#94a3b8", textAlign: "center", padding: 20 }}>All receipts applied</div>}
      </div>
    </div>
  )
}
