"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeInUp, fadeIn } from "@/components/enterprise/motion/tokens";
import { AnimatedCard } from "@/components/enterprise/motion/animated-card";
import { ReportViewerTab } from "./types";
import { FinancialStatementViewer } from "./financial-statement-viewer";
import { AiCommentaryPanel } from "./ai-commentary-panel";
import { DrillDownModal } from "./drill-down-modal";
import type { ReportExecution, ReportRow } from "@/modules/financial-reporting/types";
import { X, Download, Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const tabs: ReportViewerTab[] = [
  { id: "statement", label: "Statement" },
  { id: "summary", label: "Summary" },
  { id: "commentary", label: "AI Commentary" },
  { id: "details", label: "Details" },
];

const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string }> = {
  completed: { icon: CheckCircle2, color: "text-emerald-400" },
  running: { icon: Loader2, color: "text-amber-400" },
  failed: { icon: AlertCircle, color: "text-red-400" },
  pending: { icon: Clock, color: "text-zinc-400" },
  cancelled: { icon: X, color: "text-zinc-500" },
};

interface ReportViewerProps {
  execution: ReportExecution | null;
  loading?: boolean;
  onClose?: () => void;
}

export function ReportViewer({ execution, loading, onClose }: ReportViewerProps) {
  const [activeTab, setActiveTab] = useState("statement");
  const [drillDownRow, setDrillDownRow] = useState<ReportRow | null>(null);

  if (!execution) {
    return (
      <div className="flex h-full flex-col items-center justify-center py-20">
        <p className="text-zinc-500">{loading ? "Loading report..." : "No report data available"}</p>
      </div>
    );
  }

  const StatusIcon = statusConfig[execution.status]?.icon ?? Clock;
  const statusColor = statusConfig[execution.status]?.color ?? "text-zinc-400";

  const handleDrillDown = useCallback((row: ReportRow) => {
    if (row.sourceReferences && row.sourceReferences.length > 0) {
      setDrillDownRow(row);
    }
  }, []);

  const summaryMetrics = useMemo(() => {
    if (!execution.sections) return [];
    const metrics: { label: string; value: string }[] = [];
    for (const section of execution.sections) {
      if (section.totals) {
        for (const [key, val] of Object.entries(section.totals)) {
          metrics.push({
            label: `${section.title} (${key})`,
            value: new Intl.NumberFormat("en-US", { style: "currency", currency: execution.config.currency || "USD" }).format(val),
          });
        }
      }
    }
    return metrics;
  }, [execution]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">{execution.reportType.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</h2>
            <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
              <StatusIcon className={cn("h-3.5 w-3.5", statusColor, execution.status === "running" && "animate-spin")} />
              <span className={cn("capitalize", statusColor)}>{execution.status}</span>
              <span className="text-zinc-600">|</span>
              <Clock className="h-3 w-3" />
              <span>{(execution.executionTimeMs / 1000).toFixed(1)}s</span>
              <span className="text-zinc-600">|</span>
              <span>{execution.totalRows} rows</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {}}
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.1] px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-white"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-white"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-0 border-b border-white/[0.06] px-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative px-4 py-3 text-xs font-medium transition-colors",
              activeTab === tab.id ? "text-amber-400" : "text-zinc-500 hover:text-zinc-300",
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="active-tab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400"
              />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          {activeTab === "statement" && (
            <motion.div
              key="statement"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="p-6"
            >
              <FinancialStatementViewer
                sections={execution.sections}
                onDrillDown={handleDrillDown}
                compact={execution.config.compact}
              />
            </motion.div>
          )}

          {activeTab === "summary" && (
            <motion.div
              key="summary"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {summaryMetrics.map((metric, i) => (
                <AnimatedCard key={i} className="p-4">
                  <p className="text-xs text-zinc-500">{metric.label}</p>
                  <p className="mt-1 text-xl font-semibold text-white">{metric.value}</p>
                </AnimatedCard>
              ))}
              {summaryMetrics.length === 0 && (
                <div className="col-span-full py-12 text-center text-sm text-zinc-500">
                  No summary metrics available
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "commentary" && (
            <motion.div
              key="commentary"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="p-6"
            >
              <AiCommentaryPanel commentary={execution.summary ?? null} />
            </motion.div>
          )}

          {activeTab === "details" && (
            <motion.div
              key="details"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="overflow-x-auto p-6"
            >
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] text-xs text-zinc-500">
                    <th className="pb-2 pr-4 font-medium">Account</th>
                    {execution.sections[0]?.columns?.map((col) => (
                      <th key={col} className="pb-2 pr-4 font-medium">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {execution.sections.flatMap((section) =>
                    section.rows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-white/[0.03] text-zinc-300 last:border-0 hover:bg-white/[0.02]"
                      >
                        <td className="py-2 pr-4" style={{ paddingLeft: `${row.depth * 16 + 4}px` }}>
                          {row.label}
                        </td>
                        {execution.sections[0]?.columns?.map((col) => (
                          <td key={col} className="py-2 pr-4 text-right tabular-nums">
                            {row.values[col] != null
                              ? typeof row.values[col] === "number"
                                ? new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(row.values[col] as number)
                                : String(row.values[col])
                              : "—"}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {execution.sections.every((s) => s.rows.length === 0) && (
                <div className="py-12 text-center text-sm text-zinc-500">No detail data available</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <DrillDownModal row={drillDownRow} onClose={() => setDrillDownRow(null)} />
    </div>
  );
}
