"use client";

import { cn } from "@/lib/utils";
import { memo } from "react";
import { Clock, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { getMockConnectionHistory } from "./data";
import type { ConnectionHistoryEntry } from "./types";

interface ConnectionHistoryProps {
  entries?: ConnectionHistoryEntry[];
  className?: string;
}

const STATUS_CONFIG = {
  success: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/5" },
  warning: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/5" },
  error: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/5" },
} as const;

export const ConnectionHistory = memo(function ConnectionHistory({
  entries,
  className,
}: ConnectionHistoryProps) {
  const items = entries ?? getMockConnectionHistory();

  return (
    <div className={cn("space-y-3", className)} role="group" aria-label="Connection history">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-gold" aria-hidden="true" />
        <h3 className="text-sm font-medium text-white/[0.87]">Connection History</h3>
      </div>

      <div className="relative">
        <div className="absolute left-4 top-2 bottom-2 w-px bg-white/[0.06]" aria-hidden="true" />

        <div className="space-y-3">
          {items.map((entry) => {
            const config = STATUS_CONFIG[entry.status];
            const Icon = config.icon;

            return (
              <div key={entry.id} className="relative flex gap-3 pl-10">
                <div className={cn(
                  "absolute left-2.5 flex h-3 w-3 items-center justify-center rounded-full",
                  config.bg,
                )}>
                  <Icon className={cn("h-3 w-3", config.color)} aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white/[0.87]">{entry.action}</span>
                    <span className="text-xs text-white/[0.4]">{entry.timestamp}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-white/[0.5]">{entry.details}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
