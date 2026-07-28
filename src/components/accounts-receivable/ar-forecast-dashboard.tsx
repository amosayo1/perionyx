"use client"
import { useMemo } from "react"
import { motion } from "framer-motion"
import type { ARForecastDashboardProps } from "./ar-types"

export function ARForecastDashboard({ forecasts }: ARForecastDashboardProps) {
  const latest = forecasts.length > 0 ? forecasts.reduce((a, b) => a.forecastDate > b.forecastDate ? a : b) : null

  if (!latest) return <div style={{ color: "#94a3b8", textAlign: "center", padding: 40 }}>No forecast data available</div>

  const scenarios = latest.scenarios ?? []
  const maxCollection = Math.max(...scenarios.map(s => s.collections), 1)

  return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
      <div style={{ background: "#1a1a24", borderRadius: 8, padding: 20 }}>
        <div style={{ color: "#e0e0e0", fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Scenario Comparison</div>
        {scenarios.map((s, i) => (
          <motion.div key={s.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
            style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ color: "#e0e0e0", fontWeight: 500, fontSize: 13 }}>{s.name}</span>
              <span style={{ color: "#d4af37", fontFamily: "ui-monospace, monospace", fontWeight: 600 }}>${s.collections.toLocaleString()}</span>
            </div>
            <div style={{ background: "#2a2a4a", height: 10, borderRadius: 5, overflow: "hidden" }}>
              <div style={{ width: (s.collections / maxCollection) * 100 + "%", height: "100%", background: i === 0 ? "#22c55e" : i === 1 ? "#3b82f6" : "#ef4444", borderRadius: 5, transition: "width 0.5s ease" }} />
            </div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{(s.probability * 100).toFixed(0)}% probability - {s.assumptions.join(", ")}</div>
          </motion.div>
        ))}
      </div>
      <div style={{ background: "#1a1a24", borderRadius: 8, padding: 20 }}>
        <div style={{ color: "#e0e0e0", fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Forecast Metrics</div>
        <div style={{ display: "grid", gap: 12 }}>
          {[
            { label: "Expected DSO", value: latest.expectedDSO.toFixed(1) + " days" },
            { label: "Cash Inflow", value: "$" + latest.expectedCashInflow.toLocaleString() },
            { label: "Confidence Level", value: (latest.confidenceLevel * 100).toFixed(0) + "%" },
            { label: "Confidence Range", value: "$" + latest.confidenceLow.toLocaleString() + " - $" + latest.confidenceHigh.toLocaleString() },
            { label: "Methodology", value: latest.methodology.toUpperCase() },
            { label: "Accuracy", value: latest.accuracy !== undefined ? (latest.accuracy * 100).toFixed(0) + "%" : "N/A" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #2a2a4a", fontSize: 13 }}>
              <span style={{ color: "#94a3b8" }}>{item.label}</span>
              <span style={{ color: "#e0e0e0", fontFamily: "ui-monospace, monospace", fontWeight: 500 }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
