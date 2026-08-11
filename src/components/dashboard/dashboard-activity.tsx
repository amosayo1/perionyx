"use client";

import { memo } from "react";
import Link from "next/link";
import { CheckCircle2, AlertTriangle, ArrowRightLeft, Zap, DollarSign, FileText, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActivityTimelineItem } from "@/modules/dashboard";

const TYPE_ICONS: Record<string, LucideIcon> = {
  approval: CheckCircle2,
  exception: AlertTriangle,
  match: ArrowRightLeft,
  automation: Zap,
  payment: DollarSign,
  report: FileText,
};

const TYPE_COLORS: Record<string, string> = {
  approval: "text-emerald-400",
  exception: "text-amber-400",
  match: "text-blue-400",
  automation: "text-purple-400",
  payment: "text-cyan-400",
  report: "text-zinc-400",
};

function formatTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

interface DashboardActivityProps {
  items: ActivityTimelineItem[];
  className?: string;
}

export const DashboardActivity = memo(function DashboardActivity({
  items,
  className,
}: DashboardActivityProps) {
  return (
    <section aria-labelledby="dashboard-activity" className={cn("rounded-xl border border-zinc-800/60 bg-zinc-900/30", className)}>
      <div className="border-b border-zinc-800/60 px-5 py-3">
        <h2 id="dashboard-activity" className="inline-flex items-center rounded-md border border-zinc-700/50 bg-zinc-800/50 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-zinc-300">
          Today&apos;s Activity
        </h2>
      </div>

      {items.length === 0 ? (
        <div className="p-5">
          <p className="text-[13px] text-zinc-500">No activity recorded today.</p>
        </div>
      ) : (
        <div className="relative px-5 py-3">
          <div className="absolute bottom-0 left-[37px] top-0 w-px bg-zinc-800" />
          <div className="space-y-0">
            {items.map((item) => {
              const Icon = TYPE_ICONS[item.type] ?? FileText;
              const iconColor = TYPE_COLORS[item.type] ?? "text-zinc-400";
              return (
                <div key={item.id} className="group relative flex gap-4 py-3">
                  <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900">
                    <Icon className={cn("h-3.5 w-3.5", iconColor)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="min-w-0 truncate text-[13px] text-zinc-200">
                        <span className="font-medium text-white">{item.actor}</span> {item.action}
                      </p>
                      <span className="shrink-0 text-[11px] text-zinc-600">{formatTime(item.timestamp)}</span>
                    </div>
                    {item.whyItMatters && (
                      <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">{item.whyItMatters}</p>
                    )}
                    {item.nextStep && item.targetUrl && (
                      <Link
                        href={item.targetUrl}
                        className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-gold hover:underline"
                      >
                        {item.nextStep}
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
});
