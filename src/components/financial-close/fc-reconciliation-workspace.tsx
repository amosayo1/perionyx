"use client";

import { motion } from "framer-motion";
import type { FCReconciliationWorkspaceProps } from "./fc-types";

const statusColors: Record<string, string> = {
  pending: "#888",
  inProgress: "#3b82f6",
  matched: "#22c55e",
  unmatched: "#ef4444",
  adjusted: "#eab308",
  approved: "#22c55e",
  failed: "#ef4444",
};

export default function FCReconciliationWorkspace({ reconciliations, accountRecs }: FCReconciliationWorkspaceProps) {
  const total = reconciliations.length;
  const matched = reconciliations.filter((r) => r.isBalanced).length;
  const unmatched = total - matched;
  const approved = reconciliations.filter((r) => r.status === "approved").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: "flex", flexDirection: "column", gap: 20 }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { label: "Total Reconciliations", value: total, color: "#e0e0e0" },
          { label: "Matched", value: matched, color: "#22c55e" },
          { label: "Unmatched", value: unmatched, color: "#ef4444" },
          { label: "Approved", value: approved, color: "#3b82f6" },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "#1a1a24",
              borderRadius: 8,
              padding: "14px 18px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <span style={{ color: "#888", fontSize: 12, fontWeight: 500 }}>{s.label}</span>
            <span style={{ color: s.color, fontSize: 24, fontWeight: 700 }}>{s.value}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <h4 style={{ color: "#e0e0e0", fontSize: 15, fontWeight: 600, margin: 0 }}>GL Reconciliations</h4>
          {reconciliations.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02, duration: 0.2 }}
              style={{
                background: "#1a1a24",
                borderRadius: 8,
                padding: "12px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderLeft: `3px solid ${r.isBalanced ? "#22c55e" : "#ef4444"}`,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
                <span style={{ color: "#e0e0e0", fontSize: 13, fontWeight: 600 }}>
                  {r.accountCode}
                </span>
                <span style={{ color: "#888", fontSize: 12 }}>{r.accountName}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span
                  style={{
                    color: r.isBalanced ? "#22c55e" : "#ef4444",
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: "monospace",
                  }}
                >
                  {r.difference >= 0 ? "+" : ""}
                  {r.difference.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 })}
                </span>
                <span
                  style={{
                    background: `${statusColors[r.status]}20`,
                    color: statusColors[r.status],
                    padding: "2px 8px",
                    borderRadius: 3,
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: "capitalize",
                  }}
                >
                  {r.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <h4 style={{ color: "#e0e0e0", fontSize: 15, fontWeight: 600, margin: 0 }}>Account Reconciliations</h4>
          {accountRecs.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02, duration: 0.2 }}
              style={{
                background: "#1a1a24",
                borderRadius: 8,
                padding: "12px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderLeft: `3px solid ${a.difference === 0 ? "#22c55e" : "#ef4444"}`,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
                <span style={{ color: "#e0e0e0", fontSize: 13, fontWeight: 600 }}>
                  {a.accountCode}
                </span>
                <span style={{ color: "#888", fontSize: 12 }}>{a.accountName}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span
                  style={{
                    color: a.difference === 0 ? "#22c55e" : "#ef4444",
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: "monospace",
                  }}
                >
                  {a.difference >= 0 ? "+" : ""}
                  {a.difference.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 })}
                </span>
                <span
                  style={{
                    background: `${statusColors[a.status]}20`,
                    color: statusColors[a.status],
                    padding: "2px 8px",
                    borderRadius: 3,
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: "capitalize",
                  }}
                >
                  {a.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
