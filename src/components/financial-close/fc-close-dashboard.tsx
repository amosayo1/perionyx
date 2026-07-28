"use client";

import { motion } from "framer-motion";
import type { FCCloseDashboardProps } from "./fc-types";

export default function FCCloseDashboard({ progress, periods, metrics }: FCCloseDashboardProps) {
  const activePeriod = periods.find((p) => p.status === "inProgress" || p.status === "review");
  const pct = progress.progressPercent;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ background: "#1a1a24", borderRadius: 12, padding: 28, display: "flex", flexDirection: "column", gap: 24 }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ color: "#e0e0e0", fontSize: 22, fontWeight: 700, margin: 0 }}>
          Close Progress — {progress.periodLabel}
        </h2>
        {activePeriod && (
          <span
            style={{
              background: "#d4af3720",
              color: "#d4af37",
              padding: "4px 12px",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Active: {activePeriod.label}
          </span>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#e0e0e0", fontSize: 14 }}>{pct}% Complete</span>
          <span style={{ color: progress.onTrack ? "#22c55e" : "#eab308", fontSize: 14, fontWeight: 600 }}>
            {progress.onTrack ? "● On Track" : "● At Risk"}
          </span>
        </div>
        <div style={{ width: "100%", height: 12, background: "#2a2a3e", borderRadius: 6, overflow: "hidden" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              height: "100%",
              background: "linear-gradient(90deg, #d4af37, #e6b95a)",
              borderRadius: 6,
            }}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {[
          { label: "Total", value: progress.totalTasks, color: "#e0e0e0" },
          { label: "Completed", value: progress.completedTasks, color: "#22c55e" },
          { label: "Blocked", value: progress.blockedTasks, color: "#ef4444" },
          { label: "Not Started", value: progress.notStartedTasks, color: "#888" },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "#2a2a3e",
              borderRadius: 8,
              padding: "16px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <span style={{ color: "#888", fontSize: 13 }}>{s.label}</span>
            <span style={{ color: s.color, fontSize: 26, fontWeight: 700 }}>{s.value}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 32, paddingTop: 8, borderTop: "1px solid #2a2a3e" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ color: "#888", fontSize: 13 }}>Days Elapsed</span>
          <span style={{ color: "#e0e0e0", fontSize: 18, fontWeight: 600 }}>{progress.daysElapsed}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ color: "#888", fontSize: 13 }}>Days Remaining</span>
          <span style={{ color: "#e0e0e0", fontSize: 18, fontWeight: 600 }}>{progress.daysRemaining}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ color: "#888", fontSize: 13 }}>Total Periods</span>
          <span style={{ color: "#e0e0e0", fontSize: 18, fontWeight: 600 }}>{periods.length}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ color: "#888", fontSize: 13 }}>Active Periods</span>
          <span style={{ color: "#e0e0e0", fontSize: 18, fontWeight: 600 }}>
            {periods.filter((p) => p.status === "inProgress" || p.status === "review").length}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
