"use client"
import { useMemo } from "react"
import { motion } from "framer-motion"
import type { CloseCalendarEntry } from "./fc-types"

export interface FCCloseTimelineProps {
  entries: CloseCalendarEntry[]
}

const typeIcons: Record<string, string> = { deadline: "\u23F0", meeting: "\uD83D\uDC65", review: "\uD83D\uDD0D", approval: "\u2714\uFE0F", lock: "\uD83D\uDD12", reminder: "\u23F3" }
const typeColors: Record<string, string> = { deadline: "#ef4444", meeting: "#8b5cf6", review: "#3b82f6", approval: "#22c55e", lock: "#64748b", reminder: "#eab308" }

export function FCCloseTimeline({ entries }: FCCloseTimelineProps) {
  const sorted = useMemo(() => [...entries].sort((a, b) => a.date.getTime() - b.date.getTime()), [entries])

  const now = new Date()

  return (
    <div style={{ position: "relative", paddingLeft: 32 }}>
      <div style={{ position: "absolute", left: 14, top: 0, bottom: 0, width: 2, background: "#2a2a4a" }} />
      {sorted.length === 0 ? (
        <div style={{ color: "#64748b", fontSize: 13, textAlign: "center", padding: 40 }}>No calendar entries</div>
      ) : (
        sorted.map((entry, i) => {
          const isPast = entry.date < now
          const isCurrent = !isPast && i > 0 && sorted[i - 1].date < now
          const isToday = entry.date.toDateString() === now.toDateString()
          const statusColor = isToday ? "#3b82f6" : isPast ? "#22c55e" : "#6b7280"

          return (
            <motion.div key={entry.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              style={{ position: "relative", paddingBottom: 20, paddingLeft: 20 }}>
              <div style={{ position: "absolute", left: -26, top: 4, width: 12, height: 12, borderRadius: "50%", background: statusColor, border: `2px solid ${isToday ? "#3b82f6" : isPast ? "#22c55e" : "#2a2a4a"}`, zIndex: 1 }} />
              {i < sorted.length - 1 && (
                <div style={{ position: "absolute", left: -21, top: 16, width: 2, height: "calc(100% - 4px)", background: isPast ? "#22c55e33" : "#2a2a4a", zIndex: 0 }} />
              )}
              <div style={{ background: "#1a1a2e", borderRadius: 8, padding: 14, border: `1px solid ${isToday ? "#3b82f644" : "#2a2a4a"}`, borderLeft: `3px solid ${statusColor}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{typeIcons[entry.type] ?? "\uD83D\uDCC5"}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: isToday ? "#60a5fa" : isPast ? "#22c55e" : "#e0e0e0" }}>{entry.title}</div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{new Date(entry.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</div>
                    </div>
                  </div>
                  <span style={{ background: typeColors[entry.type] + "22", color: typeColors[entry.type], fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10, textTransform: "capitalize" }}>
                    {entry.type}
                  </span>
                </div>
                {entry.description && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{entry.description}</div>}
                {entry.assignedTo && <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>Assigned to: {entry.assignedTo}</div>}
              </div>
            </motion.div>
          )
        })
      )}
    </div>
  )
}
