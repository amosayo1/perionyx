"use client";

import { cn } from "@/lib/utils";
import { CheckCircle, Clock, AlertCircle, Database } from "lucide-react";
import { contextSources } from "./data";

const statusIcons: Record<string, React.ReactNode> = {
  connected: <CheckCircle className="h-3 w-3 text-gold" />,
  syncing: <Clock className="h-3 w-3 text-amber-400" />,
  unavailable: <AlertCircle className="h-3 w-3 text-red-400" />,
};

const availabilityColors: Record<string, string> = {
  live: "bg-gold/10 text-gold border-gold/20",
  cached: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  scheduled: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

export function ContextPanel() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Database className="h-4 w-4 text-zinc-500" />
        <span className="text-xs font-semibold text-zinc-300">Live Intelligence Sources</span>
      </div>
      <p className="text-[10px] text-zinc-600 leading-relaxed">
        All platform modules are indexed and available for AI querying in real-time.
      </p>
      <div className="space-y-1">
        {contextSources.map((s) => (
          <div
            key={s.id}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/[0.02]"
          >
            {statusIcons[s.status]}
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium text-zinc-400 truncate">{s.name}</p>
              <p className="text-[9px] text-zinc-700">{s.lastUpdated}</p>
            </div>
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-1 py-0.5 text-[8px] font-semibold uppercase",
                availabilityColors[s.availability],
              )}
            >
              {s.availability}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
