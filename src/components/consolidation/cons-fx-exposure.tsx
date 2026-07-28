"use client";

import { motion } from "framer-motion";
import type { ConsFXExposureProps } from "./cons-types";

const exposureLevel = (hedged: number, unhedged: number) => {
  const ratio = unhedged / (hedged + unhedged || 1);
  if (ratio < 0.3) return "#22c55e";
  if (ratio < 0.6) return "#eab308";
  return "#ef4444";
};

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

export default function ConsFXExposure({ exposures }: ConsFXExposureProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 60px 60px 100px 100px 100px 100px 100px",
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
        <span>From</span>
        <span>To</span>
        <span style={{ textAlign: "right" }}>Avg Rate</span>
        <span style={{ textAlign: "right" }}>Closing Rate</span>
        <span style={{ textAlign: "right" }}>CTA Impact</span>
        <span style={{ textAlign: "right" }}>Hedged</span>
        <span style={{ textAlign: "right" }}>Unhedged</span>
      </div>
      {exposures.map((ex, i) => {
        const exColor = exposureLevel(ex.hedgedAmount, ex.unhedgedExposure);
        return (
          <motion.div
            key={`${ex.entityId}-${ex.functionalCurrency}-${ex.presentationCurrency}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.025 }}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 60px 60px 100px 100px 100px 100px 100px",
              gap: 8,
              padding: "10px 12px",
              background: "#1a1a24",
              borderRadius: 4,
              alignItems: "center",
              border: "1px solid #2a2a4a",
              borderLeft: `3px solid ${exColor}`,
              fontSize: 13,
            }}
          >
            <span style={{ color: "#e0e0e0", fontWeight: 500 }}>{ex.entityName}</span>
            <span style={{ color: "#94a3b8", fontSize: 12, fontFamily: "ui-monospace, monospace" }}>{ex.functionalCurrency}</span>
            <span style={{ color: "#94a3b8", fontSize: 12, fontFamily: "ui-monospace, monospace" }}>{ex.presentationCurrency}</span>
            <span style={{ color: "#94a3b8", textAlign: "right", fontFamily: "ui-monospace, monospace", fontSize: 12 }}>{ex.averageRate.toFixed(4)}</span>
            <span style={{ color: "#94a3b8", textAlign: "right", fontFamily: "ui-monospace, monospace", fontSize: 12 }}>{ex.closingRate.toFixed(4)}</span>
            <span style={{ color: ex.ctaImpact >= 0 ? "#22c55e" : "#ef4444", textAlign: "right", fontFamily: "ui-monospace, monospace", fontSize: 12, fontWeight: 600 }}>
              {formatCurrency(ex.ctaImpact)}
            </span>
            <span style={{ color: "#22c55e", textAlign: "right", fontFamily: "ui-monospace, monospace", fontSize: 12 }}>{formatCurrency(ex.hedgedAmount)}</span>
            <span style={{ color: exColor, textAlign: "right", fontFamily: "ui-monospace, monospace", fontSize: 12, fontWeight: 600 }}>{formatCurrency(ex.unhedgedExposure)}</span>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
