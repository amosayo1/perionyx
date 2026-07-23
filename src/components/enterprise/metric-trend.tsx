"use client";

import { cn } from "@/lib/utils";

interface MetricTrendProps {
  value: number;
  direction: "up" | "down" | "neutral";
  period?: string;
  className?: string;
}

const config = {
  up: { icon: "▲", text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  down: { icon: "▼", text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  neutral: { icon: "→", text: "text-zinc-400", bg: "bg-zinc-500/10", border: "border-zinc-500/20" },
};

export function MetricTrend({ value, direction, period, className }: MetricTrendProps) {
  const c = config[direction];
  const absValue = Math.abs(value);

  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium leading-none",
      c.bg, c.border, c.text, className,
    )}>
      <span className="text-[10px]">{c.icon}</span>
      <span>{absValue.toFixed(1)}%</span>
      {period && <span className="opacity-60">{period}</span>}
    </span>
  );
}
