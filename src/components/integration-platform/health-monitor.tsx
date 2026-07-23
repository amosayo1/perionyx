"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Activity, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { HealthSummary } from "./types";

interface HealthMonitorProps {
  summary: HealthSummary;
  onRefresh: () => void;
  onSelectInstance: (instanceId: string) => void;
}

export function HealthMonitor({ summary, onRefresh, onSelectInstance }: HealthMonitorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-400">Instance Health</h3>
        <button onClick={onRefresh} className="text-xs text-amber-400 hover:text-amber-300">Refresh</button>
      </div>
      {(summary as any).byCategory ? (
        Object.entries((summary as any).byCategory).map(([category, states]: [string, any]) => (
          <div key={category} className="space-y-2">
            <h4 className="text-xs font-medium uppercase tracking-wider text-zinc-500">{category}</h4>
            {Object.entries(states).map(([instanceId, status]: [string, any]) => (
              <motion.button
                key={instanceId} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                onClick={() => onSelectInstance(instanceId)}
                className="flex w-full items-center justify-between rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3 text-left hover:bg-zinc-900 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {status === "healthy" ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : status === "degraded" ? <AlertTriangle className="h-4 w-4 text-amber-400" /> : <XCircle className="h-4 w-4 text-red-400" />}
                  <span className="text-sm text-zinc-300">{instanceId.slice(0, 20)}</span>
                </div>
                <span className={cn("rounded-full px-2 py-0.5 text-[10px]", status === "healthy" ? "bg-emerald-400/10 text-emerald-400" : status === "degraded" ? "bg-amber-400/10 text-amber-400" : "bg-red-400/10 text-red-400")}>{status}</span>
              </motion.button>
            ))}
          </div>
        ))
      ) : (
        <p className="text-sm text-zinc-500">No health data by category</p>
      )}
    </div>
  );
}
