"use client";

import { motion } from "framer-motion";
import type { FARegistryGridProps } from "./fa-types";

const statusColors: Record<string, string> = {
  requested: "#888",
  approved: "#3b82f6",
  acquired: "#3b82f6",
  capitalized: "#22c55e",
  inService: "#22c55e",
  underMaintenance: "#eab308",
  impaired: "#f97316",
  revalued: "#d4a843",
  disposed: "#ef4444",
  retired: "#ef4444",
  archived: "#888",
};

const categoryColors: Record<string, string> = {
  land: "#22c55e",
  building: "#3b82f6",
  leasehold: "#8b5cf6",
  machinery: "#f97316",
  equipment: "#d4a843",
  vehicles: "#eab308",
  furniture: "#888",
  computers: "#06b6d4",
  software: "#3b82f6",
  intangible: "#8b5cf6",
  other: "#888",
};

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

export default function FARegistryGrid({ assets }: FARegistryGridProps) {
  const totalCost = assets.reduce((s, a) => s + a.acquisition.totalCost, 0);
  const totalNBV = assets.reduce((s, a) => s + a.depreciationDetails.netBookValue, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ display: "flex", flexDirection: "column", gap: 8 }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "120px 1fr 100px 100px 120px 120px 140px",
          gap: 8,
          padding: "0 16px",
          color: "#888",
          fontSize: 12,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        <span>Asset Tag</span>
        <span>Name</span>
        <span>Category</span>
        <span>Status</span>
        <span style={{ textAlign: "right" }}>Cost</span>
        <span style={{ textAlign: "right" }}>NBV</span>
        <span>Custodian</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {assets.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03, duration: 0.2 }}
            style={{
              display: "grid",
              gridTemplateColumns: "120px 1fr 100px 100px 120px 120px 140px",
              gap: 8,
              alignItems: "center",
              background: i % 2 === 0 ? "#1a1a2e" : "#1e1e32",
              borderRadius: 6,
              padding: "12px 16px",
            }}
          >
            <span style={{ color: "#666", fontSize: 12, fontFamily: "monospace" }}>{a.assetTag}</span>
            <span style={{ color: "#e0e0e0", fontSize: 14, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</span>
            <span
              style={{
                background: `${categoryColors[a.category]}20`,
                color: categoryColors[a.category],
                padding: "2px 8px",
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 600,
                justifySelf: "start",
                textTransform: "capitalize",
              }}
            >
              {a.category}
            </span>
            <span
              style={{
                background: `${statusColors[a.status]}20`,
                color: statusColors[a.status],
                padding: "2px 8px",
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 600,
                justifySelf: "start",
                textTransform: "capitalize",
              }}
            >
              {a.status === "underMaintenance" ? "Maint" : a.status}
            </span>
            <span style={{ color: "#e0e0e0", fontSize: 13, textAlign: "right", fontFamily: "monospace" }}>
              {formatCurrency(a.acquisition.totalCost)}
            </span>
            <span style={{ color: "#e0e0e0", fontSize: 13, textAlign: "right", fontFamily: "monospace" }}>
              {formatCurrency(a.depreciationDetails.netBookValue)}
            </span>
            <span style={{ color: "#aaa", fontSize: 13 }}>{a.custodian || "\u2014"}</span>
          </motion.div>
        ))}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "120px 1fr 100px 100px 120px 120px 140px",
          gap: 8,
          padding: "16px 16px 0",
          borderTop: "1px solid #2a2a3e",
          marginTop: 4,
          color: "#e0e0e0",
          fontSize: 14,
          fontWeight: 700,
        }}
      >
        <span />
        <span>{assets.length} assets</span>
        <span />
        <span />
        <span style={{ textAlign: "right", fontFamily: "monospace" }}>{formatCurrency(totalCost)}</span>
        <span style={{ textAlign: "right", fontFamily: "monospace" }}>{formatCurrency(totalNBV)}</span>
        <span />
      </div>
    </motion.div>
  );
}
