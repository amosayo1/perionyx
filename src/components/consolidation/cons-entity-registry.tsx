"use client";

import { motion } from "framer-motion";
import type { ConsEntityRegistryProps } from "./cons-types";

const entityTypeColors: Record<string, string> = {
  holding: "#d4af37",
  parent: "#3b82f6",
  subsidiary: "#22c55e",
  jointVenture: "#a855f7",
  associate: "#f97316",
  branch: "#64748b",
  businessUnit: "#14b8a6",
  profitCenter: "#eab308",
  costCenter: "#888",
};

const statusColors: Record<string, string> = {
  active: "#22c55e",
  dormant: "#eab308",
  dissolved: "#ef4444",
  acquired: "#3b82f6",
  divested: "#a855f7",
};

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

export default function ConsEntityRegistry({ entities }: ConsEntityRegistryProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 100px 80px 80px 80px 80px", gap: 8, padding: "12px 16px", background: "#2a2a3e", borderRadius: 8, fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
        <span>Code</span>
        <span>Legal Name</span>
        <span>Type</span>
        <span>Country</span>
        <span>Currency</span>
        <span>Method</span>
        <span>Status</span>
      </div>
      {entities.map((e, i) => (
        <motion.div
          key={e.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.02, duration: 0.2 }}
          style={{
            display: "grid",
            gridTemplateColumns: "100px 1fr 100px 80px 80px 80px 80px",
            gap: 8,
            padding: "10px 16px",
            background: "#1a1a24",
            borderRadius: 6,
            alignItems: "center",
            border: "1px solid #2a2a4a",
            fontSize: 13,
          }}
        >
          <span style={{ color: "#e0e0e0", fontFamily: "ui-monospace, monospace", fontSize: 12 }}>{e.entityCode}</span>
          <span style={{ color: "#e0e0e0", fontWeight: 500 }}>{e.legalName}</span>
          <span
            style={{
              background: `${entityTypeColors[e.entityType] || "#888"}22`,
              color: entityTypeColors[e.entityType] || "#888",
              padding: "2px 8px",
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 600,
              textTransform: "capitalize",
              textAlign: "center",
            }}
          >
            {e.entityType.replace(/([A-Z])/g, " $1").trim()}
          </span>
          <span style={{ color: "#94a3b8", fontSize: 12 }}>{e.country}</span>
          <span style={{ color: "#94a3b8", fontSize: 12 }}>{e.functionalCurrency}</span>
          <span style={{ color: "#94a3b8", fontSize: 12, textTransform: "capitalize" }}>{e.consolidationMethod}</span>
          <span
            style={{
              background: `${statusColors[e.status] || "#888"}22`,
              color: statusColors[e.status] || "#888",
              padding: "2px 8px",
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 600,
              textTransform: "capitalize",
              textAlign: "center",
            }}
          >
            {e.status}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
}
