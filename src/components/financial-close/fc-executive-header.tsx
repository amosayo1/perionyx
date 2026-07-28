"use client";

import { motion } from "framer-motion";
import type { FCExecutiveHeaderProps } from "./fc-types";

const statusColor = (onTrack: boolean, value?: number, threshold?: number) => {
  if (!onTrack) return "#ef4444";
  if (threshold !== undefined && value !== undefined && value < threshold) return "#eab308";
  return "#22c55e";
};

const formatPercent = (v: number) => `${Math.round(v)}%`;

export default function FCExecutiveHeader({ summary }: FCExecutiveHeaderProps) {
  const metrics = [
    {
      label: "Close Progress",
      value: formatPercent(summary.closeProgress),
      status: summary.closeProgress >= 80 ? "onTrack" : summary.closeProgress >= 50 ? "atRisk" : "critical",
      color: summary.closeProgress >= 80 ? "#22c55e" : summary.closeProgress >= 50 ? "#eab308" : "#ef4444",
      detail: `${summary.completedTasks} / ${summary.totalTasks} tasks`,
    },
    {
      label: "Days Remaining",
      value: `${summary.daysRemaining}`,
      status: summary.daysRemaining > 7 ? "onTrack" : summary.daysRemaining > 3 ? "atRisk" : "critical",
      color: summary.daysRemaining > 7 ? "#22c55e" : summary.daysRemaining > 3 ? "#eab308" : "#ef4444",
      detail: summary.onTrack ? "On track" : "Behind schedule",
    },
    {
      label: "Total Tasks",
      value: `${summary.completedTasks}/${summary.totalTasks}`,
      status: summary.blockedTasks === 0 ? "onTrack" : "atRisk",
      color: summary.blockedTasks === 0 ? "#22c55e" : "#eab308",
      detail: `${summary.blockedTasks} blocked, ${summary.overdueTasks} overdue`,
    },
    {
      label: "Pending Approvals",
      value: `${summary.pendingApprovals}`,
      status: summary.pendingApprovals === 0 ? "onTrack" : summary.pendingApprovals > 10 ? "critical" : "atRisk",
      color: summary.pendingApprovals === 0 ? "#22c55e" : summary.pendingApprovals > 10 ? "#ef4444" : "#eab308",
      detail: `${summary.journalEntriesToReview} journals to review`,
    },
    {
      label: "Open Exceptions",
      value: `${summary.openExceptions}`,
      status: summary.openExceptions === 0 ? "onTrack" : summary.criticalExceptions > 0 ? "critical" : "atRisk",
      color: summary.openExceptions === 0 ? "#22c55e" : summary.criticalExceptions > 0 ? "#ef4444" : "#eab308",
      detail: `${summary.criticalExceptions} critical`,
    },
    {
      label: "Readiness Score",
      value: `${summary.closeReadinessScore}/100`,
      status: summary.closeReadinessScore >= 80 ? "onTrack" : summary.closeReadinessScore >= 50 ? "atRisk" : "critical",
      color: summary.closeReadinessScore >= 80 ? "#22c55e" : summary.closeReadinessScore >= 50 ? "#eab308" : "#ef4444",
      detail: `Avg close: ${summary.averageDaysToClose}d`,
    },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
      {metrics.map((m, i) => (
        <motion.div
          key={m.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.3 }}
          style={{
            background: "#1a1a24",
            borderRadius: 12,
            borderLeft: `4px solid ${m.color}`,
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <div style={{ color: "#888", fontSize: 13, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {m.label}
          </div>
          <div style={{ color: "#e0e0e0", fontSize: 28, fontWeight: 700, lineHeight: 1.2 }}>
            {m.value}
          </div>
          <div style={{ color: "#aaa", fontSize: 13 }}>
            {m.detail}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
