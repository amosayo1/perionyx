"use client";

import { motion } from "framer-motion";
import type { ConsOwnershipTreeProps } from "./cons-types";

const ownershipTypeColors: Record<string, string> = {
  direct: "#3b82f6",
  indirect: "#a855f7",
  cross: "#ef4444",
};

const methodColors: Record<string, string> = {
  full: "#22c55e",
  proportional: "#eab308",
  equity: "#f97316",
};

function renderNode(node: import("@/server/consolidation").GroupNode, depth: number, maxDepth: number) {
  const lineColor = node.ownershipPercentage >= 50 ? "#3b82f6" : node.ownershipPercentage >= 20 ? "#a855f7" : "#64748b";
  return (
    <div key={node.entityId}>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: depth * 0.03 }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          marginLeft: depth * 28,
          background: depth % 2 === 0 ? "#1a1a2e" : "#16213e",
          borderRadius: 6,
          border: "1px solid #2a2a4a",
          borderLeft: `3px solid ${lineColor}`,
          marginBottom: 4,
          fontSize: 13,
        }}
      >
        {depth > 0 && (
          <span style={{ color: "#555", fontSize: 10, fontFamily: "ui-monospace, monospace", minWidth: 20 }}>
            {"\u2514".repeat(1)}
          </span>
        )}
        <span style={{ color: "#e0e0e0", fontWeight: 500, minWidth: 120 }}>{node.legalName}</span>
        <span style={{ color: "#94a3b8", fontSize: 11 }}>{node.entityCode}</span>
        <span
          style={{
            background: `${methodColors[node.consolidationMethod] || "#888"}22`,
            color: methodColors[node.consolidationMethod] || "#888",
            padding: "2px 6px",
            borderRadius: 4,
            fontSize: 10,
            fontWeight: 600,
            textTransform: "capitalize",
          }}
        >
          {node.consolidationMethod}
        </span>
        <span style={{ color: "#d4a843", fontWeight: 600, fontSize: 12, marginLeft: "auto" }}>
          {node.ownershipPercentage}%
        </span>
      </motion.div>
      {node.children.map((child) => renderNode(child, depth + 1, maxDepth))}
    </div>
  );
}

export default function ConsOwnershipTree({ nodes }: ConsOwnershipTreeProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {nodes.map((node) => renderNode(node, 0, 8))}
    </motion.div>
  );
}
