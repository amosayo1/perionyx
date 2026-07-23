"use client";

import { motion } from "framer-motion";
import type { ConsMinorityInterestPanelProps } from "./cons-types";

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

export default function ConsMinorityInterestPanel({ records }: ConsMinorityInterestPanelProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 12 }}>
      {records.map((r, i) => {
        const balanceChange = r.endingBalance - r.beginningBalance;
        return (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            style={{ background: "#1a1a2e", borderRadius: 10, padding: 16, border: "1px solid #2a2a4a" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ color: "#e0e0e0", fontWeight: 600, fontSize: 14 }}>{r.entityName}</span>
              <span style={{ color: "#d4a843", fontWeight: 700, fontSize: 16 }}>{r.minorityPercentage}%</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div style={{ color: "#888", fontSize: 11, textTransform: "uppercase", marginBottom: 2 }}>Total Equity</div>
                <div style={{ color: "#e0e0e0", fontSize: 14, fontWeight: 600 }}>{formatCurrency(r.totalEquity)}</div>
              </div>
              <div>
                <div style={{ color: "#888", fontSize: 11, textTransform: "uppercase", marginBottom: 2 }}>Minority Equity</div>
                <div style={{ color: "#e0e0e0", fontSize: 14, fontWeight: 600 }}>{formatCurrency(r.minorityEquity)}</div>
              </div>
              <div>
                <div style={{ color: "#888", fontSize: 11, textTransform: "uppercase", marginBottom: 2 }}>Net Income</div>
                <div style={{ color: "#e0e0e0", fontSize: 14, fontWeight: 600 }}>{formatCurrency(r.totalNetIncome)}</div>
              </div>
              <div>
                <div style={{ color: "#888", fontSize: 11, textTransform: "uppercase", marginBottom: 2 }}>Minority NI</div>
                <div style={{ color: "#e0e0e0", fontSize: 14, fontWeight: 600 }}>{formatCurrency(r.minorityNetIncome)}</div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTop: "1px solid #2a2a4a", fontSize: 12 }}>
              <div>
                <span style={{ color: "#888" }}>Beginning: </span>
                <span style={{ color: "#94a3b8", fontWeight: 600 }}>{formatCurrency(r.beginningBalance)}</span>
              </div>
              <div>
                <span style={{ color: "#888" }}>Ending: </span>
                <span style={{ color: "#94a3b8", fontWeight: 600 }}>{formatCurrency(r.endingBalance)}</span>
              </div>
              <div>
                <span style={{ color: "#888" }}>Change: </span>
                <span style={{ color: balanceChange >= 0 ? "#22c55e" : "#ef4444", fontWeight: 600 }}>
                  {balanceChange >= 0 ? "+" : ""}{formatCurrency(balanceChange)}
                </span>
              </div>
            </div>
            {r.dividendsPaid != null && (
              <div style={{ marginTop: 6, fontSize: 12, color: "#888" }}>
                Dividends: {formatCurrency(r.dividendsPaid)}
                {r.otherMovements != null && <span> · Other: {formatCurrency(r.otherMovements)}</span>}
              </div>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
