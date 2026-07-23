"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Clock, ArrowUpDown, Handshake, ArrowRightLeft, CheckCheck, AlertTriangle, RefreshCw, ShieldCheck } from "lucide-react";
import { MOCK_ACTIVITY_ITEMS } from "./data";

const TYPE_ICONS: Record<string, React.ElementType> = {
  payment: ArrowUpDown, collection: Handshake, transfer: ArrowRightLeft,
  approval: CheckCheck, alert: AlertTriangle, update: RefreshCw, compliance: ShieldCheck,
};

const TYPE_COLORS: Record<string, string> = {
  payment: "text-blue-400 bg-blue-500/10",
  collection: "text-emerald-400 bg-emerald-500/10",
  transfer: "text-violet-400 bg-violet-500/10",
  approval: "text-cyan-400 bg-cyan-500/10",
  alert: "text-red-400 bg-red-500/10",
  update: "text-zinc-400 bg-zinc-500/10",
  compliance: "text-amber-400 bg-amber-500/10",
};

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function ActivityTimeline({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)} role="region" aria-label="Activity timeline">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-zinc-400" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-white">Activity Timeline</h2>
      </div>
      <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-5">
        <div className="space-y-0">
          {MOCK_ACTIVITY_ITEMS.map((item, i) => {
            const Icon = TYPE_ICONS[item.type] || RefreshCw;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="flex items-start gap-3 py-3 border-b border-white/[0.04] last:border-b-0"
                role="article" aria-label={item.action}
              >
                <div className={cn("flex h-7 w-7 items-center justify-center rounded-full shrink-0", TYPE_COLORS[item.type])}>
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-white truncate">{item.action}</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    {item.entity} &middot; {item.module}
                  </p>
                </div>
                <span className="text-[10px] text-zinc-600 whitespace-nowrap shrink-0">{timeAgo(item.timestamp)}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
