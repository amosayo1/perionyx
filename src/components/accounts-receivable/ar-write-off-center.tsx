"use client"
import { motion } from "framer-motion"
import type { ARWriteOffCenterProps } from "./ar-types"

const statusColors: Record<string, string> = { pending: "#eab308", approved: "#22c55e", applied: "#3b82f6", rejected: "#ef4444", cancelled: "#6b7280" }

export function ARWriteOffCenter({ writeOffs }: ARWriteOffCenterProps) {
  const totalByReason = writeOffs.reduce((acc, w) => { acc[w.reason] = (acc[w.reason] ?? 0) + w.writeOffAmount; return acc }, {} as Record<string, number>)
  const maxReason = Math.max(...Object.values(totalByReason), 1)

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <div style={{ background: "#1a1a24", borderRadius: 8, padding: 20 }}>
          <div style={{ color: "#e0e0e0", fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Write-offs by Reason</div>
          {Object.entries(totalByReason).map(([reason, amount]) => (
            <div key={reason} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: "#e0e0e0", textTransform: "capitalize" }}>{reason}</span>
                <span style={{ color: "#d4af37", fontFamily: "ui-monospace, monospace" }}>${amount.toLocaleString()}</span>
              </div>
              <div style={{ background: "#2a2a4a", height: 6, borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: (amount / maxReason) * 100 + "%", height: "100%", background: "#ef4444", borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: "#1a1a24", borderRadius: 8, padding: 20 }}>
          <div style={{ color: "#e0e0e0", fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Summary</div>
          {[
            { label: "Total Write-offs", value: "$" + writeOffs.reduce((s, w) => s + w.writeOffAmount, 0).toLocaleString() },
            { label: "Pending Approval", value: writeOffs.filter(w => w.status === "pending").length.toString() },
            { label: "Recovered Amount", value: "$" + writeOffs.reduce((s, w) => s + w.recoveryAmount, 0).toLocaleString() },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#94a3b8", padding: "8px 0", borderBottom: "1px solid #2a2a4a" }}>
              <span>{item.label}</span>
              <span style={{ color: "#e0e0e0", fontFamily: "ui-monospace, monospace" }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: "#1a1a24", borderRadius: 8, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 80px", gap: 8, padding: "12px 16px", background: "#16213e", borderBottom: "1px solid #2a2a4a", color: "#94a3b8", fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}>
          <span>Customer</span><span>Invoice</span><span>Amount</span><span>Reason</span><span>Status</span>
        </div>
        {writeOffs.map((w, i) => (
          <motion.div key={w.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 80px", gap: 8, padding: "12px 16px", borderBottom: "1px solid #2a2a4a", alignItems: "center", fontSize: 13, color: "#e0e0e0" }}>
            <div>{w.customerName}</div>
            <div style={{ fontFamily: "ui-monospace, monospace", color: "#94a3b8" }}>{w.invoiceNumber}</div>
            <div style={{ fontFamily: "ui-monospace, monospace", color: "#d4af37" }}>${w.writeOffAmount.toLocaleString()}</div>
            <div style={{ fontSize: 12, color: "#94a3b8", textTransform: "capitalize" }}>{w.reason}</div>
            <span style={{ background: statusColors[w.status] + "22", color: statusColors[w.status], fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 10, textAlign: "center" }}>
              {w.status}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
