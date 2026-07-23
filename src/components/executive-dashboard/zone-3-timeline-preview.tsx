"use client";

import { memo } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, AlertTriangle, Shield, Wallet, GitBranch, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardCard } from "./dashboard-card";
import type { TimelineEvent } from "./types";

interface Zone3Props {
  events: TimelineEvent[];
  className?: string;
}

const eventIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  approval: CheckCircle2,
  payment: Wallet,
  risk: AlertTriangle,
  policy: Shield,
  treasury: Wallet,
  automation: GitBranch,
  ai: Cpu,
  compliance: Shield,
};

const eventColors: Record<string, string> = {
  approval: "text-emerald-400 bg-emerald-500/10",
  payment: "text-blue-400 bg-blue-500/10",
  risk: "text-red-400 bg-red-500/10",
  policy: "text-purple-400 bg-purple-500/10",
  treasury: "text-[#c9a84c] bg-gold-500/10",
  automation: "text-cyan-400 bg-cyan-500/10",
  ai: "text-violet-400 bg-violet-500/10",
  compliance: "text-amber-400 bg-amber-500/10",
};

function TimelineItem({ event }: { event: TimelineEvent }) {
  const Icon = eventIcons[event.type] ?? Clock;
  return (
    <div className="group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-zinc-800/30">
      <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-md", eventColors[event.type] ?? "text-zinc-500 bg-zinc-800")}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-medium text-zinc-200">{event.title}</p>
          {event.status && (
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider",
                event.status === "completed" && "bg-emerald-500/10 text-emerald-400",
                event.status === "pending" && "bg-amber-500/10 text-amber-400",
                event.status === "failed" && "bg-red-500/10 text-red-400",
                event.status === "warning" && "bg-amber-500/10 text-amber-400",
              )}
            >
              {event.status}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-[11px] text-zinc-500 line-clamp-1">{event.description}</p>
        <p className="mt-0.5 text-[10px] text-zinc-600">{event.timestamp}</p>
      </div>
    </div>
  );
}

export const Zone3TimelinePreview = memo(function Zone3TimelinePreview({ events, className }: Zone3Props) {
  return (
    <DashboardCard
      title="Executive Timeline"
      description="Latest enterprise events"
      size="third"
      className={className}
    >
      <div className="divide-y divide-zinc-800/40">
        {events.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-zinc-600">No recent events</p>
        ) : (
          events.slice(0, 6).map((event) => (
            <TimelineItem key={event.id} event={event} />
          ))
        )}
      </div>
      <Link
        href="/insights"
        className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-zinc-800/40 py-2 text-[12px] font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
      >
        Open Executive Timeline
        <ArrowRight className="h-3 w-3" />
      </Link>
    </DashboardCard>
  );
});
