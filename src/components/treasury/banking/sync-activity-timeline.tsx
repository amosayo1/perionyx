"use client";

import { cn } from "@/lib/utils";
import { RefreshCw, CheckCircle, XCircle, Activity, Key, AlertTriangle, Clock } from "lucide-react";
import type { SyncActivity } from "@/server/banking/workspace";

const typeConfig = {
  SYNC: { icon: RefreshCw, color: "text-blue-400", bg: "bg-blue-500/10" },
  RECONCILE: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  AUTH: { icon: Key, color: "text-amber-400", bg: "bg-amber-500/10" },
  ERROR: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10" },
  HEALTH_CHECK: { icon: Activity, color: "text-cyan-400", bg: "bg-cyan-500/10" },
};

const statusColor = {
  SUCCESS: "text-emerald-400",
  FAILED: "text-red-400",
  IN_PROGRESS: "text-blue-400",
  WARNING: "text-amber-400",
};

interface SyncActivityTimelineProps {
  activities: SyncActivity[];
  className?: string;
}

export function SyncActivityTimeline({ activities, className }: SyncActivityTimelineProps) {
  return (
    <div className={cn("space-y-1", className)}>
      {activities.map((a) => {
        const tc = typeConfig[a.type];
        const Icon = tc.icon;

        return (
          <div key={a.id} className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-zinc-900/20">
            <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", tc.bg)}>
              <Icon className={cn("h-4 w-4", tc.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-medium text-white truncate">{a.institution}</p>
                <span className={cn("text-[11px] font-medium shrink-0", statusColor[a.status])}>{a.status.replace("_", " ")}</span>
              </div>
              <p className="text-[12px] text-zinc-400 truncate">{a.message}</p>
              <div className="mt-0.5 flex items-center gap-2 text-[10px] text-zinc-500">
                <Clock className="h-3 w-3" />
                <span>{new Date(a.timestamp).toLocaleString()}</span>
                {a.duration && (
                  <>
                    <span>·</span>
                    <span>{a.duration}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}