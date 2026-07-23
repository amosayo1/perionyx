"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar, Download, ZoomIn, RefreshCw } from "lucide-react";
import type { ComparisonPeriod } from "./types";

interface ChartToolbarProps {
  title: string;
  description?: string;
  period?: ComparisonPeriod;
  onPeriodChange?: (period: ComparisonPeriod) => void;
  comparisonMode?: "none" | "previous" | "budget" | "forecast";
  onComparisonChange?: (mode: "none" | "previous" | "budget" | "forecast") => void;
  onExport?: () => void;
  onDrillDown?: () => void;
  onRefresh?: () => void;
  loading?: boolean;
  className?: string;
}

const PERIODS: { value: ComparisonPeriod; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "quarter", label: "Quarter" },
  { value: "year", label: "Year" },
  { value: "custom", label: "Custom" },
];

const COMPARISONS: { value: "none" | "previous" | "budget" | "forecast"; label: string }[] = [
  { value: "none", label: "No comparison" },
  { value: "previous", label: "vs Previous" },
  { value: "budget", label: "vs Budget" },
  { value: "forecast", label: "vs Forecast" },
];

export function ChartToolbar({
  title,
  description,
  period = "month",
  onPeriodChange,
  comparisonMode = "none",
  onComparisonChange,
  onExport,
  onDrillDown,
  onRefresh,
  loading,
  className,
}: ChartToolbarProps) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {description && <p className="mt-0.5 text-xs text-zinc-500">{description}</p>}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {onPeriodChange && (
          <div className="flex items-center gap-0.5 rounded-lg border border-white/[0.06] bg-zinc-900/60 p-0.5">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => onPeriodChange(p.value)}
                className={cn(
                  "rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
                  period === p.value
                    ? "bg-[#c9a84c]/10 text-[#c9a84c]"
                    : "text-zinc-500 hover:text-zinc-300",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}

        {onComparisonChange && (
          <div className="flex items-center gap-0.5 rounded-lg border border-white/[0.06] bg-zinc-900/60 p-0.5">
            {COMPARISONS.map((c) => (
              <button
                key={c.value}
                onClick={() => onComparisonChange(c.value)}
                className={cn(
                  "rounded-md px-2 py-1 text-[11px] font-medium transition-colors whitespace-nowrap",
                  comparisonMode === c.value
                    ? "bg-[#c9a84c]/10 text-[#c9a84c]"
                    : "text-zinc-500 hover:text-zinc-300",
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1">
          {onDrillDown && (
            <Button variant="ghost" size="sm" onClick={onDrillDown} className="h-7 w-7 p-0 text-zinc-500 hover:text-white" aria-label="Drill down">
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
          )}
          {onExport && (
            <Button variant="ghost" size="sm" onClick={onExport} className="h-7 w-7 p-0 text-zinc-500 hover:text-white" aria-label="Export">
              <Download className="h-3.5 w-3.5" />
            </Button>
          )}
          {onRefresh && (
            <Button variant="ghost" size="sm" onClick={onRefresh} disabled={loading} className="h-7 w-7 p-0 text-zinc-500 hover:text-white" aria-label="Refresh">
              <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
