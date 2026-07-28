"use client";

import { motion } from "framer-motion";
import type { ConsEntityPerformanceProps } from "./cons-types";

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

const formatPercent = (v: number) => `${(v * 100).toFixed(1)}%`;

function MiniBar({ value, maxValue, color }: { value: number; maxValue: number; color: string }) {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <div style={{ width: "100%", height: 6, background: "#2a2a3e", borderRadius: 3, overflow: "hidden" }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(pct, 100)}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{ height: "100%", background: color, borderRadius: 3 }}
      />
    </div>
  );
}

export default function ConsEntityPerformance({ performances }: ConsEntityPerformanceProps) {
  const maxRevenue = Math.max(...performances.map((p) => p.revenue), 1);
  const maxNetIncome = Math.max(...performances.map((p) => Math.abs(p.netIncome)), 1);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 100px 100px 80px 80px 1fr 1fr",
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
        <span>Entity</span>
        <span style={{ textAlign: "right" }}>Revenue</span>
        <span style={{ textAlign: "right" }}>Net Income</span>
        <span style={{ textAlign: "right" }}>ROE</span>
        <span style={{ textAlign: "right" }}>Margin</span>
        <span>Revenue Share</span>
        <span>Growth</span>
      </div>
      {performances.map((p, i) => (
        <motion.div
          key={p.entityId}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.025 }}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 100px 100px 80px 80px 1fr 1fr",
            gap: 8,
            padding: "10px 12px",
            background: "#1a1a24",
            borderRadius: 4,
            alignItems: "center",
            border: "1px solid #2a2a4a",
            fontSize: 13,
          }}
        >
          <span style={{ color: "#e0e0e0", fontWeight: 500 }}>{p.entityName}</span>
          <span style={{ color: "#e0e0e0", textAlign: "right", fontFamily: "ui-monospace, monospace", fontSize: 12 }}>{formatCurrency(p.revenue)}</span>
          <span style={{ color: p.netIncome >= 0 ? "#22c55e" : "#ef4444", textAlign: "right", fontFamily: "ui-monospace, monospace", fontSize: 12, fontWeight: 600 }}>
            {formatCurrency(p.netIncome)}
          </span>
          <span style={{ color: p.roe >= 0 ? "#22c55e" : "#ef4444", textAlign: "right", fontFamily: "ui-monospace, monospace", fontSize: 12, fontWeight: 600 }}>
            {formatPercent(p.roe)}
          </span>
          <span style={{ color: p.profitMargin >= 0 ? "#22c55e" : "#ef4444", textAlign: "right", fontFamily: "ui-monospace, monospace", fontSize: 12, fontWeight: 600 }}>
            {formatPercent(p.profitMargin)}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <MiniBar value={p.revenue} maxValue={maxRevenue} color="#d4af37" />
            <span style={{ color: "#94a3b8", fontSize: 11, fontFamily: "ui-monospace, monospace", minWidth: 40, textAlign: "right" }}>
              {formatPercent(p.revenueShare)}
            </span>
          </div>
          <span style={{ color: p.revenueGrowth >= 0 ? "#22c55e" : "#ef4444", fontFamily: "ui-monospace, monospace", fontSize: 12, fontWeight: 600 }}>
            {p.revenueGrowth >= 0 ? "+" : ""}{formatPercent(p.revenueGrowth)}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
}
