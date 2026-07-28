"use client";

import { motion } from "framer-motion";
import type { FCJournalReviewBoardProps } from "./fc-types";

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "#3b82f6" },
  inReview: { label: "In Review", color: "#eab308" },
  approved: { label: "Approved", color: "#22c55e" },
  rejected: { label: "Rejected", color: "#ef4444" },
  flagged: { label: "Flagged", color: "#f97316" },
};

const severityColors: Record<string, string> = {
  low: "#888",
  medium: "#eab308",
  high: "#ef4444",
};

export default function FCJournalReviewBoard({ journals }: FCJournalReviewBoardProps) {
  const total = journals.length;
  const pending = journals.filter((j) => j.status === "pending").length;
  const approved = journals.filter((j) => j.status === "approved").length;
  const flagged = journals.filter((j) => j.status === "flagged").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: "flex", flexDirection: "column", gap: 20 }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { label: "Total Journals", value: total, color: "#e0e0e0" },
          { label: "Pending Review", value: pending, color: "#3b82f6" },
          { label: "Approved", value: approved, color: "#22c55e" },
          { label: "Flagged", value: flagged, color: "#f97316" },
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

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {journals.map((j, i) => {
          const cfg = statusConfig[j.status] || statusConfig.pending;
          const highSeverityFlags = j.flags.filter((f) => f.severity === "high").length;
          return (
            <motion.div
              key={j.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02, duration: 0.2 }}
              style={{
                background: "#1a1a24",
                borderRadius: 8,
                padding: "14px 18px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderLeft: `3px solid ${cfg.color}`,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "#666", fontSize: 11, fontFamily: "monospace" }}>{j.journalNumber}</span>
                  <span
                    style={{
                      background: `${cfg.color}20`,
                      color: cfg.color,
                      padding: "1px 8px",
                      borderRadius: 3,
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {cfg.label}
                  </span>
                </div>
                <span style={{ color: "#e0e0e0", fontSize: 14, fontWeight: 600 }}>{j.description}</span>
                <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#888" }}>
                  <span>
                    Dr:{" "}
                    {j.totalDebit.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 })}
                  </span>
                  <span>
                    Cr:{" "}
                    {j.totalCredit.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 })}
                  </span>
                  <span>Preparer: {j.preparer}</span>
                </div>
                {j.flags.length > 0 && (
                  <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                    {j.flags.slice(0, 3).map((f) => (
                      <span
                        key={f.id}
                        style={{
                          background: `${severityColors[f.severity]}20`,
                          color: severityColors[f.severity],
                          padding: "1px 6px",
                          borderRadius: 3,
                          fontSize: 10,
                        }}
                      >
                        {f.type}
                      </span>
                    ))}
                    {j.flags.length > 3 && (
                      <span style={{ color: "#888", fontSize: 10 }}>+{j.flags.length - 3}</span>
                    )}
                    {highSeverityFlags > 0 && (
                      <span style={{ color: "#ef4444", fontSize: 10, fontWeight: 600 }}>
                        {highSeverityFlags} high
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 6, marginLeft: 16 }}>
                {j.status === "pending" && (
                  <>
                    <ActionButton label="Review" color="#3b82f6" />
                    <ActionButton label="Flag" color="#f97316" />
                  </>
                )}
                {j.status === "inReview" && (
                  <>
                    <ActionButton label="Approve" color="#22c55e" />
                    <ActionButton label="Reject" color="#ef4444" />
                  </>
                )}
                {j.status === "flagged" && (
                  <ActionButton label="Review" color="#3b82f6" />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

function ActionButton({ label, color }: { label: string; color: string }) {
  return (
    <button
      style={{
        background: `${color}20`,
        color,
        border: `1px solid ${color}40`,
        borderRadius: 6,
        padding: "6px 14px",
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        whiteSpace: "nowrap",
        transition: "all 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = `${color}30`;
        e.currentTarget.style.borderColor = `${color}60`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = `${color}20`;
        e.currentTarget.style.borderColor = `${color}40`;
      }}
    >
      {label}
    </button>
  );
}
