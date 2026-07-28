"use client";

import { motion } from "framer-motion";
import type { FAKPIDashboardProps } from "./fa-types";

const statusColors: Record<string, string> = {
  onTrack: "#22c55e",
  atRisk: "#eab308",
  critical: "#ef4444",
  exceeding: "#3b82f6",
};

const trendIcons: Record<string, string> = {
  improving: "\u2191",
  worsening: "\u2193",
  stable: "\u2192",
};

const trendColors: Record<string, string> = {
  improving: "#22c55e",
  worsening: "#ef4444",
  stable: "#888",
};

const categoryLabels: Record<string, string> = {
  valuation: "Valuation",
  depreciation: "Depreciation",
  maintenance: "Maintenance",
  utilization: "Utilization",
  compliance: "Compliance",
  efficiency: "Efficiency",
};

const categoryOrder = ["valuation", "depreciation", "maintenance", "utilization", "compliance", "efficiency"] as const;

export default function FAKPIDashboard({ metrics }: FAKPIDashboardProps) {
  const grouped = categoryOrder.map((cat) => ({
    category: cat,
    label: categoryLabels[cat],
    items: metrics.filter((m) => m.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ display: "flex", flexDirection: "column", gap: 20 }}
    >
      <h3 style={{ color: "#e0e0e0", fontSize: 18, fontWeight: 700, margin: 0 }}>Key Performance Indicators</h3>
      {grouped.map((g) => (
        <div key={g.category} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ color: "#888", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", paddingLeft: 4 }}>
            {g.label}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {g.items.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.25 }}
                style={{
                  background: "#1a1a24",
                  borderRadius: 12,
                  borderTop: `3px solid ${statusColors[m.status] || "#888"}`,
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#888", fontSize: 13, fontWeight: 500 }}>{m.name}</span>
                  <span
                    style={{
                      background: `${statusColors[m.status]}20`,
                      color: statusColors[m.status],
                      padding: "2px 8px",
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: "capitalize",
                    }}
                  >
                    {m.status}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ color: "#e0e0e0", fontSize: 28, fontWeight: 700 }}>
                    {m.value}
                    <span style={{ color: "#888", fontSize: 14, fontWeight: 400, marginLeft: 4 }}>{m.unit}</span>
                  </span>
                  <span style={{ color: trendColors[m.trend], fontSize: 16, fontWeight: 600 }}>
                    {trendIcons[m.trend]}
                  </span>
                </div>
                <div style={{ color: "#888", fontSize: 13 }}>
                  Target: {m.target}{m.unit}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </motion.div>
  );
}
