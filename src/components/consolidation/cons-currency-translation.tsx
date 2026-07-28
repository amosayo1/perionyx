"use client";

import { motion } from "framer-motion";
import type { ConsCurrencyTranslationProps } from "./cons-types";

const statusColors: Record<string, string> = {
  draft: "#64748b",
  inProgress: "#3b82f6",
  completed: "#22c55e",
  review: "#eab308",
  approved: "#22c55e",
};

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

export default function ConsCurrencyTranslation({ translations }: ConsCurrencyTranslationProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {translations.map((t, i) => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          style={{ background: "#1a1a24", borderRadius: 10, padding: 16, border: "1px solid #2a2a4a", display: "flex", alignItems: "center", gap: 16 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 100 }}>
            <span style={{ color: "#e0e0e0", fontWeight: 700, fontSize: 18 }}>{t.sourceCurrency}</span>
            <span style={{ color: "#555", fontSize: 14 }}>{"\u2192"}</span>
            <span style={{ color: "#e0e0e0", fontWeight: 700, fontSize: 18 }}>{t.targetCurrency}</span>
          </div>

          <div style={{ display: "flex", gap: 20, flex: 1 }}>
            <div>
              <div style={{ color: "#888", fontSize: 11, textTransform: "uppercase" }}>Avg Rate</div>
              <div style={{ color: "#e0e0e0", fontSize: 14, fontWeight: 600, fontFamily: "ui-monospace, monospace" }}>{t.averageRate.toFixed(4)}</div>
            </div>
            <div>
              <div style={{ color: "#888", fontSize: 11, textTransform: "uppercase" }}>Closing Rate</div>
              <div style={{ color: "#e0e0e0", fontSize: 14, fontWeight: 600, fontFamily: "ui-monospace, monospace" }}>{t.closingRate.toFixed(4)}</div>
            </div>
            <div>
              <div style={{ color: "#888", fontSize: 11, textTransform: "uppercase" }}>CTA</div>
              <div style={{ color: t.ctaAmount >= 0 ? "#22c55e" : "#ef4444", fontSize: 14, fontWeight: 600 }}>
                {t.ctaAmount >= 0 ? "+" : ""}{formatCurrency(t.ctaAmount)}
              </div>
            </div>
          </div>

          <span style={{ color: t.translationMethod === "average" ? "#3b82f6" : t.translationMethod === "closing" ? "#a855f7" : "#eab308", fontSize: 11, fontWeight: 600, textTransform: "capitalize" }}>
            {t.translationMethod}
          </span>

          <span
            style={{
              background: `${statusColors[t.status]}22`,
              color: statusColors[t.status],
              padding: "2px 10px",
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 600,
              textTransform: "capitalize",
              whiteSpace: "nowrap",
            }}
          >
            {t.status === "inProgress" ? "In Progress" : t.status}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
}
