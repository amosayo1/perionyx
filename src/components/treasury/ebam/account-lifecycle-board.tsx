"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Clock, Users, FileText, Search, CheckCircle2, Activity,
  Moon, AlertTriangle, LogOut, XCircle, ArrowRight,
} from "lucide-react";
import { MOCK_ACCOUNTS } from "./data";
import type { LifecycleStage } from "./types";

const STAGE_CONFIG: Record<LifecycleStage, { label: string; color: string; icon: React.ElementType; nextAction: string }> = {
  requested: {
    label: "Requested",
    color: "bg-violet-500/15 text-violet-400 border-violet-500/25",
    icon: Clock,
    nextAction: "Assign RM & initiate opening",
  },
  opening: {
    label: "Opening",
    color: "bg-blue-500/15 text-blue-400 border-blue-500/25",
    icon: Users,
    nextAction: "Complete application forms",
  },
  pending_documentation: {
    label: "Pending Documentation",
    color: "bg-amber-500/15 text-amber-400 border-amber-500/25",
    icon: FileText,
    nextAction: "Submit required documents",
  },
  kyc_review: {
    label: "KYC Review",
    color: "bg-cyan-500/15 text-cyan-400 border-cyan-500/25",
    icon: Search,
    nextAction: "Complete due diligence",
  },
  approval: {
    label: "Approval",
    color: "bg-indigo-500/15 text-indigo-400 border-indigo-500/25",
    icon: CheckCircle2,
    nextAction: "Final sign-off required",
  },
  active: {
    label: "Active",
    color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    icon: Activity,
    nextAction: "Monitor & maintain",
  },
  dormant: {
    label: "Dormant",
    color: "bg-zinc-500/15 text-zinc-400 border-zinc-500/25",
    icon: Moon,
    nextAction: "Review for closure",
  },
  restricted: {
    label: "Restricted",
    color: "bg-red-500/15 text-red-400 border-red-500/25",
    icon: AlertTriangle,
    nextAction: "Resolve restrictions",
  },
  closing: {
    label: "Closing",
    color: "bg-amber-500/15 text-amber-400 border-amber-500/25",
    icon: LogOut,
    nextAction: "Complete closure checklist",
  },
  closed: {
    label: "Closed",
    color: "bg-zinc-500/15 text-zinc-400 border-zinc-500/25",
    icon: XCircle,
    nextAction: "Archive records",
  },
};

const STAGES: LifecycleStage[] = [
  "requested", "opening", "pending_documentation", "kyc_review", "approval",
  "active", "dormant", "restricted", "closing", "closed",
];

export function AccountLifecycleBoard() {
  const stageData = useMemo(() => {
    const map = new Map<LifecycleStage, { count: number; lastUpdated: string }>();
    for (const s of STAGES) {
      const accounts = MOCK_ACCOUNTS.filter((a) => a.lifecycle === s);
      const latest = accounts.reduce<string>((latest, a) => (a.lastActivity > latest ? a.lastActivity : latest), "");
      map.set(s, { count: accounts.length, lastUpdated: latest || "—" });
    }
    return map;
  }, []);

  const total = MOCK_ACCOUNTS.length;
  const maxCount = Math.max(...STAGES.map((s) => stageData.get(s)!.count), 1);

  return (
    <div className="space-y-5" role="region" aria-label="Account Lifecycle Board">
      <div className="flex items-end gap-1 rounded-xl border border-white/[0.06] bg-zinc-900/40 p-4" role="img" aria-label="Lifecycle distribution bar chart">
        {STAGES.map((stage) => {
          const { count } = stageData.get(stage)!;
          const cfg = STAGE_CONFIG[stage];
          const pct = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={stage} className="flex flex-1 flex-col items-center gap-1" title={`${cfg.label}: ${count} (${pct.toFixed(1)}%)`}>
              <span className="text-[10px] font-medium tabular-nums text-zinc-400">{count}</span>
              <div className="flex w-full" style={{ height: `${Math.max(4, (count / maxCount) * 60)}px` }}>
                <div
                  className={cn("w-full rounded-t-sm transition-all", cfg.color.replace("text-", "bg-").replace(/\s+\S+-400\S*/g, "").replace("border-", ""))}
                  style={{ opacity: 0.7 + (count / maxCount) * 0.3 }}
                />
              </div>
              <span className="text-[9px] uppercase tracking-[0.06em] text-zinc-600">{cfg.label.slice(0, 4)}</span>
            </div>
          );
        })}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2" role="list" aria-label="Lifecycle stage columns">
        {STAGES.map((stage) => {
          const { count, lastUpdated } = stageData.get(stage)!;
          const cfg = STAGE_CONFIG[stage];
          const Icon = cfg.icon;
          const accounts = MOCK_ACCOUNTS.filter((a) => a.lifecycle === stage);

          return (
            <div
              key={stage}
              className="min-w-[220px] flex-1 rounded-xl border border-white/[0.06] bg-zinc-900/40"
              role="listitem"
              aria-label={`${cfg.label} stage`}
            >
              <div className={cn("flex items-center gap-2 border-b border-white/[0.06] px-4 py-3", cfg.color.replace("border-", "").replace(/text-\S+/, "text-white").replace(/bg-\S+\/\d+/, ""))}>
                <Icon className="h-4 w-4 shrink-0" />
                <span className="text-[13px] font-semibold text-white">{cfg.label}</span>
                <span className={cn("ml-auto rounded-md px-2 py-0.5 text-[11px] font-medium tabular-nums", cfg.color)}>
                  {count}
                </span>
              </div>

              <div className="p-4 space-y-3">
                {accounts.length > 0 && (
                  <div className="space-y-2">
                    {accounts.slice(0, 3).map((acc) => (
                      <div
                        key={acc.id}
                        className="rounded-lg border border-white/[0.04] bg-zinc-900/60 p-2.5 transition-colors hover:bg-zinc-800/60"
                      >
                        <p className="text-[12px] font-medium text-white">{acc.accountName}</p>
                        <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-500">
                          <span className="font-mono">{acc.maskedNumber}</span>
                          <span>{acc.currency}</span>
                        </div>
                        <div className="mt-1 text-[10px] text-zinc-600">{acc.legalEntity}</div>
                      </div>
                    ))}
                    {accounts.length > 3 && (
                      <p className="text-center text-[11px] text-zinc-600">
                        +{accounts.length - 3} more
                      </p>
                    )}
                  </div>
                )}

                {accounts.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-6 text-zinc-600">
                    <ArrowRight className="mb-1 h-5 w-5" />
                    <span className="text-[11px]">No accounts</span>
                  </div>
                )}

                <div className="border-t border-white/[0.04] pt-2.5 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-zinc-500">
                    <span>Last updated</span>
                    <span className="font-mono">{lastUpdated}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500">
                    <span>Next action</span>
                    <span className="text-zinc-400">{cfg.nextAction}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
