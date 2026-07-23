"use client";

import { motion } from "framer-motion";
import type { FCTaskBoardProps } from "./fc-types";

const statusGroups = ["notStarted", "inProgress", "completed", "blocked"] as const;

const groupLabels: Record<string, string> = {
  notStarted: "Not Started",
  inProgress: "In Progress",
  completed: "Completed",
  blocked: "Blocked",
};

const groupColors: Record<string, string> = {
  notStarted: "#888",
  inProgress: "#3b82f6",
  completed: "#22c55e",
  blocked: "#ef4444",
};

const priorityColors: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#888",
};

const categoryLabels: Record<string, string> = {
  reconciliation: "Recon",
  journal: "Journal",
  accrual: "Accrual",
  allocation: "Allocation",
  fx: "FX",
  intercompany: "IC",
  consolidation: "Consol",
  reporting: "Reporting",
  compliance: "Compliance",
  audit: "Audit",
};

export default function FCTaskBoard({ tasks }: FCTaskBoardProps) {
  const grouped = statusGroups.map((s) => ({
    status: s,
    label: groupLabels[s],
    color: groupColors[s],
    items: tasks.filter((t) => t.status === s),
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
    >
      <h3 style={{ color: "#e0e0e0", fontSize: 18, fontWeight: 700, margin: 0 }}>Task Board</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {grouped.map((g) => (
          <div key={g.status} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0 4px",
              }}
            >
              <span style={{ color: g.color, fontSize: 14, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {g.label}
              </span>
              <span style={{ color: "#888", fontSize: 13, background: "#2a2a3e", padding: "2px 8px", borderRadius: 4 }}>
                {g.items.length}
              </span>
            </div>
            {g.items.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.2 }}
                style={{
                  background: "#1a1a2e",
                  borderRadius: 8,
                  borderLeft: `3px solid ${g.color}`,
                  padding: "14px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#666", fontSize: 11, fontFamily: "monospace" }}>{t.taskCode}</span>
                  <span
                    style={{
                      background: `${priorityColors[t.priority]}20`,
                      color: priorityColors[t.priority],
                      padding: "1px 6px",
                      borderRadius: 3,
                      fontSize: 10,
                      fontWeight: 600,
                      textTransform: "uppercase",
                    }}
                  >
                    {t.priority}
                  </span>
                </div>
                <span style={{ color: "#e0e0e0", fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{t.title}</span>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "#888" }}>
                  <span>{t.assignedTo}</span>
                  <span>{new Date(t.dueDate).toLocaleDateString()}</span>
                </div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  <span
                    style={{
                      background: "#2a2a3e",
                      color: "#aaa",
                      padding: "2px 6px",
                      borderRadius: 3,
                      fontSize: 10,
                    }}
                  >
                    {categoryLabels[t.category] || t.category}
                  </span>
                  {t.dependsOn.length > 0 && (
                    <span style={{ background: "#eab30820", color: "#eab308", padding: "2px 6px", borderRadius: 3, fontSize: 10 }}>
                      Depends on {t.dependsOn.length}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
