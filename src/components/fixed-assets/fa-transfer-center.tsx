"use client";

import { motion } from "framer-motion";
import type { FATransferCenterProps } from "./fa-types";

const reasonColors: Record<string, string> = {
  relocation: "#3b82f6",
  reorganization: "#f97316",
  departmentChange: "#eab308",
  costCenterChange: "#8b5cf6",
  saleLeaseback: "#22c55e",
  other: "#888",
};

const reasonLabels: Record<string, string> = {
  relocation: "Relocation",
  reorganization: "Reorganization",
  departmentChange: "Dept Change",
  costCenterChange: "CC Change",
  saleLeaseback: "Sale-Leaseback",
  other: "Other",
};

export default function FATransferCenter({ assets }: FATransferCenterProps) {
  const transfers = assets
    .flatMap((a) =>
      a.transfers.map((t) => ({
        ...t,
        assetName: a.name,
        assetTag: a.assetTag,
      }))
    )
    .sort((a, b) => new Date(b.transferDate).getTime() - new Date(a.transferDate).getTime());

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
    >
      <h3 style={{ color: "#e0e0e0", fontSize: 18, fontWeight: 700, margin: 0 }}>
        Transfer Center
        <span style={{ color: "#888", fontSize: 14, fontWeight: 400, marginLeft: 8 }}>
          {transfers.length} records
        </span>
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 120px 100px 80px",
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
          <span>From</span>
          <span>To</span>
          <span>Reason</span>
          <span>Date</span>
          <span style={{ textAlign: "center" }}>Status</span>
        </div>
        {transfers.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03, duration: 0.2 }}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 120px 100px 80px",
              gap: 8,
              alignItems: "center",
              background: i % 2 === 0 ? "#1a1a2e" : "#1e1e32",
              borderRadius: 6,
              padding: "12px 16px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <span style={{ color: "#e0e0e0", fontSize: 14, fontWeight: 500 }}>{t.assetName}</span>
              <span style={{ color: "#666", fontSize: 11, fontFamily: "monospace" }}>{t.assetTag}</span>
            </div>
            <span style={{ color: "#aaa", fontSize: 13 }}>{t.fromDepartment || "\u2014"}</span>
            <span style={{ color: "#e0e0e0", fontSize: 13, fontWeight: 500 }}>{t.toDepartment || "\u2014"}</span>
            <span
              style={{
                background: `${reasonColors[t.reason]}20`,
                color: reasonColors[t.reason],
                padding: "2px 8px",
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 600,
                justifySelf: "start",
              }}
            >
              {reasonLabels[t.reason]}
            </span>
            <span style={{ color: "#888", fontSize: 12 }}>
              {new Date(t.transferDate).toLocaleDateString()}
            </span>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: t.approvedBy ? "#22c55e" : "#eab308",
                }}
                title={t.approvedBy ? "Approved" : "Pending"}
              />
            </div>
          </motion.div>
        ))}
        {transfers.length === 0 && (
          <div style={{ color: "#888", fontSize: 14, textAlign: "center", padding: 32 }}>
            No transfer records found
          </div>
        )}
      </div>
    </motion.div>
  );
}
