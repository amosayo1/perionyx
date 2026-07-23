"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ConsFinancialStatementViewerProps } from "./cons-types";

const statementLabels: Record<string, string> = {
  balanceSheet: "Balance Sheet",
  incomeStatement: "Income Statement",
  cashFlow: "Cash Flow",
  equityChanges: "Equity Changes",
  trialBalance: "Trial Balance",
  managementPack: "Management Pack",
  boardPack: "Board Pack",
};

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

export default function ConsFinancialStatementViewer({ statements }: ConsFinancialStatementViewerProps) {
  const [activeStatement, setActiveStatement] = useState(statements[0]?.statementType || "balanceSheet");

  const current = statements.find((s) => s.statementType === activeStatement);

  const entries = useMemo(() => {
    if (!current) return [];
    return [...current.entries].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [current]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {statements.map((s) => (
          <button
            key={s.statementType}
            onClick={() => setActiveStatement(s.statementType)}
            style={{
              background: activeStatement === s.statementType ? "#d4a84333" : "#1a1a2e",
              color: activeStatement === s.statementType ? "#d4a843" : "#94a3b8",
              border: `1px solid ${activeStatement === s.statementType ? "#d4a843" : "#2a2a4a"}`,
              borderRadius: 6,
              padding: "6px 14px",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {statementLabels[s.statementType] || s.statementType}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {current ? (
          <motion.div
            key={activeStatement}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{ background: "#1a1a2e", borderRadius: 10, border: "1px solid #2a2a4a", overflow: "hidden" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: "1px solid #2a2a4a" }}>
              <span style={{ color: "#e0e0e0", fontWeight: 600, fontSize: 14 }}>
                {statementLabels[activeStatement] || activeStatement}
              </span>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>{current.currency}</span>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: current.isBalanced ? "#22c55e" : "#ef4444",
                    display: "inline-block",
                  }}
                  title={current.isBalanced ? "Balanced" : "Unbalanced"}
                />
              </div>
            </div>
            <div style={{ padding: 8 }}>
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 120px 120px 80px",
                    gap: 8,
                    padding: "6px 12px",
                    background: entry.isTotal ? "#2a2a3e" : "transparent",
                    borderRadius: 4,
                    fontSize: entry.isTotal ? 13 : 12,
                    fontWeight: entry.isTotal ? 700 : 400,
                  }}
                >
                  <span style={{ color: entry.isTotal ? "#d4a843" : "#e0e0e0", paddingLeft: entry.isCalculated ? 20 : 0 }}>
                    {entry.lineItem}
                  </span>
                  <span style={{ color: "#e0e0e0", textAlign: "right", fontFamily: "ui-monospace, monospace" }}>
                    {formatCurrency(entry.amount)}
                  </span>
                  <span style={{ color: "#94a3b8", textAlign: "right", fontFamily: "ui-monospace, monospace" }}>
                    {entry.comparisonAmount != null ? formatCurrency(entry.comparisonAmount) : "-"}
                  </span>
                  <span
                    style={{
                      color: entry.variance != null ? (entry.variance >= 0 ? "#22c55e" : "#ef4444") : "#64748b",
                      textAlign: "right",
                      fontFamily: "ui-monospace, monospace",
                      fontSize: 11,
                    }}
                  >
                    {entry.variancePercent != null ? `${entry.variancePercent >= 0 ? "+" : ""}${entry.variancePercent.toFixed(1)}%` : "-"}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <div style={{ color: "#64748b", fontSize: 13, textAlign: "center", padding: 40 }}>
            No statement data available
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
