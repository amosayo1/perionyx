"use client";

import { motion } from "framer-motion";
import type { ConsAnalyticsDashboardProps } from "./cons-types";

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

export default function ConsAnalyticsDashboard({ metrics, aggregates }: ConsAnalyticsDashboardProps) {
  const aggregateItems = [
    { label: "Total Entities", value: aggregates.totalEntities.toString(), color: "#e0e0e0" },
    { label: "Consolidated", value: aggregates.consolidatedEntities.toString(), color: "#22c55e" },
    { label: "Equity Method", value: aggregates.equityMethodEntities.toString(), color: "#3b82f6" },
    { label: "Dormant", value: aggregates.dormantEntities.toString(), color: "#eab308" },
    { label: "Active Runs", value: aggregates.activeRuns.toString(), color: "#22c55e" },
    { label: "Completed Runs", value: aggregates.completedRuns.toString(), color: "#3b82f6" },
    { label: "IC Transactions", value: aggregates.totalIntercompanyTransactions.toLocaleString(), color: "#e0e0e0" },
    { label: "Eliminated", value: formatCurrency(aggregates.eliminatedTransactions), color: aggregates.eliminatedTransactions > 0 ? "#22c55e" : "#64748b" },
    { label: "Unmatched", value: aggregates.unmatchedTransactions.toString(), color: aggregates.unmatchedTransactions > 0 ? "#ef4444" : "#22c55e" },
    { label: "Pending Adjustments", value: aggregates.pendingAdjustments.toString(), color: aggregates.pendingAdjustments > 0 ? "#eab308" : "#22c55e" },
    { label: "Total CTA", value: formatCurrency(aggregates.totalCTA), color: aggregates.totalCTA >= 0 ? "#22c55e" : "#ef4444" },
    { label: "Minority Interest", value: formatCurrency(aggregates.totalMinorityInterest), color: "#d4af37" },
    { label: "Total Goodwill", value: formatCurrency(aggregates.totalGoodwill), color: "#a855f7" },
    { label: "Avg Consolidation", value: `${aggregates.averageConsolidationDays.toFixed(1)}d`, color: "#14b8a6" },
    { label: "Board Reports", value: aggregates.boardReportsGenerated.toString(), color: "#e0e0e0" },
    { label: "Readiness Score", value: `${aggregates.consolidationReadinessScore}%`, color: aggregates.consolidationReadinessScore >= 80 ? "#22c55e" : aggregates.consolidationReadinessScore >= 50 ? "#eab308" : "#ef4444" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
        {aggregateItems.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            style={{ background: "#1a1a24", borderRadius: 10, padding: 16, textAlign: "center", border: "1px solid #2a2a4a" }}
          >
            <div style={{ color: "#94a3b8", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{item.label}</div>
            <div style={{ color: item.color, fontSize: 20, fontWeight: 700, fontFamily: "ui-monospace, monospace" }}>{item.value}</div>
          </motion.div>
        ))}
      </div>

      <div>
        <h3 style={{ color: "#e0e0e0", fontSize: 18, fontWeight: 700, margin: "0 0 12px 0" }}>Performance Metrics</h3>
        {metrics.length === 0 ? (
          <div style={{ color: "#64748b", fontSize: 13, textAlign: "center", padding: 24 }}>No metrics available</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
            {metrics.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                style={{
                  background: "#1a1a24",
                  borderRadius: 8,
                  padding: 14,
                  border: "1px solid #2a2a4a",
                  borderTop: `3px solid ${m.status === "onTrack" ? "#22c55e" : m.status === "atRisk" ? "#eab308" : m.status === "critical" ? "#ef4444" : "#3b82f6"}`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ color: "#888", fontSize: 12 }}>{m.name}</span>
                  <span style={{ color: "#94a3b8", fontSize: 11, textTransform: "capitalize" }}>{m.category}</span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{ color: "#e0e0e0", fontSize: 22, fontWeight: 700 }}>
                    {m.value}
                    <span style={{ color: "#888", fontSize: 12, fontWeight: 400, marginLeft: 4 }}>{m.unit}</span>
                  </span>
                </div>
                <div style={{ color: "#94a3b8", fontSize: 11, marginTop: 4 }}>
                  Target: {m.target}{m.unit}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
