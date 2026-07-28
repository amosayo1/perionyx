"use client";

import { motion } from "framer-motion";
import type { FAMaintenanceBoardProps } from "./fa-types";

const statusGroups = ["scheduled", "inProgress", "completed"] as const;

const groupLabels: Record<string, string> = {
  scheduled: "Scheduled",
  inProgress: "In Progress",
  completed: "Completed",
};

const groupColors: Record<string, string> = {
  scheduled: "#3b82f6",
  inProgress: "#eab308",
  completed: "#22c55e",
};

const priorityColors: Record<string, string> = {
  low: "#888",
  medium: "#eab308",
  high: "#f97316",
  critical: "#ef4444",
};

const typeLabels: Record<string, string> = {
  preventive: "Preventive",
  corrective: "Corrective",
  emergency: "Emergency",
  inspection: "Inspection",
};

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

export default function FAMaintenanceBoard({ assets }: FAMaintenanceBoardProps) {
  const allMaintenance = assets.flatMap((a) =>
    a.maintenance.map((m) => ({
      ...m,
      assetName: a.name,
      assetTag: a.assetTag,
    }))
  );

  const grouped = statusGroups.map((s) => ({
    status: s,
    label: groupLabels[s],
    color: groupColors[s],
    items: allMaintenance.filter((m) => m.status === s),
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
    >
      <h3 style={{ color: "#e0e0e0", fontSize: 18, fontWeight: 700, margin: 0 }}>Maintenance Board</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {grouped.map((g) => (
          <div key={g.status} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 4px" }}>
              <span style={{ color: g.color, fontSize: 14, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {g.label}
              </span>
              <span style={{ color: "#888", fontSize: 13, background: "#2a2a3e", padding: "2px 8px", borderRadius: 4 }}>
                {g.items.length}
              </span>
            </div>
            {g.items.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.2 }}
                style={{
                  background: "#1a1a24",
                  borderRadius: 8,
                  borderLeft: `3px solid ${g.color}`,
                  padding: "14px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{
                    background: `${priorityColors[m.priority]}20`,
                    color: priorityColors[m.priority],
                    padding: "1px 6px",
                    borderRadius: 3,
                    fontSize: 10,
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}>
                    {m.priority}
                  </span>
                  <span style={{ color: "#888", fontSize: 11, fontFamily: "monospace" }}>{m.assetTag}</span>
                </div>
                <span style={{ color: "#e0e0e0", fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{m.title}</span>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "#888" }}>
                  <span
                    style={{
                      background: "#2a2a3e",
                      color: "#aaa",
                      padding: "2px 6px",
                      borderRadius: 3,
                      fontSize: 10,
                    }}
                  >
                    {typeLabels[m.type] || m.type}
                  </span>
                  <span>{new Date(m.scheduledDate).toLocaleDateString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                  <span style={{ color: "#d4af37", fontWeight: 600, fontFamily: "monospace" }}>
                    {formatCurrency(m.cost)}
                  </span>
                  {m.assignedTo && (
                    <span style={{ color: "#888" }}>{m.assignedTo}</span>
                  )}
                </div>
              </motion.div>
            ))}
            {g.items.length === 0 && (
              <div style={{ color: "#555", fontSize: 13, textAlign: "center", padding: 24, background: "#1a1a24", borderRadius: 8 }}>
                No {g.label.toLowerCase()} items
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
