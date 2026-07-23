"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { RiskEvent } from "./risk-types";

const STATUS_COLORS: Record<string, string> = {
  open: "text-red-400 bg-red-500/10 border-red-500/20",
  investigating: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  resolved: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  closed: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20",
};

interface IncidentBoardProps {
  incidents: RiskEvent[];
  max?: number;
}

export const IncidentBoard = memo(function IncidentBoard({ incidents, max = 10 }: IncidentBoardProps) {
  const sorted = [...incidents].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, max);

  return (
    <div className="space-y-2">
      {sorted.map((inc) => (
        <div key={inc.id} className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className={cn("rounded border px-1.5 py-0.5 text-xs font-medium", STATUS_COLORS[inc.status])}>{inc.status}</span>
                <span className="text-sm font-medium text-white">{inc.title}</span>
              </div>
              <p className="mt-1 text-xs text-zinc-400 line-clamp-2">{inc.description}</p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
                <span>Date: {inc.date.toLocaleDateString()}</span>
                <span>Impact: {inc.impact}</span>
                <span>Response: {inc.response}</span>
              </div>
              {inc.lessons && (
                <p className="mt-1 text-xs text-zinc-600 italic">Lesson: {inc.lessons}</p>
              )}
            </div>
          </div>
        </div>
      ))}
      {sorted.length === 0 && (
        <p className="py-8 text-center text-sm text-zinc-500">No incidents recorded</p>
      )}
    </div>
  );
});
