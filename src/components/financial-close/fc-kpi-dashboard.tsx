"use client";

import { motion } from "framer-motion";
import type { FCKPIDashboardProps } from "./fc-types";

const statusColors: Record<string, string> = {
  onTrack: "#22c55e",
  atRisk: "#eab308",
  critical: "#ef4444",
  exceeding: "#3b82f6",
};

const trendIcons: Record<string, string> = {
  improving: "↑",
  worsening: "↓",
  stable: "→",
};

const trendColors: Record<string, string> = {
  improving: "#22c55e",
  worsening: "#ef4444",
  stable: "#888",
};

export default function FCKPIDashboard({ metrics }: FCKPIDashboardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
    >
      <h3 style={{ color: "#e0e0e0", fontSize: 18, fontWeight: 700, margin: 0 }}>Key Performance Indicators</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {metrics.map((m, i) => (
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
              Target: {m.target}
              {m.unit}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
