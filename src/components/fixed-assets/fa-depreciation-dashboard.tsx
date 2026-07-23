"use client";

import { motion } from "framer-motion";
import type { FADepreciationDashboardProps } from "./fa-types";

const methodColors: Record<string, string> = {
  straightLine: "#22c55e",
  doubleDeclining: "#eab308",
  sumOfYearsDigits: "#f97316",
  unitsOfProduction: "#3b82f6",
  macrs: "#ef4444",
};

const methodLabels: Record<string, string> = {
  straightLine: "Straight Line",
  doubleDeclining: "Double Declining",
  sumOfYearsDigits: "Sum of Years",
  unitsOfProduction: "Units of Prod.",
  macrs: "MACRS",
};

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

export default function FADepreciationDashboard({ schedules }: FADepreciationDashboardProps) {
  const totalDepreciation = schedules.reduce((s, d) => s + d.accumulatedDepreciation, 0);
  const avgUsefulLife = schedules.length > 0
    ? schedules.reduce((s, d) => s + d.usefulLifeYears, 0) / schedules.length
    : 0;
  const avgRemainingLife = schedules.length > 0
    ? schedules.reduce((s, d) => s + d.remainingLifeMonths, 0) / schedules.length
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ display: "flex", flexDirection: "column", gap: 20 }}
    >
      <h3 style={{ color: "#e0e0e0", fontSize: 18, fontWeight: 700, margin: 0 }}>Depreciation Schedule</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {[
          { label: "Total Accumulated Depreciation", value: formatCurrency(totalDepreciation), color: "#d4a843" },
          { label: "Avg Useful Life", value: `${avgUsefulLife.toFixed(1)} yrs`, color: "#22c55e" },
          { label: "Avg Remaining Life", value: `${(avgRemainingLife / 12).toFixed(1)} yrs`, color: avgRemainingLife > 24 ? "#22c55e" : avgRemainingLife > 12 ? "#eab308" : "#ef4444" },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "#1a1a2e",
              borderRadius: 12,
              borderLeft: `4px solid ${s.color}`,
              padding: "18px 22px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <span style={{ color: "#888", fontSize: 13, fontWeight: 500 }}>{s.label}</span>
            <span style={{ color: "#e0e0e0", fontSize: 24, fontWeight: 700, lineHeight: 1.2 }}>{s.value}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 100px 120px 120px 120px 100px",
            gap: 8,
            padding: "0 16px",
            color: "#888",
            fontSize: 12,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          <span>Asset</span>
          <span>Method</span>
          <span style={{ textAlign: "right" }}>Cost</span>
          <span style={{ textAlign: "right" }}>NBV</span>
          <span style={{ textAlign: "right" }}>Monthly Depr.</span>
          <span style={{ textAlign: "right" }}>Remaining</span>
        </div>
        {schedules.map((s, i) => (
          <motion.div
            key={s.assetId}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, duration: 0.2 }}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 100px 120px 120px 120px 100px",
              gap: 8,
              alignItems: "center",
              background: i % 2 === 0 ? "#1a1a2e" : "#1e1e32",
              borderRadius: 6,
              padding: "12px 16px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <span style={{ color: "#e0e0e0", fontSize: 14, fontWeight: 500 }}>{s.assetName}</span>
              <span style={{ color: "#666", fontSize: 11, fontFamily: "monospace" }}>{s.assetTag}</span>
            </div>
            <span
              style={{
                background: `${methodColors[s.method]}20`,
                color: methodColors[s.method],
                padding: "2px 8px",
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 600,
                justifySelf: "start",
              }}
            >
              {methodLabels[s.method]}
            </span>
            <span style={{ color: "#e0e0e0", fontSize: 13, textAlign: "right", fontFamily: "monospace" }}>
              {formatCurrency(s.cost)}
            </span>
            <span style={{ color: "#e0e0e0", fontSize: 13, textAlign: "right", fontFamily: "monospace" }}>
              {formatCurrency(s.netBookValue)}
            </span>
            <span style={{ color: "#e0e0e0", fontSize: 13, textAlign: "right", fontFamily: "monospace" }}>
              {formatCurrency(s.currentPeriodDepreciation)}
            </span>
            <span style={{ color: "#aaa", fontSize: 13, textAlign: "right" }}>
              {s.remainingLifeMonths > 12
                ? `${(s.remainingLifeMonths / 12).toFixed(1)}y`
                : `${s.remainingLifeMonths}m`}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
