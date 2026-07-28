"use client";

import { motion } from "framer-motion";
import type { FAImpairmentReviewProps } from "./fa-types";

const indicatorLabels: Record<string, string> = {
  marketDecline: "Market Decline",
  obsolescence: "Obsolescence",
  physicalDamage: "Physical Damage",
  regulatoryChange: "Regulatory Change",
  extendedIdle: "Extended Idle",
  businessRestructuring: "Business Restructuring",
  cashFlowDecline: "Cash Flow Decline",
  other: "Other",
};

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

export default function FAImpairmentReview({ assets }: FAImpairmentReviewProps) {
  const impairments = assets
    .flatMap((a) =>
      a.impairments.map((imp) => ({
        ...imp,
        assetName: a.name,
        assetTag: a.assetTag,
        assetCategory: a.category,
      }))
    )
    .sort((a, b) => new Date(b.impairmentDate).getTime() - new Date(a.impairmentDate).getTime());

  const totalImpairmentLoss = impairments.reduce((s, i) => s + i.impairmentLoss, 0);
  const totalReversals = impairments.filter((i) => i.reversed).reduce((s, i) => s + (i.reversalAmount || 0), 0);
  const criticalCount = impairments.filter((i) => i.impairmentLoss >= 100000).length;

  const severityColor = (loss: number) => {
    if (loss >= 500000) return "#ef4444";
    if (loss >= 100000) return "#f97316";
    if (loss >= 10000) return "#eab308";
    return "#888";
  };

  const severityLabel = (loss: number) => {
    if (loss >= 500000) return "Severe";
    if (loss >= 100000) return "High";
    if (loss >= 10000) return "Moderate";
    return "Low";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ display: "flex", flexDirection: "column", gap: 20 }}
    >
      <h3 style={{ color: "#e0e0e0", fontSize: 18, fontWeight: 700, margin: 0 }}>
        Impairment Review
        <span style={{ color: "#888", fontSize: 14, fontWeight: 400, marginLeft: 8 }}>
          {impairments.length} records
        </span>
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {[
          { label: "Total Impairment Loss", value: formatCurrency(totalImpairmentLoss), color: criticalCount > 0 ? "#ef4444" : "#eab308" },
          { label: "Total Reversals", value: formatCurrency(totalReversals), color: "#22c55e" },
          { label: "Critical Items", value: `${criticalCount}`, color: criticalCount > 0 ? "#ef4444" : "#888" },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "#1a1a24",
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
            gridTemplateColumns: "1fr 120px 80px 140px 100px 70px",
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
          <span>Indicator</span>
          <span style={{ textAlign: "right" }}>Loss</span>
          <span>Severity</span>
          <span>Date</span>
          <span style={{ textAlign: "center" }}>Reversed</span>
        </div>
        {impairments.map((imp, i) => (
          <motion.div
            key={imp.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, duration: 0.2 }}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 120px 80px 140px 100px 70px",
              gap: 8,
              alignItems: "center",
              background: i % 2 === 0 ? "#1a1a24" : "#1e1e32",
              borderRadius: 6,
              padding: "12px 16px",
              borderLeft: `3px solid ${severityColor(imp.impairmentLoss)}`,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <span style={{ color: "#e0e0e0", fontSize: 14, fontWeight: 500 }}>{imp.assetName}</span>
              <span style={{ color: "#666", fontSize: 11, fontFamily: "monospace" }}>{imp.assetTag}</span>
            </div>
            <span style={{ color: "#aaa", fontSize: 13 }}>{indicatorLabels[imp.indicator] || imp.indicator}</span>
            <span style={{ color: "#ef4444", fontSize: 13, textAlign: "right", fontFamily: "monospace", fontWeight: 600 }}>
              {formatCurrency(imp.impairmentLoss)}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: severityColor(imp.impairmentLoss),
                }}
              />
              <span
                style={{
                  color: severityColor(imp.impairmentLoss),
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: "capitalize",
                }}
              >
                {severityLabel(imp.impairmentLoss)}
              </span>
            </div>
            <span style={{ color: "#888", fontSize: 12 }}>
              {new Date(imp.impairmentDate).toLocaleDateString()}
            </span>
            <div style={{ display: "flex", justifyContent: "center" }}>
              {imp.reversed ? (
                <span style={{ color: "#22c55e", fontSize: 14, fontWeight: 700 }}>\u2713</span>
              ) : (
                <span style={{ color: "#555", fontSize: 14 }}>\u2014</span>
              )}
            </div>
          </motion.div>
        ))}
        {impairments.length === 0 && (
          <div style={{ color: "#888", fontSize: 14, textAlign: "center", padding: 32 }}>
            No impairment records found
          </div>
        )}
      </div>
    </motion.div>
  );
}
