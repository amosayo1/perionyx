"use client";

import { motion } from "framer-motion";
import type { ConsAdjustmentWorkspaceProps } from "./cons-types";

const typeColors: Record<string, string> = {
  fairValue: "#3b82f6",
  goodwill: "#a855f7",
  purchasePriceAllocation: "#f97316",
  restructuring: "#eab308",
  reorganization: "#d4a843",
  accountingPolicy: "#14b8a6",
  errorCorrection: "#ef4444",
  other: "#64748b",
};

const statusColors: Record<string, string> = {
  draft: "#64748b",
  review: "#eab308",
  approved: "#22c55e",
  posted: "#3b82f6",
  rejected: "#ef4444",
};

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

export default function ConsAdjustmentWorkspace({ adjustments }: ConsAdjustmentWorkspaceProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 100px 120px 120px 1fr 1fr 90px",
          gap: 8,
          padding: "10px 12px",
          background: "#2a2a3e",
          borderRadius: 6,
          fontSize: 11,
          fontWeight: 600,
          color: "#888",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        <span>Description</span>
        <span>Type</span>
        <span style={{ textAlign: "right" }}>Amount</span>
        <span style={{ textAlign: "right" }}>FX Rate</span>
        <span>Debit</span>
        <span>Credit</span>
        <span style={{ textAlign: "center" }}>Status</span>
      </div>
      {adjustments.map((a, i) => (
        <motion.div
          key={a.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.02 }}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 100px 120px 120px 1fr 1fr 90px",
            gap: 8,
            padding: "10px 12px",
            background: "#1a1a2e",
            borderRadius: 4,
            alignItems: "center",
            border: "1px solid #2a2a4a",
            fontSize: 13,
            borderLeft: `3px solid ${typeColors[a.adjustmentType] || "#64748b"}`,
          }}
        >
          <span style={{ color: "#e0e0e0", fontWeight: 500 }}>{a.description}</span>
          <span
            style={{
              background: `${typeColors[a.adjustmentType]}22`,
              color: typeColors[a.adjustmentType],
              padding: "2px 6px",
              borderRadius: 4,
              fontSize: 10,
              fontWeight: 600,
              textTransform: "capitalize",
              textAlign: "center",
            }}
          >
            {a.adjustmentType.replace(/([A-Z])/g, " $1").trim()}
          </span>
          <span style={{ color: a.amount >= 0 ? "#22c55e" : "#ef4444", textAlign: "right", fontFamily: "ui-monospace, monospace", fontSize: 12, fontWeight: 600 }}>
            {formatCurrency(a.amount)}
          </span>
          <span style={{ color: "#94a3b8", textAlign: "right", fontFamily: "ui-monospace, monospace", fontSize: 12 }}>{a.fxRate.toFixed(4)}</span>
          <span style={{ color: "#94a3b8", fontSize: 12, fontFamily: "ui-monospace, monospace" }}>{a.debitAccount}</span>
          <span style={{ color: "#94a3b8", fontSize: 12, fontFamily: "ui-monospace, monospace" }}>{a.creditAccount}</span>
          <div style={{ display: "flex", justifyContent: "center", gap: 4 }}>
            <span
              style={{
                background: `${statusColors[a.status]}22`,
                color: statusColors[a.status],
                padding: "2px 8px",
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 600,
                textTransform: "capitalize",
              }}
            >
              {a.status}
            </span>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
