"use client";

import { memo } from "react";
import Link from "next/link";
import { ArrowRight, AlertTriangle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AttentionItem } from "@/modules/dashboard";

const PRIORITY_STYLES: Record<AttentionItem["priority"], { label: string; className: string }> = {
  critical: { label: "Critical", className: "border-red-500/20 bg-red-500/5 text-red-400" },
  high: { label: "High", className: "border-amber-500/20 bg-amber-500/5 text-amber-400" },
  medium: { label: "Medium", className: "border-sky-500/20 bg-sky-500/5 text-sky-400" },
  low: { label: "Low", className: "border-zinc-500/20 bg-zinc-500/5 text-zinc-400" },
};

function AttentionRow({ item, rank }: { item: AttentionItem; rank: number }) {
  const priority = PRIORITY_STYLES[item.priority];
  return (
    <Link
      href={item.target}
      className={cn(
        "group relative flex items-start gap-3 rounded-lg border border-white/[0.06] bg-gradient-to-b from-zinc-900/40 to-black/30 px-3 py-2.5 transition-colors",
        "hover:border-white/[0.12] hover:bg-white/[0.02]",
      )}
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/[0.04] text-[11px] font-semibold text-zinc-500 tabular-nums">
        {rank}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-[13px] font-medium text-zinc-200">{item.title}</span>
          <span className={cn("shrink-0 rounded-full border px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide", priority.className)}>
            {priority.label}
          </span>
        </span>
        <span className="mt-0.5 block text-[11px] leading-relaxed text-zinc-500">{item.reason}</span>
        <span className="mt-1 flex items-center gap-3 text-[10px] text-zinc-600">
          <span>Impact {item.impact}</span>
          {item.due && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(item.due).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </span>
          )}
        </span>
      </span>
      <ArrowRight className="mt-2 h-3.5 w-3.5 shrink-0 text-zinc-600 transition-colors group-hover:text-gold" />
    </Link>
  );
}

interface DashboardAttentionQueueProps {
  items: AttentionItem[];
  className?: string;
}

export const DashboardAttentionQueue = memo(function DashboardAttentionQueue({
  items,
  className,
}: DashboardAttentionQueueProps) {
  return (
    <section aria-labelledby="dashboard-attention" className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-gold" />
        <h2 id="dashboard-attention" className="text-sm font-semibold text-zinc-300">
          Needs Your Attention
        </h2>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-zinc-900/40 to-black/30 p-5">
          <p className="text-[13px] text-zinc-400">Nothing needs your attention right now.</p>
          <p className="mt-1 text-[11px] text-zinc-600">
            New exceptions, overdue approvals, and SLA breaches will appear here.
          </p>
        </div>
      ) : (
        <ol className="space-y-2">
          {items.map((item, index) => (
            <li key={item.id}>
              <AttentionRow item={item} rank={index + 1} />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
});
