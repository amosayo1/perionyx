"use client"
import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import type { FCApprovalQueueProps } from "./fc-types"

const statusColors: Record<string, string> = { pending: "#3b82f6", approved: "#22c55e", rejected: "#ef4444", escalated: "#f97316" }
const entityLabels: Record<string, string> = { task: "Task", reconciliation: "Reconciliation", journal: "Journal Entry", adjustment: "Adjustment", reopen: "Reopen", close: "Close" }

export function FCApprovalQueue({ approvals }: FCApprovalQueueProps) {
  const [actioned, setActioned] = useState<Set<string>>(new Set())

  const groups = useMemo(() => {
    const g: Record<string, typeof approvals> = {}
    for (const a of approvals) {
      if (!g[a.entityType]) g[a.entityType] = []
      g[a.entityType].push(a)
    }
    return g
  }, [approvals])

  const visible = useMemo(() => {
    const result: Record<string, typeof approvals> = {}
    for (const [key, items] of Object.entries(groups)) {
      result[key] = items.filter(a => !actioned.has(a.id) && a.status === "pending")
    }
    return result
  }, [groups, actioned])

  const handleAction = (id: string) => setActioned(prev => new Set(prev).add(id))

  return (
    <div>
      {Object.entries(visible).map(([entityType, items]) =>
        items.length > 0 ? (
          <div key={entityType} style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ color: "#e0e0e0", fontWeight: 600, fontSize: 14, textTransform: "capitalize" }}>{entityLabels[entityType] ?? entityType}</span>
              <span style={{ color: "#94a3b8", fontSize: 12 }}>({items.length})</span>
            </div>
            {items.map((a, i) => (
              <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                style={{ background: "#1a1a24", borderRadius: 8, padding: 16, marginBottom: 8, border: "1px solid #2a2a4a", borderLeft: `3px solid ${statusColors[a.status]}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#e0e0e0" }}>{a.entityDescription}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                      Requested by {a.requestedBy} &middot; {new Date(a.requestedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ background: statusColors[a.status] + "22", color: statusColors[a.status], fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10, textTransform: "capitalize" }}>{a.status}</span>
                    {a.escalationLevel > 0 && <span style={{ background: "#f9731622", color: "#f97316", fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10 }}>Lvl {a.escalationLevel}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => handleAction(a.id)} style={{ background: "#22c55e", color: "#fff", border: "none", borderRadius: 4, padding: "6px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>Approve</button>
                  <button onClick={() => handleAction(a.id)} style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 4, padding: "6px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>Reject</button>
                  <button onClick={() => handleAction(a.id)} style={{ background: "#f97316", color: "#fff", border: "none", borderRadius: 4, padding: "6px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>Escalate</button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : null
      )}
      {Object.keys(visible).length === 0 && <div style={{ color: "#64748b", fontSize: 13, textAlign: "center", padding: 40 }}>No pending approvals</div>}
    </div>
  )
}
