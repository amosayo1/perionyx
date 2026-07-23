"use client";

import { motion } from "framer-motion";
import type { FAExecutiveHeaderProps } from "./fa-types";

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

const formatPercent = (v: number) => `${Math.round(v)}%`;

export default function FAExecutiveHeader({ summary }: FAExecutiveHeaderProps) {
  const metrics = [
    {
      label: "Total Assets",
      value: `${summary.totalAssets}`,
      status: summary.totalAssets > 0 ? "onTrack" : "critical",
      color: summary.totalAssets > 0 ? "#22c55e" : "#ef4444",
      detail: `${summary.fullyDepreciatedCount} fully depreciated`,
    },
    {
      label: "Net Book Value",
      value: formatCurrency(summary.totalNetBookValue),
      status: summary.totalNetBookValue > 0 ? "onTrack" : "atRisk",
      color: summary.totalNetBookValue > 0 ? "#22c55e" : "#eab308",
      detail: `${formatCurrency(summary.totalAccumulatedDepreciation)} accumulated depreciation`,
    },
    {
      label: "Total Cost",
      value: formatCurrency(summary.totalCost),
      status: "onTrack",
      color: "#22c55e",
      detail: `${formatCurrency(summary.capexForPeriod)} capex this period`,
    },
    {
      label: "Depreciation Run Rate",
      value: formatCurrency(summary.depreciationForPeriod),
      status: summary.depreciationForPeriod > 0 ? "onTrack" : "atRisk",
      color: summary.depreciationForPeriod > 0 ? "#22c55e" : "#eab308",
      detail: "Per period",
    },
    {
      label: "Asset Utilization",
      value: formatPercent(summary.assetUtilizationRate),
      status: summary.assetUtilizationRate >= 70 ? "onTrack" : summary.assetUtilizationRate >= 40 ? "atRisk" : "critical",
      color: summary.assetUtilizationRate >= 70 ? "#22c55e" : summary.assetUtilizationRate >= 40 ? "#eab308" : "#ef4444",
      detail: `${summary.pendingMaintenance} pending maintenance`,
    },
    {
      label: "Replacement Value",
      value: formatCurrency(summary.replacementValue),
      status: summary.insuranceCoverage >= 80 ? "onTrack" : summary.insuranceCoverage >= 50 ? "atRisk" : "critical",
      color: summary.insuranceCoverage >= 80 ? "#22c55e" : summary.insuranceCoverage >= 50 ? "#eab308" : "#ef4444",
      detail: `${summary.insuranceCoverage}% insured`,
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
            background: "#1a1a2e",
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
