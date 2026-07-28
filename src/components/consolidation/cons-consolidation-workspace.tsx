"use client";

import { motion } from "framer-motion";
import type { ConsConsolidationWorkspaceProps } from "./cons-types";

const stageLabels: Record<string, string> = {
  draft: "Draft",
  dataCollection: "Data Collection",
  translation: "Translation",
  elimination: "Elimination",
  minorityInterest: "Minority Interest",
  adjustments: "Adjustments",
  review: "Review",
  approved: "Approved",
  locked: "Locked",
};

const stageColors: Record<string, string> = {
  draft: "#64748b",
  dataCollection: "#3b82f6",
  translation: "#a855f7",
  elimination: "#f97316",
  minorityInterest: "#eab308",
  adjustments: "#d4af37",
  review: "#14b8a6",
  approved: "#22c55e",
  locked: "#ef4444",
};

const stages = ["draft", "dataCollection", "translation", "elimination", "minorityInterest", "adjustments", "review", "approved", "locked"];

const statusOrder: Record<string, number> = {};
stages.forEach((s, i) => { statusOrder[s] = i; });

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

export default function ConsConsolidationWorkspace({ runs }: ConsConsolidationWorkspaceProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {runs.map((run, ri) => {
        const currentStageIndex = statusOrder[run.status] ?? 0;
        return (
          <motion.div
            key={run.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: ri * 0.05 }}
            style={{ background: "#1a1a24", borderRadius: 12, padding: 20, border: "1px solid #2a2a4a" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div>
                <span style={{ color: "#e0e0e0", fontWeight: 600, fontSize: 15 }}>{run.label}</span>
                <span style={{ color: "#94a3b8", fontSize: 12, marginLeft: 12 }}>
                  {run.runType} · FY{run.fiscalYear} P{run.fiscalPeriod}
                </span>
              </div>
              <span
                style={{
                  background: `${stageColors[run.status]}22`,
                  color: stageColors[run.status],
                  padding: "4px 12px",
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "capitalize",
                }}
              >
                {stageLabels[run.status] || run.status}
              </span>
            </div>

            <div style={{ display: "flex", gap: 4, marginBottom: 12, alignItems: "center" }}>
              {stages.map((stage, si) => {
                const isCompleted = si < currentStageIndex;
                const isCurrent = si === currentStageIndex;
                const isPending = si > currentStageIndex;
                return (
                  <div key={stage} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div
                      style={{
                        width: "100%",
                        height: 4,
                        borderRadius: 2,
                        background: isCompleted ? stageColors[stage] : isCurrent ? "#d4af37" : "#2a2a4a",
                      }}
                    />
                    <span style={{ fontSize: 9, color: isCompleted ? "#94a3b8" : isCurrent ? "#d4af37" : "#555", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                      {stageLabels[stage]}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#94a3b8" }}>
              <span>{run.entitiesCompleted.length}/{run.entitiesIncluded.length} entities</span>
              <span>{run.completedSteps}/{run.totalSteps} steps</span>
              {run.reviewNotes && <span style={{ color: "#d4af37" }}>Notes: {run.reviewNotes}</span>}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
