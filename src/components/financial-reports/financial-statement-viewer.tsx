"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { SectionTransition, SectionItem } from "@/components/enterprise/motion/section-transition";
import type { ReportSection, ReportRow } from "@/modules/financial-reporting/types";
import { ChevronDown, ChevronRight } from "lucide-react";

interface FinancialStatementViewerProps {
  sections: ReportSection[];
  onDrillDown?: (row: ReportRow) => void;
  compact?: boolean;
}

function formatCurrency(val: number, compact?: boolean): string {
  if (compact && Math.abs(val) >= 1_000_000) {
    return `${val < 0 ? "(" : ""}$${(Math.abs(val) / 1_000_000).toFixed(1)}M${val < 0 ? ")" : ""}`;
  }
  if (compact && Math.abs(val) >= 1_000) {
    return `${val < 0 ? "(" : ""}$${(Math.abs(val) / 1_000).toFixed(1)}K${val < 0 ? ")" : ""}`;
  }
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Math.abs(val));
  return val < 0 ? `(${formatted})` : formatted;
}

function RowDisplay({
  row,
  depth,
  compact,
  onDrillDown,
}: {
  row: ReportRow;
  depth: number;
  compact?: boolean;
  onDrillDown?: (row: ReportRow) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = row.children && row.children.length > 0;

  const isTotal = row.type === "total" || row.type === "subtotal";
  const isHeader = row.type === "header" || row.type === "section-header";

  const mainValue = row.values["amount"] as number | undefined;
  const priorValue = row.priorValues?.["amount"];
  const variance = row.variance?.["amount"];
  const variancePct = row.variancePercent?.["amount"];

  const hasDrillDown = row.sourceReferences && row.sourceReferences.length > 0 && onDrillDown;

  return (
    <div>
      <div
        className={cn(
          "flex items-center border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]",
          isTotal && "border-b-2 border-zinc-700 bg-zinc-900/40",
          isHeader && "bg-zinc-900/60",
        )}
        style={{ paddingLeft: `${depth * 16 + 12}px` }}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2 py-2">
          {hasChildren && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="shrink-0 text-zinc-500 hover:text-zinc-300"
            >
              {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </button>
          )}
          {!hasChildren && <div className="w-3 shrink-0" />}
          <span
            className={cn(
              "truncate text-sm",
              isTotal && "font-bold text-white",
              isHeader && "text-xs font-semibold uppercase tracking-wider text-zinc-400",
              !isTotal && !isHeader && "text-zinc-300",
              hasDrillDown && "cursor-pointer text-amber-400/80 hover:text-amber-400",
            )}
            onClick={() => hasDrillDown && onDrillDown?.(row)}
          >
            {row.label}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-4 px-4">
          {mainValue != null && (
            <span
              className={cn(
                "min-w-[100px] text-right text-sm tabular-nums",
                isTotal && "font-bold text-white",
                isTotal && row.type === "total" && "border-t-2 border-amber-400/60 pt-0.5",
                !isTotal && "text-zinc-300",
              )}
            >
              {formatCurrency(mainValue, compact)}
            </span>
          )}

          {priorValue != null && (
            <span className="min-w-[100px] text-right text-xs tabular-nums text-zinc-500">
              {formatCurrency(priorValue, compact)}
            </span>
          )}

          {variance != null && (
            <span
              className={cn(
                "min-w-[80px] text-right text-xs tabular-nums",
                variance >= 0 ? "text-emerald-400" : "text-red-400",
              )}
            >
              {formatCurrency(variance, compact)}
              {variancePct != null && (
                <span className="ml-1 text-[10px] opacity-70">
                  ({variancePct >= 0 ? "+" : ""}{variancePct.toFixed(1)}%)
                </span>
              )}
            </span>
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {hasChildren && expanded && (
          <motion.div
            key={`children-${row.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {row.children!.map((child) => (
              <RowDisplay
                key={child.id}
                row={child}
                depth={depth + 1}
                compact={compact}
                onDrillDown={onDrillDown}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FinancialStatementViewer({
  sections,
  onDrillDown,
  compact,
}: FinancialStatementViewerProps) {
  if (sections.length === 0) {
    return <div className="py-12 text-center text-sm text-zinc-500">No financial data available</div>;
  }

  return (
    <div className="space-y-6">
      {sections.map((section, idx) => (
        <SectionTransition key={section.id || idx}>
          <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-zinc-900/20">
            <div className="border-l-2 border-amber-400/60 px-4 py-3">
              <h3 className="text-sm font-semibold text-white">{section.title}</h3>
              {section.subtitle && <p className="mt-0.5 text-xs text-zinc-500">{section.subtitle}</p>}
            </div>

            <div className="border-b border-white/[0.06]">
              <div className="flex items-center px-4 py-1.5" style={{ paddingLeft: "12px" }}>
                <div className="flex-1" />
                <div className="flex shrink-0 items-center gap-4 px-4">
                  <span className="min-w-[100px] text-right text-[11px] font-medium text-zinc-500">Amount</span>
                  {section.rows[0]?.priorValues && (
                    <span className="min-w-[100px] text-right text-[11px] font-medium text-zinc-500">Prior</span>
                  )}
                  {section.rows[0]?.variance != null && (
                    <span className="min-w-[80px] text-right text-[11px] font-medium text-zinc-500">Variance</span>
                  )}
                </div>
              </div>
            </div>

            <SectionItem>
              {section.rows.map((row) => (
                <SectionItem key={row.id}>
                  <RowDisplay
                    row={row}
                    depth={row.depth || 0}
                    compact={compact}
                    onDrillDown={onDrillDown}
                  />
                </SectionItem>
              ))}
            </SectionItem>

            {section.notes && section.notes.length > 0 && (
              <div className="border-t border-white/[0.04] px-4 py-2">
                {section.notes.map((note, i) => (
                  <p key={i} className="text-[11px] text-zinc-600">{note}</p>
                ))}
              </div>
            )}
          </div>
        </SectionTransition>
      ))}
    </div>
  );
}
