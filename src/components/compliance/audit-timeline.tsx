"use client";

import { memo } from "react";
import { Calendar, Clock, CheckCircle, AlertCircle, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComplianceAudit } from "./compliance-types";

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const STATUS_CONFIG = {
  planned: { icon: Calendar, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", dot: "bg-blue-500" },
  "in-progress": { icon: Play, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", dot: "bg-amber-500" },
  completed: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", dot: "bg-emerald-500" },
  remediated: { icon: AlertCircle, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", dot: "bg-cyan-500" },
};

export const AuditTimeline = memo(function AuditTimeline({ audits }: { audits: ComplianceAudit[] }) {
  const planned = audits.filter(a => a.status === "planned").length;
  const inProgress = audits.filter(a => a.status === "in-progress").length;
  const completed = audits.filter(a => a.status === "completed" || a.status === "remediated").length;

  const sorted = [...audits].sort((a, b) => new Date(b.auditDate).getTime() - new Date(a.auditDate).getTime());

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-blue-400">{planned}</p>
          <p className="text-[11px] text-blue-400/70">Planned</p>
        </div>
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-amber-400">{inProgress}</p>
          <p className="text-[11px] text-amber-400/70">In Progress</p>
        </div>
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-center">
          <p className="text-2xl font-bold text-emerald-400">{completed}</p>
          <p className="text-[11px] text-emerald-400/70">Completed</p>
        </div>
      </div>

      <div className="relative pl-8">
        <svg className="absolute left-[11px] top-2 h-full w-0.5" style={{ minHeight: `${sorted.length * 80}px` }}>
          <line x1="1" y1="0" x2="1" y2="100%" stroke="rgb(63 63 70)" strokeWidth="2" />
        </svg>

        <div className="space-y-4">
          {sorted.map(a => {
            const config = STATUS_CONFIG[a.status] ?? STATUS_CONFIG.planned;
            const Icon = config.icon;

            return (
              <div key={a.id} className="relative">
                <div className={cn("absolute -left-[29px] top-3 flex h-4 w-4 items-center justify-center rounded-full border-2 border-zinc-800", config.bg, config.border)}>
                  <Icon className={cn("h-2.5 w-2.5", config.color)} />
                </div>

                <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4 transition-colors hover:border-zinc-700/60">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white">{a.title}</p>
                        <span className={cn("rounded-md border px-1.5 py-0.5 text-[10px] font-semibold capitalize", config.bg, config.border, config.color)}>
                          {a.status}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-zinc-500">
                        <span>{a.type.replace(/-/g, " ")} audit</span>
                        <span>·</span>
                        <span>{a.auditor}</span>
                        <span>·</span>
                        <span>{a.scope}</span>
                      </div>
                      {a.findings && (
                        <p className="mt-2 text-xs text-zinc-400">Findings: {a.findings}</p>
                      )}
                      {a.rating && (
                        <p className="mt-1 text-xs text-zinc-500">Rating: {a.rating}</p>
                      )}
                    </div>
                    <div className="shrink-0 text-right text-[11px] text-zinc-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(a.auditDate)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
