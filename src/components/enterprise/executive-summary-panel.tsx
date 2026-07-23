"use client";

import { cn } from "@/lib/utils";

interface SummaryMetric {
  label: string;
  value: string | number;
  status: "positive" | "negative" | "neutral" | "attention";
  detail?: string;
}

interface ExecutiveSummaryPanelProps {
  title?: string;
  metrics: SummaryMetric[];
  className?: string;
}

const statusConfig = {
  positive: { dot: "bg-emerald-500", text: "text-emerald-400", label: "Positive" },
  negative: { dot: "bg-red-500", text: "text-red-400", label: "Needs Attention" },
  neutral: { dot: "bg-zinc-500", text: "text-zinc-400", label: "Stable" },
  attention: { dot: "bg-amber-500", text: "text-amber-400", label: "Review Required" },
};

export function ExecutiveSummaryPanel({
  title = "Executive Summary",
  metrics,
  className,
}: ExecutiveSummaryPanelProps) {
  return (
    <div className={cn("rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-5", className)}>
      <div className="mb-4 flex items-center gap-2">
        <span className="inline-flex items-center rounded-md border border-gold-500/20 bg-gold-500/10 px-2 py-0.5 text-[11px] font-medium tracking-wide text-[#c9a84c] uppercase">
          {title}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {metrics.map((metric) => {
          const sc = statusConfig[metric.status];
          return (
            <div key={metric.label} className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={cn("h-1.5 w-1.5 rounded-full", sc.dot)} />
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500">
                  {metric.label}
                </p>
              </div>
              <p className={cn("text-[20px] font-semibold leading-[28px] tracking-[-0.01em]", sc.text)}>
                {metric.value}
              </p>
              {metric.detail && (
                <p className="text-[11px] leading-[14px] text-zinc-600">{metric.detail}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
