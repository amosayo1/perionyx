"use client";

import { memo } from "react";
import { Calendar, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MaturityLadderEntry } from "./investment-types";

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
}

interface MaturityLadderProps {
  ladder: MaturityLadderEntry[];
  className?: string;
}

const BUCKET_LABELS: Record<string, string> = {
  "30-days": "30 Days",
  "60-days": "60 Days",
  "90-days": "90 Days",
  "180-days": "180 Days",
  "365-days": "1 Year",
  "2-years": "2 Years",
  "5-years": "5 Years",
  "10-years": "10 Years",
  "over-10-years": "10+ Years",
};

const BUCKET_COLORS: Record<string, string> = {
  "30-days": "bg-emerald-500",
  "60-days": "bg-emerald-400",
  "90-days": "bg-teal-500",
  "180-days": "bg-blue-500",
  "365-days": "bg-blue-400",
  "2-years": "bg-amber-500",
  "5-years": "bg-amber-400",
  "10-years": "bg-orange-500",
  "over-10-years": "bg-red-500",
};

export const MaturityLadder = memo(function MaturityLadder({ ladder, className }: MaturityLadderProps) {
  const maxValue = Math.max(...ladder.map((e) => e.value), 1);
  const totalValue = ladder.reduce((s, e) => s + e.value, 0);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
        <div className="mb-4 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[#d4af37]" />
          <h3 className="text-sm font-semibold text-white">Maturity Ladder</h3>
          <span className="ml-auto text-[11px] text-zinc-500">Total: {formatCurrency(totalValue)}</span>
        </div>

        <div className="space-y-3">
          {ladder.map((entry) => {
            const pct = (entry.value / maxValue) * 100;
            const color = BUCKET_COLORS[entry.bucket] ?? "bg-zinc-500";
            return (
              <div key={entry.bucket}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-zinc-400">{BUCKET_LABELS[entry.bucket] ?? entry.bucket}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{formatCurrency(entry.value)}</span>
                    <span className="text-zinc-600">{entry.percentage.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className={cn("h-full rounded-full transition-all", color)}
                    style={{ width: `${Math.max(pct, 1)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3">
          <p className="text-[11px] text-zinc-500">Short-term (≤90d)</p>
          <p className="text-lg font-bold text-white">
            {formatCurrency(ladder.filter((e) => ["30-days", "60-days", "90-days"].includes(e.bucket)).reduce((s, e) => s + e.value, 0))}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3">
          <p className="text-[11px] text-zinc-500">Medium-term (180d-2y)</p>
          <p className="text-lg font-bold text-white">
            {formatCurrency(ladder.filter((e) => ["180-days", "365-days", "2-years"].includes(e.bucket)).reduce((s, e) => s + e.value, 0))}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3">
          <p className="text-[11px] text-zinc-500">Long-term (5y+)</p>
          <p className="text-lg font-bold text-white">
            {formatCurrency(ladder.filter((e) => ["5-years", "10-years", "over-10-years"].includes(e.bucket)).reduce((s, e) => s + e.value, 0))}
          </p>
        </div>
      </div>
    </div>
  );
});
