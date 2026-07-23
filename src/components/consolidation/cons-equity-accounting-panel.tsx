"use client";

import { motion } from "framer-motion";
import type { ConsEquityAccountingPanelProps } from "./cons-types";

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

export default function ConsEquityAccountingPanel({ records }: ConsEquityAccountingPanelProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 12 }}>
      {records.map((r, i) => (
        <motion.div
          key={r.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          style={{ background: "#1a1a2e", borderRadius: 10, padding: 16, border: "1px solid #2a2a4a", borderLeft: "3px solid #3b82f6" }}
        >
          <div style={{ color: "#e0e0e0", fontWeight: 600, fontSize: 14, marginBottom: 12 }}>
            {r.entityId.slice(0, 8)} — Equity Method Investment
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div style={{ color: "#888", fontSize: 11, textTransform: "uppercase", marginBottom: 2 }}>Investment Cost</div>
              <div style={{ color: "#e0e0e0", fontSize: 16, fontWeight: 700 }}>{formatCurrency(r.investmentCost)}</div>
            </div>
            <div>
              <div style={{ color: "#888", fontSize: 11, textTransform: "uppercase", marginBottom: 2 }}>Equity Share</div>
              <div style={{ color: "#e0e0e0", fontSize: 16, fontWeight: 700 }}>{r.equityShare}%</div>
            </div>
            <div>
              <div style={{ color: "#888", fontSize: 11, textTransform: "uppercase", marginBottom: 2 }}>Goodwill</div>
              <div style={{ color: r.goodwill >= 0 ? "#d4a843" : "#ef4444", fontSize: 14, fontWeight: 600 }}>{formatCurrency(r.goodwill)}</div>
            </div>
            <div>
              <div style={{ color: "#888", fontSize: 11, textTransform: "uppercase", marginBottom: 2 }}>Fair Value Adj.</div>
              <div style={{ color: "#94a3b8", fontSize: 14, fontWeight: 600 }}>{formatCurrency(r.fairValueAdjustment)}</div>
            </div>
            <div>
              <div style={{ color: "#888", fontSize: 11, textTransform: "uppercase", marginBottom: 2 }}>Post-Acq. Reserves</div>
              <div style={{ color: "#94a3b8", fontSize: 14, fontWeight: 600 }}>{formatCurrency(r.postAcquisitionReserves)}</div>
            </div>
            <div>
              <div style={{ color: "#888", fontSize: 11, textTransform: "uppercase", marginBottom: 2 }}>Carrying Amount</div>
              <div style={{ color: "#22c55e", fontSize: 18, fontWeight: 700, fontFamily: "ui-monospace, monospace" }}>{formatCurrency(r.carryingAmount)}</div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
