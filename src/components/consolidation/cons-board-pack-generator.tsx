"use client";

import { motion } from "framer-motion";
import type { ConsBoardPackGeneratorProps } from "./cons-types";

const trendIcons: Record<string, string> = {
  up: "\u2191",
  down: "\u2193",
  stable: "\u2192",
};

const trendColors: Record<string, string> = {
  up: "#22c55e",
  down: "#ef4444",
  stable: "#888",
};

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

export default function ConsBoardPackGenerator({ reports }: ConsBoardPackGeneratorProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {reports.map((report, ri) => (
        <motion.div
          key={report.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: ri * 0.06 }}
          style={{ background: "#1a1a24", borderRadius: 12, padding: 20, border: "1px solid #2a2a4a" }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <span style={{ color: "#e0e0e0", fontWeight: 600, fontSize: 16 }}>{report.title}</span>
              <span style={{ color: "#94a3b8", fontSize: 12, marginLeft: 12 }}>{new Date(report.preparedDate).toLocaleDateString()}</span>
            </div>
            <span style={{ color: "#888", fontSize: 12, fontWeight: 500 }}>{report.currency}</span>
          </div>

          <div style={{ background: "#16213e", borderRadius: 8, padding: 14, marginBottom: 12 }}>
            <div style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.5 }}>{report.executiveSummary}</div>
          </div>

          {report.sections.map((section, si) => (
            <div key={si} style={{ marginBottom: 12, padding: 12, background: "#16213e", borderRadius: 8 }}>
              <div style={{ color: "#d4af37", fontWeight: 600, fontSize: 13, marginBottom: 8 }}>{section.title}</div>
              <div style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.5, marginBottom: 8 }}>{section.content}</div>
              {section.metrics.length > 0 && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {section.metrics.map((m, mi) => (
                    <div
                      key={mi}
                      style={{
                        background: "#1a1a24",
                        borderRadius: 6,
                        padding: "6px 12px",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 12,
                      }}
                    >
                      <span style={{ color: "#888" }}>{m.label}:</span>
                      <span style={{ color: "#e0e0e0", fontWeight: 600 }}>{m.value}</span>
                      {m.trend && (
                        <span style={{ color: trendColors[m.trend], fontSize: 14 }}>{trendIcons[m.trend]}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#888", marginBottom: 4, textTransform: "uppercase", fontSize: 10, letterSpacing: "0.5px" }}>Key Highlights</div>
              {report.keyHighlights.map((h, i) => (
                <div key={i} style={{ display: "flex", gap: 6, marginBottom: 4, color: "#22c55e", fontSize: 12 }}>
                  <span>●</span>
                  <span style={{ color: "#94a3b8" }}>{h}</span>
                </div>
              ))}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#888", marginBottom: 4, textTransform: "uppercase", fontSize: 10, letterSpacing: "0.5px" }}>Key Risks</div>
              {report.keyRisks.map((r, i) => (
                <div key={i} style={{ display: "flex", gap: 6, marginBottom: 4, color: "#ef4444", fontSize: 12 }}>
                  <span>●</span>
                  <span style={{ color: "#94a3b8" }}>{r}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
