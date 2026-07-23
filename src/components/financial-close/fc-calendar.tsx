"use client";

import { motion } from "framer-motion";
import type { FCCalendarProps } from "./fc-types";

const typeColors: Record<string, string> = {
  deadline: "#ef4444",
  meeting: "#3b82f6",
  review: "#eab308",
  approval: "#22c55e",
  lock: "#888",
  reminder: "#a855f7",
};

const typeLabels: Record<string, string> = {
  deadline: "Deadline",
  meeting: "Meeting",
  review: "Review",
  approval: "Approval",
  lock: "Lock",
  reminder: "Reminder",
};

export default function FCCalendar({ entries }: FCCalendarProps) {
  const sorted = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ background: "#1a1a2e", borderRadius: 12, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}
    >
      <h3 style={{ color: "#e0e0e0", fontSize: 18, fontWeight: 700, margin: 0 }}>Close Calendar</h3>
      {sorted.length === 0 && (
        <div style={{ color: "#888", fontSize: 14, textAlign: "center", padding: 32 }}>No upcoming events</div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sorted.map((e, i) => (
          <motion.div
            key={e.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03, duration: 0.2 }}
            style={{
              background: "#2a2a3e",
              borderRadius: 8,
              borderLeft: `3px solid ${typeColors[e.type] || "#888"}`,
              padding: "14px 18px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
              <span style={{ color: "#e0e0e0", fontSize: 14, fontWeight: 600 }}>{e.title}</span>
              <span style={{ color: "#888", fontSize: 12 }}>
                {new Date(e.date).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
                {e.assignedTo && ` • ${e.assignedTo}`}
              </span>
            </div>
            <span
              style={{
                background: `${typeColors[e.type]}20`,
                color: typeColors[e.type],
                padding: "3px 10px",
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              {typeLabels[e.type]}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
