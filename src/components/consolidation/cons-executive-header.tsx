"use client";

import { motion } from "framer-motion";
import type { ConsExecutiveHeaderProps } from "./cons-types";

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

const formatPercent = (v: number) => `${Math.round(v)}%`;

export default function ConsExecutiveHeader({ summary }: ConsExecutiveHeaderProps) {
  const metrics = [
    {
      label: "Total Entities",
      value: `${summary.totalEntities}`,
      color: "#3b82f6",
      detail: `${summary.consolidatedEntities} consolidated`,
    },
    {
      label: "Consolidated Entities",
      value: `${summary.consolidatedEntities}`,
      color: "#22c55e",
      detail: `${(summary.consolidatedEntities / summary.totalEntities * 100).toFixed(0)}% of total`,
    },
    {
      label: "Net Income",
      value: formatCurrency(summary.totalNetIncome),
      color: summary.totalNetIncome >= 0 ? "#22c55e" : "#ef4444",
      detail: `Revenue: ${formatCurrency(summary.totalRevenue)}`,
    },
    {
      label: "Total Assets",
      value: formatCurrency(summary.totalAssets),
      color: "#22c55e",
      detail: `Equity: ${formatCurrency(summary.totalEquity)}`,
    },
    {
      label: "Total Equity",
      value: formatCurrency(summary.totalEquity),
      color: "#d4af37",
      detail: `Minority: ${formatCurrency(summary.totalMinorityInterest)}`,
    },
    {
      label: "Readiness Score",
      value: formatPercent(summary.readinesScore),
      color: summary.readinesScore >= 80 ? "#22c55e" : summary.readinesScore >= 50 ? "#eab308" : "#ef4444",
      detail: `${summary.openAlerts} open alerts`,
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
