"use client";

import { motion } from "framer-motion";
import type { FCPeriodStatusCardsProps } from "./fc-types";

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  notStarted: { label: "Not Started", color: "#888", bg: "#2a2a3e" },
  inProgress: { label: "In Progress", color: "#3b82f6", bg: "#3b82f620" },
  review: { label: "Review", color: "#eab308", bg: "#eab30820" },
  approved: { label: "Approved", color: "#22c55e", bg: "#22c55e20" },
  locked: { label: "Locked", color: "#888", bg: "#2a2a3e" },
  archived: { label: "Archived", color: "#555", bg: "#1a1a2e" },
  reopened: { label: "Reopened", color: "#a855f7", bg: "#a855f720" },
};

export default function FCPeriodStatusCards({ periods }: FCPeriodStatusCardsProps) {
  return (
    <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
      {periods.map((p, i) => {
        const cfg = statusConfig[p.status] || statusConfig.notStarted;
        const pct = p.totalTasks > 0 ? Math.round((p.completedTasks / p.totalTasks) * 100) : 0;
        return (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, duration: 0.25 }}
            style={{
              background: "#1a1a2e",
              borderRadius: 12,
              padding: 20,
              minWidth: 200,
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              border: `1px solid ${cfg.color}30`,
            }}
          >
            <span style={{ color: "#e0e0e0", fontSize: 14, fontWeight: 600, whiteSpace: "nowrap" }}>
              {p.label}
            </span>
            <span
              style={{
                background: cfg.bg,
                color: cfg.color,
                padding: "3px 10px",
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 600,
                alignSelf: "flex-start",
                textTransform: "capitalize",
              }}
            >
              {cfg.label}
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#888" }}>
                <span>Progress</span>
                <span>{pct}%</span>
              </div>
              <div style={{ width: "100%", height: 6, background: "#2a2a3e", borderRadius: 3, overflow: "hidden" }}>
                <div
                  style={{
                    width: `${pct}%`,
                    height: "100%",
                    background: cfg.color,
                    borderRadius: 3,
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: 12, color: "#888" }}>
              <span>
                {new Date(p.startDate).toLocaleDateString()} — {new Date(p.endDate).toLocaleDateString()}
              </span>
              <span>
                {p.actualCloseDate
                  ? `Closed in ${p.daysToClose}d`
                  : `${p.daysToClose}d to close`}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
