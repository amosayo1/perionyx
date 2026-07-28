"use client";

import { motion } from "framer-motion";
import type { ConsICEliminationCenterProps } from "./cons-types";

const statusColors: Record<string, string> = {
  identified: "#3b82f6",
  matched: "#22c55e",
  eliminated: "#64748b",
  unmatched: "#ef4444",
  disputed: "#f97316",
};

const typeLabels: Record<string, string> = {
  sales: "Sales",
  purchases: "Purchases",
  loans: "Loans",
  interest: "Interest",
  dividends: "Dividends",
  receivables: "Receivables",
  payables: "Payables",
  inventoryProfit: "Inventory Profit",
  fixedAssetProfit: "Fixed Asset Profit",
};

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

export default function ConsICEliminationCenter({ records }: ConsICEliminationCenterProps) {
  const grouped: Record<string, typeof records> = {};
  for (const r of records) {
    if (!grouped[r.intercompanyType]) grouped[r.intercompanyType] = [];
    grouped[r.intercompanyType].push(r);
  }

  const totals = records.reduce(
    (acc, r) => ({
      fromAmount: acc.fromAmount + r.fromAmount,
      toAmount: acc.toAmount + r.toAmount,
      difference: acc.difference + r.difference,
      eliminationAmount: acc.eliminationAmount + r.eliminationAmount,
    }),
    { fromAmount: 0, toAmount: 0, difference: 0, eliminationAmount: 0 }
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {Object.entries(grouped).map(([type, items], gi) => (
        <div key={type}>
          <div style={{ color: "#d4af37", fontWeight: 600, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8, paddingLeft: 4 }}>
            {typeLabels[type] || type} ({items.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 120px 120px 100px 100px",
                gap: 8,
                padding: "8px 12px",
                background: "#2a2a3e",
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 600,
                color: "#888",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              <span>From Entity</span>
              <span>To Entity</span>
              <span style={{ textAlign: "right" }}>From Amount</span>
              <span style={{ textAlign: "right" }}>To Amount</span>
              <span style={{ textAlign: "right" }}>Difference</span>
              <span style={{ textAlign: "center" }}>Status</span>
            </div>
            {items.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 120px 120px 100px 100px",
                  gap: 8,
                  padding: "8px 12px",
                  background: "#1a1a24",
                  borderRadius: 4,
                  alignItems: "center",
                  border: "1px solid #2a2a4a",
                  fontSize: 13,
                }}
              >
                <span style={{ color: "#e0e0e0", fontWeight: 500 }}>{r.fromEntityId.slice(0, 8)}</span>
                <span style={{ color: "#e0e0e0", fontWeight: 500 }}>{r.toEntityId.slice(0, 8)}</span>
                <span style={{ color: "#e0e0e0", textAlign: "right", fontFamily: "ui-monospace, monospace", fontSize: 12 }}>{formatCurrency(r.fromAmount)}</span>
                <span style={{ color: "#e0e0e0", textAlign: "right", fontFamily: "ui-monospace, monospace", fontSize: 12 }}>{formatCurrency(r.toAmount)}</span>
                <span style={{ color: r.difference === 0 ? "#22c55e" : "#ef4444", textAlign: "right", fontFamily: "ui-monospace, monospace", fontSize: 12, fontWeight: 600 }}>
                  {formatCurrency(r.difference)}
                </span>
                <span
                  style={{
                    background: `${statusColors[r.status]}22`,
                    color: statusColors[r.status],
                    padding: "2px 8px",
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: "capitalize",
                    textAlign: "center",
                  }}
                >
                  {r.status}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 120px 120px 100px 100px",
          gap: 8,
          padding: "10px 12px",
          background: "#2a2a3e",
          borderRadius: 6,
          fontSize: 13,
          fontWeight: 700,
          color: "#e0e0e0",
          borderTop: "2px solid #d4af37",
        }}
      >
        <span>Total</span>
        <span />
        <span style={{ textAlign: "right", fontFamily: "ui-monospace, monospace" }}>{formatCurrency(totals.fromAmount)}</span>
        <span style={{ textAlign: "right", fontFamily: "ui-monospace, monospace" }}>{formatCurrency(totals.toAmount)}</span>
        <span style={{ color: totals.difference === 0 ? "#22c55e" : "#ef4444", textAlign: "right", fontFamily: "ui-monospace, monospace" }}>
          {formatCurrency(totals.difference)}
        </span>
        <span style={{ textAlign: "center" }}>{formatCurrency(totals.eliminationAmount)} elim</span>
      </div>
    </motion.div>
  );
}
